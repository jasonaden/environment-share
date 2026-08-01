# environment-share

Personal development environment configuration and setup scripts for macOS.

## What's Included

| Directory | Description |
|-----------|-------------|
| `ccstatusline/` | Claude Code status line config and standalone installer |
| `git/` | Git aliases (st, co, ci, lg, etc.) and global settings |
| `iterm/` | iTerm2 preferences and shell integration |
| `tmux/` | tmux configuration |
| `claude/` | Merge-based Claude Code settings and plugin setup |
| `pi/` | Pi coding agent settings, prompts, agents, extensions, and installer |
| `cmux/` | Cmux integration installer, pinned upstream-skill lock, launcher, and isolated installer tests |
| `agent-skills/` | Canonical cross-harness skills installed for Codex, Claude, and Pi discovery |
| `agent-snippets/` | Optional marked instruction snippets with an interactive install/uninstall CLI |
| `codex/` | Codex setup and agent-specific plugin catalog |
| `agent-catalog/` | Validated reusable worker roles and heterogeneous team profiles |
| `evals/` | Versioned capability and safety eval ladders derived from reviewed sources |
| `just/` | Global justfile with Claude Code and Pi recipes plus the `j` alias |
| `scripts/` | Core tooling installers and master setup script |
| `tests/` | Cross-component installer and safety fixtures |

## Quick Start

Clone this repo and run the master installer:

```bash
git clone <your-repo-url> ~/Projects/environment-share
cd ~/Projects/environment-share
./scripts/install-all.sh
```

Or install components individually:

```bash
./scripts/install-core.sh        # Homebrew, shell tools, Claude Code, Codex, Pi prerequisites, and Cmux
./git/install.sh                 # Git aliases and global settings
./tmux/install.sh                # tmux config
./iterm/install.sh               # iTerm2 preferences
./claude/install.sh              # Merge repository-owned Claude settings
./claude/install-plugins.sh      # Claude Code plugins
./codex/install.sh               # Codex shared skills (preserves personal settings)
./codex/install-plugins.sh       # Show the desired Codex plugin catalog
./agent-skills/install.sh        # Install portable skills for Claude Code and Codex
./agent-snippets/install.sh      # Install the optional instruction-snippet CLI
./pi/install.sh                  # Pi agent + curated safe/optional profiles
./cmux/install.sh                # Pinned Cmux skills, orchestration catalog, and Pi hook
./cmux/install.sh --dry-run      # Preview local Cmux changes; upstream comparisons stay network-free
./just/install.sh                # Global justfile + 'j' alias
./ccstatusline/install.sh        # Claude Code status line (can be run standalone)
```

## Using Just

After installation, use the `j` alias from any directory to run recipes:

```bash
j              # List all recipes
j cc           # Start Claude Code in accept-edits mode
j ccc          # Continue last Claude session
j ccw mybranch # Start Claude in an isolated worktree
j ccm opus     # Start Claude with a specific model
j ccplan       # Start Claude in plan mode
j cx           # Start Codex
j cxr          # Resume a Codex session
j pi           # Start Pi with the normal curated profile
j pi-review    # Read-only Pi review with no Bash and no saved session
j pi-plan      # Read-only planning followed by explicit execution opt-in
j pi-focus     # Pi session with a persistent, declared purpose
j pi-team      # Pi subagents plus guarded /ship implementation workflow
```

See [pi/README.md](pi/README.md) for the profile safety boundaries and the two-phase `/ship` workflow.

## Cmux agent integration

Start with [cmux/README.md](cmux/README.md) for the staged testing guide, cost
and mutation labels, expected results, and cleanup workflow.

Run `./cmux/install.sh` after Pi is installed. The installer:

