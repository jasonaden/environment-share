---
name: delegate-codex-review
description: Request an independent Codex CLI review of uncommitted changes, a branch diff, or a commit, capture the report as an artifact, and verify important findings against the code. Use when a second-pass review is requested, a change is broad or risky, or another model perspective would improve confidence.
---

# Delegate Codex Review

Use Codex as an independent reviewer. The invoking agent must validate findings before presenting or acting on them.

## Workflow

1. Identify exactly one target: `uncommitted`, `base:<branch>`, or `commit:<sha>`.
2. Write a focused review prompt describing the relevant risks and intended behavior.
3. Run `scripts/run-review.sh <repo> <target> <prompt-file> [report-file]`.
4. Read the complete report.
5. Verify material claims against the diff, surrounding code, and tests.
6. Remove false positives and distinguish confirmed defects from questions or suggestions.
7. If no issues are found, state that clearly and name the inspected target. Do not rerun solely because the report is empty.

## Prompt guidance

Keep the prompt short and concrete. Specify the behavior and risk areas to examine. Ask for actionable findings with file and line references, impact, and a concise explanation.

Do not ask Codex to edit files during review.

## Reporting contract

Present only verified findings. Include:

- review target;
- confirmed findings ordered by severity;
- validation used to confirm them;
- any residual uncertainty;
- an explicit “no confirmed findings” result when appropriate.
