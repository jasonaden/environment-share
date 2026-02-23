# Proposal 07: Token Optimization — Foundation Skills Audit

## Executive Summary

The three foundation skills (design-tokens, stitches-patterns, layout-primitives) and their reference files contain massive token waste from three sources: **name-restating prose**, **cross-file duplication**, and **teaching Claude things it already knows**. This audit identifies specific compression techniques with before/after examples targeting 60%+ reduction.

| File | Current Size | Proposed Size | Reduction |
|------|-------------|--------------|-----------|
| design-tokens.md (reference) | ~102KB / 2507 lines | ~30KB / ~750 lines | **71%** |
| stitches-patterns.md (reference) | ~52KB / 2221 lines | ~12KB / ~500 lines | **77%** |
| design-tokens skill | ~2.8KB / 100 lines | ~2.2KB / 80 lines | 21% |
| stitches-patterns skill | ~3KB / 110 lines | ~2.5KB / 90 lines | 17% |
| layout-primitives skill | ~2KB / 70 lines | ~1.7KB / 60 lines | 15% |
| **Total** | **~162KB** | **~48KB** | **~70%** |

The skill files (Proposal 03) are already reasonably compressed. The massive wins are in the two reference files, which account for 154KB of the 162KB total.

---

## Audit Methodology

For every section in each file, four questions were applied:

1. **Is the prose restating the name?** If `$bgActionPrimaryHover` already says "background, action, primary, hover" — does the prose add new information?
2. **Can this be a compact table or inline list?** Paragraphs and JSX examples for simple mappings waste tokens.
3. **Does Claude already know this?** React, CSS, CSS-in-JS, TypeScript, media queries, CSS Grid — all in Claude's training data. Only Picnic-specific conventions need teaching.
4. **Is this duplicated across files?** Content that appears in both a skill file and its reference, or across design-tokens and stitches-patterns, is pure waste.

---

## Part 1: design-tokens.md Reference (102KB → ~30KB)

### Section-by-Section Analysis

#### Section 1: "Stitches Token System" (~194 lines, ~8KB) → **DELETE ENTIRELY**

This section explains how Stitches works, createStitches config, usePicnicStyles hook, theme application, TypeScript types, and exported utilities. Every line of it belongs in the stitches-patterns skill/reference, not in a design token lookup file.

**What was removed:** Stitches API docs, theme config code, usePicnicStyles examples, TypeScript type tables, exports table.

**Why it's safe:** All this content is (a) already in stitches-patterns.md, and (b) standard Stitches knowledge Claude already has. The design-tokens reference should be a pure lookup table — "what token do I use?" — not "how does the styling engine work?"

**Savings: ~8KB**

#### Section 2: "Color Tokens" (~750 lines, ~30KB) → ~15KB

**Problem 1: Name-restating descriptions on raw palette tokens**

The raw palette section has 67 tokens, each with a Description column that restates the name:

> BEFORE (~130 lines):
> ```
> | Token              | Value                    | Description                    |
> |--------------------|--------------------------|--------------------------------|
> | `$grayscale0`      | `#FFFFFF`                | Pure white                     |
> | `$grayscale030`    | `#FAFAFA`                | Near-white, subtle off-white   |
> | `$grayscale100`    | `#EFF0F0`                | Light gray                     |
> | `$grayscale200`    | `#E2E3E3`                | Soft gray                      |
> | `$grayscale200_40` | `rgba(226,227,227,0.4)`  | Soft gray at 40% opacity       |
> | `$grayscale300`    | `#C6C7C8`                | Medium-light gray              |
> ...
> ```

"Pure white" for `#FFFFFF`? "Light gray" for a token named `grayscale100`? These descriptions add zero information.

> AFTER (compact inline format):
> ```
> ### Raw Palette (theme creation only — never use in components)
>
> **Grayscale:** $grayscale0 #FFF · 030 #FAFAFA · 100 #EFF0F0 · 200 #E2E3E3 · 200_40 rgba(226,227,227,.4) · 300 #C6C7C8 · 400 #B6B7B8 · 600 #8D8F91 · 700 #656567 · 800 #545759 · 800_40 rgba(84,87,89,.4) · 900 #1B1F23 · 900_08/12/16/24/40 (opacity variants) · 1000 #000 · 1000_50 rgba(0,0,0,.5)
> **Yellow:** 100 #FFFDE5 · 200 #FFF8B3 · 300 #FFF382 · 300_40 rgba(255,243,130,.4) · 500 #FADF65 · 600 #FFE600 · 700 #F9D100
> **Green:** 100 #D8EFE4 · 200 #9FD6BC · 700 #3AA372 · 800 #30855D · 900 #1F573D
> **Red:** 100 #FFD7DE · 200 #FF9CAC · 300 #FA7F8F · 700 #ED3553 · 800 #B3283E
> ...
> ```

