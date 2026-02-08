# Environment Share

Personal environment configuration and dotfiles sharing repository for macOS.

## Repository Structure

- `git/` — Git aliases and global settings (merged into ~/.gitconfig)
- `iterm/` — iTerm2 preferences and shell integration installer
- `tmux/` — tmux configuration optimized for iTerm2 -CC integration
- `claude/` — Claude Code settings, permissions, and plugin setup
- `scripts/` — Core tooling installers (including zsh) and master setup orchestrator

## Guidelines

- All install scripts must be idempotent (safe to re-run)
- Scripts target macOS (Apple Silicon and Intel)
- Always back up existing configs before overwriting
- Use `#!/usr/bin/env bash` and `set -euo pipefail` in all scripts
- Keep scripts well-commented and simple
- Never commit secrets, API keys, or credentials
