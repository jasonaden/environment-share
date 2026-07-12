#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(dirname "$SCRIPT_DIR")"
LOCK_FILE="$SCRIPT_DIR/upstream-skills.lock.json"
CANONICAL_SKILL="$REPO_DIR/agent-skills/cmux-orchestrate-agents"
CANONICAL_CATALOG="$REPO_DIR/agent-catalog"

CODEX_SKILLS_DIR="${CODEX_HOME:-$HOME/.codex}/skills"
CLAUDE_ROOT="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
CLAUDE_SKILLS_DIR="$CLAUDE_ROOT/skills"
PI_SHARED_SKILLS_DIR="${PI_SHARED_SKILLS_DIR:-$HOME/.claude/skills}"
PI_NODE_BIN_DIR="${PI_NODE_BIN_DIR:-$HOME/.local/share/pi-node/current/bin}"
CATALOG_DEST="${CMUX_AGENT_CATALOG:-$HOME/.config/cmux-agent-orchestration/catalog}"
SKILL_BACKUP_ROOT="${CMUX_AGENT_BACKUP_DIR:-$HOME/.local/state/environment-share/skill-backups}"
USER_BIN_DIR="${CMUX_AGENT_BIN_DIR:-$HOME/.local/bin}"
SHELL_RC="${CMUX_AGENT_SHELL_RC:-${ZDOTDIR:-$HOME}/.zshrc}"

PINNED_COMMIT="9ed29d81a39de3ba44e0654bbcf6bf67ca86d1fb"
PINNED_SKILLS="cmux cmux-workspace cmux-diagnostics cmux-browser cmux-markdown"
CMUX_REVIEWED_VERSION="0.64.17"
CMUX_REVIEWED_IDENTITY="cmux 0.64.17 (97) [9ed29d81a]"
PI_NODE_MIN_VERSION="22.19.0"
DRY_RUN=false
UPSTREAM_TMP=""
PATH_ACTIVATION_NEEDED=false
PATH_LINE=""
LEGACY_PATH_LINE=""

usage() {
  cat <<'EOF'
Usage: ./cmux/install.sh [--dry-run]

Install the local Cmux orchestration skill and role catalog, install the
selected official Cmux skills from the repository's exact lockfile commit,
install the native Cmux Pi hook, and make the installed cmux-team launcher
discoverable from new zsh terminals. Pi discovers ~/.claude/skills; when Claude
uses a custom config root, both discovery directories are updated. The dry run
compares local trees without writes or network access; exact upstream
comparisons require the normal pinned-archive fetch.
EOF
}

die() {
  echo "cmux install: $*" >&2
  exit 1
}

cleanup() {
  if [ -n "$UPSTREAM_TMP" ] && [ -d "$UPSTREAM_TMP" ]; then
    rm -rf "$UPSTREAM_TMP"
  fi
}
trap cleanup EXIT

case "${1:-}" in
  "") ;;
  --dry-run) DRY_RUN=true ;;
  -h|--help) usage; exit 0 ;;
  *) usage >&2; exit 2 ;;
esac

timestamp() {
  date -u +%Y%m%dT%H%M%SZ
}

sync_tree() {
  local source="$1"
  local destination="$2"
  local label="$3"
  local parent
  local base
  local stage
  local backup
  local backup_dir
  local safe_label

  [ -d "$source" ] || die "missing $label source: $source"

  if [ -d "$destination" ] && diff -qr "$source" "$destination" >/dev/null 2>&1; then
    echo "    $label is already current: $destination"
    return
  fi

  if $DRY_RUN; then
    if [ -e "$destination" ] || [ -L "$destination" ]; then
      echo "    would update $label and preserve the changed tree under $SKILL_BACKUP_ROOT"
    else
      echo "    would install $label"
    fi
    echo "      from: $source"
    echo "      to:   $destination"
    return
  fi

  parent="$(dirname "$destination")"
  base="$(basename "$destination")"
  mkdir -p "$parent"
  stage="$(mktemp -d "$parent/.${base}.tmp.XXXXXX")"
  cp -R "$source/." "$stage/"

  if [ -e "$destination" ] || [ -L "$destination" ]; then
    safe_label="${label// /-}"
    backup_dir="$SKILL_BACKUP_ROOT/$(timestamp)"
    mkdir -p "$backup_dir"
    backup="$backup_dir/${safe_label}.${base}"
    if [ -e "$backup" ] || [ -L "$backup" ]; then
      backup="${backup}.$$"
    fi
    mv "$destination" "$backup"
    echo "    backed up $label to $backup"
  fi

  mv "$stage" "$destination"
  echo "    installed $label: $destination"
}

