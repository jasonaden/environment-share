# Section 3: Foundation Skills

Three foundation skills that all other picnic sub-skills depend on. These encode the cross-cutting knowledge required to write any Picnic component correctly.

```
design-tokens          (no dependencies)
    ↑
stitches-patterns      (depends on design-tokens)
    ↑
layout-primitives      (depends on design-tokens + stitches-patterns)
```

---

## 3.1 design-tokens

### SKILL.md (~2.2KB target)

```markdown
---
name: design-tokens
description: >
  Picnic design token system: colors, spacing, typography, shadows, radii, z-index.
  Use when applying colors/backgrounds/text, choosing spacing, setting typography,
  using shadows or radii, ensuring theme compatibility, or fixing raw CSS values.
  Keywords: $token, color, spacing, font size, theme, dark mode.
---

# Picnic Design Tokens

All values use `$token` syntax via `@attentive/picnic`. Tokens adapt automatically to light/dark theme.

## Golden Rule

- NEVER raw CSS values (hex, px, rem) — always $token syntax
- NEVER raw palette tokens ($grayscale*, $yellow*, etc.) in components
- ALWAYS functional/semantic tokens ($bg*, $text*, $icon*, $border*)
- Functional tokens auto-adapt to light/dark theme

## Two-Tier Color System

**Tier 1: Raw palette** — grayscale, yellow, green, red, brand colors. For custom theme creation only. Never in component code.

**Tier 2: ~97 functional tokens**, prefixed by usage:
- $bg* (~53): surfaces, actions, rows, toggles, semantic status, decorative
- $text* (~16): default, subdued, disabled, inverted, semantic, decorative
- $icon* (~15): default, subdued, disabled, inverted, semantic, decorative
- $border* (~13): default, input states, action, focus, toggle

State suffixes: Default → Hover → Pressed → Disabled → Selected

## Color Decision Guide (non-obvious choices only)

- Card/section bg: $bgAccent (not $bgDefault)
- Skeleton loading: $bgPlaceholder / $bgPlaceholderAlt
- Search highlight: $bgHighlighted
- Decorative categories: $bgDecorative1-4 (celery/cloud/steel/lavender)
- Note: $iconInfo (not $iconInformational), $borderInputError (not $borderInputCritical)

## Semantic Color Sets (use as coordinated groups, never mix)

| Status | bg | bgAccent | text | icon | border |
|--------|-----|----------|------|------|--------|
| Success | $bgSuccessDefault | $bgSuccessAccent | $textSuccess | $iconSuccess | $borderInputSuccess |
| Critical | $bgCriticalDefault | $bgCriticalAccent | $textCritical | $iconCritical | $borderInputError |
| Warning | $bgWarningDefault | $bgWarningAccent | $textWarning | $iconWarning | — |
| Info | $bgInformationalDefault | $bgInformationalAccent | $textInformational | $iconInfo | — |
| Guidance | $bgGuidanceDefault | $bgGuidanceAccent | — | $iconGuidance | — |

Decorative sets 1-4 (celery/cloud/steel/lavender): each has $bgDecorativeN{Default,Accent}, $textDecorativeN, $iconDecorativeN

## Spacing & Sizing

4px grid: $space0(0) through $space16(64px). Sizes mirror: $size0–$size16.

Common: $space1=icon gaps · $space2=tight · $space3=input padding · $space4=standard/card · $space6=section · $space8=large section

Breakpoint sizes: $bp1(640px) $bp2(768px) $bp3(1024px) $bp4(1280px) for max-width constraints.

## Typography

Fonts: $display (Ginto Nord — headings), $body (Ginto Normal — everything else)
Sizes: $fontSize1(12px) through $fontSize7(32px)
Weights: $regular(400) $bold(500) — ONLY these two. No semibold/medium/light.
Line heights: $lineHeight1(1) through $lineHeight7(1.5). Default: $lineHeight2(1.25).
Letter spacing: $letterSpacing0(0) $letterSpacing1(0.3px, default) $letterSpacing2(0.5px)

## Shadows, Radii, Z-Index

Shadows: $focus (double ring) · $inputFocus (single ring) · $shadow1-4 (elevation) · $drastic (heavy)
Radii: $radius1(4px) $radius2(8px) $radius3(16px) $radiusMax(pill)
Z-index: $layer0(0) · $layer1(10000) · $layer2(20000) · $layer3(30000) · $layer4(40000) · $layerMax
Border widths: $borderWidth0(0) $borderWidth1(1px) $borderWidth2(2px) $borderWidth3(4px)

## Cross-Scale References

In shadow/border strings, reference across scales:
- `boxShadow: '0 0 0 2px $colors$bgDefault'`
- `border: '$borderWidths$borderWidth1 solid $borderDefault'`

## Anti-Patterns

- DON'T: $grayscale0 → DO: $bgDefault
- DON'T: '#1B1F23' → DO: $textDefault
- DON'T: padding: '16px' → DO: p: '$space4'
- DON'T: opacity: 0.4 for disabled → DO: $bgActionPrimaryDisabled
- DON'T: mix semantic groups ($bgSuccessDefault + $textCritical)
- DON'T: fontWeight: 600 → only $regular(400) and $bold(500) exist

> Token lookup tables: see token-tables.md reference
```

