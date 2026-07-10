# Fable–Codex Orchestrator Implementation Plan

## Goal

Provide an installable, dual-compatible plugin that keeps Fable or Claude in the supervisory role while Codex performs bounded implementation, independent review, investigation, and runtime/UI verification.

## Architecture

The supervisor owns decomposition, routing, product judgment, permissions, checkpoints, acceptance, and escalation. Codex receives self-contained bounded tasks and returns reviewable artifacts. Delegation never transfers responsibility for the final result.

The plugin exposes five skills:

1. `route-agent-work` selects the execution and verification path.
2. `delegate-codex-implementation` invokes Codex for a bounded patch and captures its report.
3. `delegate-codex-review` invokes an independent review and requires claim verification.
4. `delegate-codex-computer-use` invokes runtime/UI verification and requires evidence artifacts.
5. `orchestrate-checkpointed-work` coordinates multiple worktrees and pauses at human, CI, product, rebase, merge, and release boundaries.

## Delivery phases

### Phase 1: Foundation

- Package the five skills for both Codex and Claude plugin discovery.
- Add deterministic CLI wrappers for implementation, review, and runtime verification.
- Add repository-local marketplace manifests and installers.
- Validate manifests, skills, shell syntax, and safe argument handling.

### Phase 2: Source expansion

- Review the remaining videos.
- Compare their guidance with the current routing and checkpoint model.
- Revise skill triggers, prompt contracts, and failure recovery without duplicating reference material.

### Phase 3: Forward testing

- Test bounded implementation, empty and non-empty reviews, UI verification, and parallel checkpointed programs.
- Confirm the supervisor verifies artifacts and does not silently broaden delegated authority.
- Add only failure-derived rules that generalize.

### Phase 4: Operational hardening

- Add structured output schemas if real usage shows report parsing is unreliable.
- Add resumable run metadata if long-running handoffs need recovery.
- Add worktree lifecycle helpers only after the desired branch and cleanup policy is established.

## Acceptance criteria

- Both Claude and Codex discover all five skills.
- Installation is repeatable and does not embed credentials.
- Each delegated run produces a durable artifact.
- Review findings are verified before presentation.
- Runtime verification distinguishes observed evidence from inference.
- Commit, push, merge, deploy, account, and destructive actions remain behind explicit user authority.
- Multi-stream completion requires checkpoint evidence, not merely agent termination.
