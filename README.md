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
| `justfile/` | Global justfile with Claude Code recipes and `j` alias |
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
./scripts/install-core.sh        # Homebrew, zsh, tmux, node, yarn, gh, jq, just, claude
./git/install.sh                 # Git aliases and global settings
./tmux/install.sh                # tmux config
./iterm/install.sh               # iTerm2 preferences
./claude/install.sh              # Claude Code settings and permissions
./claude/install-plugins.sh      # Claude Code plugins
./justfile/install.sh            # Global justfile + 'j' alias
./ccstatusline/install.sh        # Claude Code status line (can be run standalone)
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
