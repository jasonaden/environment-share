# Agent Teams in the Enterprise: Best Practices Brief

> For senior engineers building developer experience around Claude Code agent teams.
> Produced via multi-agent research with consensus across three independent research streams.

---

## Executive Summary

After investigating agent design patterns, team composition strategies, and enterprise governance frameworks, we reached strong consensus on five principles:

1. **Build focused agents with single responsibilities** — one domain, 2-4 tools, clear boundaries
2. **Use a hybrid "catalog + dynamic selection" model** — pre-approved agent types, runtime selection by the lead
3. **Default to small teams (3 agents)** — coordination costs dominate beyond 4-5
4. **Treat agent definitions as infrastructure code** — version-controlled, reviewed, tested
5. **Plan first, parallelize second** — cheap planning prevents expensive team mistakes

The strongest signal from all research: **the single-responsibility principle applies to agents just as it does to microservices.** As agent instruction complexity grows, adherence to rules degrades and hallucinations increase. Keep agents focused.

---

## 1. Agent Design: How Focused Should Agents Be?

### The Spectrum

| Type | Scope | Tools | Example | When to Use |
|------|-------|-------|---------|-------------|
| **Micro-agent** | Single action | 1 tool | `linter`, `test-runner` | Deterministic pipeline stages |
| **Focused agent** | Single domain | 2-4 tools | `code-reviewer`, `architect` | **Default choice** |
| **Broad agent** | Multi-domain | Many tools | `general-purpose` | Exploratory/novel tasks only |

### Consensus: Default to Focused Agents

**Focused agents (single domain, 2-4 tools) are the recommended default.** They balance capability against the proven degradation that occurs when instructions get too complex. Key reasons:

