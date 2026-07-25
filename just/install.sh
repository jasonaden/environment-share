#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TARGET="$HOME/justfile"
SHELL_RC=""
if [ -f "$HOME/.zshrc" ]; then
  SHELL_RC="$HOME/.zshrc"
elif [ -f "$HOME/.bashrc" ]; then
  SHELL_RC="$HOME/.bashrc"
fi
if [ -n "$SHELL_RC" ] && [ -L "$SHELL_RC" ] && ! grep -q 'alias j=' "$SHELL_RC" 2>/dev/null; then
  echo "Shell rc is a symlink; add alias j='just' to its referent explicitly: $SHELL_RC" >&2
  exit 1
fi

echo "==> Installing justfile..."

# Refuse redirects through managed file symlinks, then stage and atomically
# replace the directory entry so a last-moment symlink cannot redirect writes.
if [ -L "$TARGET" ]; then
  echo "Refusing to replace symlinked justfile: $TARGET" >&2
  exit 1
fi
if [ -e "$TARGET" ] && [ ! -f "$TARGET" ]; then
  echo "Refusing to replace non-file justfile target: $TARGET" >&2
  exit 1
fi

if [ -f "$TARGET" ] && cmp -s "$SCRIPT_DIR/justfile" "$TARGET"; then
  echo "    ~/justfile is already current"
else
  if [ -f "$TARGET" ]; then
    BACKUP_BASE="$TARGET.backup.$(date -u +%Y%m%dT%H%M%SZ)"
    BACKUP="$BACKUP_BASE"
    BACKUP_SUFFIX=0
    while [ -e "$BACKUP" ] || [ -L "$BACKUP" ]; do
      BACKUP_SUFFIX=$((BACKUP_SUFFIX + 1))
      BACKUP="$BACKUP_BASE.$BACKUP_SUFFIX"
    done
    cp -pP "$TARGET" "$BACKUP"
    echo "    Backed up existing ~/justfile to $BACKUP"
  fi
  STAGE="$(mktemp "$HOME/.justfile.tmp.XXXXXX")"
  if ! cp -p "$SCRIPT_DIR/justfile" "$STAGE"; then
    rm -f "$STAGE"
    exit 1
  fi
  mv -f "$STAGE" "$TARGET"
  echo "    Installed ~/justfile"
fi

# Set up 'j' alias for global access if not already present
if [ -n "$SHELL_RC" ]; then
  if ! grep -q 'alias j=' "$SHELL_RC" 2>/dev/null; then
    RC_BACKUP_BASE="$SHELL_RC.backup.$(date -u +%Y%m%dT%H%M%SZ)"
    RC_BACKUP="$RC_BACKUP_BASE"
    RC_BACKUP_SUFFIX=0
    while [ -e "$RC_BACKUP" ] || [ -L "$RC_BACKUP" ]; do
      RC_BACKUP_SUFFIX=$((RC_BACKUP_SUFFIX + 1))
      RC_BACKUP="$RC_BACKUP_BASE.$RC_BACKUP_SUFFIX"
    done
    cp -pP "$SHELL_RC" "$RC_BACKUP"
    RC_STAGE="$(mktemp "$(dirname "$SHELL_RC")/.shell-rc.tmp.XXXXXX")"
    cp -p "$SHELL_RC" "$RC_STAGE"
    printf "\n# just global task runner\nalias j='just'\n" >>"$RC_STAGE"
    mv -f "$RC_STAGE" "$SHELL_RC"
    echo "    Added 'j' alias to $SHELL_RC (backup: $RC_BACKUP)"
  else
    echo "    'j' alias already exists in $SHELL_RC"
  fi
fi

echo ""
if [ -n "$SHELL_RC" ]; then
  echo "==> Done. To activate the 'j' alias in your current shell:"
  echo "    source $SHELL_RC"
  echo ""
fi
echo "    Then run 'j' to see available recipes."
