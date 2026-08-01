# Agent instruction snippets

`agent-snippets` installs optional, cataloged instruction blocks into Claude Code,
Codex, Pi, project-level, or custom Markdown instruction files. It uses stable
HTML comment markers so the installed body can be edited without preventing a
later uninstall.

## Install the CLI

```bash
./agent-snippets/install.sh
```

Then run `agent-snippets` with no arguments for an interactive review flow.

## Commands

```bash
agent-snippets list
agent-snippets list --details
agent-snippets show delegated-task-lifecycle
agent-snippets install delegated-task-lifecycle --agent claude
agent-snippets install delegated-task-lifecycle --agent codex --project
agent-snippets install delegated-task-lifecycle --target ./CLAUDE.md
agent-snippets status --target ./CLAUDE.md
agent-snippets uninstall delegated-task-lifecycle --target ./CLAUDE.md
```

User-level targets honor `CLAUDE_CONFIG_DIR`, `CODEX_HOME`, and
`PI_CODING_AGENT_DIR`. Every changed existing file receives a timestamped
backup. Symlink targets and malformed, nested, mismatched, or duplicate managed
markers are refused.

An installed block looks like this:

```markdown
<!-- environment-share:snippet delegated-task-lifecycle BEGIN — Description... -->
User-editable instruction content.
<!-- environment-share:snippet delegated-task-lifecycle END -->
```

Do not edit the marker lines. Uninstall removes everything between them,
including changes made to the installed body.
