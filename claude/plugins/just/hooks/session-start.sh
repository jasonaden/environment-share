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
