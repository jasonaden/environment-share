# environment-share

Personal development environment configuration and setup scripts for macOS.

## What's Included

| Directory | Description |
|-----------|-------------|
| `ccstatusline/` | Claude Code status line config and standalone installer |
| `git/` | Git aliases (st, co, ci, lg, etc.) and global settings |
| `iterm/` | iTerm2 preferences and shell integration |
| `tmux/` | tmux configuration |
| `claude/` | Claude Code settings, permissions, and plugin setup |
| `scripts/` | Core tooling installers and master setup script |

## Quick Start

Clone this repo and run the master installer:

```bash
git clone <your-repo-url> ~/Projects/environment-share
cd ~/Projects/environment-share
./scripts/install-all.sh
```

Or install components individually:

```bash
./scripts/install-core.sh        # Homebrew, zsh, tmux, node, yarn, gh, jq, claude
./git/install.sh                 # Git aliases and global settings
./tmux/install.sh                # tmux config
./iterm/install.sh               # iTerm2 preferences
./claude/install.sh              # Claude Code settings and permissions
./claude/install-plugins.sh      # Claude Code plugins
./ccstatusline/install.sh        # Claude Code status line (can be run standalone)
```

## Requirements

- macOS (Apple Silicon or Intel)
- Command Line Tools (`xcode-select --install`)

## Notes

- All scripts are idempotent — safe to re-run
- Existing configs are backed up before overwriting (to `*.backup`)
- The core installer will prompt for your password (Homebrew install, `chsh` for zsh)
- Claude Code must be authenticated separately after installation (`claude login`)
- After authenticating Claude, run `./claude/install-plugins.sh` to install plugins
- Git aliases include `legit` workflow commands (branches, publish, sync, etc.) — legit is installed automatically
