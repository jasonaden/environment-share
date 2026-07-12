# Testing Cmux agent workflows

Use this guide to test the installed Pi profiles, native Cmux teams, and the
custom read-only heterogeneous runner in increasing order of cost and side
effects.

## Safety labels

| Label | Meaning |
|---|---|
| No model | Does not start an agent provider session or incur model usage. |
| Model usage | Starts one or more provider sessions; review the provider count and expected cost first. |
| No Cmux mutation | Reads configuration or runs isolated local fixtures only. |
| Owned Cmux mutation | Creates only run-owned workspaces/groups and private state, then removes the recorded UUIDs. |
| Repository read-only | Agents may inspect only the selected clean, secret-free Git worktree and must not change it. |

The custom v1 runner refuses write-capable workers, browser mutation, remote or
cloud workers, global configuration edits, application restart, and automatic
provider resume. Do not weaken those checks to make a test pass.

## 1. Install and preflight

Risk: **No model**. The installer changes reviewed user-level Cmux/agent files;
use `--dry-run` first when testing installation itself.

```bash
./pi/install.sh
./cmux/install.sh --dry-run
./cmux/install.sh
./just/install.sh
```

Open a new zsh terminal after the first install, then verify the launcher and
planning prerequisites:

```bash
command -v cmux-team
cmux-team doctor
```

From a terminal surface inside Cmux, gate only the harnesses you intend to use:

```bash
cmux-team doctor --require-launch --harness codex --harness pi
cmux-team doctor --require-launch --harness claude
```

Expected result: `plan ready: True`; the in-Cmux command should also report
`launch ready: True`. Authentication checks reveal only bounded status signals,
never credential contents.

## 2. Run deterministic checks

Risk: **No model** and **No Cmux mutation**. These commands use local fixtures
and temporary directories; they do not apply installers to the home directory.

```bash
python3 evals/cmux-agent-orchestration/validate_evals.py
python3 -m unittest discover -s evals/cmux-agent-orchestration/tests -p 'test_*.py'
python3 -m unittest discover -s agent-catalog/tests -p 'test_*.py'
bash pi/tests/run.sh
bash tests/installers/run.sh
bash cmux/tests/run.sh
```

Expected result: 31 source prompts, 16 eval families, and all runner, catalog,
Pi, managed-installer, and Cmux-installer checks pass.

## 3. Try the Pi profiles

Risk: **Model usage**. Mutation scope depends on the selected profile.

```bash
j pi-review
j pi-plan
j pi-focus
j pi-team
```

- `pi-review` is ephemeral and read-only, with guarded `read`, single-file
  `grep`, and `ls` only.
- `pi-plan` begins read-only and requires an explicit opt-in before execution.
- `pi-focus` asks for a singular purpose and keeps it visible during the session.
- `pi-team` enables isolated subagents and the guarded `/ship` workflow. Start
  with `/ship <objective>`, inspect the plan, and use `/ship-approve` only when
  you intend to enter its implementation phase.

See [../pi/README.md](../pi/README.md) for the complete permission and workflow
boundaries.

## 4. Try native homogeneous teams

Risk: **Model usage** and native Cmux split creation. Run these from a Cmux
terminal and exit the root agent normally when finished.

```bash
cmux codex-teams
cmux claude-teams
```

Use native teams when every worker uses the same harness. Ask the root agent for
a small read-only repository task that benefits from a subagent, then verify the
subagent appears as a native Cmux split. Do not add bypass or dangerous-mode
flags for a smoke test.

## 5. Plan a heterogeneous fleet

Risk before launch: **No model** and **No Cmux mutation**.

Choose a clean, secret-free Git worktree. Do not use a repository containing
credentials, sensitive untracked files, special filesystem nodes, or tracked
submodules. Render the reviewed three-harness profile into temporary contracts:

```bash
cmux-team render \
  --team research-triad \
  --repository /absolute/path/to/clean-repository \
  --task-id read-only-smoke \
  --instructions 'Inspect the repository read-only and report one implementation fact with exact file evidence.' \
  --criterion 'Every finding cites a path that the lead can verify.' \
  --output-dir /private/tmp/cmux-team-read-only-smoke

cmux-team validate \
  --manifest /private/tmp/cmux-team-read-only-smoke/team.json \
  --task /private/tmp/cmux-team-read-only-smoke/task.json

cmux-team plan \
  --manifest /private/tmp/cmux-team-read-only-smoke/team.json \
  --task /private/tmp/cmux-team-read-only-smoke/task.json
```

Read the complete plan. It names the canonical repository, private state root,
provider sessions, variable-cost warning, permissions, mutations, cleanup, and
an approval digest. Any contract, catalog, or state-root change invalidates that
digest and requires a new plan.

## 6. Launch, review, and clean up

Risk: **Model usage**, **Owned Cmux mutation**, and **Repository read-only**.
Launch only after explicitly accepting the exact plan digest and provider count.
Run the launch and cleanup mutations from a Cmux terminal under `cmuxOnly`:

```bash
cmux-team launch \
  --manifest /private/tmp/cmux-team-read-only-smoke/team.json \
  --task /private/tmp/cmux-team-read-only-smoke/task.json \
  --approved-digest sha256:<digest-from-plan> \
  --execute

cmux-team status --run <run-id>
cmux-team collect --run <run-id>
cmux-team stop --run <run-id> --execute
```

Expected success requires all of the following:

1. Every worker has an exit record and a schema-valid result.
2. The shared checkout fingerprint is unchanged.
3. Collection reports no missing, invalid, failed, or contaminated workers.
4. The event monitor is healthy and no reconciliation is required.
5. The lead independently verifies cited evidence; `needs_review` is the normal
   strongest automatic disposition, not a failure.
6. Stop closes only UUIDs recorded in the run ledger and preserves every
   pre-existing workspace.

Do not use `--force` merely to speed up a normal run. It is reserved for an
explained decision to interrupt workers that have not produced exit records.

## Troubleshooting

- `cmux-team: command not found`: open a new zsh terminal or source the shell rc
  path printed by `./cmux/install.sh`.
- Doctor refuses a version: update the reviewed repository pins, adapter help
  expectations, fixtures, and evals intentionally; do not bypass the check.
- Planning rejects a repository: move the test to a clean, bounded,
  secret-free Git worktree instead of weakening validation.
- `invalid_result`: inspect the worker's private run artifacts; the runner
  intentionally does not repair malformed model output.
- `cleanup_incomplete` or reconciliation required: compare the recorded UUIDs
  with `cmux tree --all --json` and follow the recovery rules in
  [operations.md](../agent-skills/cmux-orchestrate-agents/references/operations.md).

The architecture, recorded live acceptance, and remaining gated tests are in
the [implementation proposal](../docs/plans/2026-07-10-cmux-agent-orchestration-skills-proposal.md).
