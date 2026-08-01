# Fable–Codex Model Routing

Source: Theo – t3.gg, [A proper guide to Fable 5](https://www.youtube.com/watch?v=8GRmLR__OGQ), July 5, 2026.

This reference reconstructs the model-routing section visible around 12:16–20:03 in the video and in the supplied screenshots. It separates durable orchestration behavior from model names, scores, pricing assumptions, and product limitations that were specific to the author's setup at the time.

## Durable routing behavior

### Keep the strongest judgment model in charge

Use Fable as the supervisor. It owns decomposition, routing, product judgment, review synthesis, escalation, and acceptance. Delegate bounded execution and evidence gathering to cheaper models, but do not transfer responsibility for the result.

Define the routing axes explicitly:

- **Cost**: effective marginal cost in the user's actual subscription or API setup, not list price.
- **Intelligence**: how difficult a problem the model can handle unsupervised.
- **Taste**: UI/UX, code quality, API design, architecture, and copy judgment.

Treat routing scores as preferences rather than hard limits:

- Start with the cheapest model that is plausibly capable of the bounded task.
- If its output misses the quality bar, rerun or redo the work with a stronger model without requiring another routing decision.
- Judge the artifact, not the model price.
- For work that ships, do not let cost override required intelligence or taste.
- Use cheaper models to collect information, inspect large inputs, and try approaches before handing the refined problem to a more expensive model.

### Route by type of work

The author's rules in the screenshots are:

| Work | Route |
| --- | --- |
| Clear-spec implementation, data analysis, migrations, and other bulk or mechanical work | GPT-5.5 through Codex |
| User-facing UI, copy, and API design | A model with taste score at least 7 |
| Review of plans or implementations | Fable 5 or Opus 4.8 |
| Extra independent review perspective | Optionally GPT-5.5 through Codex |
| Computer-use completion or verification | Shell out to GPT-5.5 through Codex |
| Investigation or data analysis not covered by a dedicated skill | Run `codex exec -s read-only` with a self-contained prompt |

The screenshot also says never to use Haiku. Treat that as an author-specific recommendation, not a permanent invariant.

### Use dedicated delegation skills

The visible policy routes Codex work through three specialized skills:

- `codex-implementation`
- `codex-review`
- `codex-computer-use`

Use direct `codex exec -s read-only` for bounded read-only tasks those skills do not cover.

Every handoff should specify:

- a self-contained objective;
- relevant repository and file context;
- required constraints and permissions;
- expected artifact or structured result;
- validation expectations;
- the condition that should return control to the supervisor.

## Routing through Claude workflows

At the time of the video, the Claude Agent/Workflow model parameter accepted only Claude models. The author therefore used a thin Claude wrapper to reach GPT-5.5 through the Codex CLI.

The visible workflow policy is:

1. Spawn a thin Claude wrapper agent with `model: 'sonnet'` and `effort: 'low'`.
2. Instruct the wrapper to:
   - write a self-contained Codex prompt;
   - run `codex exec` through Bash;
   - wait for the result;
   - return the Codex report to the parent workflow.
3. Use a workflow `schema` so the wrapper returns structured output.
4. Prefix the wrapper label with `gpt-5.5:`, for example:

   ```text
   gpt-5.5:review-auth
   ```

   The workflow UI reports the wrapper's Claude model, so this label makes the actual worker observable.
5. Set an explicit timeout longer than Bash's default ten minutes, or run Codex in the background and poll for its report file.
6. Give every parallel implementation worker an isolated worktree so Codex processes cannot collide in the shared checkout.
7. Account for Codex usage separately. The author notes that the Claude workflow token budget counts Claude tokens only; delegated Codex work is not represented by `budget.spent()`.

## Screenshot transcription

The following is a normalized transcription of the visible `CLAUDE.md` section. Punctuation and wrapping have been cleaned up, but the meaning and numeric values are preserved.

### General preference

> If computer use is helpful for completing or verifying work, shell out to GPT-5.5 with Codex for it.

### Model scores shown in the video

Higher is better:

| Model | Cost | Intelligence | Taste |
| --- | ---: | ---: | ---: |
| GPT-5.5 | 9 | 8 | 5 |
| Sonnet 5 | 5 | 5 | 7 |
| Opus 4.8 | 4 | 7 | 8 |
| Fable 5 | 2 | 9 | 9 |

The author defines intelligence as unsupervised problem-solving ability and taste as UI/UX, code quality, API design, and copy. The cost numbers reflect the author's effective cost, not list price.

### Application rules

> These are defaults, not limits. You have standing permission to override them: if a cheaper model's output doesn't meet the bar, rerun or redo the work with a smarter model without asking. Judge the output, not the price tag. Escalating costs less than shipping mediocre work.

The video initially shows:

> Cost is a tie-breaker only; when axes conflict for anything that ships, intelligence > taste > cost.

The author edits that rule during the video to:

> Don't let cost prevent you from using the right model for the job. Instead, take advantage of cheaper options to get more information and try things before moving the work to a more expensive option.

The remaining visible rules are:

- Bulk/mechanical work—clear-spec implementation, data analysis, and migrations—goes to GPT-5.5 because it is effectively free in the author's setup.
- Anything user-facing—UI, copy, or API design—needs taste of at least 7.
- Reviews of plans and implementations use Fable 5 or Opus 4.8, optionally with GPT-5.5 as an independent perspective.
- Never use Haiku.
- GPT-5.5 is reached through `codex exec` or `codex review`.
- Use the Codex implementation, review, and computer-use skills; for investigation and data analysis, use `codex exec -s read-only` with a self-contained prompt.
- Claude models run through the Agent/Workflow model parameter.

## What to preserve in our implementation

Preserve:

- explicit routing axes;
- supervisor ownership;
- task-based routing;
- automatic escalation when artifacts miss the bar;
- independent review;
- observable labels;
- structured reports;
- explicit long-run handling;
- one worktree per concurrent writer;
- separate accounting for delegated-provider usage.

Do not hard-code without revalidation:

- the exact model names or scores;
- subscription economics such as “effectively free”;
- the ten-minute Bash timeout;
- which models a workflow API accepts;
- the claim that one provider's usage is excluded from another provider's budget;
- blanket exclusions such as “never use Haiku.”

Those details can change with model releases, pricing, CLI behavior, and workflow APIs. Keep them in configuration or a dated reference rather than treating them as permanent skill logic.
