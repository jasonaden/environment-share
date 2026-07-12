# Environment-share working agreement

- Treat this repository as the version-controlled source of truth for personal development-environment configuration.
- Inspect existing configuration and installers before changing them. Preserve unrelated user changes and avoid wholesale overwrites of files under the home directory.
- Keep normal defaults least-privileged. Put dangerous, destructive, remote, credential-bearing, or global-state behavior behind explicit opt-in commands.
- Never print or copy credential contents. Use presence and permission checks only.
- Prefer pinned upstream versions or commits and intentional update flows over floating downloads.
- Keep agent automation observable, bounded, and recoverable. Use stable identifiers for Cmux mutations and isolated worktrees for concurrent writers.
- Validate shell syntax, JSON, Python, skill structure, and focused behavior after changes.
- End with the outcome, changed files, checks run, and remaining risks.
