# Proposal 07: Token Optimization for Reference Files

> **Author**: Token Optimization Agent
> **Task**: #3 — Audit reference files for token waste
> **Date**: 2026-02-18
> **Status**: Complete
> **Target**: 50%+ token reduction across 4 categorized reference files + 2 foundation references

---

## 1. Analysis of Current Waste

### Component Catalog: Anatomy of Waste

Taking Badge as a representative example from the current catalog (lines 1669-1712):

```markdown
#### Badge                                          ← 1 line

**Import**: `import { Badge } from '@attentive/picnic'`  ← WASTE: always @attentive/picnic
**Primitive**: Styled `em`                          ← 1 line (useful)

Inline or raised annotation badge. Used for         ← WASTE: name is self-documenting
counts, statuses, and notifications.

##### Props                                         ← WASTE: section header

| Prop | Type | Default | Description |             ← WASTE: header row
|------|------|---------|-------------|             ← WASTE: separator row
| variant | `'active' \| 'standard' \| ...` | `'standard'` | Color variant |  ← "Color variant" adds nothing
| position | `'inline' \| 'raised'` | `'raised'` | Positioning mode |        ← "Positioning mode" adds nothing
| css | PicnicCss | — | Stitches style object |    ← WASTE: every component has this

##### Variant Styles                                ← WASTE: section header
| Variant | Background | Text | Notes |            ← styling internals rarely needed
| active | `$bgToggleSelected` | `$textInverted` | White border |
| standard | `$bgInformationalDefault` | inherited | Default |
...                                                 ← 5 more rows of styling detail

##### Usage                                         ← WASTE: section header
```tsx
// Raised badge (positioned over parent)            ← WASTE: comment restates the obvious
<Box css={{ position: 'relative', display: 'inline-block' }}>
  <IconButton iconName="Bell" description="Notifications" />
  <Badge variant="error">3</Badge>                 ← useful line
</Box>

// Inline badge                                     ← WASTE
<Badge variant="standard" position="inline">New</Badge>  ← useful line

// Magic gradient                                   ← WASTE
<Badge variant="magic" position="inline">AI</Badge>      ← useful line
```

##### Related Components                            ← WASTE: section header
- **ContainedLabel**: Richer status label with icon ← marginally useful
- **Tag**: Deletable tag                            ← marginally useful
```

**Current Badge entry**: ~44 lines, ~1.5KB
**Information content**: name, primitive, 2 variant props with defaults, 3 usage examples

### Design Tokens: Anatomy of Waste

From the current `design-tokens.md` (lines 345-440):

```markdown
#### Surface Backgrounds                            ← section header

| Token | Purpose | Light Theme Value | Resolved Hex |  ← 4-column header
|-------|---------|-------------------|-------------|    ← separator
| `$bgDefault` | Primary surface / page background | `$grayscale0` | `#FFFFFF` |
| `$bgAccentSubtle` | Subtle surface differentiation | `$grayscale030` | `#FAFAFA` |
```

**Waste per row**: "Purpose" column restates what the name says. `$bgDefault` = "Primary surface / page background" — the name `bgDefault` already says "background default." The "Light Theme Value" column showing `$grayscale0` is rarely useful (you use `$bgDefault`, not `$grayscale0`). Only the token name and resolved hex are essential for lookup.

---

## 2. Compact Component Entry Format

### Design Principles

1. **Names are self-documenting** — don't describe what's obvious
2. **Import is always `@attentive/picnic`** — skip it
3. **`css: PicnicCss` is universal** — skip it
4. **Descriptions waste tokens** — use only for non-obvious behavior
5. **Defaults marked with `*`** — compact inline notation
6. **Examples belong in skills, not references** — references are lookup tables

### Format Specification

```
## ComponentName
Primitive: X | Sub: .A .B .C
props: propName(value1|value2*|value3) anotherProp(type)
notes: Only non-obvious behavior or gotchas
```

Rules:
- `*` after a value = default
- `(type)` without values = type annotation for non-enum props
- `!` prefix = required prop
- Props from the "never describe" list are omitted entirely
- Sub-components listed with `.` prefix, flat list
- One blank line between entries
- Variant styling tables omitted (internal implementation detail)
- Usage examples omitted from references (belong in skills)
- "Related Components" omitted (skills handle composition)

### Real Example: Badge (current ~44 lines → 3 lines)

**Current** (~1.5KB):
```markdown
#### Badge
**Import**: `import { Badge } from '@attentive/picnic'`
**Primitive**: Styled `em`

