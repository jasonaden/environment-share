# IndyDevDan's Pi agent approach, reconciled with current Pi

Research date: 2026-07-10.

## Scope and method

The newest 20 videos on [IndyDevDan's channel](https://www.youtube.com/@indydevdan) were inventoried, and their English captions and descriptions were retrieved for analysis. The recommendations below are transcript-derived notes, not a substitute for the videos. Timestamps use the videos' chapter boundaries where available.

Eleven videos were directly about Pi or demonstrated Pi as a meaningful part of the workflow. The remaining nine were checked for adjacent planning, model, security, and agent-orchestration guidance. More recent guidance takes precedence.

## What to carry forward

1. **Treat Pi as a harness you own, not a Claude Code clone.** Pi's advantage is the ability to replace or compose tools, lifecycle behavior, UI, models, and orchestration. Start small and add a workflow only when it earns its context and maintenance cost.
2. **Use explicit safety levels.** Dan's May security work supersedes treating the February damage-control blacklist as sufficient. Normal local work needs at least a dangerous-command gate; higher-risk planning should use a default-deny Bash allowlist; review or production-facing work should remove arbitrary Bash entirely and expose only narrow tools.
3. **Separate planning and verification from implementation.** A focused planner should produce an artifact grounded in the repository. A verifier should independently turn completion claims into deterministic checks and report only violations.
4. **Keep agents specialized and contexts small.** Use isolated scouts, planners, workers, and reviewers. Add peer-to-peer communication or visible fleets only for problems that benefit from multiple independent contexts.
5. **Measure performance, speed, and cost together.** Observe loaded prompts, tools, skills, turns, tokens, model changes, and compaction. More tokens are useful only when they buy precision or better output.
6. **Make the launcher the product surface.** Dan repeatedly uses `just` recipes to make each harness configuration intentional and repeatable.

## Video notes, recent first

| Date | Video | Transcript-derived recommendation |
|---|---|---|
| 2026-07-06 | [SEE CMUX SOLVE Multi-Agent Orchestration](https://youtu.be/WAFUMBLOjHo) | Use a visible terminal grid for fleets, races, and team-lead/worker hierarchies. Agent communication and completion notifications matter more as the fleet grows. Choose orchestration depth per problem; do not turn every task into a fleet. See 7:14, 10:17, 18:53, and 26:04. |
| 2026-06-22 | [PLANS For Fable 5](https://youtu.be/DzbqeO_diOQ) | Keep planning as a portable, cross-harness skill and evolve it as model behavior changes. Build an explicit plan artifact before implementation; use richer HTML or visual specs only when their extra cost reduces ambiguity. Companion: [planf3](https://github.com/disler/planf3). |
| 2026-06-01 | [Pi Coding Agent Observability](https://youtu.be/o4KZH_KSqYQ) | Instrument the harness, including its fully assembled system prompt, tools, skills, lifecycle events, tokens, and cost. Compare agents in single, swimlane, or race views and optimize the performance/speed/cost trade-off. See 1:41, 9:54, and 20:49. Companion: [pi-agent-observability](https://github.com/disler/pi-agent-observability). |
| 2026-05-18 | [Pi to Pi](https://youtu.be/PIdETjcXNIk) | Peer agents can communicate bidirectionally over local sockets or an authenticated HTTP/SSE hub. This is useful across devices and models and keeps contexts specialized, but it adds bounce cost and loop risk. Use hop limits, audit logs, authentication, and a small number of purposeful peers. See 0:00, 4:56, 21:39, and 27:42. |
| 2026-05-11 | [Engineers, DELETE the BASH Tool](https://youtu.be/yBcmIoA-vGs) | Use five explicit levels: prompt/skill, system prompt, blacklist, allowlist, and no Bash. Dan's practical recommendation is level 4 or 5 for long-running, production, or otherwise high-downside work because risk compounds with runtime. See 1:35, 9:42, 14:31, 20:10, and 24:30. Companion: [bash-damage-from-within](https://github.com/disler/bash-damage-from-within). |
| 2026-05-04 | [A Pi Coding Agent That REVIEWS Like YOU](https://youtu.be/EnXKysJNz_8) | Run a separate, read-oriented verifier that observes the builder, reduces its work to atomic claims, independently checks them, and sends corrective feedback only on a violation. Cap correction loops and escalate to the human. See 1:35, 3:20, 5:20, and 7:22. Companion: [the-verifier-agent](https://github.com/disler/the-verifier-agent). |
| 2026-04-06 | [My Pi Agent Teams](https://youtu.be/RairMJflUSA) | Control the harness to control results: specialize agent prompts, tools, models, and context, and expose the orchestration state. Build systems for repeatable problem classes rather than one impressive task. See 5:40, 14:37, and 26:25. |
| 2026-03-30 | [One Agent Is NOT ENOUGH](https://youtu.be/M30gp1315Y4) | Use teams to gain independent contexts and perspectives, with a coordinator responsible for decomposition and synthesis. Parallelism is valuable when tasks are separable; coordination is itself a cost. See 1:30, 11:05, and 17:01. |
| 2026-03-23 | [Pi CEO Agents](https://youtu.be/TqjmTZRL31E) | Encode a decision process, not just a persona: gather context, consult specialized staff, deliberate, apply constraints, and emit a decision artifact. Pi's extension surface is the reason to build this as a custom harness. See 9:23 and 15:28. |
| 2026-03-16 | [The Library Meta-Skill](https://youtu.be/_vpNQ6IwP9w) | Keep a private catalog of skills, agents, and prompts; store pointers rather than copies; resolve typed dependencies; pull capabilities only where needed. Prefer portable Agent Skills over harness-locked duplicates. Companion: [the-library](https://github.com/disler/the-library). |
| 2026-02-23 | [The Pi Coding Agent: The ONLY REAL Claude Code COMPETITOR](https://youtu.be/f8cfH5XX-XU) | The original progression is: default, pure-focus UI, minimal UI, cross-agent resources, purpose gate, tool telemetry, subagents, task discipline, teams, system selection, damage control, chains, and a meta-agent. Treat this as a menu, not a bundle. See 8:21 through 43:16. Companion: [pi-vs-claude-code](https://github.com/disler/pi-vs-claude-code). |

## Links supplied by the videos that materially affect setup

- [Current Pi site](https://pi.dev/) and [canonical repository](https://github.com/earendil-works/pi)
- [Pi customization playground](https://github.com/disler/pi-vs-claude-code)
- [CMUX fleet examples](https://github.com/disler/learning-cmux-with-agents) and [CMUX](https://cmux.com/)
- [Portable planf3 skill](https://github.com/disler/planf3)
- [Pi observability stack](https://github.com/disler/pi-agent-observability)
- [Bash security levels](https://github.com/disler/bash-damage-from-within)
- [Verifier agent](https://github.com/disler/the-verifier-agent)
- [Private capability library](https://github.com/disler/the-library)
- [Agent sandbox options: E2B](https://e2b.dev/) and [exe.dev](https://exe.dev/)

## What has been superseded

- The old `@mariozechner/pi-coding-agent` package and `badlogic/pi-mono` links are historical. Since May 2026 the canonical package is `@earendil-works/pi-coding-agent` and the repository is `earendil-works/pi`.
- Dan's February comparison targets Pi 0.52.10. Current Pi 0.80.6 adds project trust, native Agent Skills paths, current subscription login, and many extension APIs; old model counts and prompt-size comparisons are not current facts.
- Native Pi can load Claude skills through `skills` settings. Use Dan's `cross-agent.ts` only when its combined command/agent discovery UI is specifically needed; do not load the same skills twice.
- Project trust gates project-local settings and extensions, but it is not an execution sandbox. Pi still runs with the launching user's permissions.
- Do not install the entire `pi-vs-claude-code` repository as one package. It contains mutually exclusive harness examples, has no selective Pi manifest, and some files still import the pre-migration package scope. Load reviewed pieces individually.

## Recommended division of labor

- **Pi:** custom harness experiments, cross-model comparisons, isolated scouts/reviewers, session-tree exploration, RPC/SDK product agents, and visible multi-agent workflows.
- **Codex or Claude Code:** work where their built-in permission, connector/MCP, plan, review, or managed orchestration experience is the main value.
- **Container or VM:** untrusted repositories, unattended long-running agents, production credentials, or any task where a prompt-level/tool-level gate is not a sufficient security boundary.

The configuration in `pi/` implements a conservative version of this: normal gated work, allowlisted planning, no-Bash review, an optional purpose gate, isolated subagents, portable prompts, and a short global working agreement. The optional `/ship` workflow adds a persisted two-phase state machine: scout and planner run before explicit human approval; afterward a worker implements, a reviewer inspects independently, and at most one corrective worker pass is permitted. The parent session's mutation tools remain blocked while that workflow is active.
