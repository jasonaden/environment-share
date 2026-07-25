# Cmux Agent Orchestration Eval Ladder

This directory turns the 31 tutorial prompts from
[`disler/learning-cmux-with-agents`](https://github.com/disler/learning-cmux-with-agents)
into a versioned evaluation corpus. It does **not** install skills, start Cmux,
launch agents, change configuration, or contact external services.

The source inventory is pinned to commit
`6eaacabbee4c71120f7cd161c9539530f84068a8`, whose prompts target Cmux
`0.64.17`. The source files are examples and answer keys, not executable test
cases. These eval definitions preserve their capability coverage while adding
explicit isolation, assertions, cleanup, and safety gates.

## Layout

- `source-prompts.json` records the exact 31 paths and titles plus the purpose,
  primary risk, and automation suitability derived from each prompt.
- `eval.schema.json` is the JSON Schema for an eval-family case file.
- `trigger-cases.json` and `trigger-case.schema.json` cover the skill's positive
  and negative routing boundary, including native Codex/Claude teams.
- `cases/` contains 16 deduplicated eval families. A family may have variants at
  more than one tier.
- `validate_evals.py` performs dependency-free structural validation, checks
  complete prompt coverage, and rejects unsafe gate combinations.

## Tiers

| Tier | Name | Intended execution |
|---|---|---|
| 0 | Static/preflight | Parse manifests and config fixtures; inspect versions and capabilities; never mutate live Cmux state. |
| 1 | Deterministic mechanics | Use ephemeral Cmux resources, deterministic shell workers, local browser fixtures, nonces, and guaranteed cleanup. |
| 2 | Read-only live agents | Exercise provider adapters with real models in a disposable repository; model use and cost must be authorized. |
| 3 | Integrated UI/browser | Run local visual, multi-window, and bounded browser workflows in a dedicated test session. |
| 4 | Destructive/external | Restart Cmux, use real auth, touch global config, reach remote/cloud systems, or run write-capable capstones only with explicit authorization. |

Tier is a risk and fidelity lane, not a strict dependency graph. For example,
native session capture is Tier 2 while full application restart and restoration
is Tier 4.

## Gates

Every gate is opt-in. The validator rejects unknown gates and verifies that
external effects carry their required gates.

| Gate | Authorizes |
|---|---|
| `allow_live_agents` | Starting a real agent CLI or model session. |
| `allow_cost` | Incurring model/API usage cost. |
| `allow_visual` | Opening, focusing, or visually inspecting Cmux UI surfaces/windows. |
| `allow_notifications` | Producing user-visible Cmux/desktop notifications. |
| `allow_agent_cancellation` | Stopping a live agent before it finishes. |
| `allow_writes` | Allowing agents to modify an owned disposable repo/worktree. |
| `allow_restart` | Quitting or restarting the dedicated Cmux application/session. |
| `allow_real_auth` | Capturing or replaying a real authenticated browser session. |
| `allow_remote` | Connecting to or mutating an authorized remote host. |
| `allow_external_network` | Accessing non-local network services. |
| `allow_cloud_cost` | Provisioning or using paid cloud resources. |
| `allow_global_config` | Editing Cmux/Ghostty user-level configuration in a dedicated profile. |
| `dedicated_cmux_profile` | Running with an isolated Cmux/Ghostty configuration and state directory. |
| `dedicated_macos_environment` | Running in an isolated macOS login, VM, or otherwise disposable desktop environment. |

There is intentionally no gate for injecting production secrets. Credential
evals use unique canary values and assert those values never appear in captured
output, logs, artifacts, or reports.

## Execution contract

An eventual runner should obey these rules for every non-static variant:

1. Generate a unique run ID and nonce.
2. Capture the baseline Cmux tree.
3. Create a run-owned workspace group and record stable IDs plus current refs.
4. Start event listeners before dispatching work.
5. Assert structured state, nonces, artifacts, and verifier output instead of
   exact model prose.
6. Clean up only resources in the ownership ledger.
7. Compare the post-run tree with the baseline and prove unrelated resources
   did not change.

The JSON files describe this contract but do not execute it.

## Validation

Run:

```bash
python3 evals/cmux-agent-orchestration/validate_evals.py
```

The validator uses only Python's standard library. It checks:

- the exact `01` through `31` source-prompt inventory;
- exactly 16 unique eval-family files;
- globally unique family, variant, and assertion IDs;
- schema-like required fields and enum values;
- known source-prompt references and complete coverage;
- valid gates and effect-specific gate requirements; and
- that every destructive variant has an explicit high-risk gate.
- at least eight unique trigger cases with both should-trigger and
  should-not-trigger outcomes, including native-team routing.