### token-tables.md (~6.5KB target)

```markdown
# Design Token Tables

> Compact lookup for all ~97 functional tokens + scales. For rules and decision guides, see the design-tokens skill.

## Raw Palette (theme creation only — never in component code)

Grayscale: 0 #FFF · 030 #FAFAFA · 100 #EFF0F0 · 200 #E2E3E3 · 300 #C6C7C8 · 400 #B6B7B8 · 600 #8D8F91 · 700 #656567 · 800 #545759 · 900 #1B1F23 · 1000 #000
  Opacity variants: 200_40 · 800_40 · 900_08/12/16/24/40 · 1000_50

Yellow: 100 #FFFDE5 · 200 #FFF8B3 · 300 #FFF382 · 300_40 rgba(255,243,130,.4) · 500 #FADF65 · 600 #FFE600 · 700 #F9D100
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

## $bg — Surfaces

$bgDefault #FFF →dark #1B1F23
$bgAccentSubtle #FAFAFA
$bgAccent #EFF0F0 (cards, sections)
$bgAccentDark #E2E3E3
$bgPlaceholder #E2E3E3 (skeleton states)
$bgPlaceholderAlt #C6C7C8
$bgOverlay rgba(0,0,0,.5) (modal backdrop)
$bgTooltip #000
$bgBrand #FFF382 →dark rgba(255,243,130,.4)
$bgInverted #1B1F23
$bgInvertedDisabled #8D8F91
$bgHighlighted #CEE5FD (search highlight)

## $bg — State Progressions (Default → Hover → Pressed → Disabled)

Primary action: $bgActionPrimary #FFF382 → Hover #FFE600 → Pressed #F9D100 → Disabled rgba(255,243,130,.4)
Secondary action: $bgActionSecondary #E2E3E3 → Hover #C6C7C8 → Pressed #8D8F91 → Disabled rgba(226,227,227,.4)
Basic action: $bgActionBasic #FFF →dark #1B1F23 → Hover #EFF0F0 → Pressed #E2E3E3
Row: $bgRow #FFF →dark #1B1F23 → Hover #EFF0F0 → Pressed #E2E3E3 | Selected #E2E3E3 → SelectedHover #E2E3E3 → SelectedPressed #C6C7C8
Toggle: $bgToggleDefault #FFF → Hover #E2E3E3 → Pressed #C6C7C8 → Selected #1B1F23

## $bg — Semantic Status

$bgSuccessDefault #D8EFE4 · $bgSuccessAccent #9FD6BC
$bgCriticalDefault #FFD7DE · $bgCriticalAccent #FF9CAC
$bgWarningDefault #FFE1A9 →dark #E04800 · $bgWarningAccent #FFA175 →dark #AD3800
$bgInformationalDefault #F9F7F0 →dark #7F2801 · $bgInformationalAccent #D1BAB0
$bgGuidanceDefault #FBF3FF · $bgGuidanceAccent #834F8A

## $bg — Decorative

Set 1 (celery): $bgDecorative1Default #E2FA9F · Accent #BDD185
Set 2 (cloud): $bgDecorative2Default #E3F0F4 · Accent #82C8D2
Set 3 (steel): $bgDecorative3Default #E7F2FE · Accent #CEE5FD
Set 4 (lavender): $bgDecorative4Default #EDC6ED · Accent #C878D1

Gradients: $bgGradientMagic linear-gradient(90deg, lavender → steel) · $bgGradientMagicFallback #EDC6ED

## $text — Text Colors

$textDefault #1B1F23 →dark #FFF
$textSubdued #656567
$textDisabled rgba(27,31,35,.4)
$textInverted #FFF →dark #1B1F23
$textLink #1B1F23 →dark #FFF
$textHover #0074E0
$textPressed #005AAD
$textSelectedToggle #1B1F23
$textSuccess #30855D
$textWarning #AD3800
$textCritical #B3283E
$textInformational #7F2801
$textDecorative1 #617030 · 2 #2A4A50 · 3 #3E454C · 4 #58495B

## $icon — Icon Colors

$iconDefault #1B1F23
$iconSubdued #8D8F91
$iconDisabled rgba(27,31,35,.4)
$iconInverted #FFF
$iconHovered #0074E0
$iconPressed #005AAD
$iconSuccess #3AA372
$iconWarning #E04800
$iconCritical #ED3553
$iconInfo #AD6848
$iconGuidance #834F8A
$iconDecorative1 #788554 · 2 #55838A · 3 #67737E · 4 #834F8A

## $border — Border Colors

$borderDefault #E2E3E3
$borderLoud #C6C7C8
$borderVisualization #8D8F91
$borderInverted #FFF
$borderInput #545759 → Hover #000 → Success #3AA372 → Error #ED3553 → Disabled rgba(84,87,89,.4)
$borderActionBasic #C6C7C8 · Disabled rgba(84,87,89,.4)
$borderFocus #1B1F23
$borderSelectedToggle #000

## Dark Theme Overrides (~13 tokens that change)

$bgDefault #FFF→#1B1F23 · $bgActionBasic #FFF→#1B1F23 · $bgBrand #FFF382→rgba(255,243,130,.4)
$bgRow #FFF→#1B1F23 · $bgRowHover #EFF0F0→#545759 · $bgRowSelected/#Pressed #E2E3E3→#656567
$bgWarningDefault #FFE1A9→#E04800 · $bgWarningAccent #FFA175→#AD3800
$bgInformationalDefault #F9F7F0→#7F2801
$textDefault #1B1F23→#FFF · $textInverted #FFF→#1B1F23 · $textLink #1B1F23→#FFF

## Space Scale (4px grid)

$space0(0) · 1(4) · 2(8) · 3(12) · 4(16) · 5(20) · 6(24) · 7(28) · 8(32) · 9(36) · 10(40) · 11(44) · 12(48) · 13(52) · 14(56) · 15(60) · 16(64px)

Size scale: identical values ($size0–$size16). Also $bp1(640) $bp2(768) $bp3(1024) $bp4(1280) for max-width.

## Typography

Fonts: $display (Ginto Nord) · $body (Ginto Normal)
Sizes: $fontSize1(12px/.75rem) · 2(14px/.875rem) · 3(16px/1rem) · 4(20px/1.25rem) · 5(24px/1.5rem) · 6(28px/1.75rem) · 7(32px/2rem)
Weights: $regular(400) · $bold(500) — no others exist
Line heights: $lineHeight1(1) · 2(1.25) · 3(1.285) · 4(1.333) · 5(1.4) · 6(1.428) · 7(1.5)
Letter spacing: $letterSpacing0(0) · 1(0.3px, global default) · 2(0.5px)

### Heading variant → token

| Variant | fontSize | lineHeight |
|---------|----------|------------|
| page | $fontSize7 (32px) | $lineHeight1 (1) |
| xl | $fontSize6 (28px) | $lineHeight1 (1) |
| lg | $fontSize5 (24px) | $lineHeight1 (1) |
| md | $fontSize4 (20px) | $lineHeight2 (1.25) |
| sm | $fontSize3 (16px) | $lineHeight2 (1.25) |
| subheading | $fontSize1 (12px) | $lineHeight2 (1.25) |

All Heading variants use $display font + $bold weight.

### Text variant → token

| Variant | fontSize | lineHeight |
|---------|----------|------------|
| lede | $fontSize4 (20px) | $lineHeight5 (1.4) |
| body* | $fontSize3 (16px) | $lineHeight5 (1.4) |
| caption | $fontSize2 (14px) | $lineHeight5 (1.4) |
| micro | $fontSize1 (12px) | $lineHeight5 (1.4) |

All Text variants use $body font + $regular weight.

### Typography color prop → token

default→$textDefault · subdued→$textSubdued · inverted→$textInverted · success→$textSuccess · warning→$textWarning · critical→$textCritical · info→$textInformational · decorative1-4→$textDecorative1-4

## Radii

$radius1(4px) · $radius2(8px) · $radius3(16px) · $radiusMax(9999px/pill)

## Border Widths

$borderWidth0(0) · $borderWidth1(1px) · $borderWidth2(2px) · $borderWidth3(4px)

## Shadows

$focus: 0 0 0 2px bgDefault, 0 0 0 4px borderFocus (double ring — buttons/cards)
$inputFocus: 0 0 0 1px borderFocus (single ring — form inputs)
$shadow1: 4px/12px 8% opacity (subtle lift)
$shadow2: 4px/16px 12% (cards, dropdowns)
$shadow3: 6px/20px 16% (popovers)
$shadow4: 10px/25px 24% (dialogs, drawers)
$drastic: 8px/16px 25% (heavy emphasis)

## Z-Index

$layer0(0) · $layer1(10000) · $layer2(20000) · $layer3(30000) · $layer4(40000) · $layerMax(2147483647)
10,000 gaps between layers for intermediate stacking.

## Breakpoints (min-width, mobile-first)

@bp1(640px) · @bp2(768px) · @bp3(1024px) · @bp4(1280px)

> For responsive CSS patterns, see stitches-patterns skill.
```

