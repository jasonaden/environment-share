# Frontend Toolkit Plugin: Master Plan

## 1. Overview

### Purpose
The `frontend-toolkit` plugin provides specialized Claude Code agents, skills, and commands for ~50 frontend engineers at an enterprise company. It codifies institutional knowledge, accelerates development workflows, and enforces quality standards for a React + Relay + TypeScript stack.

### Target Audience
- Frontend engineers building features in a React/Relay/TypeScript codebase
- Tech leads reviewing PRs and guiding architectural decisions
- New engineers onboarding to internal libraries (Picnic, Yogi) and conventions

### Tech Stack Context
- **Framework**: React 18+ (functional components, hooks)
- **Data Layer**: Relay Modern (GraphQL client with fragment colocation)
- **Type System**: TypeScript 5+ (strict mode: `noImplicitAny`, `strictNullChecks`, etc.)
- **Testing**: Jest + React Testing Library + Relay Test Utils
- **Component Documentation**: Storybook 7+
- **Internal Libraries**:
  - **Picnic**: Design system component library (buttons, inputs, modals, layouts, etc.)
  - **Yogi**: Higher-order components and hooks that connect Picnic components to Relay data (e.g., `YogiUserCard`, `useYogiPagination`)
- **Architecture**: Micro-frontends (MFEs) with Webpack Module Federation

### Core Value Propositions
1. **Speed**: Scaffold new components/MFEs in minutes, not hours
2. **Quality**: Automated checks for TypeScript strictness, Relay fragment conventions, component completeness (stories, tests, exports)
3. **Knowledge Transfer**: Skills embed Picnic/Yogi patterns, reducing reliance on senior engineers
4. **Consistency**: Commands orchestrate agents using shared standards

---

## 2. Plugin Architecture

### Design Philosophy
**Single plugin with internal modularity** — all agents, skills, commands, and hooks packaged together for one-click install. Shared skills ensure consistency across agents. Future split path possible (if Picnic/Yogi libraries diverge into separate teams).

### Full Directory Tree

