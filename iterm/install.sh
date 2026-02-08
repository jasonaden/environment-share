#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "==> Installing iTerm2 configuration..."

# Install iTerm2 if not present
if [ ! -d "/Applications/iTerm.app" ]; then
    echo "    iTerm2 not found. Installing via Homebrew..."
    if command -v brew &>/dev/null; then
        brew install --cask iterm2
    else
        echo "    ERROR: Homebrew not installed. Install it first or install iTerm2 manually."
        exit 1
    fi
else
    echo "    iTerm2 is already installed."
fi

# Install shell integration for zsh
echo "    Installing iTerm2 shell integration for zsh..."
if [ ! -f "$HOME/.iterm2_shell_integration.zsh" ]; then
    curl -fsSL https://iterm2.com/shell_integration/zsh -o "$HOME/.iterm2_shell_integration.zsh"
    echo "    Shell integration installed."

    # Add source line to .zshrc if not present
    if ! grep -q "iterm2_shell_integration" "$HOME/.zshrc" 2>/dev/null; then
        echo "" >> "$HOME/.zshrc"
        echo "# iTerm2 shell integration" >> "$HOME/.zshrc"
        echo 'test -e "${HOME}/.iterm2_shell_integration.zsh" && source "${HOME}/.iterm2_shell_integration.zsh"' >> "$HOME/.zshrc"
        echo "    Added shell integration to .zshrc"
    fi
else
    echo "    Shell integration already installed."
fi

# Import iTerm2 preferences
echo "    Importing iTerm2 preferences..."
PLIST_PATH="$SCRIPT_DIR/com.googlecode.iterm2.plist"
if [ -f "$PLIST_PATH" ]; then
    # Backup current preferences
    BACKUP_PATH="$HOME/Library/Preferences/com.googlecode.iterm2.plist.backup"
    if [ -f "$HOME/Library/Preferences/com.googlecode.iterm2.plist" ]; then
        cp "$HOME/Library/Preferences/com.googlecode.iterm2.plist" "$BACKUP_PATH"
        echo "    Backed up existing preferences to $BACKUP_PATH"
    fi

    defaults import com.googlecode.iterm2 "$PLIST_PATH"
    echo "    Preferences imported. Restart iTerm2 to apply."
else
    echo "    WARNING: Preferences plist not found at $PLIST_PATH"
fi

echo "==> iTerm2 configuration installed successfully."
echo "    NOTE: Restart iTerm2 for preferences to take effect."