---

## 3.2 stitches-patterns

### SKILL.md (~1.8KB target)

```markdown
---
name: stitches-patterns
description: >
  Picnic-specific Stitches CSS-in-JS patterns: custom utilities, responsive design,
  variants system, css prop composition. Use when creating styled components, applying
  responsive styles, using focusVisible/defaultTransition/maxLines/safariOnly, or
  typing css objects with PicnicCss.
---

# Stitches Patterns for Picnic

`import { styled, css, PicnicCss, VariantProps } from '@attentive/picnic'`

Picnic uses @stitches/react 1.2.8. All values use $token syntax (see design-tokens skill).

## Custom Utilities

### Spacing shorthands
p/pt/pr/pb/pl/px/py → padding variants. m/mt/mr/mb/ml/mx/my → margin variants.
```tsx
css={{ p: '$space4', mx: 'auto', py: '$space2' }}
```

### focusVisible
Generates :focus/:focus-visible with box-shadow. Use $focus for buttons/cards, $inputFocus for form inputs.
```tsx
focusVisible: '$focus'     // double ring: 2px white + 4px dark
focusVisible: '$inputFocus' // single 1px ring
```

### defaultTransition
0.2s ease timing for specified properties. Standard Picnic motion — never override timing.
```tsx
defaultTransition: ['background-color', 'box-shadow', 'color']
```

### maxLines
CSS line clamp with ellipsis.
```tsx
maxLines: 2  // truncate after 2 lines
```

### Grid utils
```tsx
gridTemplateColumnsRepeat: 3  // → repeat(3, minmax(0, 1fr))
gridColumnSpan: 2             // → grid-column: span 2
```

### safariOnly
Safari-specific CSS via media query hack. Use sparingly.
```tsx
safariOnly: { WebkitOverflowScrolling: 'touch' }
```

### listStyleOverride
```tsx
listStyleOverride: 'unstyled'  // removes list styles
```

## Responsive Design

Breakpoints (min-width, mobile-first): @bp1(640px) @bp2(768px) @bp3(1024px) @bp4(1280px)

In css prop or styled():
```tsx
css={{ flexDirection: 'column', '@bp2': { flexDirection: 'row' } }}
```

Array responsive via responsiveRule() — maps [base, @bp1, @bp2, @bp3]:
```tsx
<Grid columns={[1, 2, 3, 4]}>  // 1 col mobile → 4 col desktop
```

ResponsiveValue<T>: `number | number[]`

useBreakpoints() hook: `{ atBp1, atBp2, atBp3, atBp4 }` booleans. Prefer CSS-level (@bp) over JS-level when possible.

## Variants

```tsx
variants: {
  variant: { primary: {...}, secondary: {...} },   // string
  size: { small: {...}, medium: {...} },            // size
  disabledVisually: { true: {...}, false: {...} },  // boolean
},
compoundVariants: [
  { variant: 'primary', disabledVisually: true, css: { color: '$textDisabled' } },
],
defaultVariants: { variant: 'primary', size: 'medium' },
```

Extract types: `VariantProps<typeof Component>`

## css Prop Composition

Spread incoming css LAST so consumer overrides win:
```tsx
css={{ mb: '$space1', ...css }}  // correct
css={{ ...css, mb: '$space1' }}  // WRONG — defaults override consumer
```

Cross-scale references in strings:
```tsx
border: '$borderWidths$borderWidth1 solid $borderDefault'
boxShadow: '0 0 0 2px $colors$bgDefault'
```

Shared base styles with custom utils require cast:
```tsx
const BaseStyles = { focusVisible: '$focus', ... } as unknown as PicnicCss;
```

## Theming

usePicnicStyles() at app root — applies global reset + theme.
Themes: theme2021 (light, default), themeDark (~13 color overrides).
createTheme('name', { colors: { ...overrides } }) for custom themes.

## Constraints

- Stitches only — never Tailwind, CSS Modules, className, or plain CSS
- Stack gap is silently stripped — use spacing prop (see layout-primitives)
- Only two focus tokens: $focus (buttons/cards) and $inputFocus (inputs)
- Always use defaultTransition, never custom durations/easings
- Cast shared style objects: `as unknown as PicnicCss` when custom utils appear
- Responsive is mobile-first: base = mobile, @bp overrides up

> Full utility details: see utils-reference.md
```

