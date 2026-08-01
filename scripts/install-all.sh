#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

echo "============================================"
echo "  Environment Setup — Full Installation"
echo "============================================"
echo ""

# 1. Core tools (brew, zsh, tmux, node, yarn, gh, jq, claude, cmux)
echo "--- Step 1/11: Core Tools ---"
"$SCRIPT_DIR/install-core.sh"
echo ""

# 2. Git aliases and settings
echo "--- Step 2/11: Git ---"
"$REPO_DIR/git/install.sh"
echo ""

# 3. tmux configuration
echo "--- Step 3/11: tmux ---"
"$REPO_DIR/tmux/install.sh"
echo ""

# 4. iTerm2 preferences
echo "--- Step 4/11: iTerm2 ---"
"$REPO_DIR/iterm/install.sh"
echo ""

# 5. Claude Code settings
echo "--- Step 5/11: Claude Code ---"
"$REPO_DIR/claude/install.sh"
echo ""

# 6. Codex and shared skills
echo "--- Step 6/11: Codex ---"
"$REPO_DIR/codex/install.sh"
echo ""

# 7. Pi coding agent
echo "--- Step 7/11: Pi Coding Agent ---"
"$REPO_DIR/pi/install.sh"
echo ""

# 8. Cmux skills, catalog, and Pi hook (Pi must be installed first)
echo "--- Step 8/11: Cmux Agent Integration ---"
"$REPO_DIR/cmux/install.sh"
echo ""

# 9. Justfile (global task runner)
echo "--- Step 9/11: Justfile ---"
"$REPO_DIR/just/install.sh"
echo ""

# 10. Optional agent-instruction snippet CLI
echo "--- Step 10/11: Agent instruction snippets ---"
"$REPO_DIR/agent-snippets/install.sh"
echo ""

# 11. Claude Code status line
echo "--- Step 11/11: ccstatusline ---"
"$REPO_DIR/ccstatusline/install.sh"
echo ""

echo "============================================"
echo "  Setup complete!"
echo "============================================"
echo ""
echo "  Remaining manual steps:"
echo "  1. Restart iTerm2 for preferences to take effect"
echo "  2. Run 'claude login' to authenticate Claude Code"
echo "  3. Run 'codex login' to authenticate Codex CLI"
echo "  4. Run 'pi', then '/login', to authenticate Pi"
echo "  5. Run the agent-specific plugin installers as needed"
echo "  6. Open a new zsh terminal in Cmux, then run 'cmux-team doctor'"
echo "  7. Set git identity:"
echo "     git config --global user.name \"Your Name\""
echo "     git config --global user.email \"your@email.com\""
echo ""