- copies the repository's canonical `cmux-orchestrate-agents` skill to Codex and Claude skill directories;
- installs the shared role and team catalog at `~/.config/cmux-agent-orchestration/catalog`;
- installs `cmux-team` in `~/.local/bin` and atomically adds that directory to new zsh terminals' `PATH`;
- installs `cmux`, `cmux-workspace`, `cmux-diagnostics`, `cmux-browser`, and `cmux-markdown` from official Cmux v0.64.17 commit `9ed29d81a39de3ba44e0654bbcf6bf67ca86d1fb`;
- requires the exact reviewed `cmux 0.64.17 (97) [9ed29d81a]` identity and Pi-hook interface before changing files;
- installs only Cmux's native Pi hook, preferring the configured `PI_NODE_BIN_DIR` (default `~/.local/share/pi-node/current/bin`) and accepting only a fallback Pi executable that has a supported sibling Node; and
- does not create a separate Pi skill copy because Pi discovers `~/.claude/skills` by default; set `PI_SHARED_SKILLS_DIR` only when Pi uses another shared-skill root.

Run `bash ./cmux/tests/run.sh` to exercise version/help preflight and dry-run behavior with isolated fixtures.
Run `bash ./tests/installers/run.sh` to verify managed Claude, ccstatusline,
Just, and Pi-adjacent installers refuse symlink redirection and safely handle
quoted configuration paths.

Use `cmux codex-teams` or `cmux claude-teams` for homogeneous native teams. Use the custom orchestration skill only for deliberate read-only Codex + Claude + Pi fleets.

Run `cmux-team doctor` for plan readiness. From a Cmux terminal, use `cmux-team doctor --require-launch`; repeat `--harness codex`, `--harness claude`, or `--harness pi` when checking only the providers in a proposed fleet.

The heterogeneous runner's reviewed baseline is exact: Cmux `0.64.17 (97)` at commit `9ed29d81a`, Codex `0.144.0-alpha.4`, Claude Code `2.1.197`, Pi `0.80.6`, ripgrep `15.1.0`, and fd `10.4.2`. Node is the one compatibility range: major `22`, minor `19` or later. `doctor` refuses an unreviewed version. Update the repository pins, adapter help expectations, fixtures, and evals intentionally before accepting version drift, then run an explicitly approved read-only smoke test.

Fleet manifests resolve their repository to the canonical Git worktree root. That complete root must be a stable, secret-free checkout: validation performs a bounded credential-like name scan, rejects FIFOs/sockets/devices, hard-linked files, and other special nodes, and rejects a private state root that contains, or is contained by, the checkout. Set `CMUX_AGENT_STATE_HOME` for an explicit state root; otherwise the runner uses `$XDG_STATE_HOME/cmux-agent-teams` or `~/.local/state/cmux-agent-teams`.

## Requirements

- macOS (Apple Silicon or Intel)
- Command Line Tools (`xcode-select --install`)
- Node.js major 22, minor 19 or later, with npm (the core installer rejects Node 23+ as unreviewed and selects a supported PATH/Homebrew toolchain)

## Notes

- All scripts are idempotent — safe to re-run
- Changed Claude settings and installed skill trees receive timestamped backups
- Existing zsh configuration is backed up before the Cmux installer adds the launcher directory to `PATH`
- Claude settings are merged: unrelated user preferences and permission rules are preserved
- The core installer will prompt for your password (Homebrew install, `chsh` for zsh)
- Claude Code must be authenticated separately after installation (`claude login`)
- Codex must be authenticated separately after installation (`codex login`)
- Pi must be authenticated separately: start `pi`, run `/login`, and choose a provider
- `PI_CODING_AGENT_DIR` changes Pi's configuration and hook root; `PI_NODE_BIN_DIR` changes the stable Pi/Node/npm bin directory. A reviewed fallback Node 22 source is persisted there so later child installers do not depend on an inherited PATH. The default shared-skill directory remains `~/.claude/skills` unless `PI_SHARED_SKILLS_DIR` is set explicitly.
- After authenticating Claude, run `./claude/install-plugins.sh` to install plugins
- Add portable skills under `agent-skills/<name>/SKILL.md`; the shared installer links the same source into Claude Code and Codex.
- Run `agent-snippets` to review optional instruction blocks and install or uninstall them in Claude, Codex, Pi, project, or custom Markdown instruction files.
- Plugin manifests, hooks, commands, and marketplace metadata remain agent-specific. See `agent-skills/README.md`.
- Git aliases include `legit` workflow commands (branches, publish, sync, etc.) — legit is installed automatically