```
frontend-toolkit/
├── .claude-plugin/
│   └── plugin.json                  # Metadata: name, version, author, description, entry points
├── agents/                          # 8 focused agents (roles, not tasks)
│   ├── component-architect.md       # Plans component structure (read-only: no file edits)
│   ├── component-builder.md         # Writes React component, types, exports
│   ├── relay-architect.md           # Designs Relay fragments, queries, connections
│   ├── storybook-writer.md          # Generates Storybook stories (CSF3 format)
│   ├── frontend-reviewer.md         # Reviews PRs for Relay/TS/Picnic/Yogi conventions
│   ├── test-writer.md               # Writes Jest tests (RTL + Relay mocks)
│   ├── mfe-architect.md             # Plans MFE structure, module federation config
│   └── mfe-scaffolder.md            # Scaffolds MFE boilerplate (Webpack, routes, shell)
├── skills/                          # 9 shared reference skills (loaded on-demand by agents)
│   ├── picnic-components/
│   │   ├── SKILL.md                 # Overview: Picnic design system usage
│   │   └── references/
│   │       ├── component-catalog.md # Full component API reference
│   │       ├── layout-system.md     # Flex/Grid primitives
│   │       └── theming.md           # Design tokens, color scales, spacing
│   ├── relay-conventions/
│   │   ├── SKILL.md                 # Relay best practices overview
│   │   └── references/
│   │       ├── fragment-colocation.md  # Fragment naming, placement, composition
│   │       ├── connections-pagination.md  # @connection, @refetchable, pagination hooks
│   │       └── mutations.md         # Mutation patterns, optimistic updates, error handling
│   ├── react-patterns/
│   │   ├── SKILL.md                 # React conventions overview
│   │   └── references/
│   │       ├── component-structure.md  # File organization, exports, prop types
│   │       ├── hooks-guidelines.md     # Custom hooks, dependency arrays, memoization
│   │       └── error-boundaries.md     # Error handling patterns
│   ├── yogi-patterns/
│   │   ├── SKILL.md                 # Yogi library usage overview
│   │   └── references/
│   │       ├── connected-components.md  # YogiButton, YogiCard, etc. (Picnic + Relay)
│   │       ├── data-hooks.md            # useYogiQuery, useYogiMutation, useYogiPagination
│   │       └── composition.md           # Composing Yogi + Picnic + custom logic
│   ├── mfe-conventions/
│   │   ├── SKILL.md                 # MFE architecture overview
│   │   └── references/
│   │       ├── module-federation.md     # Webpack config, exposed/consumed modules
│   │       ├── routing.md               # React Router integration across MFEs
│   │       └── shared-state.md          # Cross-MFE communication patterns
│   ├── typescript-strict/
│   │   ├── SKILL.md                 # TypeScript strict mode overview
│   │   └── references/
│   │       ├── strict-null-checks.md    # Handling undefined/null, optional chaining
│   │       ├── type-inference.md        # Type narrowing, discriminated unions, generics
│   │       └── relay-types.md           # Generated types, fragment refs, connection types
│   ├── testing-conventions/
│   │   ├── SKILL.md                 # Testing standards overview
│   │   └── references/
│   │       ├── rtl-patterns.md          # React Testing Library best practices
│   │       ├── relay-mocks.md           # MockPayloadGenerator, custom resolvers
│   │       └── coverage-standards.md    # Coverage thresholds, what to test
│   ├── storybook-patterns/
│   │   ├── SKILL.md                 # Storybook conventions overview
│   │   └── references/
│   │       ├── csf3-format.md           # Component Story Format 3.0
│   │       ├── args-controls.md         # ArgTypes, controls, actions
│   │       └── decorators-parameters.md # Global decorators (Relay environment, theme)
│   └── data-router/
│       ├── SKILL.md                 # DataRouter EntryPoint patterns overview
│       └── references/
│           ├── entrypoint-patterns.md   # Type reference + code patterns for all EntryPoint variations
│           └── storybook-entrypoint.md  # Storybook integration for EntryPoint components
├── commands/                        # 3 orchestration commands (phased workflows)
│   ├── new-component.md             # Command: Architect → Build → Test → Story
│   ├── new-mfe.md                   # Command: Architect MFE → Scaffold → Verify
│   └── review-frontend.md           # Command: Multi-agent PR review (parallel agents)
├── hooks/
│   ├── hooks.json                   # Declares pre-commit, pre-push hooks
│   └── scripts/
│       ├── validate-typescript.sh   # Runs tsc --noEmit, fails on strict mode errors
│       ├── check-relay-fragments.sh # Validates fragment naming, colocation
│       └── component-completeness.sh # Checks for test + story + index.ts export
└── scripts/
    └── install.sh                   # Installs plugin, prompts for codebase paths
```

---

## 3. Component Summary

### 3.1 Agents (8)

| Name | Purpose | Model | Tools | Skills Loaded |
|------|---------|-------|-------|---------------|
| **component-architect** | Plans React component structure, identifies Picnic primitives, designs prop interface | Sonnet 4.5 | Read, Grep, Glob | picnic-components, react-patterns, typescript-strict |
| **component-builder** | Implements React component `.tsx`, exports via `index.ts`, enforces TypeScript strict | Opus 4.6 | Read, Edit, Write | picnic-components, react-patterns, typescript-strict, data-router |
| **relay-architect** | Designs GraphQL fragments, queries, connections; plans colocation strategy | Sonnet 4.5 | Read, Grep, Glob, WebFetch (schema) | relay-conventions, typescript-strict |
| **storybook-writer** | Generates Storybook CSF3 stories with controls, decorators (Relay env, theme) | Opus 4.6 | Read, Edit, Write | storybook-patterns, picnic-components, react-patterns, data-router |
| **frontend-reviewer** | Reviews PRs for Relay conventions, TS strict adherence, Picnic/Yogi usage, test coverage | Opus 4.6 | Read, Grep, Glob, Bash (git diff) | All 9 skills (full context) |
| **test-writer** | Writes Jest tests (RTL + Relay mocks), enforces coverage standards | Opus 4.6 | Read, Edit, Write, Bash (jest) | testing-conventions, relay-conventions, react-patterns |
| **mfe-architect** | Plans MFE structure, module federation config, exposed/consumed modules, routing | Sonnet 4.5 | Read, Grep, Glob | mfe-conventions, react-patterns, typescript-strict |
| **mfe-scaffolder** | Scaffolds MFE boilerplate (Webpack config, entry point, routes, shell integration) | Opus 4.6 | Read, Edit, Write, Bash | mfe-conventions, react-patterns, typescript-strict, relay-conventions, data-router |

