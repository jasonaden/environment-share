#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
MARKETPLACE_ROOT="$REPO_ROOT/codex"

if ! command -v codex >/dev/null; then
  echo "ERROR: Codex CLI not found. Install @openai/codex first." >&2
  exit 1
fi

codex plugin marketplace add "$MARKETPLACE_ROOT" 2>/dev/null || true
codex plugin add fable-codex-orchestrator@environment-share

echo "Installed fable-codex-orchestrator for Codex."
