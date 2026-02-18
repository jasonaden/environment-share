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
  &:focus { outline: none; box-shadow: <value> }
  &:focus:not(:focus-visible) { box-shadow: none }
  &:focus-visible { box-shadow: <value> }
```

Two tokens: $focus (0 0 0 2px bgDefault, 0 0 0 4px borderFocus) for buttons/cards. $inputFocus (0 0 0 1px borderFocus) for form inputs.

## defaultTransition Detail

Maps array of CSS property names to transition shorthand:
```
defaultTransition: ['background-color', 'box-shadow']
  transition: background-color .2s ease 0s, box-shadow .2s ease 0s
```

Always 0.2s ease. Never override timing — this is the standard Picnic motion curve.

## responsiveRule() and ResponsiveValue

```tsx
import { responsiveRule } from '@attentive/picnic';
```

Maps a value or array to breakpoint-keyed CSS:
```
responsiveRule('gridTemplateColumnsRepeat', [1, 2, 3, 4])
  { gridTemplateColumnsRepeat: 1, '@bp1': { gridTemplateColumnsRepeat: 2 }, '@bp2': {...3}, '@bp3': {...4} }
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
