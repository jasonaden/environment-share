#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
CODEX_DIR="${CODEX_HOME:-$HOME/.codex}"

echo "==> Installing Codex configuration..."
mkdir -p "$CODEX_DIR"
"$REPO_DIR/agent-skills/install.sh" codex

echo "==> Codex configuration installed."
echo "    Project guidance is provided by AGENTS.md."
echo "    Personal Codex settings in $CODEX_DIR were left unchanged."
