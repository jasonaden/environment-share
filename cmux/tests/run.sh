#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CMUX_DIR="$(dirname "$SCRIPT_DIR")"
REPO_DIR="$(dirname "$CMUX_DIR")"
FIXTURE_BIN="$SCRIPT_DIR/fixtures/bin"
TMP_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/cmux-install-test.XXXXXX")"

cleanup() {
  rm -rf "$TMP_ROOT"
}
trap cleanup EXIT

run_dry() {
  env \
    PATH="$FIXTURE_BIN:$PATH" \
    HOME="$TMP_ROOT/home" \
    PI_CODING_AGENT_DIR="$TMP_ROOT/pi-agent" \
    PI_NODE_BIN_DIR="$FIXTURE_BIN" \
    CODEX_HOME="$TMP_ROOT/codex" \
    CLAUDE_CONFIG_DIR="$TMP_ROOT/claude" \
    PI_SHARED_SKILLS_DIR="$TMP_ROOT/pi-shared" \
    CMUX_AGENT_CATALOG="$TMP_ROOT/catalog" \
    CMUX_AGENT_BACKUP_DIR="$TMP_ROOT/backups" \
    CMUX_AGENT_BIN_DIR="$TMP_ROOT/bin" \
    CMUX_AGENT_SHELL_RC="$TMP_ROOT/home/.zshrc" \
    "$CMUX_DIR/install.sh" --dry-run
}

run_install() {
  env \
    PATH="$FIXTURE_BIN:$PATH" \
    HOME="$TMP_ROOT/home" \
    PI_CODING_AGENT_DIR="$TMP_ROOT/pi-agent" \
    PI_NODE_BIN_DIR="$FIXTURE_BIN" \
    CODEX_HOME="$TMP_ROOT/codex" \
    CLAUDE_CONFIG_DIR="$TMP_ROOT/claude" \
    PI_SHARED_SKILLS_DIR="$TMP_ROOT/pi-shared" \
    CMUX_AGENT_CATALOG="$TMP_ROOT/catalog" \
    CMUX_AGENT_BACKUP_DIR="$TMP_ROOT/backups" \
    CMUX_AGENT_BIN_DIR="$TMP_ROOT/bin" \
    CMUX_AGENT_SHELL_RC="$TMP_ROOT/home/.zshrc" \
    FAKE_CMUX_ARCHIVE="$TMP_ROOT/cmux.tar.gz" \
    "$CMUX_DIR/install.sh"
}

bash -n \
  "$CMUX_DIR/install.sh" \
  "$SCRIPT_DIR/run.sh" \
  "$FIXTURE_BIN/cmux" \
  "$FIXTURE_BIN/curl" \
  "$FIXTURE_BIN/node" \
  "$FIXTURE_BIN/pi"
grep -Fq 'process.exit(a===x&&' "$CMUX_DIR/install.sh" || {
  echo "Cmux Pi-hook preflight must reject unreviewed Node major versions." >&2
  exit 1
}

mkdir -p \
  "$TMP_ROOT/home" \
  "$TMP_ROOT/codex/skills/cmux-orchestrate-agents" \
  "$TMP_ROOT/claude/skills/cmux-orchestrate-agents" \
  "$TMP_ROOT/catalog"
cp -R "$REPO_DIR/agent-skills/cmux-orchestrate-agents/." "$TMP_ROOT/codex/skills/cmux-orchestrate-agents/"
cp -R "$REPO_DIR/agent-skills/cmux-orchestrate-agents/." "$TMP_ROOT/claude/skills/cmux-orchestrate-agents/"
touch "$TMP_ROOT/claude/skills/cmux-orchestrate-agents/local-change"
cp -R "$REPO_DIR/agent-catalog/." "$TMP_ROOT/catalog/"

output="$(run_dry)"
grep -Fq "Codex orchestration skill is already current" <<<"$output"
grep -Fq "would update Claude orchestration skill" <<<"$output"
grep -Fq "would install Pi-shared orchestration skill" <<<"$output"
grep -Fq "shared agent catalog is already current" <<<"$output"
grep -Fq "would install cmux-team launcher" <<<"$output"
grep -Fq "would add $TMP_ROOT/bin to zsh PATH in $TMP_ROOT/home/.zshrc" <<<"$output"
grep -Fq "current/change status for upstream trees cannot be determined without that network fetch" <<<"$output"
grep -Fq "Pi-shared upstream skill cmux" <<<"$output"
[ -f "$TMP_ROOT/claude/skills/cmux-orchestrate-agents/local-change" ]
[ ! -e "$TMP_ROOT/pi-shared" ]
[ ! -e "$TMP_ROOT/backups" ]
[ ! -e "$TMP_ROOT/bin" ]
[ ! -e "$TMP_ROOT/home/.zshrc" ]

printf 'export PATH=%s/bin:%s:$PATH\n' "$TMP_ROOT" "$FIXTURE_BIN" >"$TMP_ROOT/home/.zshrc"
path_current_output="$(run_dry)"
grep -Fq "zsh launcher PATH is already current: $TMP_ROOT/home/.zshrc" <<<"$path_current_output"

if FAKE_CMUX_VERSION=0.64.16 run_dry >"$TMP_ROOT/old-version.out" 2>&1; then
  echo "Unreviewed Cmux unexpectedly passed the exact-version gate." >&2
  exit 1