**Savings from raw palette alone: ~4KB → ~1KB**

**Problem 2: Purpose column restates functional token names**

> BEFORE (functional $bg* tokens, ~200 lines across sub-tables):
> ```
> | Token                      | Purpose                          | Light Theme Value | Resolved Hex  |
> |---------------------------|----------------------------------|-------------------|---------------|
> | `$bgDefault`              | Primary surface / page background | `$grayscale0`    | `#FFFFFF`     |
> | `$bgAccentSubtle`         | Subtle surface differentiation   | `$grayscale030`  | `#FAFAFA`     |
> | `$bgAccent`               | Accented surface, cards, sections| `$grayscale100`  | `#EFF0F0`     |
> | `$bgActionPrimary`        | Primary button/action default    | `$yellow300`     | `#FFF382`     |
> | `$bgActionPrimaryHover`   | Primary button/action hover      | `$yellow600`     | `#FFE600`     |
> | `$bgActionPrimaryPressed` | Primary button/action pressed    | `$yellow700`     | `#F9D100`     |
> | `$bgActionPrimaryDisabled`| Primary button/action disabled   | `$yellow300_40`  | rgba(...)     |
> ```

The "Purpose" column for `$bgActionPrimaryHover` says "Primary button/action hover" — the token name already says `bg` + `Action` + `Primary` + `Hover`. The Purpose column is 100% redundant for these.

For a minority of tokens, the name IS slightly ambiguous (e.g., `$bgAccent` could be anything — the Purpose "cards, sections" adds information). Solution: keep brief parenthetical hints only for non-obvious tokens.

> AFTER (compact functional token tables):
> ```
> ### Functional Background Tokens ($bg*)
>
> #### Surfaces
> | Token | Light Hex | Notes |
> |-------|-----------|-------|
> | $bgDefault | #FFF | page bg |
> | $bgAccentSubtle | #FAFAFA | |
> | $bgAccent | #EFF0F0 | cards, sections |
> | $bgAccentDark | #E2E3E3 | |
> | $bgPlaceholder | #E2E3E3 | skeleton states |
> | $bgOverlay | rgba(0,0,0,.5) | modal backdrop |
> | $bgTooltip | #000 | |
> | $bgBrand | #FFF382 | |
> | $bgInverted | #1B1F23 | |
> | $bgHighlighted | #CEE5FD | search highlight |
>
> #### Primary Action: $bgActionPrimary → Hover #FFE600 → Pressed #F9D100 → Disabled rgba(255,243,130,.4)
> #### Secondary Action: $bgActionSecondary #E2E3E3 → Hover #C6C7C8 → Pressed #8D8F91 → Disabled rgba(226,227,227,.4)
> #### Basic Action: $bgActionBasic #FFF → Hover #EFF0F0 → Pressed #E2E3E3
> #### Row: $bgRow #FFF → Hover #EFF0F0 → Pressed #E2E3E3 → Selected #E2E3E3 → SelectedHover/Pressed
> #### Toggle: $bgToggle #FFF → Hover #E2E3E3 → Pressed #C6C7C8 → Selected #1B1F23
> ```

State progressions are perfect for inline notation — the token names encode the pattern. No need for full `styled()` component examples.

**Savings from functional color tables: ~12KB → ~4KB**

**Problem 3: Duplicate anti-patterns, decision guides, usage guidelines**

The reference file contains:
- Color Anti-Patterns (~30 lines, ~1.2KB) — already in skill file's Anti-Patterns section
- Color Token Usage Guidelines (~20 lines + 25-line example) — already in skill file's Golden Rule section
- Color Token Decision Guide (~80 lines) — mostly name-restating ("I need a background for page → $bgDefault")
- Interactive State Progressions (~140 lines of full styled() code) — replaced by inline progressions above

The decision guide does have some value for non-obvious choices, but most entries are redundant with the name. Keep a reduced version with only non-obvious mappings.

> BEFORE (Decision Guide, 80 lines):
> ```
> #### "I need a background color for..."
> | Use Case | Token |
> |----------|-------|
> | Page/app background | `$bgDefault` |
> | Card or section background | `$bgAccent` |
> | Primary call-to-action button | `$bgActionPrimary` |
> | Table row | `$bgRow` |
> | Success banner/message | `$bgSuccessDefault` |
> | Error banner/message | `$bgCriticalDefault` |
> ...similar for text, icon, border...
> ```

> AFTER (only non-obvious mappings, 10 lines):
> ```
> ### Non-Obvious Token Choices
> - Card/section bg: $bgAccent (not $bgDefault)
> - Skeleton loading: $bgPlaceholder / $bgPlaceholderAlt
> - Search highlight: $bgHighlighted (steelBlue200)
> - Decorative categories: $bgDecorative1-4 (celery/cloud/steel/lavender)
> - $iconInfo (not $iconInformational), $borderInputError (not $borderInputCritical)
> ```

**Savings from removing duplicates and decision guides: ~15KB → ~2KB**

**Problem 4: Semantic Coordination Tables are partially redundant**

The coordination tables (Success, Critical, Warning, etc.) list bg + bgAccent + text + icon tokens for each status. The naming convention makes most of this predictable — `$bgSuccessDefault`, `$textSuccess`, `$iconSuccess` — but the few naming inconsistencies make a compact reference valuable.

> AFTER (compressed coordination, replaces ~60 lines with ~15):
> ```
> ### Semantic Color Sets (use as coordinated groups, never mix)
> | Status | bg | bgAccent | text | icon | border |
> |--------|-----|----------|------|------|--------|
> | Success | $bgSuccessDefault | $bgSuccessAccent | $textSuccess | $iconSuccess | $borderInputSuccess |
> | Critical | $bgCriticalDefault | $bgCriticalAccent | $textCritical | $iconCritical | $borderInputError |
> | Warning | $bgWarningDefault | $bgWarningAccent | $textWarning | $iconWarning | — |
> | Info | $bgInformationalDefault | $bgInformationalAccent | $textInformational | $iconInfo | — |
> | Guidance | $bgGuidanceDefault | $bgGuidanceAccent | — | $iconGuidance | — |
>
> Decorative sets 1-4 (celery/cloud/steel/lavender): each has $bgDecorativeN{Default,Accent}, $textDecorativeN, $iconDecorativeN
> ```

**Savings: ~2.5KB → ~0.8KB**

#### Section 3: "Space and Size Tokens" (~200 lines + ~190 lines Stitches utils, ~16KB) → ~3KB

**Problem 1: Space/Size tables have redundant columns**

> BEFORE (space table, 20 lines):
> ```
> | Token     | Value | Pixels | Common Use                              |
> |-----------|-------|--------|-----------------------------------------|
> | `$space0` | `0`   | 0px    | Reset spacing                           |
> | `$space1` | `4px` | 4px    | Tightest spacing, inline icon gaps      |
> | `$space2` | `8px` | 8px    | Tight spacing, between related elements |
> | `$space4` | `16px`| 16px   | Standard spacing, card padding          |
> ...
> ```

The "Value" and "Pixels" columns are identical. The "Common Use" column mostly restates the token's position in the scale.

> AFTER (one-line scale + usage hints):
> ```
> ### Space Scale (4px grid)
> $space0(0) · 1(4px) · 2(8px) · 3(12px) · 4(16px) · 5(20px) · 6(24px) · 7(28px) · 8(32px) · 9(36px) · 10(40px) · 11(44px) · 12(48px) · 13(52px) · 14(56px) · 15(60px) · 16(64px)
>
> Common: $space1 icon gaps · $space2 tight · $space3 input padding · $space4 standard/card · $space6 section · $space8 large section
>
> ### Size Scale (mirrors space, use for width/height/min/max)
> $size0–$size16: same values as $space. Also: $bp1(640px) $bp2(768px) $bp3(1024px) $bp4(1280px) for max-width constraints.
> ```

**Problem 2: 190 lines of Stitches utility docs are 100% duplicated**

The design-tokens reference includes complete documentation for `focusVisible`, `defaultTransition`, `gridTemplateColumnsRepeat`, `gridColumnSpan`, `maxLines`, `safariOnly`, `listStyleOverride`, padding/margin utilities — all with implementation details and examples. This is **identical content** to what's in stitches-patterns.md.

> BEFORE: 190 lines of utility documentation in design-tokens.md
> AFTER: Single line: `> For utility shorthands (p/px/py/m/mx/my, focusVisible, defaultTransition, etc.) see stitches-patterns skill.`

**Savings: Section 3 total ~16KB → ~1.5KB**

#### Section 4: "Typography Tokens" (~260 lines, ~10KB) → ~3KB

**Problem 1: Typography Composition Patterns (~80 lines of full JSX)**

Four complete JSX examples (Page Header, Section Header, Card Title, Data Label) showing how to compose Heading + Text components. This is tutorial content, not token reference. Claude can compose these from the token knowledge.

> BEFORE (80 lines):
> ```tsx
> // Page Header Pattern
> <Box css={{ mb: '$space8' }}>
>   <Heading variant="page">Dashboard</Heading>
>   <Text variant="lede" color="subdued" css={{ mt: '$space2' }}>
>     Overview of your account activity and metrics
>   </Text>
> </Box>
> // ...3 more patterns...
> ```

> AFTER: Removed entirely. The Heading/Text variant mapping tables provide sufficient information for Claude to generate these compositions.

**Problem 2: Typography Anti-Patterns (~30 lines) duplicate skill file**

**Problem 3: Font tables have some redundancy**

> BEFORE (font weight section, 25 lines of table + prose + examples):
> ```
> Picnic has exactly **two font weights**. There is no semibold, medium, light...
> | Token      | Value | Usage                                              |
> | `$regular` | `400` | All body text, labels, descriptions, default weight|
> | `$bold`    | `500` | Headings, emphasis, buttons, strong text            |
> ```

> AFTER (3 lines):
> ```
> Weights: $regular(400) $bold(500) — ONLY these two exist. No semibold/medium/light.
> ```

**Keep:** Heading variant-to-token mapping table, Text variant-to-token mapping table, Typography color variant table — these are genuine lookup references.

**Savings: Section 4 ~10KB → ~3KB**

#### Section 5: "Other Tokens" (~240 lines, ~10KB) → ~3KB

**Problem: Extensive JSX examples for simple lookup values**

Each token type (radius, border-width, shadow, z-index) has:
1. A compact table (useful — keep)
2. Multiple JSX usage examples (not reference material — remove)
3. Decision guides (partially redundant with names — compress)
4. Anti-patterns (duplicated from skill — remove)

> BEFORE (shadow section, ~80 lines):
> ```
> [7-row token table]
> [Shadow Elevation Hierarchy — 6 lines, useful]
> [Focus Ring Patterns — 25 lines JSX, duplicates stitches-patterns]
> [Shadow Usage Examples — 30 lines JSX, tutorial content]
> ```

> AFTER (~15 lines):
> ```
> [7-row token table, keep]
> [Shadow Elevation Hierarchy — 6 lines, keep]
> [Remove all JSX examples]
> ```

**Savings: Section 5 ~10KB → ~3KB**

#### Section 6: "Breakpoints and Responsive Design" (~190 lines, ~8KB) → **DELETE ENTIRELY**

This section is 100% duplicated from stitches-patterns. Breakpoint values are already in the design-tokens skill file. Responsive patterns (useBreakpoints, responsiveRule, @bp in css prop) belong exclusively in stitches-patterns.

**Savings: ~8KB**

#### Section 7: "Real-World Token Usage Examples" (~330 lines, ~13KB) → **DELETE ENTIRELY**

Six complete component implementations (StatusCard, InteractiveDataTableRow, ResponsiveDashboardLayout, ElevatedCard, CreateUserForm, CustomTheme). This is tutorial/example content. Claude can compose all of these from the token lookup tables — that's the whole point of having a reference.

**Savings: ~13KB**

#### Section 8: "Complete Token Count Summary + Quick Reference" (~80 lines, ~3KB) → ~2KB

Keep the token count summary table and the "Most Commonly Used Tokens" quick reference. Remove the naming conventions table (it's in the skill file) and the state suffix table (the names are self-describing).

**Savings: ~1KB**

---

## Part 2: stitches-patterns.md Reference (52KB → ~12KB)

### Section-by-Section Analysis

#### "Configuration Origin" + styled() API (~250 lines, ~10KB) → ~3KB

**Problem 1: Claude knows how Stitches works**

The reference explains createStitches(), what `styled()` does, what `css` is — standard Stitches knowledge. Only Picnic-specific patterns need documenting.

**Problem 2: Excessive source code excerpts**

Full Button.tsx variant definitions (~80 lines), full Card.tsx code, full Banner.tsx code, full IconButton.tsx code — these are component-specific examples that belong in a component-catalog reference, not in a stitches-patterns reference.

> BEFORE (Button variants, 80 lines):
> ```ts
> variants: {
>   variant: {
>     primary: {
>       color: '$textDefault',
>       backgroundColor: '$bgActionPrimary',
>       borderColor: '$bgActionPrimary',
>       '&:hover:not([disabled]):not(:active)': {
>         backgroundColor: '$bgActionPrimaryHover',
>         borderColor: '$bgActionPrimaryHover',
>       },
>       '&:active:not([disabled])': {
>         backgroundColor: '$bgActionPrimaryPressed',
>         borderColor: '$bgActionPrimaryPressed',
>       },
>     },
>     secondary: { ...40 more lines... },
>     subdued: { ...15 more lines... },
>     inverted: { ...15 more lines... },
>   },
> },
> ```

> AFTER (1 concise example):
> ```ts
> // Variant with interactive states (from Button):
> variants: {
>   variant: {
>     primary: {
>       backgroundColor: '$bgActionPrimary',
>       '&:hover:not([disabled])': { backgroundColor: '$bgActionPrimaryHover' },
>       '&:active:not([disabled])': { backgroundColor: '$bgActionPrimaryPressed' },
>     },
>   },
> },
> ```

**Keep one example per pattern, not exhaustive source code.**

#### Variants Reference (~200 lines, ~8KB) → ~2KB

Contains 6 complete variant examples from source files (basic, multi-value, size, state, boolean, align, semantic). One concise example of each pattern type is sufficient — the full Button/Card/Table/Banner/IconButton code is component-specific.

> BEFORE: 6 examples at ~30 lines each
> AFTER: 6 examples at ~5 lines each (pattern skeleton, not full source)

#### css Prop Patterns (~280 lines, ~11KB) → ~3KB

**Problem 1: Exhaustive pseudo-class/selector examples from source**

Full Table.tsx nested selectors, full TextInput hover/disabled chains, full Banner composing patterns — these are component-specific.

**Problem 2: Token usage examples duplicate design-tokens**

The "Token Usage in css Objects" section shows 20+ examples of using tokens in css prop — this is what the design-tokens skill teaches. Claude doesn't need both files explaining `backgroundColor: '$bgDefault'`.

**Keep:** 1 example each of nested selectors, pseudo-classes, pseudo-elements, media queries, cross-scale references, border shorthand, css composition (spread order). Remove all component-specific source excerpts.

#### Custom Utils Reference (~400 lines, ~16KB) → ~2KB

**Problem: Implementation details and exhaustive examples**

The reference includes full implementation source code for each utility, plus multiple usage examples. Claude doesn't need to see `const p = (value: Stitches.PropertyValue<'padding'>) => ({ padding: value })` — it needs to know `p` maps to `padding`.

> BEFORE (focusVisible, 50 lines):
> ```ts
> // Full implementation source
> const focusVisible = (value: Stitches.PropertyValue<'boxShadow'>) => {
>   return {
>     content: 'picnicFocusVisible',
>     '&:focus': { outline: 'none', boxShadow: value },
>     '&:focus:not(:focus-visible)': { boxShadow: 'none' },
>     '&:focus-visible': { boxShadow: value },
>   };
> };
> // Then 20 lines of usage examples
> ```

> AFTER (3 lines):
> ```
> focusVisible: '$focus' — generates :focus/:focus-visible with box-shadow. Use $focus for buttons/cards, $inputFocus for form inputs.
> ```

The utils quick reference table (already exists at ~25 lines) is the right format — but it doesn't need the 350 lines of surrounding prose and source code.

#### Responsive Design (~150 lines, ~6KB) → ~2KB

Keep responsiveRule() mechanics (Picnic-specific), ResponsiveValue type, useBreakpoints hook signature. Remove all JSX examples and explanatory prose about mobile-first design (Claude knows this).

#### Theming (~180 lines, ~7KB) → ~1.5KB

**Problem: Standard Stitches theming concepts taught as if new**

Claude knows createStitches themes. Only Picnic-specific details needed:
- Two built-in themes: theme2021 (light, default), themeDark
- usePicnicStyles() call at app root
- Dark theme only overrides ~13 color tokens
- createTheme() API for custom themes

Remove: Full theme source code, global reset implementation, theme application mechanism, themeResetStyles source.

#### Anti-Patterns + TypeScript Types (~100 lines, ~4KB) → ~0.5KB

Anti-patterns are already in the skill file. TypeScript types: keep a compact reference table of the 5-6 key types.

---

## Part 3: Skill Files (Proposal 03 Designs)

The skill files are already reasonably compressed at ~7.8KB combined. Minor optimization opportunities:

### design-tokens skill (~2.8KB → ~2.2KB)

- **Color Decision Guide** (15 lines): Compress to key non-obvious choices only
- **Cross-Scale References** (5 lines): Already minimal
- Minor prose tightening throughout

### stitches-patterns skill (~3KB → ~2.5KB)

- **Variants System** (15 lines): Can compress common variant name list
- **TypeScript Types** (8 lines): Trim to essential types only
- Minor prose tightening

### layout-primitives skill (~2KB → ~1.7KB)

- **PageLayout example** (10 lines JSX): Can compress to pattern description
- Already self-contained and efficient

---

## Part 4: What Was Removed and Why It's Safe

### Category 1: Name-restating prose (~25KB removed)

Token names in Picnic are self-descriptive by design:
- `$bgActionPrimaryHover` = background + action + primary + hover state
- `$textCritical` = text color + critical status
- `$borderInputDisabled` = border + input + disabled state
- `$space4` = 4th step in spacing scale = 16px

A "Purpose" column saying "Primary button/action hover" for `$bgActionPrimaryHover` adds zero information. Removing these descriptions is safe because the names are the documentation.

**Exception kept:** Non-obvious mappings where name ≠ usage (e.g., `$bgAccent` for "cards/sections", `$iconInfo` not `$iconInformational`).

### Category 2: Cross-file duplication (~30KB removed)

| Content | In design-tokens.md | In stitches-patterns.md | Remove From |
|---------|-------------------|----------------------|-------------|
| Stitches config/setup | Section 1 (8KB) | Configuration Origin | design-tokens |
| Custom utilities docs | Section 3 (8KB) | Custom Utils (16KB) | design-tokens |
| Breakpoints/responsive | Section 6 (8KB) | Responsive Design (6KB) | design-tokens |
| Anti-patterns | Each section (~5KB) | Anti-patterns section | reference files (keep in skills) |
| focusVisible/$focus | Shadow section | Focus util section | design-tokens |

Rule: Each concept has one canonical home. Token VALUES live in design-tokens. Token USAGE PATTERNS live in stitches-patterns. Anti-patterns live in skill files.

### Category 3: Claude already knows this (~20KB removed)

| Content | Why Claude already knows it | What Picnic-specific part to keep |
|---------|---------------------------|----------------------------------|
| How CSS-in-JS works | Core web dev knowledge | "$token syntax, not raw values" |
| How media queries work | CSS fundamentals | "@bp1-4 specific widths" |
| How CSS Grid works | CSS fundamentals | "gridTemplateColumnsRepeat utility" |
| How TypeScript types work | TS fundamentals | "PicnicCss, VariantProps" |
| How Stitches createStitches works | Stitches docs in training | "prefix: 'picnic-', theme2021" |
| What `:focus-visible` does | CSS pseudo-class | "Use focusVisible util, not manual" |
| What line-clamp does | CSS technique | "Use maxLines util" |

### Category 4: Tutorial/example content (~20KB removed)

- 6 full component examples in design-tokens Section 7 (~13KB)
- Typography composition patterns (~3KB)
- Extensive JSX examples throughout both references (~4KB)

Claude can compose components from token knowledge. Teaching it "here's how to build a StatusCard" wastes tokens that should go to "here are the tokens."

---

## Concrete Before/After Examples

### Example 1: Raw Palette Compression

**BEFORE (130 lines, ~5.5KB):**
```markdown
#### Grayscale

