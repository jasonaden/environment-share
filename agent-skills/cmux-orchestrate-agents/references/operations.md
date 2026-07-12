# Live fleet operations

## State and ownership

State-root precedence is:

1. `CMUX_AGENT_STATE_HOME` exactly, when set;
2. `$XDG_STATE_HOME/cmux-agent-teams`; or
3. `~/.local/state/cmux-agent-teams`.

Store each run beneath `<state-root>/<repo-hash>/<run-id>/`. The state root and canonical Git root must not contain one another. Use mode `0700` for directories and `0600` for files.

The run ledger owns only:

- one control workspace;
- one workspace group;
- the temporary anchor workspace that Cmux creates with that group, only after
  its creation is proven against the pre-create workspace inventory;
- one workspace per worker; and
- state files beneath the run directory.

Use recorded UUIDs for every mutation. Treat short refs and names as display-only.
Request Cmux output with `--id-format both`. When Cmux acknowledges a create
with only a short ref, resolve one unique UUID from a fresh inventory by the
run-unique name, description, and working directory before recording ownership.

The wrapper removes Cmux caller IDs from every provider subprocess and points `CMUX_SOCKET_PATH` at a nonexistent run-private path. The lead retains Cmux control; model processes do not need it.

## Launch sequence

`plan` canonicalizes the manifest, task, resolved role definitions, and
private state root and prints both the resolved root and a SHA-256 approval digest.
`launch --execute` requires that exact digest; any contract or catalog drift
requires a new plan and approval; changing `CMUX_AGENT_STATE_HOME` also changes
the digest.

Before launch, run `cmux-team doctor --require-launch` inside Cmux. Repeat
`--harness` for the manifest's harness set when validating fewer than all three
providers. Plain `doctor` intentionally gates planning only.

1. Record the baseline Git status and Cmux tree.
2. Create the control workspace and start the event monitor.
3. Wait for the event-stream acknowledgement.
4. Inventory workspace UUIDs, then create a workspace group from the control
   workspace. Require the response to contain exactly the control plus one new
   anchor UUID that was absent from the inventory before recording that anchor
   as run-owned.
5. Make control the group anchor, verify the change, close the temporary
   generated anchor by exact UUID, and verify control is the sole remaining member.
6. Create each worker workspace inside the group.
7. Wait for every wrapper's `ready.json`.
8. Refuse release if monitoring requires reconciliation; otherwise write the
   global topology-release marker. Each wrapper rechecks the launch Git
   fingerprint before making its provider call.
9. Return the run ID and state directory.

Roll back only recorded resources if any step fails. If a create command may
have succeeded but no stable UUID was recorded, mark reconciliation required
and cleanup incomplete instead of claiming rollback succeeded.

## Monitoring and collection

Use `status` for process/result state and `collect` for structured aggregation. The monitor retains only events correlated to recorded workspace UUIDs. Default Cmux heartbeat frames are consumed as a liveness signal but are not retained as fleet events. Provider release and collection fail closed when the monitor process is stopped, exited, or stale. An event wakes inspection; it does not change the worker's disposition.

Collection revalidates the exact result/exit wrapper, bounded UTC timestamps,
provider exit and timeout flags, nested schema status, baseline/worker Git
fingerprints, and the disposition implied by those fields. A self-declared
`needs_review` value cannot override a failed invariant.

Classify results as:

- `failed`: provider exited unsuccessfully or returned a structured `blocked`/`failed` status;
- `invalid_result`: final output failed the result contract;
- `contaminated`: the shared read-only checkout changed;
- `needs_review`: output is structurally valid and the checkout is unchanged.

The lead must fact-check findings and run acceptance checks before calling the task successful.

## Recovery

If Cmux or the lead restarts, load `run.json` and compare recorded UUIDs with
`cmux tree --all --json`. Never guess ownership by workspace name. If an event
cursor reports a replay gap, mark the run for reconciliation and inspect worker
result and exit artifacts directly. Worker and monitor wrappers have durable
once markers: automatic or manual replay is refused in v1.

Automatic provider resume is intentionally disabled in v1.

## Teardown

Refuse to stop workers without `--force` while any worker lacks `exit.json`. When stopping:

1. with `--force`, validate and terminate recorded provider process groups;
2. close recorded worker workspace UUIDs;
3. ungroup the recorded group, preserving all remaining workspaces;
4. idempotently close the proven group-created anchor UUID, if recorded;
5. close the recorded control UUID; and
6. capture the post-cleanup tree.

Never use `workspace-group delete`. Never close a pre-existing or merely
observed anchor. A group-created anchor is closable only when its exact two-member
creation snapshot and absence from the pre-create inventory were recorded.
Never close a UUID absent from the ledger. If any bounded cleanup operation
fails, leave the run in `cleanup_incomplete`.