### utils-reference.md (~3KB target)

```markdown
# Stitches Utils Reference

> Lookup table for all custom Picnic Stitches utilities. For rules and patterns, see stitches-patterns skill.
> All utils available in styled() and css prop. `import { styled, PicnicCss } from '@attentive/picnic'`

## Utility Quick Reference

| Util | Input | Output |
|------|-------|--------|
| p | space token | padding |
| pt/pr/pb/pl | space token | paddingTop/Right/Bottom/Left |
| px | space token | paddingLeft + paddingRight |
| py | space token | paddingTop + paddingBottom |
| m | space token | margin |
| mt/mr/mb/ml | space token | marginTop/Right/Bottom/Left |
| mx | space token / 'auto' | marginLeft + marginRight |
| my | space token | marginTop + marginBottom |
| focusVisible | shadow token | :focus/:focus-visible box-shadow (3 rules) |
| defaultTransition | string[] | transition with 0.2s ease timing |
| gridTemplateColumnsRepeat | number | grid-template-columns: repeat(N, minmax(0, 1fr)) |
| gridColumnSpan | number | grid-column: span N |
| maxLines | number | -webkit-line-clamp + overflow hidden |
| safariOnly | CSS object | @media hack for Safari-only styles |
| listStyleOverride | 'unstyled' | margin:0, padding:0, list-style:none |

## focusVisible Detail

Generates 3 rules from a single declaration:
```
focusVisible: '$focus'
→ &:focus { outline: none; box-shadow: <value> }
→ &:focus:not(:focus-visible) { box-shadow: none }
→ &:focus-visible { box-shadow: <value> }
```

Two tokens: $focus (0 0 0 2px bgDefault, 0 0 0 4px borderFocus) for buttons/cards. $inputFocus (0 0 0 1px borderFocus) for form inputs.

## defaultTransition Detail

Maps array of CSS property names to transition shorthand:
```
defaultTransition: ['background-color', 'box-shadow']
→ transition: background-color .2s ease 0s, box-shadow .2s ease 0s
```

Always 0.2s ease. Never override timing — this is the standard Picnic motion curve.

## responsiveRule() and ResponsiveValue

```tsx
import { responsiveRule } from '@attentive/picnic';
```

Maps a value or array to breakpoint-keyed CSS:
```
responsiveRule('gridTemplateColumnsRepeat', [1, 2, 3, 4])
→ { gridTemplateColumnsRepeat: 1, '@bp1': { gridTemplateColumnsRepeat: 2 }, '@bp2': {...3}, '@bp3': {...4} }
```

ResponsiveValue<T> = T | T[] where array positions = [base, @bp1, @bp2, @bp3]

## useBreakpoints()

```tsx
const { atBp1, atBp2, atBp3, atBp4 } = useBreakpoints();
```

Returns booleans for current viewport. Prefer CSS @bp over JS useBreakpoints() when possible — CSS is SSR-safe and avoids layout shift.

## TypeScript Types

| Type | Purpose |
|------|---------|
| PicnicCss | css prop type — CSS<typeof config> |
| VariantProps<typeof C> | Extract variant props from styled component |
| Theme | Return type of createPicnicTheme |
| PicnicColorsToken | Union of all color tokens (with $) |
| PicnicSpaceToken | Union of all space tokens (with $) |
| PicnicSizesToken | Union of all size tokens (with $) |
| PicnicFontSizesToken | Union of all font size tokens (with $) |
| PicnicShadowsToken | Union of all shadow tokens (with $) |

## Border Shorthand Pattern

```
'$borderWidths$borderWidth1 solid $borderDefault'   // standard 1px border
'$borderWidths$borderWidth2 solid $borderInputError' // emphasized error border
'$borderWidths$borderWidth1 solid transparent'       // invisible spacer border
```

Pattern: '$borderWidths$borderWidthN solid $borderTokenName'

## css Prop Composition

Spread order matters — spread incoming css LAST:
```tsx
// Component internals:
css={{ mb: '$space1', ...css }}     // consumer overrides win
css={{ ...css, mb: '$space1' }}     // WRONG — defaults win
```

Cross-scale in strings: `'0 0 0 2px $colors$bgDefault'` — use $scale$token.
```

---

## 3.3 layout-primitives

### SKILL.md (~1.5KB target)

This is the gold standard compressed skill from the 07-synthesis template, copied verbatim.

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

---

## Size Budget Summary

| Skill | SKILL.md | Reference | Total |
|-------|----------|-----------|-------|
| design-tokens | ~2.2KB | ~6.5KB (token-tables.md) | ~8.7KB |
| stitches-patterns | ~1.8KB | ~3KB (utils-reference.md) | ~4.8KB |
| layout-primitives | ~1.5KB | none | ~1.5KB |
| **Foundation Total** | **~5.5KB** | **~9.5KB** | **~15KB** |

Compare to Proposal 03 targets (~32.8KB) — **54% reduction** achieved through:
- Compact inline format replacing verbose tables
- Dropping name-restating descriptions
- Eliminating cross-file duplication
- Never explaining generic Stitches/CSS/React concepts
- One canonical home per concept
