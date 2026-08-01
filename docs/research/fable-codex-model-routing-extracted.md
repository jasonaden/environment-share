## General preferences

- If asked to do too much work at once, stop and state that clearly.
- If computer use is helpful for completing or verifying work, shell out to GPT-5.6 with ChatGPT for it.

## Picking the right models for workflows and subagents

Rankings, higher = better. Cost reflects what I actually pay (OpenAI is near-free for me due to a deal), not list price. Intelligence is how hard a problem you can hand the model unsupervised. Taste covers UI/UX, code quality, API design, and copy.

| Model     | Cost  | Intelligence | Taste |
| ---       | ---:  | ---:         | ---:  |
| GPT-5.6   | 9     | 8            | 5     |
| Sonnet 5  | 5     | 5            | 7     |
| Opus 5    | 4     | 7            | 8     |
| Fable 5   | 2     | 9            | 9     |

How to apply:

- These are defaults, not limits. You have standing permission to override them: if a cheaper model's output doesn't meet the bar, rerun or redo the work with a smarter model without asking. Judge the output, not the price tag. Escalating costs less than shipping mediocre work.
- Don't let cost prevent you from using the right model for the job. Instead, take advantage of cheaper options to get more information and try things before moving the work to a more expensive option.
- Bulk/mechanical work (clear-spec implementation, data analysis, migrations): GPT-5.6 — it's effectively free.
- Anything user-facing (UI, copy, API design) needs taste ≥ 7.
- Reviews of plans/implementations: Fable 5 or Opus 5, optionally GPT-5.6 as an extra independent perspective.
- Haiku can only be used for scout and summarization tasks.
- Mechanics: GPT-5.6 is only reachable through the Codex CLI, bundled with the ChatGPT desktop app (my `~/.codex/config.toml` defaults to GPT-5.6). Use the `codex-delegate` skill (`agent-skills/codex-delegate/`) — it covers binary resolution, `codex exec` / `codex review` invocation, sandbox modes, self-contained prompts, timeout handling, computer use, and the wrapper pattern for using GPT-5.6 inside Claude workflows/subagents.
- Claude models (Sonnet 5, Opus 5, Fable 5) run via the Agent/Workflow model parameter.
