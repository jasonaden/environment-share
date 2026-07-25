#!/usr/bin/env bash
set -euo pipefail

# Codex plugin installation is intentionally explicit. Add desired plugin IDs
# here so this repository remains the catalog of personal extensions.
PLUGINS=(
    # "github@openai-curated-remote"
)

echo "==> Desired Codex plugins"
if [ "${#PLUGINS[@]}" -eq 0 ]; then
    echo "    No Codex plugins configured."
else
    printf '    %s\n' "${PLUGINS[@]}"
    echo ""
    echo "Install these from the Codex plugin directory, then restart Codex."
fi

echo "Shared skills are installed separately with ./agents/install-skills.sh codex."
