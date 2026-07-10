#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$SCRIPT_DIR/skills"

install_for_agent() {
    local agent="$1"
    local target_root="$2"

    mkdir -p "$target_root"

    for skill_dir in "$SKILLS_DIR"/*; do
        [ -d "$skill_dir" ] || continue
        [ -f "$skill_dir/SKILL.md" ] || continue

        local name
        name="$(basename "$skill_dir")"
        local target="$target_root/$name"

        if [ -L "$target" ]; then
            rm "$target"
        elif [ -e "$target" ]; then
            local backup="$target.backup.$(date +%Y%m%d%H%M%S)"
            echo "    Backing up existing $target to $backup"
            mv "$target" "$backup"
        fi

        ln -s "$skill_dir" "$target"
        echo "    Linked $name for $agent"
    done
}

case "${1:-all}" in
    all)
        install_for_agent "Claude Code" "$HOME/.claude/skills"
        install_for_agent "Codex" "${CODEX_HOME:-$HOME/.codex}/skills"
        ;;
    claude)
        install_for_agent "Claude Code" "$HOME/.claude/skills"
        ;;
    codex)
        install_for_agent "Codex" "${CODEX_HOME:-$HOME/.codex}/skills"
        ;;
    *)
        echo "Usage: $0 [all|claude|codex]" >&2
        exit 2
        ;;
esac

echo "==> Shared skills installed. Restart the agent to refresh skill discovery."
