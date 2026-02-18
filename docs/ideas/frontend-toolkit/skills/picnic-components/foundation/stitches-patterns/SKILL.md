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
p/pt/pr/pb/pl/px/py — padding variants. m/mt/mr/mb/ml/mx/my — margin variants.
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
gridTemplateColumnsRepeat: 3  // repeat(3, minmax(0, 1fr))
gridColumnSpan: 2             // grid-column: span 2
```

### safariOnly
Safari-specific CSS via media query hack. Use sparingly.
```tsx
safariOnly: { WebkitOverflowScrolling: 'touch' }
```

### listStyleOverride
```tsx
listStyleOverride: 'unstyled'  // removes list styles (margin:0, padding:0, list-style:none)
```

## Responsive Design

Breakpoints (min-width, mobile-first): @bp1(640px) @bp2(768px) @bp3(1024px) @bp4(1280px)

In css prop or styled():
```tsx
css={{ flexDirection: 'column', '@bp2': { flexDirection: 'row' } }}
```

Array responsive via responsiveRule() — maps [base, @bp1, @bp2, @bp3]:
```tsx
<Grid columns={[1, 2, 3, 4]}>  // 1 col mobile, 4 col desktop
```

ResponsiveValue<T>: `T | T[]`

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
