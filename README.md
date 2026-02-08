# environment-share

Personal development environment configuration and setup scripts for macOS.

## What's Included

| Directory | Description |
|-----------|-------------|
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
./scripts/install-core.sh    # Homebrew, tmux, node, yarn, gh, jq, claude
./tmux/install.sh            # tmux config
./iterm/install.sh           # iTerm2 preferences
./claude/install.sh          # Claude Code settings and permissions
./claude/install-plugins.sh  # Claude Code plugins
```

## Requirements

- macOS (Apple Silicon or Intel)
- Command Line Tools (`xcode-select --install`)

## Notes

- All scripts are idempotent — safe to re-run
- Existing configs are backed up before overwriting (to `*.backup`)
- Claude Code must be authenticated separately after installation (`claude login`)