| Token | Value | Description |
|-------|-------|-------------|
| `$grayscale0` | `#FFFFFF` | Pure white |
| `$grayscale030` | `#FAFAFA` | Near-white, subtle off-white |
| `$grayscale100` | `#EFF0F0` | Light gray |
| `$grayscale200` | `#E2E3E3` | Soft gray |
| `$grayscale200_40` | `rgba(226,227,227,0.4)` | Soft gray at 40% opacity |
...

#### Yellow

| Token | Value | Description |
|-------|-------|-------------|
| `$yellow100` | `#FFFDE5` | Lightest yellow |
| `$yellow200` | `#FFF8B3` | Light yellow |
| `$yellow300` | `#FFF382` | Medium-light yellow (primary action base) |
...
```

**AFTER (15 lines, ~1KB):**
```markdown
### Raw Palette (theme creation only — never in component code)

Grayscale: 0 #FFF · 030 #FAFAFA · 100 #EFF0F0 · 200 #E2E3E3 · 300 #C6C7C8 · 400 #B6B7B8 · 600 #8D8F91 · 700 #656567 · 800 #545759 · 900 #1B1F23 · 1000 #000
  Opacity variants: 200_40 · 800_40 · 900_08/12/16/24/40 · 1000_50

Yellow: 100 #FFFDE5 · 200 #FFF8B3 · 300 #FFF382 · 500 #FADF65 · 600 #FFE600 · 700 #F9D100
Green: 100 #D8EFE4 · 200 #9FD6BC · 700 #3AA372 · 800 #30855D · 900 #1F573D
Red: 100 #FFD7DE · 200 #FF9CAC · 300 #FA7F8F · 700 #ED3553 · 800 #B3283E
CreamsicleOrange: 100 #FFE1A9 · 200 #FBCD81 · 300 #FABF61
AperolOrange: 100 #FFD4BF · 200 #FFA175 · 700 #E04800 · 800 #AD3800
HyperlinkBlue: 200 #94C7FA · 300 #6FB2F9 · 700 #0074E0 · 800 #005AAD
CeleryGreen: 100 #E2FA9F · 200 #BDD185 · 700 #788554 · 800 #617030
CloudBlue: 100 #E3F0F4 · 200 #82C8D2 · 700 #55838A · 800 #2A4A50
CloveBrown: 100 #F9F7F0 · 200 #D1BAB0 · 300 #C1A396 · 700 #AD6848 · 800 #7F2801
LavenderPurple: 030 #FBF3FF · 100 #EDC6ED · 200 #C878D1 · 700 #834F8A · 800 #58495B
SteelBlue: 100 #E7F2FE · 200 #CEE5FD · 300 #B9CEE4 · 700 #67737E · 800 #3E454C
```

**Savings: 82%** | Technique: Drop Description column (name = description), inline format, drop markdown table overhead

---

### Example 2: Interactive State Progressions

**BEFORE (140 lines, ~6KB):**
```tsx
#### Primary Action States

