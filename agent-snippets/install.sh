#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
INSTALL_DIR="${AGENT_SNIPPETS_INSTALL_DIR:-$DATA_HOME/environment-share/agent-snippets}"
BIN_DIR="${LOCAL_BIN_DIR:-$HOME/.local/bin}"
BIN_TARGET="$BIN_DIR/agent-snippets"

refuse_unsafe_target() {
  local target="$1"
  if [ -L "$target" ]; then
    echo "Refusing to replace symlinked agent-snippets target: $target" >&2
    exit 1
  fi
  if [ -e "$target" ] && [ ! -f "$target" ]; then
    echo "Refusing to replace non-file agent-snippets target: $target" >&2
    exit 1
  fi
}

command -v python3 >/dev/null 2>&1 || {
  echo "agent-snippets requires python3." >&2
  exit 1
}

mkdir -p "$INSTALL_DIR/snippets" "$BIN_DIR"
refuse_unsafe_target "$INSTALL_DIR/catalog.json"
refuse_unsafe_target "$BIN_TARGET"

for source in "$SCRIPT_DIR"/snippets/*.md; do
  target="$INSTALL_DIR/snippets/$(basename "$source")"
  refuse_unsafe_target "$target"
  install -m 0644 "$source" "$target"
done
install -m 0644 "$SCRIPT_DIR/catalog.json" "$INSTALL_DIR/catalog.json"
install -m 0755 "$SCRIPT_DIR/agent-snippets" "$BIN_TARGET"

echo "Installed agent-snippets at $BIN_TARGET"
echo "Run 'agent-snippets' for the interactive review and install flow."