### 3.2 Skills (9)

| Name | Triggers | Key References |
|------|----------|----------------|
| **picnic-components** | "Picnic", "component library", "design system", "Button", "Card", "Modal" | component-catalog.md (API docs), layout-system.md, theming.md |
| **relay-conventions** | "Relay", "fragment", "query", "mutation", "connection", "pagination" | fragment-colocation.md, connections-pagination.md, mutations.md |
| **react-patterns** | "React", "hooks", "component", "props", "state", "context" | component-structure.md, hooks-guidelines.md, error-boundaries.md |
| **yogi-patterns** | "Yogi", "YogiButton", "YogiCard", "useYogiQuery", "connected component" | connected-components.md, data-hooks.md, composition.md |
| **mfe-conventions** | "micro-frontend", "MFE", "module federation", "Webpack", "shell" | module-federation.md, routing.md, shared-state.md |
| **typescript-strict** | "TypeScript", "strict", "null check", "type", "interface", "generic" | strict-null-checks.md, type-inference.md, relay-types.md |
| **testing-conventions** | "test", "Jest", "React Testing Library", "mock", "coverage" | rtl-patterns.md, relay-mocks.md, coverage-standards.md |
| **storybook-patterns** | "Storybook", "story", "CSF", "controls", "decorator" | csf3-format.md, args-controls.md, decorators-parameters.md |
| **data-router** | "DataRouter", "entry point", "createEntryPoint", "EntryPointComponentProps", "RoutesFn", "DataBundle", "route data loading", "createWrapperForEntryPoint", "page scaffolding" | entrypoint-patterns.md (type ref + patterns), storybook-entrypoint.md (Storybook integration) |

### 3.3 Commands (3)

| Command | Purpose | Orchestration Flow | Agents Used |
|---------|---------|-------------------|-------------|
| **/new-component** | Create React component with tests + stories | 1. component-architect (plan) → 2. component-builder (implement) → 3. test-writer (tests) → 4. storybook-writer (stories) | 4 agents, sequential |
| **/new-mfe** | Scaffold new micro-frontend | 1. mfe-architect (plan) → 2. mfe-scaffolder (scaffold) → 3. component-builder (entry component) → 4. Validation (build, type-check) | 3 agents, sequential + validation |
| **/review-frontend** | Multi-agent PR review | 1. frontend-reviewer (general review) in parallel with 2. test-writer (coverage check) + 3. relay-architect (data layer review) → 4. Aggregate feedback | 3 agents, parallel + aggregation |

### 3.4 Hooks (3)

| Hook | Trigger | Script | Purpose |
|------|---------|--------|---------|
| **pre-commit** | `git commit` | `validate-typescript.sh` | Runs `tsc --noEmit` to catch strict mode errors before commit |
| **pre-commit** | `git commit` | `component-completeness.sh` | Checks if new components have tests, stories, and index.ts exports |
| **pre-push** | `git push` | `check-relay-fragments.sh` | Validates fragment naming (`ComponentName_fragmentKey`), colocation, no orphaned fragments |

---

## 4. Build Order (7 Phases)

### Phase 1: Foundation Skills 1-4
**Goal**: Establish core knowledge base for Picnic, Relay, React, Yogi.

**Deliverables**:
1. `skills/picnic-components/` (SKILL.md + 3 references)
2. `skills/relay-conventions/` (SKILL.md + 3 references)
3. `skills/react-patterns/` (SKILL.md + 3 references)
4. `skills/yogi-patterns/` (SKILL.md + 3 references)

**Validation**:
- [ ] Each SKILL.md has frontmatter (name, description in third person, triggers)
- [ ] Each reference doc has 3+ real-world examples from codebase
- [ ] Skills are loadable via `claude skill load frontend-toolkit:picnic-components` (local testing)