const PrimaryButton = styled('button', {
  backgroundColor: '$bgActionPrimary',         // Default: #FFF382
  color: '$textDefault',
  '&:hover': {
    backgroundColor: '$bgActionPrimaryHover',   // Hover: #FFE600
  },
  '&:active': {
    backgroundColor: '$bgActionPrimaryPressed', // Pressed: #F9D100
  },
  '&:disabled': {
    backgroundColor: '$bgActionPrimaryDisabled', // Disabled: rgba(255,243,130,0.4)
    cursor: 'not-allowed',
  },
});

// ...then SecondaryButton (20 lines), BasicButton (20 lines),
// ListItem with selected (30 lines), ToggleButton (20 lines),
// StyledInput (25 lines)
```

**AFTER (8 lines, ~0.5KB):**
```markdown
### State Progressions (Default → Hover → Pressed → Disabled)

- **Primary action:** $bgActionPrimary #FFF382 → Hover #FFE600 → Pressed #F9D100 → Disabled rgba(255,243,130,.4)
- **Secondary action:** $bgActionSecondary #E2E3E3 → Hover #C6C7C8 → Pressed #8D8F91 → Disabled rgba(226,227,227,.4)
- **Basic action:** $bgActionBasic #FFF → Hover #EFF0F0 → Pressed #E2E3E3
- **Row:** $bgRow #FFF → Hover #EFF0F0 → Pressed #E2E3E3 | Selected: #E2E3E3 → SelectedHover → SelectedPressed #C6C7C8
- **Toggle:** $bgToggle #FFF → Hover #E2E3E3 → Pressed #C6C7C8 → Selected #1B1F23
- **Input border:** $borderInput #545759 → Hover #000 → Focus (use $inputFocus shadow) → Error #ED3553 → Disabled rgba(84,87,89,.4)
```

**Savings: 92%** | Technique: Token names encode the pattern — no need for full styled() implementations

---

### Example 3: Space/Size Scale Compression

**BEFORE (40 lines for space + 40 lines for size, ~3.5KB):**
```markdown
| Token | Value | Pixels | Common Use |
|-------|-------|--------|-----------|
| `$space0` | `0` | 0px | Reset spacing |
| `$space1` | `4px` | 4px | Tightest spacing, inline icon gaps |
| `$space2` | `8px` | 8px | Tight spacing, between related elements |
| `$space3` | `12px` | 12px | Default component internal padding |
| `$space4` | `16px` | 16px | Standard spacing, card padding |
... (17 rows × 2 tables)
```

**AFTER (6 lines, ~0.4KB):**
```markdown
### Space Scale (4px grid)
$space0(0) · 1(4) · 2(8) · 3(12) · 4(16) · 5(20) · 6(24) · 7(28) · 8(32) · 9(36) · 10(40) · 11(44) · 12(48) · 13(52) · 14(56) · 15(60) · 16(64px)