sync_executable() {
  local source="$1"
  local destination="$2"
  local label="$3"
  local backup_dir
  local backup
  local stage

  [ -f "$source" ] || die "missing $label source: $source"
  if [ -f "$destination" ] && [ -x "$destination" ] && cmp -s "$source" "$destination"; then
    echo "    $label is already current: $destination"
    return
  fi
  if $DRY_RUN; then
    if [ -e "$destination" ] || [ -L "$destination" ]; then
      echo "    would update $label and preserve the previous file under $SKILL_BACKUP_ROOT"
    else
      echo "    would install $label: $destination"
    fi
    return
  fi
  mkdir -p "$(dirname "$destination")"
  stage="$(mktemp "$(dirname "$destination")/.cmux-team.tmp.XXXXXX")"
  cp "$source" "$stage"
  chmod 0755 "$stage"
  if [ -e "$destination" ] || [ -L "$destination" ]; then
    backup_dir="$SKILL_BACKUP_ROOT/$(timestamp)"
    mkdir -p "$backup_dir"
    backup="$backup_dir/cmux-team"
    [ ! -e "$backup" ] && [ ! -L "$backup" ] || backup="$backup.$$"
    mv "$destination" "$backup"
    echo "    backed up $label to $backup"
  fi
  mv "$stage" "$destination"
  echo "    installed $label: $destination"
}

ensure_launcher_path() {
  local parent
  local backup_base
  local backup
  local backup_suffix=0
  local stage

  if [ -f "$SHELL_RC" ] && grep -Fqx "$PATH_LINE" "$SHELL_RC"; then
    echo "    zsh launcher PATH is already current: $SHELL_RC"
    return
  fi
  if [ -L "$SHELL_RC" ]; then
    die "refusing to update zsh PATH through a symlinked shell rc: $SHELL_RC"
  fi
  if [ -e "$SHELL_RC" ] && [ ! -f "$SHELL_RC" ]; then
    die "refusing to replace a non-file shell rc: $SHELL_RC"
  fi

  PATH_ACTIVATION_NEEDED=true
  if $DRY_RUN; then
    echo "    would add $USER_BIN_DIR to zsh PATH in $SHELL_RC"
    return
  fi

  parent="$(dirname "$SHELL_RC")"
  if [ -L "$parent" ]; then
    die "refusing to update zsh PATH through a symlinked shell config directory: $parent"
  fi
  mkdir -p "$parent"

  if [ -f "$SHELL_RC" ]; then
    backup_base="$SHELL_RC.backup.$(timestamp)"
    backup="$backup_base"
    while [ -e "$backup" ] || [ -L "$backup" ]; do
      backup_suffix=$((backup_suffix + 1))
      backup="$backup_base.$backup_suffix"
    done
    cp -pP "$SHELL_RC" "$backup"
    echo "    backed up zsh config to $backup"
  fi

  stage="$(mktemp "$parent/.zshrc.tmp.XXXXXX")"
  if [ -f "$SHELL_RC" ]; then
    if ! cp -p "$SHELL_RC" "$stage"; then
      rm -f "$stage"
      exit 1
    fi
    python3 - "$stage" "$LEGACY_PATH_LINE" <<'PY'
import pathlib
import sys

path = pathlib.Path(sys.argv[1])
legacy = sys.argv[2]
text = path.read_text(encoding="utf-8")
legacy_block = f"\n# environment-share command launchers\n{legacy}\n"
if legacy_block in text:
    text = text.replace(legacy_block, "\n", 1)
elif text.startswith(f"# environment-share command launchers\n{legacy}\n"):
    text = text.removeprefix(f"# environment-share command launchers\n{legacy}\n")
path.write_text(text, encoding="utf-8")
PY
  fi
  if ! printf '\n# environment-share command launchers\n%s\n' "$PATH_LINE" >>"$stage"; then
    rm -f "$stage"
    exit 1
  fi
  mv -f "$stage" "$SHELL_RC"
  echo "    added $USER_BIN_DIR to zsh PATH in $SHELL_RC"
}

