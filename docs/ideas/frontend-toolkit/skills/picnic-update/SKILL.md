---
name: picnic-update
description: >
  Update Picnic component skills from source code changes. Detects changes in
  @attentive/picnic source, extracts updated data, regenerates skill sections,
  and optionally runs AI curation for experiential content (gotchas, decision
  guides, examples). Each step produces a git commit for granular rollback.
  Triggers: "update picnic skills", "regenerate picnic", "picnic-update",
  "sync picnic components", "picnic changed", "refresh picnic skills",
  "/picnic-update", "/picnic-rollback"
---

# /picnic-update — Picnic Skill Generation Pipeline

You are running a 6-step pipeline that keeps Picnic component skills in sync with source code. Each step produces a git commit. Follow these steps exactly.

## Configuration

```
REPO_ROOT   = $(git rev-parse --show-toplevel)
PICNIC_DIR  = $REPO_ROOT/libs/picnic
SKILLS_ROOT = <directory containing picnic-components skill>
SCRIPTS_DIR = $SKILLS_ROOT/picnic-components/scripts
STATE_FILE  = $SKILLS_ROOT/picnic-components/.picnic-gen-state.json
SOURCE_PATH = libs/picnic/src
DATABASE    = $SKILLS_ROOT/picnic-components/picnic-database.json
```

## Flags

| Flag | Effect |
|------|--------|
| `--full` | Extract ALL components, ignore state file (first run or recovery) |
| `--no-ai` | Skip Step 4 (AI curation) — structural updates only |
| `--dry-run` | Preview changes without writing files or committing |
| `--detect-only` | Run Steps 0-1 only — report changes, no extraction |

Parse these from the user's invocation. Default: all flags off (full pipeline with AI).

---

## Step 0: Preflight

**Purpose**: Validate environment before starting.

**Actions**:

1. Discover the repo root and verify Picnic source exists:
   ```bash
   REPO_ROOT="$(git rev-parse --show-toplevel)"
   PICNIC_DIR="$REPO_ROOT/libs/picnic"
   test -d "$PICNIC_DIR/src/components" || echo "Error: Picnic source not found"
   ```
   If `git rev-parse` fails, stop with: "Not inside the frontend-code repo. Run this from within your frontend-code checkout."
   If Picnic source is missing, stop with: "Picnic library not found at libs/picnic. Verify you are in the frontend-code repo."

2. Fetch latest from origin (non-blocking, warn if offline):
   ```bash
   git -C "$REPO_ROOT" fetch origin main 2>&1 || echo "Warning: could not fetch — using local state"
   ```

3. Read `STATE_FILE`. If it does not exist:
   - Tell user: "No generation state found. This appears to be a first run."
   - Ask: "Run full extraction of all components? [Y/n]"
   - If yes, set `--full` mode and continue to Step 1
   - If no, stop

4. If state file exists, extract `lastGeneration.sourceCommit` and compare to current HEAD:
   ```bash
   node scripts/detect-changes.mjs --source "$REPO_ROOT" --state .picnic-gen-state.json --json
   ```
   Parse the JSON output. If `componentChanges` is empty AND `newComponents` and `removedComponents` are empty AND `infraChanges` is empty, print: "Skills are up to date (last generated from `<sourceCommit>`)." and stop.

5. Check for uncommitted changes in skill files:
   ```bash
   git status --porcelain -- picnic-components/
   ```
   If there are uncommitted changes, warn the user:
   ```
   WARNING: Uncommitted changes in skill files:
     M problem/data-table/SKILL.md
   Commit these first, or stash? [commit/stash/abort]
   ```
   Do not proceed until the working tree is clean for the skills directory.

