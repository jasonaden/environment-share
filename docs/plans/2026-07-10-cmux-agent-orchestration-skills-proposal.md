# Cmux Multi-Agent Orchestration Skills Proposal

**Date:** 2026-07-10
**Status:** Approved; read-only v1 is implemented, structurally verified, installed locally from this repository, and live-accepted for a Codex + Pi fleet; Claude/native-team and resilience acceptance remain gated
**Target:** Jaden's macOS `environment-share` setup using Cmux, Codex, Claude Code, and Pi

## Executive summary

Adopt the video's core idea, but do not port the companion repository as production infrastructure.

The durable idea is that Cmux should be the visible, programmable control plane around agent CLIs:

1. Agents and their subagents should be addressable, observable terminal processes.
2. Completion signals should wake an orchestrator; they should not be treated as proof of success.
3. Repeated team startup should compile from a declarative manifest, not from ad hoc pane creation.
4. Every run should leave enough structured evidence to improve prompts, roles, and skills.

The recommended implementation is:

- Keep the current safe Cmux socket policy, `cmuxOnly`.
- Prefer Cmux's native `codex-teams` and `claude-teams` launchers for homogeneous teams.
- Use one custom skill, `cmux-orchestrate-agents`, only for heterogeneous read-only fleets drawn from Codex, Claude, and Pi.
- Depend on a pinned subset of the current official Cmux skills rather than copying the companion repo's vendored skills.
- Default to three focused agents, hub-and-spoke communication, and plan-first approval.
- Use one Cmux workspace group per team and one workspace per independently monitored agent.
- Reserve separate git worktrees for a later write-capable phase; v1 does not launch writers.
- Adapt the companion repo's 31 tutorial prompts into a staged acceptance-test suite for the few production skills we build; do not install each prompt as a separate skill.

This preserves the useful principles from IndyDevDan's video while correcting the repo's state, event-correlation, isolation, and security weaknesses.

## Sources reviewed

