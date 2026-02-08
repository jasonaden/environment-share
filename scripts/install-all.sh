#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "  Environment Setup — Full Installation"
echo "============================================"
echo ""

# 1. Core tools (brew, zsh, tmux, node, yarn, gh, jq, claude)
echo "--- Step 1/5: Core Tools ---"
"$SCRIPT_DIR/install-core.sh"
echo ""

# 2. Git aliases and settings
echo "--- Step 2/5: Git ---"
"$REPO_DIR/git/install.sh"
echo ""

# 3. tmux configuration
echo "--- Step 3/5: tmux ---"
"$REPO_DIR/tmux/install.sh"
echo ""

# 4. iTerm2 preferences
echo "--- Step 4/5: iTerm2 ---"
"$REPO_DIR/iterm/install.sh"
echo ""

# 5. Claude Code settings
echo "--- Step 5/5: Claude Code ---"
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
echo "  4. Set git identity:"
echo "     git config --global user.name \"Your Name\""
echo "     git config --global user.email \"your@email.com\""
echo ""