preview_upstream_tree() {
  local destination="$1"
  local label="$2"

  if [ -e "$destination" ] || [ -L "$destination" ]; then
    echo "    would compare $label after fetching the pinned archive: $destination"
    echo "      would back up and replace it only if its contents differ"
  else
    echo "    would install $label: $destination"
  fi
}

resolve_cmux() {
  if command -v cmux >/dev/null 2>&1; then
    command -v cmux
  elif [ -x /opt/homebrew/bin/cmux ]; then
    echo /opt/homebrew/bin/cmux
  elif [ -x /Applications/cmux.app/Contents/Resources/bin/cmux ]; then
    echo /Applications/cmux.app/Contents/Resources/bin/cmux
  else
    return 1
  fi
}

pi_node_is_supported() {
  local node_bin="$1"
  "$node_bin" -e 'const parse=(v)=>v.split(".").map(Number); const [a,b,c]=parse(process.versions.node); const [x,y,z]=parse(process.argv[1]); process.exit(a===x&&(b>y||(b===y&&c>=z))?0:1)' "$PI_NODE_MIN_VERSION"
}

resolve_pi() {
  local bin_dir

  if [ -x "$PI_NODE_BIN_DIR/pi" ] && [ -x "$PI_NODE_BIN_DIR/node" ] \
    && pi_node_is_supported "$PI_NODE_BIN_DIR/node"; then
    echo "$PI_NODE_BIN_DIR/pi"
    return
  fi

  if command -v pi >/dev/null 2>&1; then
    bin_dir="$(dirname "$(command -v pi)")"
    if [ -x "$bin_dir/node" ] && pi_node_is_supported "$bin_dir/node"; then
      command -v pi
      return
    fi
  fi

  # install-all.sh runs installers as child processes, so a Homebrew PATH
  # selected by install-core.sh is not inherited here.
  for bin_dir in /opt/homebrew/bin /usr/local/bin; do
    if [ -x "$bin_dir/pi" ] && [ -x "$bin_dir/node" ] && pi_node_is_supported "$bin_dir/node"; then
      echo "$bin_dir/pi"
      return
    fi
  done

  return 1
}

[ -f "$LOCK_FILE" ] || die "missing upstream skill lockfile: $LOCK_FILE"
[ -f "$CANONICAL_SKILL/SKILL.md" ] || die "missing canonical orchestration skill"
[ -d "$CANONICAL_CATALOG/roles" ] || die "missing role catalog"
[ -d "$CANONICAL_CATALOG/teams" ] || die "missing team catalog"
command -v python3 >/dev/null 2>&1 || die "python3 is required"

python3 - "$USER_BIN_DIR" "$PI_NODE_BIN_DIR" "$SHELL_RC" <<'PY'
import os
import sys

for label, value in (
    ("CMUX_AGENT_BIN_DIR", sys.argv[1]),
    ("PI_NODE_BIN_DIR", sys.argv[2]),
    ("shell rc", sys.argv[3]),
):
    if not os.path.isabs(value):
        raise SystemExit(f"{label} must be an absolute path: {value!r}")
    if not value or any(not character.isprintable() for character in value):
        raise SystemExit(f"{label} must be a printable single-line path")
for label, value in (("CMUX_AGENT_BIN_DIR", sys.argv[1]), ("PI_NODE_BIN_DIR", sys.argv[2])):
    if ":" in value:
        raise SystemExit(f"{label} cannot contain ':' because it is a PATH entry")
PY

