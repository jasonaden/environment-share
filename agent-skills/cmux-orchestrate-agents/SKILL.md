---
name: cmux-orchestrate-agents
description: Plan, launch, monitor, collect, and safely stop observable heterogeneous multi-agent work in Cmux. Use when two or more of Codex, Claude, and Pi must collaborate or compare results in visible terminals, or when a requested mixed fleet must be refused at the v1 safety boundary. Do not use for a single provider, one terminal action, or homogeneous Codex/Claude teams; route those to their direct or native Cmux features.
---

# Orchestrate Cmux Agents

Use Cmux as the visible control plane while preserving each harness's native strengths. Route homogeneous teams to native launchers and reserve the custom runner for deliberate cross-harness work.

## Choose the execution mode

1. Use `cmux codex-teams` for a Codex lead with Codex subagents.
2. Use `cmux claude-teams` for a Claude lead with Claude teammates.
3. Use Pi's own subagent workflow for Pi-only delegation. Do not claim its subprocess agents are separate Cmux panes.
4. Use the bundled runner only when two or more harnesses must collaborate or independently compare results.

Do not build a custom terminal protocol for a task that a native team can handle.

The installer places the stable `cmux-team` launcher in `CMUX_AGENT_BIN_DIR` (default `~/.local/bin`) and adds that directory to new zsh terminals' `PATH`. After a first install in an existing terminal, source the shell rc path printed by the installer or open a new terminal. From the `environment-share` source checkout, `./cmux/cmux-team` is equivalent. If neither launcher resolves, invoke `scripts/cmux_team.py` relative to this `SKILL.md`; never resolve it relative to the target repository. The examples below assume the installed launcher.

## Preflight a heterogeneous fleet

1. Read the repository's nearest `AGENTS.md` or `CLAUDE.md`.
2. Keep the invoking agent as lead; do not launch another orchestrator process.
3. Default to three workers and hub-and-spoke communication.
4. Run the read-only doctor:

   ```bash
   cmux-team doctor
   ```

   To gate a launch rather than planning, run `cmux-team doctor --require-launch` from inside Cmux. Use repeated `--harness` options when validating a subset, such as `--harness codex --harness pi`.

5. Create a task and manifest for a stable, secret-free canonical Git root. Read [manifest.md](references/manifest.md) before authoring or changing either contract.
6. Validate and render the exact launch plan:

   ```bash
   cmux-team validate --manifest team.json --task task.json
   cmux-team plan --manifest team.json --task task.json
   ```

7. Present the provider-session count, variable API-cost warning, harnesses,
   canonical repository, private state root, permissions, cleanup scope,
   warnings, and printed approval digest.
   Obtain explicit approval for that exact digest.

## Launch and operate

Run mutations only from a Cmux terminal. Keep `automation.socketControlMode` at `cmuxOnly`.

```bash
cmux-team launch --manifest team.json --task task.json \
  --approved-digest sha256:<digest-from-plan> --execute
cmux-team status --run <run-id>
cmux-team collect --run <run-id>
cmux-team stop --run <run-id> --execute
```

The launcher must establish its event listener before dispatching workers. Treat notifications as doorbells, never as proof of success. Require a provider exit record, a schema-valid result, an unchanged read-only checkout, and lead review before accepting any finding.

Read [operations.md](references/operations.md) before launching, recovering, or stopping a live run. Read [providers.md](references/providers.md) when a provider command or version changes.

## Enforce the v1 safety boundary

- Accept only existing absolute repository paths.
- Resolve the repository to its canonical Git root, require a complete bounded
  credential-like name scan, and reject any overlap with the private state root.
- Require at least two distinct harnesses for the custom runner.
- Allow only `read-only` workers and `shared-read-only` Git strategy.
- Generate provider arguments internally. Reject raw commands, raw flags, environment values, and `.env` files.
- Keep Pi workers on `read`, single-file `grep`, and `ls` with `--no-approve`.
- Apply repository-scoped provider policies: a Codex permission profile, a
  fail-closed Claude read policy, and Pi's trusted path-guard extension.
- Treat Pi's guard and Claude's built-in file-tool policy as application-layer
  controls, not a container boundary; keep tasks secret-free and retain lead review.
- Store run state with private permissions and stable UUIDs.
- Close only UUIDs recorded in the run ledger.
- Never invoke `workspace-group delete`.
- Refuse writes, worktrees, browser mutation, real auth replay, remote/cloud workers, global configuration edits, app restart, and automatic resume in v1. Eval definitions alone do not authorize these capabilities; promotion requires an executable gated eval, explicit authorization, and a recorded pass.

If a request needs any refused capability, produce a plan and identify the unimplemented or unpassed gate instead of weakening the runner.

## Verify and synthesize

1. Collect every worker result; report missing, failed, invalid, or contaminated workers explicitly.
2. Distinguish structural validation from factual verification. A well-formed model answer can still be wrong.
3. Check cited files, commands, and evidence in the lead context.
4. Run deterministic acceptance checks when the task provides them.
5. Synthesize agreements, disagreements, unique findings, and remaining uncertainty.
6. Stop the run with UUID-scoped cleanup. Use `--force` only after explaining why active workers must be interrupted.

End with the outcome, participating harnesses, run ID, evidence reviewed, cleanup status, and unresolved risks.
