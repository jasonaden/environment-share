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

# Brew packages
BREW_PACKAGES=(tmux gh jq)
for pkg in "${BREW_PACKAGES[@]}"; do
    if ! command -v "$pkg" &>/dev/null; then
        echo "    Installing $pkg..."
        brew install "$pkg"
    else
        echo "    $pkg is already installed."
    fi
done

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

echo "==> Core development tools installed successfully."
