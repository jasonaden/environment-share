#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing core development tools..."

# Homebrew
if ! command -v brew &>/dev/null; then
    echo "    Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add to PATH for Apple Silicon
    if [ -f /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    fi
else
    echo "    Homebrew is already installed."
fi

# zsh (default shell on modern macOS, but may not be present on fresh installs)
if ! command -v zsh &>/dev/null; then
    echo "    Installing zsh..."
    brew install zsh
    # Add brew zsh to allowed shells if not present
    ZSH_PATH="$(brew --prefix)/bin/zsh"
    if ! grep -q "$ZSH_PATH" /etc/shells 2>/dev/null; then
        echo "$ZSH_PATH" | sudo tee -a /etc/shells >/dev/null
        echo "    Added $ZSH_PATH to /etc/shells"
    fi
    # Set as default shell
    chsh -s "$ZSH_PATH"
    echo "    Set zsh as default shell"
else
    echo "    zsh is already installed ($(zsh --version | head -1))."
fi

# Create .zshrc if it doesn't exist
if [ ! -f "$HOME/.zshrc" ]; then
    touch "$HOME/.zshrc"
    echo "    Created ~/.zshrc"
fi

# Brew packages
BREW_PACKAGES=(tmux gh jq legit)
for pkg in "${BREW_PACKAGES[@]}"; do
    if ! command -v "$pkg" &>/dev/null; then
        echo "    Installing $pkg..."
        brew install "$pkg"
    else
        echo "    $pkg is already installed."
    fi
done

# Python 3 (required by ui-ux-pro-max search script)
if ! command -v python3 &>/dev/null; then
    echo "    Installing Python 3..."
    brew install python3
else
    echo "    Python 3 is already installed ($(python3 --version))."
fi

# Node.js
if ! command -v node &>/dev/null; then
    echo "    Installing Node.js..."
    brew install node
else
    echo "    Node.js is already installed ($(node --version))."
fi

# Yarn
if ! command -v yarn &>/dev/null; then
    echo "    Installing Yarn..."
    brew install yarn
else
    echo "    Yarn is already installed ($(yarn --version))."
fi

# Claude Code
if ! command -v claude &>/dev/null; then
    echo "    Installing Claude Code..."
    npm install -g @anthropics/claude-code
else
    echo "    Claude Code is already installed ($(claude --version 2>/dev/null || echo 'unknown version'))."
fi

# Pre-cache ccstatusline so the status line works immediately
echo "    Pre-caching ccstatusline for Claude status line..."
npx -y ccstatusline@latest --help &>/dev/null || echo "    Note: ccstatusline will be fetched on first Claude Code launch"

# Install ccstatusline settings
CCSTATUSLINE_CONFIG="$HOME/.config/ccstatusline"
mkdir -p "$CCSTATUSLINE_CONFIG"
cp "$SCRIPT_DIR/../ccstatusline/settings.json" "$CCSTATUSLINE_CONFIG/settings.json"
echo "    Installed ccstatusline settings to ~/.config/ccstatusline/settings.json"

echo "==> Core development tools installed successfully."
