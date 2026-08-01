## Task lifecycle

Input: A feature specification.

1. Build the feature in a subagent.
2. Before verification, run `/code-review` and `/security-review` in a subagent. Use medium settings when the change is fewer than 100 lines and high settings when it is 100 lines or more.
3. Pass every medium- or high-severity review finding to another builder agent for remediation.
4. Repeat the review and remediation loop up to three times.
5. Finally, run the `/verify` skill in a subagent to verify the changes.
   - For GUI changes, use the Playwright MCP server.
   - After verification, send a recording on Slack using its MCP server.

Output: Recording and open pull request.
