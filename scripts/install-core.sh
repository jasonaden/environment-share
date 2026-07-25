#!/usr/bin/env bash
set -euo pipefail

readonly NODE_MIN_VERSION="22.19.0"
readonly NODE_BREW_FORMULA="node@22"
readonly CMUX_REVIEWED_IDENTITY="cmux 0.64.17 (97) [9ed29d81a]"
readonly CODEX_REVIEWED_VERSION="0.144.0-alpha.4"
readonly CLAUDE_REVIEWED_VERSION="2.1.197"
readonly RG_REVIEWED_VERSION="15.1.0"
readonly FD_REVIEWED_VERSION="10.4.2"
NODE_BIN=""
NPM_BIN=""

node_is_supported() {
    local node_bin="$1"
    "$node_bin" -e 'const parse=(v)=>v.split(".").map(Number); const [a,b,c]=parse(process.versions.node); const [x,y,z]=parse(process.argv[1]); process.exit(a===x&&(b>y||(b===y&&c>=z))?0:1)' "$NODE_MIN_VERSION"
}

use_node_toolchain_dir() {
    local bin_dir="$1"
    if [ ! -x "$bin_dir/node" ] || [ ! -x "$bin_dir/npm" ] || ! node_is_supported "$bin_dir/node"; then
        return 1
    fi

    export PATH="$bin_dir:$PATH"
    NODE_BIN="$bin_dir/node"
    NPM_BIN="$bin_dir/npm"
}

resolve_supported_node_toolchain() {
    local node_bin
    local npm_bin
    local bin_dir

    if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1; then
        node_bin="$(command -v node)"
        npm_bin="$(command -v npm)"
        if node_is_supported "$node_bin"; then
            NODE_BIN="$node_bin"
            NPM_BIN="$npm_bin"
            return 0
        fi
    fi

    for bin_dir in /opt/homebrew/opt/node@22/bin /usr/local/opt/node@22/bin /opt/homebrew/bin /usr/local/bin; do
        if use_node_toolchain_dir "$bin_dir"; then
            return 0
        fi
    done

    if command -v brew >/dev/null 2>&1 && brew list --formula "$NODE_BREW_FORMULA" >/dev/null 2>&1; then
        bin_dir="$(brew --prefix "$NODE_BREW_FORMULA")/bin"
        if use_node_toolchain_dir "$bin_dir"; then
            return 0
        fi
    fi

    return 1
}

echo "==> Installing core development tools..."

# Homebrew
if ! command -v brew >/dev/null 2>&1; then
    if [ -x /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -x /usr/local/bin/brew ]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
fi

if ! command -v brew &>/dev/null; then
    echo "    Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

    # Add the installed Homebrew prefix to this process on either architecture.
    if [ -x /opt/homebrew/bin/brew ]; then
        eval "$(/opt/homebrew/bin/brew shellenv)"
    elif [ -x /usr/local/bin/brew ]; then
        eval "$(/usr/local/bin/brew shellenv)"
    fi
else
    echo "    Homebrew is already installed."
fi

command -v brew >/dev/null 2>&1 || {
    echo "Homebrew installation completed but brew is still unavailable." >&2
    exit 1
}

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
BREW_PACKAGES=(tmux gh jq legit just ripgrep fd)
for pkg in "${BREW_PACKAGES[@]}"; do
    command_name="$pkg"
    [ "$pkg" = "ripgrep" ] && command_name="rg"
    if ! command -v "$command_name" &>/dev/null; then
        echo "    Installing $pkg..."
        brew install "$pkg"
    else
        echo "    $pkg is already installed."
    fi
done

# Cmux application and CLI. Configuration, skills, and agent hooks are owned by
# cmux/install.sh; the core installer only ensures the application is present.
CMUX_APP_BIN="/Applications/cmux.app/Contents/Resources/bin/cmux"
if command -v cmux &>/dev/null; then
    echo "    Cmux is already installed ($(cmux version 2>/dev/null || cmux --version 2>/dev/null || echo 'unknown version'))."
elif [ -x "$CMUX_APP_BIN" ]; then
    echo "    Cmux is installed at $CMUX_APP_BIN (not currently on PATH)."
else
    echo "    Installing Cmux..."
    brew tap manaflow-ai/cmux
    brew install --cask cmux
fi

