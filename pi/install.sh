#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PI_DIR="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"

if ! command -v node >/dev/null 2>&1 && [ -x "$HOME/.local/share/pi-node/current/bin/node" ]; then
  export PATH="$HOME/.local/share/pi-node/current/bin:$PATH"
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Pi requires Node.js 22.19.0 or newer and npm."
  echo "Install Node first with ../scripts/install-core.sh or https://pi.dev/install.sh."
  exit 1
fi

if ! node -e 'const [a,b,c]=process.versions.node.split(".").map(Number); process.exit(a>22||(a===22&&(b>19||(b===19&&c>=0)))?0:1)'; then
  echo "Pi requires Node.js 22.19.0 or newer; found $(node --version)."
  exit 1
fi

echo "==> Installing the current Pi coding agent..."
npm install -g --ignore-scripts --min-release-age=0 --no-fund --no-audit @earendil-works/pi-coding-agent

PACKAGE_DIR="$(npm root -g)/@earendil-works/pi-coding-agent"
EXAMPLES_DIR="$PACKAGE_DIR/examples/extensions"

if [ ! -d "$EXAMPLES_DIR" ]; then
  echo "Could not find Pi's bundled extension examples at $EXAMPLES_DIR"
  exit 1
fi

install_file() {
  local source="$1"
  local target="$2"
  mkdir -p "$(dirname "$target")"
  if [ -f "$target" ] && ! cmp -s "$source" "$target"; then
    cp "$target" "$target.backup"
  fi
  cp "$source" "$target"
}

echo "==> Installing Pi configuration..."
install_file "$SCRIPT_DIR/settings.json" "$PI_DIR/settings.json"
install_file "$SCRIPT_DIR/AGENTS.md" "$PI_DIR/AGENTS.md"

for source in "$SCRIPT_DIR"/prompts/*.md; do
  install_file "$source" "$PI_DIR/prompts/$(basename "$source")"
done

for source in "$SCRIPT_DIR"/agents/*.md; do
  install_file "$source" "$PI_DIR/agents/$(basename "$source")"
done

# Current upstream examples provide a compatible, reviewable safety and workflow base.
install_file "$EXAMPLES_DIR/permission-gate.ts" "$PI_DIR/extensions/permission-gate.ts"
install_file "$EXAMPLES_DIR/protected-paths.ts" "$PI_DIR/extensions/protected-paths.ts"
install_file "$EXAMPLES_DIR/handoff.ts" "$PI_DIR/extensions/handoff.ts"
install_file "$EXAMPLES_DIR/plan-mode/index.ts" "$PI_DIR/extensions/plan-mode/index.ts"
install_file "$EXAMPLES_DIR/plan-mode/utils.ts" "$PI_DIR/extensions/plan-mode/utils.ts"

# Opt-in profiles: these do not auto-load in normal Pi sessions.
install_file "$SCRIPT_DIR/optional-extensions/purpose-gate.ts" "$PI_DIR/optional-extensions/purpose-gate.ts"
install_file "$EXAMPLES_DIR/subagent/index.ts" "$PI_DIR/optional-extensions/subagent/index.ts"
install_file "$EXAMPLES_DIR/subagent/agents.ts" "$PI_DIR/optional-extensions/subagent/agents.ts"
install_file "$SCRIPT_DIR/optional-extensions/ship-workflow.ts" "$PI_DIR/optional-extensions/ship-workflow.ts"

echo "==> Pi $(pi --version) is installed."
echo "    Config: $PI_DIR"
echo "    Next: run 'pi', then '/login' and choose ChatGPT Plus/Pro (Codex)."
