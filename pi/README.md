# Pi coding agent environment

This directory installs a curated Pi environment for someone who also uses Claude Code and Codex. It keeps ordinary sessions small, exposes stronger safety profiles explicitly, and makes multi-agent orchestration opt-in.

## Install

```bash
./pi/install.sh
./just/install.sh
```

The installer:

- installs the pinned `@earendil-works/pi-coding-agent@0.80.6` package without lifecycle scripts;
- prefers `PI_NODE_BIN_DIR` (default `~/.local/share/pi-node/current/bin`), then a supported PATH or standard Homebrew Node toolchain; every accepted source toolchain must provide both Node and npm from the same directory, and the selected pair is persisted beside Pi under `PI_NODE_BIN_DIR` for later child installers;
- supports Node major 22 with minor 19 or later; Node 23+ is outside the reviewed automation range;
- recursively merges only settings declared in `pi/settings.json`, preserving Pi- and user-owned fields and additional skill paths;
- refuses both valid and dangling `settings.json` symlinks instead of severing them; update the referent explicitly before retrying;
- creates timestamped `*.backup.<UTC timestamp>` copies before changing existing settings, prompts, agents, or extensions;
- installs the matching pinned upstream permission, protected-path, handoff, and plan-mode extensions;
- installs the optional purpose, subagent, and guarded ship workflows;
- does not read or modify credentials, saved sessions, or saved per-project trust records.

Set `PI_CODING_AGENT_DIR` to install configuration into a custom Pi root. That changes the settings, prompts, agents, extensions, and Cmux-hook destination; it does not by itself change where the Pi executable is installed. Set `PI_NODE_BIN_DIR` for a custom stable Pi/Node/npm bin directory. If that directory does not yet contain a supported toolchain, the installer selects a reviewed PATH/Homebrew Node 22 source, links Node/npm into the stable directory without replacing conflicts, and installs Pi into its parent prefix.

Start Pi and run `/login` once. The default is `openai-codex/gpt-5.5` with medium thinking. Review current model IDs with `/model` because provider catalogs change.

## Profiles

| Command | Intended use | Mutation surface |
|---|---|---|
| `j pi` | Normal interactive work | Standard Pi tools with dangerous-command and protected-path guards |
| `j pi-plan` | Explore, produce a plan, then explicitly opt into execution | Write/edit disabled and Bash allowlisted during planning |
| `j pi-review` | Ephemeral code or change review | Guarded `read`, single-file `grep`, and `ls`; no Bash, writes, discovered extensions, skills, prompt templates, themes, or context files |
| `j pi-focus` | Long task with a visible singular purpose | Normal profile plus purpose gate |
| `j pi-team` | Isolated agents and the guarded `/ship` workflow | Parent orchestrates; subprocess agents do delegated work |
| `j pi-clean` | Diagnose Pi without custom resources | Core Pi only, project resources ignored |

None of these profiles is an operating-system sandbox. Read tools retain the launching user's read access, and normal Pi runs with the user's permissions. Use a container or VM for untrusted repositories, unattended production work, or sensitive credentials.

`j pi-review` intentionally ignores both project-local and user-level customization. Pass needed context explicitly in the review prompt instead of loading repository instructions or extensions.

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
- all subagent discovery is forced to the user-level `~/.pi/agent/agents` directory;
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

The guard advances only after successful subagent tool results and enforces the sequence itself. A reviewer must end with exactly one standalone verdict:

```text
SHIP_REVIEW_VERDICT: PASS
```

or:

```text
SHIP_REVIEW_VERDICT: FINDINGS
```

`PASS` completes the workflow. An initial `FINDINGS` verdict unlocks exactly one corrective worker, which must be followed by a final reviewer. A final `FINDINGS` verdict records the remaining risk and completes the bounded workflow without unlocking a third worker. Failed workers and reviewers retry their current stage; missing or ambiguous verdicts are rejected. The parent session remains unable to mutate files directly while `/ship` is active.

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

The team profile defaults to user-level agents from `~/.pi/agent/agents`, and the guarded `/ship` workflow forces that scope:

- `scout` — focused read-only reconnaissance;
- `planner` — evidence-grounded implementation planning;
- `reviewer` — independent read-only review;
- `worker` — bounded implementation and verification.

The standalone upstream subagent tool can still request project-local `.pi/agents` explicitly, subject to its confirmation behavior. `/ship` overwrites such requests with `agentScope: "user"`, so repository-controlled agents cannot replace its guarded worker or reviewers.

## Security model

The profiles map loosely to the safety levels discussed in IndyDevDan's Pi material:

- normal `j pi`: a light command gate and path protection, suitable as a local-development floor;
- `j pi-plan`: default-deny Bash allowlist while planning;
- `j pi-review`: no arbitrary Bash and no mutation tools;
- `/ship`: parent mutation disabled, bounded worker loop, and explicit human approval.

The permission gate is deliberately not described as comprehensive protection. Bash can express destructive behavior in many forms, extensions execute with full user access, and project trust controls resource loading rather than operating-system permissions.

## Updating

The package version is deliberately pinned near the top of `pi/install.sh`. To update:

1. Change `PI_CODING_AGENT_VERSION` intentionally.
2. Review the permission, protected-path, handoff, plan-mode, and subagent examples bundled with that version.
3. Run the checks without invoking a model or touching live Pi configuration:

```bash
bash ./pi/tests/run.sh
```

4. Re-run the installer:

```bash
./pi/install.sh
```

This installs the pinned version and refreshes the reviewed upstream examples. Repository-owned settings are merged; other changed destination files are replaced only after a timestamped backup is created.
