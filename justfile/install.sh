#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$HOME/justfile"

echo "==> Installing justfile..."

# Back up existing justfile if present
if [ -f "$TARGET" ]; then
  echo "    Backing up existing ~/justfile to ~/justfile.bak"
  cp "$TARGET" "$TARGET.bak"
fi

cp "$SCRIPT_DIR/justfile" "$TARGET"
echo "    Installed ~/justfile"

# Set up 'j' alias for global access if not already present
SHELL_RC=""
if [ -f "$HOME/.zshrc" ]; then
  SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
  SHELL_RC="$HOME/.bashrc"
fi

if [ -n "$SHELL_RC" ]; then
  if ! grep -q 'alias j=' "$SHELL_RC" 2>/dev/null; then
    echo "" >> "$SHELL_RC"
    echo '# just global task runner' >> "$SHELL_RC"
    echo "alias j='just --justfile ~/justfile --working-directory .'" >> "$SHELL_RC"
    echo "    Added 'j' alias to $SHELL_RC (restart shell or source it)"
  else
    echo "    'j' alias already exists in $SHELL_RC"
  fi
fi

echo "==> Done. Run 'just --list' or 'j' to see available recipes."
