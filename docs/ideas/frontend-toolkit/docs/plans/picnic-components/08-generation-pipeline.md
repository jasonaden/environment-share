# 08 — Generation Pipeline: Picnic Skill Maintenance System

> **Author**: Pipeline Designer (Task #4)
> **Date**: 2026-02-18
> **Status**: Final
> **Sources**: 08-source-exploration (Task #1), 08-skill-audit (Task #2), 08-tooling-research (Task #3), design-sections/02-style-guide

---

## 1. Executive Summary

The Picnic skill system contains ~39KB of content across 14 files (router, 3 foundation skills, 5 problem skills, 4 references, 1 validator). Some of this content can be mechanically extracted from source code; the rest requires human expertise. This proposal designs a hybrid pipeline that automates what's automatable while protecting human-curated content from being overwritten during regeneration.

**Key insight**: The skill system has two fundamentally different content types:
- **Structural data** (props, variants, defaults, sub-components, tokens) — extractable from source, changes when code changes
- **Experiential knowledge** (decision guides, gotchas, anti-patterns, canonical examples, constraints) — human-authored, evolves through usage experience

The pipeline separates these cleanly: scripts extract structural data into an intermediate JSON database, and a formatter transforms that data into the compact skill notation. Human-curated content lives in protected sections that survive regeneration.

---

## 2. Content Classification

### 2.1 Source-Extractable (Mechanical)

These data points can be extracted directly from Picnic source code with high reliability:

| Data | Source Location | Extraction Method | Target Files |
|------|----------------|-------------------|-------------|
| Component list (57) | `src/components/index.ts` | Parse exports | Router SKILL.md |
| Sub-component lists | `*.tsx` — `X.Sub = ...` assignments | AST walk | All reference + problem skills |
| Stitches variant names + values | `styled()` call — `variants: { ... }` | @babel/parser AST | All reference + problem skills |
| Default variant values | `styled()` call — `defaultVariants: { ... }` | @babel/parser AST | All reference + problem skills |
| Explicit interface props | `interface XProps { ... }` declarations | @babel/parser AST | Problem skills (Pattern B, C, D) |
| Base element / primitive | `styled('element', ...)` or `styled(RadixComponent, ...)` | @babel/parser AST | Reference files (`Primitive:` line) |
| Design tokens (all scales) | `src/themes/theme-2021.ts` | AST parse single object | foundation/design-tokens refs |
| Dark theme overrides | `src/themes/theme-dark.ts` | AST parse extends | foundation/design-tokens refs |
| Breakpoints | `src/media.ts` | Parse constants | foundation/design-tokens |
| CSS utility names | `src/utils/*.ts` | Parse exports | foundation/stitches-patterns |
| Icon names (160) | `src/components/Icon/icon-set/icons/` | List directory | references/media-ref |
| Third-party icon names (30) | `src/components/Icon/icon-set/third-party-icons/` | List directory | references/media-ref |
| displayName values | `X.displayName = 'X'` | grep/regex | Validation |
| Radix primitive wrapping | `import { * } from '@radix-ui/*'` | grep imports | Problem skills (`Primitive:` line) |
| Polymorphic components | `react-polymorphic-box` usage | grep imports | Reference files |
| Compound component interfaces | `interface CompositeComponent extends ...` | AST walk | Reference + problem skills |

### 2.2 Human-Curated (Cannot Extract)

These require experience with the Picnic system and cannot be derived from source:

| Content | Why Not Extractable | Current Home |
|---------|-------------------|-------------|
| Decision guides ("When to Use") | Requires knowledge of intent and UX patterns | Problem skills |
| Canonical examples | Requires knowing which patterns matter most | Problem skills |
| Gotchas / CRITICAL notes | Discovered through usage, not visible in source | Problem + foundation skills |
| Anti-patterns (BAD → GOOD) | Requires knowing common mistakes | Skills "Constraints" sections |
| Common Mistakes Checklist | Experience-based validation rules | Skills (footer) |
| Non-obvious behavior notes | Discovered by using the component, not reading source | `notes:` lines in references |
| Component categorization | Design judgment (which skill owns which component) | Router routing table |
| Dependency declarations | Architectural knowledge of what loads when | Router, skill headers |
| G4-G9 global rules | Meta-knowledge about the skill system itself | Style guide, skill headers |
| Validator rules (125) | Accumulated usage patterns | validator/SKILL.md |
| Token grouping/naming | Semantic understanding of token purposes | design-tokens SKILL.md |
| State progressions | Design knowledge (hover → pressed → disabled) | Token reference |

### 2.3 AI-Assistable (Hybrid)

Some content can be *drafted* by AI using extracted data as input, but needs human review:

| Content | AI Input | Human Review Needed |
|---------|----------|-------------------|
| `notes:` lines for components | Source code + known patterns | Verify accuracy, catch missing gotchas |
| Deprecation notes | grep for "deprecated" comments | Verify migration path is correct |
| Compact notation formatting | Extracted JSON → style guide BNF | Verify "never document" props are excluded |
| Props filtering | Extracted full prop list + exclusion rules | Verify nothing important was excluded |

---

## 3. Pipeline Architecture

### 3.1 High-Level Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GENERATION PIPELINE                          │
│                                                                 │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│  │  EXTRACT  │───▶│  DATABASE │───▶│  FORMAT   │───▶│  MERGE   │ │
│  │  (script) │    │  (JSON)  │    │  (script) │    │  (script)│ │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│       │                                │               │       │
│  reads source              applies style guide    preserves    │
│  code files                + exclusion rules      curated      │
│                                                   content      │
└─────────────────────────────────────────────────────────────────┘
         │                                               │
         ▼                                               ▼
   Picnic source                                  Skill files
   (libs/picnic/)                            (picnic-components/)
```

### 3.2 Four-Stage Pipeline

**Stage 1: Extract** → Reads Picnic source, produces structured JSON
**Stage 2: Database** → Intermediate JSON representation of all extractable data
**Stage 3: Format** → Converts JSON to compact skill notation per style guide
**Stage 4: Merge** → Combines generated content with human-curated sections

### 3.3 What Runs How

| Stage | Automation Level | Trigger | Human Involvement |
|-------|-----------------|---------|-------------------|
| Extract | Fully automated | `npm run extract` | None |
| Database | Fully automated | Output of Extract | None |
| Format | Fully automated | `npm run format` | None |
| Merge | Semi-automated | `npm run merge` | Review diff, approve changes |

---

## 4. Stage 1: Extraction Scripts

### 4.1 Technology Choice

**Primary**: `@babel/parser` + `@babel/traverse` (TypeScript/Node.js)

**Rationale** (from tooling research):
- Picnic's Stitches variants are always **literal objects** — no computed keys, no spreads, no dynamic expressions
- @babel/parser handles TSX natively without full TypeScript compilation
- Same tooling extracts variants, interfaces, sub-components, and tokens
- ~300 LOC total, low maintenance burden
- Stitches is archived/stable — extraction patterns won't change

**Secondary**: grep/ls for inventory data (component list, icon names, sub-component detection)

### 4.2 Script Structure

```
scripts/picnic-extract/
├── index.ts                    # Orchestrator: runs all extractors, writes database
├── extractors/
│   ├── components.ts           # Component inventory from index.ts
│   ├── variants.ts             # Stitches variants from styled() calls
│   ├── interfaces.ts           # TypeScript interface props (Pattern B, D)
│   ├── compound.ts             # CompositeComponent sub-component detection
│   ├── tokens.ts               # Theme token scales from theme-2021.ts
│   ├── dark-tokens.ts          # Dark theme overrides from theme-dark.ts
│   ├── breakpoints.ts          # Breakpoint values from media.ts
│   ├── icons.ts                # Icon name lists from icon-set directories
│   └── utils.ts                # CSS utility exports from utils/
├── filters/
│   ├── never-document.ts       # Removes universal props (css, children, ref, etc.)
│   ├── boolean-collapse.ts     # Converts { true: {}, false: {} } → boolean
│   └── internal-only.ts        # Removes internal variants (disabledVisually, etc.)
└── output/
    └── picnic-database.json    # The intermediate database
```

### 4.3 Per-Extractor Details

**`components.ts`** — Parse `src/components/index.ts` barrel exports
- Input: `export * from './Badge'` lines
- Output: `["Accordion", "Badge", "Banner", ...]`
- Complexity: Trivial (regex sufficient)

**`variants.ts`** — Walk AST for `styled()` calls
- Input: Any `.tsx` file
- Finds: `styled('element', { variants: { ... }, defaultVariants: { ... } })`
- Output per component:
  ```json
  {
    "baseElement": "button",
    "variants": {
      "variant": ["primary", "secondary", "subdued", "inverted"],
      "size": ["small", "medium", "large"]
    },
    "defaultVariants": { "variant": "primary", "size": "medium" }
  }
  ```
- Handles: Pattern A (pure styled) and Pattern B (styled primitive in wrapped FC)

**`interfaces.ts`** — Parse explicit TypeScript interfaces
- Input: `interface XProps { loading?: boolean; iconName: IconName; }`
- Output: Additional props not captured by Stitches variants
- Handles: Pattern B (FC wrapper props), Pattern D (pure FC props)
- Marks required vs optional from `?:` syntax

**`compound.ts`** — Detect sub-components
- Input: `X.Sub = SubComponent; X.Sub.displayName = 'X.Sub';`
- Output: `{ "Table": ["Header", "HeaderRow", "HeaderCell", "SortableHeaderCell", ...] }`
- Also traces each sub-component to its own variant/prop definitions

**`tokens.ts`** — Parse theme2021 object
- Input: `src/themes/theme-2021.ts` — single exported object
- Output: Token scales with categories, names, values
- Trivial: object is a plain literal with string values

**`icons.ts`** — List icon directory contents
- Input: `src/components/Icon/icon-set/icons/*.tsx`
- Output: `["Activity", "AlertCircle", "Archive", ...]` (160 names)
- Plus third-party: `["Apple", "Facebook", ...]` (30 names)

### 4.4 Filter Pipeline

After raw extraction, filters clean the data before writing to the database:

1. **never-document.ts** — Removes props from the "Never Document" list (style guide §2.3):
   - Universal: `css`, `children`, `ref`, `className`, `style`
   - Standard HTML: `disabled`, `placeholder`, `value`, `onChange`, `onSubmit`, `onClick`, `id`, `name`, `type`, `aria-label` (unless non-standard behavior flagged)
   - Picnic universal: `as` (unless meaningful default), `loading` (only for Button/IconButton)

2. **boolean-collapse.ts** — Converts Stitches boolean variants:
   - `{ true: { ... }, false: { ... } }` → marks prop as `(boolean)`
   - Distinguishes from enum variants with "true"/"false" string values (rare but possible)

3. **internal-only.ts** — Removes internal implementation variants:
   - `disabledVisually` (Button internal, mapped from `disabled`)
   - Any variant starting with `_` (convention for internal)
   - Stitches utility props (p, m, px, py, mx, my, pt, pr, pb, pl, mt, mr, mb, ml)

---

## 5. Stage 2: Intermediate Database

### 5.1 Schema

```json
{
  "version": "1.0",
  "extracted_at": "2026-02-18T...",
  "source_commit": "abc123",
  "components": {
    "Badge": {
      "pattern": "pure-styled",
      "file": "src/components/Badge/Badge.tsx",
      "baseElement": "em",
      "primitive": "Stitches styled",
      "variants": {
        "variant": { "values": ["active", "standard", "primary", "error", "magic"], "default": "standard" },
        "position": { "values": ["inline", "raised"], "default": "raised" }
      },
      "additionalProps": {},
      "subComponents": [],
      "radixPrimitive": null,
      "polymorphic": false,
      "notes": []
    },
    "Table": {
      "pattern": "compound",
      "file": "src/components/Table/Table.tsx",
      "baseElement": "div",
      "primitive": "CSS Grid with ARIA table roles",
      "variants": {
        "textVariant": { "values": ["body", "caption"], "default": "body" }
      },
      "additionalProps": {
        "columns": { "type": "number|number[]", "required": false },
        "columnSizes": { "type": "string|string[]", "required": false }
      },
      "subComponents": [
        {
          "name": "Header", "selfDocumenting": true,
          "variants": {}, "additionalProps": {}
        },
        {
          "name": "SortableHeaderCell", "selfDocumenting": false,
          "variants": {},
          "additionalProps": {
            "onChange": { "type": "fn", "required": true },
            "isSortActive": { "type": "boolean", "required": false },
            "ascending": { "type": "boolean", "required": false }
          }
        }
      ],
      "radixPrimitive": null,
      "polymorphic": false,
      "notes": []
    }
  },
  "tokens": {
    "colors": { "bgDefault": "#FFFFFF", "textDefault": "#1A1A1A" },
    "space": { "space0": "0", "space1": "2px", "space2": "4px" },
    "...": "..."
  },
  "darkOverrides": {
    "colors": { "bgDefault": "#1A1A1A", "textDefault": "#FFFFFF" }
  },
  "breakpoints": { "bp1": "640px", "bp2": "768px", "bp3": "1024px", "bp4": "1280px" },
  "icons": { "builtin": ["Activity", "..."], "thirdParty": ["Apple", "..."] },
  "utils": ["p", "pt", "px", "py", "m", "mt", "mx", "my", "focusVisible", "defaultTransition", "..."],
  "metadata": {
    "totalComponents": 57,
    "compoundComponents": 26,
    "totalIcons": 160,
    "totalThirdPartyIcons": 30,
    "totalTokenScales": 12
  }
}
```

### 5.2 Why an Intermediate Database

1. **Separation of concerns**: Extraction logic stays stable while output format evolves with the skill system
2. **Debugging**: Can inspect the JSON to verify extraction correctness before formatting
3. **Diffing**: Compare database versions to detect what changed between Picnic releases
4. **Multiple consumers**: Same database feeds reference files, problem skills, validator rules, and potentially other tools
5. **Partial regeneration**: Can regenerate a single skill file without re-extracting everything

---

## 6. Stage 3: Formatter

### 6.1 Purpose

Transforms the intermediate JSON database into the compact skill notation defined in the style guide (§2.2, §2.4, §2.7).

### 6.2 Script Structure

```
scripts/picnic-format/
├── index.ts                    # Reads database, generates formatted sections
├── formatters/
│   ├── compact-props.ts        # JSON → "props: variant(a*|b|c) size(x|y*)" notation
│   ├── component-entry.ts      # JSON → full component entry block
│   ├── token-table.ts          # JSON → compact token table with →dark notation
│   ├── sub-component-list.ts   # JSON → "Sub: .A .B .C" notation
│   └── icon-list.ts            # JSON → categorized icon name lists
└── templates/
    ├── reference-file.ts       # Template for reference .md files
    └── token-reference.ts      # Template for token-tables.md
```

### 6.3 Compact Props Formatter

The core formatter implements the BNF grammar from the style guide:

```
Input JSON:
{
  "variant": { "values": ["primary", "secondary", "subdued"], "default": "primary" },
  "size": { "values": ["small", "medium", "large"], "default": "medium" },
  "loading": { "type": "boolean", "required": false }
}

Output notation:
props: variant(primary*|secondary|subdued) size(small|medium*|large) loading(boolean)
```

Rules applied:
- `*` after default value
- `!` prefix for required props
- `(boolean)` for boolean-type props
- `(type)` for non-enum typed props
- Skip props on the "never document" list
- Order: variant first, size second, then alphabetical

### 6.4 Component Entry Formatter

Generates complete component entry blocks:

```
Input: Database entry for "Badge"

Output:
## Badge
Primitive: styled em
props: variant(active|standard*|primary|error|magic) position(inline|raised*)
```

For compound components with non-obvious sub-component props:

```
Input: Database entry for "Table"

Output:
## Table
Primitive: CSS Grid with ARIA table roles
Sub: .Header .HeaderRow .HeaderCell .SortableHeaderCell .Body .BodyRow .BodyFocusableRow .BodyCell .RowSelectorCell .HeaderSelectorCell .FocusWrapper
props: columns(number|number[]) columnSizes(string|string[]) textVariant(body*|caption)
SortableHeaderCell: !onChange(fn) isSortActive(boolean) ascending(boolean)
```

### 6.5 Token Table Formatter

```
Input: tokens.colors.bgActionPrimary = "#FFF382"
       darkOverrides.colors.bgActionPrimary = "#3D3200"

Output:
$bgActionPrimary #FFF382 →dark #3D3200
```

---

## 7. Stage 4: Merge

### 7.1 The Merge Problem

Skill files contain both generated content (props, sub-component lists) and human-curated content (decision guides, examples, constraints). Regeneration must update the former without destroying the latter.

### 7.2 Section Markers

Each skill file uses markers to delineate generated vs. curated sections:

```markdown
<!-- BEGIN GENERATED: component-api -->
## Table API

props: columns(number|number[]) columnSizes(string|string[]) textVariant(body*|caption)
Sub: .Header .HeaderRow .HeaderCell ...
SortableHeaderCell: !onChange(fn) isSortActive(boolean) ascending(boolean)
<!-- END GENERATED: component-api -->

## Decision Guide  ← human-curated, untouched by pipeline

| Need | Component |
|------|-----------|
| Structured rows/columns | Table |
| Card grid | Grid + Card |

<!-- BEGIN GENERATED: sub-component-props -->
## Non-Obvious Sub-Components
| Sub-Component | Non-obvious |
|---------------|-------------|
| .HeaderRow / .BodyRow | `display: contents` — row is not a box |
...
<!-- END GENERATED: sub-component-props -->

## Constraints  ← human-curated, untouched by pipeline
```

### 7.3 Merge Algorithm

```
1. Read existing skill file
2. Parse into sections (generated blocks + curated blocks)
3. For each GENERATED block:
   a. Look up the block ID in the formatter output
   b. Replace content between markers with new generated content
   c. If block ID not in formatter output → leave unchanged (stale but safe)
4. For each CURATED block:
   a. Leave completely untouched
5. Write merged file
6. Report diff summary to human reviewer
```

### 7.4 File-Level Classification

Not all files need merge — some are fully generated, some fully curated:

| File Category | Merge Strategy | Rationale |
|--------------|---------------|-----------|
| **Reference files** (4) | Fully regenerated | Pure lookup tables, no human-curated content |
| **Token reference** | Fully regenerated | Pure token data tables |
| **Problem skills** (5) | Section-level merge | Mix of generated API data + curated guides |
| **Foundation skills** (3) | Mostly curated | Very little extractable; mostly patterns + gotchas |
| **Router** | Mostly curated | Routing table could be partially generated |
| **Validator** | Fully curated | All rules are experiential knowledge |

---

## 8. Content Ownership Map

### 8.1 Reference Files — Fully Generated

The 4 reference files (actions-ref, typography-ref, data-display-ref, media-ref) are pure lookup tables. Every line is derivable from source:

- `## ComponentName` → from component list
- `Primitive: X` → from base element + library detection
- `Sub: .A .B .C` → from CompositeComponent interface
- `props: ...` → from variant extraction + interface parsing
- `SubName: ...` → from sub-component variant/prop extraction

**Exception**: `notes:` lines are human-curated. These are stored in a separate curation file (see §8.4).

### 8.2 Problem Skills — Hybrid

Each problem skill (~100-150 lines) breaks down roughly as:

| Section | Content Type | % of File | Updatable By |
|---------|-------------|-----------|-------------|
| YAML frontmatter | Curated | ~3% | Human only |
| "Picnic Context" header | Generated (import path, component list) | ~2% | Script |
| "When to Use" / Decision Guide | Curated | ~10% | Human only |
| Component API / props | Generated | ~25% | Script |
| Non-Obvious Sub-Components | Generated props + curated notes | ~15% | Hybrid |
| Pattern sections (Sorting, Selection, etc.) | Curated | ~20% | Human only |
| Canonical Example | Curated | ~15% | Human only |
| Constraints | Curated | ~10% | Human only |

### 8.3 Foundation Skills — Mostly Curated

Foundation skills are primarily teaching documents. Very little content is mechanically extractable:

| Skill | Extractable Content | Curated Content |
|-------|-------------------|-----------------|
| design-tokens | Token scales + values (lives in reference) | Grouping, semantic naming explanations, state progressions |
| stitches-patterns | Utility function list | All patterns, examples, gotchas |
| layout-primitives | Box/Stack/Grid props | Decision guide, CRITICAL Stack gotcha, common patterns |

### 8.4 Curation Files

Human-authored content that supplements generated data lives in separate curation files:

```
scripts/picnic-extract/curation/
├── component-notes.yaml       # notes: lines for reference file components
├── deprecations.yaml          # Deprecation mappings (not in source JSDoc)
├── primitives.yaml            # Human-readable Primitive: descriptions
└── sub-component-notes.yaml   # "Non-obvious" annotations for sub-components
```

Example `component-notes.yaml`:
```yaml
Badge:
  notes: "NO `secondary` variant. Use `standard` for default, `primary` for brand emphasis."
Card:
  notes: "`interactive` enables hover lift/shadow. `active` shows selected border."
Icon:
  notes: "Discriminated union — `mode=\"presentational\"` requires `description` prop."
Accordion:
  notes: "`variant` is required (no default). Unusual."
```

These curation files are merged into the database before formatting, giving human-authored notes a structured home that survives regeneration.

---

## 9. Update Workflow

### 9.1 When Picnic Changes

```
Developer updates Picnic source code
         │
         ▼
┌─────────────────────────┐
│ 1. Run extraction        │  npm run picnic:extract
│    (automatic)           │  Produces new picnic-database.json
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 2. Diff database         │  npm run picnic:diff
│    (automatic)           │  Shows: "Badge: added variant 'magic'"
│                          │         "NewComponent: new component detected"
│                          │         "Token $bgNew: added"
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 3. Format + merge        │  npm run picnic:update
│    (automatic)           │  Regenerates reference files
│                          │  Updates generated sections in skills
│                          │  Preserves curated content
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 4. Human review          │  git diff
│    (manual)              │  Review generated changes
│                          │  Update curated sections if needed
│                          │  Add notes for new components
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ 5. Commit                │  git commit
│    (manual)              │
└─────────────────────────┘
```

### 9.2 Diff Report

The diff tool compares two database versions and produces a human-readable report:

```
=== Picnic Component Changes (v1.2 → v1.3) ===

NEW COMPONENTS:
  + NewComponent (Pattern A: pure styled)
    variants: variant(a|b|c*) size(small|medium*)

MODIFIED COMPONENTS:
  ~ Badge: added variant value "magic"
  ~ Button: removed variant value "basic" (was deprecated)
  ~ Table: added sub-component FocusWrapper

REMOVED COMPONENTS:
  - OldComponent (was in v1.2, not in v1.3)

TOKEN CHANGES:
  + $bgMagic: #E8D0FF (new)
  ~ $bgDefault: #FFFFFF → #FAFAFA (changed)

ACTIONS NEEDED:
  - Add curated notes for NewComponent in component-notes.yaml
  - Update data-table skill: new FocusWrapper sub needs "non-obvious" annotation?
  - Review Badge skill: new "magic" variant — does decision guide need updating?
```

### 9.3 New Component Handling

When extraction finds a component not in the current skills:

1. **Inventory check**: Is it in the router's routing table?
2. **If no**: Flag for human decision — which skill should own it?
3. **If yes**: Generate the reference entry with extracted data
4. **Always**: Prompt human to add `notes:` in curation file if warranted

### 9.4 CI Integration (Optional)

A CI check can run extraction on every Picnic PR and compare against the current database:

```yaml
# .github/workflows/picnic-skill-check.yml
- name: Check for skill-impacting changes
  run: |
    npm run picnic:extract -- --output /tmp/new-db.json
    npm run picnic:diff -- --old skills/picnic-database.json --new /tmp/new-db.json
    # Fails if diff is non-empty, reminding to update skills
```

---

## 10. Trade-offs Analysis

### 10.1 Approach Options

| Approach | Description | Build Cost | Maintenance Savings | Risk |
|----------|------------|-----------|-------------------|------|
| **A. Full automation** | Scripts generate complete skill files | High | High | Generated content may be wrong; loses human nuance |
| **B. Hybrid pipeline** (recommended) | Scripts generate structural data; humans maintain experiential content | Medium | Medium-High | Must maintain section markers; merge complexity |
| **C. Update assistant** | AI reads source diffs and suggests skill changes | Low | Low-Medium | Depends on AI accuracy; no structural guarantee |
| **D. Manual maintenance** | Humans read source and update skills by hand | Zero | Zero | Skills drift from source; no detection mechanism |

### 10.2 Why Hybrid (B)

- **Reference files** are 87% reducible to compact notation from source data — full generation makes sense here
- **Problem skills** are ~25% generated, ~75% curated — section-level merge preserves the valuable curated content
- **Foundation skills** are ~5% generated, ~95% curated — minimal automation, maximum human control
- The diff report catches source changes that need human attention, even when no auto-generation is needed
- Section markers add minimal overhead (~4 lines per file) but guarantee regeneration safety

### 10.3 Build Cost Assessment

| Component | Effort | Value |
|-----------|--------|-------|
| Extraction scripts (~300 LOC) | Medium | High — reusable across all updates |
| Intermediate database schema | Low | High — enables diffing and debugging |
| Formatter (~200 LOC) | Medium | High — enforces style guide consistently |
| Merge logic (~150 LOC) | Medium | Medium — only needed for problem skills |
| Curation file structure | Low | High — protects human knowledge |
| Diff reporter (~100 LOC) | Low | High — catches changes early |
| **Total: ~750 LOC** | | |

### 10.4 Risk Mitigations

| Risk | Mitigation |
|------|-----------|
| Extracted props are wrong | Database diffing catches unexpected changes; human review step |
| Merge destroys curated content | Section markers with explicit IDs; merge is additive only |
| New component pattern breaks extractor | Pattern taxonomy is stable (4 patterns); extractor logs warnings for unknown patterns |
| Style guide changes | Formatter is separate from extractor; only formatter needs updates |
| Stale curated content | Diff report flags components that changed, prompting human review |
| Over-automation | Foundation skills and validator are explicitly excluded from auto-generation |

---

## 11. Implementation Plan

### Phase 1: Extraction Foundation
- Build `@babel/parser` extraction scripts for variants, sub-components, tokens
- Define intermediate JSON database schema
- Create initial curation files from current skill content
- Validate extracted data against current hand-written skills

### Phase 2: Formatting
- Build compact notation formatter implementing style guide BNF
- Build reference file generator (4 files, fully generated)
- Build token table formatter
- Compare generated output to current hand-written references

### Phase 3: Merge System
- Design section marker format for problem skills
- Add markers to existing problem skill files
- Build merge algorithm
- Build diff reporter

### Phase 4: Workflow Integration
- Create npm scripts (`picnic:extract`, `picnic:diff`, `picnic:update`)
- Document update workflow for maintainers
- Optional: CI integration for change detection

---

## 12. Summary

The pipeline separates **extraction** (what the code says) from **curation** (what experience teaches):

| Layer | Automation | Output |
|-------|-----------|--------|
| Extract | Full | picnic-database.json |
| Format | Full | Compact notation strings |
| Merge | Semi | Updated skill files with preserved curated content |
| Review | Manual | Approved changes committed |

**Key numbers**:
- ~750 LOC total pipeline code
- 4 reference files fully auto-generated (~88 lines, ~4KB)
- 5 problem skills hybrid-merged (~25% generated, ~75% curated)
- 3 foundation skills minimally touched (~5% generated)
- 1 validator fully curated (untouched by pipeline)
- Diff report catches 100% of source-level changes

The most important design decision is the **intermediate JSON database**. It cleanly separates extraction from formatting, enables diffing between versions, and allows the skill system to evolve its format independently of the source code structure.