fi
grep -Fq "Cmux identity does not match the reviewed baseline" "$TMP_ROOT/old-version.out"

if FAKE_CMUX_BUILD=98 run_dry >"$TMP_ROOT/wrong-build.out" 2>&1; then
  echo "Cmux with an unreviewed build unexpectedly passed the identity gate." >&2
  exit 1
fi
grep -Fq "found 'cmux 0.64.17 (98) [9ed29d81a]'" "$TMP_ROOT/wrong-build.out"

if FAKE_CMUX_COMMIT=deadbeef0 run_dry >"$TMP_ROOT/wrong-commit.out" 2>&1; then
  echo "Cmux with an unreviewed commit unexpectedly passed the identity gate." >&2
  exit 1
fi
grep -Fq "found 'cmux 0.64.17 (97) [deadbeef0]'" "$TMP_ROOT/wrong-commit.out"

if FAKE_CMUX_HELP_FAIL=1 run_dry >"$TMP_ROOT/help-gate.out" 2>&1; then
  echo "Cmux without Pi-hook help unexpectedly passed preflight." >&2
  exit 1
fi
grep -Fq "does not support the required 'hooks pi install' interface" "$TMP_ROOT/help-gate.out"

if FAKE_CMUX_HIDE_PI=1 run_dry >"$TMP_ROOT/help-content-gate.out" 2>&1; then
  echo "Cmux help without Pi unexpectedly passed preflight." >&2
  exit 1
fi
grep -Fq "help does not advertise the required Pi hook installer" "$TMP_ROOT/help-content-gate.out"

if FAKE_PI_NODE_UNSUPPORTED=1 run_dry >"$TMP_ROOT/pi-node-gate.out" 2>&1; then
  echo "Pi with an unsupported Node unexpectedly passed preflight." >&2
  exit 1
fi
grep -Fq "Pi is not installed with a sibling Node 22.19.0 or newer within major 22" "$TMP_ROOT/pi-node-gate.out"

archive_root="$TMP_ROOT/archive-source/cmux-9ed29d81a39de3ba44e0654bbcf6bf67ca86d1fb"
for skill in cmux cmux-workspace cmux-diagnostics cmux-browser cmux-markdown; do
  mkdir -p "$archive_root/skills/$skill"
  printf '%s\n' "# $skill fixture" >"$archive_root/skills/$skill/SKILL.md"
done
tar -czf "$TMP_ROOT/cmux.tar.gz" -C "$TMP_ROOT/archive-source" "$(basename "$archive_root")"

printf '# user config\n\n# environment-share command launchers\nexport PATH=%s/bin:$PATH\n' "$TMP_ROOT" >"$TMP_ROOT/home/.zshrc"
install_output="$(run_install)"
grep -Fq "added $TMP_ROOT/bin to zsh PATH in $TMP_ROOT/home/.zshrc" <<<"$install_output"
grep -Fq "installed Pi hook: $TMP_ROOT/pi-agent/extensions/cmux-session.ts" <<<"$install_output"
[ -x "$TMP_ROOT/bin/cmux-team" ]
[ -f "$TMP_ROOT/pi-agent/extensions/cmux-session.ts" ]
grep -Fqx "export PATH=$TMP_ROOT/bin:$FIXTURE_BIN:\$PATH" "$TMP_ROOT/home/.zshrc"
if grep -Fqx "export PATH=$TMP_ROOT/bin:\$PATH" "$TMP_ROOT/home/.zshrc"; then
  echo "Legacy launcher-only PATH line was not migrated." >&2
  exit 1
fi

fresh_launcher="$(
  env -i \
    HOME="$TMP_ROOT/home" \
    ZDOTDIR="$TMP_ROOT/home" \
    PATH="/usr/bin:/bin" \
    /bin/zsh -ic 'command -v cmux-team'
)"
[ "$fresh_launcher" = "$TMP_ROOT/bin/cmux-team" ]

backup_count_before="$(find "$TMP_ROOT/home" -maxdepth 1 -name '.zshrc.backup.*' -type f | wc -l | tr -d ' ')"
second_install_output="$(run_install)"
grep -Fq "zsh launcher PATH is already current: $TMP_ROOT/home/.zshrc" <<<"$second_install_output"
backup_count_after="$(find "$TMP_ROOT/home" -maxdepth 1 -name '.zshrc.backup.*' -type f | wc -l | tr -d ' ')"
[ "$backup_count_before" = "$backup_count_after" ]
[ "$(grep -Fxc "export PATH=$TMP_ROOT/bin:$FIXTURE_BIN:\$PATH" "$TMP_ROOT/home/.zshrc")" -eq 1 ]

rm -f "$TMP_ROOT/home/.zshrc"
printf 'user config\n' >"$TMP_ROOT/home/zshrc-target"
ln -s "$TMP_ROOT/home/zshrc-target" "$TMP_ROOT/home/.zshrc"
if run_dry >"$TMP_ROOT/shell-rc-symlink.out" 2>&1; then
  echo "Symlinked zsh config unexpectedly passed launcher PATH preflight." >&2
  exit 1
fi
grep -Fq "refusing to update zsh PATH through a symlinked shell rc" "$TMP_ROOT/shell-rc-symlink.out"

echo "Cmux installer dry-run, isolated install, fresh-shell, and preflight checks passed."