- [IndyDevDan video: SEE CMUX SOLVE Multi-Agent Orchestration](https://www.youtube.com/watch?v=WAFUMBLOjHo), including the complete auto-generated transcript.
- [Companion repository](https://github.com/disler/learning-cmux-with-agents), local snapshot `6eaacab` from 2026-06-29.
- [Official Cmux repository](https://github.com/manaflow-ai/cmux), including current CLI help, agent hooks, Feed, notifications, and events documentation.
- [Current official Cmux skills](https://github.com/manaflow-ai/cmux/tree/main/skills), which have already diverged from the companion repo's vendored set.
- The installed local CLIs and safe, non-secret configuration state.
- The existing [agent-team design brief](../ideas/agent-teams-enterprise-best-practices.md), especially its plan-first, three-agent, focused-role, and file-ownership recommendations.

## What the video gets right

The video evaluates Cmux against three problems rather than adopting it for novelty:

1. **Programmatic access:** the orchestrator can create, address, send to, read, and close real terminals.
2. **Visibility for improvement:** the user can inspect the exact agent journey instead of accepting a black-box result.
3. **Fast repeated startup:** declarative layouts and task-runner recipes make the thousandth team launch cheap.

Its four-verb loop is the correct primitive:

```text
create/identify -> send -> read/verify -> close/reassign
```

The video also makes a useful distinction between organizational hierarchy and communication topology: an orchestrator, leads, and specialists can exist without making peer communication technically impossible.

## Why the companion implementation should remain a learning fixture

The repository is an excellent capability map and teaching artifact. Its production mechanics are not yet safe enough to copy.

### Contract drift

The repository contains two separate launch paths:

- a natural-language `/spawn-fs-team` path that writes a roster; and
- a Python/layout fast path that writes a different spawn file.

The fast path does not create the roster that the lead prompt expects. Models, roles, layout, state, and event behavior are duplicated across scripts and prompts, so they can drift independently.

### Event ambiguity

The prompt library uses multiple completion contracts: `agent.hook`, `notification.created`, and `notification.requested`. Some examples correlate by `surface_id`; newer material notes that hook notifications may only provide `workspace_id`.

All five demo agents run inside one workspace. A workspace-only event cannot identify which worker finished. Some listeners are also started after dispatch, leaving a missed-event race.

### Unsafe durable identity

The repository persists short refs such as `surface:7`. Those refs are convenient but can renumber. Durable state must record UUIDs and refresh current refs before every mutation.

### No multi-team isolation

Sibling teams share one checkout, `.team/plan.md`, `.team/backlog.md`, role-note files, ports, and database. Concurrent teams can overwrite both coordination state and source code.

### Weak success semantics

The demo uses terminal sentinels and notifications as completion signals. A sentinel can already appear in scrollback because it was included in the prompt, and a notification can mean refusal, failure, or a question. Neither is proof that acceptance criteria passed.

### Broad permissions and credentials

The examples commonly use dangerous bypass modes, an outside-Cmux `allowAll` socket, and a workspace-wide `.env`. That is reasonable for a tightly controlled demo, not as a global default.

### Demo coupling

The implemented five-agent team is specifically a Pi-based Flotion team with hard-coded roles, model IDs, ports, stacks, and `FLOTION-DONE` output. Codex appears in tutorial fleets but is not a first-class launch adapter in the implemented team.

## Current machine baseline

| Component | Current state | Implication |
|---|---|---|
| Cmux | `0.64.17 (97)` at `/opt/homebrew/bin/cmux` | Matches the companion's tested version and includes newer native team launchers. |
| Cmux socket | `automation.socketControlMode = "cmuxOnly"` | Keep this as the safe default; root fleet runners should execute inside Cmux. |
| Session resume | `terminal.autoResumeAgentSessions = false` | Keep manual until resume behavior is deliberately tested. |
| Codex | `0.144.0-alpha.4`, bundled with the Codex desktop app | Multi-agent support is enabled; Cmux Codex hooks are already installed and trusted. |
| Claude Code | `2.1.197` at `/opt/homebrew/bin/claude`; the in-Cmux launch doctor reports a positive authentication signal and all required flags | Cmux has a native `claude-teams` wrapper. Authentication and adapter preflight pass; a paid Claude provider call and native-team lifecycle still require explicit live acceptance. |
| Pi | `0.80.6` at the default `~/.local/share/pi-node/current/bin/pi`; local auth-file provider keys are present; an approved `openai-codex/gpt-5.4` worker call passed | Keep automated v1 workers read-only. A custom executable is eligible only from a supported installer root or `PATH` location with a reviewed sibling Node. |
| Read helpers | ripgrep `15.1.0`; fd `10.4.2` | Keep the Pi worker's run-private tool shim on these exact reviewed binaries. |
| Node | major 22, minor 19 or later | This is a bounded compatibility range, not “22.19 or any newer major”; Node 23+ is unreviewed. |
| `just` / `uv` / `jq` | Installed | Suitable for launch recipes, a dependency-free Python runner, and JSON inspection. |
| Official Cmux skills | Pinned selected subset installed for Codex and Claude | Update only through the locked installer and reviewed-version flow. |
| Codex hooks | Present in `~/.codex/hooks.json` | Reuse them; do not build duplicate Codex notification/session hooks. |
| Pi Cmux hook | Installed at `~/.pi/agent/extensions/cmux-session.ts` on 2026-07-11 | Use the official lifecycle/session integration; do not build a duplicate. |

The launch environments differ:

- A normal login shell resolves Cmux, Claude, Pi, and task-runner tools.
- Codex is currently app-bundled and is not on the normal shell `PATH`.
- The Codex desktop sandbox does not participate in the Cmux hook/control plane because it has no `CMUX_SURFACE_ID`.

The implemented installer and launcher provide stable command paths so terminal recipes can treat all three harnesses uniformly without weakening version checks.

### Current rollout boundary

The repository implementation, source wrapper, validators, and installer tests pass. The custom skill, selected official Cmux skills, shared catalog, `cmux-team` launcher, native Pi hook, pinned Claude status line, and guarded global `pi-review` recipe are installed in their live home-directory destinations. An approved Codex + Pi read-only fleet smoke test now passes, and a separate in-Cmux Claude launch doctor passes. Claude paid-provider/native-team acceptance, Pi native resume metadata, and injected live failure cases remain explicit gates rather than implied by those results.

### Recorded live acceptance

Run `20260711-230208-openai-pi-verify-92f88090`, bound to approval digest `sha256:38560e955f4c4256307acc07e00a55f592b7bb96d1414a52a640ebdd9ef44aae`, exercised one default Codex worker and one Pi worker using `openai-codex/gpt-5.4` against a clean `main` checkout.

- The launch doctor ran inside Cmux with only the selected `codex` and `pi` harnesses and reported `launch ready: True` under `cmuxOnly`.
- A separate no-cost in-Cmux Claude doctor reported a positive authentication signal, the reviewed `2.1.197` binary and required flags, and `launch ready: True`; no Claude provider session was started.
- The listener acknowledged readiness before provider release. The runner created one control workspace, one group, and two worker workspaces with recorded UUIDs.
- Both providers exited `0`, returned schema-valid `completed` results, reported `changed_files: []`, and received the expected automatic `needs_review` disposition.
- The stricter Pi final-output instruction produced one valid RFC 8259 result; malformed output remains fail-closed and is never repaired.
- Collection reported no missing, invalid, or non-successful workers; a healthy monitor; no reconciliation requirement; and an unchanged shared-checkout fingerprint (`a3644eb59c761b6ecb238bdf215b7555f4bdc42f0e08a97c779b774add5ff209`).
- Lead review and an independent audit verified both cited facts against `pi/optional-extensions/purpose-gate.ts`, `pi/README.md`, and `pi/install.sh`.
- Non-forced teardown closed the control and both worker UUIDs, ungrouped the owned group, found the generated anchor already absent, and left the exact same eight pre-existing workspace UUIDs present.

This accepts the Codex and Pi adapters plus the happy-path heterogeneous lifecycle. It does not live-accept the Claude adapter, native homogeneous team launchers, Pi resume behavior, three-worker result fan-in, or injected recovery/failure cases.

## Recommended operating architecture

```text
User
  |
  +-- Codex desktop: research, planning, proposal review, manifest authoring
  |       (outside Cmux; no direct fleet mutation under cmuxOnly)
  |
  +-- Cmux control workspace
          |
          +-- native homogeneous mode
          |     +-- cmux codex-teams
          |     +-- cmux claude-teams
          |
          +-- heterogeneous fleet mode
                +-- team workspace group
                      +-- lead/orchestrator workspace
                      +-- Codex worker workspace
                      +-- Claude worker workspace
                      +-- Pi worker workspace
                      +-- optional verifier/browser workspace or sidecar pane
```

The Codex desktop app remains valuable as the planning and review surface. With `cmuxOnly`, the process that mutates Cmux should run inside a Cmux terminal. A reviewed fleet manifest is the handoff between those surfaces.

Do not enable `allowAll` merely to let the desktop app operate the socket. If outside-Cmux control becomes important later, test Cmux's password mode as a separate, explicitly approved security profile.

## Three execution modes

### 1. Native Codex team

Use `cmux codex-teams` when Codex and its own subagents can solve the task. The installed launcher:

- runs a private Codex app server;
- renders Codex subagents as native Cmux splits up to depth two; and
- bridges real approval requests to Cmux Feed.

This should be the default for Codex-only delegation. A custom terminal protocol would discard useful harness semantics.

### 2. Native Claude team

Use `cmux claude-teams` for Claude's native teammate mode. Cmux supplies the compatibility layer that turns teammate panes into native Cmux splits.

This should replace the current repository assumption that Claude teams require a separately installed tmux.

### 3. Heterogeneous fleet

Use the custom skill only when there is a reason to combine harnesses, such as:

- independent model/harness comparison;
- a race for the first verified answer;
- cross-checking architecture, security, or tests;
- using a Pi specialization alongside Codex or Claude; or
- a role catalog that deliberately routes work across providers.

Default to three agents. Scale beyond that only when tasks are independently parallel and the expected gain exceeds coordination and token cost.

## Topology recommendation

### Default: workspace group per team, workspace per agent

Use a Cmux workspace group as the visual team boundary. Give every independently monitored agent its own workspace.

Benefits:

- hook events can be correlated reliably by workspace UUID;
- each agent gets independent status, progress, notifications, cwd, and resume metadata;
- the user can collapse the entire team in the sidebar;
- browser or log panes can still live beside an agent in its own workspace; and
- cleanup can close only the workspaces owned by the run.

### Optional compact mode: panes inside one workspace

Keep the video's lead-left/workers-right layout as a manual or small-team view. Do not use workspace-only hook events to attribute individual workers in this topology. Compact mode needs a separate per-task rendezvous or structured completion channel.

## Skill dependency strategy

The companion repository's vendored skills are already stale. Current official skills live in the [`skills/` directory of `manaflow-ai/cmux`](https://github.com/manaflow-ai/cmux/tree/main/skills).

Pin and install this initial subset:

| Skill | Purpose |
|---|---|
| `cmux` | Core window, workspace, pane, surface, focus, move, and routing operations. |
| `cmux-workspace` | Caller-scoped workspace automation, additive panes, input, and sidebar metadata. |
| `cmux-diagnostics` | Read-only socket, hook, settings, resume, and binary health checks. |
| `cmux-browser` | Cmux's embedded browser only; keep separate from Codex Browser or Chrome control. |
| `cmux-markdown` | Live-rendered plans and evidence beside fleet terminals. |

Optional later:

- `cmux-settings` or `cmux-customization` only when a separately approved configuration change is required;
- a custom sidebar only when native group/status/feed surfaces prove insufficient.

Do not initially install:

- configuration/customization skills as an implicit dependency of normal fleet runs; or
- remote/cloud-specific skills unless those capabilities become an explicit, gated requirement.

Pin an upstream commit in `environment-share` and update intentionally. Do not track upstream `main` invisibly, and do not fork generic Cmux knowledge into our custom skill. The implemented lock targets Cmux v0.64.17 commit `9ed29d81a39de3ba44e0654bbcf6bf67ca86d1fb`.

The runner also requires the exact reviewed Codex `0.144.0-alpha.4`, Claude Code `2.1.197`, Pi `0.80.6`, ripgrep `15.1.0`, and fd `10.4.2` versions. A version update is an intentional flow: change the relevant pin and reviewed-version matcher, compare the new help surface and generated adapter arguments, update fixtures/evals, and run an explicitly approved read-only smoke test. Do not let a package-manager upgrade silently redefine the trusted baseline.

## One custom skill: `cmux-orchestrate-agents`

Implemented trigger description:

> Plan, launch, monitor, collect, and safely stop observable heterogeneous multi-agent work in Cmux. Use when two or more of Codex, Claude, and Pi must collaborate or compare results in visible terminals, or when a requested mixed fleet must be refused at the v1 safety boundary. Do not use for a single provider, one terminal action, or homogeneous Codex/Claude teams; route those to their direct or native Cmux features.

The implemented v1 lifecycle is:

```text
validate -> plan -> approve exact digest -> launch (listener before provider dispatch) -> status/observe -> collect -> lead verification -> stop
```

Recovery and reconciliation are manual v1 procedures based on the private run ledger and `cmux tree`; there is no provider-resume or automatic-reconcile command. The skill does not duplicate general Cmux command documentation.

### Implemented skill anatomy

```text
cmux-orchestrate-agents/
├── SKILL.md
├── agents/
│   └── openai.yaml
├── scripts/
│   ├── cmux_team.py
│   └── pi-repository-guard.ts
└── references/
    ├── manifest.md
    ├── operations.md
    ├── providers.md
    ├── result.schema.json
    ├── task.schema.json
    └── team-spec.schema.json
```

The reusable role and team profiles live separately under `agent-catalog/`, where they can be validated and installed without turning profile data into skill assets.

### Deterministic runner

The dependency-free Python runner owns fragile lifecycle mechanics. The source checkout exposes it through a stable wrapper:

```bash
./cmux/cmux-team doctor
./cmux/cmux-team validate --manifest team.json --task task.json
./cmux/cmux-team plan --manifest team.json --task task.json
./cmux/cmux-team render --team research-triad --repository /absolute/repo --task-id research-task --instructions "Inspect without changes." --output-dir /private/tmp/cmux-team-contracts
./cmux/cmux-team launch --manifest team.json --task task.json --approved-digest sha256:<digest-from-plan> --execute
./cmux/cmux-team status --run <run-id>
./cmux/cmux-team collect --run <run-id>
./cmux/cmux-team stop --run <run-id> --execute
```

The installer also places `cmux-team` in `CMUX_AGENT_BIN_DIR` (default `~/.local/bin`) and atomically adds that directory to new zsh terminals' `PATH`; an installed skill can fall back to resolving `scripts/cmux_team.py` relative to its own `SKILL.md`, never the target repository. Plan prints the resolved private state root and a digest over the normalized manifest, task, resolved roles, and that exact state root; launch requires the approved digest, so changing `CMUX_AGENT_STATE_HOME` requires replanning. Launch dispatches every worker after the event listener is acknowledged, so v1 has no separate `dispatch` or `wait` command. The lead chooses team composition and synthesizes results; the runner handles quoting, stable IDs, private state, event cursors, timeouts, scoped cleanup, and rollback.

### Read-only doctor

`doctor` reports without exposing credential contents:

- Cmux, Codex, Claude, and Pi command paths and versions;
- required Cmux help-token probes, socket reachability when inside Cmux, and plan/launch readiness;
- current socket and automatic-resume settings;
- bounded, non-secret Codex/Claude CLI authentication status, Pi auth-file presence, and hook signals (honoring custom config roots); and
- the private state root and its mode when present.

Provider versions and readiness signals do not replace a reviewed `--help` comparison and explicitly approved live smoke test after an update. The official skill pin remains authoritative in `cmux/upstream-skills.lock.json`.

## Declarative team manifest

One manifest is the source of truth for displayed metadata and real launch commands. The lead remains the invoking process and is not duplicated inside the manifest.

Implemented v1 shape:

```json
{
  "schema_version": 1,
  "name": "auth-review",
  "mode": "heterogeneous",
  "topology": "workspace-group",
  "repository": "/absolute/path/to/repo",
  "git_strategy": "shared-read-only",
  "workers": [
    {
      "id": "architecture",
      "harness": "claude",
      "role": "architecture-reviewer",
      "assignment": "Map boundaries, coupling, and architectural risk.",
      "permission_profile": "read-only"
    },
    {
      "id": "verification",
      "harness": "codex",
      "role": "test-verification-reviewer",
      "assignment": "Assess tests, failure paths, and verification gaps.",
      "permission_profile": "read-only"
    },
    {
      "id": "independent",
      "harness": "pi",
      "role": "independent-researcher",
      "assignment": "Challenge assumptions and identify missed risks.",
      "permission_profile": "read-only"
    }
  ],
  "timeouts": {
    "ready_seconds": 60,
    "task_seconds": 1800,
    "stop_seconds": 15
  }
}
```

Do not hard-code model IDs in the global skill. A profile may name a model explicitly when the user chooses one; otherwise the provider adapter should preserve the harness default.

The adapters encode reviewed argument arrays for the recorded provider baseline. After any provider version change, compare the installed `--help` surface with the adapter and run an approved read-only smoke test; never add a dangerous fallback flag. The companion's Codex `--full-auto` and fixed-model guidance is stale relative to the installed CLI.

## Run state and stable identity

Store runtime state outside the repository. `CMUX_AGENT_STATE_HOME` is the explicit state root when set; otherwise use `$XDG_STATE_HOME/cmux-agent-teams`, falling back to `~/.local/state/cmux-agent-teams`:

```text
<state-root>/<repo-id>/<run-id>/
├── manifest.json
├── task.json
├── run.json
├── topology.json
├── capabilities.json
├── journal.jsonl
├── events.seq
├── events.filtered.jsonl
├── workers/<worker-id>/
│   ├── ready.json
│   ├── exit.json
│   ├── result.json
│   └── raw-output.log
├── collection.json           # created by collect
└── cleanup.json              # created by rollback or stop
```

Record:

- run, task, and worker IDs;
- owned control, group, proven group-created anchor, and worker workspace UUIDs plus display refs when returned;
- harness, role, repository, permission profile, and provider binary path;
- baseline and per-worker checkout-integrity fingerprints;
- readiness, provider exit, timeout/output-limit, schema, and final disposition state; and
- every resource the run owns and may safely close.

Use UUIDs for mutations. Treat short refs and names as display-only.

The resolved state root and canonical Git root must not contain one another. This prevents fleet state from contaminating the checkout fingerprint and prevents a repository from enclosing private orchestration state.

## Completion protocol

Use layered evidence:

1. Start the reconnectable event listener before launch dispatches workers.
2. Treat an agent/notification event as a doorbell.
3. Correlate it to a worker by stable workspace/session identity.
4. Read the terminal or provider result once.
5. Require a structured result artifact for task status.
6. Run the task's verifier or acceptance checks.
7. Only then mark the task successful.

An event means "inspect this worker," not "the work passed."

Avoid screen-grepping for a completion token that also appears in the prompt. If a task needs deterministic signaling, have the worker write a schema-validated result with a unique `run_id` and `task_id`, or use a task-specific Cmux rendezvous token plus independent artifact verification.

Use a durable cursor file and mark event-stream resume gaps for manual reconciliation against `cmux tree`, run state, and worker result/exit artifacts. Automatic provider resume remains disabled in v1.

## Git and filesystem isolation

Choose isolation from task semantics. The implemented v1 runner supports only the first row; the remaining rows are roadmap policy, not available launch modes:

| Work type | Default isolation |
|---|---|
| Independent research/review | Shared checkout, read-only agents. |
| One writer plus reviewers | Writer owns the checkout; reviewers stay read-only. |
| Multiple concurrent writers | One git worktree and branch per writer. |
| Same files or tightly coupled change | One writer; parallel agents propose plans/reviews instead of editing. |

Every manifest repository is resolved to the canonical Git top-level before policy or fingerprinting. V1 requires that full root to be stable and secret-free. Validation walks at most 100,000 file/directory names outside `.git`, rejects credential-like names plus FIFOs/sockets/devices, multiply linked regular files, and other special nodes, and fails closed if the scan cannot complete; this is a bounded name/type preflight, not secret-content analysis. The private state root must not overlap the checkout in either direction.

The integrity ledger hashes the raw index plus regular-file/symlink metadata and content directly, with 20,000-path and 128 MiB content ceilings. It never uses `git status` or `git diff`, so local clean/process filters, textconv, hooks, and submodule configuration cannot execute during launch, worker, or collection checks. Tracked submodules remain an explicit v1 refusal.

Every task specifies file ownership. No two agents may concurrently edit the same file. The lead owns integration and never blindly merges agent output.

Per-run coordination state must be namespaced. Do not reuse global `.team/plan.md`, fixed ports, or a shared database across simultaneous teams.

## Permission and secret policy

Define named profiles rather than provider-specific dangerous defaults. Only `read-only` is implemented in the v1 fleet runner:

| Profile | Intended use | Policy |
|---|---|---|
| `read-only` | Research, planning, review, comparison | No writes; no destructive commands. |
| `workspace-write` | Normal implementation in an owned worktree | Writes limited to the worktree; normal approvals or provider auto-review remain active. |
| `external-sandbox` | A separately sandboxed disposable environment | Bypass may be allowed only after explicit user approval and verification of the outer sandbox. |

Rules:

- Never default to Codex or Claude dangerous bypass flags.
- Prefer existing provider logins over API-key injection.
- If a provider requires environment variables, allowlist the minimum variables per worker/trust domain.
- Never enable global `dotenv-load` for unrelated recipes.
- Never print or persist credential values; masked presence checks only.
- Reject a canonical Git root with credential-like path names or an incomplete bounded name scan; do not treat provider path denies as permission to launch against a secret-bearing checkout.
- Close only UUIDs recorded as owned by the run.
- Preserve the current `cmuxOnly` socket mode for the initial implementation.

## Shared agent catalog and communication

Reuse the existing design brief's hybrid catalog model:

- version-control a small approved role catalog;
- let the lead select from that catalog at planning time;
- default to three agents;
- use hub-and-spoke communication by default; and
- permit peer-to-peer communication only when the workflow benefits from debate or direct cross-layer coordination.

Initial reusable team profiles:

1. **Research triad:** three read-only independent analyses, followed by synthesis.
2. **Review triad:** architecture, security/quality, and test/verification reviewers.
3. **Race triad:** identical read-only or patch-proposal task on all three harnesses; first *verified* acceptable result wins.

Validate profile shape, filename/ID agreement, unique worker IDs, harness diversity, and role references with `python3 agent-catalog/validate_catalog.py` before installation or use.

Do not promote the Flotion lead/plan/backend/frontend/test roster into the global catalog. It belongs in the companion repo's demo fixtures.

## Repository integration plan

Use `environment-share` as the version-controlled source of truth, with thin per-agent installation adapters.

Implemented v1 additions:

```text
environment-share/
├── AGENTS.md                         # vendor-neutral repo rules
├── agent-skills/
│   └── cmux-orchestrate-agents/
├── agent-catalog/
│   ├── role.schema.json
│   ├── team.schema.json
│   ├── validate_catalog.py
│   ├── roles/
│   ├── teams/
│   └── tests/
├── cmux/
│   ├── cmux-team
│   ├── install.sh
│   └── upstream-skills.lock.json
├── pi/
│   └── install.sh
└── evals/
    └── cmux-agent-orchestration/
```

Installation exposes the canonical skill to Codex and Claude without maintaining divergent source copies. Pi discovers `~/.claude/skills` by default, so it uses that installation rather than a third copy; `PI_SHARED_SKILLS_DIR` names a different shared-skill root when Pi is configured away from the default.

`CLAUDE.md` is reduced to Claude-specific deltas and delegates the vendor-neutral rules to root `AGENTS.md`, so Pi does not inherit stale Claude-only installation guidance.

### Implemented environment prerequisites

The v1 implementation addresses the bootstrap problems identified by the baseline review:

1. Replaced whole-file Claude and Pi settings installation with owned, merge-based updates plus validation.
2. Removed the stale Claude `teammateMode: "tmux"` assumption and exact legacy broad global allow rules previously owned by this repository.
3. Added fallback resolution for Codex in the ChatGPT bundle. Pi defaults to `PI_NODE_BIN_DIR=~/.local/share/pi-node/current/bin`; its installer can select a reviewed PATH/Homebrew Node 22 source and persists Node/npm plus Pi at that stable prefix so the later Cmux child process can rediscover them. The fleet runner accepts a custom Pi location only when it is discoverable and has a reviewed sibling Node.
4. Pinned the reviewed Pi version and official Cmux skill commit.
5. Kept Cmux configuration edits out of the normal fleet path and backup-first when explicitly requested.

These fixes prevent bootstrap scripts from undoing the Cmux setup. They are implementation facts, not remaining rollout gates.

## Pi integration gate

Pi setup, the `0.80.6` pin, default stable launcher path, and native Cmux hook installation are implemented. `PI_CODING_AGENT_DIR` selects a custom configuration/hook root, `PI_NODE_BIN_DIR` selects the installers' preferred toolchain root, and `PI_SHARED_SKILLS_DIR` overrides Pi's default `~/.claude/skills` discovery destination. The explicitly approved read-only Pi worker smoke test passes. Native-hook acceptance still requires:

1. Verify Pi emits lifecycle/session data only when launched inside a Cmux surface.
2. Confirm Pi resume metadata appears for a real session without enabling automatic resume.

## Rollout phases

### Phase 0: Stabilize and pin

**Status:** repository prerequisites and global rollout complete; Codex + Pi live capability is recorded, while Claude and native-hook fixtures remain gated.

- Wait for Pi setup to complete.
- Repair the existing installer and PATH issues.
- Pin the selected upstream Cmux skills.
- Preserve `cmuxOnly` and manual resume.
- Record versions and capability output in non-secret test fixtures.

### Phase 1: Native team smoke tests

**Status:** pending explicit live-agent approval.

- Run one disposable `cmux codex-teams` session and verify a visible subagent, Feed event, and scoped cleanup.
- Run one disposable `cmux claude-teams` session with the same checks.
- Verify the installed native Pi Cmux extension, then run one Pi session.

No production code changes should be made in this phase.

### Phase 2: Build the custom skill and doctor

**Status:** implemented locally; structural validation and the machine-readable positive/negative routing corpus pass. Fresh-agent trigger forward-testing remains a release check.

- Initialize the skill with `skill-creator` tooling.
- Implement team-spec validation and the read-only doctor.
- Implement stable run state, workspace-group creation, readiness, and scoped teardown.
- Validate the skill structure and forward-test its trigger boundaries.

### Phase 3: Read-only heterogeneous fleet

**Status:** runner and provider adapters are implemented; the two-harness Codex + Pi happy path passes, while Claude, three-worker result fan-in, and injected live failure cases remain gated.

- Exercise the implemented provider adapters.
- Launch the research triad in one workspace group.
- Establish the event listener before dispatch.
- Correlate all three completions and produce one evidence-backed synthesis.
- Inject failure cases: missing provider, auth failure, timeout, Cmux restart, stale ref, and partial launch.

### Phase 4: Safe write workflows

**Status:** future work and explicitly outside v1.

- Add worktree-per-writer support.
- Add file-ownership enforcement and integration handoffs.
- Add verifier commands and diff collection.
- Prove that teardown never closes unrelated user workspaces.

### Phase 5: Browser, review, and resume

**Status:** future gated work; v1 does not mutate browsers or resume providers.

- Add `cmux-browser` verification profiles.
- Turn fleet runs into concise evidence reports.
- Evaluate whether post-run review is frequent enough to deserve a second `review-cmux-agent-run` skill; keep it as a reference/workflow until then.
- Test manual session resume, then explicitly decide whether to enable automatic resume.

### Phase 6: Optional UX

**Status:** future optional work.

- Add a custom sidebar only if the native workspace group, status, progress, logs, notifications, and Feed are insufficient.
- Evaluate password-scoped outside-Cmux control only if desktop orchestration is still desired.

## Validation and eval strategy

Use the companion repo's prompts as a graduated eval corpus, with user prompts separated from hidden assertions. Preserve exact source coverage while deduplicating the 31 prompts into 16 durable capability families:

1. **Tier 0 — static/preflight:** contracts, schemas, capability probes, and safety-decline cases.
2. **Tier 1 — deterministic mechanics:** ephemeral topology, ownership, events, cleanup, and local fixtures.
3. **Tier 2 — read-only live agents:** provider adapters, heterogeneous broadcast, fan-out/fan-in, and native session capture with explicit cost approval.
4. **Tier 3 — integrated UI/browser:** visual, multi-window, and local browser workflows in a dedicated session.
5. **Tier 4 — destructive/external:** restart, real auth, remote/cloud, global config, and write-capable capstones behind explicit gates.

The machine-readable inventory, 16 family cases, 30 variants, 129 assertions, and validator live under `evals/cmux-agent-orchestration/`.

Implemented automated layers:

1. **Structural:** dependency-free eval and catalog validators, strict JSON contracts, shell/Python syntax checks, 75 focused runner tests, 3 catalog tests, 10 Pi workflow tests plus isolated fresh-install/symlink fixtures, the managed-installer safety suite, and the isolated Cmux installer suite.
2. **Deterministic behavior:** manifest/task rejection, provider argument shapes, result extraction, checkout fingerprints, stable-ID parsing, listener ordering, rollback, and scoped-stop guards.

Remaining gated layers:

1. **Behavioral:** fresh-agent should-trigger, should-not-trigger, ambiguous, and safety-decline forward tests beyond the validated eight-case routing corpus.
2. **Provider compatibility:** Codex and Pi pass an approved read-only smoke test, and Claude's installed version, required flags, and authentication pass the launch doctor; Claude's paid live adapter path remains gated.
3. **Integration:** real Cmux topology, collection, and scoped teardown pass for Codex + Pi; resume-gap recovery, partial failure, three-worker fan-in, and Claude integration remain gated.
4. **Forward tests:** fresh agents receive only the skill and raw task, not expected conclusions.

## Read-only v1 release gate

The first release is complete only when all of these are true:

- The selected official skills and custom skill are pinned and reproducibly installed.
- Codex, Claude, and Pi pass read-only doctor checks from a Cmux terminal.
- A three-agent research fleet launches from one manifest into one workspace group.
- Every worker is recorded by stable UUID; display refs are retained when Cmux returns them.
- The listener is active before dispatch and survives reconnects without double-processing.
- Notifications wake the runner, but only structured artifacts and verifiers mark success.
- A partial launch rolls back without touching unrelated workspaces.
- No secret value appears in manifests, logs, terminal reports, or artifacts.
- A finished run can be collected, reviewed, and safely torn down.
- Trigger-boundary and provider-help checks pass on the recorded baseline.

Write-capable worktrees, browser mutation, provider resume, remote/cloud execution, global configuration changes, and application restart remain outside v1 even though future eval definitions exist for them.

## Recorded v1 decisions

These decisions govern the implemented read-only runner; later mutating phases require a new explicit decision:

| Decision | Recommended starting point |
|---|---|
| Canonical source | `environment-share/agent-skills/` with thin installers. |
| Root orchestrator | Select per run; do not hard-code Codex, Claude, or Pi globally. |
| Team size | Three agents. |
| Communication | Hub-and-spoke; peer-to-peer only for a stated reason. |
| Heterogeneous topology | One workspace group per team, one workspace per agent. |
| Socket policy | Keep `cmuxOnly`. |
| Resume | Manual (`autoResumeAgentSessions = false`) until resilience tests pass. |
| Permissions | Read-only only; workspace-write remains future gated work. |
| Models | Provider defaults unless a reviewed team profile names one. |
| Notifications | Keep current policy until native-team and fleet noise are measured. |
| Upstream updates | Pinned commit with intentional review, not floating `main`. |

## Bottom line

Cmux is the right primitive for this machine because it can make agent processes visible, addressable, resumable, and inspectable without replacing each harness's own strengths.

The right implementation is not a larger pile of prompts. It is a small, version-aware control layer:

- current upstream Cmux mechanics;
- native Codex/Claude teams when appropriate;
- one custom cross-harness fleet skill;
- deterministic run state and cleanup;
- least-privilege isolation; and
- an eval loop that turns visible agent behavior into better roles and skills.
