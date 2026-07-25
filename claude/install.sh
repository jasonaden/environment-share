#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="${CLAUDE_CONFIG_DIR:-$HOME/.claude}"
SOURCE_SETTINGS="$SCRIPT_DIR/settings.json"
TARGET_SETTINGS="$CLAUDE_DIR/settings.json"
TEMP_SETTINGS=""

cleanup() {
  if [ -n "$TEMP_SETTINGS" ] && [ -f "$TEMP_SETTINGS" ]; then
    rm -f "$TEMP_SETTINGS"
  fi
}
trap cleanup EXIT

timestamp() {
  date -u +%Y%m%dT%H%M%SZ
}

install_managed_file() {
  local source="$1"
  local target="$2"
  local parent
  local backup
  local backup_base
  local suffix=0
  local stage
  parent="$(dirname "$target")"
  if [ -L "$target" ]; then
    echo "Refusing to replace a managed Claude symlink: $target" >&2
    exit 1
  fi
  if [ -e "$target" ] && [ ! -f "$target" ]; then
    echo "Refusing to replace a non-file managed Claude target: $target" >&2
    exit 1
  fi
  if [ -f "$target" ] && cmp -s "$source" "$target"; then
    return
  fi
  mkdir -p "$parent"
  if [ -f "$target" ]; then
    backup_base="$target.backup.$(timestamp)"
    backup="$backup_base"
    while [ -e "$backup" ] || [ -L "$backup" ]; do
      suffix=$((suffix + 1))
      backup="$backup_base.$suffix"
    done
    cp -pP "$target" "$backup"
    echo "    Backed up existing managed file to $backup"
  fi
  stage="$(mktemp "$parent/.managed-file.tmp.XXXXXX")"
  if ! cp -p "$source" "$stage"; then
    rm -f "$stage"
    exit 1
  fi
  mv -f "$stage" "$target"
}

echo "==> Installing Claude Code configuration..."
command -v python3 >/dev/null 2>&1 || {
  echo "Claude settings installation requires python3." >&2
  exit 1
}

mkdir -p "$CLAUDE_DIR" "$CLAUDE_DIR/teams" "$CLAUDE_DIR/tasks"
echo "    Ensured Claude config and agent-team state directories exist."

if [ -L "$TARGET_SETTINGS" ]; then
  echo "Claude settings target is a symlink; refusing to replace it: $TARGET_SETTINGS" >&2
  echo "Update the symlink referent explicitly or set CLAUDE_CONFIG_DIR to the owning directory." >&2
  exit 1
fi
if [ -L "$CLAUDE_DIR/commands" ]; then
  echo "Claude commands directory is a symlink; refusing managed command writes: $CLAUDE_DIR/commands" >&2
  exit 1