**Estimated Effort**: 2-3 days (requires prerequisite docs from `01-prerequisites.md`)

---

### Phase 2: Foundation Skills 5-8
**Goal**: Complete skill library with MFE, TypeScript, Testing, Storybook knowledge.

**Deliverables**:
1. `skills/mfe-conventions/` (SKILL.md + 3 references)
2. `skills/typescript-strict/` (SKILL.md + 3 references)
3. `skills/testing-conventions/` (SKILL.md + 3 references)
4. `skills/storybook-patterns/` (SKILL.md + 3 references)

**Validation**:
- [ ] All 8 skills pass skill format validation (frontmatter syntax, reference links)
- [ ] Cross-references between skills are accurate (e.g., relay-conventions → typescript-strict)
- [ ] Trigger phrases tested (grep codebase for common terms, ensure skill loads)

**Estimated Effort**: 2-3 days

---

### Phase 3: Read-Only Agents
**Goal**: Build planning/review agents that analyze code but don't edit files.

**Deliverables**:
1. `agents/component-architect.md` (loads picnic-components, react-patterns, typescript-strict)
2. `agents/relay-architect.md` (loads relay-conventions, typescript-strict)
3. `agents/mfe-architect.md` (loads mfe-conventions, react-patterns, typescript-strict)
4. `agents/frontend-reviewer.md` (loads all 9 skills)

**Validation**:
- [ ] Each agent has role, goal, skills, tools, constraints, output format
- [ ] Test prompts: "Plan a UserCard component using Picnic" (component-architect), "Review this PR for Relay conventions" (frontend-reviewer)
- [ ] Agents use plan mode (`plan_mode_required: true` in agent definition)
- [ ] Agents produce structured output (markdown plan with sections)

**Estimated Effort**: 2 days

---

### Phase 4: Implementation Agents
**Goal**: Build agents that write code (components, tests, stories, MFE scaffolding).

**Deliverables**:
1. `agents/component-builder.md` (loads picnic-components, react-patterns, typescript-strict)
2. `agents/storybook-writer.md` (loads storybook-patterns, picnic-components, react-patterns)
3. `agents/test-writer.md` (loads testing-conventions, relay-conventions, react-patterns)
4. `agents/mfe-scaffolder.md` (loads mfe-conventions, react-patterns, typescript-strict, relay-conventions)

**Validation**:
- [ ] Each agent can create files from scratch (test in sandbox repo)
- [ ] Test: component-builder generates valid `.tsx` with strict TypeScript, Picnic imports, proper exports
- [ ] Test: storybook-writer generates CSF3 story with controls, Relay decorator
- [ ] Test: test-writer generates passing Jest test with RTL + Relay mock
- [ ] Test: mfe-scaffolder generates buildable Webpack config

**Estimated Effort**: 3-4 days (includes iteration on generated code quality)

---

### Phase 5: Hooks & Quality Gates
**Goal**: Automate validation checks at commit/push time.

**Deliverables**:
1. `hooks/hooks.json` (declares pre-commit, pre-push hooks)
2. `hooks/scripts/validate-typescript.sh` (runs `tsc --noEmit`)
3. `hooks/scripts/check-relay-fragments.sh` (parses .tsx files for fragment naming)
4. `hooks/scripts/component-completeness.sh` (checks for test + story + export)

**Validation**:
- [ ] Each script exits with code 0 on success, non-zero on failure
- [ ] Test: Commit with TS error → hook blocks commit
- [ ] Test: Commit new component without test → hook blocks commit
- [ ] Test: Push with misnamed fragment → hook blocks push
- [ ] Scripts handle edge cases (no .tsx files, empty git diff, etc.)

**Estimated Effort**: 1-2 days

---

### Phase 6: Commands
**Goal**: Orchestrate agents into end-to-end workflows.

**Deliverables**:
1. `commands/new-component.md` (sequential: architect → build → test → story)
2. `commands/new-mfe.md` (sequential: architect → scaffold → entry component → validate)
3. `commands/review-frontend.md` (parallel: reviewer + test-writer + relay-architect → aggregate)

