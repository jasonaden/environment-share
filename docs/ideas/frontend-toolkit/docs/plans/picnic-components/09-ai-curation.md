# 09 — AI Curation: Generating "Human Knowledge" Content

> **Author**: AI-Curator Agent (Task #2)
> **Date**: 2026-02-18
> **Status**: Final
> **Sources**: 08-skill-audit, 08-generation-pipeline, 02-style-guide, implemented skills, Picnic source exploration

---

## 1. Executive Summary

The skill audit (08) classified 64% of skill content as "C — Human Knowledge Required." This proposal challenges that classification. With the right context, AI can **recommend** most of that 64% — not perfectly, but well enough that human review becomes a validation step rather than an authoring step.

**Key insight**: The Picnic source code contains far more contextual information than what the audit's AST extraction considered. Guidance.mdx files (16+ components), test suites, Storybook stories, source code comments (NOTE/FIXME/XXX), and TypeScript constraints collectively encode most of the "human knowledge" that appears in skills. AI doesn't need to *discover* gotchas through usage — it needs to *read the evidence* that developers already left behind.

**Revised estimate**: With AI curation, the human authoring burden drops from 64% to ~15-20% — only architectural decisions (router design, skill grouping, progressive loading strategy) and rare experiential gotchas invisible in code truly require human invention.

---

## 2. Category-by-Category AI Generation Assessment

### 2.1 Decision Guides ("When to Use X vs Y")

**Current classification**: 100% Human (C)
**Revised assessment**: 80% AI-generatable

**What AI can analyze**:
- Component names and their semantic overlap (Dialog vs StandardDialog, Select vs SearchableSelect)
- Radix primitive used (both Dialog and Drawer wrap Radix Dialog → modal vs panel distinction)
- Sub-component hierarchies (StandardDialog has .Header/.Body/.Footer slots; Dialog does not → structured vs custom)
- Props that differ between components (Drawer has `onCloseFinish`; Dialog does not → animation awareness)
- Guidance.mdx files that describe component purpose and recommended usage
- Stories that show when components are used in different scenarios

**What AI produces**:

| Need | Component | (AI reasoning) |
|------|-----------|----------------|
| Structured modal (header/body/footer) | StandardDialog | Has .Header .Body .Footer sub-components |
| Custom modal layout | Dialog | Has `styling(default\|unstyled)` — escape hatch |
| Structured side panel | StandardDrawer | Same sub-component pattern as StandardDialog |
| Custom side panel | Drawer | Low-level equivalent |
| Floating info/guidance | Popover | Not modal, anchored to trigger, has guidance variant |
| Action menu | DropdownMenu | Has .Item .TextItem .Label — menu-specific subs |

**Confidence**: HIGH — the structural differences between components are visible in their APIs. Guidance.mdx files provide explicit intent descriptions that confirm the structural analysis.

**Low-confidence edge cases**: Choosing between Popover and Tooltip (both float, both anchor) requires understanding the UX intent — informational vs interactive. This specific distinction would be flagged for review.

---

### 2.2 Gotchas / CRITICAL Notes

**Current classification**: 100% Human (C)
**Revised assessment**: 60% AI-generatable

**Source evidence AI can find**:

| Gotcha | Source Evidence | Detection Method |
|--------|----------------|------------------|
| Stack uses margin NOT gap | `Stack.tsx`: `// NOTE: we remove gap from CSS since it doesn't work w/ Safari` | Scan for `NOTE:` comments |
| Select internals copied from Radix | `Select.tsx`: `// XXX: Copied from Radix as they don't export this event` | Scan for `XXX:` / `FIXME:` |
| Stitches !important workaround | `Select/StyledSelectComponents.tsx`: `// FIXME: The !important here is necessary because of a stitches...` | Scan for `FIXME:` |
| Checkbox styling duplicated in Select | `Checkbox.tsx`: `// This styling is duplicated in Select/NestedListComponents` | Scan for cross-reference comments |
| Table rows use display:contents | Table source — row styled with `display: 'contents'` in variants | AST: detect `display: 'contents'` in styled() |
| Banner default role is 'status' | Test file: `expect(getByRole('status'))` | Parse test assertions for role checks |
| Tooltip needs Provider at root | guidance.mdx mentions TooltipProvider requirement | Parse guidance.mdx files |

**What AI cannot find** (genuine 40%):
- "$iconInfo not $iconInformational" — naming inconsistency only discoverable by trying the wrong name
- "spread css LAST" — ordering gotcha that is a Stitches behavior, not documented in comments
- "300ms close animation" timing — specific number not in source constants
- Silent failures from prop mismatches (e.g., `name` not matching `initialValues` keys)

**Confidence scoring**:
- HIGH: Gotchas from explicit `NOTE:`, `FIXME:`, `XXX:`, `TODO:` comments
- MEDIUM: Gotchas inferred from unusual code patterns (display:contents, removed gap)
- LOW: Gotchas about silent failures or timing — flag for human review

---

### 2.3 Anti-Patterns (BAD → GOOD)

**Current classification**: 100% Human (C)
**Revised assessment**: 70% AI-generatable

**Type-based anti-patterns** (HIGH confidence):
- `className` excluded from TypeScript types → `BAD: className="x"` → `GOOD: css={{ ... }}`
- `style` excluded → `BAD: style={{}}` → `GOOD: css={{ ... }}`
- `gap` filtered from Stack's CSS object → `BAD: <Stack css={{ gap: '$space4' }}>` → `GOOD: <Stack spacing="$space4">`

**Deprecation-based** (HIGH confidence):
- JSDoc `@deprecated` markers → `BAD: variant="basic"` → `GOOD: variant="secondary"`
- ButtonGroupNext existence implies ButtonGroup is deprecated

**Pattern-based** (MEDIUM confidence):
- Components that have both `Form.*` and standalone versions → `BAD: mixing in same form` → `GOOD: use one pattern consistently`
- Stitches utility props (p, m, px, py) that duplicate css prop → AI can detect overlap and recommend canonical form

**Usage-based** (LOW confidence — flag for review):
- "Never override transition timing" — not visible in types
- "Never use Tailwind with Stitches" — ecosystem-level constraint
- Token misuse patterns ($bgDefault vs $bgAccent for cards) — requires design judgment

---

### 2.4 Code Examples (Canonical Examples)

**Current classification**: 100% Human (C)
**Revised assessment**: 75% AI-generatable

**What AI has to work with**:
1. **Complete prop interfaces** — knows every prop, its type, whether required
2. **Sub-component hierarchies** — knows the nesting structure (Table.Header > Table.HeaderRow > Table.HeaderCell)
3. **Storybook stories** — real usage examples showing composition patterns, responsive configurations, interactive patterns
4. **Guidance.mdx** — documented patterns with Canvas blocks embedding story examples
5. **Test files** — behavioral expectations showing correct usage

**Generation approach**:
- Start from compound hierarchy: lay out the tree structure with required props
- Fill in realistic prop values from variant enums and type constraints
- Compose multiple features from the skill (sorting + selection + actions for data-table)
- Cross-reference other components in the same skill (SearchBar above Table, Paginator below)
- Use stories as reference patterns for realistic usage

**Example: AI generating a data-table canonical example**:

Input context:
- Table compound hierarchy (11 sub-components with props)
- SortableHeaderCell requires `onChange`, `isSortActive`, `ascending`
- RowSelectorCell requires `checked`, `onChange`, `value`
- Stories show column sizing with `columnSizes`, focusable rows, cell content
- Guidance.mdx (if present) describes composition patterns

Output: A realistic table with sorting, selection, column sizing, cell content (Badge/ContainedLabel), and row actions — essentially what the current hand-written example shows.

**Confidence**: HIGH for structure and prop usage, MEDIUM for realism/opinionatedness (which features to combine, what business domain to simulate). The existing stories and guidance.mdx files provide strong signals for what patterns matter most.

---

### 2.5 Common Mistakes Checklists

**Current classification**: 100% Human (C)
**Revised assessment**: 70% AI-generatable

**Derivable from source analysis**:

| Mistake Category | Detection Source | Example |
|-----------------|-----------------|---------|
| Missing required props | TypeScript `!` (non-optional) interface members | "Column count in header MUST match cell count per body row" — columns prop is required |
| Wrong context usage | `Form.*` components reading Formik context | "Form.* components MUST be inside a `<Form>`" — they call useFormikContext() |
| Composition violations | Test files asserting parent-child relationships | "Trigger children must accept a ref" — Radix asChild pattern |
| State management errors | Tests showing controlled vs uncontrolled patterns | "`name` prop MUST match keys in initialValues" — Formik binding |
| Accessibility omissions | Test files using `getByRole()` assertions | "ARIA roles are built-in — do not add redundant role attributes" |
| Styling violations | Source code removing/filtering CSS properties | "Stack `gap` is silently stripped" — explicit removal in source |

**What requires human experience**:
- "Use `textVariant="caption"` for dense data tables" — design preference
- "Never mix Form.* and standalone inputs" — discovered through debugging, not code analysis
- "SearchableSelect.onInputValueChange is for the search string; onChange is for the selected value" — confusing API naming, not a code-level constraint

---

## 3. Context Requirements Per Category

### 3.1 Context Matrix

| Category | Extracted JSON | Source Code | Tests | Stories | Guidance.mdx | Other Components |
|----------|:-:|:-:|:-:|:-:|:-:|:-:|
| Decision Guides | Required | Helpful | — | Helpful | **Critical** | **Critical** |
| Gotchas | Helpful | **Critical** | **Critical** | — | Helpful | — |
| Anti-Patterns | **Critical** | Helpful | Helpful | — | Helpful | — |
| Code Examples | **Critical** | Helpful | Helpful | **Critical** | Helpful | Helpful |
| Common Mistakes | Required | **Critical** | **Critical** | — | Helpful | — |

### 3.2 Context Preparation Per Category

**Decision Guides** need:
```
- Extracted JSON for all components in the decision (e.g., Dialog + Drawer + Popover)
- guidance.mdx content for each component (purpose statements)
- Sub-component comparison (which has .Header/.Body/.Footer slots)
- Prop overlap analysis (which props are shared, which are unique)
```

**Gotchas** need:
```
- Full source code of the component file
- All comments containing NOTE:, FIXME:, XXX:, TODO:, HACK:
- Test file assertions (especially role checks, keyboard interaction, error scenarios)
- guidance.mdx accessibility sections
- Stitches styled() call details (variants, CSS filtering)
```

**Anti-Patterns** need:
```
- TypeScript interface (excluded props like className, style)
- Stitches CSS filtering logic (gap removal in Stack)
- @deprecated JSDoc tags
- Guidance.mdx "don't do this" sections
- Validator rules (if available) for the component
```

**Code Examples** need:
```
- Complete compound hierarchy with all sub-components and props
- Stories showing realistic compositions (interactive, multi-feature)
- Other components in the same skill (for cross-component composition)
- Form/Formik integration patterns (for form-related components)
```

**Common Mistakes** need:
```
- Required props (TypeScript non-optional members)
- Context dependencies (useFormikContext, TableContext)
- Test assertions (expected behavior that might be violated)
- Source code comments about cross-component coupling
- Composition rules (parent-child requirements)
```

---

## 4. Prompt Templates

### 4.1 Decision Guide Generator

```
SYSTEM: You are generating a decision guide for a Picnic component skill.
A decision guide helps developers choose between related components.

FORMAT: Markdown table with columns: Need | Component | (brief reason)
Follow the compact style guide — no prose explanations, just the table.

COMPONENTS IN THIS SKILL:
{for each component in skill}
## {name}
Purpose (from guidance.mdx): {guidance_summary}
Sub-components: {sub_list}
Key props (unique to this component): {unique_props}
Radix primitive: {radix_primitive or "none"}
{end for}

PROP OVERLAP ANALYSIS:
- Shared props across all: {shared_props}
- Unique to {name_1}: {unique_to_1}
- Unique to {name_2}: {unique_to_2}

INSTRUCTIONS:
1. Create a decision guide table where each row represents a user NEED
   (what they're trying to accomplish), not a component feature.
2. Needs should be phrased from the developer's perspective:
   "Structured modal (header/body/footer)" not "Has sub-component slots"
3. Order from most common need to least common.
4. If two components could serve the same need, explain the distinguishing
   factor in parentheses.
5. Assign confidence:
   - HIGH: Distinction is clearly visible in API differences
   - MEDIUM: Distinction requires understanding UX intent
   - LOW: Distinction is based on naming/convention only

OUTPUT:
| Need | Component | Confidence |
|------|-----------|------------|
```

### 4.2 Gotcha Detector

```
SYSTEM: You are analyzing Picnic component source code to detect gotchas —
non-obvious behaviors that cause bugs if developers aren't warned.

COMPONENT: {component_name}
FILE: {file_path}

SOURCE CODE (full component):
{source_code}

SOURCE COMMENTS (extracted):
{all_comments_with_line_numbers}

TEST ASSERTIONS:
{extracted_test_assertions}

GUIDANCE.MDX EXCERPTS:
{guidance_content_if_exists}

STITCHES STYLED() DETAILS:
{css_filtering_rules}
{variant_definitions}

INSTRUCTIONS:
1. Identify behaviors that would surprise a developer who only reads the
   TypeScript types and component name.
2. Categories to check:
   a. CSS properties silently removed or overridden
   b. Props that interact non-obviously (mutually exclusive, order-dependent)
   c. Required context providers (Formik, Tooltip, etc.)
   d. Rendering differences from what the component name suggests
      (e.g., display:contents on "Row")
   e. Browser-specific workarounds (Safari, etc.)
   f. Timing/animation behaviors with specific durations
   g. Accessibility defaults that differ from ARIA norms
3. For each gotcha, provide:
   - One-line description in CRITICAL/WARNING format
   - Source evidence (line number, comment, or code pattern)
   - Confidence: HIGH (explicit comment/code), MEDIUM (inferred pattern),
     LOW (naming/convention guess)
4. ONLY report genuine gotchas. "Component accepts children" is not a gotcha.
   "Component silently strips gap from css prop" IS a gotcha.

OUTPUT FORMAT:
**CRITICAL**: {description}
Source: {evidence}
Confidence: {HIGH|MEDIUM|LOW}

**WARNING**: {description}
Source: {evidence}
Confidence: {HIGH|MEDIUM|LOW}
```

### 4.3 Canonical Example Generator

```
SYSTEM: You are generating a single canonical code example for a Picnic
component skill. The example must demonstrate the key features of ALL
components in the skill within one realistic scenario.

SKILL: {skill_name}
COMPONENTS (with full API):
{for each component}
## {name}
Props: {compact_notation}
Sub-components: {hierarchy_tree}
Required props: {required_list}
{end for}

CROSS-REFERENCES:
- Components from other skills used as cell content: {cross_refs}
- Layout components typically wrapping this: {layout_refs}

STORIES (key patterns from Storybook):
{story_patterns_summary}

STYLE GUIDE RULES:
- One example per skill combining all key patterns
- Use realistic business domain data (campaigns, users, settings)
- Show state management pattern (external state, handlers)
- Comment line 1: list state variables and note "managed externally"
- Use Picnic tokens for spacing ($space4, etc.)
- Include cross-component composition when relevant
- Do NOT explain React/Stitches/Radix — only Picnic-specific usage

FEATURES TO DEMONSTRATE:
{list_of_key_features_from_audit}

INSTRUCTIONS:
1. Choose a realistic business scenario (e.g., campaign management,
   user administration, settings panel).
2. Compose all key components from the skill in one connected example.
3. Show the most common prop configurations (not every variant).
4. Include cross-skill references where natural (e.g., DropdownMenu
   inside Table.BodyCell for row actions).
5. Keep under 50 lines of JSX.
6. Mark confidence:
   - HIGH: Structural correctness guaranteed by prop types
   - MEDIUM: Composition pattern follows stories but is novel combination
   - LOW: Business logic assumptions that may not match real usage

OUTPUT: TSX code block with state comment header, followed by
2-3 line description of what the example demonstrates.
```

### 4.4 Anti-Pattern Generator

```
SYSTEM: You are generating anti-pattern rules for a Picnic component.
Anti-patterns are BAD → GOOD one-liners showing what NOT to do and
the correct alternative.

COMPONENT: {component_name}

TYPESCRIPT INTERFACE (excluded props):
{props_excluded_from_type}

STITCHES CSS FILTERING:
{properties_removed_or_overridden}

DEPRECATED MARKERS:
{deprecated_props_and_values}

GUIDANCE.MDX "DON'T" SECTIONS:
{negative_guidance}

VALIDATOR RULES (if exist):
{relevant_validator_rules}

INSTRUCTIONS:
1. Generate BAD → GOOD pairs for:
   a. Props excluded from TypeScript types (className, style, etc.)
   b. CSS properties silently stripped (gap in Stack, etc.)
   c. Deprecated values with migration targets
   d. Mixing paradigms (Form.* with standalone, Tailwind with Stitches)
   e. Accessibility violations (missing required ARIA attributes)
2. Format: `BAD: <code>` → `GOOD: <code>` — one line each
3. Only include patterns that a developer might actually try.
   Don't generate anti-patterns for things nobody would do.
4. Confidence:
   - HIGH: TypeScript/Stitches enforces this (code won't compile or prop is stripped)
   - MEDIUM: Code works but produces wrong behavior
   - LOW: Convention-based, no enforcement

OUTPUT:
BAD: `code` → GOOD: `code` [CONFIDENCE]
```

### 4.5 Common Mistakes Checklist Generator

```
SYSTEM: You are generating a Common Mistakes Checklist for a Picnic
component skill. These are the 3-5 most frequent errors developers make.

COMPONENTS IN SKILL: {component_list}

REQUIRED PROPS (per component):
{required_props_map}

CONTEXT DEPENDENCIES:
{context_providers_required}

TEST ASSERTIONS (behavioral expectations):
{key_test_assertions}

SOURCE COMMENTS (cross-component coupling):
{coupling_comments}

COMPOSITION RULES:
{parent_child_requirements}

INSTRUCTIONS:
1. Identify the 3-5 most likely mistakes, ordered by frequency/severity.
2. Each mistake should be:
   - A concrete, actionable statement (not vague advice)
   - Something that causes a bug, not just a style issue
   - Checkable — developer can verify compliance
3. Format: Bullet points starting with the component/prop name,
   then the rule, then the consequence in parentheses.
4. Confidence:
   - HIGH: Derived from required props, context, or explicit constraints
   - MEDIUM: Derived from test patterns or source comments
   - LOW: Derived from naming conventions or general knowledge

OUTPUT:
- {Rule statement} ({consequence if violated}) [CONFIDENCE]
```

---

## 5. Confidence Scoring System

### 5.1 Three-Tier Model

| Level | Criteria | Human Review | Action |
|-------|----------|:------------:|--------|
| **HIGH** | Derived from TypeScript types, explicit source comments (NOTE/FIXME/XXX), Stitches variant definitions, test assertions, or guidance.mdx explicit statements | Optional spot-check | Auto-include in generated skill |
| **MEDIUM** | Inferred from code patterns (display:contents, context usage), story compositions, prop overlap analysis, or component naming conventions | Recommended skim | Include with `[AI]` marker for review |
| **LOW** | Based on general React/design system knowledge, naming guesses, or analogy to similar libraries | **Required** | Include as `[REVIEW]` suggestion, not in final output until approved |

### 5.2 Confidence By Category

| Category | Expected HIGH | Expected MEDIUM | Expected LOW |
|----------|:------------:|:---------------:|:------------:|
| Decision Guides | 60% | 30% | 10% |
| Gotchas | 40% | 35% | 25% |
| Anti-Patterns | 70% | 20% | 10% |
| Code Examples | 50% | 40% | 10% |
| Common Mistakes | 55% | 30% | 15% |

### 5.3 Confidence Derivation Rules

```
HIGH if ANY of:
  - Explicit source comment (NOTE:, FIXME:, XXX:, TODO:)
  - TypeScript type constraint (excluded prop, required prop, discriminated union)
  - Stitches variant definition (enum values, default values, CSS filtering)
  - Test assertion (getByRole, fireEvent expectations)
  - Guidance.mdx explicit statement ("do not", "must", "always")

MEDIUM if ANY of:
  - Code pattern inference (display:contents → can't style row)
  - Cross-component analysis (both have similar subs → decision guide)
  - Story composition pattern (shows realistic usage)
  - Naming convention (StandardDialog implies opinionated; Dialog implies raw)
  - Context provider requirement (useFormikContext → must be inside Form)

LOW if ONLY:
  - General React knowledge applied to Picnic
  - Analogy to other design systems
  - Naming-only inference with no code evidence
  - UX convention with no source backing
```

---

## 6. Review Workflow

### 6.1 Recommended: Per-Skill Review with Confidence Filtering

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI CURATION PIPELINE                          │
│                                                                  │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐  │
│  │ CONTEXT   │───▶│ GENERATE  │───▶│  SCORE   │───▶│  OUTPUT  │  │
│  │ ASSEMBLY  │    │ (prompts) │    │ (confid.) │    │ (skill)  │  │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘  │
│       │                                               │          │
│  JSON DB +                                    Marked-up skill    │
│  source code +                                with [AI]/[REVIEW] │
│  tests + stories +                            annotations        │
│  guidance.mdx                                                    │
└─────────────────────────────────────────────────────────────────┘
         │                                               │
         ▼                                               ▼
   Picnic source                                  Review interface
```

### 6.2 Review Modes

**Mode 1: Confidence-gated (recommended for initial rollout)**
- HIGH items: auto-included, no review needed
- MEDIUM items: shown in a diff view, reviewer approves/rejects each
- LOW items: shown separately as "suggestions," reviewer must actively opt-in

**Mode 2: Per-skill review (recommended for ongoing)**
- Generate complete skill file with all AI content
- Show diff against current hand-written skill
- Reviewer sees: what AI kept, what AI changed, what AI added
- Accept/reject per-section

**Mode 3: Flagged-only (recommended for mature pipeline)**
- Only LOW confidence items need human review
- HIGH and MEDIUM auto-merged after initial calibration phase
- Human reviews a handful of flagged items per skill

### 6.3 Review Interface

The generated skill file uses inline annotations:

```markdown
## Decision Guide

| Need | Component |
|------|-----------|
| Structured modal (header/body/footer) | StandardDialog |  <!-- HIGH: has .Header/.Body/.Footer subs -->
| Custom modal layout | Dialog |  <!-- HIGH: has styling(default|unstyled) -->
| Floating info/guidance | Popover |  <!-- MEDIUM: guidance variant suggests info use -->
| Info tooltip vs interactive popover | ??? |  <!-- LOW: UX distinction not in source — REVIEW -->
```

After review, annotations are stripped and the clean skill file is committed.

### 6.4 Calibration Phase

Before trusting confidence scores, run the AI pipeline on **3 already-written skills** (data-table, form-builder, dialog-drawer) and compare:

| Metric | Target |
|--------|--------|
| HIGH items matching hand-written content | > 90% |
| MEDIUM items matching hand-written content | > 70% |
| LOW items matching hand-written content | > 40% |
| False positives (AI-generated gotcha that's wrong) | < 5% |
| False negatives (hand-written gotcha that AI missed) | < 30% |

If HIGH accuracy < 90%, the prompt needs tuning. If false positives > 5%, the confidence threshold needs raising. Run calibration before generating new skills.

---

## 7. Integration with Generation Pipeline

### 7.1 Where AI Curation Fits

The existing pipeline (08-generation-pipeline) has four stages: Extract → Database → Format → Merge. AI curation adds a **Stage 2.5** between Database and Format:

```
Extract → Database → AI CURATE → Format → Merge
                         │
                    Reads: database JSON
                    Reads: source code, tests, stories, guidance.mdx
                    Writes: curated-content.json (decision guides, gotchas,
                            anti-patterns, examples, checklists per skill)
```

### 7.2 Curated Content Database

```json
{
  "skill": "dialog-drawer",
  "generated_at": "2026-02-18T...",
  "decision_guide": {
    "rows": [
      { "need": "Structured modal", "component": "StandardDialog", "confidence": "HIGH",
        "evidence": "Has .Header/.Body/.Footer sub-components" },
      { "need": "Custom modal layout", "component": "Dialog", "confidence": "HIGH",
        "evidence": "Has styling(default|unstyled) prop" }
    ]
  },
  "gotchas": [
    { "severity": "CRITICAL", "component": "Drawer",
      "text": "onCloseFinish fires after 300ms close animation — do not unmount in onOpenChange",
      "confidence": "MEDIUM", "evidence": "Inferred from onCloseFinish prop existence" },
    { "severity": "WARNING", "component": "Dialog",
      "text": "portalContainer prop needed for custom portal target — default is document.body",
      "confidence": "HIGH", "evidence": "guidance.mdx states portal behavior" }
  ],
  "anti_patterns": [
    { "bad": "<Dialog><button>Open</button>...</Dialog>",
      "good": "<Dialog><Dialog.Trigger><Button>Open</Button></Dialog.Trigger>...</Dialog>",
      "confidence": "HIGH", "evidence": "Radix asChild pattern required" }
  ],
  "canonical_example": {
    "code": "...",
    "confidence": "MEDIUM",
    "features_demonstrated": ["controlled open state", "Form inside Dialog", "Footer button bar"]
  },
  "common_mistakes": [
    { "rule": "Trigger children must accept a ref and forward props",
      "consequence": "Radix asChild pattern breaks silently",
      "confidence": "HIGH", "evidence": "Test file validates ref forwarding" }
  ]
}
```

### 7.3 The Formatter Consumes Curated Content

The Format stage (Stage 3) reads both the extraction database AND the curated content database, merging structural data with AI-generated experiential content into the final skill file.

---

## 8. Revised Content Classification

### 8.1 Before vs After AI Curation

| Content Type | Audit (08) | With AI Curation | Delta |
|-------------|:----------:|:----------------:|:-----:|
| A — Source Extractable | 30% | 30% | — |
| B — Derivable with Heuristics | 6% | 6% | — |
| C₁ — AI-Generatable (HIGH) | — | 30% | +30% |
| C₂ — AI-Generatable (MEDIUM) | — | 18% | +18% |
| C₃ — Requires Human (LOW/none) | 64% | 16% | -48% |

### 8.2 What Genuinely Requires Human Authoring

After AI curation, only these categories remain human-only:

| Content | % of Total | Why AI Can't Generate |
|---------|:----------:|----------------------|
| Router architecture (routing table, loading strategy) | 5% | Pure architecture decision — no source evidence |
| Skill grouping (which components belong together) | 3% | Design judgment about developer mental models |
| YAML frontmatter (trigger phrases) | 3% | Requires understanding developer search intent |
| Rare experiential gotchas (no source evidence) | 3% | Discovered through production debugging |
| Token semantic grouping ("never mix status sets") | 2% | Design system philosophy, not code |
| **Total human-only** | **~16%** | |

---

## 9. Implementation Recommendations

### 9.1 Phase 1: Calibration

1. Run AI curation prompts against **3 existing skills** (data-table, form-builder, dialog-drawer)
2. Compare AI output to hand-written content
3. Measure accuracy per confidence tier
4. Tune prompts until HIGH accuracy > 90%

### 9.2 Phase 2: New Skill Generation

1. For each new skill (e.g., navigation, feedback-notifications):
   - Extract structural data (Stage 1-2 of existing pipeline)
   - Run AI curation prompts (Stage 2.5)
   - Generate complete skill file (Stage 3)
   - Human reviews only LOW-confidence items and architectural sections
2. Expected human effort: ~20 minutes per skill (review + router decisions) vs ~2 hours (full authoring)

### 9.3 Phase 3: Maintenance

1. When Picnic source changes, re-run extraction + AI curation
2. Diff new AI output against existing curated content
3. Flag only items where AI confidence changed or new gotchas detected
4. Human reviews flagged items only

### 9.4 Context Assembly Script

Add a context assembly step that gathers all inputs for AI curation:

```
scripts/picnic-curate/
├── index.ts                    # Orchestrator
├── context/
│   ├── gather-guidance.ts      # Extract guidance.mdx content per component
│   ├── gather-comments.ts      # Extract NOTE/FIXME/XXX/TODO comments
│   ├── gather-tests.ts         # Extract test assertions and behavioral checks
│   ├── gather-stories.ts       # Extract story patterns and compositions
│   └── gather-types.ts         # Extract TypeScript exclusions and constraints
├── prompts/
│   ├── decision-guide.ts       # Template from §4.1
│   ├── gotcha-detector.ts      # Template from §4.2
│   ├── example-generator.ts    # Template from §4.3
│   ├── anti-pattern.ts         # Template from §4.4
│   └── mistakes-checklist.ts   # Template from §4.5
└── output/
    └── curated-content.json    # Per-skill curated content
```

---

## 10. Summary

The skill audit found 64% of content was "human knowledge." This proposal demonstrates that with the right context — guidance.mdx files, test suites, source comments, stories, and TypeScript constraints — AI can generate ~48% of that 64%, reducing human authoring to ~16% of total content.

**The key shift**: From "humans author, scripts extract" to "scripts extract, AI recommends, humans validate."

| Pipeline Stage | Content Source | % of Skill |
|---------------|---------------|:----------:|
| Extract (mechanical) | AST, TypeScript types | 36% |
| AI Curate (recommended) | Source analysis + prompts | 48% |
| Human Author (required) | Architecture + rare gotchas | 16% |

**Three concrete deliverables**:
1. Five prompt templates (§4) for generating each curated content category
2. A three-tier confidence scoring system (§5) that gates human review effort
3. A per-skill review workflow (§6) that integrates into the existing pipeline
