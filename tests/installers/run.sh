#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
FIXTURE_BIN="$SCRIPT_DIR/fixtures/bin"
NODE_BIN="${INSTALLER_TEST_NODE_BIN:-$HOME/.local/share/pi-node/current/bin/node}"
NODE_BIN_DIR="$(dirname "$NODE_BIN")"
TMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/managed-installer-test.XXXXXX")"

cleanup() {
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT

bash -n \
  "$REPO_DIR/claude/install.sh" \
  "$REPO_DIR/ccstatusline/install.sh" \
  "$REPO_DIR/just/install.sh" \
  "$SCRIPT_DIR/run.sh" \
  "$FIXTURE_BIN/npx"

[ -x "$NODE_BIN" ] || { echo "Installer tests require reviewed Node." >&2; exit 1; }

printf 'claude-outside\n' >"$TMP_ROOT/claude-outside"
mkdir -p "$TMP_ROOT/claude/commands"
ln -s "$TMP_ROOT/claude-outside" "$TMP_ROOT/claude/commands/after-clear.md"
if CLAUDE_CONFIG_DIR="$TMP_ROOT/claude" \
  "$REPO_DIR/claude/install.sh" >"$TMP_ROOT/claude-symlink.out" 2>&1; then
  echo "Claude installer unexpectedly followed a managed command symlink." >&2
  exit 1
fi
grep -Fq 'Refusing to replace a managed Claude symlink' "$TMP_ROOT/claude-symlink.out"
grep -Fxq 'claude-outside' "$TMP_ROOT/claude-outside"

quoted_home="$TMP_ROOT/home'quoted"
mkdir -p "$quoted_home/claude"
printf '{}\n' >"$quoted_home/claude/settings.json"
env \
  HOME="$quoted_home" \
  CLAUDE_CONFIG_DIR="$quoted_home/claude" \
  PATH="$FIXTURE_BIN:$NODE_BIN_DIR:/usr/bin:/bin" \
  "$REPO_DIR/ccstatusline/install.sh" >"$TMP_ROOT/ccstatusline-quoted.out"
"$NODE_BIN" -e '
  const fs = require("node:fs");
  const value = JSON.parse(fs.readFileSync(process.argv[1], "utf8"));
  if (value.statusLine?.command !== "npx -y ccstatusline@2.2.22") process.exit(1);
' "$quoted_home/claude/settings.json"

cc_home="$TMP_ROOT/cc-home"
mkdir -p "$cc_home/.config/ccstatusline" "$cc_home/claude"
printf 'cc-outside\n' >"$TMP_ROOT/cc-outside"
ln -s "$TMP_ROOT/cc-outside" "$cc_home/.config/ccstatusline/settings.json"
printf '{}\n' >"$cc_home/claude/settings.json"
if env \
  HOME="$cc_home" \
  CLAUDE_CONFIG_DIR="$cc_home/claude" \
  PATH="$FIXTURE_BIN:$NODE_BIN_DIR:/usr/bin:/bin" \
  "$REPO_DIR/ccstatusline/install.sh" >"$TMP_ROOT/cc-symlink.out" 2>&1; then
  echo "ccstatusline installer unexpectedly followed a managed config symlink." >&2
  exit 1
fi
grep -Fq 'refusing to replace managed symlink' "$TMP_ROOT/cc-symlink.out"
grep -Fxq 'cc-outside' "$TMP_ROOT/cc-outside"

cc_settings_home="$TMP_ROOT/cc-settings-home"
mkdir -p "$cc_settings_home/claude"
printf 'settings-outside\n' >"$TMP_ROOT/cc-settings-outside"
ln -s "$TMP_ROOT/cc-settings-outside" "$cc_settings_home/claude/settings.json"
if env \
  HOME="$cc_settings_home" \
  CLAUDE_CONFIG_DIR="$cc_settings_home/claude" \
  PATH="$FIXTURE_BIN:$NODE_BIN_DIR:/usr/bin:/bin" \
  "$REPO_DIR/ccstatusline/install.sh" >"$TMP_ROOT/cc-settings-symlink.out" 2>&1; then
  echo "ccstatusline installer unexpectedly followed Claude settings symlink." >&2
  exit 1
fi
grep -Fq 'refusing to replace symlinked Claude settings' "$TMP_ROOT/cc-settings-symlink.out"
grep -Fxq 'settings-outside' "$TMP_ROOT/cc-settings-outside"

just_home="$TMP_ROOT/just-home"
mkdir -p "$just_home"
printf 'just-outside\n' >"$TMP_ROOT/just-outside"
ln -s "$TMP_ROOT/just-outside" "$just_home/justfile"
if HOME="$just_home" "$REPO_DIR/just/install.sh" >"$TMP_ROOT/just-symlink.out" 2>&1; then
  echo "Just installer unexpectedly followed a managed justfile symlink." >&2
  exit 1
fi
grep -Fq 'Refusing to replace symlinked justfile' "$TMP_ROOT/just-symlink.out"
grep -Fxq 'just-outside' "$TMP_ROOT/just-outside"

echo "Managed installer symlink and quoting checks passed."
