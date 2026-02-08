#!/usr/bin/env bash
set -euo pipefail

echo "==> Installing Claude Code plugins..."

if ! command -v claude &>/dev/null; then
    echo "    ERROR: Claude Code CLI not found. Install it first:"
    echo "    npm install -g @anthropics/claude-code"
    exit 1
fi

PLUGINS=(
    "superpowers@claude-plugins-official"
    "commit-commands@claude-plugins-official"
    "plugin-dev@claude-plugins-official"
    "typescript-lsp@claude-plugins-official"
    "ui-ux-pro-max@ui-ux-pro-max-skill"
)

for plugin in "${PLUGINS[@]}"; do
    echo "    Installing $plugin..."
    claude plugins install "$plugin" 2>/dev/null || echo "    WARNING: Failed to install $plugin (may need manual install)"
done

echo "==> Claude Code plugins installed."
echo "    You can enable/disable plugins in ~/.claude/settings.json under 'enabledPlugins'"
