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
- **Type System**: TypeScript 5.4+ (strict mode: `noImplicitAny`, `strictNullChecks`, etc.)
- **Styling**: Stitches CSS-in-JS (`@stitches/react` 1.2.8) — `css` prop, `$tokenName` syntax
- **Testing**: Vitest + React Testing Library + `@attentive/test-utils`
- **Component Documentation**: Storybook 9.1.x + Chromatic visual testing
- **Routing**: `@attentive/data-router` — React Router 6 Data Router + Relay EntryPoint pattern
- **Internal Libraries**:
  - **Picnic** (`@attentive/picnic`): Design system — 57 components, Stitches tokens, compound component pattern, Radix UI primitives, Formik forms
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
├── skills/                          # Shared reference skills (loaded on-demand by agents)
│   ├── picnic-components/           # ✅ BUILT — Router + 10 sub-skills + 4 refs + validator
│   │   ├── SKILL.md                 # Router: routes intent to sub-skills via keyword table
│   │   ├── .picnic-gen-state.json   # Generation pipeline state tracking
│   │   ├── picnic-database.json     # AST-extracted component data (57 components)
│   │   ├── package.json             # Dependencies for extraction scripts
│   │   ├── foundation/              # 3 foundation sub-skills
│   │   │   ├── design-tokens/
│   │   │   │   ├── SKILL.md         # Semantic tokens, spacing, radii, shadows, breakpoints
│   │   │   │   └── references/
│   │   │   │       └── token-tables.md  # Complete token value tables
│   │   │   ├── stitches-patterns/
│   │   │   │   ├── SKILL.md         # css prop, styled(), variants, responsive, themes
│   │   │   │   └── references/
│   │   │   │       └── utils-reference.md  # Custom Stitches utility reference
│   │   │   └── layout-primitives/
│   │   │       └── SKILL.md         # Box, Stack, Grid, PageLayout, FooterLayout, Separator
│   │   ├── problem/                 # 5 problem-domain sub-skills
│   │   │   ├── data-table/
│   │   │   │   └── SKILL.md         # Table (11 subs), sorting, selection, ContinuousScroll
│   │   │   ├── form-builder/
│   │   │   │   └── SKILL.md         # Form + Formik, 17 inputs, Select tree, Yup validation
│   │   │   ├── dialog-drawer/
│   │   │   │   └── SKILL.md         # Dialog, Drawer, Popover, DropdownMenu (all overlays)
│   │   │   ├── navigation/
│   │   │   │   └── SKILL.md         # Breadcrumbs, TabGroup, Paginator, StepTracker
│   │   │   └── feedback-notifications/
│   │   │       └── SKILL.md         # Banner, Accordion, Tooltip, IconPopover, Loading*
│   │   ├── references/              # 4 component-category reference files
│   │   │   ├── actions-ref.md       # Button, IconButton, ButtonBar, ButtonGroup, PickerButton
│   │   │   ├── typography-ref.md    # Heading, Text, TextWithOverflowTooltip
│   │   │   ├── data-display-ref.md  # Badge, Tag, ContainedLabel, ProgressBar, List
│   │   │   └── media-ref.md         # Icon, ThirdPartyIcon, IconCircle, ResponsiveImage, etc.
│   │   ├── validator/
│   │   │   └── SKILL.md             # Post-generation validation: 125 rules, 8 categories
│   │   ├── prompts/                 # AI curation prompt templates
│   │   │   ├── decision-guide.md
│   │   │   ├── gotchas.md
│   │   │   ├── anti-patterns.md
│   │   │   ├── canonical-example.md
│   │   │   └── common-mistakes.md
│   │   └── scripts/                 # Extraction/generation pipeline scripts
│   │       ├── README.md
│   │       ├── extract.mjs          # AST-parse Picnic source → picnic-database.json
│   │       ├── detect-changes.mjs   # Diff source commits → identify affected skills
│   │       ├── assemble-context.mjs # Gather source + tests + stories for AI curation
│   │       └── format.mjs           # Transform database → compact skill notation
│   ├── picnic-update/               # ✅ BUILT — Maintenance pipeline skill
│   │   ├── SKILL.md                 # 6-step pipeline: detect → extract → format → AI → review → finalize
│   │   └── hooks/
│   │       └── session-start-drift-check.sh  # SessionStart hook: warns if skills are stale
│   ├── data-router/                 # ✅ BUILT — EntryPoint patterns
│   │   ├── SKILL.md                 # createEntryPoint, RoutesFn, DataBundle, Storybook integration
│   │   └── references/
│   │       ├── entrypoint-patterns.md   # Type reference + code patterns for all variations
│   │       └── storybook-entrypoint.md  # createWrapperForEntryPoint, decorators, mock data
│   ├── relay-conventions/           # NOT YET BUILT
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── fragment-colocation.md
│   │       ├── connections-pagination.md
│   │       └── mutations.md
│   ├── react-patterns/              # NOT YET BUILT
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── component-structure.md
│   │       ├── hooks-guidelines.md
│   │       └── error-boundaries.md
│   ├── yogi-patterns/               # NOT YET BUILT
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── connected-components.md
│   │       ├── data-hooks.md
│   │       └── composition.md
│   ├── mfe-conventions/             # NOT YET BUILT
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── module-federation.md
│   │       ├── routing.md
│   │       └── shared-state.md
│   ├── typescript-strict/           # NOT YET BUILT
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── strict-null-checks.md
│   │       ├── type-inference.md
│   │       └── relay-types.md
│   ├── testing-conventions/         # NOT YET BUILT
│   │   ├── SKILL.md
│   │   └── references/
│   │       ├── rtl-patterns.md
│   │       ├── relay-mocks.md
│   │       └── coverage-standards.md
│   └── storybook-patterns/          # NOT YET BUILT
│       ├── SKILL.md
│       └── references/
│           ├── csf3-format.md
│           ├── args-controls.md
│           └── decorators-parameters.md
├── commands/                        # 3 orchestration commands (phased workflows)
│   ├── new-component.md             # Command: Architect → Build → Test → Story
│   ├── new-mfe.md                   # Command: Architect MFE → Scaffold → Verify
│   └── review-frontend.md           # Command: Multi-agent PR review (parallel agents)
├── hooks/
│   ├── hooks.json                   # Declares PostToolUse and SubagentStop hooks
│   └── scripts/
│       ├── validate-typescript.sh   # Runs tsc --noEmit on modified .ts/.tsx files
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

