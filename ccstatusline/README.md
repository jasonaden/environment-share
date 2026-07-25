# ccstatusline config

Custom status line for [Claude Code](https://claude.com/claude-code) using [ccstatusline](https://github.com/sirmalloc/ccstatusline).

## Layout

```
Claude | 9.3% | 15.2k/3.4k/12k | ⌥main | 🌳 main | (+42,-10)
cwd: /Users/you/Projects/my-project
```

**Line 1:** Model | Context % | Tokens (in/out/cached) | Git branch | Git worktree | Git changes
**Line 2:** Current working directory

## Install

Requires Node.js (for `npx`) or Bun (for `bunx`). The installer pins the reviewed `ccstatusline` 2.2.22 release; update that pin intentionally in `install.sh` and `claude/settings.json`.

```bash
./install.sh
```

This will:
1. Copy `settings.json` to `~/.config/ccstatusline/`
2. Add the `statusLine` config to `~/.claude/settings.json`
3. Pre-cache the ccstatusline package

Restart Claude Code to see the status line.

## Customize

Run `npx ccstatusline@2.2.22` in your terminal to open the pinned interactive config editor.
