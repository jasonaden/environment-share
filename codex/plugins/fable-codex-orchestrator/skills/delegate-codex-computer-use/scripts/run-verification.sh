#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 3 ]]; then
  echo "Usage: $0 <repo> <prompt-file> <artifact-directory>" >&2
  exit 64
fi

repo=$1
prompt_file=$2
artifact_dir=$3

[[ -d "$repo/.git" || -f "$repo/.git" ]] || { echo "Not a git checkout: $repo" >&2; exit 66; }
[[ -f "$prompt_file" ]] || { echo "Prompt file not found: $prompt_file" >&2; exit 66; }
command -v codex >/dev/null || { echo "Codex CLI not found" >&2; exit 69; }

mkdir -p "$artifact_dir"
report_file="$artifact_dir/report.md"
{
  printf 'Store screenshots and supporting evidence in: %s\n\n' "$artifact_dir"
  cat "$prompt_file"
} | codex exec -C "$repo" --sandbox workspace-write --add-dir "$artifact_dir" --output-last-message "$report_file" -
printf '%s\n' "$report_file"