Inline or raised annotation badge. Used for counts, statuses, and notifications.

##### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'active' | 'standard' | 'primary' | 'error' | 'magic'` | `'standard'` | Color variant |
| position | `'inline' | 'raised'` | `'raised'` | Positioning mode |
| css | PicnicCss | — | Stitches style object |

[...variant styles table, usage examples, related components = ~30 more lines]
```

**Compact** (~120 bytes):
```
## Badge
Primitive: styled em
props: variant(active|standard*|primary|error|magic) position(inline|raised*)
```

### Real Example: Button (current ~70 lines → 6 lines)

**Compact**:
```
## Button
Primitive: react-polymorphic-box
props: variant(primary*|secondary|subdued|inverted|legacy-inverted) size(small|medium*|large) loading(boolean)
notes: `basic` variant deprecated → use `secondary`. Supports `as` prop for polymorphic rendering.
deprecated: basic → secondary
```

### Real Example: Table (current ~160 lines → 12 lines)

**Compact**:
```
## Table
Primitive: CSS Grid + ARIA roles
Sub: .Header .HeaderRow .HeaderCell .SortableHeaderCell .Body .BodyRow .BodyFocusableRow .BodyCell .RowSelectorCell .HeaderSelectorCell .FocusWrapper
props: columns(number|number[]) columnSizes(string|string[]) textVariant(body*|caption)
HeaderCell: align(left*|center|right)
SortableHeaderCell: !onChange isSortActive(boolean) ascending(boolean) align(left*|center|right)
BodyFocusableRow: onClick(fn)
RowSelectorCell: !checked !onChange !value aria-label(string)
HeaderSelectorCell: !onChange aria-label(string)
FocusWrapper: !onKeyDown
notes: Uses display:contents for rows. columns accepts number (equal) or number[] (ratios).
```

### Real Example: ContainedLabel (current ~45 lines → 5 lines)

**Compact**:
```
## ContainedLabel
Primitive: styled div + Context
Sub: .Icon .Tooltip
props: variant(neutral*|success|informational|warning|critical|decorative1|decorative2|decorative3|decorative4|overMedia|magic)
Icon: name(!IconName) color(IconColor)
Tooltip: !iconName iconColor(IconColor) !description side(top|right|bottom|left)
```

---

## 3. Compact Token Table Format

### Design Principles

1. **Token names are self-documenting** — `$bgDefault` doesn't need "Primary surface / page background"
2. **Raw palette references are internal** — users write `$bgDefault`, not `$grayscale0`
3. **Hex values are the primary lookup reason** — keep them
4. **Dark overrides only where they differ** — use `→` notation
5. **Group by prefix** — one compact block per prefix group

### Format Specification

```
### $bg — Backgrounds
$bgDefault #FFF →dark #1B1F23
$bgAccentSubtle #FAFAFA
$bgAccent #EFF0F0
```

Rules:
- Token name + hex on one line
- `→dark` suffix only for tokens that change in dark theme
- No "Purpose" column — the name IS the purpose
- No "Light Theme Value" showing raw palette token — irrelevant for usage
- Group header names the prefix and semantic category
- Alpha values shown as-is: `rgba(27,31,35,0.4)`

### Real Example: Background Tokens (current ~90 lines → ~55 lines)

**Current** (one row of many):
```
| `$bgDefault` | Primary surface / page background | `$grayscale0` | `#FFFFFF` |
```

**Compact**:
```
$bgDefault #FFF →dark #1B1F23
```

**Full surface backgrounds block**:
```
### $bg — Surfaces
$bgDefault #FFF →dark #1B1F23
$bgAccentSubtle #FAFAFA
$bgAccent #EFF0F0
$bgAccentDark #E2E3E3
$bgPlaceholder #E2E3E3
$bgPlaceholderAlt #C6C7C8
$bgOverlay rgba(0,0,0,0.5)
$bgTooltip #000
$bgBrand #FFF382 →dark rgba(255,243,130,0.4)
$bgInverted #1B1F23
$bgInvertedDisabled #8D8F91
$bgHighlighted #CEE5FD
```

12 tokens in 12 lines. Current format uses 12 data rows + 2 header/separator rows + section header = 15 lines, each ~4x wider.

### Real Example: Text Tokens (current ~18 lines → ~16 lines)

```
### $text — Text Colors
$textDefault #1B1F23 →dark #FFF
$textSubdued #656567
$textDisabled rgba(27,31,35,0.4)
$textInverted #FFF →dark #1B1F23
$textLink #1B1F23 →dark #FFF
$textHover #0074E0
$textPressed #005AAD
$textSelectedToggle #1B1F23
$textSuccess #30855D
$textWarning #AD3800
$textCritical #B3283E
$textInformational #7F2801
$textDecorative1 #617030
$textDecorative2 #2A4A50
$textDecorative3 #3E454C
$textDecorative4 #58495B
```

### Raw Palette Compression

The raw palette section (current ~130 lines) can be compressed to a flat lookup:

**Current** (one color family):
```
#### Green
| Token | Value | Description |
|-------|-------|-------------|
| `$green100` | `#D8EFE4` | Lightest green (success bg) |
| `$green200` | `#9FD6BC` | Light green (success accent) |
| `$green700` | `#3AA372` | Medium green (success icon) |
| `$green800` | `#30855D` | Dark green (success text) |
| `$green900` | `#1F573D` | Darkest green |
```

**Compact**:
```
green: 100=#D8EFE4 200=#9FD6BC 700=#3AA372 800=#30855D 900=#1F573D
```

One line per color family. The "Description" column is eliminated — `$green100` being "Lightest green" is self-evident from the numbering.

---

## 4. Compact Sub-Component Listing Format

### Current Format (Table sub-components, ~15 lines):

```markdown
##### Sub-Components