### 3.2 Skills

#### Built Skills (3)

| Name | Status | Architecture | Key Content |
|------|--------|-------------|-------------|
| **picnic-components** | ✅ Built | Router → 10 sub-skills + 4 refs + validator | 57-component catalog, Stitches tokens, compound components, Formik forms. Router SKILL.md dispatches to sub-skills by intent keyword. |
| **picnic-update** | ✅ Built | Pipeline skill (6 steps) + session-start hook | `/picnic-update` command: detect changes → AST extract → format → AI curate → human review → finalize. Each step produces a git commit. Includes `/picnic-rollback`. |
| **data-router** | ✅ Built | SKILL.md + 2 references | createEntryPoint, EntryPointComponentProps, RoutesFn, DataBundle, Storybook integration with createWrapperForEntryPoint, 3-file page scaffolding pattern. |

**Picnic sub-skill breakdown** (all loaded via the picnic-components router):

| Layer | Sub-Skills | Purpose |
|-------|-----------|---------|
| Foundation (3) | design-tokens, stitches-patterns, layout-primitives | Token values, css prop patterns, Box/Stack/Grid |
| Problem (5) | data-table, form-builder, dialog-drawer, navigation, feedback-notifications | Domain-specific component patterns and decision guides |
| References (4) | actions-ref, typography-ref, data-display-ref, media-ref | Lookup tables for simpler component categories |
| Validator (1) | validator | Post-generation validation: 125 rules across 8 categories |

#### Remaining Skills (7)

| Name | Triggers | Key References |
|------|----------|----------------|
| **relay-conventions** | "Relay", "fragment", "query", "mutation", "connection", "pagination" | fragment-colocation.md, connections-pagination.md, mutations.md |
| **react-patterns** | "React", "hooks", "component", "props", "state", "context" | component-structure.md, hooks-guidelines.md, error-boundaries.md |
| **yogi-patterns** | "Yogi", "YogiButton", "YogiCard", "useYogiQuery", "connected component" | connected-components.md, data-hooks.md, composition.md |
| **mfe-conventions** | "micro-frontend", "MFE", "module federation", "Webpack", "shell" | module-federation.md, routing.md, shared-state.md |
| **typescript-strict** | "TypeScript", "strict", "null check", "type", "interface", "generic" | strict-null-checks.md, type-inference.md, relay-types.md |
| **testing-conventions** | "test", "Vitest", "React Testing Library", "mock", "coverage" | rtl-patterns.md, relay-mocks.md, coverage-standards.md |
| **storybook-patterns** | "Storybook", "story", "CSF", "controls", "decorator" | csf3-format.md, args-controls.md, decorators-parameters.md |

