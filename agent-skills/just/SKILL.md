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

## Creating and Editing Justfiles

When the user asks you to add a recipe or create a justfile:

1. **Check for existing justfile first.** Run `just --justfile 2>/dev/null` or look for a `justfile` in the project root.
2. **Follow existing style.** If a justfile exists, match its patterns — comment style, indentation, section headers, alias conventions.
3. **Always add a comment** above recipes — it becomes the description shown by `just --list`.
4. **Use `{{invocation_directory()}}` for cd** if the justfile is global (like `~/justfile`), so recipes work from any directory.
5. **Add an alias** for frequently-used recipes: `alias d := deploy`.
6. **Group related recipes** under section comments: `# ── Deploy ──────────────`

### Recipe template

```just
# Short description of what this does
recipe-name arg1 arg2="default":
    command {{arg1}} {{arg2}}
alias rn := recipe-name
```

### Multi-line recipe template

```just
# Short description of what this does
recipe-name:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "doing the thing..."
```

## Inheritance

`just` walks up the directory tree to find justfiles (like git finds `.git`). Recipes from parent justfiles are available in child directories. The `import` keyword pulls in recipes from other files.