Common: 1=icon gaps · 2=tight · 3=input padding · 4=standard/card · 6=section · 8=large section

Size scale: identical values. Also $bp1(640) $bp2(768) $bp3(1024) $bp4(1280) for max-width.
```

**Savings: 89%** | Technique: Values are a linear 4px scale — a compact inline format beats a 4-column table

---

### Example 4: Stitches Utility Deduplication

**BEFORE (in design-tokens.md, 190 lines, ~8KB):**
```markdown
#### `focusVisible`
Generates accessible focus ring styles using `:focus`, `:focus:not(:focus-visible)`...
[15 lines of implementation code]
[20 lines of usage examples]

#### `defaultTransition`
Generates a CSS transition with `0.2s ease 0s` timing...
[10 lines of implementation code]
[15 lines of usage examples]

#### `gridTemplateColumnsRepeat`
Creates a CSS Grid `grid-template-columns` rule...
[10 lines of implementation code]
[15 lines of usage examples]

... (7 utilities documented, each 20-40 lines)

### Complete Utility Reference Table
| Utility | Input Type | Description | Example |
... (25 rows)
```

**AFTER (in design-tokens.md, 1 line):**
```markdown
> Custom Stitches utilities (p/px/py/m/mx/my, focusVisible, defaultTransition, grid utils, maxLines, safariOnly, listStyleOverride): see stitches-patterns skill for complete reference.
```

**Savings: 99%** | Technique: Don't duplicate — point to canonical source

---

### Example 5: Stitches Source Code Excerpts

**BEFORE (in stitches-patterns.md, Button compound variants — 60 lines):**
```ts
compoundVariants: [
  {
    variant: 'primary',
    disabledVisually: true,
    css: {
      color: '$textDisabled',
      backgroundColor: '$bgActionPrimaryDisabled',
      borderColor: '$bgActionPrimaryDisabled',
    },
  },
  {
    variant: 'secondary',
    disabledVisually: true,
    css: {
      color: '$textDisabled',
      backgroundColor: '$bgActionBasic',
      borderColor: '$borderInputDisabled',
    },
  },
  // ...5 more compound variants, each 8 lines
],
```

**AFTER (5 lines):**
```ts
// Compound variants: style combos. From Button — disabled styling per variant:
compoundVariants: [
  { variant: 'primary', disabledVisually: true, css: { color: '$textDisabled', backgroundColor: '$bgActionPrimaryDisabled' } },
  { variant: 'secondary', disabledVisually: true, css: { color: '$textDisabled', borderColor: '$borderInputDisabled' } },
],
```

**Savings: 92%** | Technique: One example demonstrates the pattern — Claude can extrapolate. Component-specific details belong in component-catalog.

---

### Example 6: Typography Anti-Patterns

**BEFORE (in design-tokens.md, 30 lines):**
```tsx
// WRONG: Using fontWeight values that don't exist in the system
<Text css={{ fontWeight: '600' }}>Semibold text</Text>
<Text css={{ fontWeight: '300' }}>Light text</Text>
// CORRECT: Only $regular (400) and $bold (500) exist
<Text css={{ fontWeight: '$bold' }}>Bold text</Text>
<Text>Regular text</Text>