### 3.3 Commands (3)

| Command | Purpose | Orchestration Flow | Agents Used |
|---------|---------|-------------------|-------------|
| **/new-component** | Create React component with tests + stories | 1. component-architect (plan) → 2. component-builder (implement) → 3. test-writer (tests) → 4. storybook-writer (stories) | 4 agents, sequential |
| **/new-mfe** | Scaffold new micro-frontend | 1. mfe-architect (plan) → 2. mfe-scaffolder (scaffold) → 3. component-builder (entry component) → 4. Validation (build, type-check) | 3 agents, sequential + validation |
| **/review-frontend** | Multi-agent PR review | 1. frontend-reviewer (general review) in parallel with 2. test-writer (coverage check) + 3. relay-architect (data layer review) → 4. Aggregate feedback | 3 agents, parallel + aggregation |

### 3.4 Hooks (4)

**Quality gate hooks** (planned in `hooks/01-quality-gates.md` — not yet built):

| Hook | Event | Matcher | Script | Purpose |
|------|-------|---------|--------|---------|
| **typescript-validate** | `PostToolUse` | `Write\|Edit` on `.tsx?$` | `validate-typescript.sh` | Runs `tsc --noEmit` on modified file to catch type errors |
| **check-relay-fragments** | `PostToolUse` | `Write` on `.tsx?$` | `check-relay-fragments.sh` | Validates fragment naming (`ComponentName_propName`), colocation |
| **component-completeness** | `SubagentStop` | `component-builder` | `component-completeness.sh` | Verifies component has .tsx, .test.tsx, .stories.tsx, index.ts |

**Note**: The quality gates design evolved from git lifecycle hooks (pre-commit/pre-push) in the original plan to Claude Code tool-use hooks (PostToolUse/SubagentStop). This provides faster feedback — issues are caught immediately after file edits, not deferred to commit time.

**Maintenance hook** (built as part of picnic-update skill):

| Hook | Event | Script | Purpose |
|------|-------|--------|---------|
| **picnic-drift-check** | `SessionStart` | `session-start-drift-check.sh` | Warns if Picnic skills are stale vs. source repo |

---

## 4. Build Order (8 Phases)

### Phase 1: Picnic Components + Data Router ✅ COMPLETE
**Goal**: Establish the two highest-impact skills — Picnic design system and DataRouter patterns.

**What was planned**: Simple `picnic-components` skill with 3 references (component-catalog.md, layout-system.md, theming.md), plus a data-router skill with 2 references.

**What actually happened**:
- Library analysis revealed ~70% of the original Picnic plan was wrong (assumed Tailwind, generic patterns). Actual stack: Stitches CSS-in-JS, compound components, Radix UI, Formik, `@attentive/picnic` package.
- Picnic skill was decomposed from a monolith into a **router + 10 sub-skills + 4 references + validator** to manage token budget (~3KB router loads first, then 1 sub-skill on demand).
- An **AST extraction pipeline** was built (4 scripts in Node.js) to parse Picnic source into `picnic-database.json` (57 components). This replaced the manual document-gathering approach from `01-prerequisites.md`.
- **AI curation prompt templates** were created for experiential content (gotchas, decision guides, anti-patterns, canonical examples, common mistakes).
- Data router skill was built as designed — SKILL.md + 2 references.

**Deliverables** (all complete):
- [x] `skills/picnic-components/SKILL.md` — Router with intent→skill dispatch table
- [x] 3 foundation sub-skills: design-tokens, stitches-patterns, layout-primitives
- [x] 5 problem sub-skills: data-table, form-builder, dialog-drawer, navigation, feedback-notifications
- [x] 4 reference files: actions-ref, typography-ref, data-display-ref, media-ref
- [x] 1 validator skill (125 rules, 8 categories)
- [x] Extraction scripts: extract.mjs, detect-changes.mjs, assemble-context.mjs, format.mjs
- [x] `picnic-database.json` — 57 components extracted from source
- [x] 5 AI curation prompt templates
- [x] `skills/data-router/SKILL.md` + 2 references (entrypoint-patterns.md, storybook-entrypoint.md)