**Validation**:
- [ ] Each command has phases with clear handoffs (agent A output → agent B input)
- [ ] Test `/new-component UserAvatar` end-to-end (produces 4 files: component, test, story, index)
- [ ] Test `/new-mfe analytics-dashboard` (produces MFE directory, buildable Webpack config)
- [ ] Test `/review-frontend` on real PR (produces aggregated feedback markdown)
- [ ] Commands respect `max_turns` budget (architects: 5 turns, builders: 10 turns)

**Estimated Effort**: 2-3 days

---

### Phase 7: Integration & Polish
**Goal**: Package plugin, write installation docs, perform end-to-end validation.

**Deliverables**:
1. `.claude-plugin/plugin.json` (metadata, entry points for commands/agents/skills)
2. `scripts/install.sh` (copies plugin to `~/.claude/plugins/`, prompts for codebase paths)
3. `README.md` (installation, usage examples, troubleshooting)
4. End-to-end test plan (run all 3 commands, verify hooks trigger, validate agent outputs)

**Validation**:
- [ ] `claude plugin install /path/to/frontend-toolkit` succeeds
- [ ] `/new-component TestComponent` runs without errors
- [ ] `/new-mfe test-mfe` scaffolds buildable MFE
- [ ] `/review-frontend` reviews sample PR and produces feedback
- [ ] Hooks trigger on git commit/push
- [ ] All 9 skills load on-demand (check Claude logs for skill activation)
- [ ] Run on real codebase with 3 engineers for 1 week (collect feedback)

**Estimated Effort**: 2-3 days + 1 week dogfooding

---

## 5. Validation Criteria

### 5.1 Structural Validation (Applies to All Components)
- [ ] **Skill Format**: All skills have frontmatter (name, description, triggers), SKILL.md overview, references/ directory with ≥2 files
- [ ] **Agent Format**: All agents have role, goal, skills (array), tools (array), constraints, output_format
- [ ] **Command Format**: All commands have phases (array), each phase has description, agent, input, output, max_turns
- [ ] **Hook Format**: hooks.json declares event (pre-commit/pre-push), script path, all scripts are executable (`chmod +x`)
- [ ] **File Naming**: All markdown files use kebab-case, all directories lowercase, no spaces
- [ ] **Cross-References**: Internal links (e.g., skill → reference, agent → skill) resolve correctly

### 5.2 Behavioral Validation (Per Component)

**Skills**:
- [ ] Load skill manually, verify references appear in context (check Claude logs)
- [ ] Test trigger phrases: "use Picnic Button" → picnic-components skill loads
- [ ] Validate examples in reference docs compile/run in codebase

**Agents**:
- [ ] Architect agents produce structured plans (sections: Overview, Approach, Files to Create/Modify, Considerations)
- [ ] Builder agents generate syntactically valid code (TS compiles, tests pass, Storybook builds)
- [ ] Reviewer agent catches real issues (test on PRs with intentional violations)
- [ ] Agents respect tool constraints (read-only agents never call Edit/Write)

**Commands**:
- [ ] Sequential commands pass data between agents (architect plan → builder implementation)
- [ ] Parallel commands aggregate results (3 reviewers → single feedback doc)
- [ ] Commands handle failures gracefully (if architect fails, command exits early with error)

**Hooks**:
- [ ] Hooks run at correct git lifecycle event (pre-commit vs pre-push)
- [ ] Hooks fail loudly on violations (exit code 1, print clear error message)
- [ ] Hooks skip gracefully if preconditions not met (e.g., no .tsx files changed)

### 5.3 Integration Validation (End-to-End)
- [ ] Install plugin on fresh Claude instance → all commands/agents/skills appear in UI
- [ ] Run `/new-component` on real codebase → component builds, tests pass, story renders
- [ ] Run `/new-mfe` on real codebase → MFE integrates with shell, serves locally
- [ ] Run `/review-frontend` on real PR → feedback aligns with senior engineer review
- [ ] Commit code with TS error → pre-commit hook blocks (validate-typescript.sh)
- [ ] Push code with misnamed fragment → pre-push hook blocks (check-relay-fragments.sh)
- [ ] Agent memory: builder agent references architect's plan (not re-planning from scratch)

