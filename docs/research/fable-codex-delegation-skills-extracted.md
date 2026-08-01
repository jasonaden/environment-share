# Codex Delegation Skills

Source: Theo – t3.gg, [A proper guide to Fable 5](https://www.youtube.com/watch?v=8GRmLR__OGQ), July 5, 2026.

This is a normalized transcription of the three Codex skill definitions shown around 20:25–24:29. Line wrapping and formatting have been cleaned up. Model names are preserved as shown in the video.

## `codex-review`

### Description

Ask Codex CLI (GPT-5.5) for an independent review of uncommitted changes, a branch diff, a commit, or a specific implementation. Use when the user asks Claude to have Codex or GPT-5.5 review work, when the model-selection rubric calls for an additional perspective, or when Codex should audit a diff, find bugs or regressions, or compare an implementation against requirements.

### Codex Review

Use Codex as an independent reviewer when the user wants a second-pass review or when a change is broad enough that another agent's perspective is useful.

Prefer Claude's normal review process for small local checks. Do not delegate review just to avoid reading the code yourself. Treat Codex's output as evidence, not authority.

### Workflow

1. Identify the review target: uncommitted changes, a base branch, a commit SHA, a PR checkout, or specific files.
2. Create a temporary artifact directory for the Codex report.
3. Run `codex review` with a focused review prompt.
4. Read Codex's report and verify important claims against the code before presenting them.

Use one of these command shapes:

```bash
ARTIFACT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/codex-review.XXXXXX")"
REPORT="$ARTIFACT_DIR/report.md"
PROMPT="$ARTIFACT_DIR/prompt.md"

# Review staged, unstaged, and untracked changes.
codex -C "$PWD" review --uncommitted - < "$PROMPT" > "$REPORT"

# Review the current branch against a base branch.
codex -C "$PWD" review --base main - < "$PROMPT" > "$REPORT"

# Review one commit.
codex -C "$PWD" review --commit <sha> - < "$PROMPT" > "$REPORT"
```

Keep the prompt focused on the requested review. Ask Codex to report actionable findings with file and line references, explain their impact, and say clearly when it finds no issues. Do not rerun merely because the report is empty. The parent agent remains responsible for checking the findings and deciding what to present or fix.

## `codex-implementation`

### Description

Ask Codex CLI (GPT-5.5) to implement scoped code changes in the current repository, then have Claude inspect the resulting diff and verification. This is how GPT-5.5 is invoked for implementation work. Use when the user asks Claude to delegate implementation to Codex or GPT-5.5, when the model-selection rubric routes work to GPT-5.5, or when a bounded task would benefit from another coding agent producing a patch.

### Codex Implementation

Use Codex as a separate implementation agent for bounded code changes. Claude remains responsible for scoping the task, reviewing the diff, running or checking verification, and explaining the final result.

Use this when the user asks for Codex or delegation, or when a bounded task would benefit from a parallel implementation agent producing a patch. Do not let Codex commit, push, deploy, or edit global configuration unless the user explicitly asked for that.

### Workflow

1. Give Codex a self-contained prompt with the goal, relevant paths, constraints, acceptance criteria, and required checks.
2. Use a workspace-write sandbox for implementation.
3. Give concurrent writers separate worktrees so their edits cannot collide.
4. Inspect the resulting diff yourself.
5. Run or verify the relevant checks before accepting the implementation.
6. Report what changed, the verification performed, and any remaining risk.

## `codex-computer-use`

### Description

Ask Codex CLI (GPT-5.5) to run local app verification that needs computer use, browser automation, simulators, screenshots, app launching, or independent runtime inspection. This is how GPT-5.5 is invoked for computer-use work. Use when the user asks Claude to have Codex or GPT-5.5 test a flow, verify UI behavior, inspect a running app, capture screenshots, or report confirmation and feedback about implemented behavior.

### Codex Computer Use

Use Codex as a separate local verification agent when the task needs real UI interaction, screenshots, simulator, browser, or device state, or an independent runtime check outside Claude's current context.

Do not use this for ordinary code reading, typechecking, linting, or tests Claude can run directly. Launching apps, simulators, or browsers to verify the requested work is fine without asking. Ask first only if the run could disrupt the user's environment beyond that, such as closing apps, changing system settings, or acting on real accounts or data.

### Workflow

1. State the exact flow to test and the expected behavior.
2. Identify the app, URL, simulator, or device and any safe setup constraints.
3. Ask for concrete evidence: steps performed, observed behavior, screenshots when useful, failures, and reproduction details.
4. Keep actions local and reversible; do not mutate real accounts, data, or system settings without explicit permission.
5. Treat the returned report as evidence and reconcile it with the implementation before declaring the work verified.