6. Check for interrupted pipeline (state file has `stepsCompleted` that doesn't include "finalize"):
   - If interrupted, offer: "Previous pipeline interrupted after Step N. Resume from Step N+1? [Y/n/restart]"
   - If restart, revert pipeline commits and start fresh

**Exit conditions**: Stop if source repo missing, no changes detected, or user aborts.

**No commit** — preflight is read-only.

---

## Step 1: Detect Changes

**Purpose**: Identify what changed and which skills are affected.

**Actions**:

1. Run change detection (human-readable by default, or `--json` for machine parsing):
   ```bash
   node scripts/detect-changes.mjs \
     --source "$REPO_ROOT" \
     --state .picnic-gen-state.json
   ```
   The script outputs a formatted change summary directly to stdout.
   To capture structured data for downstream steps, also run:
   ```bash
   node scripts/detect-changes.mjs \
     --source "$REPO_ROOT" \
     --state .picnic-gen-state.json \
     --json > .picnic-changelog.json
   ```

2. Display the change summary to the user (the script already formats it):
   ```
   === Picnic Changes Since Last Generation ===
   Source: <old-sha> -> <new-sha> (<N> commits)

   CHANGED COMPONENTS (N):
     ~ ComponentA: src/components/ComponentA/ (N files changed)
     ~ ComponentB: src/components/ComponentB/ (N files changed)

   NEW COMPONENTS (N):
     + NewComponent: src/components/NewComponent/

   REMOVED COMPONENTS (N):
     - OldComponent: (was in previous generation)

   INFRASTRUCTURE:
     ~ src/themes/theme-2021.ts (token changes)

   AFFECTED SKILLS (N):
     - references/data-display-ref.md    (ComponentA)
     - problem/form-builder/SKILL.md     (ComponentB)
     - foundation/design-tokens/SKILL.md (theme change)
   ```

3. Ask the user to confirm: "Proceed with extraction? [Y/n]"
   - If no, stop with: "Skipped. Run /picnic-update again when ready."

4. If `--detect-only` flag is set, stop here after showing the summary.

5. Write `.picnic-changelog.md` with the change summary.

**Commit**:
```bash
git add picnic-components/.picnic-changelog.md picnic-components/.picnic-changelog.json
git commit -m "$(cat <<'EOF'
chore(picnic-skills): detect changes since <old-sha>

Source: <old-sha>..<new-sha> (<N> commits in libs/picnic/)

Changed: <component-list>
New: <new-component-list>
Affected skills: <N> files
EOF
)"
```

**Success condition**: Changelog committed, user confirmed.
**Failure recovery**: Safe to re-run — detection is idempotent.

---

## Step 2: Extract

**Purpose**: AST-parse changed components and update the intermediate database.

**Actions**:

1. Build the component list from Step 1 output. In `--full` mode, use all components.

2. Run extraction. The `--source` flag points to `libs/picnic` inside frontend-code:
   ```bash
   node scripts/extract.mjs \
     --source "$REPO_ROOT/libs/picnic" \
     --components Badge,Select,Table \
     --output picnic-database.json
   ```
   In `--full` mode (omit `--components` to extract all):
   ```bash
   node scripts/extract.mjs \
     --source "$REPO_ROOT/libs/picnic" \
     --output picnic-database.json
   ```

3. Read the extraction output. Report to user:
   ```
   Extraction complete:
     Updated: Badge (added variant "magic"), Select (new prop searchable)
     New: ButtonGroupNext (3 sub-components, compound pattern)
     Tokens: 2 added, 1 changed
   ```

4. For new components, the script may flag ambiguous classification. If so, ask the user:
   ```
   ButtonGroupNext detected (compound, 3 subs, similar to ButtonGroup)
   Suggested placement: references/actions-ref.md
   Accept? [Y/n/other]
   ```

**Commit**:
```bash
git add picnic-components/picnic-database.json
git commit -m "$(cat <<'EOF'
chore(picnic-skills): extract updated component data

Updated: <component-changes-summary>
New: <new-components>
Tokens: <token-changes>
EOF
)"
```

**Success condition**: Database updated and committed.
**Failure recovery**: If extraction fails, check that the source repo is on the expected branch. Re-run Step 2 after fixing. The database file from the previous generation is still intact.

---

## Step 3: Format + Merge

**Purpose**: Transform extracted data into compact skill notation and merge into skill files.

**Actions**:

1. Determine affected skills from Step 1 changelog.

2. Run formatting. The `--skills` flag takes comma-separated file paths relative to output-dir:
   ```bash
   node scripts/format.mjs \
     --database picnic-database.json \
     --skills references/data-display-ref.md,problem/form-builder/SKILL.md,problem/data-table/SKILL.md \
     --output-dir picnic-components/
   ```
   In `--full` mode (omit `--skills` to regenerate all):
   ```bash
   node scripts/format.mjs \
     --database picnic-database.json \
     --output-dir picnic-components/
   ```

3. The formatter:
   - Regenerates `<!-- BEGIN GENERATED -->` ... `<!-- END GENERATED -->` sections
   - Preserves all curated content outside those markers
   - Fully regenerates reference files (pure lookup tables)
   - Updates router component list if components added/removed
   - Marks removed components with `<!-- REMOVED: ComponentName (commit <sha>) -->`

4. If `--dry-run`, pass `--dry-run` to format.mjs as well — it will preview changes without writing. Stop here.

5. Show a brief summary of what changed:
   ```
   Format complete:
     - references/data-display-ref.md: Badge variant list updated
     - problem/form-builder/SKILL.md: Select props regenerated (curated sections preserved)
     - foundation/design-tokens/references/token-tables.md: 3 token changes
   ```

**Commit**:
```bash
git add picnic-components/
git commit -m "$(cat <<'EOF'
chore(picnic-skills): regenerate extracted content

Updated skills:
  - <list of updated skill files with brief change notes>
Curated sections preserved (untouched).
EOF
)"
```

**Success condition**: Skill files updated, curated sections intact, committed.
**Failure recovery**: If formatting fails, check the database JSON is valid. The previous skill files are recoverable via `git checkout HEAD -- picnic-components/`.

---

## Step 4: AI Curation (Optional)

**Purpose**: AI reviews changed components and recommends experiential content updates.

**Skip condition**: If `--no-ai` flag is set, skip to Step 5.

**Actions**:

1. Ask the user: "Run AI curation for changed components? [Y/n/specific-components]"
   - If no, skip to Step 5
   - If specific components, scope to those only

2. For each affected skill, assemble context. Use `--skill` to gather all components in a skill, or `--component` for a single component:
   ```bash
   node scripts/assemble-context.mjs \
     --source "$REPO_ROOT/libs/picnic" \
     --skill form-builder \
     --database picnic-database.json \
     --output .picnic-ai-context.md
   ```
   Or for individual components:
   ```bash
   node scripts/assemble-context.mjs \
     --source "$REPO_ROOT/libs/picnic" \
     --component Badge \
     --database picnic-database.json \
     --format json \
     --output .picnic-ai-context.json
   ```

3. The context assembler gathers:
   - Extracted JSON from the database
   - Full source code of changed component files
   - Source comments (NOTE/FIXME/XXX/TODO/HACK)
   - Test file assertions
   - Storybook story patterns
   - Guidance.mdx content
   - Existing curated content from current skill file

4. Read the assembled context, then read the appropriate prompt template from `picnic-components/prompts/`:
   - `decision-guide.md` — for skills with multiple related components
   - `gotchas.md` — for every changed component
   - `anti-patterns.md` — for components with type exclusions or deprecations
   - `canonical-example.md` — for skills where component API changed significantly
   - `common-mistakes.md` — for components with context deps or composition rules

5. Generate curated content recommendations following the prompt template instructions. Score each recommendation:
   - **HIGH** confidence: derived from explicit source evidence (comments, types, tests)
   - **MEDIUM** confidence: inferred from code patterns or naming
   - **LOW** confidence: based on general knowledge, no source backing

6. Apply recommendations to skill files:
   - HIGH confidence items: insert into skill, marked with `<!-- AI:HIGH -->`
   - MEDIUM confidence items: insert into skill, marked with `<!-- AI:MEDIUM -->`
   - LOW confidence items: write to `ai-suggestions.md` for review, NOT inserted into skill

7. Write `curated-content.json` with all recommendations, evidence, and scores.

**Commit**:
```bash
git add picnic-components/ picnic-components/curated-content.json picnic-components/ai-suggestions.md
git commit -m "$(cat <<'EOF'
feat(picnic-skills): AI-recommended curation updates

AI analyzed <N> changed components with context from source, tests,
stories, and guidance.mdx.

Recommendations by confidence:
  HIGH (auto-included): <N> items
  MEDIUM (review recommended): <N> items
  LOW (suggestions only): <N> items
EOF
)"
```

**Success condition**: AI recommendations applied and committed.
**Failure recovery**: If AI curation fails mid-way, the structural updates from Step 3 are already committed. You can skip AI curation with `--no-ai` and run `/picnic-update --no-ai` to complete the pipeline.

---

## Step 5: Human Review

**Purpose**: Developer reviews all changes, approves/edits/rejects.

**Actions**:

1. Show the full diff of all skill changes since Step 1:
   ```bash
   git diff HEAD~3..HEAD -- picnic-components/
   ```
   (Adjust the count based on how many steps produced commits: 3 for Steps 1-3, 4 if AI curation ran)

2. Flag items requiring attention:
   - `<!-- AI:MEDIUM -->` markers — AI-generated, recommended for review
   - `<!-- REMOVED: ... -->` markers — components removed from source
   - New components added to router — confirm routing placement
   - `ai-suggestions.md` — LOW-confidence AI recommendations

3. Present flagged items to the user and ask for review:
   ```
   Items requiring review:

   MEDIUM-confidence AI items (review recommended):
     1. [form-builder] New gotcha: Select portal z-index layering
     2. [data-table] Updated example: added FocusWrapper usage

   REMOVED components (confirm deletion):
     3. [actions-ref] OldButtonGroup marked for removal

   LOW-confidence suggestions (in ai-suggestions.md):
     4. [feedback-notifications] Possible timing gotcha for Accordion animation

   Review each item? [Y/n/accept-all]
   ```

4. For each flagged item, let the user:
   - Accept (keep as-is)
   - Edit (modify the content)
   - Reject (remove the AI recommendation)

5. After review, strip all annotation markers:
   - Remove `<!-- AI:HIGH -->`, `<!-- AI:MEDIUM -->` comments
   - Remove `<!-- REMOVED: ... -->` for confirmed removals (delete the entry)
   - Keep `<!-- REMOVED: ... -->` for items user wants to keep (it's a rename, etc.)

6. Clean up `ai-suggestions.md` — delete if empty, or keep approved items that were added to skills.

**Commit**:
```bash
git add picnic-components/
git commit -m "$(cat <<'EOF'
chore(picnic-skills): human review of generated updates

Reviewed: <N> skill files, <N> AI recommendations
Accepted: <N> AI items (stripped annotations)
Rejected: <N> items
Added: <human-authored-notes>
EOF
)"
```

**Success condition**: All annotations stripped, human edits applied, committed.
**Failure recovery**: If the user wants to redo review, `git reset HEAD~1` to undo the review commit and re-run Step 5.

---

## Step 6: Finalize

**Purpose**: Update state tracking and summarize.

**Actions**:

1. Update `.picnic-gen-state.json`:
   - `lastGeneration.timestamp` — current ISO timestamp
   - `lastGeneration.sourceCommit` — current `origin/main` SHA
   - `lastGeneration.stepsCompleted` — all steps that ran
   - `componentHashes` — recalculated for all affected components
   - `themeHash`, `mediaHash`, `utilsHash` — recalculated if affected
   - New components: add their hashes
   - Removed components (confirmed): set hash to `"REMOVED"`

   Use the detect-changes script with `--init` to recompute all hashes and write a fresh state file:
   ```bash
   node scripts/detect-changes.mjs \
     --source "$REPO_ROOT" \
     --state .picnic-gen-state.json \
     --init
   ```

2. Delete temporary files:
   - `.picnic-changelog.md`
   - `.picnic-changelog.json`
   - `.picnic-ai-context.json`
   - `ai-suggestions.md` (if empty)

3. Print summary:
   ```
   === Picnic Skill Update Complete ===

   Source: <old-sha> -> <new-sha>
   Skills updated: <N> files
   New components: <list or "none">
   Removed: <list or "none">
   AI recommendations: <N> accepted, <N> rejected (or "skipped" if --no-ai)
   Commits: <N> (revertible per-step)

   State file updated. Next /picnic-update will compare from <new-sha>.
   ```

**Commit**:
```bash
git add picnic-components/.picnic-gen-state.json
git commit -m "$(cat <<'EOF'
chore(picnic-skills): update generation state (<new-sha>)

Source tracked: <old-sha> -> <new-sha>
Components: <old-count> -> <new-count>
All hashes updated for changed components.
EOF
)"
```

**Success condition**: State file updated, temporaries cleaned, summary printed.
**Failure recovery**: If this step fails, the skill content is already committed and correct. Manually update the state file or run `/picnic-update --full` next time to regenerate state.

---

## Error Recovery Reference

| Failure Point | Recovery |
|---------------|----------|
| Not in frontend-code repo | Run from within your frontend-code checkout, or `cd` into it first |
| Git fetch fails | Proceed with local state; warn user results may be stale |
| State file missing | Use `--full` to run initial full extraction |
| State file corrupt | Delete it and use `--full` |
| Extraction script fails | Check node version (>=18), check source branch, re-run Step 2 |
| Format script fails | Validate picnic-database.json, re-run Step 3 |
| AI curation fails | Skip with `--no-ai`, complete pipeline, run AI later |
| Pipeline interrupted | Next run detects partial `stepsCompleted` and offers resume |
| Bad generation output | Use `/picnic-rollback` to revert pipeline commits |

---

## /picnic-rollback — Revert Pipeline Commits

When a generation went wrong, use this to revert.

### How It Works

Pipeline commits follow the `chore(picnic-skills):` / `feat(picnic-skills):` convention. Each run produces 4-6 sequential commits.

### Steps

1. Find the pipeline commits from the most recent run:
   ```bash
   git log --oneline -20 -- picnic-components/ | grep "picnic-skills"
   ```

2. Display the pipeline commits to the user:
   ```
   Last pipeline run:
     [1] a1c3e5f chore(picnic-skills): update generation state
     [2] b2d4f6a chore(picnic-skills): human review of generated updates
     [3] c3e5g7b feat(picnic-skills): AI-recommended curation updates
     [4] d4f6h8c chore(picnic-skills): regenerate extracted content
     [5] e5g7i9d chore(picnic-skills): extract updated component data
     [6] f6h8j0e chore(picnic-skills): detect changes since <sha>

   Revert through which step? [1-6/cancel]
   ```

3. Revert from the chosen step through the most recent pipeline commit:
   ```bash
   git revert --no-commit <oldest-to-revert>^..<newest>
   git commit -m "$(cat <<'EOF'
   revert(picnic-skills): rollback pipeline run

   Reverted steps: <list of reverted step descriptions>
   Skills restored to pre-pipeline state.
   EOF
   )"
   ```

4. If the state file was reverted, it now points to the previous generation's commit. The next `/picnic-update` will re-detect and re-process the changes.

5. If only partial rollback (e.g., revert AI curation but keep structural updates):
   - Revert only the AI curation commit
   - Update the state file's `stepsCompleted` to exclude the reverted step

### State File Recovery

If the state file is corrupted or lost:
- `git log --oneline -- .picnic-gen-state.json` shows all previous states
- `git show <commit>:.picnic-gen-state.json` recovers any version
- `/picnic-update --full` regenerates everything from scratch

---

## Workflow Summary

| Step | Automation | Output | Commit |
|------|-----------|--------|--------|
| 0. Preflight | Full | Environment validated | -- |
| 1. Detect | Full | Change report | Changelog |
| 2. Extract | Full | Updated database | Database |
| 3. Format + Merge | Full | Updated skill files (structural) | Regenerated content |
| 4. AI Curate | Full (opt-in) | Recommended curated content | AI recommendations |
| 5. Human Review | Manual | Final approved content | Reviewed changes |
| 6. Finalize | Full | Updated state file | State update |

Six commits per full run — each independently revertible. Nothing curated is ever overwritten without explicit human approval.
