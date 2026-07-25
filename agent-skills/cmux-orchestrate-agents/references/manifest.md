# Fleet manifest and task contracts

Use separate files for team mechanics and task content. Keep both free of credentials and environment values. The repository itself must also be a stable, secret-free Git worktree.

## Manifest

```json
{
  "schema_version": 1,
  "name": "repository-review",
  "mode": "heterogeneous",
  "topology": "workspace-group",
  "repository": "/absolute/path/to/repository",
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

Require two or three workers with at least two distinct harnesses. Preserve provider-default models unless a reviewed manifest names an optional model. Reject unknown keys that could smuggle commands, flags, or environment values.

`repository` must name an existing absolute directory inside a Git worktree. The runner resolves it and normalizes a subdirectory to the canonical Git top-level with a warning; all provider policies, fingerprints, and state namespacing then use that full root. Validation walks at most 100,000 file/directory names outside `.git`, rejects credential-like matches (including non-template `.env` files, common auth/key names, and `.ssh`, `.aws`, or `.kube` directories), and fails closed if the bounded scan cannot complete. This name scan is a preflight guard, not secret-content inspection or proof that a repository is safe.

Both the supplied path and canonical Git root must use printable, single-line
characters. The private state root has the same constraint so plan output and
approval-digest labels cannot be spoofed with control characters.

The same preflight rejects FIFOs, sockets, devices, multiply linked regular
files, and other special nodes. Ordinary single-link files, directories, and
symlinks remain subject to each provider's canonical repository boundary;
special nodes and hard links cannot be used as blocking or externally supplied
read channels.

The resolved private state root must neither contain the canonical Git root nor be contained by it. `CMUX_AGENT_STATE_HOME` selects the state root directly. Without it, state lives under `$XDG_STATE_HOME/cmux-agent-teams` or `~/.local/state/cmux-agent-teams`.

Launch integrity uses a bounded raw Git-index plus filesystem-content
fingerprint; it does not run `status`/`diff`, clean filters, textconv, hooks, or
submodule commands. V1 rejects tracked submodules, more than 20,000 indexed or
untracked/ignored paths, and more than 128 MiB of fingerprinted content rather
than invoking repository-configured helpers or silently weakening coverage.
All runner JSON entry points also reject duplicate keys, oversized numeric
tokens, non-standard numeric constants, files larger than 16 MiB, and nesting
deeper than 128 containers before semantic validation.

## Task

```json
{
  "schema_version": 1,
  "task_id": "review-auth-boundary",
  "instructions": "Review the authentication boundary without changing files.",
  "acceptance_criteria": [
    "Cite concrete files or commands for every finding.",
    "Separate confirmed defects from hypotheses.",
    "Identify the highest-value deterministic verification step."
  ]
}
```

Keep instructions under 20,000 characters and each acceptance criterion under 1,000 characters. Do not put expected conclusions into the task; forward tests must not leak their answer key.

## Result

Each worker must return this logical shape:

```json
{
  "status": "completed",
  "summary": "Concise result",
  "findings": [
    {
      "title": "Finding title",
      "evidence": "File, symbol, command, or observed behavior",
      "impact": "Why it matters"
    }
  ],
  "changed_files": [],
  "checks": ["Read-only checks performed"],
  "risks": ["Remaining uncertainty"]
}
```

The runner wraps this output with run, task, worker, provider-exit, checkout-integrity, and disposition metadata. `needs_review` is the strongest automatic disposition in v1.
