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
| `pi/` | Pi coding agent settings, prompts, agents, extensions, and installer |
| `just/` | Global justfile with Claude Code and Pi recipes plus the `j` alias |
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
./pi/install.sh                  # Pi agent + curated safe/optional profiles
./just/install.sh                # Global justfile + 'j' alias
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
j pi           # Start Pi with the normal curated profile
j pi-review    # Read-only Pi review with no Bash and no saved session
j pi-plan      # Read-only planning followed by explicit execution opt-in
j pi-focus     # Pi session with a persistent, declared purpose
j pi-team      # Pi subagents plus guarded /ship implementation workflow
```

See [pi/README.md](pi/README.md) for the profile safety boundaries and the two-phase `/ship` workflow.

## Requirements

- macOS (Apple Silicon or Intel)
- Command Line Tools (`xcode-select --install`)

## Notes

- All scripts are idempotent — safe to re-run
- Existing configs are backed up before overwriting (to `*.backup`)
- The core installer will prompt for your password (Homebrew install, `chsh` for zsh)
- Claude Code must be authenticated separately after installation (`claude login`)
- Pi must be authenticated separately: start `pi`, run `/login`, and choose a provider
- After authenticating Claude, run `./claude/install-plugins.sh` to install plugins
- Git aliases include `legit` workflow commands (branches, publish, sync, etc.) — legit is installed automatically
