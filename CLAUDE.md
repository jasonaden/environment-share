# Environment Share

Personal environment configuration and dotfiles sharing repository for macOS.

## Quick Start

```bash
# Full install (all components)
./scripts/install-all.sh

# Or install individual components:
./scripts/install-core.sh          # Homebrew, zsh, tmux, node, gh, claude CLI
./git/install.sh                   # Git aliases and global config
./iterm/install.sh                 # iTerm2 preferences + shell integration
./tmux/install.sh                  # tmux config for iTerm2 -CC
./claude/install.sh                # Claude Code settings, permissions, teams
./claude/install-plugins.sh        # Claude Code plugins (requires `claude` CLI)
```

## Repository Structure

- `scripts/` — Master orchestrator (`install-all.sh`) and core tools installer (`install-core.sh`)
- `git/` — Git aliases and global settings (merged into ~/.gitconfig)
- `iterm/` — iTerm2 preferences and shell integration installer
- `tmux/` — tmux configuration optimized for iTerm2 -CC integration
- `claude/` — Claude Code setup:
  - `settings.json` — Permissions (unrestricted), agent teams (tmux mode), status line
  - `install.sh` — Installs settings, creates `~/.claude/teams/` and `tasks/` dirs, sets env vars
  - `install-plugins.sh` — Installs official and third-party plugins via `claude plugin` CLI

## Prerequisites

- macOS (Apple Silicon or Intel)
- Homebrew (installed automatically by `install-core.sh` if missing)
- For Claude: `npm install -g @anthropic-ai/claude-code`, then `claude login`

## Conventions

- All install scripts are idempotent (safe to re-run)
- Scripts back up existing configs before overwriting
- Use `#!/usr/bin/env bash` and `set -euo pipefail` in all scripts
- Never commit secrets, API keys, or credentials
