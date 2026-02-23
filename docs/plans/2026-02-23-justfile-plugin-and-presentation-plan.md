# Justfile Plugin & Presentation — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a `just` plugin that makes Claude aware of justfile recipes at session start, plus a short team presentation introducing justfiles.

**Architecture:** Plugin with SessionStart hook (runs `just --list`/`just --summary` to inject recipes into context) and a skill (teaches Claude justfile semantics). Presentation is a standalone Reveal.js HTML file using the existing reveal-presentations plugin.

**Tech Stack:** Bash (hook script), Markdown (skill), HTML/Reveal.js (presentation)

---

### Task 1: Create plugin scaffold

**Files:**
- Create: `claude/plugins/just/.claude-plugin/plugin.json`

**Step 1: Create plugin manifest**

```json
{
  "name": "just",
  "version": "1.0.0",
  "description": "Makes Claude aware of justfile recipes — auto-discovers available recipes at session start and prefers just <recipe> over raw commands.",
  "author": {
    "name": "Jaden"
  }
}
```

**Step 2: Commit**

```bash
git add claude/plugins/just/.claude-plugin/plugin.json
git commit -m "feat(just): add plugin scaffold"
```

---

### Task 2: Create SessionStart hook script

**Files:**
- Create: `claude/plugins/just/hooks/session-start.sh`

**Step 1: Write the hook script**

```bash
#!/usr/bin/env bash
set -euo pipefail

# Check if just is installed
if ! command -v just &>/dev/null; then
  exit 0
fi

# Get recipe summary (compact, one line) — just handles tree-walking and imports
summary=$(just --summary 2>/dev/null || true)

if [ -z "$summary" ]; then
  exit 0
fi

# Get the detailed list with comments
list=$(just --list 2>/dev/null || true)

# Find which justfile just resolved to
justfile_path=$(just --justfile 2>/dev/null || echo "justfile")

# Build context string
context="This project has a justfile at ${justfile_path}.

Available recipes:
${list}

IMPORTANT: When performing tasks, check if a justfile recipe already exists for what you need to do. Prefer \`just <recipe>\` over writing raw shell commands. Use \`just --show <recipe>\` to inspect a recipe before running it. Use \`just --summary\` to refresh the recipe list if the justfile changes mid-session."

# Escape for JSON
escape_for_json() {
    local s="$1"
    s="${s//\\/\\\\}"
    s="${s//\"/\\\"}"
    s="${s//$'\n'/\\n}"
    s="${s//$'\r'/\\r}"
    s="${s//$'\t'/\\t}"
    printf '%s' "$s"
}

escaped=$(escape_for_json "$context")

cat <<EOF
{
  "hookSpecificOutput": {
    "hookEventName": "SessionStart",
    "additionalContext": "${escaped}"
  }
}
EOF

exit 0
```

**Step 2: Make executable**

```bash
chmod +x claude/plugins/just/hooks/session-start.sh
```

**Step 3: Commit**

```bash
git add claude/plugins/just/hooks/session-start.sh
git commit -m "feat(just): add SessionStart hook for recipe discovery"
```

---

### Task 3: Create hooks.json manifest

**Files:**
- Create: `claude/plugins/just/hooks/hooks.json`

**Step 1: Write hooks manifest**

```json
{
  "hooks": {
    "SessionStart": [
      {
        "matcher": "startup|resume|clear|compact",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/session-start.sh",
            "async": false
          }
        ]
      }
    ]
  }
}
```

**Step 2: Commit**

```bash
git add claude/plugins/just/hooks/hooks.json
git commit -m "feat(just): add hooks.json manifest"
```

---

### Task 4: Create the `just` skill

**Files:**
- Create: `claude/plugins/just/skills/just/SKILL.md`

**Step 1: Write the skill**

````markdown
---
name: just
description: Justfile awareness — understands justfile syntax, prefers just recipes over raw commands, and can inspect/run recipes. Use when working in a project with a justfile, when the user mentions "just", "justfile", or "recipes", or when you need to run a command that might already exist as a recipe.
---

# Justfile Awareness

When a justfile is present (detected at session start), prefer `just <recipe>` over writing raw shell commands.

## Quick Reference

| Command | Purpose |
|---------|---------|
| `just --list` | Show all available recipes with descriptions |
| `just --summary` | Compact one-line list of recipe names |
| `just --show <recipe>` | View the source of a recipe before running |
| `just <recipe>` | Run a recipe |
| `just <recipe> arg1 arg2` | Run a recipe with arguments |

## Behavior Rules

