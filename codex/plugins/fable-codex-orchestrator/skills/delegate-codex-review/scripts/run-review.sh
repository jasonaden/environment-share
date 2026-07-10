#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 3 || $# -gt 4 ]]; then
  echo "Usage: $0 <repo> <uncommitted|base:branch|commit:sha> <prompt-file> [report-file]" >&2
  exit 64
fi

repo=$1
target=$2
prompt_file=$3
report_file=${4:-"${TMPDIR:-/tmp}/codex-review-$(date +%Y%m%d-%H%M%S).md"}

[[ -d "$repo/.git" || -f "$repo/.git" ]] || { echo "Not a git checkout: $repo" >&2; exit 66; }
[[ -f "$prompt_file" ]] || { echo "Prompt file not found: $prompt_file" >&2; exit 66; }
command -v codex >/dev/null || { echo "Codex CLI not found" >&2; exit 69; }
mkdir -p "$(dirname "$report_file")"

case "$target" in
  uncommitted) args=(--uncommitted) ;;
  base:*) args=(--base "${target#base:}") ;;
  commit:*) args=(--commit "${target#commit:}") ;;
  *) echo "Invalid target: $target" >&2; exit 64 ;;
esac

(
  cd "$repo"
  codex review "${args[@]}" - < "$prompt_file"
) | tee "$report_file"
printf '%s\n' "$report_file"