printf -v USER_BIN_SHELL '%q' "$USER_BIN_DIR"
printf -v PI_NODE_BIN_SHELL '%q' "$PI_NODE_BIN_DIR"
LEGACY_PATH_LINE="export PATH=${USER_BIN_SHELL}:\$PATH"
PATH_LINE="export PATH=${USER_BIN_SHELL}:${PI_NODE_BIN_SHELL}:\$PATH"
case ":$PATH:" in
  *":$USER_BIN_DIR:"*) ;;
  *) PATH_ACTIVATION_NEEDED=true ;;
esac

LOCK_COMMIT="$(python3 - "$LOCK_FILE" <<'PY'
import json
import re
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    lock = json.load(handle)
commit = lock.get("source", {}).get("commit", "")
if not re.fullmatch(r"[0-9a-f]{40}", commit):
    raise SystemExit("lockfile source.commit must be a full lowercase Git SHA")
print(commit)
PY
)"

[ "$LOCK_COMMIT" = "$PINNED_COMMIT" ] || die "lockfile commit does not match the reviewed Cmux v0.64.17 pin"

LOCK_SKILLS="$(python3 - "$LOCK_FILE" <<'PY'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as handle:
    lock = json.load(handle)
skills = lock.get("skills")
if not isinstance(skills, list) or not all(isinstance(item, str) for item in skills):
    raise SystemExit("lockfile skills must be an array of names")
print(" ".join(skills))
PY
)"

[ "$LOCK_SKILLS" = "$PINNED_SKILLS" ] || die "lockfile skill selection differs from the reviewed set"

CMUX_BIN="$(resolve_cmux)" || die "cmux is not installed; run scripts/install-core.sh first"
PI_BIN="$(resolve_pi)" || die "Pi is not installed with a sibling Node $PI_NODE_MIN_VERSION or newer within major 22; run pi/install.sh first"
PI_BIN_DIR="$(cd "$(dirname "$PI_BIN")" && pwd)"

if CMUX_VERSION_OUTPUT="$("$CMUX_BIN" version 2>/dev/null)"; then
  :
elif CMUX_VERSION_OUTPUT="$("$CMUX_BIN" --version 2>/dev/null)"; then
  :
else
  die "could not determine Cmux version from $CMUX_BIN"
fi

if [ "$CMUX_VERSION_OUTPUT" != "$CMUX_REVIEWED_IDENTITY" ]; then
  die "Cmux identity does not match the reviewed baseline '$CMUX_REVIEWED_IDENTITY'; found '$CMUX_VERSION_OUTPUT'. Update the lock, adapters, and evals intentionally before installing"
fi
CMUX_VERSION="$CMUX_REVIEWED_VERSION"

if ! CMUX_HOOK_HELP="$(env PATH="$PI_BIN_DIR:$(dirname "$CMUX_BIN"):$PATH" "$CMUX_BIN" hooks pi install --help 2>&1)"; then
  die "Cmux $CMUX_VERSION does not support the required 'hooks pi install' interface"
fi
if ! grep -Eq 'hooks[[:space:]]+(<agent>|pi)[[:space:]]+install' <<<"$CMUX_HOOK_HELP" \
  || ! grep -Eq '(^|[[:space:],])pi([[:space:],]|$)' <<<"$CMUX_HOOK_HELP"; then
  die "Cmux $CMUX_VERSION help does not advertise the required Pi hook installer"
fi

if ! $DRY_RUN; then
  command -v curl >/dev/null 2>&1 || die "curl is required"
  command -v tar >/dev/null 2>&1 || die "tar is required"
fi

echo "==> Installing Cmux agent integration..."
echo "    preflight passed: Cmux $CMUX_VERSION and Pi launcher $PI_BIN"
if $DRY_RUN; then
  echo "    dry run: no files, hooks, config, or network state will be changed"
fi

echo "==> Syncing the canonical local skill and catalog..."
sync_tree "$CANONICAL_SKILL" "$CODEX_SKILLS_DIR/cmux-orchestrate-agents" "Codex orchestration skill"
sync_tree "$CANONICAL_SKILL" "$CLAUDE_SKILLS_DIR/cmux-orchestrate-agents" "Claude orchestration skill"
if [ "$PI_SHARED_SKILLS_DIR" != "$CLAUDE_SKILLS_DIR" ]; then
  sync_tree "$CANONICAL_SKILL" "$PI_SHARED_SKILLS_DIR/cmux-orchestrate-agents" "Pi-shared orchestration skill"