fi
for source in "$SCRIPT_DIR"/commands/*.md; do
  command_target="$CLAUDE_DIR/commands/$(basename "$source")"
  if [ -L "$command_target" ]; then
    echo "Refusing to replace a managed Claude symlink: $command_target" >&2
    exit 1
  fi
  if [ -e "$command_target" ] && [ ! -f "$command_target" ]; then
    echo "Refusing to replace a non-file managed Claude target: $command_target" >&2
    exit 1
  fi
done

TEMP_SETTINGS="$(mktemp "$CLAUDE_DIR/.settings.json.tmp.XXXXXX")"
python3 - "$SOURCE_SETTINGS" "$TARGET_SETTINGS" >"$TEMP_SETTINGS" <<'PY'
import copy
import json
from pathlib import Path
import sys

source_path = Path(sys.argv[1])
target_path = Path(sys.argv[2])

with source_path.open(encoding="utf-8") as handle:
    source = json.load(handle)
if not isinstance(source, dict):
    raise SystemExit("repo Claude settings must be a JSON object")

owned_top_level = {"statusLine", "hooks"}
unexpected = set(source) - owned_top_level
if unexpected:
    raise SystemExit(f"repo settings contain unowned top-level keys: {sorted(unexpected)}")

if target_path.exists():
    with target_path.open(encoding="utf-8") as handle:
        target = json.load(handle)
    if not isinstance(target, dict):
        raise SystemExit("existing Claude settings must be a JSON object")
else:
    target = {}

# Remove only the unsafe values previously owned by this repository. Preserve
# unrelated environment variables, permission rules, and user preferences.
if target.get("teammateMode") == "tmux":
    target.pop("teammateMode")

environment = target.get("env")
if environment is not None and not isinstance(environment, dict):
    raise SystemExit("existing Claude env settings must be a JSON object")
if isinstance(environment, dict):
    if environment.get("CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS") == "1":
        environment.pop("CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS")
    if not environment:
        target.pop("env")

legacy_permissions = {
    "allow": [
        "Bash(*)",
        "Read(*)",
        "Edit(*)",
        "Write(*)",
        "Glob(*)",
        "Grep(*)",
        "WebFetch",
        "Skill(*)",
        "Task(*)",
        "TodoWrite(*)",
    ],
    "deny": [],
    "defaultMode": "default",
}
permissions = target.get("permissions")
if permissions is not None and not isinstance(permissions, dict):
    raise SystemExit("existing Claude permissions must be a JSON object")
if permissions == legacy_permissions:
    target.pop("permissions")

if "statusLine" in source:
    target["statusLine"] = copy.deepcopy(source["statusLine"])

owned_command_prefixes = (
    "echo 'BEFORE COMPACTING: Ensure critical state",
    "echo 'Context was compacted. MEMORY.md",
    "echo 'Context was cleared. MEMORY.md",
)

def is_owned_hook(item):
    return (
        isinstance(item, dict)
        and item.get("type") == "command"
        and isinstance(item.get("command"), str)
        and item["command"].startswith(owned_command_prefixes)
    )

target_hooks = target.get("hooks", {})
if not isinstance(target_hooks, dict):
    raise SystemExit("existing Claude hooks must be a JSON object")

# Remove previous revisions of only our nested hook commands while retaining
# user commands that share the same event or matcher.
for event_name, groups in list(target_hooks.items()):
    if not isinstance(groups, list):
        raise SystemExit(f"existing Claude hooks.{event_name} must be an array")
    retained_groups = []
    for group in groups:
        if not isinstance(group, dict):
            raise SystemExit(f"existing Claude hooks.{event_name} entries must be objects")
        nested = group.get("hooks")
        if nested is None:
            retained_groups.append(group)
            continue
        if not isinstance(nested, list):
            raise SystemExit(f"existing Claude hooks.{event_name}[].hooks must be an array")
        kept = [item for item in nested if not is_owned_hook(item)]
        if kept:
            updated = copy.deepcopy(group)
            updated["hooks"] = kept
            retained_groups.append(updated)
    if retained_groups:
        target_hooks[event_name] = retained_groups
    else:
        target_hooks.pop(event_name)

source_hooks = source.get("hooks", {})
if not isinstance(source_hooks, dict):
    raise SystemExit("repo Claude hooks must be a JSON object")
for event_name, source_groups in source_hooks.items():
    if not isinstance(source_groups, list):
        raise SystemExit(f"repo Claude hooks.{event_name} must be an array")
    destination_groups = target_hooks.setdefault(event_name, [])
    for source_group in source_groups:
        if not isinstance(source_group, dict):
            raise SystemExit(f"repo Claude hooks.{event_name} entries must be objects")
        matcher = source_group.get("matcher")
        destination_group = next(
            (group for group in destination_groups if group.get("matcher") == matcher),
            None,
        )
        if destination_group is None:
            destination_groups.append(copy.deepcopy(source_group))
            continue
        destination_nested = destination_group.setdefault("hooks", [])
        if not isinstance(destination_nested, list):
            raise SystemExit(f"existing Claude hooks.{event_name}[].hooks must be an array")
        for hook in source_group.get("hooks", []):
            if hook not in destination_nested:
                destination_nested.append(copy.deepcopy(hook))

if target_hooks:
    target["hooks"] = target_hooks
else:
    target.pop("hooks", None)

json.dump(target, sys.stdout, indent=2, ensure_ascii=False)
sys.stdout.write("\n")
PY

if [ -f "$TARGET_SETTINGS" ] && cmp -s "$TEMP_SETTINGS" "$TARGET_SETTINGS"; then
  rm -f "$TEMP_SETTINGS"
  TEMP_SETTINGS=""
  echo "    Claude settings are already current."
else
  if [ -f "$TARGET_SETTINGS" ]; then
    BACKUP_SETTINGS="$TARGET_SETTINGS.backup.$(timestamp)"
    BACKUP_BASE="$BACKUP_SETTINGS"
    BACKUP_SUFFIX=0
    while [ -e "$BACKUP_SETTINGS" ] || [ -L "$BACKUP_SETTINGS" ]; do
      BACKUP_SUFFIX=$((BACKUP_SUFFIX + 1))
      BACKUP_SETTINGS="$BACKUP_BASE.$BACKUP_SUFFIX"
    done
    cp -pP "$TARGET_SETTINGS" "$BACKUP_SETTINGS"
    echo "    Backed up existing settings to $BACKUP_SETTINGS"
  fi
  chmod 600 "$TEMP_SETTINGS"
  mv "$TEMP_SETTINGS" "$TARGET_SETTINGS"
  TEMP_SETTINGS=""
  echo "    Merged repository-owned Claude settings."
fi

echo ""
echo "==> Claude Code configuration installed successfully."
echo "    - Existing user settings and permission rules are preserved."
echo "    - Legacy repository-owned broad allow rules were removed."
echo "    - Agent teams are enabled per session with 'cmux claude-teams'."
echo "    - Settings changes receive timestamped backups."
echo ""
echo "    Next steps:"
echo "    1. Run 'claude auth status' or 'claude login' if needed."
echo "    2. Run './claude/install-plugins.sh' to install recommended plugins."
