# 09 — End-to-End Update Workflow

> **Author**: Workflow Designer Agent (Task #3)
> **Date**: 2026-02-18
> **Status**: Final
> **Sources**: 08-generation-pipeline, 09-change-detection, 09-ai-curation

---

## 1. Executive Summary

This document defines the complete end-to-end workflow for keeping Picnic component skills in sync with source code. It integrates three prior proposals into a single operational pipeline:

- **Change detection** (09-change-detection): State file + git diff determines *what* changed
- **Generation pipeline** (08-generation-pipeline): Extract → Database → Format → Merge produces *structural* updates
- **AI curation** (09-ai-curation): AI recommends *experiential* content (gotchas, decision guides, examples)

**Key design decisions**:
1. **Git commits between every step** — each pipeline stage produces a discrete commit, enabling `git revert` per-stage
2. **Single orchestrating skill** (`/picnic-update`) — one command drives the entire workflow
3. **Scoped regeneration** — only changed components and their owning skills are touched
4. **AI curation as an opt-in stage** — can be skipped for structural-only updates
5. **Human review gate** before any commit to curated content

---

## 2. Complete Workflow Diagram

```
                            /picnic-update
                                  │
                    ┌─────────────▼──────────────┐
                    │  STEP 0: PREFLIGHT          │
                    │  Read .picnic-gen-state.json │
                    │  Verify frontend-code repo   │
                    │  git fetch origin main        │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  STEP 1: DETECT CHANGES     │
                    │  git diff <sha>..HEAD        │
                    │  Map files → skills (§4)     │
                    │  Show change summary          │
                    │                               │
                    │  COMMIT: changelog            │
                    └─────────────┬──────────────┘
                                  │
                          user confirms
                                  │
                    ┌─────────────▼──────────────┐
                    │  STEP 2: EXTRACT            │
                    │  AST parse changed components│
                    │  Update picnic-database.json │
                    │  Diff against stored database │
                    │                               │
                    │  COMMIT: updated database     │
                    └─────────────┬──────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │  STEP 3: FORMAT + MERGE     │
                    │  Generate compact notation   │
                    │  Update GENERATED sections   │
                    │  Preserve CURATED sections    │
                    │                               │
                    │  COMMIT: regenerated content  │
                    └─────────────┬──────────────┘
                                  │
                         user chooses:
                    ┌────────┴────────┐
                    │                 │
              skip AI           run AI
                    │                 │
                    │   ┌─────────────▼──────────────┐
                    │   │  STEP 4: AI CURATION        │
                    │   │  Assemble context            │
                    │   │  Generate recommendations    │
                    │   │  Score confidence             │
                    │   │                               │
                    │   │  COMMIT: AI recommendations   │
                    │   └─────────────┬──────────────┘
                    │                 │
                    └────────┬────────┘
                             │
                    ┌────────▼───────────────────┐
                    │  STEP 5: HUMAN REVIEW       │
                    │  Show full diff              │
                    │  Flag LOW-confidence items   │
                    │  Accept / edit / reject       │
                    │                               │
                    │  COMMIT: reviewed changes     │
                    └────────┬───────────────────┘
                             │
                    ┌────────▼───────────────────┐
                    │  STEP 6: FINALIZE           │
                    │  Update .picnic-gen-state    │
                    │  Print summary               │
                    │                               │
                    │  COMMIT: update state file    │
                    └───────────────────────────┘
```

---

## 3. Step-by-Step Workflow with Commits

### Step 0: Preflight

**Purpose**: Validate that the environment is ready for an update.

**Actions**:
1. Read `.picnic-gen-state.json` — get `lastGeneration.sourceCommit`
2. Verify `~/Projects/frontend-code` exists and is a git repo
3. Run `git -C ~/Projects/frontend-code fetch origin main` (non-blocking; warn if offline)
4. Compare stored commit SHA against current `origin/main`

**Exit conditions**:
- State file missing → offer full extraction (`/picnic-update --full`)
- Frontend-code repo missing → error with setup instructions
- Stored commit not found (rebased away) → fall back to content hash comparison; warn user
- No changes since last generation → print "Skills are up to date" and exit

**No commit** — preflight is read-only.

---

### Step 1: Detect Changes

**Purpose**: Identify what changed in Picnic source and which skills are affected.

**Actions**:
1. `git diff --name-only <stored-sha>..origin/main -- libs/picnic/src/`
2. Parse changed files through the mapping algorithm (from 09-change-detection §4.2):
   - Component files → owning skill (problem skill or reference file)
   - Theme files → `foundation/design-tokens`
   - Utils files → `foundation/stitches-patterns`
   - Icon directories → `references/media-ref`
   - Barrel export (`index.ts`) → router `SKILL.md`
3. Detect new components (in barrel export but not in state file `componentHashes`)
4. Detect removed components (in state file but not in barrel export)
5. Display change summary to user:

```
=== Picnic Changes Since Last Generation ===
Source: b4f07b0 → a1c3e5f (23 commits)

CHANGED COMPONENTS (3):
  ~ Badge: src/components/Badge/Badge.tsx (+12 -3)
  ~ Select: src/components/Select/ (4 files changed)
  ~ Table: src/components/Table/ (2 files changed)

NEW COMPONENTS (1):
  + ButtonGroupNext: src/components/ButtonGroupNext/

INFRASTRUCTURE:
  ~ src/themes/theme-2021.ts (token changes)

AFFECTED SKILLS (5):
  - references/data-display-ref.md      (Badge)
  - problem/form-builder/SKILL.md       (Select)
  - problem/data-table/SKILL.md         (Table)
  - references/actions-ref.md           (ButtonGroupNext — NEW)
  - foundation/design-tokens/SKILL.md   (theme change)
  + validator/SKILL.md                  (cross-cutting)

Proceed with extraction? [Y/n]
```

**Commit**:
```
chore(picnic-skills): detect changes since b4f07b0

Source: b4f07b0..a1c3e5f (23 commits in libs/picnic/)

Changed: Badge, Select, Table
New: ButtonGroupNext
Infrastructure: theme-2021.ts
Affected skills: 5 files
```

**What's committed**: Only the changelog (a `.picnic-changelog.md` file in the skills directory). No skill content changes yet. This establishes the intent and scope of the update.

---

### Step 2: Extract Updated Component Data

**Purpose**: Run AST extraction only for affected components and update the intermediate database.

**Actions**:
1. Run `@babel/parser` extraction scripts **scoped to changed components only**:
   - `extractors/variants.ts` — Stitches variants + defaults
   - `extractors/interfaces.ts` — TypeScript interface props
   - `extractors/compound.ts` — Sub-component detection
   - `extractors/tokens.ts` — (only if theme files changed)
   - `extractors/icons.ts` — (only if icon directories changed)
2. Apply filter pipeline (never-document, boolean-collapse, internal-only)
3. Diff new partial extraction against stored `picnic-database.json`:
   - Detect actual API changes (new variant, removed prop, added sub-component)
   - Skip components where internal changes didn't affect extractable API
4. Update `picnic-database.json` with new entries for changed components
5. For new components: add new entries; prompt for classification if ambiguous

**Commit**:
```
chore(picnic-skills): extract updated component data

Updated: Badge (added variant "magic"), Select (new prop searchable),
  Table (new sub-component FocusWrapper)
New: ButtonGroupNext (3 sub-components, pattern: compound)
Tokens: 2 added, 1 changed
```

**What's committed**: Updated `picnic-database.json` and the extraction diff log.

---

### Step 3: Regenerate Affected Skill Sections

**Purpose**: Transform extracted data into compact skill notation and merge into skill files.

**Actions**:
1. For each affected skill file, run the formatter:
   - `compact-props.ts` — JSON → `props: variant(a*|b|c) size(x|y*)`
   - `component-entry.ts` — Full component entry block
   - `token-table.ts` — Compact token table (if design-tokens changed)
   - `sub-component-list.ts` — `Sub: .A .B .C` notation
   - `icon-list.ts` — Categorized icon lists (if media-ref changed)
2. Apply merge algorithm per file type:
   - **Reference files** (4): Fully regenerated (pure lookup tables)
   - **Problem skills** (5): Section-level merge — replace `<!-- BEGIN GENERATED -->` blocks, preserve curated blocks
   - **Foundation skills** (3): Minimal — only update extractable sections
   - **Router**: Update component list if new/removed components
   - **Validator**: Flag for manual review only (fully curated)
3. For new components:
   - Generate reference entry in appropriate reference file
   - If assigned to a problem skill, add generated API block with empty curated sections
   - Add to router's routing table (flagged for human confirmation)
4. For removed components:
   - Do NOT auto-delete — mark with `<!-- REMOVED: ComponentName (was in source at commit X) -->`
   - Flag for human removal in Step 5

**Commit**:
```
chore(picnic-skills): regenerate extracted content

Updated skills:
  - references/data-display-ref.md: Badge variant list updated
  - problem/form-builder/SKILL.md: Select props regenerated
  - problem/data-table/SKILL.md: Table FocusWrapper sub added
  - references/actions-ref.md: ButtonGroupNext entry added
  - foundation/design-tokens/references/token-tables.md: 3 token changes
Curated sections preserved (untouched).
```

**What's committed**: Updated skill files with regenerated structural content. All curated sections intact.

---

### Step 4: AI Curation (Optional)

**Purpose**: AI reviews changed components and recommends updates to curated content (decision guides, gotchas, anti-patterns, examples, checklists).

**Triggered by**: User choosing "Run AI curation" after Step 3. Can also be invoked later via `/picnic-curate`.

**Actions**:
1. **Assemble context** for each affected component:
   - Extracted JSON from `picnic-database.json`
   - Full source code of changed component files
   - Source comments (NOTE/FIXME/XXX/TODO/HACK)
   - Test file assertions (role checks, behavioral expectations)
   - Storybook story patterns (compositions, interactive examples)
   - Guidance.mdx content (purpose statements, do/don't sections)
   - Existing curated content from current skill file
2. **Run prompt templates** from 09-ai-curation §4:
   - Decision Guide Generator (§4.1) — for skills with multiple related components
   - Gotcha Detector (§4.2) — for every changed component
   - Anti-Pattern Generator (§4.4) — for components with type exclusions or deprecations
   - Canonical Example Generator (§4.3) — for skills where component API changed significantly
   - Common Mistakes Checklist Generator (§4.5) — for components with context deps or composition rules
3. **Score confidence** per recommendation (HIGH/MEDIUM/LOW per 09-ai-curation §5)
4. **Write curated-content.json** — structured AI recommendations with evidence and scores
5. **Apply recommendations to skill files**:
   - HIGH confidence → insert into skill, marked with `<!-- AI:HIGH -->`
   - MEDIUM confidence → insert into skill, marked with `<!-- AI:MEDIUM -->`
   - LOW confidence → written to separate `ai-suggestions.md` for review, NOT inserted into skill

**Commit**:
```
feat(picnic-skills): AI-recommended curation updates

AI analyzed 4 changed components with context from source, tests,
stories, and guidance.mdx.

Recommendations by confidence:
  HIGH (auto-included): 12 items
  MEDIUM (review recommended): 7 items
  LOW (suggestions only): 3 items

New gotchas: 2 (Table FocusWrapper keyboard trap, Select portal z-index)
Updated decision guide: form-builder (SearchableSelect vs Select)
Updated example: data-table (added FocusWrapper usage)
```

**What's committed**: Updated skill files with AI annotations, `curated-content.json`, and `ai-suggestions.md` for LOW-confidence items.

---

### Step 5: Human Review

**Purpose**: Developer reviews all changes, approves/edits/rejects, and strips AI annotations.

**Actions**:
1. **Show full diff** of all skill changes since Step 1:
   ```
   git diff HEAD~3..HEAD -- picnic-components/
   ```
   (Covers Steps 2-4, or 2-3 if AI curation was skipped)
2. **Flag items requiring attention**:
   - `<!-- AI:MEDIUM -->` — AI-generated, recommended for review
   - `<!-- REMOVED: ... -->` — components removed from source
   - New components added to router — confirm routing placement
   - `ai-suggestions.md` — LOW-confidence AI recommendations
3. **Developer actions**:
   - Edit any generated or AI content
   - Add curated notes for new components (in `component-notes.yaml`)
   - Accept or reject AI gotchas/anti-patterns
   - Confirm new component placement in routing table
   - Remove components marked `<!-- REMOVED -->` if confirmed
4. **Strip all annotations** (`<!-- AI:HIGH -->`, `<!-- AI:MEDIUM -->`, `<!-- REMOVED: ... -->`)
5. **Clean up** `ai-suggestions.md` (delete if empty, or keep approved items)

**Commit**:
```
chore(picnic-skills): human review of generated updates

Reviewed: 5 skill files, 12 AI recommendations
Accepted: 11 AI items (stripped annotations)
Rejected: 1 AI gotcha (false positive: Select portal z-index)
Added: curated notes for ButtonGroupNext
Confirmed: ButtonGroupNext routed to references/actions-ref
```

**What's committed**: Final, clean skill files with all annotations stripped and human edits applied.

---

### Step 6: Finalize

**Purpose**: Update state tracking and summarize the update.

**Actions**:
1. Update `.picnic-gen-state.json`:
   - `lastGeneration.timestamp` → current time
   - `lastGeneration.sourceCommit` → current `origin/main` SHA
   - `componentHashes` → recalculated for all affected components
   - `themeHash`, `mediaHash`, `utilsHash` → recalculated if affected
   - Add new component hashes; mark removed components as `"REMOVED"`
2. Delete temporary files (`.picnic-changelog.md`, `ai-suggestions.md` if empty)
3. Print summary:

```
=== Picnic Skill Update Complete ===

Source: b4f07b0 → a1c3e5f
Skills updated: 5 files
New components: ButtonGroupNext
Removed: none
AI recommendations: 11 accepted, 1 rejected
Commits: 6 (revertible per-step)

State file updated. Next /picnic-update will compare from a1c3e5f.
```

**Commit**:
```
chore(picnic-skills): update generation state (a1c3e5f)

Source tracked: b4f07b0 → a1c3e5f
Components: 57 → 58 (added ButtonGroupNext)
All hashes updated for changed components.
```

**What's committed**: Updated `.picnic-gen-state.json`.

---

## 4. Implementation as a Claude Code Skill

### 4.1 Recommendation: Orchestrating Skill + Helper Agent

The workflow is best implemented as a **skill** (`/picnic-update`) that orchestrates the pipeline. The skill is the user-facing entry point; it drives each step, prompts for confirmation between steps, and manages commits.

**Why a skill (not an agent)**:
- The workflow is sequential with human checkpoints — not autonomous
- Each step needs user confirmation before proceeding
- The user needs to see diffs and make decisions (approve/reject/edit)
- A skill provides the prompt template that guides Claude through the steps

**Why not a pure bash script**:
- Steps 4 (AI curation) and 5 (human review) require AI interaction
- The diff presentation and decision UI benefits from Claude's formatting
- Error handling and edge cases are easier in a conversational flow

### 4.2 Skill Definition

```yaml
---
name: picnic-update
description: >
  Update Picnic component skills from source code changes. Detects changes,
  extracts updated data, regenerates skill sections, and optionally runs AI
  curation for experiential content.
  Triggers: "update picnic skills", "picnic update", "regenerate skills",
  "sync picnic", "picnic changed"
---
```

### 4.3 Skill Prompt Structure

The skill prompt instructs Claude to:

1. Run preflight checks (read state file, verify repo, fetch)
2. Execute change detection (git diff, map to skills)
3. Present change summary and ask for confirmation
4. Run extraction (bash scripts for AST parsing)
5. Commit extraction results
6. Run formatting + merge (scripts for compact notation)
7. Commit regenerated content
8. Ask: "Run AI curation for changed components? [Y/n/specific-components]"
9. If yes: assemble context, run prompts, score confidence, commit
10. Present full diff for human review
11. After human edits: commit reviewed changes
12. Update state file and commit

### 4.4 Supporting Commands

| Command | Purpose | When to Use |
|---------|---------|-------------|
| `/picnic-update` | Full pipeline (detect → extract → format → merge → AI → review) | Primary workflow |
| `/picnic-update --full` | Full extraction (all 57 components, ignore state file) | First generation or state file corrupted |
| `/picnic-update --no-ai` | Skip AI curation step | Quick structural updates only |
| `/picnic-update --detect-only` | Run Steps 0-1 only (report changes, no extraction) | Quick check without modifying anything |
| `/picnic-curate` | Run AI curation on specific components without full pipeline | When human wants AI help with curated sections for existing skills |
| `/picnic-rollback` | Revert last pipeline run | When a generation went wrong |

### 4.5 Tool Requirements

| Tool | Used By | Purpose |
|------|---------|---------|
| **Bash** | Steps 0-3, 6 | Git operations, running extraction/formatting scripts |
| **Read** | Steps 1, 4, 5 | Reading state file, source code, existing skill content |
| **Write** | Steps 2-6 | Writing database, skill files, state file |
| **Edit** | Step 5 | Human edits to skill files during review |
| **AskUserQuestion** | Steps 1, 3, 4, 5 | Confirmation prompts, component placement decisions |

---

## 5. State Management

### 5.1 State File: `.picnic-gen-state.json`

Lives at the root of the skills directory (`picnic-components/.picnic-gen-state.json`).

```json
{
  "version": 1,
  "lastGeneration": {
    "timestamp": "2026-02-18T04:30:00Z",
    "sourceCommit": "a1c3e5f...",
    "sourceBranch": "main",
    "sourceRepo": "~/Projects/frontend-code",
    "pipelineVersion": "1.0",
    "stepsCompleted": ["detect", "extract", "format", "ai-curate", "review", "finalize"]
  },
  "componentHashes": {
    "Accordion": "sha256:a1b2c3...",
    "Badge": "sha256:d4e5f6...",
    "...": "..."
  },
  "themeHash": "sha256:...",
  "mediaHash": "sha256:...",
  "utilsHash": "sha256:...",
  "removedComponents": {}
}
```

**Committed alongside skill files** — tracked in git so any clone knows the generation state.

### 5.2 Intermediate JSON Database: `picnic-database.json`

Lives at `picnic-components/scripts/picnic-extract/output/picnic-database.json`.

- **Committed in Step 2** after each extraction
- Schema defined in 08-generation-pipeline §5.1
- Enables diffing between generations (compare old vs new database to find actual API changes)
- Enables partial regeneration (re-format a single skill without re-extracting)

### 5.3 Curated Content Database: `curated-content.json`

Lives at `picnic-components/scripts/picnic-curate/output/curated-content.json`.

- **Committed in Step 4** after AI curation
- Per-skill structure with confidence-scored recommendations
- Schema defined in 09-ai-curation §7.2
- Acts as the "source of truth" for AI-generated experiential content between runs

### 5.4 Curation Files (Human-Authored)

Live at `picnic-components/scripts/picnic-extract/curation/`:

- `component-notes.yaml` — notes: lines per component
- `deprecations.yaml` — deprecation mappings
- `primitives.yaml` — human-readable Primitive: descriptions
- `sub-component-notes.yaml` — "non-obvious" annotations

**These are never overwritten by the pipeline.** They are read during formatting (Step 3) and merged into generated output. Humans edit them during Step 5.

### 5.5 Section Markers in Skill Files

Problem skills use HTML comment markers to separate generated from curated content:

```markdown
<!-- BEGIN GENERATED: component-api -->
## Table API
props: columns(number|number[]) textVariant(body*|caption)
Sub: .Header .HeaderRow .HeaderCell ...
<!-- END GENERATED: component-api -->

## Decision Guide          <!-- curated: untouched by pipeline -->
| Need | Component |
|------|-----------|
...

<!-- BEGIN GENERATED: sub-component-props -->
## Non-Obvious Sub-Components
...
<!-- END GENERATED: sub-component-props -->

## Constraints             <!-- curated: untouched by pipeline -->
```

The merge algorithm (Step 3) replaces content between matching `BEGIN/END GENERATED` markers and leaves everything else untouched.

---

## 6. Edge Cases

### 6.1 New Component Added to Picnic

**Detection**: Component appears in `src/components/index.ts` barrel export but is absent from `.picnic-gen-state.json` componentHashes.

**Workflow**:
1. Step 1 flags it: `NEW COMPONENT: ButtonGroupNext`
2. Step 2 extracts full data (variants, props, sub-components)
3. Step 3 attempts auto-classification:
   - Pure styled, no compound → reference file (match by similarity to existing components)
   - Compound with sub-components → problem skill (match by domain)
   - Wraps Radix primitive → check which problem skill handles that pattern
4. User is prompted to confirm placement:
   ```
   ButtonGroupNext detected (compound, 3 subs, similar to ButtonGroup)
   Suggested placement: references/actions-ref.md
   Accept? [Y/n/other]
   ```
5. Step 4 (AI curation) generates initial gotchas, decision guide entry, and notes
6. Step 5 user reviews and adds any curated content

### 6.2 Component Removed from Picnic

**Detection**: Component in `componentHashes` but absent from barrel export.

**Workflow**:
1. Step 1 flags it: `REMOVED COMPONENT: OldComponent`
2. Step 3 marks in skill file: `<!-- REMOVED: OldComponent (commit abc123) -->`
3. Does NOT auto-delete — human must confirm in Step 5
4. Step 6 sets hash to `"REMOVED"` in state file
5. If human confirms removal: delete the entry from skill file, remove from router

**Safety**: Never auto-delete curated content. A "removed" component might have been renamed.

### 6.3 Component Renamed

**Detection**: One component disappears, another appears with the same pattern/structure.

**Workflow**:
1. Step 1 reports both a removal and an addition
2. Step 2 extraction shows the new component has similar API to the removed one
3. Pipeline presents: "OldName removed, NewName added — possible rename?"
4. If user confirms rename:
   - Update skill file entries (replace OldName references with NewName)
   - Update router routing table
   - Preserve curated content (gotchas, notes) by transferring to new name
   - Update component hash under new key
5. If not a rename: treat as independent removal + addition

### 6.4 Component Moved Between Categories

**Example**: A component moves from a reference file to a problem skill (or vice versa).

**Workflow**:
1. This is a human decision — the pipeline cannot detect category reassignment
2. User must manually:
   - Remove the entry from the old skill file
   - Assign the component to the new skill via curation files
   - Regenerate both affected skills
3. The pipeline preserves this by storing the mapping in curation files, not in the state file

### 6.5 Breaking API Change (Prop Renamed, Variant Removed)

**Detection**: Database diff shows a prop/variant that existed in the old database but is absent in the new one, or a new required prop appeared.

**Workflow**:
1. Step 2 extraction diff shows:
   ```
   ~ Badge: variant "basic" REMOVED (was in old database)
   ~ Badge: variant "secondary" ADDED
   ```
2. Step 3 regenerates the skill file with the new variant list
3. Step 4 AI curation checks for deprecation patterns:
   - `@deprecated` JSDoc → generates anti-pattern: `BAD: variant="basic"` → `GOOD: variant="secondary"`
   - No deprecation marker → flags as breaking change for review
4. Step 5 human reviews:
   - Updates curated notes if the migration path isn't obvious
   - Updates validator rules if enum lists changed
   - Checks canonical examples for broken prop references

### 6.6 Theme Token Changes

**Detection**: `src/themes/theme-2021.ts` or `src/themes/theme-dark.ts` changed.

**Workflow**:
1. Step 2 extracts all token scales (this is fast — single file, plain object)
2. Database diff shows: token added, changed, or removed
3. Step 3 regenerates `foundation/design-tokens/references/token-tables.md` (fully generated)
4. Step 3 also flags `foundation/design-tokens/SKILL.md` — the curated semantic groupings may need updating
5. Step 5 human reviews semantic groupings and state progressions

### 6.7 Interrupted Pipeline

**Detection**: State file `stepsCompleted` array doesn't include all steps.

**Workflow**:
1. Next `/picnic-update` detects partial completion
2. Offers to resume from last completed step:
   ```
   Previous pipeline interrupted after Step 2 (extract).
   Resume from Step 3 (format)? [Y/n/restart]
   ```
3. If resume: continue from where it left off
4. If restart: revert to the pre-pipeline commit and start fresh

### 6.8 Concurrent Edits

**Detection**: Skill files modified by human since last generation (uncommitted changes).

**Workflow**:
1. Step 0 checks `git status` for uncommitted changes in skill files
2. If changes found:
   ```
   WARNING: Uncommitted changes in skill files:
     M problem/data-table/SKILL.md (curated edits)
   Commit these first, or stash? [commit/stash/abort]
   ```
3. Forces clean working tree before pipeline starts

---

## 7. Rollback

### 7.1 Per-Step Rollback

Because each step produces a commit, rollback is granular:

| Revert Target | Command | Effect |
|---------------|---------|--------|
| Last step only | `git revert HEAD` | Undo finalization (state file) |
| AI curation | `git revert HEAD~1..HEAD~0` | Remove AI recommendations, keep structural changes |
| All generated content | `git revert HEAD~3..HEAD` | Back to pre-pipeline state |
| Everything since detection | `git revert HEAD~4..HEAD` | Remove all pipeline artifacts |

### 7.2 `/picnic-rollback` Command

A convenience command that presents the pipeline commits and lets the user choose:

```
Last pipeline run (2026-02-18 04:30):
  [1] a1c3e5f chore(picnic-skills): update generation state
  [2] b2d4f6a chore(picnic-skills): human review of generated updates
  [3] c3e5g7b feat(picnic-skills): AI-recommended curation updates
  [4] d4f6h8c chore(picnic-skills): regenerate extracted content
  [5] e5g7i9d chore(picnic-skills): extract updated component data
  [6] f6h8j0e chore(picnic-skills): detect changes since b4f07b0

Revert through which step? [1-6/cancel]
```

Reverts from the chosen step through the most recent pipeline commit.

### 7.3 State File Recovery

If the state file is corrupted or lost:
- `git log --oneline -- .picnic-gen-state.json` shows all previous states
- `git show <commit>:.picnic-gen-state.json` recovers any version
- `/picnic-update --full` regenerates everything from scratch (ignores state file)

---

## 8. Trigger Mechanisms

### 8.1 Primary: `/picnic-update` (Manual)

User invokes when they know or suspect Picnic has changed. This is the recommended workflow for all updates.

### 8.2 Secondary: SessionStart Hook (Advisory)

A lightweight bash hook that fires on Claude Code session start:

```bash
#!/usr/bin/env bash
STATE_FILE="$CLAUDE_PLUGIN_ROOT/.picnic-gen-state.json"
FRONTEND_REPO="$HOME/Projects/frontend-code"

if [ ! -f "$STATE_FILE" ] || [ ! -d "$FRONTEND_REPO/.git" ]; then
  exit 0
fi

LAST_COMMIT=$(jq -r '.lastGeneration.sourceCommit' "$STATE_FILE")
CURRENT_COMMIT=$(git -C "$FRONTEND_REPO" rev-parse main 2>/dev/null)

if [ "$LAST_COMMIT" = "$CURRENT_COMMIT" ]; then
  exit 0
fi

CHANGED=$(git -C "$FRONTEND_REPO" diff --name-only "$LAST_COMMIT".."$CURRENT_COMMIT" -- libs/picnic/src/ 2>/dev/null | wc -l | tr -d ' ')

if [ "$CHANGED" -gt 0 ]; then
  echo "Picnic source has $CHANGED changed files since last skill generation. Run /picnic-update to refresh."
fi
```

Registered in `plugin.json`:
```json
{
  "hooks": [{
    "event": "SessionStart",
    "command": "$CLAUDE_PLUGIN_ROOT/hooks/check-picnic-freshness.sh",
    "timeout": 5000
  }]
}
```

**Properties**:
- Advisory only — prints a one-liner, never modifies files
- Fast — two git commands, sub-second
- Non-blocking — exits silently on error
- No network — uses local `main` branch (stale by at most one `git fetch`)

### 8.3 Future: CI Integration

A GitHub Actions workflow on the frontend-code repo:

```yaml
on:
  pull_request:
    paths: ['libs/picnic/src/**']
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - run: echo "::warning::This PR modifies Picnic components. Run /picnic-update after merge."
```

Low priority — requires changes to the frontend-code repo.

---

## 9. Implementation Recommendation

### 9.1 Build Order

**Phase 1: Foundation** (prerequisite for all other phases)
1. Create `.picnic-gen-state.json` from current source state
2. Build extraction scripts (`scripts/picnic-extract/`) — ~300 LOC
3. Build `picnic-database.json` initial population
4. Validate extracted data against current hand-written skills

**Phase 2: Structural Pipeline** (Steps 0-3, 5-6)
1. Build formatter scripts (`scripts/picnic-format/`) — ~200 LOC
2. Build merge algorithm with section markers — ~150 LOC
3. Add section markers to existing problem skill files
4. Build `/picnic-update --no-ai` skill (structural updates only)
5. Build commit automation within the skill
6. Build `/picnic-rollback` command

**Phase 3: AI Curation** (Step 4)
1. Build context assembly scripts (`scripts/picnic-curate/`) — ~200 LOC
2. Create prompt templates (5 templates from 09-ai-curation §4)
3. Run calibration against 3 existing skills (data-table, form-builder, dialog-drawer)
4. Tune prompts until HIGH accuracy > 90%
5. Integrate AI curation as optional step in `/picnic-update`

**Phase 4: Polish**
1. Build SessionStart advisory hook
2. Build `/picnic-update --detect-only` mode
3. Build interrupted-pipeline resume logic
4. Document the workflow for future maintainers

### 9.2 Estimated Pipeline Sizes

| Component | LOC | Files |
|-----------|:---:|:-----:|
| Extraction scripts | ~300 | 12 |
| Filter pipeline | ~100 | 3 |
| Formatter scripts | ~200 | 7 |
| Merge algorithm | ~150 | 3 |
| Context assembly (AI) | ~200 | 6 |
| State management | ~100 | 2 |
| Skill prompt template | ~150 | 1 |
| Hook script | ~20 | 1 |
| **Total** | **~1,220** | **35** |

### 9.3 Directory Structure

```
picnic-components/
├── SKILL.md                          # Router (partially generated)
├── .picnic-gen-state.json            # State tracking
├── .picnic-changelog.md              # Temporary: last detection report
├── foundation/                        # Foundation skills
├── problem/                           # Problem skills
├── references/                        # Reference files (fully generated)
├── validator/                         # Validator (fully curated)
├── scripts/
│   ├── picnic-extract/               # Stage 1: Extraction
│   │   ├── index.ts
│   │   ├── extractors/               # Per-data-type extractors
│   │   ├── filters/                  # Post-extraction filters
│   │   ├── curation/                 # Human-authored curation files
│   │   └── output/
│   │       └── picnic-database.json  # Intermediate database
│   ├── picnic-format/                # Stage 3: Formatting
│   │   ├── index.ts
│   │   ├── formatters/               # Compact notation generators
│   │   └── templates/                # Skill file templates
│   ├── picnic-curate/                # Stage 2.5: AI Curation
│   │   ├── index.ts
│   │   ├── context/                  # Context assembly scripts
│   │   ├── prompts/                  # AI prompt templates
│   │   └── output/
│   │       └── curated-content.json  # AI recommendations
│   └── picnic-merge/                 # Stage 4: Merge
│       └── index.ts                  # Section-aware merge algorithm
├── hooks/
│   └── check-picnic-freshness.sh     # SessionStart advisory hook
└── commands/
    ├── picnic-update.md              # /picnic-update skill
    ├── picnic-curate.md              # /picnic-curate skill
    └── picnic-rollback.md            # /picnic-rollback skill
```

---

## 10. Summary

The update workflow transforms Picnic skill maintenance from a manual, error-prone process into a structured, step-by-step pipeline with human checkpoints:

| Step | Automation | Output | Commit |
|------|-----------|--------|--------|
| 0. Preflight | Full | Environment validated | — |
| 1. Detect | Full | Change report | Changelog |
| 2. Extract | Full | Updated database | Database |
| 3. Format + Merge | Full | Updated skill files (structural) | Regenerated content |
| 4. AI Curate | Full (opt-in) | Recommended curated content | AI recommendations |
| 5. Human Review | Manual | Final approved content | Reviewed changes |
| 6. Finalize | Full | Updated state file | State update |

**Six commits per full run** — each independently revertible. The pipeline respects the boundary between structural data (automated) and experiential knowledge (AI-assisted + human-reviewed). Nothing curated is ever overwritten without explicit human approval.

The `/picnic-update` skill is the single entry point. It drives the entire pipeline, presents decisions to the user, and manages the commit chain. The SessionStart hook provides passive awareness of drift without taking any action.
