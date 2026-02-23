# 09 — Change Detection & Scoped Regeneration

> **Author**: Change Detector Agent (Task #1)
> **Date**: 2026-02-18
> **Status**: Proposal
> **Sources**: 08-source-exploration, 08-generation-pipeline, 08-skill-audit, frontend-code repo exploration

---

## 1. Executive Summary

The Picnic skill set (14 files, ~39KB) is generated from source at `~/Projects/frontend-code/libs/picnic/` (57 components). This proposal designs a system to:

1. **Detect** when Picnic source changes affect skill content
2. **Scope** regeneration to only the affected skill files
3. **Trigger** updates via manual command, hook, or CI

**Key design decision**: Use a **state file** (stored alongside skills) that records the source commit SHA and a per-component content hash. Compare against current source to produce a minimal changeset. This is simpler and more reliable than git tags (which require write access to frontend-code) or file-watching (which is fragile across sessions).

---

## 2. State Tracking Mechanism

### 2.1 Options Evaluated

| Option | Description | Pros | Cons |
|--------|------------|------|------|
| **A. Git tag in frontend-code** | Create `picnic-skills-gen/YYYY-MM-DD` tags | Easy `git diff` between tags | Requires write access to frontend-code; pollutes tag namespace; team may object |
| **B. State file alongside skills** | Store commit SHA + content hashes in `.picnic-gen-state.json` | Self-contained; no external repo writes; portable; supports partial regen | Must manually keep in sync; extra file to commit |
| **C. Compare JSON database** | Diff `picnic-database.json` (from pipeline stage 2) against re-extracted data | Most accurate (compares actual extracted content) | Requires running full extraction before detecting changes; slower |

### 2.2 Recommendation: Option B — State File

Store a `.picnic-gen-state.json` in the skills directory:

```json
{
  "version": 1,
  "lastGeneration": {
    "timestamp": "2026-02-18T04:30:00Z",
    "sourceCommit": "b4f07b04efa36c138c7e99fe9694673df6d2a94b",
    "sourceBranch": "main",
    "sourceRepo": "~/Projects/frontend-code"
  },
  "componentHashes": {
    "Accordion": "sha256:a1b2c3...",
    "Badge": "sha256:d4e5f6...",
    "Banner": "sha256:g7h8i9...",
    "...": "..."
  },
  "themeHash": "sha256:j0k1l2...",
  "mediaHash": "sha256:m3n4o5...",
  "utilsHash": "sha256:p6q7r8..."
}
```

**How hashes work**: Each component hash is computed over the concatenated content of all files in that component's directory (`libs/picnic/src/components/ComponentName/**`). Theme, media, and utils hashes cover their respective directories. This catches changes that `git diff` alone might miss (e.g., after a rebase or merge).

**Why not Option A (git tags)**: The frontend-code repo is a shared monorepo for the whole frontend org. Creating tags there for a single skill system's maintenance is overreach and would require buy-in from the repo owners. The state file is fully self-contained within the skills repo.

**Why not Option C (database diff)**: Running full AST extraction just to *detect* changes is heavyweight. The state file enables a fast pre-check (seconds) before deciding whether to run the expensive extraction pipeline.

---

## 3. Change Detection Mechanisms

### 3.1 Options Evaluated

| Option | Reliability | Automation | Complexity | False Positives | Recommendation |
|--------|-----------|-----------|-----------|----------------|----------------|
| **A. Git diff** | High — catches all tracked changes | Manual trigger or hook | Low — `git diff` is well-understood | Low — scoped to `libs/picnic/` | **Primary mechanism** |
| **B. Claude Code hook** | Medium — only fires on session events | Automatic on session start | Medium — hook script + async check | Medium — fires on every session, even non-picnic work | **Secondary (advisory only)** |
| **C. Code review agent** | High — PR-level granularity | Semi-automatic (runs on PRs) | High — needs CI integration + agent infra | Very low — human-reviewed | **Future enhancement** |
| **D. Manual trigger** | Perfect — user decides when to run | None (manual) | Lowest | Zero | **Always available as fallback** |

### 3.2 Recommendation: Layered Approach

Use three mechanisms at different levels:

#### Layer 1: Manual Command (`/picnic-update`) — Always Available

A skill/command the user invokes explicitly. This is the primary workflow:

```
User runs: /picnic-update

1. Read .picnic-gen-state.json → get lastCommit
2. cd ~/Projects/frontend-code
3. git diff <lastCommit>..HEAD -- libs/picnic/src/
4. Parse changed files → map to affected skills (§4)
5. Report: "X components changed, Y skills affected"
6. If user approves → run scoped regeneration
7. Update .picnic-gen-state.json with new commit + hashes
```

#### Layer 2: SessionStart Hook — Advisory Check

A lightweight check that runs when a Claude Code session starts. Does NOT auto-regenerate — just warns the user if skills may be stale.

```bash
#!/usr/bin/env bash
# hooks/check-picnic-freshness.sh

STATE_FILE="$CLAUDE_PLUGIN_ROOT/.picnic-gen-state.json"
FRONTEND_REPO="$HOME/Projects/frontend-code"

if [ ! -f "$STATE_FILE" ] || [ ! -d "$FRONTEND_REPO/.git" ]; then
  exit 0  # Silently skip if state file or repo not found
fi

LAST_COMMIT=$(jq -r '.lastGeneration.sourceCommit' "$STATE_FILE")
CURRENT_COMMIT=$(git -C "$FRONTEND_REPO" rev-parse main 2>/dev/null)

if [ "$LAST_COMMIT" = "$CURRENT_COMMIT" ]; then
  exit 0  # Skills are fresh
fi

# Count changed files in libs/picnic/
CHANGED=$(git -C "$FRONTEND_REPO" diff --name-only "$LAST_COMMIT".."$CURRENT_COMMIT" -- libs/picnic/src/ 2>/dev/null | wc -l | tr -d ' ')

if [ "$CHANGED" -gt 0 ]; then
  echo "Picnic source has $CHANGED changed files since last skill generation. Run /picnic-update to refresh."
fi
```

**Why advisory only**: Auto-regeneration on session start would be surprising and slow. The hook just prints a one-line notice so the user knows to run `/picnic-update` when ready.

#### Layer 3: CI Integration — Future Enhancement

A GitHub Actions workflow on the frontend-code repo that detects Picnic changes in PRs:

```yaml
# .github/workflows/picnic-skill-check.yml (future)
on:
  pull_request:
    paths:
      - 'libs/picnic/src/**'
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - run: echo "::warning::This PR modifies Picnic components. Skills may need updating."
```

This is low-priority because it requires changes to the frontend-code repo. Listed here for completeness.

---

## 4. Source-File-to-Skill Mapping

### 4.1 Mapping Table

This is the core of scoped regeneration: given a changed source file, which skill file(s) need updating?

#### Component → Skill Mapping

| Component | Primary Skill | Reference File |
|-----------|--------------|----------------|
| **Accordion** | `problem/feedback-notifications` | — |
| **Badge** | — | `references/data-display-ref.md` |
| **Banner** | `problem/feedback-notifications` | — |
| **Box** | `foundation/layout-primitives` | — |
| **Breadcrumbs** | `problem/navigation` | — |
| **Button** | — | `references/actions-ref.md` |
| **ButtonBar** | — | `references/actions-ref.md` |
| **ButtonGroup** | — | `references/actions-ref.md` |
| **Card** | — | `references/data-display-ref.md` |
| **Checkbox** | `problem/form-builder` | — |
| **ContainedLabel** | — | `references/data-display-ref.md` |
| **ContinuousScroll** | `problem/data-table` | — |
| **DatePicker** | `problem/form-builder` | — |
| **Dialog** | `problem/dialog-drawer` | — |
| **Drawer** | `problem/dialog-drawer` | — |
| **DropdownMenu** | `problem/dialog-drawer` | — |
| **Emoji** | — | `references/media-ref.md` |
| **FileInput** | `problem/form-builder` | — |
| **FooterLayout** | `foundation/layout-primitives` | — |
| **Form** | `problem/form-builder` | — |
| **FormField** | `problem/form-builder` | — |
| **Grid** | `foundation/layout-primitives` | — |
| **Heading** | — | `references/typography-ref.md` |
| **Icon** | — | `references/media-ref.md` |
| **IconCircle** | — | `references/media-ref.md` |
| **IconPopover** | `problem/feedback-notifications` | — |
| **ImagePreview** | — | `references/media-ref.md` |
| **InputGroup** | `problem/form-builder` | — |
| **Link** | — | `references/typography-ref.md` |
| **List** | — | `references/data-display-ref.md` |
| **LoadingIndicator** | `problem/feedback-notifications` | — |
| **LoadingPlaceholder** | `problem/feedback-notifications` | — |
| **Logomark** | — | `references/media-ref.md` |
| **PageLayout** | `foundation/layout-primitives` | — |
| **Paginator** | `problem/navigation` | — |
| **PickerButton** | — | `references/actions-ref.md` |
| **Popover** | `problem/dialog-drawer` | — |
| **ProgressBar** | — | `references/data-display-ref.md` |
| **RadioGroup** | `problem/form-builder` | — |
| **ResponsiveImage** | — | `references/media-ref.md` |
| **SearchBar** | `problem/form-builder` | — |
| **Select** | `problem/form-builder` | — |
| **Separator** | `foundation/layout-primitives` | — |
| **Stack** | `foundation/layout-primitives` | — |
| **StepTracker** | `problem/navigation` | — |
| **Switch** | `problem/form-builder` | — |
| **TabGroup** | `problem/navigation` | — |
| **Table** | `problem/data-table` | — |
| **Tag** | — | `references/data-display-ref.md` |
| **TagSelector** | `problem/form-builder` | — |
| **Text** | — | `references/typography-ref.md` |
| **TextArea** | `problem/form-builder` | — |
| **TextInput** | `problem/form-builder` | — |
| **TextWithOverflowTooltip** | — | `references/typography-ref.md` |
| **TimePicker** | `problem/form-builder` | — |
| **Tooltip** | `problem/feedback-notifications` | — |
| **Wordmark** | — | `references/media-ref.md` |

#### Infrastructure File → Skill Mapping

| Source Path | Affected Skill Files |
|-------------|---------------------|
| `src/themes/theme-2021.ts` | `foundation/design-tokens/SKILL.md`, `foundation/design-tokens/references/token-tables.md` |
| `src/themes/theme-dark.ts` | `foundation/design-tokens/references/token-tables.md` |
| `src/media.ts` | `foundation/design-tokens/SKILL.md`, `foundation/stitches-patterns/SKILL.md` |
| `src/stitches.config.ts` | `foundation/stitches-patterns/SKILL.md` |
| `src/utils/*.ts` | `foundation/stitches-patterns/SKILL.md`, `foundation/stitches-patterns/references/utils-reference.md` |
| `src/components/Icon/icon-set/icons/*` | `references/media-ref.md` |
| `src/components/Icon/icon-set/third-party-icons/*` | `references/media-ref.md` |
| `src/components/index.ts` | `SKILL.md` (router), `validator/SKILL.md` |

#### Cross-Cutting Concerns

Any component change also potentially affects:
- `validator/SKILL.md` — variant enum lists and composition rules may need updating
- `SKILL.md` (router) — only if a component is added or removed (changes the routing table)

### 4.2 Mapping Algorithm

```
function mapChangesToSkills(changedFiles: string[]): Set<string> {
  const affectedSkills = new Set<string>();

  for (const file of changedFiles) {
    // 1. Component file → look up in component mapping table
    const componentMatch = file.match(/src\/components\/(\w+)\//);
    if (componentMatch) {
      const component = componentMatch[1];
      const skill = COMPONENT_TO_SKILL[component];
      if (skill) affectedSkills.add(skill);
      // All component changes potentially affect validator
      affectedSkills.add('validator/SKILL.md');
    }

    // 2. Theme files → design-tokens
    if (file.includes('src/themes/')) {
      affectedSkills.add('foundation/design-tokens/SKILL.md');
      affectedSkills.add('foundation/design-tokens/references/token-tables.md');
    }

    // 3. Media/breakpoints → design-tokens + stitches-patterns
    if (file.includes('src/media.ts')) {
      affectedSkills.add('foundation/design-tokens/SKILL.md');
      affectedSkills.add('foundation/stitches-patterns/SKILL.md');
    }

    // 4. Utils → stitches-patterns
    if (file.includes('src/utils/')) {
      affectedSkills.add('foundation/stitches-patterns/SKILL.md');
      affectedSkills.add('foundation/stitches-patterns/references/utils-reference.md');
    }

    // 5. Icon directories → media-ref
    if (file.includes('icon-set/icons/') || file.includes('icon-set/third-party-icons/')) {
      affectedSkills.add('references/media-ref.md');
    }

    // 6. Component barrel export → router
    if (file === 'src/components/index.ts' || file === 'src/index.ts') {
      affectedSkills.add('SKILL.md');
    }
  }

  return affectedSkills;
}
```

### 4.3 Scoping Precision

The mapping is intentionally **conservative** (over-includes rather than misses). A component change triggers its owning skill + the validator. In practice, many changes (e.g., fixing a bug in internal logic) won't actually change the extractable API surface. The pipeline's Stage 2 (database diff) catches this:

```
1. Detect changed files via git diff → scope to affected skills (fast, seconds)
2. Run extraction ONLY for affected components → new partial database (medium, seconds)
3. Diff partial database against stored database → actual content changes (fast, milliseconds)
4. Regenerate ONLY skills with actual content differences (fast, seconds)
```

This two-stage scoping (git diff → database diff) avoids regenerating skills when internal-only changes don't affect the extractable API.

---

## 5. Handling New & Removed Components

### 5.1 New Component Detected

When `src/components/index.ts` exports a component not in the state file's `componentHashes`:

1. **Extract**: Run full extraction for the new component
2. **Classify**: Attempt automatic categorization:
   - Has `styled()` with simple variants only → likely a reference component
   - Has `CompositeComponent` interface → likely belongs in a problem skill
   - Wraps `@radix-ui/*` → check which problem skill handles that pattern
3. **Flag for human decision**: Report to user:
   ```
   NEW COMPONENT: ButtonGroupNext
   - Pattern: compound (3 sub-components)
   - Radix: no
   - Suggested placement: references/actions-ref.md (similar to ButtonGroup)
   - ACTION REQUIRED: Confirm placement or assign to a different skill
   ```
4. **Provisional placement**: If the user confirms, add to the mapping table and generate the reference entry
5. **Update state file**: Add the new component hash

### 5.2 Component Removed

When a component in `componentHashes` no longer exists in source:

1. **Never auto-delete** skill content — the component may have been renamed or moved
2. **Flag for human review**:
   ```
   REMOVED COMPONENT: OldButtonGroup
   - Was in: references/actions-ref.md
   - Last seen: commit abc123
   - ACTION REQUIRED: Remove from skill, or update if renamed
   ```
3. **Mark as stale** in state file (set hash to `"REMOVED"`)
4. Human removes the entry from the skill file manually

### 5.3 Component Moved Between Directories

If a component disappears from one directory and appears in another (same name, different path):

1. **Detect**: Missing hash + new hash with same component name
2. **Report**: "Component X moved from `dir-a/` to `dir-b/`"
3. **No skill change needed**: The mapping is by component name, not directory path

---

## 6. Trigger Mechanism Recommendation

### 6.1 Primary: `/picnic-update` Command

A Claude Code skill/command that the user invokes when ready to update:

```yaml
---
name: picnic-update
description: >
  Check for Picnic source changes and update affected skill files.
  Compares current frontend-code state against last generation.
---
```

**Workflow**:

```
/picnic-update
  │
  ├─ Read .picnic-gen-state.json
  ├─ cd ~/Projects/frontend-code && git fetch origin main
  ├─ git diff <lastCommit>..origin/main -- libs/picnic/src/
  │
  ├─ If no changes:
  │    └─ "Skills are up to date (last generated from <commit>)"
  │
  ├─ If changes detected:
  │    ├─ Map changed files → affected skills (§4)
  │    ├─ Display change summary:
  │    │    "3 components changed: Badge, Select, Table"
  │    │    "5 skill files affected:"
  │    │    "  - references/data-display-ref.md (Badge)"
  │    │    "  - problem/form-builder/SKILL.md (Select)"
  │    │    "  - problem/data-table/SKILL.md (Table)"
  │    │    "  - validator/SKILL.md (all)"
  │    │    "  - foundation/design-tokens/references/token-tables.md (theme change)"
  │    │
  │    ├─ Ask user: "Regenerate affected skills? [Y/n]"
  │    │
  │    ├─ If yes:
  │    │    ├─ Run extraction for affected components only
  │    │    ├─ Diff new partial database against stored
  │    │    ├─ Regenerate only skills with actual content changes
  │    │    ├─ Show diff of each regenerated file
  │    │    └─ Update .picnic-gen-state.json
  │    │
  │    └─ If no:
  │         └─ "Skipped. Run /picnic-update again when ready."
  │
  └─ Report new/removed components (§5)
```

### 6.2 Secondary: SessionStart Hook (Advisory)

Register a lightweight hook in the plugin that fires on session start:

```json
{
  "hooks": [
    {
      "event": "SessionStart",
      "command": "$CLAUDE_PLUGIN_ROOT/hooks/check-picnic-freshness.sh",
      "timeout": 5000
    }
  ]
}
```

The hook (script shown in §3.2, Layer 2) prints a single-line advisory if skills are stale. It exits silently if skills are fresh or if the frontend-code repo isn't available.

**Important**: The hook does NOT block the session. It's a fast `git rev-parse` + comparison — well under the 5-second timeout.

### 6.3 Not Recommended: Auto-Regeneration

Auto-regeneration (on session start or via file watcher) is explicitly **not recommended** because:

1. **Regeneration modifies files** — surprising side effects when starting an unrelated session
2. **Requires human review** — the merge step for problem skills needs human approval
3. **Pipeline may not exist yet** — the extraction scripts from the 08-generation-pipeline proposal haven't been built
4. **Network dependency** — requires `git fetch` which may fail offline

---

## 7. State File Lifecycle

### 7.1 Initial Creation

When skills are first generated (or the state file doesn't exist), create it:

```bash
# Run from skills directory
cd ~/Projects/frontend-code
COMMIT=$(git rev-parse main)
# Hash each component directory
for dir in libs/picnic/src/components/*/; do
  COMPONENT=$(basename "$dir")
  HASH=$(find "$dir" -type f -name '*.ts' -o -name '*.tsx' | sort | xargs shasum -a 256 | shasum -a 256 | cut -d' ' -f1)
  echo "  \"$COMPONENT\": \"sha256:$HASH\""
done
# Also hash theme, media, utils
```

### 7.2 After Each Regeneration

The `/picnic-update` command updates the state file:
- `lastGeneration.timestamp` → current time
- `lastGeneration.sourceCommit` → current `git rev-parse main`
- `componentHashes` → recalculated for affected components
- `themeHash`, `mediaHash`, `utilsHash` → recalculated if affected

### 7.3 Committing the State File

The state file should be committed alongside the skill files. This ensures:
- Any clone of the skills repo knows what source state they were generated from
- Multiple people can detect drift independently
- Git blame shows when each generation happened

### 7.4 Edge Cases

| Scenario | Behavior |
|----------|----------|
| State file missing | Treat as "never generated" — full extraction needed |
| Source commit not found (rebased away) | Fall back to hash comparison only; warn user |
| Frontend-code repo not cloned | Skip detection; print "Cannot check — frontend-code repo not found at expected path" |
| Branch mismatch (user on feature branch) | Default to comparing against `main`; allow `--branch <name>` override |
| Multiple source repos | Not supported — Picnic is in one repo. If it moves, update `sourceRepo` path. |

---

## 8. Integration with Pipeline Stages

This change detection system integrates with the 4-stage pipeline from 08-generation-pipeline:

```
                    ┌─────────────────────────┐
                    │   CHANGE DETECTION       │  ← This proposal
                    │                          │
                    │  .picnic-gen-state.json   │
                    │  git diff → file list     │
                    │  mapChangesToSkills()     │
                    └──────────┬──────────────┘
                               │
                     affected skills list
                               │
                    ┌──────────▼──────────────┐
                    │  Stage 1: EXTRACT        │  ← Only for affected components
                    │  (scoped by changeset)   │
                    └──────────┬──────────────┘
                               │
                    ┌──────────▼──────────────┐
                    │  Stage 2: DATABASE       │  ← Partial database update
                    │  (diff against stored)   │
                    └──────────┬──────────────┘
                               │
                    ┌──────────▼──────────────┐
                    │  Stage 3: FORMAT         │  ← Only changed entries
                    └──────────┬──────────────┘
                               │
                    ┌──────────▼──────────────┐
                    │  Stage 4: MERGE          │  ← Only affected skill files
                    └──────────┬──────────────┘
                               │
                    ┌──────────▼──────────────┐
                    │  Update state file        │
                    └──────────────────────────┘
```

The change detection layer sits **before** Stage 1 and determines the scope for all subsequent stages. Without it, every run would re-extract all 57 components. With it, a typical update touches 2-5 components and 1-3 skill files.

---

## 9. Summary of Recommendations

| Question | Recommendation | Rationale |
|----------|---------------|-----------|
| **State tracking** | SHA + content hashes in `.picnic-gen-state.json` | Self-contained; no external repo writes; supports partial regen |
| **Primary detection** | `git diff <stored-sha>..HEAD` scoped to `libs/picnic/src/` | Fast, reliable, well-understood |
| **Primary trigger** | `/picnic-update` command (manual) | User controls when regeneration happens; human review required |
| **Advisory trigger** | SessionStart hook (one-line notice) | Low-cost awareness; no side effects |
| **File → skill mapping** | Static mapping table (§4.1) + algorithm (§4.2) | 57 components fully mapped; conservative scoping |
| **New components** | Auto-detect + flag for human placement decision | Cannot auto-categorize reliably |
| **Removed components** | Flag for human review; never auto-delete | Safety — could be rename, not removal |
| **CI integration** | Future enhancement; PR-level comment | Requires frontend-code repo changes; lower priority |
