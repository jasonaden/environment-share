#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"

echo "==> Installing Claude Code configuration..."

# Create ~/.claude directory and agent teams subdirectories
mkdir -p "$CLAUDE_DIR"
mkdir -p "$CLAUDE_DIR/teams"
mkdir -p "$CLAUDE_DIR/tasks"
echo "    Created ~/.claude/, ~/.claude/teams/, ~/.claude/tasks/"

# Backup and install settings.json
# Settings include: unrestricted permissions, agent teams env var,
# tmux teammate mode, and status line config
if [ -f "$CLAUDE_DIR/settings.json" ]; then
    echo "    Backing up existing settings.json to settings.json.backup"
    cp "$CLAUDE_DIR/settings.json" "$CLAUDE_DIR/settings.json.backup"
fi
cp "$SCRIPT_DIR/settings.json" "$CLAUDE_DIR/settings.json"
echo "    Installed settings.json"
echo "      - Agent teams enabled (CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1)"
echo "      - Teammate mode: tmux"
echo "      - Status line: ccstatusline"
echo "      - Permissions: unrestricted"

# Verify tmux is available (required for teammateMode: "tmux")
if command -v tmux &>/dev/null; then
    echo "    tmux found ($(tmux -V)) — agent teams will use tmux for teammates"
else
    echo "    WARNING: tmux not found. Agent teams requires tmux for teammateMode."
    echo "    Run 'brew install tmux' or use scripts/install-core.sh first."
fi

# Add Claude shell environment variables to .zshrc if not present
ZSHRC="$HOME/.zshrc"
if [ -f "$ZSHRC" ]; then
    if ! grep -q "CLAUDE_CODE_MAX_OUTPUT_TOKENS" "$ZSHRC" 2>/dev/null; then
        echo "" >> "$ZSHRC"
        echo "# Claude Code Configuration" >> "$ZSHRC"
        echo "export CLAUDE_CODE_MAX_OUTPUT_TOKENS=32000" >> "$ZSHRC"
        echo "    Added CLAUDE_CODE_MAX_OUTPUT_TOKENS to .zshrc"
    else
        echo "    Claude env vars already in .zshrc"
    fi
else
    echo "    No .zshrc found — skipping shell env setup"
fi

echo ""
echo "==> Claude Code configuration installed successfully."
echo ""
echo "    What's configured:"
echo "    - Unrestricted tool permissions (Bash, Read, Edit, Write, etc.)"
echo "    - Agent teams with tmux teammate mode"
echo "    - Status line via ccstatusline"
echo "    - Recommended plugins (superpowers, ui-ux-pro-max, etc.)"
echo ""
echo "    Next steps:"
echo "    1. Run 'claude login' to authenticate"
echo "    2. Run './claude/install-plugins.sh' to install recommended plugins"
echo "    3. Source your shell: 'source ~/.zshrc'"