fi
sync_tree "$CANONICAL_CATALOG" "$CATALOG_DEST" "shared agent catalog"
sync_executable "$SCRIPT_DIR/cmux-team" "$USER_BIN_DIR/cmux-team" "cmux-team launcher"
ensure_launcher_path
echo "    Pi uses its configured shared Claude skill directory."

echo "==> Installing pinned official Cmux skills..."
if $DRY_RUN; then
  echo "    would fetch https://codeload.github.com/manaflow-ai/cmux/tar.gz/$LOCK_COMMIT for exact comparisons"
  echo "    current/change status for upstream trees cannot be determined without that network fetch"
  for skill in $LOCK_SKILLS; do
    preview_upstream_tree "$CODEX_SKILLS_DIR/$skill" "Codex upstream skill $skill"
    preview_upstream_tree "$CLAUDE_SKILLS_DIR/$skill" "Claude upstream skill $skill"
    if [ "$PI_SHARED_SKILLS_DIR" != "$CLAUDE_SKILLS_DIR" ]; then
      preview_upstream_tree "$PI_SHARED_SKILLS_DIR/$skill" "Pi-shared upstream skill $skill"
    fi
  done
else
  UPSTREAM_TMP="$(mktemp -d "${TMPDIR:-/tmp}/cmux-skills.XXXXXX")"
  ARCHIVE="$UPSTREAM_TMP/cmux.tar.gz"
  curl -fsSL --retry 3 \
    "https://codeload.github.com/manaflow-ai/cmux/tar.gz/$LOCK_COMMIT" \
    -o "$ARCHIVE"
  tar -xzf "$ARCHIVE" -C "$UPSTREAM_TMP"

  UPSTREAM_ROOT=""
  for candidate in "$UPSTREAM_TMP"/cmux-*; do
    if [ -d "$candidate/skills" ]; then
      UPSTREAM_ROOT="$candidate"
      break
    fi
  done
  [ -n "$UPSTREAM_ROOT" ] || die "downloaded archive has no Cmux skills directory"

  for skill in $LOCK_SKILLS; do
    [ -f "$UPSTREAM_ROOT/skills/$skill/SKILL.md" ] || die "pinned archive is missing skill: $skill"
    sync_tree "$UPSTREAM_ROOT/skills/$skill" "$CODEX_SKILLS_DIR/$skill" "Codex upstream skill $skill"
    sync_tree "$UPSTREAM_ROOT/skills/$skill" "$CLAUDE_SKILLS_DIR/$skill" "Claude upstream skill $skill"
    if [ "$PI_SHARED_SKILLS_DIR" != "$CLAUDE_SKILLS_DIR" ]; then
      sync_tree "$UPSTREAM_ROOT/skills/$skill" "$PI_SHARED_SKILLS_DIR/$skill" "Pi-shared upstream skill $skill"
    fi
  done
fi

echo "==> Installing the native Cmux Pi hook..."
if $DRY_RUN; then
  echo "    would run: PATH=$PI_BIN_DIR:<existing-path> $CMUX_BIN hooks pi install --yes"
  echo "    expected hook: ${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}/extensions/cmux-session.ts"
else
  env PATH="$PI_BIN_DIR:$(dirname "$CMUX_BIN"):$PATH" \
    "$CMUX_BIN" hooks pi install --yes
  PI_HOOK="${PI_CODING_AGENT_DIR:-$HOME/.pi/agent}/extensions/cmux-session.ts"
  [ -f "$PI_HOOK" ] || die "Cmux reported success but the Pi hook is missing: $PI_HOOK"
  echo "    installed Pi hook: $PI_HOOK"
fi

echo "==> Cmux agent integration is ready."
if $PATH_ACTIVATION_NEEDED; then
  echo "    Open a new zsh terminal or activate the launcher in this shell with:"
  printf '    source %q\n' "$SHELL_RC"
fi
