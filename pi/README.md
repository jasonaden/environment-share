# Pi coding agent environment

This directory installs a curated Pi environment for someone who also uses Claude Code and Codex. It keeps ordinary sessions small, exposes stronger safety profiles explicitly, and makes multi-agent orchestration opt-in.

## Install

```bash
./pi/install.sh
./just/install.sh
```

The installer:

- installs the current `@earendil-works/pi-coding-agent` package without lifecycle scripts;
- writes configuration under `~/.pi/agent` while preserving changed targets as `*.backup`;
- installs current upstream permission, protected-path, handoff, and plan-mode extensions;
- installs the optional purpose, subagent, and guarded ship workflows;
- does not modify credentials, trust decisions, or saved sessions.

Start Pi and run `/login` once. The default is `openai-codex/gpt-5.5` with medium thinking. Review current model IDs with `/model` because provider catalogs change.

## Profiles

| Command | Intended use | Mutation surface |
|---|---|---|
| `j pi` | Normal interactive work | Standard Pi tools with dangerous-command and protected-path guards |
| `j pi-plan` | Explore, produce a plan, then explicitly opt into execution | Write/edit disabled and Bash allowlisted during planning |
| `j pi-review` | Ephemeral code or change review | `read`, `grep`, `find`, and `ls` only; no Bash or writes |
| `j pi-focus` | Long task with a visible singular purpose | Normal profile plus purpose gate |
| `j pi-team` | Isolated agents and the guarded `/ship` workflow | Parent orchestrates; subprocess agents do delegated work |
| `j pi-clean` | Diagnose Pi without custom resources | Core Pi only, project resources ignored |

None of these profiles is an operating-system sandbox. Read tools retain the launching user's read access, and normal Pi runs with the user's permissions. Use a container or VM for untrusted repositories, unattended production work, or sensitive credentials.

## Guarded `/ship` workflow

Start the team profile from the repository you want to change:

```bash
j pi-team
```

Then start a workflow:

```text
/ship Replace the deprecated billing client without changing public behavior
```

### Phase 1: scout and plan

`/ship` persists a planning state and instructs Pi to run:

```text
scout -> planner
```

During this phase the extension enforces:

- only `scout` and `planner` subagents may run;
- parent `bash`, `edit`, and `write` calls are blocked;
- a worker cannot run until explicit approval;
- the result must identify scope, exact files, ordered steps, risks, and verification.

Inspect the returned `SHIP PLAN`. Approve or cancel it:

```text
/ship-approve
/ship-cancel
```

`/ship-approve` shows a confirmation dialog. Declining leaves the workflow in planning.

### Phase 2: implement and verify

After approval, the parent orchestrates separate calls:

```text
worker -> reviewer -> optional corrective worker -> final reviewer
```

The guard permits at most two worker calls total. The second worker is blocked unless a reviewer has run first, which bounds the correction loop. The parent session remains unable to mutate files directly; implementation belongs to the isolated worker.

The final response should contain the outcome, changed files, checks, reviewer verdict, and remaining risk. Close the state after accepting the result:

```text
/ship-close
```

Useful diagnostics:

```text
/ship-status
```

Starting another `/ship` offers to replace an active workflow. State is stored in the Pi session and restored when the session is resumed or its tree is navigated.

## Other commands and resources

Normal sessions load:

- `/prime` — build a read-only working map of a repository;
- `/review` — review current changes with evidence;
- `/verify` — turn implementation claims into deterministic checks;
- `/handoff <goal>` — create a focused new session with relevant context;
- `/plan` — toggle the installed plan-mode extension.

The team profile discovers user-level agents from `~/.pi/agent/agents`:

- `scout` — focused read-only reconnaissance;
- `planner` — evidence-grounded implementation planning;
- `reviewer` — independent read-only review;
- `worker` — bounded implementation and verification.

Project-local `.pi/agents` are not enabled by this setup. This avoids executing repository-controlled agent prompts by default.

## Security model

The profiles map loosely to the safety levels discussed in IndyDevDan's Pi material:

- normal `j pi`: a light command gate and path protection, suitable as a local-development floor;
- `j pi-plan`: default-deny Bash allowlist while planning;
- `j pi-review`: no arbitrary Bash and no mutation tools;
- `/ship`: parent mutation disabled, bounded worker loop, and explicit human approval.

The permission gate is deliberately not described as comprehensive protection. Bash can express destructive behavior in many forms, extensions execute with full user access, and project trust controls resource loading rather than operating-system permissions.

## Updating

Re-run:

```bash
./pi/install.sh
```

This updates Pi and refreshes the copied upstream example extensions to the installed version. Locally changed destination files are backed up before replacement.