**Key lesson**: Skills for internal libraries need AST extraction, not manual documentation. The extraction pipeline pays for itself by enabling automated updates.

---

### Phase 1.5: Picnic Maintenance Pipeline ✅ COMPLETE
**Goal**: Keep Picnic skills in sync with source code changes automatically.

**This phase was not in the original plan.** It emerged from the realization that a 57-component design system changes frequently, and manual skill updates would not scale.

**Deliverables** (all complete):
- [x] `skills/picnic-update/SKILL.md` — 6-step pipeline (`/picnic-update` command)
- [x] SessionStart hook (`session-start-drift-check.sh`) — warns if skills are stale
- [x] `/picnic-rollback` — granular rollback of pipeline commits
- [x] Flags: `--full`, `--no-ai`, `--dry-run`, `--detect-only`

**Pipeline steps**: Preflight → Detect Changes → Extract → Format + Merge → AI Curation (optional) → Human Review → Finalize. Each step produces a git commit for granular rollback.

---

### Phase 2: Remaining Foundation Skills (2-7)
**Goal**: Complete skill library with Relay, React, Yogi, MFE, TypeScript, Testing, Storybook knowledge.

**Deliverables**:
1. `skills/relay-conventions/` (SKILL.md + 3 references)
2. `skills/react-patterns/` (SKILL.md + 3 references)
3. `skills/yogi-patterns/` (SKILL.md + 3 references)
4. `skills/mfe-conventions/` (SKILL.md + 3 references)
5. `skills/typescript-strict/` (SKILL.md + 3 references)
6. `skills/testing-conventions/` (SKILL.md + 3 references)
7. `skills/storybook-patterns/` (SKILL.md + 3 references)

**Updated approach** (informed by Phase 1 lessons):
- For library-backed skills (yogi-patterns), consider building AST extraction like picnic-components
- For convention skills (relay-conventions, react-patterns, typescript-strict), manual authoring with codebase examples is appropriate — no source library to extract from
- For tool skills (testing-conventions, storybook-patterns), extract from config files (vitest.config, .storybook/) and existing test/story files
- All skills should use the revised tech stack context (Vitest not Jest, Storybook 9.1.x not 7+, Stitches not Tailwind)

**Validation**:
- [ ] All 7 skills pass skill format validation (frontmatter syntax, reference links)
- [ ] Cross-references between skills are accurate (e.g., relay-conventions → typescript-strict)
- [ ] Trigger phrases tested (grep codebase for common terms, ensure skill loads)
- [ ] Skills reference actual `@attentive/*` packages and patterns (not generic examples)

---

### Phase 3: Read-Only Agents
**Goal**: Build planning/review agents that analyze code but don't edit files.

**Deliverables**:
1. `agents/component-architect.md` (loads picnic-components, react-patterns, typescript-strict, data-router)
2. `agents/relay-architect.md` (loads relay-conventions, typescript-strict)
3. `agents/mfe-architect.md` (loads mfe-conventions, react-patterns, typescript-strict, data-router)
4. `agents/frontend-reviewer.md` (loads all skills)

**Validation**:
- [ ] Each agent has role, goal, skills, tools, constraints, output format
- [ ] Test prompts: "Plan a UserCard component using Picnic" (component-architect), "Review this PR for Relay conventions" (frontend-reviewer)
- [ ] Agents use plan mode (`plan_mode_required: true` in agent definition)
- [ ] Agents produce structured output (markdown plan with sections)
- [ ] component-architect and mfe-architect reference DataRouter patterns for page scaffolding

---

### Phase 4: Implementation Agents
**Goal**: Build agents that write code (components, tests, stories, MFE scaffolding).

**Deliverables**:
1. `agents/component-builder.md` (loads picnic-components, react-patterns, typescript-strict, data-router)
2. `agents/storybook-writer.md` (loads storybook-patterns, picnic-components, react-patterns, data-router)
3. `agents/test-writer.md` (loads testing-conventions, relay-conventions, react-patterns)
4. `agents/mfe-scaffolder.md` (loads mfe-conventions, react-patterns, typescript-strict, relay-conventions, data-router)

**Validation**:
- [ ] Each agent can create files from scratch (test in sandbox repo)
- [ ] Test: component-builder generates valid `.tsx` with strict TypeScript, Stitches `css` prop, `@attentive/picnic` imports, proper exports
- [ ] Test: storybook-writer generates CSF3 story with controls, Relay decorator, `createWrapperForEntryPoint` for EntryPoint pages
- [ ] Test: test-writer generates passing Vitest test with RTL + Relay mock
- [ ] Test: mfe-scaffolder generates buildable Webpack config with DataRouter EntryPoints

