#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "==> Installing Claude Code configuration..."

# Create ~/.claude directory if it doesn't exist
mkdir -p "$CLAUDE_DIR"

# Backup and install settings.json
if [ -f "$CLAUDE_DIR/settings.json" ]; then
    echo "    Backing up existing settings.json to settings.json.backup"
    cp "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.backup"
fi
cp "$SCRIPT_DIR/settings.json" "$CLAUDE_DIR/settings.json"
echo "    Installed settings.json"

# Install claude-flow hooks template
cp "$SCRIPT_DIR/claude-flow-hooks-template.json" "$CLAUDE_DIR/claude-flow-hooks-template.json"
echo "    Installed claude-flow-hooks-template.json"

echo "==> Claude Code configuration installed successfully."
echo ""
echo "    Next steps:"
echo "    1. Run 'claude login' to authenticate"
echo "    2. Run './claude/install-plugins.sh' to install recommended plugins"