### 5.4 Enterprise Validation (Rollout to 50 Engineers)
- [ ] **Week 1**: 3 early adopters use plugin, report bugs (focus: new-component command)
- [ ] **Week 2**: Fix critical bugs, add 10 more engineers (focus: review-frontend command)
- [ ] **Week 3**: Collect feedback on skill accuracy (do Picnic/Yogi examples match latest library versions?)
- [ ] **Week 4**: Full rollout to 50 engineers, monitor adoption metrics (command usage, hook trigger rate)
- [ ] **Ongoing**: Monthly skill updates as Picnic/Yogi libraries evolve

---

## 6. Why Single Plugin?

### Pros
1. **One Install for 50 Engineers**: `claude plugin install frontend-toolkit` vs. installing 3-4 separate plugins
2. **Shared Skills**: All agents reference the same picnic-components, relay-conventions skills → consistency
3. **Unified Hooks**: Quality gates (TS validation, fragment checks) apply to entire codebase, not per-library
4. **Simpler Maintenance**: Update Picnic examples once → all agents (component-architect, component-builder, storybook-writer) use latest
5. **Discoverability**: Engineers type `/new-component` or `/review-frontend` without needing to remember which plugin provides what

### Cons
1. **Monolithic**: If Picnic team wants to update component catalog, they edit plugin shared by entire frontend org
2. **Versioning**: Breaking change to Relay conventions forces version bump for entire plugin (even if Storybook patterns unchanged)
3. **Scope Creep**: Easy to add "just one more agent" → plugin grows large over time

### Future Split Path
If Picnic/Yogi libraries diverge into separate teams with independent release cycles:
1. **Extract Skills**: `picnic-components` → standalone `picnic-plugin`, `yogi-patterns` → `yogi-plugin`
2. **Keep Commands**: `new-component`, `new-mfe`, `review-frontend` remain in `frontend-toolkit`, declare dependencies on `picnic-plugin`, `yogi-plugin`
3. **Shared Hooks**: Hooks stay in `frontend-toolkit` (TS validation, fragment checks agnostic to library)

For now, **single plugin is the right choice** (premature optimization to split).

---

## 7. Execution Strategy

### 7.1 Prerequisite Phase (Before Building Plugin)
**Action**: Generate or locate all reference documents listed in `01-prerequisites.md`.

**Process**:
1. Check if docs exist (Confluence, internal wiki, Storybook docs, README files)
2. If missing, use `code-explorer` agent to analyze codebase:
   - Picnic: `Grep "export const Button" glob:"*.tsx"` + aggregate into component catalog
   - Relay: `Grep "@refetchable" glob:"*.ts"` + extract pagination patterns
   - Yogi: `Grep "export function useYogi" glob:"hooks/*.ts"` + document hook signatures
3. Draft `CLAUDE.md` for frontend repo (use template from `01-prerequisites.md`)
4. Store all references in `docs/frontend-toolkit/references/` (outside plugin directory, for source control)

**Validation**: All P0 documents exist, P1 documents drafted (80% complete), P2 documents optional.

---

### 7.2 Iterative Skill Development (Phases 1-2)
**Pattern**: Build skill → test in isolation → integrate with agents.

**Per-Skill Process**:
1. Write `SKILL.md` frontmatter (name, description, triggers)
2. Write overview section (2-3 paragraphs: what, when, why)
3. Create `references/` directory, write 2-3 reference docs (copy examples from prerequisite docs)
4. Test: `claude skill load frontend-toolkit:picnic-components` → verify skill appears in context
5. Test: Ask Claude "How do I use Picnic Button?" → verify skill references load
6. Iterate: Add more examples if skill context insufficient

**Validation Gate**: All 8 skills pass format validation + manual trigger test before proceeding to Phase 3.

---

### 7.3 Agent Development with Plan Mode (Phases 3-4)
**Pattern**: Define agent role → enable plan mode → test with real prompts → iterate on constraints.

