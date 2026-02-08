#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "  Environment Setup — Full Installation"
echo "============================================"
echo ""

# 1. Core tools (brew, tmux, node, yarn, gh, jq, claude)
echo "--- Step 1/4: Core Tools ---"
"$SCRIPT_DIR/install-core.sh"
echo ""

# 2. tmux configuration
echo "--- Step 2/4: tmux ---"
"$REPO_DIR/tmux/install.sh"
echo ""

# 3. iTerm2 preferences
echo "--- Step 3/4: iTerm2 ---"
"$REPO_DIR/iterm/install.sh"
echo ""

# 4. Claude Code settings
echo "--- Step 4/4: Claude Code ---"
"$REPO_DIR/claude/install.sh"
echo ""

echo "============================================"
echo "  Setup complete!"
echo "============================================"
echo ""
echo "  Remaining manual steps:"
echo "  1. Restart iTerm2 for preferences to take effect"
echo "  2. Run 'claude login' to authenticate Claude Code"
echo "  3. Run './claude/install-plugins.sh' to install Claude plugins"
echo ""
