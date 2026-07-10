# Environment Share

Personal environment configuration and dotfiles sharing repository for macOS.

## Quick Start

```bash
# Full install (all components)
./scripts/install-all.sh

# Or install individual components:
./scripts/install-core.sh          # Homebrew, zsh, tmux, node, gh, just, Codex CLI
./git/install.sh                   # Git aliases and global config
./iterm/install.sh                 # iTerm2 preferences + shell integration
./tmux/install.sh                  # tmux config for iTerm2 -CC
./claude/install.sh               # Claude Code settings and shared skills
./claude/install-plugins.sh       # Claude Code plugins
./codex/install.sh                # Codex setup and shared skills
./codex/install-plugins.sh        # Codex plugin catalog
./agents/install-skills.sh        # Cross-agent skill links
./just/install.sh                 # Global justfile + 'j' alias
```

## Using Just

After installation, use the `j` alias from any directory to run recipes:

```bash
j              # List all recipes
j cc           # Start Claude Code
j cx           # Start Codex
j cxr          # Resume a Codex session
```

## Repository Structure

- `scripts/` — Master orchestrator (`install-all.sh`) and core tools installer (`install-core.sh`)
- `git/` — Git aliases and global settings (merged into ~/.gitconfig)
- `iterm/` — iTerm2 preferences and shell integration installer
- `tmux/` — tmux configuration optimized for iTerm2 -CC integration
- `just/` — Global justfile with agent recipes and `j` alias
- `agents/` — Portable skills shared between Claude Code and Codex
- `claude/` — Claude-specific settings, hooks, and plugins
- `codex/` — Codex setup and plugin catalog

## Prerequisites

- macOS (Apple Silicon or Intel)
- Homebrew (installed automatically by `install-core.sh` if missing)
- For Claude Code: `npm install -g @anthropics/claude-code`, then `claude login`
- For Codex: `npm install -g @openai/codex`, then `codex login`

## Conventions

- All install scripts are idempotent (safe to re-run)
- Scripts back up existing configs before overwriting
- Use `#!/usr/bin/env bash` and `set -euo pipefail` in all scripts
- Never commit secrets, API keys, or credentials
