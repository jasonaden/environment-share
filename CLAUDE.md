# Claude Code notes

Follow the vendor-neutral repository rules in `AGENTS.md`. Keep this file limited to Claude-specific behavior.

## Launch profiles

- `j cc` starts Claude with `--permission-mode acceptEdits`.
- `j ccplan` starts read-only planning mode.
- `j ccw <name>` uses Claude's isolated worktree mode.
- `j ccd` and other `*d` recipes are explicit dangerous opt-ins; never select them implicitly.
- `cmux claude-teams` enables Claude Agent Teams per session and renders teammates as native Cmux splits. Normal Claude sessions do not globally enable teammate mode.

## Managed configuration

- `claude/settings.json` owns only the shared status line and compaction/session hooks.
- `claude/install.sh` merges those owned keys, preserves unrelated user settings, writes timestamped backups, and migrates only the exact legacy unrestricted-permissions shape previously installed by this repository.
- `claude/install-plugins.sh` remains a separate explicit network/plugin action.
- Portable cross-harness skills live under `agent-skills/`; the orchestration skill is only for deliberate mixed Codex/Claude/Pi fleets.

## Verification

After changing Claude configuration, validate JSON, run `bash -n claude/*.sh`, and test the installer against an isolated `CLAUDE_CONFIG_DIR` before applying it to `~/.claude`.