| Sub-Component | Props | Description |
|---------------|-------|-------------|
| Table.Header | children | Header rowgroup wrapper |
| Table.HeaderRow | children | Header row (display: contents) |
| Table.HeaderCell | `align?: 'left' | 'center' | 'right'` | Column header cell |
| Table.SortableHeaderCell | `onChange, isSortActive?, ascending?, align?` | Sortable column header |
| Table.Body | children | Body rowgroup wrapper |
| Table.BodyRow | children | Body row (display: contents) |
| Table.BodyFocusableRow | `onClick?` | Clickable body row with hover/focus styles |
| Table.BodyCell | `align?: 'left' | 'center' | 'right'` | Body data cell |
| Table.RowSelectorCell | `checked, onChange, value, aria-label?` | Row checkbox cell |
| Table.HeaderSelectorCell | `onChange, aria-label?` | Select-all checkbox header |
| Table.FocusWrapper | `onKeyDown` | Keyboard-focusable cell wrapper |
```

### Compact Format (3 lines):

```
Sub: .Header .HeaderRow .HeaderCell .SortableHeaderCell .Body .BodyRow .BodyFocusableRow .BodyCell .RowSelectorCell .HeaderSelectorCell .FocusWrapper
```

Sub-component prop details appear inline only for those with non-obvious props (see Table example in Section 2 above). Wrapper-style sub-components like `.Header`, `.Body`, `.HeaderRow`, `.BodyRow` that just accept `children` need zero documentation.

### DropdownMenu (current ~15 lines → 2 lines):

```
Sub: .Trigger .Button .Content .Item .TextItem .Label .Separator .Sub .SubMenuTriggerItem .SubContent .UnstyledItem
Content: align(start|center|end)
```

### StandardDialog (current ~10 lines → 1 line):

```
Sub: .Trigger .Content .Header .Heading .HeroImage .Body .Footer .Close
```

No per-sub-component docs needed — names are self-documenting. `.Header` is a header. `.Body` is a body. `.Close` closes.

---

## 5. "Never Needs Description" Props

These props are universally understood and should be omitted entirely from reference entries unless they have non-standard behavior in a specific component:

### Universal Props (omit from all entries)

| Prop | Reason |
|------|--------|
| `css: PicnicCss` | Every Picnic component accepts this. Universal. |
| `children: ReactNode` | React standard. Always accepted. |
| `ref: React.Ref` | React standard. Forwarded on all components. |
| `className` | **Forbidden** in Picnic — never document it. |
| `style` | **Forbidden** in Picnic — never document it. |

### Standard HTML Props (omit unless non-standard behavior)

| Prop | Reason |
|------|--------|
| `disabled: boolean` | Standard HTML behavior. Default always `false`. |
| `placeholder: string` | Standard HTML input attribute. |
| `value: string` | Standard controlled input pattern. |
| `onChange` | Standard React event handler. |
| `onSubmit` | Standard form handler. |
| `onClick` | Standard React event handler. |
| `id: string` | Standard HTML attribute. |
| `name: string` | Standard HTML form attribute. |
| `type: string` | Standard HTML input type. |
| `aria-label: string` | Standard accessibility attribute. |

### Picnic-Specific Universal Props (omit unless non-standard)

| Prop | Reason |
|------|--------|
| `as: React.ElementType` | Polymorphic — document only when the component supports it AND the default is non-obvious. For Box (`div`), don't mention. For Button (`button`), don't mention. For Heading, mention because the `as` determines semantic level independently of visual `variant`. |
| `loading: boolean` | Mention only for Button/IconButton where it changes visual state. |

### Omission Savings Estimate

The current catalog lists `css: PicnicCss` in 50+ prop tables. At ~50 chars per row + table overhead = ~3KB of pure waste. `disabled: boolean` appears ~20 times = ~1KB. `children`, `ref`, standard handlers add another ~2KB. **Total savings from prop omission alone: ~6KB.**

---

## 6. Size Reduction Estimates

### Reference File: actions-ref.md

Components: Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, PickerButton

| Metric | Current Format | Compact Format | Reduction |
|--------|---------------|----------------|-----------|
| Button | ~70 lines | 6 lines | 91% |
| IconButton | ~55 lines | 5 lines | 91% |
| ButtonBar | ~20 lines | 2 lines | 90% |
| ButtonGroup | ~50 lines | 6 lines | 88% |
| ButtonGroupNext | ~45 lines | 5 lines | 89% |
| PickerButton | ~25 lines | 3 lines | 88% |
| **Total** | **~265 lines / ~9KB** | **~27 lines / ~1.2KB** | **~87%** |

### Reference File: typography-ref.md

Components: Heading, Text, TextWithOverflowTooltip, Link

| Metric | Current Format | Compact Format | Reduction |
|--------|---------------|----------------|-----------|
| Heading | ~55 lines | 6 lines | 89% |
| Text | ~45 lines | 5 lines | 89% |
| TextWithOverflowTooltip | ~30 lines | 3 lines | 90% |
| Link | ~30 lines | 3 lines | 90% |
| **Total** | **~160 lines / ~5.5KB** | **~17 lines / ~0.8KB** | **~85%** |

### Reference File: data-display-ref.md

Components: Badge, Tag, ContainedLabel, ProgressBar, List, Card

| Metric | Current Format | Compact Format | Reduction |
|--------|---------------|----------------|-----------|
| Badge | ~44 lines | 3 lines | 93% |
| Tag | ~40 lines | 3 lines | 92% |
| ContainedLabel | ~45 lines | 5 lines | 89% |
| ProgressBar | ~30 lines | 3 lines | 90% |
| List | ~25 lines | 3 lines | 88% |
| Card | ~20 lines | 2 lines | 90% |
| **Total** | **~204 lines / ~7KB** | **~19 lines / ~0.9KB** | **~87%** |

### Reference File: media-ref.md

Components: Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark, Emoji

| Metric | Current Format | Compact Format | Reduction |
|--------|---------------|----------------|-----------|
| Icon | ~55 lines | 5 lines | 91% |
| ThirdPartyIcon | ~30 lines | 3 lines | 90% |
| IconCircle | ~30 lines | 3 lines | 90% |
| ThirdPartyIconCircle | ~25 lines | 2 lines | 92% |
| ResponsiveImage | ~35 lines | 3 lines | 91% |
| ImagePreview | ~25 lines | 3 lines | 88% |
| Logomark | ~15 lines | 2 lines | 87% |
| Wordmark | ~15 lines | 2 lines | 87% |
| Emoji | ~20 lines | 2 lines | 90% |
| **Total** | **~250 lines / ~8.5KB** | **~25 lines / ~1.1KB** | **~87%** |

### Foundation Reference: token-tables.md

| Section | Current | Compact | Reduction |
|---------|---------|---------|-----------|
| Raw palette (~130 lines) | ~130 lines / ~6KB | ~15 lines / ~1KB | 88% |
| Functional bg tokens (~90 lines) | ~90 lines / ~5KB | ~55 lines / ~2KB | 60% |
| Text tokens (~18 lines) | ~18 lines / ~1.2KB | ~16 lines / ~0.6KB | 50% |
| Icon tokens (~18 lines) | ~18 lines / ~1.2KB | ~16 lines / ~0.6KB | 50% |
| Border tokens (~16 lines) | ~16 lines / ~1KB | ~14 lines / ~0.5KB | 50% |
| Space tokens (~20 lines) | ~20 lines / ~1.5KB | ~17 lines / ~0.5KB | 67% |
| Size tokens (~20 lines) | ~20 lines / ~1.5KB | ~17 lines / ~0.5KB | 67% |
| Typography tokens (~30 lines) | ~30 lines / ~2KB | ~20 lines / ~0.8KB | 60% |
| Decision guides (~80 lines) | ~80 lines / ~3.5KB | 0 (move to skill) | 100% |
| Anti-patterns (~40 lines) | ~40 lines / ~2KB | 0 (move to skill) | 100% |
| Code examples (~100 lines) | ~100 lines / ~4KB | 0 (move to skill) | 100% |
| **Total** | **~562 lines / ~29KB** | **~170 lines / ~6.5KB** | **~78%** |

Note: Decision guides, anti-patterns, and code examples belong in the `design-tokens` skill, not the reference lookup table. The reference is a pure lookup table; the skill teaches HOW to use the tokens.

### Foundation Reference: utils-reference.md

| Section | Current | Compact | Reduction |
|---------|---------|---------|-----------|
| Utility table (~25 lines) | ~25 lines / ~2KB | ~18 lines / ~0.8KB | 60% |
| Code examples (~60 lines) | ~60 lines / ~3KB | 0 (move to skill) | 100% |
| Utility descriptions (~40 lines) | ~40 lines / ~2.5KB | ~15 lines / ~0.7KB | 72% |
| **Total** | **~125 lines / ~7.5KB** | **~33 lines / ~1.5KB** | **~80%** |

### Overall Summary

| File | Current Est. | Compact Est. | Reduction |
|------|-------------|-------------|-----------|
| actions-ref.md | ~9KB | ~1.2KB | **87%** |
| typography-ref.md | ~5.5KB | ~0.8KB | **85%** |
| data-display-ref.md | ~7KB | ~0.9KB | **87%** |
| media-ref.md | ~8.5KB | ~1.1KB | **87%** |
| token-tables.md | ~29KB | ~6.5KB | **78%** |
| utils-reference.md | ~7.5KB | ~1.5KB | **80%** |
| **Total** | **~66.5KB** | **~12KB** | **~82%** |

---

## 7. Additional Recommendations

### Examples Belong in Skills, Not References

References should be **pure lookup tables** — zero prose, zero examples. When Claude needs to generate a Badge, it doesn't look up the Badge reference and copy an example. It needs:
1. What props exist and their allowed values (reference)
2. How to compose Badge with other components (skill)
3. Common patterns and gotchas (skill)

The current catalog has ~40% of its content as usage examples. Moving all examples to skills eliminates them from references entirely.

### Variant Style Tables Are Internal Detail

The catalog includes tables like:

```
| Variant | Background | Text Color | Border |
| primary | `$bgActionPrimary` | `$textDefault` | none |
```

These document the internal styling implementation. Claude doesn't need to know that `primary` maps to `$bgActionPrimary` — it just sets `variant="primary"`. If custom styling is needed, the `css` prop overrides everything. **Eliminate all variant style tables from references.**

### The `css: PicnicCss` Convention

Instead of listing `css` on every single component, add a single header note to each reference file:

```
> All components accept `css: PicnicCss` for Stitches styling. Omitted from individual entries.
```

This saves ~50 prop table rows across the catalog.

### Semantic Color Sets: Keep as Compact Blocks in token-tables.md

The semantic coordination tables (Success set, Critical set, etc.) are high-value lookup content. Compress them:

```
### Semantic Color Sets
success: bg=$bgSuccessDefault accent=$bgSuccessAccent text=$textSuccess icon=$iconSuccess border=$borderInputSuccess
critical: bg=$bgCriticalDefault accent=$bgCriticalAccent text=$textCritical icon=$iconCritical border=$borderInputError
warning: bg=$bgWarningDefault accent=$bgWarningAccent text=$textWarning icon=$iconWarning
info: bg=$bgInformationalDefault accent=$bgInformationalAccent text=$textInformational icon=$iconInfo
guidance: bg=$bgGuidanceDefault accent=$bgGuidanceAccent icon=$iconGuidance
decorative1: bg=$bgDecorative1Default accent=$bgDecorative1Accent text=$textDecorative1 icon=$iconDecorative1
decorative2: bg=$bgDecorative2Default accent=$bgDecorative2Accent text=$textDecorative2 icon=$iconDecorative2
decorative3: bg=$bgDecorative3Default accent=$bgDecorative3Accent text=$textDecorative3 icon=$iconDecorative3
decorative4: bg=$bgDecorative4Default accent=$bgDecorative4Accent text=$textDecorative4 icon=$iconDecorative4
```

9 lines replaces ~80 lines of tables. Same information density.

---

## 8. Complete Compact Reference Example: data-display-ref.md

Putting it all together — here's what a full compact reference file looks like:

```markdown
# Data Display Components Reference

