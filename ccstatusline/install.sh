#!/usr/bin/env bash
set -euo pipefail

# ccstatusline installer
# Installs ccstatusline config and hooks it into Claude Code settings.
#
# Usage:
#   ./install.sh              — install from local settings.json
#   curl -fsSL <url> | bash   — pipe-friendly (downloads settings.json from same dir)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CCSTATUSLINE_CONFIG_DIR="${HOME}/.config/ccstatusline"
CLAUDE_SETTINGS="${CLAUDE_CONFIG_DIR:-${HOME}/.claude}/settings.json"
SETTINGS_SOURCE="${SCRIPT_DIR}/settings.json"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}==> ${NC}$1"; }
ok()    { echo -e "${GREEN} ✓  ${NC}$1"; }
warn()  { echo -e "${YELLOW} !  ${NC}$1"; }

echo ""
echo "  ccstatusline installer"
echo "  ────────────────────────────────────────"
echo ""

# 1. Check prerequisites
if ! command -v node &>/dev/null && ! command -v bun &>/dev/null; then
    echo "Error: Node.js or Bun is required. Install one first."
    exit 1
fi

if ! command -v npx &>/dev/null && ! command -v bunx &>/dev/null; then
    echo "Error: npx or bunx is required."
    exit 1
fi

# 2. Install ccstatusline config
info "Installing ccstatusline config..."
mkdir -p "$CCSTATUSLINE_CONFIG_DIR"

if [ -f "$CCSTATUSLINE_CONFIG_DIR/settings.json" ]; then
    cp "$CCSTATUSLINE_CONFIG_DIR/settings.json" "$CCSTATUSLINE_CONFIG_DIR/settings.json.backup"
    warn "Backed up existing config to settings.json.backup"
fi

cp "$SETTINGS_SOURCE" "$CCSTATUSLINE_CONFIG_DIR/settings.json"
ok "Config installed to $CCSTATUSLINE_CONFIG_DIR/settings.json"

# 3. Configure Claude Code to use ccstatusline
info "Configuring Claude Code status line..."

if [ ! -f "$CLAUDE_SETTINGS" ]; then
    mkdir -p "$(dirname "$CLAUDE_SETTINGS")"
    echo '{}' > "$CLAUDE_SETTINGS"
    warn "Created new Claude settings file"
fi

# Use jq if available, otherwise use node for JSON manipulation
STATUSLINE_JSON='{"type":"command","command":"npx -y ccstatusline@latest","padding":0}'

if command -v jq &>/dev/null; then
    tmp=$(mktemp)
    jq --argjson sl "$STATUSLINE_JSON" '.statusLine = $sl' "$CLAUDE_SETTINGS" > "$tmp" && mv "$tmp" "$CLAUDE_SETTINGS"
elif command -v node &>/dev/null; then
    node -e "
        const fs = require('fs');
        const settings = JSON.parse(fs.readFileSync('$CLAUDE_SETTINGS', 'utf8'));
        settings.statusLine = $STATUSLINE_JSON;
        fs.writeFileSync('$CLAUDE_SETTINGS', JSON.stringify(settings, null, 2) + '\n');
    "
else
    warn "Could not auto-configure Claude settings (no jq or node). Add this to $CLAUDE_SETTINGS manually:"
    echo ""
    echo '  "statusLine": { "type": "command", "command": "npx -y ccstatusline@latest", "padding": 0 }'
    echo ""
fi

ok "Claude Code configured to use ccstatusline"

# 4. Pre-cache the package so first launch is fast
info "Pre-caching ccstatusline..."
if command -v npx &>/dev/null; then
    npx -y ccstatusline@latest --version &>/dev/null 2>&1 || true
elif command -v bunx &>/dev/null; then
    bunx ccstatusline@latest --version &>/dev/null 2>&1 || true
fi
ok "Package cached"

echo ""
echo "  Done! Restart Claude Code to see the status line."
echo ""
echo "  Layout:"
echo "    Line 1: Model | Context% | In/Out/Cached | Branch | Worktree | Changes"
echo "    Line 2: cwd"
echo ""
echo "  To customize: run 'npx ccstatusline@latest' in your terminal"
echo ""
