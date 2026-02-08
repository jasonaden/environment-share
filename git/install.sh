#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GITCONFIG_SRC="$SCRIPT_DIR/gitconfig"

echo "==> Installing git configuration..."

if [ ! -f "$GITCONFIG_SRC" ]; then
    echo "    ERROR: gitconfig not found at $GITCONFIG_SRC"
    exit 1
fi

# Apply each setting from the gitconfig file individually so we merge
# with any existing ~/.gitconfig rather than overwriting it.
# This preserves user.name, user.email, and any other personal settings.

echo "    Installing git aliases..."

# Aliases
git config --global alias.br "branches"
git config --global alias.branches "!legit branches"
git config --global alias.cherry-pick-pr '!git cherry-pick upstream/pr/"$1~$2"..upstream/pr/"$1" && git closes "$1" && true'
git config --global alias.ci "commit"
git config --global alias.closes '!git filter-branch -f --msg-filter "cat /dev/stdin && sed -e s/ISSUE/$@/g ~/.github.closes.txt" HEAD~1..HEAD && git log -n1 && true'
git config --global alias.co "checkout"
git config --global alias.cp-pr "cherry-pick-pr"
git config --global alias.cp "cherry-pick"
git config --global alias.graft '!legit graft "$@"'
git config --global alias.harvest '!legit harvest "$@"'
git config --global alias.lg "log --oneline -n15"
git config --global alias.msg "!git log -n1"
git config --global alias.publish '!legit publish "$@"'
git config --global alias.sha "rev-parse HEAD"
git config --global alias.sm "submodule"
git config --global alias.sprout '!legit sprout "$@"'
git config --global alias.st "status"
git config --global alias.switch '!legit switch "$@"'
git config --global alias.sync '!legit sync "$@"'
git config --global alias.unpublish '!legit unpublish "$@"'

echo "    Installing git settings..."

# Color
git config --global color.branch "auto"
git config --global color.diff "auto"
git config --global color.interactive "auto"
git config --global color.status "auto"

# Init
git config --global init.defaultBranch "main"

# Log
git config --global log.abbrevCommit "true"
git config --global log.decorate "true"

# Merge
git config --global merge.keepBackup "false"

# Push
git config --global push.default "current"

# Rebase
git config --global rebase.autoSquash "true"

echo ""
echo "==> Git configuration installed successfully."
echo ""
echo "    Aliases installed: st, co, ci, cp, lg, br, sha, sm, msg, and more"
echo "    Settings: color auto, push current, rebase autosquash, default branch main"
echo ""
echo "    NOTE: user.name and user.email were NOT changed."
echo "    Set them with:"
echo "      git config --global user.name \"Your Name\""
echo "      git config --global user.email \"your@email.com\""
