# Shared agent extensions

This directory is the source of truth for reusable, cross-agent workflows.

## Skills

Put each portable skill in `skills/<name>/` with a `SKILL.md` at its root. Run:

```bash
./agents/install-skills.sh
```

The installer creates symlinks in both `~/.claude/skills/` and
`${CODEX_HOME:-~/.codex}/skills/`. Editing a skill in this repository therefore
updates both agents immediately; restart the agent to refresh discovery.

To install for only one agent:

```bash
./agents/install-skills.sh claude
./agents/install-skills.sh codex
```

Existing non-symlink skill directories are timestamped and preserved before a
link is created.

## Plugins

Plugins are not generally cross-agent artifacts. A plugin may contain portable
skills, but its manifest, hooks, commands, tools, apps, and marketplace metadata
belong to the host agent.

Use this split:

- Put reusable instructions, references, scripts, and assets in `agents/skills/`.
- Keep Claude-specific plugin installation in `claude/install-plugins.sh`.
- Keep Codex-specific plugin installation in `codex/install-plugins.sh`.
- If a plugin exposes a useful skill, place the skill here and make each
  agent-specific wrapper refer to the shared source rather than maintaining two
  copies.

The two plugin installer files are simple catalogs: add one entry per line to
the appropriate array. Codex plugins are installed through the Codex app/CLI;
the installer reports the requested catalog because unattended plugin install
commands are not currently a stable public interface.