1. **Check before writing commands.** If a recipe exists for what you need, use it.
2. **Inspect before running.** Use `just --show <recipe>` if you're unsure what a recipe does.
3. **Respect aliases.** Recipes may have short aliases (e.g., `ocs` for `oc-status`). Either form works.
4. **Arguments.** Some recipes accept arguments: `just deploy staging`. Check with `--show`.
5. **Refresh.** If the justfile was edited mid-session, run `just --summary` to see updated recipes.

## Justfile Syntax Basics

```just
# Comment becomes the recipe description in --list
recipe-name arg1 arg2="default":
    command {{arg1}} {{arg2}}

# Aliases provide shorthand
alias r := recipe-name

# Variables
version := "1.0"

# Recipes can depend on other recipes
build: test lint
    cargo build --release

# Multi-line shell blocks
deploy:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "deploying..."
```

## Inheritance

`just` walks up the directory tree to find justfiles (like git finds `.git`). Recipes from parent justfiles are available in child directories. The `import` keyword pulls in recipes from other files.
````

**Step 2: Commit**

```bash
git add claude/plugins/just/skills/just/SKILL.md
git commit -m "feat(just): add justfile awareness skill"
```

---

### Task 5: Register plugin in marketplace.json

**Files:**
- Modify: `claude/plugins/.claude-plugin/marketplace.json`

**Step 1: Add just plugin entry**

Add to the `plugins` array:

```json
{
  "name": "just",
  "description": "Makes Claude aware of justfile recipes — auto-discovers at session start and prefers just <recipe> over raw commands",
  "version": "1.0.0",
  "author": {
    "name": "Jaden"
  },
  "source": "./just",
  "category": "productivity"
}
```

**Step 2: Commit**

```bash
git add claude/plugins/.claude-plugin/marketplace.json
git commit -m "feat(just): register plugin in local marketplace"
```

---

### Task 6: Test the plugin

**Step 1: Install the plugin locally**

```bash
claude plugin add ./claude/plugins/just
```

**Step 2: Verify hook fires**

Start a new Claude session in a directory with a justfile and confirm the recipe list appears in the session context.

**Step 3: Verify skill loads**

Check that the `just` skill appears in the available skills list.

**Step 4: Test recipe execution**

Ask Claude to run a justfile recipe and confirm it uses `just <recipe>` rather than raw commands.

---

### Task 7: Create the presentation

**Files:**
- Create: `presentations/justfiles.html`

**Step 1: Generate using /presentation skill**

Use the `/presentation` skill with these specifications:

- **Title:** "Justfiles: A Team Task Runner"
- **~8 slides**, short and punchy
- **Slide content:**

1. Title slide — "Justfiles: A Team Task Runner"
2. The problem — every project has tribal knowledge: "how do I run tests?", "how do I deploy staging?". Scattered across READMEs, Slack threads, onboarding docs that go stale.
3. What is `just`? — A command runner. Like `make` but no build system opinions, no tabs-vs-spaces, just commands. Install: `brew install just`. Cross-platform.
4. Syntax tour — code example showing: recipe with comment (becomes docs), arguments with defaults, alias, variable, dependency chain. One slide, real snippet.
5. Real example — the Claude Code section from `~/justfile`:
   ```
   # CC: start claude code (skip permissions)
   cc *args:
       claude --dangerously-skip-permissions {{args}}

   # CC: start with worktree (isolated git branch)
   ccw name="" *args:
       claude --dangerously-skip-permissions --worktree {{name}} {{args}}

   # CC: continue last session
   ccc *args:
       claude --dangerously-skip-permissions --continue {{args}}

   # CC: resume a session (interactive picker)
   ccr session="" *args:
       claude --dangerously-skip-permissions --resume {{session}} {{args}}

   # CC: plan mode (no edits)
   ccplan *args:
       claude --dangerously-skip-permissions --permission-mode plan {{args}}
   ```
6. Team use cases — on-call scripts (`just restart-service payments`), deploy workflows (`just deploy staging`), dev environment setup (`just setup`), CI shortcuts. One justfile = team runbook. New hire runs `just --list` day one.
7. Claude understands justfiles — Claude can read, run, and suggest justfile recipes. It auto-discovers recipes at session start. Walks the tree, handles inheritance. "Your justfile is your team's CLI."
8. Get started — `brew install just`, create a `justfile` in your project root, run `just --list`. Link to https://just.systems

**Step 2: Commit**

```bash
git add presentations/justfiles.html
git commit -m "feat: add justfiles presentation"
```

---

### Task 8: Final push

**Step 1: Push all commits**

```bash
git push
```
