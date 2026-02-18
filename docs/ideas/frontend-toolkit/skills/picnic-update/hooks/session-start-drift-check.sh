#!/usr/bin/env bash
set -euo pipefail

# SessionStart hook: advisory check for Picnic source drift.
# Prints a one-line notice if skills may be stale. Never modifies files.
# Exits silently on any error or if prerequisites are missing.

STATE_FILE="${CLAUDE_PLUGIN_ROOT:-}/../picnic-components/.picnic-gen-state.json"
FRONTEND_REPO="$HOME/Projects/frontend-code"

# Silent exit if state file or repo not found
if [ ! -f "$STATE_FILE" ] || [ ! -d "$FRONTEND_REPO/.git" ]; then
  exit 0
fi

# Read last generation commit from state file
LAST_COMMIT=$(jq -r '.lastGeneration.sourceCommit // empty' "$STATE_FILE" 2>/dev/null)
if [ -z "$LAST_COMMIT" ]; then
  exit 0
fi

# Get current main branch HEAD (local only, no fetch)
CURRENT_COMMIT=$(git -C "$FRONTEND_REPO" rev-parse main 2>/dev/null || true)
if [ -z "$CURRENT_COMMIT" ]; then
  exit 0
fi

# No drift if commits match
if [ "$LAST_COMMIT" = "$CURRENT_COMMIT" ]; then
  exit 0
fi

# Count changed files in libs/picnic/src/
CHANGED=$(git -C "$FRONTEND_REPO" diff --name-only "$LAST_COMMIT".."$CURRENT_COMMIT" -- libs/picnic/src/ 2>/dev/null | wc -l | tr -d ' ')

if [ "$CHANGED" -gt 0 ]; then
  echo "Picnic source has $CHANGED changed files since last skill generation. Run /picnic-update to sync."
fi