- System prompts exceeding ~500 words of behavioral rules show measurable quality drops
- Isolated context windows give each agent maximum depth for its specific task
- Granular tool permissions enforce least-privilege (a reviewer shouldn't have Write access)
- Model routing becomes possible: Haiku for reads, Sonnet for analysis, Opus for complex reasoning

### When to Split an Agent

- Its system prompt needs fundamentally different behavioral rules for different subtasks
- It needs different tool permissions for different phases of work
- Different subtasks have different speed/quality requirements (model routing)
- You want independent failure isolation

### When to Merge Agents

- Two agents always run sequentially with tight data coupling
- The combined scope still fits a clear, focused system prompt
- Splitting creates more coordination overhead than it saves

### Recommended Starter Set

For most enterprise codebases, begin with these 3 focused agents:

1. **spec-writer** — Converts requirements into structured specs with acceptance criteria (Read-only + Bash for research)
2. **architect-reviewer** — Validates designs against constraints, produces ADRs (Read-only + Grep/Glob)
3. **implementer-tester** — Executes code changes, runs tests, delivers production-ready work (Full tools)

Expand only when a clear, repeated pain point demands a new agent type.

### Agent Description Design

The description field is critical — Claude uses it to decide when to delegate. Write descriptions that are:

- **Action-oriented**: "Reviews code for security vulnerabilities and quality issues"
- **Context-specific**: "Use after a spec exists; produces an ADR and guardrails"
- **Explicitly bounded**: List what the agent does NOT do to prevent misuse

---

## 2. Team Composition: Deterministic vs. Dynamic

### The Debate

This was the most contested question across our research. The tradeoffs:

| Approach | Reproducibility | Cost Predictability | Adaptability | Auditability |
|----------|----------------|-------------------|-------------|-------------|
| **Deterministic** (fixed roster) | High | High | Low | High |
| **Dynamic** (lead decides) | Low | Low | High | Low |
| **Hybrid catalog** | High | Medium | Medium-High | High |

### Consensus: Hybrid Catalog Model

All three research streams converged on the same recommendation: **define an approved catalog of agent types; let the lead select from it at runtime.**

**How it works:**

1. **Define an approved catalog** of agent types as `.claude/agents/*.md` files or plugin-distributed agents
2. **Version-control the catalog** with the same review process as production code
3. **The lead selects from the catalog** at runtime based on task analysis
4. **New agent types require PR review** before being added to the catalog
5. **Use `Task(agent_type)` allowlists** to restrict which agents a lead can spawn

**Why this wins for enterprise:**

- Governance applies to the catalog, not individual runs
- Leads can right-size teams without over/under-provisioning
- Agent definitions are auditable and reproducible
- Teams can share catalogs via plugins across projects

### Plan First, Parallelize Second

The single most cost-effective practice:

1. Use **plan mode** (single session, ~10k tokens) to analyze the task and generate a team composition
2. **Human reviews** the plan and proposed team structure
3. **Execute** with the approved plan using deterministic team assignment

Planning costs ~10k tokens. A 3-person team execution costs ~440k tokens. Getting the plan right before spawning prevents expensive mistakes.

---

## 3. Team Size and Communication

### Optimal Team Size

| Team Size | Token Multiplier | Recommendation |
|-----------|-----------------|----------------|
| 1 (solo) | 1x | Sequential tasks, tight dependencies |
| **2-3** | **2-3x** | **Default for most enterprise tasks** |
| 4-5 | 3-5x | Genuinely parallelizable multi-component work |
| 6+ | 5x+ | Rarely justified; coordination costs dominate |

**Consensus: Default to 3 agents.** Scale to 5 only for work that is genuinely parallelizable with minimal cross-agent dependencies. Beyond 5, the communication overhead (every message consumes tokens in both sender and receiver) grows faster than throughput gains.

### Communication Pattern

**Default to hub-and-spoke** (all communication flows through the lead):

- Complete visibility and audit trail
- Lead can prevent conflicting work
- Simpler debugging
- Better for enterprise governance

**Use peer-to-peer selectively** for:

- Debate/consensus scenarios (agents challenge each other's findings)
- Cross-layer coordination where agents need direct collaboration
- Research tasks where agents validate each other

### Task Decomposition

**Lead decomposes work** with these constraints:

- **Explicit file ownership** — two agents editing the same file leads to overwrites
- **5-6 tasks per teammate** is the optimal ratio
- **Self-contained deliverables** — each task produces a clear artifact
- **Wave-based dependencies** — Wave 1 (parallel) -> Wave 2 (depends on Wave 1) -> Wave 3 (integration)

---

## 4. Enterprise Governance

### Agent Lifecycle

Treat agents with the same rigor as production services:

```
Plan -> Create/Review -> Test -> Deploy -> Monitor -> Iterate
```

### Version Control and Review

- Store project agents in `.claude/agents/` checked into VCS
- Shared agents distributed via internal plugin marketplace
- Personal agents in `~/.claude/agents/` for individual productivity
- All shared agents require PR review before deployment
- Maintain a registry: purpose, owner, version, dependencies, eval status

### Testing Strategy (Three Levels)

1. **Structural**: `claude plugin validate` — validates manifest, paths, frontmatter
2. **Behavioral**: Eval suites with 3-5 queries per agent
   - Should-trigger scenarios (agent correctly activates)
   - Should-not-trigger scenarios (agent correctly stays dormant)
   - Edge cases (ambiguous inputs)
   - Test across Haiku/Sonnet/Opus (behavior varies by model)
3. **Integration**: Coexistence testing (agents don't conflict), hooks fire correctly, permissions enforced

### Cost Management

| Strategy | Impact |
|----------|--------|
| Model routing (Haiku for reads, Sonnet for execution, Opus for lead) | ~30% cost reduction |
| Plan-first workflow | Prevents wasted team tokens (~440k+) |
| Small teams (3 agents default) | Linear token savings |
| Context clearing between tasks | Prevents accumulation |
| Hook-based output filtering | Reduces verbose context consumption |

**Expected cost**: ~$6/developer/day with active agent team usage.

### Security Checklist

- [ ] Restrict tools in agent frontmatter (never leave tools field empty for production agents)
- [ ] Use `plan` permission mode for research-only agents
- [ ] Use `dontAsk` mode for agents that should auto-deny prompts
- [ ] Add `PreToolUse` hooks to validate commands at runtime
- [ ] Never run agents as root
- [ ] Risk-tier agent components: **High** (code execution, network, credentials), **Medium** (file scope, tool invocations), **Low** (read-only, search)
- [ ] Deny sensitive file patterns via hooks (`.env`, credentials, secrets)

---

## 5. Developer Experience Adoption Path

Progressive adoption prevents overwhelming developers:

| Level | What | Complexity |
|-------|------|-----------|
| L1 | CLAUDE.md project conventions | Low |
| L2 | Custom slash commands | Low |
| L3 | Custom subagents (focused, single-session) | Medium |
| L4 | Plugins (packaged + distributable agents) | Medium |
| L5 | Agent teams (multi-session coordination) | High |

**Start at L1-L2.** Most enterprise value comes from L3 (subagents). Only graduate to L5 (teams) for genuinely complex, parallelizable workflows.

### Onboarding Recommendations

1. Provide a starter agent catalog with 3-5 well-tested agents covering common workflows
2. Include `install.sh` scripts that are idempotent and back up existing configs
3. Use `/agents` interactive setup for individual customization
4. Keep CLAUDE.md under 500 lines — link to detailed docs rather than inlining everything
5. Document "when to use which agent" with concrete examples

---

## 6. Recommended Architecture

```
Enterprise Agent Platform
├── Shared Agent Catalog (plugin marketplace)
│   ├── code-reviewer (Sonnet, read-only)
│   ├── security-auditor (Sonnet, read-only)
│   ├── architect (Opus, read-only)
│   ├── implementer (Sonnet, full tools)
│   └── test-writer (Sonnet, full tools)
│
├── Project Agents (.claude/agents/)
│   ├── domain-specific-reviewer.md
│   └── migration-specialist.md
│
├── Team Templates (.claude/teams/)
│   ├── feature-team (architect + implementer + reviewer)
│   ├── review-team (security + code-reviewer + test-analyzer)
│   └── research-team (3x researcher + synthesizer)
│
├── Governance
│   ├── Agent registry (purpose, owner, version, evals)
│   ├── PR review for shared agents
│   ├── Eval suites per agent (3-5 test queries)
│   └── Cost dashboards per team/project
│
└── Hooks & Guards
    ├── PreToolUse: command validation, file restrictions
    ├── SubagentStop: quality gate checks
    └── Stop: completion verification
```

---

## Key Decisions Summary

| Decision | Recommendation | Confidence |
|----------|---------------|------------|
| Agent granularity | Focused (single domain, 2-4 tools) | **High** — unanimous across all research |
| Team composition | Hybrid catalog (pre-approved types, dynamic selection) | **High** — all streams converged |
| Default team size | 3 agents | **High** — cost data supports |
| Communication pattern | Hub-and-spoke default | **High** — enterprise governance requires it |
| Task decomposition | Lead-decomposed with file ownership | **High** — prevents overwrites |
| Agent governance | Treat as infrastructure code | **High** — aligns with enterprise practices |
| Adoption strategy | Progressive L1-L5 | **Medium-High** — depends on org maturity |
| Cost model | Model routing + plan-first | **High** — measurable savings |

---

## Sources

- [Claude Code Subagents Documentation](https://code.claude.com/docs/en/sub-agents)
- [Claude Code Agent Teams Documentation](https://code.claude.com/docs/en/agent-teams)
- [Google's Eight Multi-Agent Design Patterns](https://www.infoq.com/news/2026/01/multi-agent-design-patterns/)
- [Google ADK Multi-Agent Patterns](https://developers.googleblog.com/developers-guide-to-multi-agent-patterns-in-adk/)
- [PubNub: Best Practices for Claude Code Subagents](https://www.pubnub.com/blog/best-practices-for-claude-code-sub-agents/)
- [Multi-Agent System Design (eesel.ai)](https://www.eesel.ai/blog/claude-code-multiple-agent-systems-complete-2026-guide)
- [Microsoft: Designing Multi-Agent Intelligence](https://developer.microsoft.com/blog/designing-multi-agent-intelligence)
- [Anthropic: Equipping Agents with Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Addy Osmani: Claude Code Agent Teams](https://addyosmani.com/blog/claude-code-agent-teams/)
- [Enterprise AI Agent Orchestration (OneReach)](https://onereach.ai/blog/what-is-ai-agent-orchestration/)
