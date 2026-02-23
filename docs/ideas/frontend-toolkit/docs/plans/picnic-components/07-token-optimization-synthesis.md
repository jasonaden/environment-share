# Proposal 07: Token Optimization Synthesis

> **Author**: Synthesizer Agent (Task #5)
> **Date**: 2026-02-18
> **Status**: Final
> **Sources**: Tasks 1-4 (foundations, problem skills, references, Claude knowledge analysis) + Proposal 06 consensus architecture

---

## 1. Picnic Skill Style Guide

This style guide defines the compact format for all Picnic skills and references. Every skill and reference file MUST follow these rules.

### 1.1 Principles

1. **Names are documentation** — if the component/token/prop name describes itself, don't add prose
2. **Claude knows the underlying libraries** — never explain Stitches, Radix, Formik, Yup, CSS, React
3. **One canonical home per concept** — never duplicate content across skill and reference
4. **Skills teach; references look up** — skills contain rules, patterns, decision guides, anti-patterns. References contain lookup tables (props, tokens, variant values)
5. **Compact > verbose** — inline notation over tables, tables over prose, prose only for non-obvious behavior

### 1.2 Component Entry Format (for references)

```
## ComponentName
Primitive: X
Sub: .A .B .C
props: propName(value1|value2*|value3) anotherProp(type)
SubName: propName(!type) anotherProp(value1|value2)
notes: Only non-obvious behavior or gotchas
deprecated: oldValue → newValue
```

Rules:
- `*` after value = default
- `!` before prop = required
- `(type)` = type annotation (boolean, number, string, fn, ReactNode, IconName)
- `(value1|value2*)` = enum with default marked
- Sub-components listed with `.` prefix, flat list
- Sub-component props only for non-obvious ones — wrapper subs that just take `children` get zero docs
- One blank line between entries

### 1.3 "Never Document" Props

These appear on all/most components and are universally understood. Omit from all entries unless they have non-standard behavior in a specific component:

**Universal** (omit always): `css: PicnicCss`, `children`, `ref`, `className` (forbidden), `style` (forbidden)

**Standard HTML** (omit unless non-standard): `disabled`, `placeholder`, `value`, `onChange`, `onSubmit`, `onClick`, `id`, `name`, `type`, `aria-label`

**Picnic universal** (omit unless non-obvious default): `as` (polymorphic), `loading` (only document for Button/IconButton)

Instead, add a single header note to each reference file:
```
> All components: `import { X } from '@attentive/picnic'`. All accept `css: PicnicCss`.
```

### 1.4 Token Table Format (for design-tokens reference)

```
### $prefix — Category
$tokenName #hex →dark #darkHex
$tokenName2 #hex
```

Rules:
- Token name + hex on one line
- `→dark` suffix only for tokens that change in dark theme
- No "Purpose" column — the name IS the purpose (exception: add brief parenthetical for genuinely ambiguous tokens)
- Group by prefix

State progressions use inline arrow notation:
```
Primary action: $bgActionPrimary #FFF382 → Hover #FFE600 → Pressed #F9D100 → Disabled rgba(...)
```

### 1.5 Skill File Format (for SKILL.md files)

```markdown
---
name: skill-name
description: >
  When to invoke (specific trigger phrases, components covered)
---

# Skill Title

## Picnic Context (2-3 lines)
Import path, components covered, which library wrapper if relevant.

## [Domain-Specific Sections] (bulk of skill)
Component APIs, compound hierarchies, decision guides, prop tables.
ONLY Picnic-specific content. Never explain the underlying library.

## Constraints & Anti-Patterns (compact)
BAD → GOOD, one line each. Only real pitfalls.

## Common Mistakes Checklist
Per-skill validation items (3-5 rules).
```

### 1.6 Global Compression Rules

These rules apply across ALL skills and eliminate the largest cross-cutting waste categories:

| Rule | Description | Savings |
|------|-------------|---------|
| **G1** | `css: PicnicCss` stated once per file header, never per-component | ~80 lines |
| **G2** | Never document `disabled: boolean` | ~40 lines |
| **G3** | No "Related Components" sections (handled by router and skill structure) | ~60 lines |
| **G4** | Radix controlled pattern (`open`, `defaultOpen`, `onOpenChange`) stated ONCE: "All overlay components follow the Radix controlled pattern" | ~36 lines |
| **G5** | All `Form.*` sub-components auto-connect to Formik via `name` prop — stated ONCE, not per-component | ~30 lines |
| **G6** | Never explain Stitches `styled()`, `css` prop, variants, responsive `@bp` — Claude knows these | ~100+ lines |
| **G7** | Never explain Radix primitives (Dialog, Tooltip, Accordion, etc.) — Claude knows their APIs | ~100+ lines |
| **G8** | Never explain Formik/Yup concepts — Claude knows initialValues, onSubmit, validationSchema, etc. | ~80 lines |
| **G9** | One canonical example per skill, not multiple isolated examples | ~200 lines |

### 1.7 Variant Documentation

Document variants as inline enums in the props line:
```
props: variant(primary*|secondary|subdued|inverted) size(small|medium*|large)
```

NEVER include variant styling tables showing internal token mappings (e.g., "primary maps to $bgActionPrimary"). Claude doesn't need implementation details — it just sets `variant="primary"`.

### 1.8 Sub-Component Listings

Flat `.`-prefix list on a single `Sub:` line. Only document sub-component props when non-obvious:
```
Sub: .Header .HeaderRow .HeaderCell .SortableHeaderCell .Body .BodyRow .BodyCell
SortableHeaderCell: !onChange isSortActive(boolean) ascending(boolean)
```

Self-documenting subs like `.Header`, `.Body`, `.Content`, `.Trigger` need zero additional documentation.

### 1.9 Cross-References

Brief inline pointers, not duplicated content:
```
Paginator: see navigation skill for full API. Integration pattern: Paginator below Table.
```

### 1.10 Examples

- **References**: Zero examples. References are pure lookup tables.
- **Skills**: One canonical example per skill combining all key patterns. No trivial single-component examples.

---

## 2. Token Budget Targets

### 2.1 Foundation Layer

| File | Current (P03 Target) | Optimized Target | Reduction | Technique |
|------|---------------------|-----------------|-----------|-----------|
| design-tokens SKILL.md | ~2.8KB / 100 lines | ~2.2KB / 80 lines | 21% | Remove generic token system explanations |
| token-tables.md (ref) | ~15KB / ~430 lines | ~6.5KB / ~170 lines | 57% | Compact inline format, drop name-restating descriptions, drop duplicated content |
| stitches-patterns SKILL.md | ~3KB / 110 lines | ~1.8KB / 65 lines | 40% | Remove all generic Stitches explanations (G6) |
| utils-reference.md (ref) | ~10KB / ~285 lines | ~3KB / ~100 lines | 70% | One example per pattern, remove implementation source code |
| layout-primitives SKILL.md | ~2KB / 70 lines | ~1.5KB / 55 lines | 21% | Remove generic Box/Stack/Grid concepts |
| **Foundation Total** | **~32.8KB / ~995 lines** | **~15KB / ~470 lines** | **54%** | |

### 2.2 Problem Skills

| File | P04 Estimate | Optimized Target | Reduction | Key Technique |
|------|-------------|-----------------|-----------|---------------|
| data-table SKILL.md | ~360 lines | ~115 lines | 68% | 5 examples → 1 canonical (G9), drop self-evident sub descriptions |
| form-builder SKILL.md | ~395 lines | ~147 lines | 63% | G5+G8 (Formik known), kill trivial standalone examples |
| dialog-drawer SKILL.md | ~350 lines | ~108 lines | 69% | G4+G7 (Radix known), kill 20 self-evident sub descriptions |
| navigation SKILL.md | ~220 lines | ~70 lines | 68% | Radix Tabs known (G7), merge examples into sections |
| feedback-notifications SKILL.md | ~240 lines | ~78 lines | 68% | Loading*=8 lines total, Accordion/Banner keep only non-obvious |
| **Problem Total** | **~1,565 lines** | **~518 lines** | **67%** | |

### 2.3 Reference Files

| File | P01/P04 Estimate | Optimized Target | Reduction | Key Technique |
|------|-----------------|-----------------|-----------|---------------|
| actions-ref.md | ~265 lines / ~9KB | ~27 lines / ~1.2KB | 87% | Compact entry format, no examples, no variant style tables |
| typography-ref.md | ~160 lines / ~5.5KB | ~17 lines / ~0.8KB | 85% | Compact entry format |
| data-display-ref.md | ~204 lines / ~7KB | ~19 lines / ~0.9KB | 87% | Compact entry format |
| media-ref.md | ~250 lines / ~8.5KB | ~25 lines / ~1.1KB | 87% | Compact entry format |
| **Reference Total** | **~879 lines / ~30KB** | **~88 lines / ~4KB** | **87%** | |

### 2.4 Other

| File | Estimate | Optimized Target | Reduction |
|------|----------|-----------------|-----------|
| Router SKILL.md | ~4KB / ~120 lines | ~3KB / ~90 lines | 25% |
| Validator SKILL.md | ~300 lines | ~270 lines | 10% (90% is pure Picnic data, lowest waste) |

### 2.5 Architecture Total

| Layer | Consensus (P06) Target | Optimized Target | Reduction |
|-------|----------------------|-----------------|-----------|
| Router | ~4KB | ~3KB | 25% |
| Foundation (3 skills + 2 refs) | ~32.8KB | ~15KB | 54% |
| Problem skills (5) | ~34KB (est) | ~11.3KB | 67% |
| Reference files (4) | ~30KB | ~4KB | 87% |
| Validator | ~6.5KB | ~5.9KB | 10% |
| **Total Architecture** | **~107KB** | **~39KB** | **64%** |

Compare to the current monolithic system: ~264KB (SKILL.md + 3 references). The optimized decomposed architecture = **~39KB**, an **85% reduction** from current state.

---

## 3. Full Compressed Example: layout-primitives

This is the complete rewritten `layout-primitives` SKILL.md in the compressed format. It serves as the template for all other skills.

```markdown
---
name: layout-primitives
description: >
  Picnic layout components: Box, Stack, Grid, PageLayout, FooterLayout, Separator.
  Use when arranging page structure, choosing between flex/grid layouts, adding
  spacing, building page headers, or adding dividers.
---

# Picnic Layout Primitives

6 components for page structure and content arrangement. `import { Box, Stack, Grid, PageLayout, FooterLayout, Separator } from '@attentive/picnic'`

## Decision Guide

Prefer highest abstraction: **Stack > Grid > Box**
- Stack: consistent spacing between children (vertical or horizontal)
- Grid: equal/responsive columns
- Box: custom flex/grid when Stack/Grid don't fit
- PageLayout: page-level header structure
- FooterLayout: fixed page footer
- Separator: visual divider

## Box

Polymorphic base primitive. `<Box as="section">`, `<Box as="nav">`, `<Box as="ul">`

Use for custom layouts when Stack/Grid don't fit:
```tsx
<Box css={{ display: 'flex', gap: '$space4', alignItems: 'center' }}>
```

## Stack

Vertical/horizontal children with consistent spacing.

props: direction(vertical*|horizontal) spacing(token, default $space4) as(element)

**CRITICAL**: Stack uses margin `(> * + *)`, NOT CSS gap. `gap` in css prop is **silently stripped**. Always use the `spacing` prop.

```tsx
<Stack spacing="$space4">          {/* vertical, marginTop between */}
<Stack direction="horizontal" spacing="$space2">  {/* row, marginLeft */}
<Stack as="nav" spacing="$space6">  {/* semantic element */}
```

## Grid

CSS Grid with equal or responsive columns.

props: columns(number|ResponsiveValue) gap(token)
Sub: .Cell
Cell: colSpan(number|ResponsiveValue)

Responsive arrays map to [base, @bp1, @bp2, @bp3]:
```tsx
<Grid columns={3} gap="$space4">          {/* static 3-col */}
<Grid columns={[1, 2, 3, 4]}>             {/* responsive */}
  <Grid.Cell colSpan={2}>wide</Grid.Cell>  {/* spanning */}
</Grid>
```

## PageLayout

Page-level structure with responsive header.

Sub: .Header .Header.Heading .Header.Description .Header.Button .Header.TextContainer .Header.ButtonContainer
Header: variant(responsive*|inline|stacked)

```tsx
<PageLayout.Header variant="responsive">
  <PageLayout.Header.TextContainer>
    <PageLayout.Header.Heading>Title</PageLayout.Header.Heading>
    <PageLayout.Header.Description>Desc</PageLayout.Header.Description>
  </PageLayout.Header.TextContainer>
  <PageLayout.Header.ButtonContainer>
    <PageLayout.Header.Button variant="primary">Action</PageLayout.Header.Button>
  </PageLayout.Header.ButtonContainer>
</PageLayout.Header>
```

## FooterLayout

Fixed footer for page-level actions (Save/Cancel). Style entirely via `css` prop.

## Separator

Radix-based visual divider.

props: orientation(horizontal*|vertical) decorative(true*|false) size(small*|large)

Set `decorative={false}` for semantically meaningful dividers.

## Common Patterns

- **Page**: PageLayout.Header + Stack of sections + FooterLayout
- **Card grid**: `<Grid columns={[1, 2, 3]}>`
- **Form layout**: `<Stack spacing="$space4">` wrapping FormFields
- **Sidebar + main**: Box display:flex, sidebar fixed-width, main flex:1
- **Centered**: `<Box css={{ mx: 'auto', maxWidth: '$bp3', px: '$space6' }}>`

## Constraints

- Stack `gap` is silently stripped — always use `spacing` prop
- Stack uses margins, not CSS gap (Safari compat)
- Grid responsive arrays: [base, @bp1, @bp2, @bp3]
- PageLayout: always use compound sub-component API
- Separator `decorative={true}` by default
```

**Size: ~60 lines / ~1.5KB** (down from P03's ~70 lines / ~2KB target — 21% reduction)

This example demonstrates:
- No generic explanations of what Box/Stack/Grid are
- `CRITICAL` callout for the non-obvious Stack gap pitfall
- Compact props notation (`direction(vertical*|horizontal)`)
- One example per component showing the non-obvious patterns
- Sub-component listing with `.` notation
- Common patterns as one-liners
- No import statements per component (single import at top)
- No `css: PicnicCss` documentation
- No `disabled`, `children`, `ref` documentation

---

## 4. Total Token Estimates

### 4.1 Per-Invocation Context Load

| Scenario | Skills Loaded | Optimized Size | Current Monolith |
|----------|--------------|----------------|-----------------|
| **Simple component lookup** | Router + 1 reference | ~3KB + ~1KB = **~4KB** | ~18KB SKILL + ~107KB catalog = **~125KB** |
| **Foundation question** | Router + 1 foundation skill + 1 ref | ~3KB + ~2KB + ~5KB = **~10KB** | ~18KB + ~87KB tokens = **~105KB** |
| **Typical composition** | Router + 1 problem skill + 2 foundations | ~3KB + ~2.2KB + ~4KB = **~9.2KB** | ~18KB + ~87KB + ~52KB = **~157KB** |
| **Complex composition** | Router + 2 problem skills + 3 foundations + 1 ref | ~3KB + ~4.4KB + ~5.5KB + ~1KB = **~14KB** | All 4 files = **~264KB** |
| **Hard ceiling** | All skills + all references | **~39KB** | **~264KB** |

### 4.2 Token Counts (approximate, 1 token ≈ 4 chars)

| Scenario | Original Tokens | Optimized Tokens | Tokens Saved | Reduction |
|----------|----------------|-----------------|-------------|-----------|
| Simple lookup | ~31,250 | ~1,000 | ~30,250 | **97%** |
| Foundation question | ~26,250 | ~2,500 | ~23,750 | **90%** |
| Typical composition | ~39,250 | ~2,300 | ~36,950 | **94%** |
| Complex composition | ~66,000 | ~3,500 | ~62,500 | **95%** |
| Hard ceiling (all loaded) | ~66,000 | ~9,750 | ~56,250 | **85%** |

### 4.3 Savings Breakdown by Technique

| Technique | Est. Token Savings | % of Total Savings |
|-----------|-------------------|-------------------|
| Architectural decomposition (load only needed skills) | ~40,000+ per invocation | 63% |
| Remove "Claude knows this" content | ~8,000 | 13% |
| Compact reference format (drop prose, examples, variant tables) | ~7,500 | 12% |
| Eliminate cross-file duplication | ~4,500 | 7% |
| Global compression rules (G1-G9) | ~3,000 | 5% |
| **Total (worst-case, all loaded)** | **~56,250** | **85%** |

The single biggest optimization is **architectural** — only loading relevant sub-skills instead of the entire monolith. The content-level optimizations (this proposal) provide an additional ~24,000 token reduction on top of the architectural gains.

### 4.4 Comparison to Target

| Metric | Target | Achieved | Status |
|--------|--------|----------|--------|
| Token reduction (per-invocation) | 50%+ | 85-97% | **Exceeds** |
| Token reduction (all content) | 50%+ | 85% | **Exceeds** |
| Foundation layer total | P03: ~32.8KB | ~15KB | **54% reduction** |
| Problem skills total | P04: ~34KB | ~11.3KB | **67% reduction** |
| Reference files total | P01: ~30KB | ~4KB | **87% reduction** |

---

## 5. Implementation Guidance

### 5.1 Priority Order

1. **Reference files first** — highest ROI (87% reduction), simplest to implement (format conversion)
2. **Problem skills second** — 67% reduction, requires applying G4-G9 rules
3. **Foundation references third** — significant deduplication work (removing cross-file content)
4. **Foundation skills last** — already lean, minor trimming only

### 5.2 Checklist for Writing Each File

For **reference files**:
- [ ] Single header: `> All components: import { X } from '@attentive/picnic'. All accept css: PicnicCss.`
- [ ] Each component uses compact entry format (## Name, Primitive, Sub, props, notes)
- [ ] No import statements per component
- [ ] No usage examples
- [ ] No variant style tables
- [ ] No "Related Components" sections
- [ ] No `css`, `children`, `ref`, `disabled`, `placeholder` in props
- [ ] `*` marks defaults, `!` marks required

For **skill files**:
- [ ] No explanations of underlying libraries (Stitches, Radix, Formik, CSS)
- [ ] G1-G9 rules applied
- [ ] One canonical example combining all key patterns
- [ ] Compact props notation inline
- [ ] Only non-obvious behavior documented
- [ ] Sub-component descriptions only when name doesn't self-document
- [ ] Common Mistakes Checklist at end (3-5 rules)

For **token reference** (token-tables.md):
- [ ] Compact inline format: `$token #hex →dark #darkHex`
- [ ] No "Purpose" column (except brief parenthetical for ambiguous tokens)
- [ ] No "Light Theme Value" column showing raw palette references
- [ ] State progressions as inline arrows
- [ ] Semantic color sets as compact table
- [ ] Raw palette as inline one-line-per-family format
- [ ] Zero code examples, zero anti-patterns (those live in skill)
- [ ] Zero Stitches documentation (canonical home: stitches-patterns)

### 5.3 Quality Gate

Before shipping any file, verify:
1. Every line contains Picnic-specific knowledge Claude cannot infer
2. No concept is documented in more than one file
3. File stays within its optimized target size ±10%
4. Compact notation is used consistently

---

## Appendix A: Format Grammar

```
entry       := header primitive? sub? props* notes? deprecated?
header      := "## " ComponentName
primitive   := "Primitive: " description
sub         := "Sub: " ("." SubName)+
props       := (context ": ")? propDef (" " propDef)*
propDef     := "!"? propName "(" values ")" | "!"? propName "(" type ")"
values      := value ("|" value)*
value       := literal "*"?          (* marks default *)
context     := "props" | SubName      (* "props" = root component *)
notes       := "notes: " text
deprecated  := "deprecated: " old " → " new
```

## Appendix B: Claude Knowledge Baseline (Do Not Teach)

| Domain | Confidence | Implication |
|--------|-----------|-------------|
| React (hooks, context, compounds, portals, Children) | Very High | Never explain compound component pattern |
| TypeScript (generics, discriminated unions) | Very High | Never explain VariantProps type extraction |
| Stitches (styled, css, variants, $tokens, @bp) | High | Never explain how styled() or css prop work |
| Radix UI (Dialog, Tooltip, Accordion, Popover, DropdownMenu, Tabs, Checkbox, RadioGroup, Switch) | High | Never explain controlled/uncontrolled, asChild, focus trapping, keyboard nav |
| Formik (Form, useFormik, initialValues, onSubmit, validation) | High | Never explain Formik concepts |
| Yup (object, string, required, email, conditional) | High | Never explain Yup schema syntax |
| CSS (flexbox, grid, media queries, pseudo-classes, box-shadow) | Very High | Never explain CSS layout concepts |
| Accessibility (ARIA, keyboard nav, screen readers) | Very High | Never explain what ARIA roles do |
| Design Systems (tokens, semantic colors, spacing scales) | High | Never explain why tokens exist |

## Appendix C: Optimized Architecture Directory Tree

```
skills/
└── picnic-components/
    ├── SKILL.md                          # Router ~3KB
    │
    ├── foundation/
    │   ├── design-tokens/
    │   │   ├── SKILL.md                  # ~2.2KB
    │   │   └── references/
    │   │       └── token-tables.md       # ~6.5KB
    │   │
    │   ├── stitches-patterns/
    │   │   ├── SKILL.md                  # ~1.8KB
    │   │   └── references/
    │   │       └── utils-reference.md    # ~3KB
    │   │
    │   └── layout-primitives/
    │       └── SKILL.md                  # ~1.5KB (see Section 3)
    │
    ├── problem/
    │   ├── data-table/
    │   │   └── SKILL.md                  # ~2.5KB (~115 lines)
    │   ├── form-builder/
    │   │   └── SKILL.md                  # ~3.2KB (~147 lines)
    │   ├── dialog-drawer/
    │   │   └── SKILL.md                  # ~2.3KB (~108 lines)
    │   ├── navigation/
    │   │   └── SKILL.md                  # ~1.5KB (~70 lines)
    │   └── feedback-notifications/
    │       └── SKILL.md                  # ~1.7KB (~78 lines)
    │
    ├── references/
    │   ├── actions-ref.md                # ~1.2KB (~27 lines)
    │   ├── typography-ref.md             # ~0.8KB (~17 lines)
    │   ├── data-display-ref.md           # ~0.9KB (~19 lines)
    │   └── media-ref.md                  # ~1.1KB (~25 lines)
    │
    └── validator/
        └── SKILL.md                      # ~5.9KB (~270 lines)
```

**Total: ~39KB across 14 files** (vs ~264KB in 4 monolithic files = **85% reduction**)