CMUX_RESOLVED="$(command -v cmux 2>/dev/null || true)"
[ -n "$CMUX_RESOLVED" ] || [ ! -x "$CMUX_APP_BIN" ] || CMUX_RESOLVED="$CMUX_APP_BIN"
[ -n "$CMUX_RESOLVED" ] || { echo "Cmux installation completed but its CLI is unavailable." >&2; exit 1; }
CMUX_VERSION_OUTPUT="$($CMUX_RESOLVED version 2>/dev/null || $CMUX_RESOLVED --version 2>/dev/null || true)"
if [ "$CMUX_VERSION_OUTPUT" != "$CMUX_REVIEWED_IDENTITY" ]; then
    echo "Cmux must match reviewed baseline $CMUX_REVIEWED_IDENTITY; found: $CMUX_VERSION_OUTPUT" >&2
    echo "Update the Cmux lock, adapters, and evals intentionally before accepting another version." >&2
    exit 1
fi

[ "$(rg --version | head -1)" = "ripgrep $RG_REVIEWED_VERSION" ] || {
    echo "ripgrep $RG_REVIEWED_VERSION is the reviewed fleet helper version." >&2
    exit 1
}
[ "$(fd --version | head -1)" = "fd $FD_REVIEWED_VERSION" ] || {
    echo "fd $FD_REVIEWED_VERSION is the reviewed fleet helper version." >&2
    exit 1
}

# Python 3 (required by ui-ux-pro-max search script)
if ! command -v python3 &>/dev/null; then
    echo "    Installing Python 3..."
    brew install python3
else
    echo "    Python 3 is already installed ($(python3 --version))."
fi

# Node.js. Pi requires 22.19.0 or newer within reviewed major 22, so do not accept another Node merely
# because it appears first on PATH. Prefer an already-supported toolchain,
# including Homebrew's standard bin directories, before changing global state.
if ! resolve_supported_node_toolchain; then
    if brew list --formula "$NODE_BREW_FORMULA" >/dev/null 2>&1; then
        echo "    Upgrading Homebrew Node.js 22 to ${NODE_MIN_VERSION} or newer..."
        brew upgrade "$NODE_BREW_FORMULA"
    else
        echo "    Installing reviewed Homebrew Node.js 22 (${NODE_MIN_VERSION} or newer)..."
        brew install "$NODE_BREW_FORMULA"
    fi

    BREW_NODE_BIN_DIR="$(brew --prefix "$NODE_BREW_FORMULA")/bin"
    if ! use_node_toolchain_dir "$BREW_NODE_BIN_DIR"; then
        echo "Node.js ${NODE_MIN_VERSION} or newer within major 22 with npm is required, but Homebrew did not provide a supported toolchain." >&2
        echo "If the node formula is pinned, unpin and upgrade it intentionally before retrying." >&2
        exit 1
    fi
fi
echo "    Using Node.js $("$NODE_BIN" --version) with npm $("$NPM_BIN" --version) from $(dirname "$NODE_BIN")."

# Yarn
if ! command -v yarn &>/dev/null; then
    echo "    Installing Yarn..."
    brew install yarn
else
    echo "    Yarn is already installed ($(yarn --version))."
fi

# Claude Code
if ! command -v claude &>/dev/null; then
    echo "    Installing Claude Code ${CLAUDE_REVIEWED_VERSION}..."
    "$NPM_BIN" install -g --ignore-scripts --no-fund --no-audit "@anthropic-ai/claude-code@${CLAUDE_REVIEWED_VERSION}"
else
    echo "    Claude Code is already installed ($(claude --version 2>/dev/null || echo 'unknown version'))."
fi

CLAUDE_VERSION_OUTPUT="$(claude --version 2>/dev/null || true)"
if [[ "$CLAUDE_VERSION_OUTPUT" != "$CLAUDE_REVIEWED_VERSION (Claude Code)" ]]; then
    echo "Claude Code must match reviewed baseline $CLAUDE_REVIEWED_VERSION; found: $CLAUDE_VERSION_OUTPUT" >&2
    exit 1
fi

# Codex CLI
if ! command -v codex &>/dev/null; then
    echo "    Installing Codex CLI ${CODEX_REVIEWED_VERSION}..."
    "$NPM_BIN" install -g --ignore-scripts --no-fund --no-audit "@openai/codex@${CODEX_REVIEWED_VERSION}"
else
    echo "    Codex CLI is already installed ($(codex --version 2>/dev/null || echo 'unknown version'))."
fi

CODEX_VERSION_OUTPUT="$(codex --version 2>/dev/null || true)"
if [[ "$CODEX_VERSION_OUTPUT" != "codex-cli $CODEX_REVIEWED_VERSION" ]]; then
    echo "Codex CLI must match reviewed baseline $CODEX_REVIEWED_VERSION; found: $CODEX_VERSION_OUTPUT" >&2
    exit 1
fi

echo "==> Core development tools installed successfully."
