---
name: codex-delegate
description: Delegate work to GPT-5.6 via the Codex CLI (`codex exec` / `codex review`) — implementation, review, investigation, and computer use. Use when routing bulk/mechanical work, an independent review perspective, or computer-use tasks to GPT-5.6, or when a prompt mentions codex, GPT-5.6, or shelling out to ChatGPT.
---

# Delegating to GPT-5.6 via Codex

GPT-5.6 is reachable only through the Codex CLI, which now ships bundled inside the ChatGPT desktop app. `~/.codex/config.toml` already defaults to GPT-5.6, so no model flag is needed.

## Resolving the binary

`codex` may not be on PATH outside cmux-spawned terminals. Resolve it like this:

```bash
CODEX=$(command -v codex || echo "/Applications/ChatGPT.app/Contents/Resources/codex")
```

If neither exists, the ChatGPT app is not installed — stop and report that instead of retrying.

## Core commands

| Command | Purpose |
|---------|---------|
| `codex exec "<prompt>"` | Run Codex non-interactively on a task |
| `codex exec -s read-only "<prompt>"` | Investigation / data analysis with no write access |
| `codex exec -s workspace-write "<prompt>"` | Implementation work confined to the workspace |
| `codex review` | Non-interactive code review of the working tree |
| `codex apply` | Apply the latest Codex-produced diff to the working tree |

Sandbox modes for `-s`: `read-only`, `workspace-write`, `danger-full-access`. Never use `danger-full-access` or `--dangerously-bypass-approvals-and-sandbox` unless the user explicitly opts in.

## Writing prompts for Codex

Codex sees none of your conversation context. Every prompt must be self-contained: state the goal, the relevant file paths, the constraints, and the exact shape of the report you want back. Ask it to write its report to a known file path when you need to collect results programmatically.

## Timeouts and long runs

Codex runs routinely exceed the default 10-minute Bash timeout. Either:

- pass an explicit longer timeout to the Bash call, or
- run Codex in the background, have it write its report to a file, and poll for that file.

## Task routing

- **Bulk/mechanical work** (clear-spec implementation, migrations, data analysis): good fit — GPT-5.6 is effectively free.
- **Reviews**: use `codex review` or `codex exec -s read-only` as an extra independent perspective alongside Claude review.
- **Computer use**: shell out to GPT-5.6 via Codex when GUI interaction is needed to complete or verify work (the local Codex computer-use integration handles the driving).
- **User-facing work needing taste** (UI, copy, API design): keep on Claude models; use Codex only for the mechanical parts.

## Implementation mode

Use Codex as a separate implementation agent for bounded code changes. The parent agent remains responsible for scoping the task, inspecting the resulting diff, checking verification, and explaining the final result.

- Give Codex a self-contained prompt with the goal, relevant paths, constraints, acceptance criteria, and required checks.
- Use `codex exec -s workspace-write`.
- Put concurrent implementation agents in separate worktrees.
- Do not let the delegated agent commit, push, deploy, edit global configuration, or act outside the workspace unless the user explicitly authorized it.
- Inspect the diff and run or verify the relevant checks before accepting the work.

## Review mode

Use Codex as an independent second-pass reviewer for broad changes or when the user requests another perspective. Prefer the normal local review process for small checks; do not delegate merely to avoid reading the code. Treat the report as evidence, not authority.

Identify the target, write a focused prompt, and capture the report in a temporary artifact directory:

```bash
ARTIFACT_DIR="$(mktemp -d "${TMPDIR:-/tmp}/codex-review.XXXXXX")"
REPORT="$ARTIFACT_DIR/report.md"
PROMPT="$ARTIFACT_DIR/prompt.md"

codex -C "$PWD" review --uncommitted - < "$PROMPT" > "$REPORT"
codex -C "$PWD" review --base main - < "$PROMPT" > "$REPORT"
codex -C "$PWD" review --commit <sha> - < "$PROMPT" > "$REPORT"
```

Use only the command matching the requested target. Ask for actionable findings with file and line references and a clear no-findings result. Read the report and verify important claims against the code before presenting them. Do not rerun solely because the report is empty.

## Computer-use mode

Use Codex as a separate local verification agent when the task needs real UI interaction, browser automation, screenshots, simulators, app or device state, or an independent runtime check.

- Do not delegate ordinary code reading, typechecking, linting, or tests that can be run directly.
- State the exact flow, expected behavior, target app or URL, and safe setup constraints.
- Request concrete evidence: actions taken, observations, screenshots when useful, failures, and reproduction details.
- Launching an app, simulator, or browser for the requested verification is allowed. Ask first if the work would close apps, change system settings, or act on real accounts or data.
- Reconcile the evidence with the implementation before declaring the work verified.

## Using GPT-5.6 inside Claude workflows/subagents

The workflow `model` parameter only accepts Claude models, so wrap Codex:

- Spawn a thin Claude wrapper agent with `model: 'sonnet'`, `effort: 'low'` whose prompt instructs it to write a self-contained Codex prompt, run `codex exec` via Bash, and return the report. Use `schema` on the wrapper to get structured output back.
- Always label these agents with a `gpt-5.6:` prefix, e.g. `{label: 'gpt-5.6:review-auth'}` — the workflow UI shows the wrapper's Claude model, so the label is the only indication the real worker is GPT-5.6.
- Parallel GPT-5.6 implementation agents must use `isolation: 'worktree'` so Codex edits don't collide in the shared checkout.
- Workflow token budgets only count Claude tokens; Codex work is free and invisible to `budget.spent()`.
