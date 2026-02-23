# Justfile Plugin & Presentation Design

## Overview

Two deliverables:
1. A `just` plugin for Claude Code — makes Claude aware of justfile recipes and able to run them
2. A short Reveal.js presentation introducing justfiles to the dev team

## Deliverable 1: `just` Plugin

**Location:** `claude/plugins/just/`

### Components

**SessionStart hook** — On every session start, runs `just --summary` and `just --list`. If `just` finds a justfile (walking up the directory tree, resolving imports), injects available recipes into session context. Silent if no justfile exists.

**Skill: `just`** — Teaches Claude:
- Prefer `just <recipe>` over raw commands when a matching recipe exists
- Use `just --show <recipe>` to inspect a recipe before running it
- Justfile syntax basics (recipes, variables, aliases, shebangs, dependencies, imports)
- That `just --summary` refreshes the recipe list if the justfile changes mid-session

**No command. No agent.** Claude uses the Bash tool to execute `just <recipe>`.

### Design Decisions

- **Approach B chosen** (Skill + SessionStart hook) over skill-only (no auto-discovery) and MCP server (over-engineered)
- Hook delegates all tree-walking and import resolution to `just` itself
- `just --summary` for compact context injection, `just --list` for human-readable detail
- Plugin named `just` (no `/just` slash command — hook + skill cover the use case)

## Deliverable 2: Presentation

**Location:** `presentations/justfiles.html`
**Tool:** `/presentation` (reveal-presentations plugin)
**Length:** ~8 slides

### Slide Flow

1. **Title** — "Justfiles: A Team Task Runner"
2. **The problem** — Tribal knowledge scattered across READMEs, Slack, onboarding docs
3. **What is `just`?** — Command runner like make without the baggage. `brew install just`
4. **Syntax tour** — Recipes, comments-as-docs, arguments, aliases, variables
5. **Real example** — Claude Code section from `~/justfile` (cc, ccw, ccc, etc.)
6. **Team use cases** — On-call scripts, deploy workflows, dev setup, CI shortcuts. Justfile = team runbook.
7. **Claude understands justfiles** — Can read, run, and suggest recipes. Walks the tree, handles inheritance.
8. **Get started** — `brew install just`, create a `justfile`, `just --list`

### Audience

Dev team at work. Practical adoption focus, not theoretical.

### Example Content

Uses the real Claude Code section from `~/justfile` (cc, ccw, ccc, ccr, ccp, ccm, ccplan recipes).