// WRONG: Using arbitrary font sizes
<Text css={{ fontSize: '18px' }}>Custom size</Text>
// CORRECT: Use font size tokens
<Text css={{ fontSize: '$fontSize3' }}>Standard body (16px)</Text>
...
```

**AFTER (already in skill file, 2 lines):**
```
- DON'T: fontWeight: 600 → only $regular (400) and $bold (500) exist
- DON'T: fontSize: '18px' → use $fontSize1-7
```

**Savings: 93%** | Technique: Anti-patterns live in skill file only — reference file is for lookup, not rules

---

## Compression Technique Summary

| # | Technique | Where Applied | Estimated Savings |
|---|-----------|--------------|-------------------|
| 1 | **Drop name-restating descriptions** | Raw palette, functional tokens, sizes, typography, shadows, z-index | ~25KB |
| 2 | **Eliminate cross-file duplication** | Stitches utils in design-tokens, breakpoints in design-tokens, anti-patterns in references | ~30KB |
| 3 | **Remove "Claude already knows" content** | CSS-in-JS basics, media queries, CSS Grid, TS types, Stitches fundamentals | ~20KB |
| 4 | **Delete tutorial/example content** | 6 real-world examples, composition patterns, extensive JSX | ~20KB |
| 5 | **Use compact inline formats** | Space/size scales, raw palette, state progressions | ~10KB |
| 6 | **One example per pattern** | Variant examples, css prop patterns, utility usage | ~10KB |
| **Total** | | | **~115KB (70%)** |

---

## Appendix: Proposed Reference File Structures

### design-tokens.md (~30KB target)

```
# Design Tokens Reference

