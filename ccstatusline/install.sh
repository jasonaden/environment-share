#!/usr/bin/env bash
set -euo pipefail

# ccstatusline installer
# Installs ccstatusline config and hooks it into Claude Code settings.
#
# Usage:
#   ./install.sh              — install from local settings.json

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CCSTATUSLINE_CONFIG_DIR="${HOME}/.config/ccstatusline"
CLAUDE_SETTINGS="${CLAUDE_CONFIG_DIR:-${HOME}/.claude}/settings.json"
SETTINGS_SOURCE="${SCRIPT_DIR}/settings.json"
CCSTATUSLINE_VERSION="2.2.22"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m'

info()  { echo -e "${CYAN}==> ${NC}$1"; }
ok()    { echo -e "${GREEN} ✓  ${NC}$1"; }
warn()  { echo -e "${YELLOW} !  ${NC}$1"; }

atomic_copy_with_backup() {
    local source="$1"
    local target="$2"
    local parent
    local backup
    local base
    local suffix=0
    local stage
    parent="$(dirname "$target")"
    if [ -L "$target" ]; then
        echo "Error: refusing to replace managed symlink $target" >&2
        exit 1
    fi
    if [ -e "$target" ] && [ ! -f "$target" ]; then
        echo "Error: refusing to replace non-file target $target" >&2
        exit 1
    fi
    mkdir -p "$parent"
    if [ -f "$target" ] && cmp -s "$source" "$target"; then
        return
    fi
    if [ -f "$target" ]; then
        base="$target.backup.$(date -u +%Y%m%dT%H%M%SZ)"
        backup="$base"
        while [ -e "$backup" ] || [ -L "$backup" ]; do
            suffix=$((suffix + 1))
            backup="$base.$suffix"
        done
        cp -pP "$target" "$backup"
        warn "Backed up existing config to $backup"
    fi
    stage="$(mktemp "$parent/.managed-file.tmp.XXXXXX")"
    if ! cp -p "$source" "$stage"; then
        rm -f "$stage"
        exit 1
    fi
    mv -f "$stage" "$target"
}

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

if [ -L "$CCSTATUSLINE_CONFIG_DIR" ]; then
    echo "Error: refusing managed writes through symlink $CCSTATUSLINE_CONFIG_DIR" >&2
    exit 1
fi
if [ -L "$CCSTATUSLINE_CONFIG_DIR/settings.json" ]; then
    echo "Error: refusing to replace managed symlink $CCSTATUSLINE_CONFIG_DIR/settings.json" >&2
    exit 1
fi
if [ -L "$CLAUDE_SETTINGS" ]; then
    echo "Error: refusing to replace symlinked Claude settings $CLAUDE_SETTINGS" >&2
    exit 1
fi
if [ -e "$CLAUDE_SETTINGS" ] && [ ! -f "$CLAUDE_SETTINGS" ]; then
    echo "Error: Claude settings target is not a regular file: $CLAUDE_SETTINGS" >&2
    exit 1
fi

# 2. Install ccstatusline config
info "Installing ccstatusline config..."
mkdir -p "$CCSTATUSLINE_CONFIG_DIR"
atomic_copy_with_backup "$SETTINGS_SOURCE" "$CCSTATUSLINE_CONFIG_DIR/settings.json"
ok "Config installed to $CCSTATUSLINE_CONFIG_DIR/settings.json"

# 3. Configure Claude Code to use ccstatusline
info "Configuring Claude Code status line..."

if [ ! -f "$CLAUDE_SETTINGS" ]; then
    mkdir -p "$(dirname "$CLAUDE_SETTINGS")"
    initial_settings="$(mktemp "$(dirname "$CLAUDE_SETTINGS")/.settings.initial.XXXXXX")"
    printf '{}\n' >"$initial_settings"
    chmod 600 "$initial_settings"
    mv "$initial_settings" "$CLAUDE_SETTINGS"
    warn "Created new Claude settings file"
fi

# Use jq if available, otherwise use node for JSON manipulation
STATUSLINE_JSON="{\"type\":\"command\",\"command\":\"npx -y ccstatusline@${CCSTATUSLINE_VERSION}\",\"padding\":0}"

tmp="$(mktemp "$(dirname "$CLAUDE_SETTINGS")/.settings.statusline.XXXXXX")"
if command -v jq &>/dev/null; then
    if ! jq --argjson sl "$STATUSLINE_JSON" '.statusLine = $sl' "$CLAUDE_SETTINGS" >"$tmp"; then
        rm -f "$tmp"
        exit 1
    fi
elif command -v node &>/dev/null; then
    if ! node -e '
        const fs = require("fs");
        const settings = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
        settings.statusLine = JSON.parse(process.argv[3]);
        fs.writeFileSync(process.argv[2], JSON.stringify(settings, null, 2) + "\n");
    ' "$CLAUDE_SETTINGS" "$tmp" "$STATUSLINE_JSON"; then
        rm -f "$tmp"
        exit 1
    fi
else
    rm -f "$tmp"
    warn "Could not auto-configure Claude settings (no jq or node). Add this to $CLAUDE_SETTINGS manually:"
    echo ""
    echo "  \"statusLine\": { \"type\": \"command\", \"command\": \"npx -y ccstatusline@${CCSTATUSLINE_VERSION}\", \"padding\": 0 }"
    echo ""
fi

if [ -f "$tmp" ]; then
    if cmp -s "$tmp" "$CLAUDE_SETTINGS"; then
        rm -f "$tmp"
    else
        settings_backup_base="$CLAUDE_SETTINGS.backup.$(date -u +%Y%m%dT%H%M%SZ)"
        settings_backup="$settings_backup_base"
        settings_backup_suffix=0
        while [ -e "$settings_backup" ] || [ -L "$settings_backup" ]; do
            settings_backup_suffix=$((settings_backup_suffix + 1))
            settings_backup="$settings_backup_base.$settings_backup_suffix"
        done
        cp -pP "$CLAUDE_SETTINGS" "$settings_backup"
        warn "Backed up Claude settings to $settings_backup"
        chmod 600 "$tmp"
        mv -f "$tmp" "$CLAUDE_SETTINGS"
    fi
fi

ok "Claude Code configured to use ccstatusline"

# 4. Pre-cache the package so first launch is fast
info "Pre-caching ccstatusline..."
if command -v npx &>/dev/null; then
    npx -y "ccstatusline@${CCSTATUSLINE_VERSION}" --version &>/dev/null 2>&1 || true
elif command -v bunx &>/dev/null; then
    bunx "ccstatusline@${CCSTATUSLINE_VERSION}" --version &>/dev/null 2>&1 || true
fi
ok "Package cached"

echo ""
echo "  Done! Restart Claude Code to see the status line."
echo ""
echo "  Layout:"
echo "    Line 1: Model | Context% | In/Out/Cached | Branch | Worktree | Changes"
echo "    Line 2: cwd"
echo ""
echo "  To customize this reviewed release: run 'npx ccstatusline@${CCSTATUSLINE_VERSION}' in your terminal"
echo ""
