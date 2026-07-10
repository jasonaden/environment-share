# Fable–Codex Orchestration: Video 1 Research

Source: [A proper guide to Fable 5](https://www.youtube.com/watch?v=8GRmLR__OGQ), Theo – t3.gg, July 5, 2026 (43:14)

## Central idea

Use Fable as the supervisory model and Codex as a comparatively inexpensive specialist. Fable owns decomposition, model routing, product and code-quality judgment, checkpoints, review synthesis, and escalation. Codex performs bounded implementation, independent review, investigation, and computer-use verification. Judge delegated output before accepting it; do not treat delegation as trust transfer.

## Primary use cases

1. **Independent code review** — Fable delegates a focused review target to Codex, receives a report, verifies important claims against the code, and presents or acts on confirmed findings (20:38–22:17).
2. **Bounded implementation** — Fable gives Codex a self-contained, scoped change, preferably isolated in a worktree. Fable reviews the diff and verification results and remains responsible for the final result (22:41–22:58).
3. **Computer-use verification** — Codex launches or inspects applications, exercises flows, verifies UI behavior, captures screenshots, and reports runtime evidence back to Fable (23:04–24:24).
4. **Bulk investigation and mechanical work** — Route clear-spec implementations, migrations, data analysis, log inspection, large-document reading, and similar token-heavy work to the cheaper model (10:07–10:56; 18:44–19:25).
5. **Parallel analysis** — Fable invents task-specific subagent roles and fans work out across files, PRs, or questions rather than relying on permanently defined reviewer personas (12:42–14:22).
6. **Multi-stage triage** — Use generated workflows for deterministic fan-out, categorization, conditional follow-up, and multi-agent verification (13:00–13:48).
7. **Backlog and PR orchestration** — Fable categorizes existing PRs, closes superseded work, writes replacement plans, identifies bounded streams, launches worktrees, and pauses at human/CI/merge checkpoints (26:03–30:33).

## Operating principles

- Keep Fable at `high` reasoning. The author reports that `x-high` and `max` tend to produce over-reasoning loops, higher cost, and often worse or overbuilt code (7:44–9:24).
- Put durable routing behavior in the global instruction file. Explicitly tell Fable it may “shell out” to Codex so it understands that the CLI is an available delegation mechanism (11:41–12:42).
- Define local vocabulary. The author defines **intelligence** as the difficulty a model can handle unsupervised and **taste** as UI/UX, API design, copy, and code-quality judgment (16:51–17:26).
- Treat routing rules as defaults, not hard limits. If delegated output misses the bar, rerun or escalate without asking. Evaluate the output rather than the model price (17:57–18:39).
- Use cheap models to gather information and attempt bounded work; use the strongest high-taste model to steer and judge anything that ships (18:19–19:00).
- Prefer dynamic, task-specific subagents over a fixed catalog of reviewer personas (13:48–14:16).
- Use workflows for deterministic **fan-out and verify**, not as the umbrella for checkpoint-driven programs that require CI, review, product decisions, rebases, and merges (29:13–29:58).
- Improve instructions from observed failures. Ask what failed, derive the smallest preventative rule, shorten it, and append it to the relevant instruction or skill (20:03–20:25; 21:23–22:11).
- Skill descriptions must contain the information needed to decide whether to load the skill; the rest is loaded only after activation (23:11–23:28).

## Reconstructed skill set

These are adaptations of the visible screens and transcript, not verbatim copies of the author's unpublished files.

### `codex-review`

Purpose: ask Codex for an independent review of uncommitted changes, a branch diff, a commit, or a bounded implementation.

Workflow:

1. Identify the exact review target.
2. Create a temporary artifact directory.
3. Write a short, focused prompt and run the appropriate Codex review command.
4. Read the report and verify important claims against the code.
5. If nothing is found, state that clearly and identify what was inspected; do not rerun merely because the report is empty.

Command shapes visible in the video:

```bash
ARTIFACT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/codex-review.XXXXXX")"
REPORT="$ARTIFACT_DIR/report.md"
PROMPT="$ARTIFACT_DIR/prompt.md"

# Review staged, unstaged, and untracked changes.
codex -C "$PWD" review --uncommitted - < "$PROMPT" > "$REPORT"

# Review the current branch against a base branch.
codex -C "$PWD" review --base main - < "$PROMPT" > "$REPORT"

# Review a single commit.
codex -C "$PWD" review --commit <sha> - < "$PROMPT" > "$REPORT"
```

The author emphasizes prompting Codex more simply than Claude/Fable and preserving a report artifact for the parent agent to inspect (21:23–22:11).

### `codex-implementation`

Visible description, lightly normalized:

> Ask Codex CLI to implement scoped code changes in the current repository, then have the orchestrator inspect the resulting diff and verification. Use for explicit Codex delegation, model-routing to Codex, or bounded work that benefits from another coding agent producing a patch.

Key rules visible on screen:

- Use Codex as a separate implementation agent for bounded code changes.
- Fable remains responsible for task scoping, diff review, verification, and explaining the final result.
- Prefer isolated worktrees for parallel changes.
- Do not let the delegated agent commit, push, deploy, or change global configuration unless explicitly authorized.

### `codex-computer-use`

Visible description, lightly normalized:

> Ask Codex CLI to run local-app verification that needs computer use, browser automation, simulators, screenshots, app launching, or independent runtime inspection. Use when asked to test a flow, verify UI behavior, inspect a running app, capture screenshots, or report confirmation and feedback about implemented behavior.

Key rules visible on screen:

- Use Codex as a separate local verification agent when real UI interaction, screenshots, browser/device state, or independent runtime inspection is required.
- Do not use it for ordinary code reading, typechecking, linting, or tests Fable can run directly.
- Launching applications for verification is allowed when required, but ask first when the run could disrupt the user's environment beyond that scope.

## Proposed Fable–Codex control loop

1. Fable interprets the goal and identifies checkpoints, risk, taste requirements, and parallelizable work.
2. Fable chooses among direct work, a Codex skill, task-specific subagents, or a deterministic workflow.
3. Fable sends a bounded, self-contained prompt with the repository path, constraints, expected artifact, and verification contract.
4. Codex performs the implementation, review, investigation, or UI verification and returns an artifact or patch.
5. Fable verifies claims and outputs, requests correction or escalates when quality is insufficient, and pauses at human/CI/product checkpoints.
6. Fable records recurring failures as concise instruction or skill improvements.

## Skill candidates for this repository

- `codex-review` — independent review with artifact capture and claim verification.
- `codex-implementation` — bounded patch generation with worktree isolation and parent review.
- `codex-computer-use` — runtime/UI verification with screenshots and an evidence report.
- `route-agent-work` — Fable-side routing rubric based on intelligence, taste, cost, isolation, and verification needs.
- `orchestrate-checkpointed-work` — umbrella loop for multiple work streams; uses workflows only for fan-out and verification phases.

The first three are directly supported by the video. The last two are synthesis candidates that should be refined against the remaining videos before implementation.

## Questions for later videos

- Exact Fable-to-Codex invocation and how results are returned to the parent.
- Worktree creation, cleanup, collision avoidance, and merge ownership.
- Status reporting, timeout handling, resumability, and failure recovery.
- Permission boundaries for commits, pushes, merges, PR closure, and deployment.
- Shared artifact schema for prompts, reports, screenshots, patches, and verification evidence.
- How Fable or ChatGPT should select Codex versus direct implementation in this environment.
