---
name: route-agent-work
description: Route software work between a supervisory Fable or Claude agent and Codex based on task scope, required judgment, cost, isolation, and verification. Use when planning delegation, choosing whether Codex should implement, review, investigate, or verify a task, or deciding whether work needs direct supervision, parallel agents, or escalation.
---

# Route Agent Work

Keep the invoking Fable or Claude agent responsible for the outcome. Delegate execution, not judgment.

## Classify the task

Evaluate five axes before routing:

- **Scope**: bounded change versus open-ended product work.
- **Intelligence**: difficulty the delegate must handle unsupervised.
- **Taste**: UI/UX, API design, copy, architecture, and code-quality judgment.
- **Isolation**: likelihood of overlapping edits, external side effects, or environment disruption.
- **Verification**: static inspection, automated tests, or real runtime/UI interaction.

## Choose the path

| Need | Route |
| --- | --- |
| Small, well-specified code patch | `$delegate-codex-implementation` |
| Independent second-pass review | `$delegate-codex-review` |
| Browser, simulator, app, or screenshot verification | `$delegate-codex-computer-use` |
| Several bounded streams with CI, review, or product checkpoints | `$orchestrate-checkpointed-work` |
| High-taste or ambiguous design decision | Keep with Fable; delegate research or prototypes only |
| Mechanical analysis, logs, migrations, or large context | Delegate to Codex with a self-contained prompt |

## Apply routing rules

1. Prefer the cheapest capable delegate for gathering evidence and bounded execution.
2. Keep user-facing design, public API decisions, and ambiguous architecture under Fable's judgment.
3. Treat routing as a default, not a limit. Escalate or redo work when output misses the bar.
4. Require an artifact: patch, report, screenshots, test output, or structured findings.
5. Verify the artifact before presenting, merging, or acting on it.
6. Do not grant commit, push, merge, deploy, account, or destructive authority unless the user explicitly included it.

## Build the delegation prompt

Include:

- objective and exact boundary;
- repository and working directory;
- relevant files or review target;
- constraints and forbidden side effects;
- required checks;
- expected artifact path and response format;
- stopping conditions and questions that must return to the supervisor.

Keep prompts direct. Do not reproduce the supervisor's entire reasoning history.