**Per-Agent Process**:
1. Write agent.md frontmatter (name, role, goal, skills, tools, plan_mode_required: true)
2. Define constraints (e.g., "Never edit files directly, output plan markdown only" for architects)
3. Test in plan mode: `/task agent:component-architect "Plan a UserCard component using Picnic"`
4. Review plan output: Does it reference Picnic Card? Does it define TypeScript interface?
5. Exit plan mode, approve plan, test implementation (for builder agents)
6. Iterate: Adjust skills loaded, refine constraints, add output_format template

**Validation Gate**: Each agent produces correct output format (plan for architects, code for builders) on 3 test prompts.

---

### 7.4 Command Development (Phase 6)
**Pattern**: Define phases → dry-run with mock agent outputs → implement handoffs → test end-to-end.

**Per-Command Process**:
1. Write command.md phases (array of agent invocations)
2. Dry-run: Manually run each agent, save outputs, verify phase N output → phase N+1 input
3. Implement: Wire agents together (use Task tool with subagent_type, pass context between tasks)
4. Test end-to-end: `/new-component TestCard` → verify 4 files created (component, test, story, index)
5. Iterate: Add error handling (if architect fails, exit command early), adjust max_turns budgets

**Validation Gate**: Each command succeeds on 3 real-world test cases (e.g., simple component, complex component with Relay, MFE).

---

### 7.5 Integration Testing (Phase 7)
**Process**:
1. Install plugin on test Claude instance
2. Clone real frontend repo, run all 3 commands
3. Make intentional violations (TS error, missing test), verify hooks block commits
4. Collect metrics: command success rate, hook trigger rate, time saved per command
5. Dogfood: 3 engineers use plugin for 1 week, collect qualitative feedback

**Success Criteria**: ≥90% command success rate, ≥80% engineer satisfaction ("would recommend to teammate").

---

## 8. Risk Mitigation

### Risk 1: Prerequisite Docs Don't Exist
**Mitigation**: Use `code-explorer` agent to generate initial docs from codebase analysis (see `01-prerequisites.md` Discovery Guide). Accept 80% accuracy, iterate based on engineer feedback.

### Risk 2: Skills Loaded Too Often (Performance)
**Mitigation**: Use specific trigger phrases (not generic terms like "component"). Test skill loading frequency in logs, refine triggers if >50% false positives.

### Risk 3: Generated Code Doesn't Match Codebase Style
**Mitigation**: Phase 4 validation includes human review of generated code. Add codebase-specific examples to skill references (not generic React patterns).

### Risk 4: Agents Exceed Token Budgets
**Mitigation**: Set `max_turns` per agent (architects: 5, builders: 10, reviewers: 15). Use plan mode to frontload thinking (10k tokens planning vs. 440k implementing).

### Risk 5: Low Adoption (Engineers Ignore Plugin)
**Mitigation**: Start with "easy win" command (`/new-component` saves 30+ min per component). Demo at team meeting. Collect testimonials from early adopters.

---

## 9. Success Metrics

### Quantitative
- **Adoption Rate**: % of 50 engineers who use plugin ≥1x/week (Target: ≥70%)
- **Time Saved**: Avg time to scaffold component (Before: 45 min, Target: 15 min)
- **Quality Gate Pass Rate**: % of commits that pass hooks on first try (Target: ≥85%)
- **Command Success Rate**: % of command invocations that complete without errors (Target: ≥90%)

### Qualitative
- **Engineer Satisfaction**: NPS score (Target: ≥50)
- **Feedback Themes**: "Saves time", "Enforces best practices", "Great for onboarding"
- **Iteration Velocity**: Time from bug report to fix deployed (Target: <3 days)

---

## 10. Next Steps

1. **Read `01-prerequisites.md`** — Understand required reference documents before building skills
2. **Gather/Generate Prerequisites** — Locate or create Picnic catalog, Relay conventions, etc.
3. **Execute Phases 1-7** — Follow build order, validate at each phase boundary
4. **Dogfood & Iterate** — Test with 3 engineers for 1 week, fix critical bugs
5. **Rollout** — Install for all 50 engineers, monitor metrics, collect feedback
6. **Maintain** — Monthly skill updates, quarterly plugin version bumps (align with library releases)

---

**Document Version**: 1.0
**Last Updated**: 2026-02-17
**Owner**: Frontend Platform Team
**Status**: Planning
