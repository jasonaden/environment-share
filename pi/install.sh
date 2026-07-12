#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PI_DIR="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}"
PI_NODE_BIN_DIR="${PI_NODE_BIN_DIR:-$HOME/.local/share/pi-node/current/bin}"

# Update this pin intentionally after reviewing the matching upstream examples
# copied below and running pi/tests/run.sh.
readonly PI_CODING_AGENT_VERSION="0.80.6"
readonly PI_CODING_AGENT_PACKAGE="@earendil-works/pi-coding-agent"
readonly PI_NODE_MIN_VERSION="22.19.0"

for managed_dir in \
  "$PI_DIR" \
  "$PI_DIR/prompts" \
  "$PI_DIR/agents" \
  "$PI_DIR/extensions" \
  "$PI_DIR/optional-extensions"; do
  if [ -L "$managed_dir" ]; then
    echo "Refusing managed Pi writes through a symlinked directory: $managed_dir" >&2
    exit 1
  fi
done

managed_targets=(
  "$PI_DIR/settings.json"
  "$PI_DIR/AGENTS.md"
  "$PI_DIR/extensions/permission-gate.ts"
  "$PI_DIR/extensions/protected-paths.ts"
  "$PI_DIR/extensions/handoff.ts"
  "$PI_DIR/extensions/plan-mode/index.ts"
  "$PI_DIR/extensions/plan-mode/utils.ts"
  "$PI_DIR/optional-extensions/purpose-gate.ts"
  "$PI_DIR/optional-extensions/subagent/index.ts"
  "$PI_DIR/optional-extensions/subagent/agents.ts"
  "$PI_DIR/optional-extensions/ship-workflow.ts"
)
for source in "$SCRIPT_DIR"/prompts/*.md; do
  managed_targets+=("$PI_DIR/prompts/$(basename "$source")")
done
for source in "$SCRIPT_DIR"/agents/*.md; do
  managed_targets+=("$PI_DIR/agents/$(basename "$source")")
done
for managed_target in "${managed_targets[@]}"; do
  if [ -L "$managed_target" ]; then
    echo "Refusing to replace a managed Pi symlink: $managed_target" >&2
    exit 1
  fi
  if [ -e "$managed_target" ] && [ ! -f "$managed_target" ]; then
    echo "Refusing to replace a non-file managed Pi target: $managed_target" >&2
    exit 1
  fi
done

node_is_supported() {
  local node_bin="$1"
  "$node_bin" -e 'const parse=(v)=>v.split(".").map(Number); const [a,b,c]=parse(process.versions.node); const [x,y,z]=parse(process.argv[1]); process.exit(a===x&&(b>y||(b===y&&c>=z))?0:1)' "$PI_NODE_MIN_VERSION"
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

resolve_node_toolchain() {
  local bin_dir

  if use_node_toolchain_dir "$PI_NODE_BIN_DIR"; then
    return
  fi

  if command -v node >/dev/null 2>&1 && command -v npm >/dev/null 2>&1 && node_is_supported "$(command -v node)"; then
    NODE_BIN="$(command -v node)"
    NPM_BIN="$(command -v npm)"
    return
  fi

  # install-core.sh may have installed or upgraded Homebrew Node in a child
  # process, so its PATH update is not visible to this standalone installer.
  for bin_dir in /opt/homebrew/opt/node@22/bin /usr/local/opt/node@22/bin /opt/homebrew/bin /usr/local/bin; do
    if use_node_toolchain_dir "$bin_dir"; then
      return
    fi
  done

  echo "Pi requires Node.js ${PI_NODE_MIN_VERSION} or newer within major 22 and npm."
  echo "Install Node first with ../scripts/install-core.sh or https://pi.dev/install.sh."
  exit 1
}

resolve_node_toolchain

if [ "$(basename "$PI_NODE_BIN_DIR")" != "bin" ]; then
  echo "PI_NODE_BIN_DIR must name a bin directory: $PI_NODE_BIN_DIR"
  exit 1
fi
PI_INSTALL_PREFIX="$(dirname "$PI_NODE_BIN_DIR")"

install_stable_tool_link() {
  local source="$1"
  local target="$2"
  mkdir -p "$(dirname "$target")"
  if [ -e "$target" ] || [ -L "$target" ]; then
    if [ "$target" -ef "$source" ]; then
      return
    fi
    echo "Refusing to replace a conflicting stable Pi tool: $target"
    exit 1
  fi
  ln -s "$source" "$target"
}

# Persist the selected toolchain at the documented path so the later Cmux
# installer (a separate child process) can deterministically rediscover Pi and
# its sibling Node without relying on an inherited PATH.
install_stable_tool_link "$NODE_BIN" "$PI_NODE_BIN_DIR/node"
install_stable_tool_link "$NPM_BIN" "$PI_NODE_BIN_DIR/npm"
NODE_BIN="$PI_NODE_BIN_DIR/node"
NPM_BIN="$PI_NODE_BIN_DIR/npm"
export PATH="$PI_NODE_BIN_DIR:$PATH"

echo "==> Installing Pi ${PI_CODING_AGENT_VERSION}..."
"$NPM_BIN" install -g --prefix "$PI_INSTALL_PREFIX" --ignore-scripts --no-fund --no-audit "${PI_CODING_AGENT_PACKAGE}@${PI_CODING_AGENT_VERSION}"

PACKAGE_DIR="$PI_INSTALL_PREFIX/lib/node_modules/${PI_CODING_AGENT_PACKAGE}"
EXAMPLES_DIR="$PACKAGE_DIR/examples/extensions"
PI_BIN="$PI_NODE_BIN_DIR/pi"

if [ ! -d "$EXAMPLES_DIR" ]; then
  echo "Could not find Pi's bundled extension examples at $EXAMPLES_DIR"
  exit 1
fi

if [ ! -x "$PI_BIN" ]; then
  echo "Could not find the installed Pi executable at $PI_BIN"
  exit 1
fi

installed_version="$("$NODE_BIN" -e 'const fs=require("node:fs"); const p=JSON.parse(fs.readFileSync(process.argv[1], "utf8")); process.stdout.write(p.version)' "$PACKAGE_DIR/package.json")"
if [ "$installed_version" != "$PI_CODING_AGENT_VERSION" ]; then
  echo "Expected Pi $PI_CODING_AGENT_VERSION but npm installed $installed_version."
  exit 1
fi

backup_file() {
  local target="$1"
  local timestamp
  local backup
  local suffix=0
  timestamp="$(date -u +"%Y%m%dT%H%M%SZ")"
  backup="$target.backup.$timestamp"
  while [ -e "$backup" ] || [ -L "$backup" ]; do
    suffix=$((suffix + 1))
    backup="$target.backup.$timestamp.$suffix"
  done
  cp -pP "$target" "$backup"
}

install_file() {
  local source="$1"
  local target="$2"
  local parent
  local stage
  parent="$(dirname "$target")"
  if [ -L "$parent" ]; then
    echo "Refusing managed Pi writes through a symlinked directory: $parent" >&2
    exit 1
  fi
  mkdir -p "$parent"
  if [ -L "$target" ]; then
    echo "Refusing to replace a managed Pi symlink: $target" >&2
    exit 1
  fi
  if [ -e "$target" ] && [ ! -f "$target" ]; then
    echo "Refusing to replace a non-file managed Pi target: $target" >&2
    exit 1
  fi
  if [ -f "$target" ] && cmp -s "$source" "$target"; then
    return
  fi
  if [ -f "$target" ]; then
    backup_file "$target"
  fi
  stage="$(mktemp "$parent/.managed-file.tmp.XXXXXX")"
  if ! cp -p "$source" "$stage"; then
    rm -f "$stage"
    exit 1
  fi
  mv -f "$stage" "$target"
}

echo "==> Installing Pi configuration..."
"$NODE_BIN" "$SCRIPT_DIR/scripts/merge-settings.mjs" "$SCRIPT_DIR/settings.json" "$PI_DIR/settings.json"
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

echo "==> Pi $(env PATH="$(dirname "$NODE_BIN"):$PATH" "$PI_BIN" --version) is installed."
echo "    Config: $PI_DIR"
echo "    Next: run 'pi', then '/login' and choose ChatGPT Plus/Pro (Codex)."