---

### Phase 5: Hooks & Quality Gates
**Goal**: Automate validation checks as Claude Code PostToolUse and SubagentStop hooks.

**Deliverables**:
1. `hooks/hooks.json` (declares PostToolUse and SubagentStop hooks)
2. `hooks/scripts/validate-typescript.sh` (runs `tsc --noEmit` on modified files)
3. `hooks/scripts/check-relay-fragments.sh` (parses .tsx files for fragment naming)
4. `hooks/scripts/component-completeness.sh` (checks for test + story + export after component-builder finishes)

**Design** (specified in `hooks/01-quality-gates.md`):
- PostToolUse hooks trigger after Write/Edit on .ts/.tsx files — faster feedback than git hooks
- SubagentStop hook triggers after component-builder agent completes
- All hooks are non-blocking (warn agents, don't halt execution)

**Validation**:
- [ ] Each script exits with code 0 on success, non-zero on failure
- [ ] Test: Write file with TS error → hook shows formatted type error
- [ ] Test: Write component without test → component-completeness warns
- [ ] Test: Write misnamed fragment → hook catches and explains convention
- [ ] Scripts handle edge cases (no .tsx files, missing tsconfig.json, etc.)

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
- [ ] Test `/new-mfe analytics-dashboard` (produces MFE directory, DataRouter EntryPoints, buildable Webpack config)
- [ ] Test `/review-frontend` on real PR (produces aggregated feedback markdown)
- [ ] Commands respect `max_turns` budget (architects: 5 turns, builders: 10 turns)

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
- [ ] PostToolUse hooks trigger on Write/Edit of .tsx files
- [ ] SessionStart hook warns when Picnic skills are stale
- [ ] All skills load on-demand (check Claude logs for skill activation)
- [ ] `/picnic-update` successfully detects and applies source changes
- [ ] Run on real codebase with 3 engineers for 1 week (collect feedback)

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

**What actually happened**: The manual document-gathering approach from `01-prerequisites.md` was partially superseded. For Picnic (the highest-priority prerequisite), AST extraction scripts replaced manual documentation:
1. Built `extract.mjs` to parse Picnic source into structured JSON (57 components with props, variants, sub-components)
2. Built `format.mjs` to transform JSON into compact skill notation
3. Built `detect-changes.mjs` for ongoing change detection
4. Built `assemble-context.mjs` to gather source + tests + stories for AI curation

**Remaining prerequisites** (still needed for other skills):
- Yogi connected components guide — may benefit from similar AST extraction
- GraphQL schema reference — can be generated from schema introspection
- MFE architecture guide — manual authoring from Webpack configs and existing architecture docs
- React/TypeScript/Testing/Storybook patterns — manual authoring with codebase examples

**Note**: The prerequisite templates in `01-prerequisites.md` contain outdated assumptions (Tailwind, `@company/picnic`, Jest, Storybook 7). These should be updated or marked as superseded before using them for remaining skills.

**Validation**: Picnic P0 complete via extraction. Other P0 documents still need gathering/generation.

---

### 7.2 Iterative Skill Development (Phases 1-2)
**Pattern**: Build skill → test in isolation → integrate with agents.

**Lessons learned from Phase 1** (apply to remaining skills):

1. **Library-backed skills** (picnic-components, potentially yogi-patterns):
   - AST extraction is worth the investment — produces accurate, maintainable skill content
   - Decompose into sub-skills if the domain is large (>20 components or >5000 lines)
   - Build a router SKILL.md that dispatches to sub-skills by keyword
   - Create a maintenance pipeline (like picnic-update) if the source library changes frequently

2. **Convention skills** (relay-conventions, react-patterns, typescript-strict):
   - Manual authoring with codebase examples is appropriate
   - Write plan doc first (like `01-picnic-components.md`) with gap analysis before building
   - Validate examples compile against actual codebase (the original Picnic plan had ~70% wrong examples)

3. **Tool/config skills** (testing-conventions, storybook-patterns, mfe-conventions):
   - Extract patterns from config files (vitest.config, .storybook/, webpack.config.js)
   - Find 3-5 exemplary files in the codebase and distill patterns

**Per-Skill Process** (updated):
1. Write plan doc: `skills/NN-skill-name.md` with purpose, gap analysis, SKILL.md spec, reference outlines
2. Decide approach: AST extraction vs. manual authoring vs. config extraction
3. Write `SKILL.md` frontmatter (name, description in third person, triggers)
4. Write overview section (2-3 paragraphs: what, when, why)
5. Create references with real examples from `@attentive/*` packages (not generic patterns)
6. Test: verify skill loads and references appear in context
7. Test: verify trigger phrases activate the skill correctly

**Validation Gate**: All skills pass format validation + manual trigger test before proceeding to Phase 3.

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

### Risk 1: Prerequisite Docs Don't Exist ✅ REALIZED & RESOLVED
**What happened**: Picnic docs didn't exist in usable form. The `01-prerequisites.md` templates contained ~70% incorrect assumptions (Tailwind instead of Stitches, wrong package names, wrong component patterns).
**Resolution**: Built AST extraction pipeline instead of manual documentation. Scripts parse source directly, producing accurate structured data. This approach is reusable for other library-backed skills (yogi-patterns).

### Risk 2: Skills Loaded Too Often (Performance) ✅ REALIZED & RESOLVED
**What happened**: A monolithic Picnic skill would have been ~8000 lines — far too large for a single skill load.
**Resolution**: Decomposed into router + sub-skills. The router (~3KB) loads first and dispatches to exactly one sub-skill based on intent keywords. Progressive loading chain: `design-tokens → stitches-patterns → layout-primitives → problem skills`. At most 3 problem skills per request.

### Risk 3: Generated Code Doesn't Match Codebase Style
**Mitigation**: Phase 4 validation includes human review of generated code. Add codebase-specific examples to skill references (not generic React patterns).
**Phase 1 validation**: The Picnic skill plan's gap analysis caught this early — original examples used Tailwind/className patterns instead of Stitches/css prop. AST extraction ensures all examples come from actual source code.

### Risk 4: Agents Exceed Token Budgets
**Mitigation**: Set `max_turns` per agent (architects: 5, builders: 10, reviewers: 15). Use plan mode to frontload thinking (10k tokens planning vs. 440k implementing).

### Risk 5: Low Adoption (Engineers Ignore Plugin)
**Mitigation**: Start with "easy win" command (`/new-component` saves 30+ min per component). Demo at team meeting. Collect testimonials from early adopters.

### Risk 6: Skill Content Goes Stale (NEW)
**Discovered during**: Phase 1 — Picnic has 57 components that change with library releases.
**Mitigation**: Built the `picnic-update` maintenance pipeline with 6-step process (detect → extract → format → AI curate → human review → finalize). SessionStart hook warns when skills are stale. Each pipeline step produces a git commit for granular rollback. This pattern should be considered for other library-backed skills that change frequently.

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

1. ~~**Read `01-prerequisites.md`**~~ — ✅ Done. Templates need updating for correct tech stack.
2. ~~**Gather/Generate Prerequisites (Picnic)**~~ — ✅ Done via AST extraction pipeline.
3. ~~**Execute Phase 1 (Picnic + Data Router)**~~ — ✅ Done. Router + 10 sub-skills + 4 refs + validator + pipeline.
4. **Update `01-prerequisites.md`** — Correct outdated assumptions (Stitches not Tailwind, `@attentive/picnic`, Vitest, Storybook 9.1.x). Mark Picnic section as superseded by extraction pipeline.
5. **Execute Phase 2 (Remaining Skills)** — Build relay-conventions, react-patterns, yogi-patterns, mfe-conventions, typescript-strict, testing-conventions, storybook-patterns. Decide per-skill: AST extraction vs. manual authoring.
6. **Execute Phases 3-7** — Agents, hooks, commands, integration. Follow build order, validate at each phase boundary.
7. **Dogfood & Iterate** — Test with 3 engineers for 1 week, fix critical bugs
8. **Rollout** — Install for all 50 engineers, monitor metrics, collect feedback
9. **Maintain** — Use `/picnic-update` for Picnic skill maintenance. Consider similar pipelines for yogi-patterns if library changes frequently. Monthly skill updates for convention skills, quarterly plugin version bumps.

---

**Document Version**: 2.0
**Last Updated**: 2026-02-18
**Owner**: Frontend Platform Team
**Status**: In Progress — Phase 1 + 1.5 complete, Phase 2 next