## Raw Palette (compact inline, ~1KB)
  Grayscale, Yellow, Green, Red, brand colors — hex values only

## Functional Color Tokens (~8KB)
  ### $bg* Tokens
    Surfaces table (10 rows, 3 cols: Token | Hex | Notes-if-non-obvious)
    State progressions (inline): Primary/Secondary/Basic/Row/Toggle
    Semantic status tokens (table: 5 rows × 6 cols)
    Decorative tokens (compact inline)
    Gradients (2 tokens)

  ### $text* Tokens (compact table, 16 rows)
  ### $icon* Tokens (compact table, 15 rows)
  ### $border* Tokens (compact table, 13 rows)

  ### Dark Theme Overrides (compact table, ~13 changed tokens)
  ### Non-Obvious Token Choices (5-10 specific callouts)

## Space & Size (~1.5KB)
  Inline scales + common usage patterns

## Typography (~3KB)
  Font families, sizes, weights (compact)
  Heading variant → token mapping table
  Text variant → token mapping table
  Color variant → token mapping table

## Other Tokens (~2KB)
  Radii table (4 rows)
  Border widths table (4 rows)
  Shadows table (7 rows) + elevation hierarchy
  Z-index table (6 rows)

## Quick Reference (~1KB)
  Most commonly used tokens by category
  Token count summary
```

### stitches-patterns.md (~12KB target)

```
# Stitches Patterns Reference

## styled() API (~3KB)
  1 basic example, 1 with-variants example, 1 extending example
  Shared base styles pattern (as unknown as PicnicCss)

## Variants (~2KB)
  Pattern skeletons: string, size, state, boolean, compound, reusable
  1 concise example each (~5 lines)

## css Prop Patterns (~2KB)
  1 example each: nested selectors, pseudo-classes, pseudo-elements
  Cross-scale references, border shorthand, css composition (spread order)

## Custom Utils Quick Reference (~1.5KB)
  Summary table (already exists)
  Key details: focusVisible generates 3 rules, defaultTransition timing, gridTemplateColumnsRepeat output

## Responsive (~2KB)
  responsiveRule() mechanics + array-to-breakpoint mapping
  ResponsiveValue<T> type
  useBreakpoints() hook signature
  CSS vs JS responsive: when to use which

## Theming (~1.5KB)
  usePicnicStyles() API
  Built-in themes, createTheme() for custom
  Dark theme: ~13 token overrides, spread pattern
```
