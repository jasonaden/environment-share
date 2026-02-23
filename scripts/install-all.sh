#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "  Environment Setup — Full Installation"
echo "============================================"
echo ""

# 1. Core tools (brew, zsh, tmux, node, yarn, gh, jq, claude)
echo "--- Step 1/7: Core Tools ---"
"$SCRIPT_DIR/install-core.sh"
echo ""

# 2. Git aliases and settings
echo "--- Step 2/7: Git ---"
"$REPO_DIR/git/install.sh"
echo ""

# 3. tmux configuration
echo "--- Step 3/7: tmux ---"
"$REPO_DIR/tmux/install.sh"
echo ""

# 4. iTerm2 preferences
echo "--- Step 4/7: iTerm2 ---"
"$REPO_DIR/iterm/install.sh"
echo ""

# 5. Claude Code settings
echo "--- Step 5/7: Claude Code ---"
"$REPO_DIR/claude/install.sh"
echo ""

# 6. Justfile (global task runner)
echo "--- Step 6/7: Justfile ---"
"$REPO_DIR/justfile/install.sh"
echo ""

# 7. Claude Code status line
echo "--- Step 7/7: ccstatusline ---"
"$REPO_DIR/ccstatusline/install.sh"
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
