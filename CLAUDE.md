# Environment Share

Personal environment configuration and dotfiles sharing repository for macOS.

## Quick Start

```bash
# Full install (all components)
./scripts/install-all.sh

# Or install individual components:
./scripts/install-core.sh          # Homebrew, zsh, tmux, node, gh, just, claude CLI
./git/install.sh                   # Git aliases and global config
./iterm/install.sh                 # iTerm2 preferences + shell integration
./tmux/install.sh                  # tmux config for iTerm2 -CC
./claude/install.sh                # Claude Code settings, permissions, teams
./claude/install-plugins.sh        # Claude Code plugins (requires `claude` CLI)
./pi/install.sh                    # Pi agent and curated workflow profiles
./just/install.sh                  # Global justfile + 'j' alias
```

## Using Just

After installation, use the `j` alias from any directory to run recipes:

```bash
j              # List all recipes
j cc           # Start Claude Code (skip permissions)
j ccc          # Continue last Claude session
j ccw mybranch # Start Claude in an isolated worktree
j ccm opus     # Start Claude with a specific model
j ccplan       # Start Claude in plan mode
j pi           # Start the normal Pi profile
j pi-plan      # Start Pi in guarded planning mode
j pi-review    # Start ephemeral Pi without Bash or mutation tools
j pi-team      # Start Pi subagents and the guarded /ship workflow
```

## Repository Structure

- `scripts/` — Master orchestrator (`install-all.sh`) and core tools installer (`install-core.sh`)
- `git/` — Git aliases and global settings (merged into ~/.gitconfig)
- `iterm/` — iTerm2 preferences and shell integration installer
- `tmux/` — tmux configuration optimized for iTerm2 -CC integration
- `just/` — Global justfile with Claude Code and Pi recipes plus the `j` alias
- `pi/` — Pi settings, installer, prompts, agents, optional extensions, and workflow documentation
- `claude/` — Claude Code setup:
  - `settings.json` — Permissions (unrestricted), agent teams (tmux mode), status line
  - `install.sh` — Installs settings, creates `~/.claude/teams/` and `tasks/` dirs, sets env vars
  - `install-plugins.sh` — Installs official and third-party plugins via `claude plugin` CLI

## Prerequisites

- macOS (Apple Silicon or Intel)
- Homebrew (installed automatically by `install-core.sh` if missing)
- For Claude: `npm install -g @anthropic-ai/claude-code`, then `claude login`
- For Pi: Node.js 22.19 or newer, then run `./pi/install.sh` and authenticate with `/login`

## Conventions

- All install scripts are idempotent (safe to re-run)
- Scripts back up existing configs before overwriting
- Use `#!/usr/bin/env bash` and `set -euo pipefail` in all scripts
- Never commit secrets, API keys, or credentials
