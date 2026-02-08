#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TMUX_CONF="$HOME/.tmux.conf"

echo "==> Installing tmux configuration..."

# Backup existing config if it exists and is not a symlink
if [ -f "$TMUX_CONF" ] && [ ! -L "$TMUX_CONF" ]; then
    echo "    Backing up existing ~/.tmux.conf to ~/.tmux.conf.backup"
    cp "$TMUX_CONF" "${TMUX_CONF}.backup"
fi

# Remove existing file/symlink
rm -f "$TMUX_CONF"

# Create symlink
ln -s "$SCRIPT_DIR/tmux.conf" "$TMUX_CONF"
echo "    Symlinked ~/.tmux.conf -> $SCRIPT_DIR/tmux.conf"

# Reload tmux if it's running
if tmux list-sessions &>/dev/null; then
    tmux source-file "$TMUX_CONF" 2>/dev/null \
        && echo "    Reloaded tmux configuration" \
        || echo "    Note: tmux reload skipped (may need manual 'tmux source ~/.tmux.conf')"
else
    echo "    tmux is not running — config will apply on next session"
fi

echo "==> tmux configuration installed successfully."