> All components: `import { X } from '@attentive/picnic'`. All accept `css: PicnicCss`.

## Badge
Primitive: styled em
props: variant(active|standard*|primary|error|magic) position(inline|raised*)

## Tag
Primitive: styled span
props: !onDelete size(small|normal*) variant(default*|error)

## ContainedLabel
Primitive: styled div + Context
Sub: .Icon .Tooltip
props: variant(neutral*|success|informational|warning|critical|decorative1|decorative2|decorative3|decorative4|overMedia|magic)
Icon: name(!IconName) color(IconColor)
Tooltip: !iconName iconColor(IconColor) !description side(top|right|bottom|left)

## ProgressBar
Primitive: Radix Progress
props: !total(number) !value(number) variant(success*|warning|error)

## List
Primitive: styled ul/ol
Sub: .Item
props: as(ul*|ol) variant(unstyled)

## Card
Primitive: styled div
notes: General-purpose container with elevation. Use for content grouping.
```

**Total: ~22 lines / ~0.9KB** vs current ~204 lines / ~7KB = **87% reduction**.

---

## 9. Format Grammar Summary

For implementors, here's the formal grammar of the compact component entry format:

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

Conventions:
- `!` = required
- `*` = default value
- `(type)` = type annotation (boolean, number, string, fn, ReactNode, IconName, etc.)
- `(value1|value2*)` = enum with default marked
- Omit all props from the "never describe" list (css, children, ref, disabled, placeholder, value, onChange, etc.)
- Sub-component props only documented when non-obvious
