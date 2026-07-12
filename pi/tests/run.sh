#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PI_DIR="$(dirname "$SCRIPT_DIR")"
REPO_DIR="$(dirname "$PI_DIR")"
NODE_BIN="${PI_TEST_NODE_BIN:-$HOME/.local/share/pi-node/current/bin/node}"
FIXTURE_BIN="$SCRIPT_DIR/fixtures/bin"
TMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/pi-install-test.XXXXXX")"

cleanup() {
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT

if [ ! -x "$NODE_BIN" ]; then
  NODE_BIN="$(command -v node)"
fi

bash -n "$PI_DIR/install.sh" "$SCRIPT_DIR/run.sh" "$FIXTURE_BIN/node" "$FIXTURE_BIN/npm"
"$NODE_BIN" -e 'JSON.parse(require("node:fs").readFileSync(process.argv[1], "utf8"))' "$PI_DIR/settings.json"
"$NODE_BIN" --experimental-strip-types --test "$SCRIPT_DIR"/*.test.mjs

if ! grep -q 'readonly PI_CODING_AGENT_VERSION="0.80.6"' "$PI_DIR/install.sh"; then
  echo "Pi version pin is missing or unexpected." >&2
  exit 1
fi

if ! grep -q 'readonly PI_NODE_MIN_VERSION="22.19.0"' "$PI_DIR/install.sh"; then
  echo "Pi Node.js minimum is missing or unexpected." >&2
  exit 1
fi

if ! grep -Fq 'process.exit(a===x&&' "$PI_DIR/install.sh"; then
  echo "Pi Node.js policy must reject unreviewed major versions." >&2
  exit 1
fi

if ! grep -q 'CMUX_AGENT_REPOSITORY=.*pi --tools read,grep,ls --no-session --no-approve' "$REPO_DIR/just/justfile"; then
  echo "The automated Pi review recipe must remain no-approve." >&2
  exit 1
fi

if ! grep -q 'pi-repository-guard.ts' "$REPO_DIR/just/justfile"; then
  echo "The automated Pi review recipe must load the repository path guard." >&2
  exit 1
fi

env \
  HOME="$TMP_ROOT/home" \
  PATH="$FIXTURE_BIN:/usr/bin:/bin" \
  PI_NODE_BIN_DIR="$TMP_ROOT/stable/current/bin" \
  PI_CODING_AGENT_DIR="$TMP_ROOT/pi-agent" \
  "$PI_DIR/install.sh" >"$TMP_ROOT/fresh-install.out"

for tool in node npm pi; do
  [ -x "$TMP_ROOT/stable/current/bin/$tool" ] || {
    echo "Fresh Pi install did not persist stable $tool." >&2
    exit 1
  }
done
env PATH="$TMP_ROOT/stable/current/bin:/usr/bin:/bin" \
  "$TMP_ROOT/stable/current/bin/pi" --version | grep -Fxq '0.80.6'

printf 'outside-canary\n' >"$TMP_ROOT/outside-managed-file"
rm -f "$TMP_ROOT/pi-agent/AGENTS.md"
ln -s "$TMP_ROOT/outside-managed-file" "$TMP_ROOT/pi-agent/AGENTS.md"
if env \
  HOME="$TMP_ROOT/home" \
  PATH="$FIXTURE_BIN:/usr/bin:/bin" \
  PI_NODE_BIN_DIR="$TMP_ROOT/stable/current/bin" \
  PI_CODING_AGENT_DIR="$TMP_ROOT/pi-agent" \
  "$PI_DIR/install.sh" >"$TMP_ROOT/symlink-install.out" 2>&1; then
  echo "Pi installer unexpectedly followed a managed-file symlink." >&2
  exit 1
fi
grep -Fq 'Refusing to replace a managed Pi symlink' "$TMP_ROOT/symlink-install.out"
grep -Fxq 'outside-canary' "$TMP_ROOT/outside-managed-file"

echo "Pi static and unit checks passed."
