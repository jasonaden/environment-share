---
name: orchestrate-checkpointed-work
description: Coordinate multiple implementation streams while preserving human, CI, review, rebase, merge, and product-decision checkpoints. Use for backlog execution, multi-PR programs, parallel worktrees, or long-running goals where one deterministic workflow would either overrun decisions or stall at the first checkpoint.
---

# Orchestrate Checkpointed Work

Keep Fable or the invoking agent as the umbrella orchestrator. Use deterministic workflows only inside phases that benefit from fan-out and verification.

## Build the program

1. Inventory candidate work and dependencies.
2. Close or discard superseded items only when authorized.
3. Convert remaining work into bounded streams with explicit completion conditions.
4. Identify shared files, ordering constraints, and safe parallelism.
5. Assign a worktree and branch to each implementation stream.
6. Record checkpoints before execution begins.

## Run each stream

For every stream:

1. Delegate bounded work with `$delegate-codex-implementation` when appropriate.
2. Inspect the diff and run required checks.
3. Request `$delegate-codex-review` for an independent pass when risk warrants it.
4. Use `$delegate-codex-computer-use` for real UI or runtime confirmation.
5. Pause for required human, CI, product, rebase, merge, or release decisions.
6. Update remaining streams after each accepted checkpoint.

## Parallelism rules

- Parallelize streams only when their files and state transitions do not materially overlap.
- Serialize schema migrations, generated artifacts, shared configuration, and dependent PRs.
- Rebase and revalidate after upstream merges.
- Limit active streams to what the supervisor can review responsibly.

## Authority rules

Do not infer permission to commit, push, merge, close PRs, deploy, or mutate production. Record the user's granted authority explicitly and stop at any boundary not covered by it.

## Status format

Maintain a concise ledger with:

- stream and owner;
- branch or worktree;
- current state;
- latest evidence;
- next checkpoint;
- blockers or decisions required.

Completion means every stream has passed its required checkpoints, not merely that delegated agents stopped running.
