---
name: delegate-codex-implementation
description: Delegate a bounded code change to the Codex CLI while the invoking Fable or Claude agent retains responsibility for scope, diff review, verification, and the final result. Use for explicit Codex handoffs, parallel implementation in an isolated worktree, or well-specified patches that benefit from a separate coding agent.
---

# Delegate Codex Implementation

Use Codex as a separate implementation agent for bounded work. Keep orchestration and acceptance with the invoking agent.

## Workflow

1. Confirm the change is bounded and has an observable completion condition.
2. Inspect repository instructions and relevant code before delegating.
3. Use a clean worktree when another agent may edit overlapping files or the main checkout must remain stable.
4. Write a self-contained prompt to a file. Include scope, constraints, validation commands, and the required summary.
5. Run `scripts/run-implementation.sh <repo> <prompt-file> [report-file]`.
6. Inspect the resulting diff and report.
7. Run or check the required validation independently.
8. Correct, redelegate, or escalate if the patch violates scope or quality expectations.
9. Explain the accepted result to the user. Do not present the delegate's claims as verified until checked.

## Guardrails

- Do not delegate open-ended product direction or high-taste decisions without first bounding them.
- Do not allow commit, push, merge, deploy, account changes, or global configuration unless explicitly authorized.
- Stop and return to the supervisor when requirements conflict, secrets are required, or the task expands materially.
- Preserve unrelated working-tree changes.

## Prompt contract

Ask Codex to return:

- files changed and why;
- validation performed and its result;
- unresolved questions or risks;
- confirmation that it stayed within the requested boundary.

Use `scripts/run-implementation.sh` for consistent invocation and report capture.
