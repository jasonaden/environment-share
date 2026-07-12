# Provider adapter contract

Generate argument arrays internally and execute without `shell=True`. Use a shell-quoted command only for Cmux's `new-workspace --command` handoff to the runner-owned wrapper.

## Codex

Prefer the reviewed ChatGPT application binary before `PATH`. Run from an empty
run-private directory so repository `.codex` config and `AGENTS.md` files are not
loaded as authority. Select an inline permission profile that denies `:root`,
reopens only `:minimal` plus the target repository as a read-only workspace root,
denies temp paths and `.env` files, disables network/native extras, filters shell
environment variables, and disallows login shells. Do not also pass `--sandbox`:
Codex permission profiles and that legacy flag do not compose. Run ephemerally
with no approvals, ignored user config/rules, JSON events, an output schema, and
a last-message file. Do not send removed strict-config keys merely to disable a
tool; the reviewed permission and feature policy must use fields accepted by the
pinned CLI.

## Claude Code

Prefer `/opt/homebrew/bin/claude` before `PATH`. Run in safe print mode with plan
permissions, only `Read,Grep,Glob`, no Chrome/session/slash commands, strict empty
MCP config shaped as `{"mcpServers":{}}`, an empty settings-source list, JSON
output, and the result schema. Declare the same read-only set through both
`--tools` and `--allowedTools` when subprocess environment scrubbing is enabled.
Pass an inline sandbox policy with `denyRead: ["/"]`, an absolute repository
`allowRead`, `failIfUnavailable`, and no unsandboxed fallback. This is a
fail-closed application policy for built-in file tools; do not describe it as an
OS container boundary.

## Pi

The runner prefers `~/.local/share/pi-node/current/bin/pi`, then the standard
Homebrew location, then `PATH`. A custom Pi location is therefore eligible only
when its executable directory is on `PATH`; in every case Pi must have a
reviewed sibling `node` executable. The installers additionally accept
`PI_NODE_BIN_DIR` as their preferred custom Pi/Node toolchain root and
`PI_CODING_AGENT_DIR` as the Pi configuration and hook root. These variables do
not make an arbitrary version trusted.

Use a controlled `PATH`, require reviewed `rg` and `fd` binaries, set
`PI_OFFLINE=1`, and isolate Pi settings/session writes beneath the private
worker directory while linking only the auth file from the configured
`PI_CODING_AGENT_DIR` (default `~/.pi/agent`). Run in print/JSON mode with no session,
project approval, discovered resources, or write-capable tools. Explicitly load
the trusted `pi-repository-guard.ts`; it canonicalizes `read`, single-file
`grep`, and `ls` paths and blocks absolute, parent, tilde, `file://`, `@`,
Unicode-space, symlink, `.git`, and credential-like path access. Recursive
directory grep and `find` are disabled because their output cannot be filtered
atomically against a credential-like file created after preflight.

Pi has no reviewed output-schema flag. Require one parseable RFC 8259 object in
the worker prompt, forbid surrounding prose and nested quoted shell snippets,
and reject malformed output without repairing or guessing the model's intent.

Pi's optional subagent extension starts hidden subprocesses; it does not create native Cmux panes. Launch one top-level Pi worker per owned Cmux workspace.

Pass only common process variables and provider-specific authentication variables
into provider parents. Doctor honors `CODEX_HOME`, `CLAUDE_CONFIG_DIR`, and
`PI_CODING_AGENT_DIR`, asks the reviewed Codex and Claude CLIs for bounded
non-secret login status (including Keychain-backed Claude login), and accepts
the documented `ANTHROPIC_AUTH_TOKEN` signal. Generated tools cannot read credential values: Codex
subprocesses receive an explicit include-only environment, Claude has no Bash,
and Pi has no Bash plus the path guard. Never record environment values in run
state. Pi's guard is application-layer and subject to ordinary same-user/TOCTOU
limits, so live evals still use secret-free disposable repositories.

## Version drift

The reviewed runner set is exact for Cmux `0.64.17 (97) [9ed29d81a]`, Codex
`0.144.0-alpha.4`, Claude Code `2.1.197`, Pi `0.80.6`, ripgrep `15.1.0`, and fd
`10.4.2`. Node is restricted to major 22 with minor 19 or later; Node 23+ is not
implicitly accepted.

Run `doctor` after any Cmux, provider, or helper update. To adopt a new version,
change the relevant installer/runner pin intentionally, review and revalidate
help tokens and generated adapter arguments, update fixtures and evals, and run
an explicitly approved read-only real-agent smoke test. Do not silently accept
version drift or add fallback dangerous flags when a provider rejects the
pinned contract.
