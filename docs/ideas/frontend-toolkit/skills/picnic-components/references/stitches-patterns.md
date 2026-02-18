# Stitches Patterns Reference

Picnic uses `@stitches/react` 1.2.8 for all CSS-in-JS styling. This reference documents the Stitches APIs and patterns specific to the Picnic design system, with real code drawn from the library source.

---

## Table of Contents

1. [styled() API](#styled-api)
2. [css Prop Patterns](#css-prop-patterns)
3. [Custom Utils Reference](#custom-utils-reference)
4. [Responsive Design](#responsive-design)
5. [Theming](#theming)

---

## styled() API

### Configuration Origin

All Stitches APIs originate from the `createStitches()` call in `stitches.config.ts`:

```ts
import { createStitches, CSS, VariantProps } from '@stitches/react';

const config = createStitches({
  prefix: 'picnic-',
  theme: theme2021Scales,
  media,
  utils,
});

const { styled, css, keyframes, globalCss, getCssText, createTheme } = config;

type PicnicCss = CSS<typeof config>;
```

Key exports from `stitches.config.ts`:
- `styled` — create styled components
- `css` — create reusable style objects
- `keyframes` — define CSS keyframes
- `globalCss` — apply global styles
- `PicnicCss` — TypeScript type for css prop objects
- `VariantProps` — extract variant types from a styled component

Import these from `@attentive/picnic` or directly from `../../stitches.config` within the library:

```ts
import { styled, PicnicCss, VariantProps } from '@attentive/picnic';
```

---

### Creating Components with styled()

Use `styled()` to create a component with base styles and optional variants. Pass an HTML tag string or an existing component as the first argument, and a style object as the second.

#### Basic styled component

The simplest form — a div with Picnic token styles. From `Box.tsx`:

```ts
import { styled } from '../../stitches.config';

export const Box = styled('div', {});
export type BoxProps = React.ComponentProps<typeof Box>;

Box.displayName = 'Box';
```

Box is a blank styled div. All Picnic tokens and custom utils are available through its `css` prop.

#### Styled component with base styles

From `Card.tsx` — a styled div with token-based defaults:

```ts
import { styled } from '../../stitches.config';

const Card = styled('div', {
  position: 'relative',
  border: '$borderWidths$borderWidth1 solid $borderDefault',
  borderRadius: '$radius2',
  defaultTransition: ['transform', 'border', 'box-shadow', 'color'],
  backgroundColor: '$bgDefault',
  boxShadow: '$shadow1',
  padding: '$space8',
  '&:focus': {
    boxShadow: '$focus',
  },
  transform: 'translateZ(0)',
  // variants defined separately below...
});
```

Note these patterns:
- Token references use `$` prefix: `'$bgDefault'`, `'$radius2'`, `'$space8'`
- Cross-scale border shorthand: `'$borderWidths$borderWidth1 solid $borderDefault'`
- Custom utils mixed with standard CSS: `defaultTransition: [...]`
- Pseudo-class selectors: `'&:focus': { ... }`

#### Styled component with complex base styles

From `Button.tsx` — shared base styles extracted to a reusable object:

```ts
import { styled, PicnicCss } from '../../stitches.config';

const ButtonStyles = {
  fontWeight: '$bold',
  lineHeight: '$lineHeight7',
  borderRadius: '$radius1',
  borderStyle: 'solid',
  borderWidth: '$borderWidth1',
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  verticalAlign: 'middle',
  justifyContent: 'center',
  textAlign: 'center',
  cursor: 'pointer',
  outline: 'none',
  userSelect: 'none',
  backgroundColor: 'transparent',
  appearance: 'none',
  textDecoration: 'none',

  defaultTransition: ['box-shadow'],
  focusVisible: '$focus',

  '&:disabled': {
    cursor: 'not-allowed',
  },
} as unknown as PicnicCss;

const ButtonPrimitive = styled('button', {
  ...ButtonStyles,
  variants: { /* ... */ },
});
```

Pattern: extract base styles to a const when sharing between components (Button and IconButton share `ButtonStyles`). The `as unknown as PicnicCss` cast works around Stitches typing limitations with custom utils.

---

### Extending Components

Use `styled()` with an existing component as the first argument to extend it:

```ts
import { Icon } from '../Icon';

const StyledButtonIcon = styled(Icon, {
  display: 'block',
  margin: '0 auto',

  variants: {
    size: {
      extraSmall: {
        width: '$size4 !important',
        height: '$size4 !important',
      },
      small: {
        width: '$size5 !important',
        height: '$size5 !important',
      },
      medium: {
        width: '$size6 !important',
        height: '$size6 !important',
      },
      large: {
        width: '$size7 !important',
        height: '$size7 !important',
      },
    },
  },
});
```

From `IconButton.tsx`. This wraps `Icon` with additional layout styles and a `size` variant that maps to Picnic size tokens.

#### Extending styled HTML elements

From `Banner.tsx` — extending a basic img tag:

```ts
const StyledImage = styled('img', {
  width: '$size12',
  margin: '0 $space7 0 $space3',
});
```

---

### Variants

Variants define named style options for a component. They become props on the component.

#### Basic variants

From `Card.tsx`:

```ts
const Card = styled('div', {
  // ...base styles...
  variants: {
    interactive: {
      false: {},
      true: {
        '&:hover': {
          textDecoration: 'none',
          cursor: 'pointer',
          boxShadow: '$shadow3',
          transform: 'translateY(-2px)',
        },
        '&:active': {
          textDecoration: 'none',
          cursor: 'pointer',
          boxShadow: '$shadow1',
          transform: 'translateY(2px)',
        },
      },
    },
    active: {
      false: {},
      true: {
        border: '$borderWidths$borderWidth1 solid $borderSelectedToggle',
      },
    },
  },
  defaultVariants: {
    interactive: false,
    active: false,
  },
});
```

Usage:

```tsx
<Card interactive>Clickable card with hover/press effects</Card>
<Card active>Card with selected border</Card>
<Card interactive active>Both interactive and selected</Card>
```

#### Multi-value string variants

From `Button.tsx` — the `variant` prop has multiple named options:

```ts
variants: {
  variant: {
    primary: {
      color: '$textDefault',
      backgroundColor: '$bgActionPrimary',
      borderColor: '$bgActionPrimary',
      '&:hover:not([disabled]):not(:active)': {
        backgroundColor: '$bgActionPrimaryHover',
        borderColor: '$bgActionPrimaryHover',
      },
      '&:active:not([disabled])': {
        backgroundColor: '$bgActionPrimaryPressed',
        borderColor: '$bgActionPrimaryPressed',
      },
    },
    secondary: {
      color: '$textDefault',
      backgroundColor: '$bgActionBasic',
      borderColor: '$borderActionBasic',
      '&:hover:not([disabled])': {
        backgroundColor: '$bgActionBasicHover',
        borderColor: '$borderFocus',
      },
      '&:hover:not([disabled]):not(:active)': {
        backgroundColor: '$bgActionBasicHover',
        borderColor: '$borderFocus',
      },
      '&:active:not([disabled])': {
        backgroundColor: '$bgActionBasicPressed',
        borderColor: '$borderFocus',
      },
    },
    subdued: {
      color: '$textDefault',
      backgroundColor: 'transparent',
      textDecoration: 'underline',
      p: '$space0',
      border: 0,
      '&:hover:not([disabled]):not(:active)': {
        color: '$textHover',
      },
      '&:active:not([disabled])': {
        color: '$textPressed',
      },
    },
    inverted: {
      color: '$textInverted',
      backgroundColor: 'transparent',
      borderColor: '$bgDefault',
      '&:hover:not([disabled]):not(:active)': {
        color: '$textDefault',
        backgroundColor: '$borderInverted',
        borderColor: '$borderInverted',
      },
      '&:active:not([disabled])': {
        color: '$textDefault',
        backgroundColor: '$borderLoud',
        borderColor: '$borderLoud',
      },
    },
    'legacy-inverted': {
      color: '$textInverted',
      backgroundColor: '$bgInverted',
      borderColor: '$bgInverted',
      '&:hover:not([disabled]):not(:active)': {
        backgroundColor: '$grayscale1000',
        borderColor: '$grayscale1000',
      },
      '&:active:not([disabled])': {
        backgroundColor: '$grayscale1000',
        borderColor: '$grayscale1000',
      },
    },
  },
},
```

Usage:

```tsx
<Button variant="primary">Save</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="subdued">Learn More</Button>
<Button variant="inverted">On Dark Background</Button>
```

#### Size variants

From `Button.tsx`:

```ts
size: {
  small: { minHeight: '$size9', py: '$space1', px: '$space4', fontSize: '$fontSize2' },
  medium: { minHeight: '$size12', py: '$space1', px: '$space6', fontSize: '$fontSize3' },
  large: { minHeight: '$size13', py: '$space1', px: '$space6', fontSize: '$fontSize4' },
},
```

From `TextInput.tsx`:

```ts
size: {
  small: { minHeight: '$size9', fontSize: '$fontSize2', padding: '0 $space3' },
  normal: { minHeight: '$size12', fontSize: '$fontSize3', padding: '0 $space4' },
},
```

Note the naming difference: Button uses `small | medium | large`, TextInput uses `small | normal`.

#### State variants

From `TextInput.tsx`:

```ts
state: {
  normal: { borderColor: '$borderInput' },
  error: { '&:not(:focus)': { borderColor: '$borderInputError' } },
},
```

Usage:

```tsx
<TextInput state="error" />
```

#### Boolean variants

From `Button.tsx` — boolean variants use `true`/`false` keys:

```ts
disabledVisually: {
  true: {},
  false: {},
},
```

When a boolean variant has `true: {}` as an empty object, it acts as a marker for compound variants. Usage:

```tsx
<ButtonPrimitive disabledVisually={true} variant="primary" />
```

#### Align variants (reusable pattern)

From `Table.tsx` — an alignment pattern reused across header and body cells:

```ts
const cellAlignVariants = {
  left: {
    justifyContent: 'flex-start',
  },
  center: {
    justifyContent: 'center',
  },
  right: {
    justifyContent: 'flex-end',
  },
};

const BodyCellPrimitive = styled('div', {
  // ...base styles...
  variants: {
    align: cellAlignVariants,
  },
  defaultVariants: {
    align: 'left',
  },
});

const HeaderCellPrimitive = styled('div', {
  // ...base styles...
  variants: {
    align: cellAlignVariants,
  },
  defaultVariants: {
    align: 'left',
  },
});
```

Pattern: extract variant objects to a shared const when multiple styled components need the same variant definitions.

#### Banner variant (semantic color mapping)

From `Banner.tsx`:

```ts
const BannerRoot = styled('div', {
  display: 'flex',
  alignItems: 'center',
  padding: '$space3 $space4',
  borderRadius: '$radius2',
  border: '$borderWidths$borderWidth1 solid transparent',
  variants: {
    variant: {
      neutral: {
        backgroundColor: '$bgDefault',
        borderColor: '$borderLoud',
      },
      info: {
        backgroundColor: '$bgInformationalDefault',
      },
      warning: {
        backgroundColor: '$bgWarningDefault',
      },
      error: {
        backgroundColor: '$bgCriticalDefault',
      },
      success: {
        backgroundColor: '$bgSuccessDefault',
      },
      guidance: {
        backgroundColor: '$bgGuidanceDefault',
      },
    },
  },
  defaultVariants: {
    variant: 'info',
  },
});
```

Pattern: semantic variants map to functional background tokens. Each variant name corresponds to a `$bg*Default` token.

---

### Compound Variants

Compound variants apply styles when specific variant combinations are active. Defined as an array of objects in the `compoundVariants` key.

From `Button.tsx` — disabled styles per variant:

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
  {
    variant: 'subdued',
    disabledVisually: true,
    css: {
      color: '$textDisabled',
    },
  },
  {
    variant: 'subdued',
    size: 'small',
    css: {
      padding: '0 !important',
    },
  },
  {
    variant: 'subdued',
    size: 'medium',
    css: {
      padding: '0 !important',
    },
  },
  {
    variant: 'inverted',
    disabledVisually: true,
    css: {
      color: '$textSubdued',
      borderColor: '$textSubdued',
    },
  },
  {
    variant: 'legacy-inverted',
    disabledVisually: true,
    css: {
      backgroundColor: '$bgInvertedDisabled',
      borderColor: '$bgInvertedDisabled',
    },
  },
],
```

Each compound variant object has:
- One or more variant conditions (e.g., `variant: 'primary'` + `disabledVisually: true`)
- A `css` object with the styles to apply when all conditions match

From `IconButton.tsx` — same pattern for icon button disabled states:

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
  {
    variant: 'subdued',
    disabledVisually: true,
    css: {
      color: '$textDisabled',
    },
  },
  {
    variant: 'inverted',
    disabledVisually: true,
    css: {
      color: '$textSubdued',
      borderColor: '$textSubdued',
    },
  },
],
```

Pattern: use compound variants to handle disabled + variant combinations. Each visual variant needs its own disabled token mapping.

---

### Default Variants

Specify default values for variants with `defaultVariants`:

From `Button.tsx`:

```ts
defaultVariants: {
  disabledVisually: false,
  variant: 'primary',
  size: 'medium',
},
```

From `TextInput.tsx`:

```ts
defaultVariants: {
  state: 'normal',
  size: 'normal',
},
```

From `Card.tsx`:

```ts
defaultVariants: {
  interactive: false,
  active: false,
},
```

From `IconButton.tsx` — note the different default variant vs Button:

```ts
defaultVariants: {
  disabledVisually: false,
  variant: 'subdued',
  size: 'medium',
},
```

Button defaults to `variant: 'primary'`, but IconButton defaults to `variant: 'subdued'`. Always check the specific component's defaults.

---

### VariantProps Type Extraction

Use `VariantProps<typeof Component>` to extract the variant prop types from a styled component:

```ts
import { VariantProps } from '@attentive/picnic';

type ButtonVariants = React.ComponentProps<typeof ButtonPrimitive>['variant'];
```

For full variant props:

```ts
type CardVariants = VariantProps<typeof Card>;
// { interactive?: boolean; active?: boolean }
```

Use this when wrapping a styled primitive with a higher-level component:

```ts
interface ButtonProps
  extends Omit<
    React.ComponentProps<typeof ButtonPrimitive>,
    'disabledVisually' | 'variant'
  > {
  variant?: ButtonVariants | 'basic';
  loading?: boolean;
}
```

Pattern: `Omit` internal-only variants (like `disabledVisually`) from the public interface, then re-declare with the desired type.

---

### PicnicCss Type

`PicnicCss` is the type for all css prop objects. It understands Picnic tokens, custom utils, and media queries:

```ts
import { PicnicCss } from '@attentive/picnic';

type PicnicCss = CSS<typeof config>;
```

Use it to type css objects:

```ts
const textInputStyles: PicnicCss = {
  backgroundColor: '$bgDefault',
  border: '$borderWidths$borderWidth1 solid $borderInput',
  borderRadius: '$radius1',
  color: '$textDefault',
  focusVisible: '$inputFocus',
  '&:disabled': {
    color: '$textDisabled',
    borderColor: '$borderInputDisabled',
    cursor: 'not-allowed',
  },
};
```

Use it to type component props that accept css:

```ts
interface BannerProps {
  variant?: 'error' | 'info' | 'warning' | 'success' | 'neutral' | 'guidance';
  css?: PicnicCss;
}
```

The `as unknown as PicnicCss` cast is sometimes needed when using custom utils in style objects due to Stitches typing limitations:

```ts
const ButtonStyles = {
  defaultTransition: ['box-shadow'],
  focusVisible: '$focus',
  // ...
} as unknown as PicnicCss;
```

---

## css Prop Patterns

Every Picnic component that extends `styled()` accepts a `css` prop typed as `PicnicCss`. Use it for inline style overrides.

### Token Usage in css Objects

Reference any Picnic design token with the `$` prefix:

```tsx
// Background tokens
<Box css={{ backgroundColor: '$bgDefault' }} />
<Box css={{ backgroundColor: '$bgAccent' }} />
<Box css={{ backgroundColor: '$bgActionPrimary' }} />

// Text color tokens
<Text css={{ color: '$textSubdued' }} />
<Text css={{ color: '$textCritical' }} />

// Space tokens
<Box css={{ padding: '$space4', margin: '$space2' }} />
<Box css={{ p: '$space6', mx: '$space4' }} />

// Size tokens
<Box css={{ width: '$size12', height: '$size16' }} />
<Button css={{ minWidth: '$size16' }} />

// Font tokens
<Box css={{ fontFamily: '$body', fontSize: '$fontSize3', fontWeight: '$bold' }} />

// Radius tokens
<Box css={{ borderRadius: '$radius2' }} />

// Shadow tokens
<Box css={{ boxShadow: '$shadow2' }} />
<Box css={{ boxShadow: '$focus' }} />

// Z-index tokens
<Box css={{ zIndex: '$layer2' }} />
```

### String Token Interpolation

Use token references directly in CSS string values:

```tsx
// Space tokens in shorthand padding
<Box css={{ padding: '$space3 $space4' }} />

// From Banner:
<BannerRoot css={{ padding: '$space3 $space4' }} />

// Space tokens in shorthand margin
<StyledImage css={{ margin: '0 $space7 0 $space3' }} />
```

### Nested Selectors

Use the `&` parent selector for descendant and child styling:

```tsx
// Direct child selector
<Box css={{
  '& > div': { color: '$textSubdued' },
}} />

// From Table.tsx — styling children by role:
<Box css={{
  display: 'contents',
  '& > [role=cell]': { cursor: 'pointer', borderTop: focusableRowBorderCss },
  '& > [role=cell]:first-child': { borderLeft: focusableRowBorderCss },
  '& > [role=cell]:last-child': { borderRight: focusableRowBorderCss },
  '&:hover > [role=cell]': { backgroundColor: '$bgRowHover' },
  '&:focus-within > [role=cell]': {
    borderColor: '$borderFocus',
    backgroundColor: '$bgRowHover',
  },
}} />

// From Table HeaderCellFocusWrapper — nested data attribute selectors:
const HeaderCellFocusWrapper = styled('div', {
  display: 'flex',
  '&:hover': { color: '$textHover', cursor: 'pointer' },
  '&:focus': { color: '$textDefault' },
  '&:hover:focus': { color: '$textHover' },
  '&:hover > [data-sort-icon], &:focus > [data-sort-icon]': { visibility: 'visible' },
  focusVisible: '$focus',
});
```

### Pseudo-Classes

Standard CSS pseudo-classes work in style objects:

```tsx
// Hover with disabled guard — from Button:
'&:hover:not([disabled]):not(:active)': {
  backgroundColor: '$bgActionPrimaryHover',
  borderColor: '$bgActionPrimaryHover',
},

// Active with disabled guard — from Button:
'&:active:not([disabled])': {
  backgroundColor: '$bgActionPrimaryPressed',
  borderColor: '$bgActionPrimaryPressed',
},

// Enabled-only hover — from IconButton:
'&:hover:enabled': {
  backgroundColor: '$bgActionPrimaryHover',
},

// Disabled state — from Button:
'&:disabled': {
  cursor: 'not-allowed',
},

// Focus-visible (without using the util) — from TextInput:
'&:hover:enabled:not(:focus-visible)': {
  borderColor: '$borderInputHover',
},
```

### Pseudo-Elements

```tsx
// Placeholder styling — from TextInput:
'&::placeholder': {
  color: '$textSubdued',
  opacity: 1,
},

// Disabled placeholder — from TextInput:
'&:disabled': {
  '&::placeholder': {
    color: '$textDisabled',
  },
},
```

### Media Queries Inline

Use `@bp1` through `@bp4` in css prop objects:

```tsx
<Box css={{
  fontSize: '$fontSize2',
  '@bp1': { fontSize: '$fontSize3' },
  '@bp2': { fontSize: '$fontSize4' },
  '@bp3': { fontSize: '$fontSize5' },
}} />

<Box css={{
  display: 'block',
  '@bp2': { display: 'flex' },
}} />

<Box css={{
  gridTemplateColumns: '1fr',
  '@bp2': { gridTemplateColumns: 'repeat(2, 1fr)' },
  '@bp3': { gridTemplateColumns: 'repeat(3, 1fr)' },
}} />
```

Each breakpoint is min-width (mobile-first):
- `@bp1` — `(min-width: 640px)`
- `@bp2` — `(min-width: 768px)`
- `@bp3` — `(min-width: 1024px)`
- `@bp4` — `(min-width: 1280px)`

### Cross-Scale Token References

When referencing a token from a different scale in a string value (e.g., colors in a box-shadow), use `$colors$tokenName`:

From `theme-2021.ts` shadows:

```ts
shadows: {
  focus: '0 0 0 2px $colors$bgDefault, 0 0 0 4px $colors$borderFocus',
  inputFocus: '0 0 0 1px $colors$borderFocus',
  drastic: '0 8px 16px 0 rgba(0, 48, 45, 0.25)',
  shadow1: '0px 4px 12px 0px $colors$grayscale900_08',
  shadow2: '0 4px 16px 0 $colors$grayscale900_12',
  shadow3: '6px 6px 20px 4px $colors$grayscale900_16',
  shadow4: '0 10px 25px 6px $colors$grayscale900_24',
},
```

The pattern is `$<scale>$<token>`:
- `$colors$bgDefault` — reference `bgDefault` from the `colors` scale
- `$colors$borderFocus` — reference `borderFocus` from the `colors` scale
- `$colors$grayscale900_08` — reference `grayscale900_08` from the `colors` scale

Use this in inline css when composing shadows or borders that need color tokens:

```tsx
<Box css={{
  boxShadow: '0 0 0 2px $colors$bgDefault, 0 0 0 4px $colors$borderFocus',
}} />
```

### Border Shorthand Pattern

Borders combine tokens from `borderWidths` and `colors` scales in a string:

```tsx
// From Card.tsx:
border: '$borderWidths$borderWidth1 solid $borderDefault',

// From Card active variant:
border: '$borderWidths$borderWidth1 solid $borderSelectedToggle',

// From Banner:
border: '$borderWidths$borderWidth1 solid transparent',

// From Table cells:
borderBottom: '$borderWidths$borderWidth1 solid $borderDefault',

// From IconButton:
border: '$borderWidths$borderWidth1 solid transparent',

// From TextInput:
border: '$borderWidths$borderWidth1 solid $borderInput',
```

The pattern: `'$borderWidths$borderWidthN solid $borderTokenName'`

- Use `$borderWidths$borderWidth1` (1px) for standard borders
- Use `$borderWidths$borderWidth2` (2px) for emphasized borders
- Color token is from the `colors` scale (no `$colors$` prefix needed in border shorthand)
- Use `transparent` for invisible borders that maintain layout spacing

### Composing css Props

Pass css overrides to children. Components merge the css prop with their own styles:

From `Banner.tsx` — sub-components accept and spread css:

```tsx
const HeadingComponent: FC<BannerHeadingType> = ({ children, css, ...rest }) => {
  return (
    <Heading variant="sm" color={resolvedColor} css={{ mb: '$space1', ...css }} {...rest}>
      {children}
    </Heading>
  );
};
```

Pattern: spread incoming `css` after default styles so consumer overrides win:

```tsx
// DO: spread css last
css={{ mb: '$space1', ...css }}

// DON'T: spread css first (defaults override consumer)
css={{ ...css, mb: '$space1' }}
```

From the same file, action slot:

```tsx
const ActionComponent: FC<ComponentProps<typeof Box>> = ({ children, css, ...rest }) => {
  return (
    <Box
      css={{ display: 'flex', alignItems: 'center', ml: 'auto', pl: '$space4', ...css }}
      {...rest}
    >
      {children}
    </Box>
  );
};
```

---

## Custom Utils Reference

Picnic registers custom Stitches utils that extend the style API. These are defined in `libs/picnic/src/utils/` and aggregated in `utils/index.ts`:

```ts
import browser from './browser';
import focusVisible from './focus-visible';
import grid from './grid';
import list from './list';
import maxLines from './max-lines';
import space from './space';
import transition from './transition';

export default {
  ...browser,
  ...grid,
  ...list,
  ...space,
  ...transition,
  ...maxLines,
  ...focusVisible,
};
```

All utils are available in any `styled()` call or `css` prop.

---

### Space Utils: Padding

Source: `utils/space.ts`

| Util | Maps To | Description |
|------|---------|-------------|
| `p` | `padding` | All sides |
| `pt` | `paddingTop` | Top only |
| `pr` | `paddingRight` | Right only |
| `pb` | `paddingBottom` | Bottom only |
| `pl` | `paddingLeft` | Left only |
| `px` | `paddingLeft` + `paddingRight` | Horizontal |
| `py` | `paddingTop` + `paddingBottom` | Vertical |

Implementation:

```ts
const p = (value: Stitches.PropertyValue<'padding'>) => ({
  padding: value,
});
const px = (value: Stitches.PropertyValue<'paddingLeft'>) => ({
  paddingLeft: value,
  paddingRight: value,
});
const py = (value: Stitches.PropertyValue<'paddingTop'>) => ({
  paddingTop: value,
  paddingBottom: value,
});
```

Usage examples from Picnic components:

```tsx
// From Button subdued variant:
p: '$space0',

// From Button size variants:
{ minHeight: '$size9', py: '$space1', px: '$space4', fontSize: '$fontSize2' },
{ minHeight: '$size12', py: '$space1', px: '$space6', fontSize: '$fontSize3' },

// In css prop:
<Box css={{ p: '$space4' }} />
<Box css={{ px: '$space6', py: '$space2' }} />
```

### Space Utils: Margin

Source: `utils/space.ts`

| Util | Maps To | Description |
|------|---------|-------------|
| `m` | `margin` | All sides |
| `mt` | `marginTop` | Top only |
| `mr` | `marginRight` | Right only |
| `mb` | `marginBottom` | Bottom only |
| `ml` | `marginLeft` | Left only |
| `mx` | `marginLeft` + `marginRight` | Horizontal |
| `my` | `marginTop` + `marginBottom` | Vertical |

Implementation:

```ts
const m = (value: Stitches.PropertyValue<'margin'>) => ({
  margin: value,
});
const mx = (value: Stitches.PropertyValue<'marginLeft'>) => ({
  marginLeft: value,
  marginRight: value,
});
const my = (value: Stitches.PropertyValue<'marginTop'>) => ({
  marginTop: value,
  marginBottom: value,
});
```

Usage examples from Picnic components:

```tsx
// From Banner Heading:
css={{ mb: '$space1', ...css }}

// From Banner action slot:
css={{ display: 'flex', alignItems: 'center', ml: 'auto', pl: '$space4', ...css }}

// From Banner icon:
css={{ mr: '$space2', lineHeight: '0' }}

// From IconButton dismiss in Banner:
css={{ ml: '$space4' }}

// In css prop:
<Box css={{ mx: 'auto' }} />
<Box css={{ my: '$space4' }} />
```

---

### Grid Utils

Source: `utils/grid.ts`

#### gridTemplateColumnsRepeat

Creates a CSS Grid `grid-template-columns` rule with equal-width columns:

```ts
const gridTemplateColumnsRepeat = (value: number) => ({
  gridTemplateColumns: `repeat(${value}, minmax(0, 1fr))`,
});
```

Usage in `Grid.tsx` with `responsiveRule()`:

```tsx
<Box
  css={merge(
    { display: 'grid' },
    responsiveRule('gridTemplateColumnsRepeat', columns),
    css
  )}
/>
```

Direct usage:

```tsx
<Box css={{ display: 'grid', gridTemplateColumnsRepeat: 3 }} />
// Produces: grid-template-columns: repeat(3, minmax(0, 1fr))

<Box css={{ display: 'grid', gridTemplateColumnsRepeat: 4, gap: '$space4' }} />
```

#### gridColumnSpan

Sets how many columns a grid item spans:

```ts
const gridColumnSpan = (value: number) => ({
  gridColumn: `span ${value}`,
});
```

Usage in `Grid.Cell`:

```tsx
if (colSpan) {
  merge(css, responsiveRule('gridColumnSpan', colSpan));
}
```

Direct usage:

```tsx
<Grid columns={4}>
  <Grid.Cell colSpan={2}>Spans 2 columns</Grid.Cell>
  <Grid.Cell>1 column</Grid.Cell>
  <Grid.Cell>1 column</Grid.Cell>
</Grid>
```

Or in css prop:

```tsx
<Box css={{ gridColumnSpan: 2 }} />
// Produces: grid-column: span 2
```

---

### Transition Util: defaultTransition

Source: `utils/transition.ts`

Creates a CSS transition shorthand for one or more properties with a standard 0.2s ease timing:

```ts
const defaultTransition = (value: string[]) => ({
  transition: value.map((val) => `${val} .2s ease 0s`).join(','),
});
```

Usage from Picnic components:

```tsx
// From Button base styles:
defaultTransition: ['box-shadow'],
// Produces: transition: box-shadow .2s ease 0s

// From Card base styles:
defaultTransition: ['transform', 'border', 'box-shadow', 'color'],
// Produces: transition: transform .2s ease 0s, border .2s ease 0s, box-shadow .2s ease 0s, color .2s ease 0s
```

In css prop:

```tsx
<Box css={{
  defaultTransition: ['background-color', 'color'],
  '&:hover': { backgroundColor: '$bgAccent' },
}} />
```

All transitions use the same 0.2s ease curve. This is the standard Picnic motion timing — do not override the duration or easing.

---

### Focus Util: focusVisible

Source: `utils/focus-visible.ts`

Applies a focus ring using `:focus-visible` with a `:focus` fallback:

```ts
const focusVisible = (value: Stitches.PropertyValue<'boxShadow'>) => {
  return {
    content: 'picnicFocusVisible',
    '&:focus': {
      outline: 'none',
      boxShadow: value,
    },
    '&:focus:not(:focus-visible)': {
      boxShadow: 'none',
    },
    '&:focus-visible': {
      boxShadow: value,
    },
  };
};
```

This generates three rules:
1. `&:focus` — removes outline, applies shadow (keyboard + mouse fallback)
2. `&:focus:not(:focus-visible)` — hides shadow for mouse clicks
3. `&:focus-visible` — shows shadow for keyboard navigation

Usage from Picnic components:

```tsx
// From Button base styles — standard focus ring:
focusVisible: '$focus',
// Uses the $focus shadow: '0 0 0 2px $colors$bgDefault, 0 0 0 4px $colors$borderFocus'

// From TextInput — input-specific focus ring:
focusVisible: '$inputFocus',
// Uses $inputFocus shadow: '0 0 0 1px $colors$borderFocus'

// From Table HeaderCellFocusWrapper:
focusVisible: '$focus',

// From IconButton:
focusVisible: '$focus',
```

Two focus shadow tokens:
- `$focus` — double ring (2px gap + 4px border). Use for buttons, cards, interactive elements.
- `$inputFocus` — single 1px ring. Use for form inputs.

In css prop:

```tsx
<Box css={{ focusVisible: '$focus' }} tabIndex={0} />
```

---

### Text Util: maxLines

Source: `utils/max-lines.ts`

Truncates text to a specified number of lines using CSS line clamping:

```ts
const maxLines = (lines: number) => {
  return {
    display: '-webkit-box',
    '-webkit-box-orient': 'vertical',
    overflow: 'hidden',
    WebkitLineClamp: lines,
  };
};
```

Usage:

```tsx
<Text css={{ maxLines: 2 }}>
  Long text that will be truncated after 2 lines with an ellipsis...
</Text>

<Text css={{ maxLines: 1 }}>Single line truncation</Text>

<Box css={{ maxLines: 3 }}>
  Multi-paragraph content clamped to 3 visible lines
</Box>
```

---

### Browser Util: safariOnly

Source: `utils/browser.ts`

Applies styles that only render in Safari, using a CSS media query hack:

```ts
const safariOnly = (value: {}) => ({
  content: 'picnicSafariOnly',
  '@media not all and (min-resolution:.001dpcm)': {
    '@supports (-webkit-appearance:none)': {
      ...value,
    },
  },
});
```

Usage:

```tsx
<Box css={{
  safariOnly: {
    WebkitOverflowScrolling: 'touch',
  },
}} />

// In a styled component:
const SafariFixedElement = styled('div', {
  position: 'fixed',
  safariOnly: {
    position: '-webkit-sticky',
  },
});
```

Use sparingly — only for Safari-specific rendering bugs.

---

### List Util: listStyleOverride

Source: `utils/list.ts`

Resets list styles. Currently supports one value:

```ts
const listStyleOverride = (value: 'unstyled') => {
  if (value === 'unstyled') {
    return {
      margin: 0,
      padding: 0,
      listStyle: 'none',
    };
  }
  return {};
};
```

Usage:

```tsx
<Box as="ul" css={{ listStyleOverride: 'unstyled' }}>
  <Box as="li">Item 1</Box>
  <Box as="li">Item 2</Box>
</Box>
```

---

### Utils Quick Reference

| Util | Type | Example | Output |
|------|------|---------|--------|
| `p` | space token | `p: '$space4'` | `padding: 16px` |
| `px` | space token | `px: '$space6'` | `padding-left: 24px; padding-right: 24px` |
| `py` | space token | `py: '$space2'` | `padding-top: 8px; padding-bottom: 8px` |
| `m` | space token | `m: '$space0'` | `margin: 0` |
| `mx` | space token | `mx: 'auto'` | `margin-left: auto; margin-right: auto` |
| `my` | space token | `my: '$space4'` | `margin-top: 16px; margin-bottom: 16px` |
| `mt` | space token | `mt: '$space2'` | `margin-top: 8px` |
| `mb` | space token | `mb: '$space1'` | `margin-bottom: 4px` |
| `ml` | space token | `ml: 'auto'` | `margin-left: auto` |
| `mr` | space token | `mr: '$space2'` | `margin-right: 8px` |
| `gridTemplateColumnsRepeat` | number | `gridTemplateColumnsRepeat: 3` | `grid-template-columns: repeat(3, minmax(0, 1fr))` |
| `gridColumnSpan` | number | `gridColumnSpan: 2` | `grid-column: span 2` |
| `defaultTransition` | string[] | `defaultTransition: ['color']` | `transition: color .2s ease 0s` |
| `focusVisible` | shadow token | `focusVisible: '$focus'` | Focus ring via `:focus-visible` |
| `maxLines` | number | `maxLines: 2` | CSS line clamp to 2 lines |
| `safariOnly` | css object | `safariOnly: { ... }` | Safari-only CSS via media query |
| `listStyleOverride` | `'unstyled'` | `listStyleOverride: 'unstyled'` | Reset list styles |

---

## Responsive Design

### Media Configuration

Breakpoints are defined in `media.ts` as min-width media queries:

```ts
type MediaKey = 'bp1' | 'bp2' | 'bp3' | 'bp4';
type MediaToken = `@${Extract<MediaKey, string>}`;

const bpWidths: { [key in MediaKey]: string } = {
  bp1: '640px',
  bp2: '768px',
  bp3: '1024px',
  bp4: '1280px',
};

const media: { [key in MediaKey]: string } = {
  bp1: `(min-width: ${bpWidths.bp1})`,
  bp2: `(min-width: ${bpWidths.bp2})`,
  bp3: `(min-width: ${bpWidths.bp3})`,
  bp4: `(min-width: ${bpWidths.bp4})`,
};
```

| Token | Width | Typical Use |
|-------|-------|-------------|
| `@bp1` | 640px | Small tablets, large phones in landscape |
| `@bp2` | 768px | Tablets |
| `@bp3` | 1024px | Small desktops, tablets in landscape |
| `@bp4` | 1280px | Standard desktops |

All breakpoints are mobile-first (min-width). Styles without a breakpoint apply to all viewport sizes. Breakpoint styles override smaller-viewport styles.

### Using @bp in styled()

Apply responsive styles in `styled()` definitions:

```ts
const ResponsiveCard = styled('div', {
  padding: '$space2',
  '@bp1': {
    padding: '$space4',
  },
  '@bp2': {
    padding: '$space6',
  },
  '@bp3': {
    padding: '$space8',
  },
});
```

### Using @bp in css Prop

Apply responsive styles inline:

```tsx
<Box css={{
  display: 'flex',
  flexDirection: 'column',
  '@bp2': {
    flexDirection: 'row',
  },
}} />

<Heading css={{
  fontSize: '$fontSize4',
  '@bp2': { fontSize: '$fontSize5' },
  '@bp3': { fontSize: '$fontSize6' },
}} />
```

### Using @bp in Variants

Responsive variants are available in `styled()`:

```ts
const ResponsiveLayout = styled('div', {
  variants: {
    layout: {
      stack: {
        display: 'flex',
        flexDirection: 'column',
      },
      row: {
        display: 'flex',
        flexDirection: 'row',
      },
    },
  },
});
```

Apply responsive variants via the `css` prop approach or use the `responsiveRule()` utility.

---

### responsiveRule() Utility

Source: `utils/responsive-props.ts`

Converts an array of values into breakpoint-mapped CSS rules:

```ts
type ResponsiveValue<T> = T | T[];

const responsiveRule = <T>(property: string, value: ResponsiveValue<T>) => {
  if (!Array.isArray(value)) {
    return { [property]: value };
  }

  const mediaTokens = Object.keys(media).map(
    (mediaToken) => `@${mediaToken}`
  ) as MediaToken[];

  const [initial, ...conditions] = value;

  const responsiveStyles = conditions.reduce((mediaRules, mediaValue, index) => {
    const key = mediaTokens[index];
    mediaRules[key] = { '--puResponsiveRule': key, [property]: mediaValue };
    return mediaRules;
  }, {} as Record<MediaToken, {}>);

  const hasResponsiveStyles = conditions.length > 0;

  return {
    [property]: initial,
    ...(hasResponsiveStyles && { ...responsiveStyles }),
  };
};
```

The array maps to breakpoints in order:
- Index 0 → base (no breakpoint)
- Index 1 → `@bp1` (640px)
- Index 2 → `@bp2` (768px)
- Index 3 → `@bp3` (1024px)
- Index 4 → `@bp4` (1280px)

Example transformation:

```ts
responsiveRule('gridTemplateColumnsRepeat', [1, 2, 3, 4])
// Produces:
// {
//   gridTemplateColumnsRepeat: 1,
//   '@bp1': { '--puResponsiveRule': '@bp1', gridTemplateColumnsRepeat: 2 },
//   '@bp2': { '--puResponsiveRule': '@bp2', gridTemplateColumnsRepeat: 3 },
//   '@bp3': { '--puResponsiveRule': '@bp3', gridTemplateColumnsRepeat: 4 },
// }
```

The `--puResponsiveRule` CSS custom property is a deduplication hack — it ensures Stitches generates unique hashes per breakpoint.

#### Usage in Grid component

From `Grid.tsx`:

```tsx
const GridComponent: React.FC<GridProps> = ({ children, columns, css = {}, ...props }) => (
  <Box
    css={merge(
      { display: 'grid' },
      responsiveRule('gridTemplateColumnsRepeat', columns),
      css
    )}
    {...props}
  >
    {children}
  </Box>
);
```

Consumer usage:

```tsx
// Static columns
<Grid columns={3}>...</Grid>

// Responsive columns — 1 on mobile, 2 at bp1, 3 at bp2, 4 at bp3
<Grid columns={[1, 2, 3, 4]}>...</Grid>

// Skip a breakpoint with null (no change at that bp)
<Grid columns={[1, null, 2, 4]}>...</Grid>
```

#### Usage in Grid.Cell

From `Cell.tsx`:

```tsx
const Cell: React.FC<CellProps> = ({ children, colSpan, css = {}, ...props }) => {
  const cellCss: PicnicCss = css;

  if (colSpan) {
    merge(css, responsiveRule('gridColumnSpan', colSpan));
  }

  return (
    <Box css={cellCss} {...props}>
      {children}
    </Box>
  );
};
```

Consumer usage:

```tsx
<Grid columns={[1, 2, 4]}>
  <Grid.Cell colSpan={[1, 2]}>Full on mobile, half on tablet+</Grid.Cell>
  <Grid.Cell>Standard cell</Grid.Cell>
</Grid>
```

### ResponsiveValue<T> Type

The type used for responsive prop values:

```ts
type ResponsiveValue<T> = T | T[];
```

Accepts either a single value or an array of values mapped to breakpoints. Used in:
- `Grid` `columns` prop: `ResponsiveValue<number | null>`
- `Grid.Cell` `colSpan` prop: `ResponsiveValue<number | null>`
- Any custom component that uses `responsiveRule()`

### useBreakpoints() Hook

Source: `media.ts`

Returns boolean flags for each breakpoint, using `@react-hook/media-query`:

```ts
type Breakpoints = {
  atBp1: boolean;
  atBp2: boolean;
  atBp3: boolean;
  atBp4: boolean;
};

const useBreakpoints = (): Breakpoints => {
  const atBp1 = useMediaQuery(media.bp1);
  const atBp2 = useMediaQuery(media.bp2);
  const atBp3 = useMediaQuery(media.bp3);
  const atBp4 = useMediaQuery(media.bp4);
  return { atBp1, atBp2, atBp3, atBp4 };
};
```

Usage:

```tsx
import { useBreakpoints } from '@attentive/picnic';

const MyComponent = () => {
  const { atBp2, atBp3 } = useBreakpoints();

  return (
    <Box css={{ display: 'flex', flexDirection: atBp2 ? 'row' : 'column' }}>
      {atBp3 && <Sidebar />}
      <MainContent />
    </Box>
  );
};
```

Use `useBreakpoints()` for JS-level responsive logic (conditional rendering, different data fetching). Use `@bp` media tokens in css for CSS-level responsive styles. Prefer CSS-level responsive styles when possible — they avoid layout shifts and work without JS.

### Stack Spacing: Margins, Not Gap

From `Stack.tsx` — Stack uses the `> * + *` margin pattern instead of CSS `gap`:

```tsx
const Stack: React.FC<StackProps> = ({
  children,
  spacing = '$space$space4',
  direction = 'vertical',
  css,
  as = 'div',
  ...props
}) => {
  // NOTE: we remove `gap` from CSS since it doesn't work w/ Safari
  const { gap: _gap, ...restOfCSS } = css || {};

  const cssObj: PicnicCss = {
    display: 'flex',
    alignItems: 'flex-start',

    ['> *']: {
      margin: 0,
    },

    ...(direction === 'vertical'
      ? {
          flexDirection: 'column',
          ['> * + *']: { marginTop: spacing },
        }
      : {
          flexDirection: 'row',
          ['> * + *']: { marginLeft: spacing },
        }),

    ...restOfCSS,
  };

  return (
    <Box css={cssObj} as={as} {...props}>
      {children}
    </Box>
  );
};
```

Key behaviors:
1. **Gap is explicitly stripped**: `const { gap: _gap, ...restOfCSS } = css || {}` — passing `gap` in the css prop is silently removed
2. **Vertical**: `> * + *` gets `marginTop: spacing`
3. **Horizontal**: `> * + *` gets `marginLeft: spacing`
4. **First child has no margin**: `> *` sets `margin: 0` on all children, then `> * + *` overrides for subsequent children

Usage:

```tsx
// Vertical stack with default spacing ($space4 = 16px)
<Stack>
  <Text>First</Text>
  <Text>Second</Text>
  <Text>Third</Text>
</Stack>

// Horizontal stack with custom spacing
<Stack direction="horizontal" spacing="$space2">
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</Stack>

// Stack with semantic HTML element
<Stack as="nav" spacing="$space6">
  <a href="/home">Home</a>
  <a href="/about">About</a>
</Stack>
```

DO NOT pass `gap` to Stack — it will be silently removed. Use the `spacing` prop instead.

---

## Theming

### Theme Architecture

Picnic themes are created via `createStitches` with the `theme` config key. The default theme (`theme2021`) is provided at configuration time. Additional themes are created with `createPicnicTheme()`.

From `stitches.config.ts`:

```ts
const config = createStitches({
  prefix: 'picnic-',
  theme: theme2021Scales,
  media,
  utils,
});
```

### createPicnicTheme() API

Creates a new theme that overrides token values from the base theme:

```ts
const createPicnicTheme = (
  className: string,
  theme: Parameters<typeof createTheme>[1]
) => {
  return createTheme(`${CLASS_PREFIX}${className}`, theme);
};
```

The function:
1. Accepts a class name string and a theme token override object
2. Prepends the `picnic-` class prefix
3. Returns a Stitches theme object (a CSS class name string with token values)

Built-in theme creation:

```ts
const theme2021 = createPicnicTheme(ThemeName.Theme2021, theme2021Scales);
const themeDark = createPicnicTheme(ThemeName.ThemeDark, themeDarkScales);
```

Export alias: `createPicnicTheme` is exported as `createTheme`:

```ts
export { createPicnicTheme as createTheme };
```

### ThemeName Enum

```ts
enum ThemeName {
  Theme2021 = 'theme2021',
  ThemeDark = 'themeDark',
}
```

### Themes Object

```ts
const Themes: { [key in ThemeName]: Theme } = {
  theme2021,
  themeDark,
};
```

### DEFAULT_THEME

```ts
const DEFAULT_THEME: Theme = Themes.theme2021;
```

### usePicnicStyles() Hook

Applies the global CSS reset and theme class to `document.body`. Call once at the app root:

```ts
const usePicnicStyles = (theme = Themes.theme2021) => {
  useEffect(() => {
    applyGlobalReset();
  }, []);

  useEffect(() => {
    applyPicnicTheme(theme);
  }, [theme]);
};
```

The hook does two things:
1. **Global reset** (runs once): sets `box-sizing: border-box` on all elements, removes default margins, normalizes font inheritance, removes anchor styling
2. **Theme application** (runs when theme changes): removes all `picnic-` prefixed classes from body, then adds the theme class and `themeResetStyles` class

Usage:

```tsx
import { usePicnicStyles, Themes } from '@attentive/picnic';

const App = () => {
  usePicnicStyles(); // uses theme2021 by default
  return <AppContent />;
};

// With explicit theme:
const App = () => {
  usePicnicStyles(Themes.themeDark);
  return <AppContent />;
};
```

### Global Reset Styles

Applied by `applyGlobalReset()`:

```ts
const applyGlobalReset = globalCss({
  '*, *::before, *::after': { boxSizing: 'border-box' },
  'html, body, p': {
    padding: '0',
    margin: '0',
  },
  'button, input, optgroup, select, textarea': {
    margin: '0',
  },
  'input, button, textarea, select': {
    fontFamily: 'inherit',
  },
  a: {
    color: 'inherit',
    textDecoration: 'inherit',
  },
});
```

### Theme Reset Styles

Applied as a class on `document.body` alongside the theme class:

```ts
const themeResetStyles = css({
  fontFamily: '$body',
  backgroundColor: '$bgDefault',
  color: '$textDefault',
  letterSpacing: '$letterSpacing1',
  lineHeight: '$lineHeight2',

  'b, strong': {
    fontWeight: '$bold',
  },
});
```

This sets the global typographic baseline:
- Font: `$body` (Ginto Normal)
- Background: `$bgDefault` (white in light theme, `$grayscale900` in dark)
- Text: `$textDefault` (`$grayscale900` in light, `$grayscale0` in dark)
- Letter spacing: `$letterSpacing1` (0.3px)
- Line height: `$lineHeight2` (1.25)
- Bold elements: `$bold` (font-weight 500)

### Theme Application Mechanism

From `stitches.config.ts`:

```ts
const applyPicnicTheme = (theme: Theme) => {
  // Remove all picnic classes from body.
  Array.from(document.body.classList.entries())
    .map(([_, value]) => value)
    .filter((value) => value.startsWith(CLASS_PREFIX))
    .forEach((value) => document.body.classList.remove(value));

  document.body.classList.add(theme, themeResetStyles());
};
```

The theme is a CSS class name. When applied to body, all `$token` references inside descendants resolve to that theme's values. Stitches generates CSS custom properties scoped to the theme class.

### Dark Theme Override Pattern

The dark theme is a minimal override of the light theme. From `theme-dark.ts`:

```ts
import { ThemeManifest, theme2021 } from './theme-2021';

export const themeDark: ThemeManifest = {
  ...theme2021,
  colors: {
    ...theme2021.colors,
    // Functional Tokens
    bgDefault: '$grayscale900',
    bgActionBasic: '$grayscale900',
    bgInformationalDefault: '$cloveBrown800',
    bgBrand: '$yellow300_40',
    bgRow: '$grayscale900',
    bgRowHover: '$grayscale800',
    bgRowSelected: '$grayscale700',
    bgRowPressed: '$grayscale700',
    bgWarningDefault: '$aperolOrange700',
    bgWarningAccent: '$aperolOrange800',
    textDefault: '$grayscale0',
    textInverted: '$grayscale900',
    textLink: '$grayscale0,',
  },
};
```

Key patterns:
1. **Spread the base theme**: `...theme2021` inherits all non-color tokens (space, sizes, fonts, radii, shadows, z-indices)
2. **Override only colors**: `colors: { ...theme2021.colors, /* overrides */ }` preserves all color tokens, then overrides specific functional tokens
3. **Only ~15 tokens change**: backgrounds, row states, and text inversion. Most functional tokens remain the same.
4. **Functional token indirection**: Components using `$bgDefault` automatically get white in light theme and `$grayscale900` in dark — no component code changes needed

### Theme Switching

Switch themes by passing a different theme to `usePicnicStyles`:

```tsx
import { usePicnicStyles, Themes } from '@attentive/picnic';

const App = () => {
  const [isDark, setIsDark] = useState(false);
  usePicnicStyles(isDark ? Themes.themeDark : Themes.theme2021);

  return (
    <>
      <Button onClick={() => setIsDark(!isDark)}>Toggle Theme</Button>
      <AppContent />
    </>
  );
};
```

### Creating Custom Themes

Extend an existing theme by providing partial overrides:

```ts
import { createTheme, Themes } from '@attentive/picnic';

const customTheme = createTheme('custom-brand', {
  colors: {
    bgActionPrimary: '#FF6B35',
    bgActionPrimaryHover: '#E55A2B',
    bgActionPrimaryPressed: '#CC4F22',
  },
});
```

Use the custom theme:

```tsx
usePicnicStyles(customTheme);
```

Only override the tokens you need to change. All other tokens inherit from the base `theme2021Scales` that was passed to `createStitches()`.

---

## Common Patterns and Anti-Patterns

### DO: Use functional tokens

```tsx
// DO:
<Box css={{ backgroundColor: '$bgDefault', color: '$textDefault' }} />
<Box css={{ border: '$borderWidths$borderWidth1 solid $borderDefault' }} />
```

### DON'T: Use raw perceptual tokens

```tsx
// DON'T:
<Box css={{ backgroundColor: '$grayscale0', color: '$grayscale900' }} />
```

Raw tokens (`$grayscale0`, `$red100`, `$yellow300`) don't adapt to theme changes. Functional tokens (`$bgDefault`, `$textDefault`, `$bgActionPrimary`) resolve differently in light and dark themes.

### DO: Use space utils for padding/margin

```tsx
// DO:
<Box css={{ px: '$space4', py: '$space2' }} />
<Box css={{ mb: '$space4' }} />
```

### DON'T: Use raw pixel values

```tsx
// DON'T:
<Box css={{ paddingLeft: '16px', paddingRight: '16px' }} />
```

### DO: Use focusVisible util for focus rings

```tsx
// DO:
const Interactive = styled('div', {
  focusVisible: '$focus',
});
```

### DON'T: Write custom focus styles

```tsx
// DON'T:
const Interactive = styled('div', {
  '&:focus': {
    outline: '2px solid blue',
  },
});
```

### DO: Use defaultTransition for animations

```tsx
// DO:
const Animated = styled('div', {
  defaultTransition: ['background-color', 'color'],
});
```

### DON'T: Write custom transition timing

```tsx
// DON'T:
const Animated = styled('div', {
  transition: 'background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
});
```

### DO: Use $borderWidths in border shorthand

```tsx
// DO:
border: '$borderWidths$borderWidth1 solid $borderDefault',
```

### DON'T: Hardcode border width

```tsx
// DON'T:
border: '1px solid $borderDefault',
```

### DO: Use Stack spacing prop

```tsx
// DO:
<Stack spacing="$space4">
  <Item />
  <Item />
</Stack>
```

### DON'T: Pass gap to Stack

```tsx
// DON'T:
<Stack css={{ gap: '$space4' }}>
  <Item />
  <Item />
</Stack>
// gap is silently stripped — spacing won't apply
```

### DO: Use cross-scale references in shadows

```tsx
// DO:
boxShadow: '0 0 0 2px $colors$bgDefault',
```

### DON'T: Use bare tokens in shadow strings

```tsx
// DON'T:
boxShadow: '0 0 0 2px $bgDefault',
// This won't resolve — shadows need $colors$ prefix for color tokens
```

---

## TypeScript Types Reference

Key types exported from `@attentive/picnic`:

```ts
// CSS type for the css prop
type PicnicCss = CSS<typeof config>;

// Extract variant types from a styled component
type VariantProps<T>

// Theme type
type Theme = ReturnType<typeof createPicnicTheme>;

// Theme name enum
enum ThemeName {
  Theme2021 = 'theme2021',
  ThemeDark = 'themeDark',
}

// Color token types
type PicnicColorsKey = keyof (typeof theme2021)['colors'];
type PicnicColorsToken = `$${Extract<PicnicColorsKey, string>}`;

// Font size token types
type PicnicFontSizesKey = keyof (typeof theme2021)['fontSizes'];
type PicnicFontSizesToken = `$${Extract<PicnicFontSizesKey, string>}`;

// Size token types
type PicnicSizesKey = keyof (typeof theme2021)['sizes'];
type PicnicSizesToken = `$${Extract<PicnicSizesKey, string>}`;

// Space token types
type PicnicSpaceKey = keyof (typeof theme2021)['space'];
type PicnicSpaceToken = `$${Extract<PicnicSpaceKey, string>}`;

// Shadow token types
type PicnicShadowsKey = keyof (typeof theme2021)['shadows'];
type PicnicShadowsToken = `$${Extract<PicnicShadowsKey, string>}`;

// Responsive value type
type ResponsiveValue<T> = T | T[];

// Breakpoints hook return type
type Breakpoints = {
  atBp1: boolean;
  atBp2: boolean;
  atBp3: boolean;
  atBp4: boolean;
};

// Media types
type MediaKey = 'bp1' | 'bp2' | 'bp3' | 'bp4';
type MediaToken = `@${Extract<MediaKey, string>}`;
```

Use `PicnicCss` for typing any css object. Use `VariantProps` for extracting variant types from styled components. Use `PicnicSpaceToken` and siblings for typing props that accept specific token scales.

---

## Exports from stitches.config.ts

| Export | Type | Description |
|--------|------|-------------|
| `styled` | function | Create styled components |
| `css` | function | Create reusable style objects |
| `keyframes` | function | Define CSS keyframes |
| `globalCss` | function | Apply global styles |
| `getCssText` | function | Get generated CSS text (for SSR) |
| `usePicnicStyles` | hook | Apply global reset + theme to body |
| `createTheme` | function | Create custom themes (alias for `createPicnicTheme`) |
| `DEFAULT_THEME` | Theme | Default theme (theme2021) |
| `Themes` | object | `{ theme2021, themeDark }` |
| `ThemeName` | enum | `Theme2021`, `ThemeDark` |
| `VariantProps` | type | Extract variant types from styled components |
| `Theme` | type | Theme instance type |
| `PicnicCss` | type | CSS object type for Picnic |
