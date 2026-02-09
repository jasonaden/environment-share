# Claude Code Context Management Commands

## Why these exist

Claude Code's 200k context window fills up during long-running tasks, especially with agent teams where teammate messages are the #1 source of context bloat. When context fills, Claude either:

1. **Auto-compacts** — lossy summarization that drops details (teammate findings, code snippets, reasoning chains)
2. **Stops working** — hits the ~98% hard limit

Neither is great for complex work. These commands give you manual control over context transitions using Claude's **built-in auto memory** feature (MEMORY.md), which persists across sessions and context clears.

## Commands

### `/prep-for-clear`

Run this when you want to clear context but keep working. The agent writes minimal resumption state to MEMORY.md:
- Current task and plan location
- What step you're on
- Key files being worked on
- What was just completed

Then you run `/clear` to wipe context. MEMORY.md survives the clear.

### `/after-clear`

Run this after a `/clear` if the agent doesn't automatically pick up context. It reads MEMORY.md (already in the system prompt), checks TaskList, and tells you where you left off.

## How it works

Claude Code has a built-in persistent memory directory at `~/.claude/projects/{project}/memory/`. A `MEMORY.md` file there is **automatically loaded into the system prompt** of every session (first 200 lines). It survives `/clear`, `/compact`, and new sessions.

These commands are just prompts that tell the agent to write/read that file at the right time. The hooks in `settings.json` (PreCompact, SessionStart) act as safety nets.

## What could make these obsolete

These commands are workarounds for limitations as of early 2026. They may become unnecessary if Claude Code adds:

- **Smarter auto-compact** that preserves teammate findings and task results selectively
- **Context-aware auto-save** that writes to MEMORY.md automatically when context is getting full
- **Built-in `/prep-for-clear`** or similar context transition commands
- **Teammate result summarization** that reduces context consumption before results enter the lead's window
- **Larger context windows** that make the problem less frequent

If auto-compact becomes configurable (e.g., custom instructions for what to preserve), you could re-enable it and remove these commands.
