#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 || $# -gt 3 ]]; then
  echo "Usage: $0 <repo> <prompt-file> [report-file]" >&2
  exit 64
fi

repo=$1
prompt_file=$2
report_file=${3:-"${TMPDIR:-/tmp}/codex-implementation-$(date +%Y%m%d-%H%M%S).md"}

[[ -d "$repo/.git" || -f "$repo/.git" ]] || { echo "Not a git checkout: $repo" >&2; exit 66; }
[[ -f "$prompt_file" ]] || { echo "Prompt file not found: $prompt_file" >&2; exit 66; }
command -v codex >/dev/null || { echo "Codex CLI not found" >&2; exit 69; }

mkdir -p "$(dirname "$report_file")"
codex exec -C "$repo" --sandbox workspace-write --output-last-message "$report_file" - < "$prompt_file"
printf '%s\n' "$report_file"
