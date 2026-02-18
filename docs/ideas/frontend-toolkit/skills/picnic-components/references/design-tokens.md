# Picnic Design Tokens Reference

Complete reference for all design tokens in the Picnic design system (`@attentive/picnic`). Every token listed here is extracted from the actual theme source files and represents the single source of truth for token values.

Use functional/semantic tokens (e.g., `$bgDefault`, `$textDefault`) in all component code. Reserve raw perceptual palette tokens for custom theme creation only.

---

## Table of Contents

1. [Stitches Token System](#1-stitches-token-system)
2. [Color Tokens](#2-color-tokens)
3. [Space and Size Tokens](#3-space-and-size-tokens)
4. [Typography Tokens](#4-typography-tokens)
5. [Other Tokens](#5-other-tokens)
6. [Breakpoints and Responsive Design](#6-breakpoints-and-responsive-design)

---

## 1. Stitches Token System

### How Tokens Work

Picnic uses [Stitches](https://stitches.dev/) (`@stitches/react` v1.2.8) as its CSS-in-JS engine. All design tokens are defined in the Stitches theme configuration and referenced using the `$tokenName` dollar-sign prefix syntax.

Reference tokens in the `css` prop or inside `styled()` calls:

```tsx
// In the css prop
<Box css={{ backgroundColor: '$bgDefault', color: '$textDefault', p: '$space4' }} />

// In styled() definitions
const Card = styled('div', {
  backgroundColor: '$bgAccent',
  borderRadius: '$radius2',
  p: '$space4',
});
```

Stitches automatically resolves `$tokenName` to the correct CSS custom property at runtime. Tokens are scoped to their scale — `$bgDefault` resolves from the `colors` scale, `$space4` from the `space` scale, `$radius2` from the `radii` scale.

### Cross-Scale Token References

When referencing a token from a different scale than the CSS property expects, use the `$scale$tokenName` syntax:

```tsx
// boxShadow expects shadows scale, but we need a color token
<Box css={{ boxShadow: '0 0 0 2px $colors$bgDefault' }} />

// border shorthand needs tokens from multiple scales
<Box css={{ border: '$borderWidths$borderWidth1 solid $colors$borderDefault' }} />
```

### Theme Structure

The Stitches configuration is created in `stitches.config.ts`:

```tsx
import { createStitches } from '@stitches/react';

const config = createStitches({
  prefix: 'picnic-',
  theme: theme2021Scales,
  media,
  utils,
});
```

Key points:
- All generated CSS class names are prefixed with `picnic-`
- The default theme is `theme2021` (light theme)
- Media queries and custom utilities are registered globally
- The config exports `styled`, `css`, `keyframes`, `globalCss`, `getCssText`, and `createTheme`

### Theme Application

#### `usePicnicStyles(theme?)`

The `usePicnicStyles` hook applies the global CSS reset and activates a theme on the document body. Call it once at the application root:

```tsx
import { usePicnicStyles, Themes } from '@attentive/picnic';

function App() {
  // Default: applies theme2021 (light theme)
  usePicnicStyles();

  // Or specify a theme explicitly
  usePicnicStyles(Themes.themeDark);

  return <div>...</div>;
}
```

The hook performs two actions:
1. Applies a global CSS reset (box-sizing, margin/padding normalization, font inheritance, link reset, datepicker globals)
2. Applies the theme class to `document.body` along with reset styles (font family, background color, text color, letter spacing, line height)

#### Theme Reset Styles

When a theme is applied, these base styles are set on the body:

| Property | Token Value |
|----------|------------|
| `fontFamily` | `$body` (Ginto Normal) |
| `backgroundColor` | `$bgDefault` |
| `color` | `$textDefault` |
| `letterSpacing` | `$letterSpacing1` (0.3px) |
| `lineHeight` | `$lineHeight2` (1.25) |

Bold elements (`b`, `strong`) are set to `$bold` (500) font weight.

#### `createPicnicTheme(className, scales)` (exported as `createTheme`)

Create a custom theme by providing a class name and partial theme scale overrides:

```tsx
import { createTheme } from '@attentive/picnic';

const customTheme = createTheme('custom-brand', {
  colors: {
    bgActionPrimary: '#FF6B00',
    bgActionPrimaryHover: '#E06000',
    bgActionPrimaryPressed: '#CC5700',
  },
});
```

The `className` is automatically prefixed with `picnic-`. Only include the tokens you want to override — all other tokens inherit from the base `theme2021`.

### Theme Names and Objects

#### `ThemeName` Enum

```tsx
enum ThemeName {
  Theme2021 = 'theme2021',
  ThemeDark = 'themeDark',
}
```

#### `Themes` Object

```tsx
const Themes: { [key in ThemeName]: Theme } = {
  theme2021, // Light theme (default)
  themeDark,  // Dark theme
};
```

#### `DEFAULT_THEME`

```tsx
const DEFAULT_THEME: Theme = Themes.theme2021;
```

Use `DEFAULT_THEME` when you need to reference the default theme programmatically.

### TypeScript Types

| Type | Purpose |
|------|---------|
| `PicnicCss` | Type for the `css` prop — `CSS<typeof config>` |
| `Theme` | Return type of `createPicnicTheme` |
| `VariantProps<typeof Component>` | Extract variant prop types from a styled component |
| `PicnicColorsKey` | Union of all color token names (without `$` prefix) |
| `PicnicColorsToken` | Union of all color tokens (with `$` prefix) |
| `PicnicFontSizesKey` | Union of all font size token names |
| `PicnicFontSizesToken` | Union of all font size tokens (with `$` prefix) |
| `PicnicSizesKey` | Union of all size token names |
| `PicnicSizesToken` | Union of all size tokens (with `$` prefix) |
| `PicnicSpaceKey` | Union of all space token names |
| `PicnicSpaceToken` | Union of all space tokens (with `$` prefix) |
| `PicnicShadowsKey` | Union of all shadow token names |
| `PicnicShadowsToken` | Union of all shadow tokens (with `$` prefix) |

### Exported Stitches Utilities

These are re-exported from `@attentive/picnic` for direct use:

| Export | Purpose |
|--------|---------|
| `styled` | Create styled components with variants |
| `css` | Create reusable style objects |
| `keyframes` | Define CSS keyframe animations |
| `globalCss` | Define global CSS rules |
| `getCssText` | Get all CSS as a string (SSR) |
| `createTheme` | Create custom themes (aliased from `createPicnicTheme`) |
| `usePicnicStyles` | Hook to apply theme and global reset |
| `DEFAULT_THEME` | Reference to `Themes.theme2021` |
| `Themes` | Object containing all registered themes |
| `ThemeName` | Enum of available theme names |

---

## 2. Color Tokens

### Two-Tier Color Architecture

Picnic uses a two-tier color token system:

1. **Raw perceptual palette** — Named color values with actual hex/rgba values. These define the visual palette but should NOT be used directly in component code.
2. **Functional/semantic tokens** — Purpose-based aliases that reference raw colors. ALWAYS use these in components. They adapt automatically when the theme changes (e.g., light → dark).

```tsx
// CORRECT: Use functional tokens
<Box css={{ backgroundColor: '$bgDefault', color: '$textDefault' }} />

// INCORRECT: Do not use raw palette tokens directly
<Box css={{ backgroundColor: '$grayscale0', color: '$grayscale900' }} />
```

### Raw Perceptual Palette

#### Grayscale

| Token | Value | Description |
|-------|-------|-------------|
| `$grayscale0` | `#FFFFFF` | Pure white |
| `$grayscale030` | `#FAFAFA` | Near-white, subtle off-white |
| `$grayscale100` | `#EFF0F0` | Light gray |
| `$grayscale200` | `#E2E3E3` | Soft gray |
| `$grayscale200_40` | `rgba(226,227,227,0.4)` | Soft gray at 40% opacity |
| `$grayscale300` | `#C6C7C8` | Medium-light gray |
| `$grayscale400` | `#B6B7B8` | Medium gray |
| `$grayscale600` | `#8D8F91` | Medium-dark gray |
| `$grayscale700` | `#656567` | Dark gray |
| `$grayscale800` | `#545759` | Very dark gray |
| `$grayscale800_40` | `rgba(84,87,89,0.4)` | Very dark gray at 40% opacity |
| `$grayscale900` | `#1B1F23` | Near-black |
| `$grayscale900_08` | `rgba(27,31,35,0.08)` | Near-black at 8% opacity |
| `$grayscale900_12` | `rgba(27,31,35,0.12)` | Near-black at 12% opacity |
| `$grayscale900_16` | `rgba(27,31,35,0.16)` | Near-black at 16% opacity |
| `$grayscale900_24` | `rgba(27,31,35,0.24)` | Near-black at 24% opacity |
| `$grayscale900_40` | `rgba(27,31,35,0.4)` | Near-black at 40% opacity |
| `$grayscale1000` | `#000000` | Pure black |
| `$grayscale1000_50` | `rgba(0,0,0,0.5)` | Pure black at 50% opacity |

#### Yellow

| Token | Value | Description |
|-------|-------|-------------|
| `$yellow100` | `#FFFDE5` | Lightest yellow |
| `$yellow200` | `#FFF8B3` | Light yellow |
| `$yellow300` | `#FFF382` | Medium-light yellow (primary action base) |
| `$yellow300_40` | `rgba(255,243,130,0.4)` | Medium-light yellow at 40% opacity |
| `$yellow500` | `#FADF65` | Medium yellow |
| `$yellow600` | `#FFE600` | Bright yellow (primary action hover) |
| `$yellow700` | `#F9D100` | Deep yellow (primary action pressed) |

#### Green

| Token | Value | Description |
|-------|-------|-------------|
| `$green100` | `#D8EFE4` | Lightest green (success bg) |
| `$green200` | `#9FD6BC` | Light green (success accent) |
| `$green700` | `#3AA372` | Medium green (success icon) |
| `$green800` | `#30855D` | Dark green (success text) |
| `$green900` | `#1F573D` | Darkest green |

#### Red

| Token | Value | Description |
|-------|-------|-------------|
| `$red100` | `#FFD7DE` | Lightest red (critical bg) |
| `$red200` | `#FF9CAC` | Light red (critical accent) |
| `$red300` | `#FA7F8F` | Medium-light red |
| `$red700` | `#ED3553` | Medium red (critical icon, border error) |
| `$red800` | `#B3283E` | Dark red (critical text) |

#### Creamsicle Orange

| Token | Value | Description |
|-------|-------|-------------|
| `$creamsicleOrange100` | `#FFE1A9` | Lightest creamsicle (warning bg) |
| `$creamsicleOrange200` | `#FBCD81` | Light creamsicle |
| `$creamsicleOrange300` | `#FABF61` | Medium creamsicle |

#### Aperol Orange

| Token | Value | Description |
|-------|-------|-------------|
| `$aperolOrange100` | `#FFD4BF` | Lightest aperol |
| `$aperolOrange200` | `#FFA175` | Light aperol (warning accent in light theme) |
| `$aperolOrange700` | `#E04800` | Dark aperol (warning icon) |
| `$aperolOrange800` | `#AD3800` | Darkest aperol (warning text) |

#### Hyperlink Blue

| Token | Value | Description |
|-------|-------|-------------|
| `$hyperlinkBlue200` | `#94C7FA` | Light blue |
| `$hyperlinkBlue300` | `#6FB2F9` | Medium blue |
| `$hyperlinkBlue700` | `#0074E0` | Primary blue (hover text, hovered icon) |
| `$hyperlinkBlue800` | `#005AAD` | Dark blue (pressed text, pressed icon) |

#### Celery Green

| Token | Value | Description |
|-------|-------|-------------|
| `$celeryGreen100` | `#E2FA9F` | Lightest celery (decorative1 bg) |
| `$celeryGreen200` | `#BDD185` | Light celery (decorative1 accent) |
| `$celeryGreen700` | `#788554` | Dark celery (decorative1 icon) |
| `$celeryGreen800` | `#617030` | Darkest celery (decorative1 text) |

#### Cloud Blue

| Token | Value | Description |
|-------|-------|-------------|
| `$cloudBlue100` | `#E3F0F4` | Lightest cloud blue (decorative2 bg) |
| `$cloudBlue200` | `#82C8D2` | Light cloud blue (decorative2 accent) |
| `$cloudBlue700` | `#55838A` | Dark cloud blue (decorative2 icon) |
| `$cloudBlue800` | `#2A4A50` | Darkest cloud blue (decorative2 text) |

#### Clove Brown

| Token | Value | Description |
|-------|-------|-------------|
| `$cloveBrown100` | `#F9F7F0` | Lightest clove (informational bg) |
| `$cloveBrown200` | `#D1BAB0` | Light clove (informational accent) |
| `$cloveBrown300` | `#C1A396` | Medium clove |
| `$cloveBrown700` | `#AD6848` | Dark clove (info icon) |
| `$cloveBrown800` | `#7F2801` | Darkest clove (informational text) |

#### Lavender Purple

| Token | Value | Description |
|-------|-------|-------------|
| `$lavenderPurple030` | `#FBF3FF` | Near-white lavender (guidance bg) |
| `$lavenderPurple100` | `#EDC6ED` | Lightest lavender (decorative4 bg) |
| `$lavenderPurple200` | `#C878D1` | Light lavender (decorative4 accent) |
| `$lavenderPurple700` | `#834F8A` | Dark lavender (guidance icon, guidance accent, decorative4 icon) |
| `$lavenderPurple800` | `#58495B` | Darkest lavender (decorative4 text) |

#### Steel Blue

| Token | Value | Description |
|-------|-------|-------------|
| `$steelBlue100` | `#E7F2FE` | Lightest steel blue (decorative3 bg) |
| `$steelBlue200` | `#CEE5FD` | Light steel blue (decorative3 accent, highlighted bg) |
| `$steelBlue300` | `#B9CEE4` | Medium steel blue |
| `$steelBlue700` | `#67737E` | Dark steel blue (decorative3 icon) |
| `$steelBlue800` | `#3E454C` | Darkest steel blue (decorative3 text) |

### Functional Background Tokens (`$bg*`)

These are the tokens to use for all background colors. Each resolves to a raw palette color that changes with the active theme.

#### Surface Backgrounds

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$bgDefault` | Primary surface / page background | `$grayscale0` | `#FFFFFF` |
| `$bgAccentSubtle` | Subtle surface differentiation | `$grayscale030` | `#FAFAFA` |
| `$bgAccent` | Accented surface, cards, sections | `$grayscale100` | `#EFF0F0` |
| `$bgAccentDark` | Darker accented surface | `$grayscale200` | `#E2E3E3` |
| `$bgPlaceholder` | Placeholder/skeleton state | `$grayscale200` | `#E2E3E3` |
| `$bgPlaceholderAlt` | Alternate placeholder state | `$grayscale300` | `#C6C7C8` |
| `$bgOverlay` | Modal/drawer backdrop overlay | `$grayscale1000_50` | `rgba(0,0,0,0.5)` |
| `$bgTooltip` | Tooltip background | `$grayscale1000` | `#000000` |
| `$bgBrand` | Brand-colored background | `$yellow300` | `#FFF382` |
| `$bgInverted` | Dark/inverted background | `$grayscale900` | `#1B1F23` |
| `$bgInvertedDisabled` | Disabled inverted background | `$grayscale600` | `#8D8F91` |
| `$bgHighlighted` | Highlighted/selected content background | `$steelBlue200` | `#CEE5FD` |

#### Primary Action Backgrounds

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$bgActionPrimary` | Primary button/action default | `$yellow300` | `#FFF382` |
| `$bgActionPrimaryHover` | Primary button/action hover | `$yellow600` | `#FFE600` |
| `$bgActionPrimaryPressed` | Primary button/action pressed | `$yellow700` | `#F9D100` |
| `$bgActionPrimaryDisabled` | Primary button/action disabled | `$yellow300_40` | `rgba(255,243,130,0.4)` |

#### Secondary Action Backgrounds

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$bgActionSecondary` | Secondary button default | `$grayscale200` | `#E2E3E3` |
| `$bgActionSecondaryHover` | Secondary button hover | `$grayscale300` | `#C6C7C8` |
| `$bgActionSecondaryPressed` | Secondary button pressed | `$grayscale600` | `#8D8F91` |
| `$bgActionSecondaryDisabled` | Secondary button disabled | `$grayscale200_40` | `rgba(226,227,227,0.4)` |

#### Basic Action Backgrounds

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$bgActionBasic` | Basic/outlined button default | `$grayscale0` | `#FFFFFF` |
| `$bgActionBasicHover` | Basic/outlined button hover | `$grayscale100` | `#EFF0F0` |
| `$bgActionBasicPressed` | Basic/outlined button pressed | `$grayscale200` | `#E2E3E3` |

#### Row State Backgrounds

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$bgRow` | Table/list row default | `$grayscale0` | `#FFFFFF` |
| `$bgRowHover` | Table/list row hover | `$grayscale100` | `#EFF0F0` |
| `$bgRowPressed` | Table/list row pressed | `$grayscale200` | `#E2E3E3` |
| `$bgRowSelected` | Table/list row selected | `$grayscale200` | `#E2E3E3` |
| `$bgRowSelectedHover` | Selected row hover | `$grayscale200` | `#E2E3E3` |
| `$bgRowSelectedPressed` | Selected row pressed | `$grayscale300` | `#C6C7C8` |

#### Toggle State Backgrounds

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$bgToggleDefault` | Toggle/switch default | `$grayscale0` | `#FFFFFF` |
| `$bgToggleHover` | Toggle/switch hover | `$grayscale200` | `#E2E3E3` |
| `$bgTogglePressed` | Toggle/switch pressed | `$grayscale300` | `#C6C7C8` |
| `$bgToggleSelected` | Toggle/switch selected (on) | `$grayscale900` | `#1B1F23` |

#### Semantic Status Backgrounds

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$bgSuccessDefault` | Success message/banner bg | `$green100` | `#D8EFE4` |
| `$bgSuccessAccent` | Success accent/badge bg | `$green200` | `#9FD6BC` |
| `$bgCriticalDefault` | Error/critical message bg | `$red100` | `#FFD7DE` |
| `$bgCriticalAccent` | Error accent/badge bg | `$red200` | `#FF9CAC` |
| `$bgWarningDefault` | Warning message bg | `$creamsicleOrange100` | `#FFE1A9` |
| `$bgWarningAccent` | Warning accent bg | `$aperolOrange200` | `#FFA175` |
| `$bgInformationalDefault` | Info message bg | `$cloveBrown100` | `#F9F7F0` |
| `$bgInformationalAccent` | Info accent bg | `$cloveBrown200` | `#D1BAB0` |
| `$bgGuidanceDefault` | Guidance/help bg | `$lavenderPurple030` | `#FBF3FF` |
| `$bgGuidanceAccent` | Guidance accent bg | `$lavenderPurple700` | `#834F8A` |

#### Decorative Backgrounds

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$bgDecorative1Default` | Decorative 1 bg (celery) | `$celeryGreen100` | `#E2FA9F` |
| `$bgDecorative1Accent` | Decorative 1 accent | `$celeryGreen200` | `#BDD185` |
| `$bgDecorative2Default` | Decorative 2 bg (cloud) | `$cloudBlue100` | `#E3F0F4` |
| `$bgDecorative2Accent` | Decorative 2 accent | `$cloudBlue200` | `#82C8D2` |
| `$bgDecorative3Default` | Decorative 3 bg (steel) | `$steelBlue100` | `#E7F2FE` |
| `$bgDecorative3Accent` | Decorative 3 accent | `$steelBlue200` | `#CEE5FD` |
| `$bgDecorative4Default` | Decorative 4 bg (lavender) | `$lavenderPurple100` | `#EDC6ED` |
| `$bgDecorative4Accent` | Decorative 4 accent | `$lavenderPurple200` | `#C878D1` |

#### Gradient Backgrounds

| Token | Purpose | Value |
|-------|---------|-------|
| `$bgGradientMagic` | Decorative gradient | `linear-gradient(90deg, $bgDecorative4Default 12.03%, $bgDecorative3Accent 91.25%)` |
| `$bgGradientMagicFallback` | Fallback for gradient | `$bgDecorative4Default` (`#EDC6ED`) |

### Functional Text Tokens (`$text*`)

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$textDefault` | Primary body text | `$grayscale900` | `#1B1F23` |
| `$textSubdued` | Secondary/muted text | `$grayscale700` | `#656567` |
| `$textDisabled` | Disabled text | `$grayscale900_40` | `rgba(27,31,35,0.4)` |
| `$textInverted` | Text on dark/inverted backgrounds | `$grayscale0` | `#FFFFFF` |
| `$textLink` | Link text | `$grayscale900` | `#1B1F23` |
| `$textHover` | Hovered interactive text | `$hyperlinkBlue700` | `#0074E0` |
| `$textPressed` | Pressed interactive text | `$hyperlinkBlue800` | `#005AAD` |
| `$textSelectedToggle` | Selected toggle text | `$grayscale900` | `#1B1F23` |
| `$textSuccess` | Success status text | `$green800` | `#30855D` |
| `$textWarning` | Warning status text | `$aperolOrange800` | `#AD3800` |
| `$textCritical` | Error/critical status text | `$red800` | `#B3283E` |
| `$textInformational` | Informational status text | `$cloveBrown800` | `#7F2801` |
| `$textDecorative1` | Decorative 1 text (celery) | `$celeryGreen800` | `#617030` |
| `$textDecorative2` | Decorative 2 text (cloud) | `$cloudBlue800` | `#2A4A50` |
| `$textDecorative3` | Decorative 3 text (steel) | `$steelBlue800` | `#3E454C` |
| `$textDecorative4` | Decorative 4 text (lavender) | `$lavenderPurple800` | `#58495B` |

### Functional Icon Tokens (`$icon*`)

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$iconDefault` | Default icon color | `$grayscale900` | `#1B1F23` |
| `$iconSubdued` | Subdued/secondary icon | `$grayscale600` | `#8D8F91` |
| `$iconDisabled` | Disabled icon | `$grayscale900_40` | `rgba(27,31,35,0.4)` |
| `$iconInverted` | Icon on dark backgrounds | `$grayscale0` | `#FFFFFF` |
| `$iconHovered` | Hovered interactive icon | `$hyperlinkBlue700` | `#0074E0` |
| `$iconPressed` | Pressed interactive icon | `$hyperlinkBlue800` | `#005AAD` |
| `$iconSuccess` | Success status icon | `$green700` | `#3AA372` |
| `$iconWarning` | Warning status icon | `$aperolOrange700` | `#E04800` |
| `$iconCritical` | Error/critical status icon | `$red700` | `#ED3553` |
| `$iconInfo` | Informational status icon | `$cloveBrown700` | `#AD6848` |
| `$iconGuidance` | Guidance/help icon | `$lavenderPurple700` | `#834F8A` |
| `$iconDecorative1` | Decorative 1 icon (celery) | `$celeryGreen700` | `#788554` |
| `$iconDecorative2` | Decorative 2 icon (cloud) | `$cloudBlue700` | `#55838A` |
| `$iconDecorative3` | Decorative 3 icon (steel) | `$steelBlue700` | `#67737E` |
| `$iconDecorative4` | Decorative 4 icon (lavender) | `$lavenderPurple700` | `#834F8A` |

### Functional Border Tokens (`$border*`)

| Token | Purpose | Light Theme Value | Resolved Hex |
|-------|---------|-------------------|-------------|
| `$borderDefault` | Default border (dividers, cards) | `$grayscale200` | `#E2E3E3` |
| `$borderLoud` | Prominent border | `$grayscale300` | `#C6C7C8` |
| `$borderVisualization` | Data visualization borders | `$grayscale600` | `#8D8F91` |
| `$borderInverted` | Border on dark backgrounds | `$grayscale0` | `#FFFFFF` |
| `$borderInput` | Input field border (default) | `$grayscale800` | `#545759` |
| `$borderInputHover` | Input field border (hover) | `$grayscale1000` | `#000000` |
| `$borderInputSuccess` | Input field border (success) | `$green700` | `#3AA372` |
| `$borderInputError` | Input field border (error) | `$red700` | `#ED3553` |
| `$borderInputDisabled` | Input field border (disabled) | `$grayscale800_40` | `rgba(84,87,89,0.4)` |
| `$borderActionBasic` | Basic action button border | `$grayscale300` | `#C6C7C8` |
| `$borderActionBasicDisabled` | Disabled basic action border | `$grayscale800_40` | `rgba(84,87,89,0.4)` |
| `$borderFocus` | Focus ring border color | `$grayscale900` | `#1B1F23` |
| `$borderSelectedToggle` | Selected toggle border | `$grayscale1000` | `#000000` |

### Using Border Tokens

Apply border tokens using the `border` shorthand with cross-scale references:

```tsx
// Standard 1px border
<Box css={{ border: '$borderWidths$borderWidth1 solid $colors$borderDefault' }} />

// Input border in error state
<Box css={{ border: '$borderWidths$borderWidth2 solid $colors$borderInputError' }} />

// Just border-color (when border-style and width are set separately)
<Box css={{ borderColor: '$borderDefault' }} />
```

### Dark Theme Overrides

The dark theme (`themeDark`) overrides only the functional tokens that need to change. All raw palette colors remain identical. This demonstrates why using functional tokens is critical — they automatically adapt to the active theme.

#### Dark Theme Functional Token Changes

| Token | Light Theme Value | Dark Theme Value | Dark Resolved |
|-------|-------------------|------------------|--------------|
| `$bgDefault` | `$grayscale0` (`#FFFFFF`) | `$grayscale900` (`#1B1F23`) | Near-black |
| `$bgActionBasic` | `$grayscale0` (`#FFFFFF`) | `$grayscale900` (`#1B1F23`) | Near-black |
| `$bgInformationalDefault` | `$cloveBrown100` (`#F9F7F0`) | `$cloveBrown800` (`#7F2801`) | Dark brown |
| `$bgBrand` | `$yellow300` (`#FFF382`) | `$yellow300_40` (`rgba(255,243,130,0.4)`) | Dimmed yellow |
| `$bgRow` | `$grayscale0` (`#FFFFFF`) | `$grayscale900` (`#1B1F23`) | Near-black |
| `$bgRowHover` | `$grayscale100` (`#EFF0F0`) | `$grayscale800` (`#545759`) | Dark gray |
| `$bgRowSelected` | `$grayscale200` (`#E2E3E3`) | `$grayscale700` (`#656567`) | Medium gray |
| `$bgRowPressed` | `$grayscale200` (`#E2E3E3`) | `$grayscale700` (`#656567`) | Medium gray |
| `$bgWarningDefault` | `$creamsicleOrange100` (`#FFE1A9`) | `$aperolOrange700` (`#E04800`) | Dark orange |
| `$bgWarningAccent` | `$aperolOrange200` (`#FFA175`) | `$aperolOrange800` (`#AD3800`) | Darkest orange |
| `$textDefault` | `$grayscale900` (`#1B1F23`) | `$grayscale0` (`#FFFFFF`) | White |
| `$textInverted` | `$grayscale0` (`#FFFFFF`) | `$grayscale900` (`#1B1F23`) | Near-black |
| `$textLink` | `$grayscale900` (`#1B1F23`) | `$grayscale0` (`#FFFFFF`) | White |

Key observations about the dark theme:
- Only ~13 functional tokens change — the vast majority of the color system remains the same
- Background and text defaults are swapped (light bg → dark, dark text → light)
- Row states shift to darker grayscale values
- Warning colors shift to darker, more saturated variants
- All raw palette colors (grayscale, yellow, green, red, brand colors) are identical in both themes

### Color Token Usage Guidelines

1. **Always use functional tokens** — `$bgDefault` not `$grayscale0`, `$textDefault` not `$grayscale900`
2. **Follow the naming convention** — prefix indicates where to use: `$bg*` for backgrounds, `$text*` for text, `$icon*` for icons, `$border*` for borders
3. **Use state suffixes** — tokens ending in `Hover`, `Pressed`, `Disabled`, `Selected` are for interactive states
4. **Decorative tokens come in sets** — each decorative group (1-4) has `Default`, `Accent`, text, and icon variants; use them as coordinated sets
5. **Semantic tokens for status** — use `Success`, `Critical`, `Warning`, `Informational`, `Guidance` tokens for status indicators; do not mix (e.g., do not use `$bgSuccessDefault` with `$textCritical`)

```tsx
// Correct: Coordinated semantic token usage
<Banner variant="success">
  <Banner.Text css={{ color: '$textSuccess' }}>Operation completed</Banner.Text>
</Banner>

// Correct: Coordinated decorative set
<Box css={{
  backgroundColor: '$bgDecorative2Default',
  color: '$textDecorative2',
}}>
  <Icon name="Info" css={{ color: '$iconDecorative2' }} mode="decorative" />
</Box>

// Correct: Interactive state progression
const InteractiveCard = styled('div', {
  backgroundColor: '$bgRow',
  '&:hover': { backgroundColor: '$bgRowHover' },
  '&:active': { backgroundColor: '$bgRowPressed' },
});
```

### Color Token Decision Guide

Use this guide to select the correct token for your use case:

#### "I need a background color for..."

| Use Case | Token |
|----------|-------|
| Page/app background | `$bgDefault` |
| Card or section background | `$bgAccent` |
| Subtle surface differentiation | `$bgAccentSubtle` |
| Primary call-to-action button | `$bgActionPrimary` |
| Secondary button | `$bgActionSecondary` |
| Outlined/basic button | `$bgActionBasic` |
| Table row | `$bgRow` |
| Toggle/switch control | `$bgToggleDefault` |
| Success banner/message | `$bgSuccessDefault` |
| Error banner/message | `$bgCriticalDefault` |
| Warning banner/message | `$bgWarningDefault` |
| Info banner/message | `$bgInformationalDefault` |
| Help/guidance callout | `$bgGuidanceDefault` |
| Modal/drawer backdrop | `$bgOverlay` |
| Tooltip | `$bgTooltip` |
| Dark/inverted section | `$bgInverted` |
| Skeleton/placeholder loading | `$bgPlaceholder` |
| Search result highlight | `$bgHighlighted` |
| Brand accent area | `$bgBrand` |
| Decorative category tags | `$bgDecorative1Default` through `$bgDecorative4Default` |

#### "I need a text color for..."

| Use Case | Token |
|----------|-------|
| Primary body text | `$textDefault` |
| Secondary/supporting text | `$textSubdued` |
| Disabled text | `$textDisabled` |
| Text on dark backgrounds | `$textInverted` |
| Link text | `$textLink` |
| Hovered link/interactive text | `$textHover` |
| Success message | `$textSuccess` |
| Error message | `$textCritical` |
| Warning message | `$textWarning` |
| Info message | `$textInformational` |

#### "I need an icon color for..."

| Use Case | Token |
|----------|-------|
| Default icon | `$iconDefault` |
| Secondary/muted icon | `$iconSubdued` |
| Disabled icon | `$iconDisabled` |
| Icon on dark background | `$iconInverted` |
| Hovered interactive icon | `$iconHovered` |
| Success indicator icon | `$iconSuccess` |
| Error indicator icon | `$iconCritical` |
| Warning indicator icon | `$iconWarning` |
| Info indicator icon | `$iconInfo` |

#### "I need a border color for..."

| Use Case | Token |
|----------|-------|
| Card/section divider | `$borderDefault` |
| More prominent divider | `$borderLoud` |
| Input field (default state) | `$borderInput` |
| Input field (hover state) | `$borderInputHover` |
| Input field (error state) | `$borderInputError` |
| Input field (success state) | `$borderInputSuccess` |
| Input field (disabled state) | `$borderInputDisabled` |
| Focus ring color | `$borderFocus` |
| Outlined/basic button border | `$borderActionBasic` |
| Border on dark backgrounds | `$borderInverted` |
| Data visualization border | `$borderVisualization` |

### Color Anti-Patterns

Avoid these common mistakes:

```tsx
// WRONG: Using raw palette colors directly
<Box css={{ backgroundColor: '$grayscale100' }} />
// CORRECT: Use functional tokens
<Box css={{ backgroundColor: '$bgAccent' }} />

// WRONG: Hardcoded hex values
<Box css={{ color: '#1B1F23' }} />
// CORRECT: Use tokens for theme adaptability
<Box css={{ color: '$textDefault' }} />

// WRONG: Mixing semantic color groups
<Box css={{ backgroundColor: '$bgSuccessDefault', color: '$textCritical' }} />
// CORRECT: Keep semantic groups coordinated
<Box css={{ backgroundColor: '$bgSuccessDefault', color: '$textSuccess' }} />

// WRONG: Using bg token for text color
<Text css={{ color: '$bgActionPrimary' }} />
// CORRECT: Use text-prefixed tokens for text
<Text css={{ color: '$textDefault' }} />

// WRONG: Using opacity for disabled states
<Box css={{ backgroundColor: '$bgDefault', opacity: 0.4 }} />
// CORRECT: Use dedicated disabled tokens
<Box css={{ backgroundColor: '$bgActionPrimaryDisabled' }} />

// WRONG: Using CSS color functions on tokens
<Box css={{ backgroundColor: 'rgba($bgDefault, 0.5)' }} />
// CORRECT: Stitches tokens can't be used inside CSS functions;
// use a pre-defined alpha variant if available
<Box css={{ backgroundColor: '$grayscale900_40' }} />
```

### Semantic Color Coordination Tables

When building status-colored UI, use these coordinated token sets:

#### Success Set

| Element | Token |
|---------|-------|
| Background | `$bgSuccessDefault` |
| Background (accent) | `$bgSuccessAccent` |
| Text | `$textSuccess` |
| Icon | `$iconSuccess` |
| Input border | `$borderInputSuccess` |

#### Critical/Error Set

| Element | Token |
|---------|-------|
| Background | `$bgCriticalDefault` |
| Background (accent) | `$bgCriticalAccent` |
| Text | `$textCritical` |
| Icon | `$iconCritical` |
| Input border | `$borderInputError` |

#### Warning Set

| Element | Token |
|---------|-------|
| Background | `$bgWarningDefault` |
| Background (accent) | `$bgWarningAccent` |
| Text | `$textWarning` |
| Icon | `$iconWarning` |

#### Informational Set

| Element | Token |
|---------|-------|
| Background | `$bgInformationalDefault` |
| Background (accent) | `$bgInformationalAccent` |
| Text | `$textInformational` |
| Icon | `$iconInfo` |

#### Guidance Set

| Element | Token |
|---------|-------|
| Background | `$bgGuidanceDefault` |
| Background (accent) | `$bgGuidanceAccent` |
| Icon | `$iconGuidance` |

#### Decorative Sets (1-4)

| Element | Set 1 (Celery) | Set 2 (Cloud) | Set 3 (Steel) | Set 4 (Lavender) |
|---------|---------------|---------------|---------------|-------------------|
| Background | `$bgDecorative1Default` | `$bgDecorative2Default` | `$bgDecorative3Default` | `$bgDecorative4Default` |
| Bg Accent | `$bgDecorative1Accent` | `$bgDecorative2Accent` | `$bgDecorative3Accent` | `$bgDecorative4Accent` |
| Text | `$textDecorative1` | `$textDecorative2` | `$textDecorative3` | `$textDecorative4` |
| Icon | `$iconDecorative1` | `$iconDecorative2` | `$iconDecorative3` | `$iconDecorative4` |

Use decorative sets for category differentiation (e.g., tag colors, chart legends, metric cards):

```tsx
// Category tags using coordinated decorative sets
const categories = [
  { label: 'Marketing', bg: '$bgDecorative1Default', text: '$textDecorative1' },
  { label: 'Product', bg: '$bgDecorative2Default', text: '$textDecorative2' },
  { label: 'Engineering', bg: '$bgDecorative3Default', text: '$textDecorative3' },
  { label: 'Design', bg: '$bgDecorative4Default', text: '$textDecorative4' },
];

function CategoryTag({ label, bg, text }: typeof categories[0]) {
  return (
    <Box css={{
      backgroundColor: bg,
      color: text,
      borderRadius: '$radiusMax',
      px: '$space3',
      py: '$space1',
      display: 'inline-flex',
      alignItems: 'center',
    }}>
      <Text variant="micro" css={{ fontWeight: '$bold' }}>{label}</Text>
    </Box>
  );
}
```

### Interactive State Progressions

Components that respond to user interaction should follow these token progressions:

#### Primary Action States

```tsx
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
```

#### Secondary Action States

```tsx
const SecondaryButton = styled('button', {
  backgroundColor: '$bgActionSecondary',         // Default: #E2E3E3
  color: '$textDefault',
  '&:hover': {
    backgroundColor: '$bgActionSecondaryHover',   // Hover: #C6C7C8
  },
  '&:active': {
    backgroundColor: '$bgActionSecondaryPressed', // Pressed: #8D8F91
  },
  '&:disabled': {
    backgroundColor: '$bgActionSecondaryDisabled', // Disabled: rgba(226,227,227,0.4)
    cursor: 'not-allowed',
  },
});
```

#### Basic/Outlined Action States

```tsx
const BasicButton = styled('button', {
  backgroundColor: '$bgActionBasic',        // Default: #FFFFFF
  border: '$borderWidths$borderWidth1 solid $colors$borderActionBasic',
  color: '$textDefault',
  '&:hover': {
    backgroundColor: '$bgActionBasicHover',  // Hover: #EFF0F0
  },
  '&:active': {
    backgroundColor: '$bgActionBasicPressed', // Pressed: #E2E3E3
  },
  '&:disabled': {
    borderColor: '$borderActionBasicDisabled',
    color: '$textDisabled',
    cursor: 'not-allowed',
  },
});
```

#### Row/List Item States

```tsx
const ListItem = styled('div', {
  backgroundColor: '$bgRow',          // Default: #FFFFFF
  '&:hover': {
    backgroundColor: '$bgRowHover',    // Hover: #EFF0F0
  },
  '&:active': {
    backgroundColor: '$bgRowPressed',  // Pressed: #E2E3E3
  },
  variants: {
    selected: {
      true: {
        backgroundColor: '$bgRowSelected',     // Selected: #E2E3E3
        '&:hover': {
          backgroundColor: '$bgRowSelectedHover',   // Selected + hover: #E2E3E3
        },
        '&:active': {
          backgroundColor: '$bgRowSelectedPressed', // Selected + pressed: #C6C7C8
        },
      },
    },
  },
});
```

#### Toggle States

```tsx
const ToggleButton = styled('button', {
  backgroundColor: '$bgToggleDefault',    // Default: #FFFFFF
  '&:hover': {
    backgroundColor: '$bgToggleHover',     // Hover: #E2E3E3
  },
  '&:active': {
    backgroundColor: '$bgTogglePressed',   // Pressed: #C6C7C8
  },
  variants: {
    selected: {
      true: {
        backgroundColor: '$bgToggleSelected',    // Selected: #1B1F23
        color: '$textSelectedToggle',
        borderColor: '$borderSelectedToggle',
      },
    },
  },
});
```

#### Input Border States

```tsx
const StyledInput = styled('input', {
  border: '$borderWidths$borderWidth1 solid $colors$borderInput', // Default: #545759
  '&:hover': {
    borderColor: '$borderInputHover',    // Hover: #000000
  },
  '&:focus': {
    outline: 'none',
    boxShadow: '$inputFocus',            // Focus ring: 1px solid #1B1F23
  },
  '&:disabled': {
    borderColor: '$borderInputDisabled', // Disabled: rgba(84,87,89,0.4)
  },
  variants: {
    state: {
      error: {
        borderColor: '$borderInputError',   // Error: #ED3553
      },
      success: {
        borderColor: '$borderInputSuccess', // Success: #3AA372
      },
    },
  },
});
```

### Complete Color Token Inventory

Summary of all functional color tokens by count:

| Category | Prefix | Count | Token Names |
|----------|--------|-------|-------------|
| Surface backgrounds | `$bg` (no Action/Row/Toggle) | 12 | Default, AccentSubtle, Accent, AccentDark, Placeholder, PlaceholderAlt, Overlay, Tooltip, Brand, Inverted, InvertedDisabled, Highlighted |
| Primary action | `$bgActionPrimary*` | 4 | (base), Hover, Pressed, Disabled |
| Secondary action | `$bgActionSecondary*` | 4 | (base), Hover, Pressed, Disabled |
| Basic action | `$bgActionBasic*` | 3 | (base), Hover, Pressed |
| Row states | `$bgRow*` | 6 | (base), Hover, Pressed, Selected, SelectedHover, SelectedPressed |
| Toggle states | `$bgToggle*` | 4 | Default, Hover, Pressed, Selected |
| Semantic status | `$bg{Status}*` | 10 | Success Default/Accent, Critical Default/Accent, Warning Default/Accent, Informational Default/Accent, Guidance Default/Accent |
| Decorative | `$bgDecorative*` | 8 | 1-4, each with Default and Accent |
| Gradients | `$bgGradient*` | 2 | Magic, MagicFallback |
| **Total backgrounds** | `$bg*` | **53** | |
| Text | `$text*` | 16 | Default, Subdued, Disabled, Inverted, Link, Hover, Pressed, SelectedToggle, Success, Warning, Critical, Informational, Decorative 1-4 |
| Icons | `$icon*` | 15 | Default, Subdued, Disabled, Inverted, Hovered, Pressed, Success, Warning, Critical, Info, Guidance, Decorative 1-4 |
| Borders | `$border*` | 13 | Default, Loud, Visualization, Inverted, Input, InputHover, InputSuccess, InputError, InputDisabled, ActionBasic, ActionBasicDisabled, Focus, SelectedToggle |
| **Total functional colors** | | **97** | |

---

## 3. Space and Size Tokens

### Space Tokens

The space scale follows a 4px grid system. Use space tokens for all margin, padding, and gap values.

| Token | Value | Pixels | Common Use |
|-------|-------|--------|-----------|
| `$space0` | `0` | 0px | Reset spacing |
| `$space1` | `4px` | 4px | Tightest spacing, inline icon gaps |
| `$space2` | `8px` | 8px | Tight spacing, between related elements |
| `$space3` | `12px` | 12px | Default component internal padding |
| `$space4` | `16px` | 16px | Standard spacing, card padding |
| `$space5` | `20px` | 20px | Medium spacing |
| `$space6` | `24px` | 24px | Large component padding, section spacing |
| `$space7` | `28px` | 28px | Between-section spacing |
| `$space8` | `32px` | 32px | Large section spacing |
| `$space9` | `36px` | 36px | Extra large spacing |
| `$space10` | `40px` | 40px | Page-level spacing |
| `$space11` | `44px` | 44px | Touch target minimum |
| `$space12` | `48px` | 48px | Large page-level spacing |
| `$space13` | `52px` | 52px | Extra large page spacing |
| `$space14` | `56px` | 56px | Major section breaks |
| `$space15` | `60px` | 60px | Page margin |
| `$space16` | `64px` | 64px | Maximum spacing value |

#### Common Spacing Patterns

| Pattern | Recommended Token | Pixels |
|---------|-------------------|--------|
| Icon-to-label gap (inline) | `$space1` | 4px |
| Tight element group spacing | `$space2` | 8px |
| Input internal padding | `$space3` | 12px |
| Standard card padding | `$space4` | 16px |
| Section padding | `$space6` | 24px |
| Page container padding | `$space6` to `$space8` | 24-32px |
| Between major page sections | `$space8` to `$space12` | 32-48px |
| Form field vertical spacing | `$space4` | 16px |
| Button group gap | `$space2` | 8px |
| Stack default spacing | `$space4` | 16px |

#### Space Token Usage

```tsx
// Direct usage in css prop
<Box css={{ padding: '$space4', marginBottom: '$space6', gap: '$space2' }} />

// Using Stitches utility shorthands (preferred)
<Box css={{ p: '$space4', mb: '$space6', gap: '$space2' }} />

// Stack spacing
<Stack spacing="$space4">
  <Text>Item 1</Text>
  <Text>Item 2</Text>
</Stack>
```

#### Spacing Anti-Patterns

```tsx
// WRONG: Hardcoded pixel values
<Box css={{ padding: '16px', marginBottom: '24px' }} />
// CORRECT: Use space tokens for consistency
<Box css={{ p: '$space4', mb: '$space6' }} />

// WRONG: Non-grid-aligned spacing
<Box css={{ padding: '13px' }} />
// CORRECT: Stick to 4px grid tokens
<Box css={{ p: '$space3' }} /> // 12px — closest grid value

// WRONG: Using longhand when shorthand is available
<Box css={{ paddingLeft: '$space4', paddingRight: '$space4' }} />
// CORRECT: Use utility shorthands
<Box css={{ px: '$space4' }} />

// WRONG: Negative margins with arbitrary values
<Box css={{ marginTop: '-10px' }} />
// CORRECT: Use negative token reference (sparingly)
<Box css={{ mt: '-$space2' }} />
```

### Size Tokens

Size tokens share the same 4px grid as space tokens. Use them for width, height, min-width, max-width, min-height, and max-height properties.

| Token | Value | Pixels | Common Use |
|-------|-------|--------|-----------|
| `$size0` | `0` | 0px | Hidden/collapsed |
| `$size1` | `4px` | 4px | Smallest indicator |
| `$size2` | `8px` | 8px | Small indicator, dot |
| `$size3` | `12px` | 12px | Small icon container |
| `$size4` | `16px` | 16px | Default icon size |
| `$size5` | `20px` | 20px | Medium icon size |
| `$size6` | `24px` | 24px | Standard icon size, avatar small |
| `$size7` | `28px` | 28px | Badge/chip height |
| `$size8` | `32px` | 32px | Small input height |
| `$size9` | `36px` | 36px | Small button height |
| `$size10` | `40px` | 40px | Default input height |
| `$size11` | `44px` | 44px | Touch target size |
| `$size12` | `48px` | 48px | Medium button height |
| `$size13` | `52px` | 52px | Large button height |
| `$size14` | `56px` | 56px | Toolbar height |
| `$size15` | `60px` | 60px | Header element |
| `$size16` | `64px` | 64px | Large header/avatar |

#### Breakpoint Width Sizes

In addition to the numbered sizes, the size scale includes breakpoint widths (imported from the `media` module). These are useful for max-width constraints:

| Token | Value | Purpose |
|-------|-------|---------|
| `$bp1` | `640px` | Small breakpoint width |
| `$bp2` | `768px` | Medium breakpoint width |
| `$bp3` | `1024px` | Large breakpoint width |
| `$bp4` | `1280px` | Extra-large breakpoint width |

```tsx
// Container with max-width at breakpoint
<Box css={{ maxWidth: '$bp3', mx: 'auto' }} />

// Fixed-width sidebar
<Box css={{ width: '280px', minHeight: '100vh' }} />
```

#### Size Token Usage

```tsx
// Component dimensions
<Box css={{ width: '$size16', height: '$size16' }} />

// Min/max constraints
<Box css={{ minHeight: '$size11', maxWidth: '$bp3' }} />

// Icon sizing
<Icon name="Check" css={{ width: '$size5', height: '$size5' }} mode="decorative" />
```

### Stitches Space and Size Utility Shorthands

Picnic registers custom Stitches utilities for common spacing operations. These accept any space or size token.

#### Padding Utilities

| Utility | Expands To | Example |
|---------|-----------|---------|
| `p` | `padding` | `p: '$space4'` → `padding: 16px` |
| `pt` | `paddingTop` | `pt: '$space2'` → `paddingTop: 8px` |
| `pr` | `paddingRight` | `pr: '$space3'` → `paddingRight: 12px` |
| `pb` | `paddingBottom` | `pb: '$space4'` → `paddingBottom: 16px` |
| `pl` | `paddingLeft` | `pl: '$space2'` → `paddingLeft: 8px` |
| `px` | `paddingLeft` + `paddingRight` | `px: '$space4'` → `paddingLeft: 16px; paddingRight: 16px` |
| `py` | `paddingTop` + `paddingBottom` | `py: '$space3'` → `paddingTop: 12px; paddingBottom: 12px` |

#### Margin Utilities

| Utility | Expands To | Example |
|---------|-----------|---------|
| `m` | `margin` | `m: '$space4'` → `margin: 16px` |
| `mt` | `marginTop` | `mt: '$space2'` → `marginTop: 8px` |
| `mr` | `marginRight` | `mr: '$space3'` → `marginRight: 12px` |
| `mb` | `marginBottom` | `mb: '$space4'` → `marginBottom: 16px` |
| `ml` | `marginLeft` | `ml: '$space2'` → `marginLeft: 8px` |
| `mx` | `marginLeft` + `marginRight` | `mx: 'auto'` → `marginLeft: auto; marginRight: auto` |
| `my` | `marginTop` + `marginBottom` | `my: '$space3'` → `marginTop: 12px; marginBottom: 12px` |

#### Usage Examples

```tsx
// Card with uniform padding
<Box css={{ p: '$space4', backgroundColor: '$bgDefault', borderRadius: '$radius2' }}>
  <Heading variant="md">Title</Heading>
  <Text css={{ mt: '$space2' }}>Content</Text>
</Box>

// Centered container with horizontal padding
<Box css={{ px: '$space6', mx: 'auto', maxWidth: '$bp3' }}>
  <Stack spacing="$space4">{children}</Stack>
</Box>

// Form field spacing
<Box css={{ mb: '$space4' }}>
  <TextInput label="Email" />
</Box>

// Asymmetric padding
<Box css={{ pt: '$space6', pb: '$space8', px: '$space4' }}>
  <Text>Asymmetric padded content</Text>
</Box>
```

### Other Custom Stitches Utilities

Beyond spacing shorthands, Picnic registers these additional utilities in the Stitches config:

#### `focusVisible`

Generates accessible focus ring styles using `:focus`, `:focus:not(:focus-visible)`, and `:focus-visible` pseudo-classes:

```tsx
// Usage
const FocusableElement = styled('button', {
  focusVisible: '$focus',
});

// Generates:
// content: 'picnicFocusVisible' (marker for identification)
// &:focus { outline: none; box-shadow: 0 0 0 2px white, 0 0 0 4px dark; }
// &:focus:not(:focus-visible) { box-shadow: none; }
// &:focus-visible { box-shadow: 0 0 0 2px white, 0 0 0 4px dark; }
```

The `focusVisible` utility accepts any `boxShadow` value. Use `$focus` for the standard double-ring focus indicator and `$inputFocus` for the thinner single-ring variant:

```tsx
// Standard focus ring (buttons, cards, interactive containers)
focusVisible: '$focus'

// Input focus ring (text inputs, selects, textareas)
focusVisible: '$inputFocus'

// Custom focus ring (special cases only)
focusVisible: '0 0 0 3px $colors$bgActionPrimary'
```

#### `defaultTransition`

Generates a CSS transition with `0.2s ease 0s` timing for one or more properties:

```tsx
// Usage
const AnimatedCard = styled('div', {
  defaultTransition: ['background-color', 'box-shadow', 'color'],
});

// Generates:
// transition: background-color .2s ease 0s, box-shadow .2s ease 0s, color .2s ease 0s

// Common patterns
defaultTransition: ['background-color']               // Hover bg transitions
defaultTransition: ['box-shadow']                      // Focus ring transitions
defaultTransition: ['background-color', 'box-shadow']  // Interactive elements
defaultTransition: ['color']                           // Text color transitions
defaultTransition: ['opacity']                         // Fade effects
defaultTransition: ['transform']                       // Scale/translate effects
```

#### `gridTemplateColumnsRepeat`

Shorthand for creating equal-width CSS Grid columns:

```tsx
// Usage
<Box css={{ display: 'grid', gridTemplateColumnsRepeat: 3, gap: '$space4' }}>
  <div>Col 1</div>
  <div>Col 2</div>
  <div>Col 3</div>
</Box>

// Generates:
// grid-template-columns: repeat(3, minmax(0, 1fr))
```

#### `gridColumnSpan`

Shorthand for spanning multiple grid columns:

```tsx
// Usage
<Box css={{ gridColumnSpan: 2 }}>
  This element spans 2 columns
</Box>

// Generates:
// grid-column: span 2

// Common grid layout pattern
<Box css={{ display: 'grid', gridTemplateColumnsRepeat: 4, gap: '$space4' }}>
  <Box css={{ gridColumnSpan: 2 }}>Wide item (2 of 4 cols)</Box>
  <Box>Regular item</Box>
  <Box>Regular item</Box>
  <Box css={{ gridColumnSpan: 4 }}>Full width item</Box>
</Box>
```

#### `maxLines`

Implements CSS line clamping to truncate text after a specified number of lines with an ellipsis:

```tsx
// Usage
<Text css={{ maxLines: 2 }}>
  This long text will be truncated after two lines and
  show an ellipsis at the end of the second line...
</Text>

// Generates:
// display: -webkit-box
// -webkit-box-orient: vertical
// overflow: hidden
// -webkit-line-clamp: 2

// Common pattern: Card description preview
<Box css={{ p: '$space4', backgroundColor: '$bgDefault' }}>
  <Heading variant="sm">Card Title</Heading>
  <Text variant="caption" color="subdued" css={{ maxLines: 3, mt: '$space2' }}>
    {longDescription}
  </Text>
</Box>
```

#### `safariOnly`

Applies styles exclusively to Safari browsers using a CSS media query hack:

```tsx
// Usage
const SafariFixedElement = styled('div', {
  safariOnly: {
    WebkitOverflowScrolling: 'touch',
    transform: 'translateZ(0)',
  },
});

// Generates:
// content: 'picnicSafariOnly' (marker)
// @media not all and (min-resolution:.001dpcm) {
//   @supports (-webkit-appearance:none) {
//     -webkit-overflow-scrolling: touch;
//     transform: translateZ(0);
//   }
// }
```

Use `safariOnly` sparingly — only for Safari-specific rendering bugs that cannot be fixed with standard CSS.

#### `listStyleOverride`

Resets list styles for unstyled lists:

```tsx
// Usage
<Box as="ul" css={{ listStyleOverride: 'unstyled' }}>
  <li>Item without bullet</li>
  <li>Item without bullet</li>
</Box>

// Generates:
// margin: 0
// padding: 0
// list-style: none
```

### Complete Utility Reference Table

| Utility | Input Type | Description | Example |
|---------|-----------|-------------|---------|
| `p` | Space token | All padding | `p: '$space4'` |
| `pt` | Space token | Padding top | `pt: '$space2'` |
| `pr` | Space token | Padding right | `pr: '$space3'` |
| `pb` | Space token | Padding bottom | `pb: '$space4'` |
| `pl` | Space token | Padding left | `pl: '$space2'` |
| `px` | Space token | Padding left + right | `px: '$space4'` |
| `py` | Space token | Padding top + bottom | `py: '$space3'` |
| `m` | Space token | All margin | `m: '$space4'` |
| `mt` | Space token | Margin top | `mt: '$space2'` |
| `mr` | Space token | Margin right | `mr: '$space3'` |
| `mb` | Space token | Margin bottom | `mb: '$space4'` |
| `ml` | Space token | Margin left | `ml: '$space2'` |
| `mx` | Space token / `auto` | Margin left + right | `mx: 'auto'` |
| `my` | Space token | Margin top + bottom | `my: '$space3'` |
| `focusVisible` | Shadow token | Accessible focus ring | `focusVisible: '$focus'` |
| `defaultTransition` | `string[]` | 0.2s ease transition | `defaultTransition: ['color']` |
| `gridTemplateColumnsRepeat` | `number` | Equal grid columns | `gridTemplateColumnsRepeat: 3` |
| `gridColumnSpan` | `number` | Grid column span | `gridColumnSpan: 2` |
| `maxLines` | `number` | CSS line clamp | `maxLines: 3` |
| `safariOnly` | CSS object | Safari-only styles | `safariOnly: { ... }` |
| `listStyleOverride` | `'unstyled'` | Remove list styles | `listStyleOverride: 'unstyled'` |

---

## 4. Typography Tokens

### Font Family Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `$display` | `Ginto Nord` | Headings, display text, bold titles |
| `$body` | `Ginto Normal` | Body text, labels, captions, all other text |

```tsx
// Headings automatically use $display
<Heading variant="lg">Page Title</Heading>

// Body text automatically uses $body
<Text>Regular content text</Text>

// Override font family in css prop
<Box css={{ fontFamily: '$display' }}>Display Font Content</Box>
```

### Font Size Tokens

| Token | rem Value | Pixel Equivalent | Typical Use |
|-------|-----------|-----------------|-------------|
| `$fontSize1` | `0.75rem` | 12px | Micro text, badges, timestamps |
| `$fontSize2` | `0.875rem` | 14px | Captions, small labels, table cells |
| `$fontSize3` | `1rem` | 16px | Body text (default), buttons |
| `$fontSize4` | `1.25rem` | 20px | Lede text, large body |
| `$fontSize5` | `1.5rem` | 24px | Small headings |
| `$fontSize6` | `1.75rem` | 28px | Medium headings |
| `$fontSize7` | `2rem` | 32px | Large headings, page titles |

```tsx
// Use in css prop
<Text css={{ fontSize: '$fontSize4' }}>Larger body text</Text>

// Font size with line height
<Box css={{ fontSize: '$fontSize2', lineHeight: '$lineHeight5' }}>
  Caption text with proper line height
</Box>
```

### Font Weight Tokens

Picnic has exactly **two font weights**. There is no semibold, medium, light, or extra-bold. Do not attempt to use numeric values other than 400 or 500.

| Token | Value | Usage |
|-------|-------|-------|
| `$regular` | `400` | All body text, labels, descriptions, default weight |
| `$bold` | `500` | Headings, emphasis, buttons, strong text |

```tsx
// Regular weight (default)
<Text>This text uses $regular (400) by default</Text>

// Bold weight
<Text css={{ fontWeight: '$bold' }}>Emphasized text</Text>

// Note: <b> and <strong> tags are styled to use $bold (500) via the theme reset
```

### Line Height Tokens

| Token | Value | Typical Pairing |
|-------|-------|----------------|
| `$lineHeight1` | `1` | Tight display text, single-line headings |
| `$lineHeight2` | `1.25` | Default body text (applied by theme reset) |
| `$lineHeight3` | `1.285` | Slightly looser body text |
| `$lineHeight4` | `1.333` | Medium line height |
| `$lineHeight5` | `1.4` | Comfortable reading, multi-line captions |
| `$lineHeight6` | `1.428` | Open line height |
| `$lineHeight7` | `1.5` | Maximum line height, accessibility-friendly |

The theme reset applies `$lineHeight2` (1.25) as the global default line height.

```tsx
// Override line height for multi-line content
<Text css={{ lineHeight: '$lineHeight7' }}>
  Long paragraph text that benefits from increased line height
  for better readability.
</Text>
```

### Letter Spacing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `$letterSpacing0` | `0px` | Reset/no tracking |
| `$letterSpacing1` | `0.3px` | Default body text (applied by theme reset) |
| `$letterSpacing2` | `0.5px` | Wide tracking for uppercase/display text |

The theme reset applies `$letterSpacing1` (0.3px) as the global default letter spacing.

```tsx
// Uppercase text with wider tracking
<Text css={{ textTransform: 'uppercase', letterSpacing: '$letterSpacing2' }}>
  Section Label
</Text>
```

### Heading Component Variant-to-Token Mapping

The `Heading` component uses `$display` (Ginto Nord) font family with these variant-to-token mappings:

| Variant | Font Size | Font Weight | Line Height | Usage |
|---------|-----------|-------------|-------------|-------|
| `page` | `$fontSize7` (2rem/32px) | `$bold` (500) | `$lineHeight1` (1) | Page-level titles |
| `xl` | `$fontSize6` (1.75rem/28px) | `$bold` (500) | `$lineHeight1` (1) | Extra large section headings |
| `lg` | `$fontSize5` (1.5rem/24px) | `$bold` (500) | `$lineHeight1` (1) | Large section headings |
| `md` | `$fontSize4` (1.25rem/20px) | `$bold` (500) | `$lineHeight2` (1.25) | Medium headings |
| `sm` | `$fontSize3` (1rem/16px) | `$bold` (500) | `$lineHeight2` (1.25) | Small headings |
| `subheading` | `$fontSize1` (0.75rem/12px) | `$bold` (500) | `$lineHeight2` (1.25) | Subheadings, section labels |

```tsx
<Heading variant="page">Page Title</Heading>
<Heading variant="lg">Section</Heading>
<Heading variant="sm">Card Title</Heading>
<Heading variant="subheading" css={{ textTransform: 'uppercase' }}>
  Label
</Heading>
```

### Text Component Variant-to-Token Mapping

The `Text` component uses `$body` (Ginto Normal) font family with these variant-to-token mappings:

| Variant | Font Size | Font Weight | Line Height | Usage |
|---------|-----------|-------------|-------------|-------|
| `lede` | `$fontSize4` (1.25rem/20px) | `$regular` (400) | `$lineHeight5` (1.4) | Introductory text, large body |
| `body` | `$fontSize3` (1rem/16px) | `$regular` (400) | `$lineHeight5` (1.4) | Default body text |
| `caption` | `$fontSize2` (0.875rem/14px) | `$regular` (400) | `$lineHeight5` (1.4) | Captions, secondary text |
| `micro` | `$fontSize1` (0.75rem/12px) | `$regular` (400) | `$lineHeight5` (1.4) | Smallest text, timestamps, badges |

```tsx
<Text variant="lede">Introductory paragraph text</Text>
<Text>Default body text (variant="body" is default)</Text>
<Text variant="caption" color="subdued">Secondary information</Text>
<Text variant="micro">12:34 PM</Text>
```

### Typography Color Variants

Both `Heading` and `Text` accept a `color` prop with these values (mapped to functional tokens):

| Color Prop Value | Token Used |
|-----------------|-----------|
| `default` | `$textDefault` |
| `subdued` | `$textSubdued` |
| `inverted` | `$textInverted` |
| `success` | `$textSuccess` |
| `warning` | `$textWarning` |
| `critical` | `$textCritical` |
| `info` | `$textInformational` |
| `decorative1` | `$textDecorative1` |
| `decorative2` | `$textDecorative2` |
| `decorative3` | `$textDecorative3` |
| `decorative4` | `$textDecorative4` |

```tsx
<Text color="subdued">Muted secondary text</Text>
<Text color="critical">Error message text</Text>
<Text color="success">Success message text</Text>
<Heading variant="sm" color="inverted">Heading on dark background</Heading>
```

### Typography Composition Patterns

#### Page Header Pattern

```tsx
<Box css={{ mb: '$space8' }}>
  <Heading variant="page">Dashboard</Heading>
  <Text variant="lede" color="subdued" css={{ mt: '$space2' }}>
    Overview of your account activity and metrics
  </Text>
</Box>
```

#### Section Header Pattern

```tsx
<Box css={{ mb: '$space4' }}>
  <Heading variant="lg">Recent Activity</Heading>
  <Text variant="caption" color="subdued" css={{ mt: '$space1' }}>
    Last 30 days
  </Text>
</Box>
```

#### Card Title Pattern

```tsx
<Box css={{ p: '$space4', backgroundColor: '$bgDefault', borderRadius: '$radius2' }}>
  <Heading variant="sm">Campaign Performance</Heading>
  <Text variant="body" css={{ mt: '$space2' }}>
    Your campaigns reached 1.2M subscribers this month.
  </Text>
  <Text variant="micro" color="subdued" css={{ mt: '$space3' }}>
    Updated 5 minutes ago
  </Text>
</Box>
```

#### Data Label Pattern

```tsx
<Box>
  <Heading variant="subheading" css={{ textTransform: 'uppercase', mb: '$space1' }}>
    Total Revenue
  </Heading>
  <Text css={{ fontSize: '$fontSize5', fontWeight: '$bold' }}>$45,230</Text>
  <Text variant="caption" color="success" css={{ mt: '$space1' }}>
    +12.5% from last month
  </Text>
</Box>
```

### Typography Anti-Patterns

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
<Text css={{ fontSize: '$fontSize4' }}>Large body (20px)</Text>

// WRONG: Setting font-family to system fonts
<Text css={{ fontFamily: 'Arial, sans-serif' }}>System font</Text>
// CORRECT: Use Picnic font tokens
<Text css={{ fontFamily: '$body' }}>Ginto Normal</Text>
<Text css={{ fontFamily: '$display' }}>Ginto Nord</Text>

// WRONG: Using Heading for non-heading text just for styling
<Heading variant="sm">This is just bold body text, not a heading</Heading>
// CORRECT: Use Text with bold weight for emphasis
<Text css={{ fontWeight: '$bold' }}>This is bold body text</Text>

// WRONG: Using css prop when a component variant exists
<Text css={{ fontSize: '$fontSize4', lineHeight: '$lineHeight5' }}>Large text</Text>
// CORRECT: Use the lede variant which sets these automatically
<Text variant="lede">Large text</Text>
```

### Complete Typography Token Inventory

| Scale | Token Count | Token Range |
|-------|-------------|-------------|
| Fonts | 2 | `$display`, `$body` |
| Font Sizes | 7 | `$fontSize1` (12px) through `$fontSize7` (32px) |
| Font Weights | 2 | `$regular` (400), `$bold` (500) |
| Line Heights | 7 | `$lineHeight1` (1) through `$lineHeight7` (1.5) |
| Letter Spacings | 3 | `$letterSpacing0` (0px) through `$letterSpacing2` (0.5px) |
| **Total** | **21** | |

---

## 5. Other Tokens

### Border Radius Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `$radius1` | `4px` | Subtle rounding, small elements (badges, tags) |
| `$radius2` | `8px` | Standard rounding (cards, inputs, buttons) |
| `$radius3` | `16px` | Large rounding (dialogs, modals) |
| `$radiusMax` | `9999px` | Pill/circular shape (avatars, chips, full-round buttons) |

```tsx
// Standard card
<Box css={{ borderRadius: '$radius2', p: '$space4', backgroundColor: '$bgAccent' }}>
  Card content
</Box>

// Pill badge
<Box css={{
  borderRadius: '$radiusMax',
  px: '$space3',
  py: '$space1',
  backgroundColor: '$bgActionPrimary',
}}>
  <Text variant="micro">Badge</Text>
</Box>

// Circular avatar
<Box css={{
  borderRadius: '$radiusMax',
  width: '$size10',
  height: '$size10',
  overflow: 'hidden',
}}>
  <img src={avatarUrl} alt="User" />
</Box>

// Dialog content
<Dialog>
  <Dialog.Content css={{ borderRadius: '$radius3' }}>
    Dialog body
  </Dialog.Content>
</Dialog>
```

### Border Width Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `$borderWidth0` | `0px` | No border |
| `$borderWidth1` | `1px` | Standard borders (dividers, cards, inputs default) |
| `$borderWidth2` | `2px` | Emphasized borders (focus, active states) |
| `$borderWidth3` | `4px` | Heavy borders (decorative, strong emphasis) |

```tsx
// Standard 1px divider
<Box css={{ borderBottom: '$borderWidths$borderWidth1 solid $colors$borderDefault' }} />

// Input with error (2px border)
<Box css={{ border: '$borderWidths$borderWidth2 solid $colors$borderInputError' }} />

// Decorative heavy border
<Box css={{
  borderLeft: '$borderWidths$borderWidth3 solid $colors$bgActionPrimary',
  pl: '$space4',
}}>
  <Text>Highlighted content</Text>
</Box>
```

### Shadow Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `$focus` | `0 0 0 2px $colors$bgDefault, 0 0 0 4px $colors$borderFocus` | Focus ring (double ring: inner white, outer dark) |
| `$inputFocus` | `0 0 0 1px $colors$borderFocus` | Input focus ring (single ring) |
| `$drastic` | `0 8px 16px 0 rgba(0, 48, 45, 0.25)` | Heavy drop shadow for dramatic elevation |
| `$shadow1` | `0px 4px 12px 0px $colors$grayscale900_08` | Lightest elevation (subtle lift) |
| `$shadow2` | `0 4px 16px 0 $colors$grayscale900_12` | Low elevation (cards, dropdowns) |
| `$shadow3` | `6px 6px 20px 4px $colors$grayscale900_16` | Medium elevation (popovers) |
| `$shadow4` | `0 10px 25px 6px $colors$grayscale900_24` | Highest elevation (dialogs, drawers) |

#### Shadow Elevation Hierarchy

Use shadows to communicate visual hierarchy:

```
$shadow1 (8% opacity) → Subtle lift (cards resting)
$shadow2 (12% opacity) → Low elevation (hover cards, dropdown menus)
$shadow3 (16% opacity) → Medium elevation (popovers, floating panels)
$shadow4 (24% opacity) → High elevation (dialogs, drawers, modals)
$drastic (25% opacity) → Maximum elevation (special emphasis)
```

#### Focus Ring Patterns

```tsx
// Using the focusVisible utility (preferred)
const FocusableCard = styled('div', {
  focusVisible: '$focus',
  // Generates:
  // &:focus { outline: none; box-shadow: 0 0 0 2px white, 0 0 0 4px dark; }
  // &:focus:not(:focus-visible) { box-shadow: none; }
  // &:focus-visible { box-shadow: 0 0 0 2px white, 0 0 0 4px dark; }
});

// Input focus ring
const StyledInput = styled('input', {
  '&:focus': {
    outline: 'none',
    boxShadow: '$inputFocus',
  },
});

// Manual shadow usage
<Box css={{ boxShadow: '$shadow2' }}>Elevated card</Box>
```

#### Shadow Usage Examples

```tsx
// Card with shadow on hover
const HoverCard = styled('div', {
  backgroundColor: '$bgDefault',
  borderRadius: '$radius2',
  p: '$space4',
  boxShadow: '$shadow1',
  defaultTransition: ['box-shadow'],
  '&:hover': {
    boxShadow: '$shadow2',
  },
});

// Dialog shadow
<Dialog>
  <Dialog.Content css={{ boxShadow: '$shadow4' }}>
    Modal content with high elevation
  </Dialog.Content>
</Dialog>

// Dropdown shadow
<DropdownMenu>
  <DropdownMenu.Content css={{ boxShadow: '$shadow3' }}>
    <DropdownMenu.Item>Option 1</DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu>
```

### Z-Index Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `$layer0` | `0` | Default stacking, base level |
| `$layer1` | `10000` | Sticky headers, fixed sidebars |
| `$layer2` | `20000` | Dropdown menus, popovers |
| `$layer3` | `30000` | Modals, dialogs, drawers |
| `$layer4` | `40000` | Tooltips, toasts, notifications |
| `$layerMax` | `2147483647` | Maximum z-index (loading overlays, critical UI) |

The 10,000 gap between layers provides ample room for intermediate stacking within each layer without collisions.

```tsx
// Sticky header
<Box css={{ position: 'sticky', top: 0, zIndex: '$layer1' }}>
  <Header />
</Box>

// Dropdown overlay
<Box css={{ position: 'absolute', zIndex: '$layer2' }}>
  <DropdownContent />
</Box>

// Modal dialog
<Box css={{ position: 'fixed', zIndex: '$layer3' }}>
  <Dialog.Content>...</Dialog.Content>
</Box>

// Toast notification (above everything)
<Box css={{ position: 'fixed', zIndex: '$layer4', top: '$space4', right: '$space4' }}>
  <Banner variant="success">Saved successfully</Banner>
</Box>
```

#### Z-Index Stacking Guidelines

1. Use `$layer0` for all content in the normal document flow
2. Use `$layer1` for persistent UI that should float above scrolling content
3. Use `$layer2` for interactive overlays (dropdowns, popovers) triggered by user action
4. Use `$layer3` for modal overlays that block interaction with underlying content
5. Use `$layer4` for notifications and tooltips that should appear above modals
6. Reserve `$layerMax` for emergency/loading states only
7. Never use arbitrary z-index values — always use layer tokens

#### Z-Index Anti-Patterns

```tsx
// WRONG: Arbitrary z-index values
<Box css={{ zIndex: 9999 }} />
<Box css={{ zIndex: 100 }} />
// CORRECT: Use layer tokens
<Box css={{ zIndex: '$layer2' }} />

// WRONG: Incrementing z-index to "go above" something
<Box css={{ zIndex: '$layer2' }} />
<Box css={{ zIndex: 20001 }} /> // trying to go above layer2
// CORRECT: Use the next layer up
<Box css={{ zIndex: '$layer3' }} />

// WRONG: Using layerMax for regular overlays
<Box css={{ zIndex: '$layerMax' }} />
// CORRECT: Reserve layerMax for true emergencies
<Box css={{ zIndex: '$layer3' }} />
```

### Border Radius Decision Guide

| Element Type | Recommended Radius | Token |
|-------------|-------------------|-------|
| Small badges, tags, labels | Subtle rounding | `$radius1` (4px) |
| Cards, containers, inputs | Standard rounding | `$radius2` (8px) |
| Dialogs, modals, large panels | Large rounding | `$radius3` (16px) |
| Pill shapes, chips, avatars | Full round | `$radiusMax` (9999px) |
| No rounding needed | None | `0` (plain CSS) |

### Shadow Decision Guide

| Scenario | Recommended Shadow |
|----------|-------------------|
| Card at rest (subtle lift) | `$shadow1` |
| Card on hover (interactive feedback) | `$shadow2` |
| Dropdown menu, popover content | `$shadow3` |
| Dialog, drawer, modal content | `$shadow4` |
| Special emphasis (rarely needed) | `$drastic` |
| Button/element focus indicator | `$focus` (via `focusVisible` utility) |
| Input field focus indicator | `$inputFocus` |

### Complete "Other" Token Inventory

| Scale | Token Count | Token Range |
|-------|-------------|-------------|
| Border Radii | 4 | `$radius1` (4px) through `$radiusMax` (9999px) |
| Border Widths | 4 | `$borderWidth0` (0px) through `$borderWidth3` (4px) |
| Shadows | 7 | `$focus`, `$inputFocus`, `$drastic`, `$shadow1` through `$shadow4` |
| Z-Indices | 6 | `$layer0` (0) through `$layerMax` (2147483647) |
| **Total** | **21** | |

---

## 6. Breakpoints and Responsive Design

### Breakpoint Definitions

All breakpoints use `min-width` media queries (mobile-first approach):

| Token | Width | Media Query | Common Usage |
|-------|-------|-------------|-------------|
| `@bp1` | `640px` | `(min-width: 640px)` | Small tablets, landscape phones |
| `@bp2` | `768px` | `(min-width: 768px)` | Tablets |
| `@bp3` | `1024px` | `(min-width: 1024px)` | Small desktops, landscape tablets |
| `@bp4` | `1280px` | `(min-width: 1280px)` | Large desktops |

The TypeScript types for breakpoints:

```tsx
type MediaKey = 'bp1' | 'bp2' | 'bp3' | 'bp4';
type MediaToken = `@${Extract<MediaKey, string>}`; // '@bp1' | '@bp2' | '@bp3' | '@bp4'
```

### Responsive CSS in `css` Prop

Use `@bp` tokens directly in the `css` prop for responsive styles:

```tsx
// Stack to row at medium breakpoint
<Box css={{
  display: 'flex',
  flexDirection: 'column',
  gap: '$space2',
  '@bp2': {
    flexDirection: 'row',
    gap: '$space4',
  },
}}>
  <Box css={{ flex: 1 }}>Left</Box>
  <Box css={{ flex: 1 }}>Right</Box>
</Box>

// Responsive font size
<Heading variant="lg" css={{
  fontSize: '$fontSize4',
  '@bp2': { fontSize: '$fontSize5' },
  '@bp4': { fontSize: '$fontSize7' },
}}>
  Responsive Heading
</Heading>

// Responsive padding
<Box css={{
  p: '$space3',
  '@bp2': { p: '$space6' },
  '@bp4': { p: '$space8' },
}}>
  Content with responsive padding
</Box>

// Hide/show at breakpoints
<Box css={{
  display: 'none',
  '@bp2': { display: 'block' },
}}>
  Visible on tablet and above
</Box>
```

### Responsive in `styled()` Definitions

```tsx
const ResponsiveGrid = styled('div', {
  display: 'grid',
  gap: '$space4',
  gridTemplateColumns: '1fr',
  '@bp2': {
    gridTemplateColumns: 'repeat(2, 1fr)',
  },
  '@bp4': {
    gridTemplateColumns: 'repeat(3, 1fr)',
  },
});
```

### `useBreakpoints()` Hook

For JavaScript-based responsive logic (conditional rendering, data fetching, etc.), use the `useBreakpoints()` hook:

```tsx
import { useBreakpoints } from '@attentive/picnic';

function ResponsiveLayout() {
  const { atBp1, atBp2, atBp3, atBp4 } = useBreakpoints();

  return (
    <Box>
      {atBp3 ? (
        <SidebarLayout>
          <Sidebar />
          <MainContent />
        </SidebarLayout>
      ) : (
        <MobileLayout>
          <MainContent />
          <MobileNav />
        </MobileLayout>
      )}
    </Box>
  );
}
```

The hook returns a `Breakpoints` object:

| Property | Type | True When |
|----------|------|----------|
| `atBp1` | `boolean` | Viewport width >= 640px |
| `atBp2` | `boolean` | Viewport width >= 768px |
| `atBp3` | `boolean` | Viewport width >= 1024px |
| `atBp4` | `boolean` | Viewport width >= 1280px |

These are additive — if `atBp3` is true, then `atBp2` and `atBp1` are also true.

### `responsiveRule()` Utility

The `responsiveRule()` utility converts array-based responsive values into Stitches-compatible CSS objects. This is inspired by [Styled System array props](https://styled-system.com/guides/array-props/).

```tsx
import { responsiveRule } from '@attentive/picnic';

// Single value (no responsive behavior)
responsiveRule('padding', '$space4');
// Returns: { padding: '$space4' }

// Array value: [base, @bp1, @bp2, @bp3, @bp4]
responsiveRule('padding', ['$space2', '$space4', '$space6']);
// Returns: {
//   padding: '$space2',
//   '@bp1': { padding: '$space4' },
//   '@bp2': { padding: '$space6' },
// }
```

The `ResponsiveValue<T>` type supports this pattern:

```tsx
type ResponsiveValue<T> = T | T[];
```

Array indices map to breakpoints:
- Index 0: Base (no media query)
- Index 1: `@bp1` (640px+)
- Index 2: `@bp2` (768px+)
- Index 3: `@bp3` (1024px+)
- Index 4: `@bp4` (1280px+)

Use `responsiveRule()` when building component props that accept responsive values:

```tsx
interface CardProps {
  spacing?: ResponsiveValue<string>;
}

function Card({ spacing = '$space4', children }: CardProps) {
  return (
    <Box css={{
      backgroundColor: '$bgDefault',
      borderRadius: '$radius2',
      ...responsiveRule('padding', spacing),
    }}>
      {children}
    </Box>
  );
}

// Usage
<Card spacing={['$space2', '$space4', '$space6']}>
  Responsive padding card
</Card>
```

### Responsive Design Guidelines

1. **Mobile-first** — Write base styles for the smallest viewport, then add `@bp` overrides for larger screens
2. **Prefer CSS over JS** — Use `@bp` tokens in `css` prop for responsive layout changes; reserve `useBreakpoints()` for conditional rendering or data logic
3. **Breakpoint hierarchy** — `@bp1` < `@bp2` < `@bp3` < `@bp4`; styles cascade from smaller to larger
4. **Content-driven breakpoints** — Picnic's breakpoints cover common device widths, but use `maxWidth` constraints on containers rather than relying solely on breakpoints for layout
5. **Test all breakpoints** — Verify layouts at each breakpoint boundary (639/640, 767/768, 1023/1024, 1279/1280)

```tsx
// Complete responsive page layout example
function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box css={{
      px: '$space4',
      py: '$space6',
      mx: 'auto',
      maxWidth: '$bp4',
      '@bp2': { px: '$space6' },
      '@bp4': { px: '$space8' },
    }}>
      {children}
    </Box>
  );
}
```

### Responsive Anti-Patterns

```tsx
// WRONG: Desktop-first (max-width) breakpoints
<Box css={{
  display: 'flex',
  '@media (max-width: 768px)': { display: 'block' },
}} />
// CORRECT: Mobile-first with Picnic @bp tokens (min-width)
<Box css={{
  display: 'block',
  '@bp2': { display: 'flex' },
}} />

// WRONG: Using arbitrary pixel breakpoints
<Box css={{ '@media (min-width: 800px)': { display: 'flex' } }} />
// CORRECT: Use registered breakpoint tokens
<Box css={{ '@bp2': { display: 'flex' } }} />

// WRONG: Using useBreakpoints() for pure layout changes
function Card() {
  const { atBp2 } = useBreakpoints();
  return (
    <Box css={{ display: atBp2 ? 'flex' : 'block' }}>...</Box>
  );
}
// CORRECT: Use CSS-based responsive (no JS flickering, better SSR)
function Card() {
  return (
    <Box css={{ display: 'block', '@bp2': { display: 'flex' } }}>...</Box>
  );
}

// WRONG: Overriding all breakpoints when only one change is needed
<Box css={{
  p: '$space4',
  '@bp1': { p: '$space4' },  // Unnecessary — same as base
  '@bp2': { p: '$space6' },
  '@bp3': { p: '$space6' },  // Unnecessary — cascades from @bp2
  '@bp4': { p: '$space8' },
}} />
// CORRECT: Only override at breakpoints where values change
<Box css={{
  p: '$space4',
  '@bp2': { p: '$space6' },
  '@bp4': { p: '$space8' },
}} />
```

### Complete Breakpoint Token Inventory

| Scale | Token Count | Token Range |
|-------|-------------|-------------|
| Media queries | 4 | `@bp1` (640px) through `@bp4` (1280px) |
| Size tokens (bp widths) | 4 | `$bp1` (640px) through `$bp4` (1280px) |
| Hook booleans | 4 | `atBp1` through `atBp4` |

---

## 7. Real-World Token Usage Examples

### Example 1: Status Card Component

A card that displays a status message with coordinated semantic tokens:

```tsx
import { Box, Heading, Text, Icon, styled } from '@attentive/picnic';

type StatusVariant = 'success' | 'critical' | 'warning' | 'informational';

const statusTokens: Record<StatusVariant, {
  bg: string;
  text: string;
  icon: string;
  iconName: string;
}> = {
  success: {
    bg: '$bgSuccessDefault',
    text: '$textSuccess',
    icon: '$iconSuccess',
    iconName: 'CheckCircle',
  },
  critical: {
    bg: '$bgCriticalDefault',
    text: '$textCritical',
    icon: '$iconCritical',
    iconName: 'AlertCircle',
  },
  warning: {
    bg: '$bgWarningDefault',
    text: '$textWarning',
    icon: '$iconWarning',
    iconName: 'AlertTriangle',
  },
  informational: {
    bg: '$bgInformationalDefault',
    text: '$textInformational',
    icon: '$iconInfo',
    iconName: 'Info',
  },
};

function StatusCard({
  variant,
  title,
  description,
}: {
  variant: StatusVariant;
  title: string;
  description: string;
}) {
  const tokens = statusTokens[variant];
  return (
    <Box css={{
      backgroundColor: tokens.bg,
      borderRadius: '$radius2',
      p: '$space4',
      display: 'flex',
      gap: '$space3',
      alignItems: 'flex-start',
    }}>
      <Icon
        name={tokens.iconName}
        mode="presentational"
        description={variant}
        css={{ color: tokens.icon, flexShrink: 0 }}
      />
      <Box>
        <Heading variant="sm" css={{ color: tokens.text }}>{title}</Heading>
        <Text variant="caption" css={{ mt: '$space1' }}>{description}</Text>
      </Box>
    </Box>
  );
}
```

### Example 2: Interactive Data Table Row

A table row that uses row state tokens for hover, selection, and focus:

```tsx
const TableRow = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'auto 1fr auto',
  gap: '$space4',
  p: '$space3',
  px: '$space4',
  backgroundColor: '$bgRow',
  borderBottom: '$borderWidths$borderWidth1 solid $colors$borderDefault',
  alignItems: 'center',
  defaultTransition: ['background-color'],
  focusVisible: '$focus',
  cursor: 'pointer',

  '&:hover': {
    backgroundColor: '$bgRowHover',
  },
  '&:active': {
    backgroundColor: '$bgRowPressed',
  },

  variants: {
    selected: {
      true: {
        backgroundColor: '$bgRowSelected',
        '&:hover': { backgroundColor: '$bgRowSelectedHover' },
        '&:active': { backgroundColor: '$bgRowSelectedPressed' },
      },
    },
  },
});

// Usage
<Table columns={3}>
  <Table.Body>
    <TableRow selected={isSelected}>
      <Checkbox checked={isSelected} onChange={onToggle} />
      <Text>{item.name}</Text>
      <Text variant="caption" color="subdued">{item.date}</Text>
    </TableRow>
  </Table.Body>
</Table>
```

### Example 3: Responsive Dashboard Layout

A complete dashboard layout using space, size, breakpoint, and z-index tokens:

```tsx
function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { atBp3 } = useBreakpoints();

  return (
    <Box css={{ minHeight: '100vh', backgroundColor: '$bgAccentSubtle' }}>
      {/* Fixed top nav */}
      <Box css={{
        position: 'sticky',
        top: 0,
        zIndex: '$layer1',
        height: '$size14',
        backgroundColor: '$bgDefault',
        borderBottom: '$borderWidths$borderWidth1 solid $colors$borderDefault',
        boxShadow: '$shadow1',
        display: 'flex',
        alignItems: 'center',
        px: '$space4',
        '@bp2': { px: '$space6' },
      }}>
        <Heading variant="sm">Dashboard</Heading>
      </Box>

      <Box css={{
        display: 'flex',
        maxWidth: '$bp4',
        mx: 'auto',
      }}>
        {/* Sidebar — only visible on desktop */}
        {atBp3 && (
          <Box css={{
            width: '240px',
            flexShrink: 0,
            p: '$space4',
            borderRight: '$borderWidths$borderWidth1 solid $colors$borderDefault',
            backgroundColor: '$bgDefault',
          }}>
            <nav>Navigation</nav>
          </Box>
        )}

        {/* Main content area */}
        <Box css={{
          flex: 1,
          p: '$space4',
          '@bp2': { p: '$space6' },
          '@bp4': { p: '$space8' },
        }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
```

### Example 4: Elevated Card with Focus and Shadow

A card that combines shadow tokens, focus tokens, border tokens, and transition utilities:

```tsx
const ElevatedCard = styled('a', {
  display: 'block',
  backgroundColor: '$bgDefault',
  borderRadius: '$radius2',
  border: '$borderWidths$borderWidth1 solid $colors$borderDefault',
  p: '$space4',
  '@bp2': { p: '$space6' },
  boxShadow: '$shadow1',
  defaultTransition: ['box-shadow', 'border-color'],
  focusVisible: '$focus',
  textDecoration: 'none',
  color: 'inherit',

  '&:hover': {
    boxShadow: '$shadow2',
    borderColor: '$borderLoud',
  },
});

// Usage
<ElevatedCard href="/campaigns/123">
  <Heading variant="sm">Campaign Report</Heading>
  <Text variant="caption" color="subdued" css={{ mt: '$space1' }}>
    Last updated 2 hours ago
  </Text>
  <Box css={{ mt: '$space4', display: 'flex', gap: '$space6' }}>
    <Box>
      <Text variant="micro" color="subdued">Sent</Text>
      <Text css={{ fontWeight: '$bold', fontSize: '$fontSize4' }}>125K</Text>
    </Box>
    <Box>
      <Text variant="micro" color="subdued">Opened</Text>
      <Text css={{ fontWeight: '$bold', fontSize: '$fontSize4' }}>42.3%</Text>
    </Box>
    <Box>
      <Text variant="micro" color="subdued">Clicked</Text>
      <Text css={{ fontWeight: '$bold', fontSize: '$fontSize4' }}>8.7%</Text>
    </Box>
  </Box>
</ElevatedCard>
```

### Example 5: Form with Coordinated Token Usage

A form combining typography, space, border, and color tokens:

```tsx
import { Form, Box, Heading, Text } from '@attentive/picnic';
import * as Yup from 'yup';

const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  role: Yup.string().required('Select a role'),
});

function CreateUserForm({ onSubmit }: { onSubmit: (values: any) => void }) {
  return (
    <Box css={{
      maxWidth: '$bp1',
      mx: 'auto',
      p: '$space6',
      backgroundColor: '$bgDefault',
      borderRadius: '$radius2',
      border: '$borderWidths$borderWidth1 solid $colors$borderDefault',
    }}>
      <Heading variant="lg" css={{ mb: '$space2' }}>Create User</Heading>
      <Text variant="caption" color="subdued" css={{ mb: '$space6' }}>
        Fill in the details below to create a new team member.
      </Text>

      <Form
        initialValues={{ name: '', email: '', role: '' }}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        <Stack spacing="$space4">
          <Form.FormField>
            <Form.Label requirement="required">Full Name</Form.Label>
            <Form.TextInput name="name" placeholder="John Doe" />
            <Form.ErrorText name="name" />
          </Form.FormField>

          <Form.FormField>
            <Form.Label requirement="required">Email Address</Form.Label>
            <Form.TextInput name="email" placeholder="john@example.com" />
            <Form.HelperText>Work email preferred</Form.HelperText>
            <Form.ErrorText name="email" />
          </Form.FormField>

          <Form.FormField>
            <Form.Label requirement="required">Role</Form.Label>
            <Form.Select name="role">
              <Form.Select.Item value="admin">Admin</Form.Select.Item>
              <Form.Select.Item value="editor">Editor</Form.Select.Item>
              <Form.Select.Item value="viewer">Viewer</Form.Select.Item>
            </Form.Select>
            <Form.ErrorText name="role" />
          </Form.FormField>

          <Box css={{ display: 'flex', gap: '$space2', justifyContent: 'flex-end', mt: '$space4' }}>
            <Button variant="secondary">Cancel</Button>
            <Form.SubmitButton>Create User</Form.SubmitButton>
          </Box>
        </Stack>
      </Form>
    </Box>
  );
}
```

### Example 6: Custom Theme Creation

Creating a custom theme that overrides primary action colors:

```tsx
import { createTheme, usePicnicStyles } from '@attentive/picnic';

// Create a theme with custom brand colors
const customBrandTheme = createTheme('partner-brand', {
  colors: {
    // Override primary action colors
    bgActionPrimary: '#6366F1',          // Indigo primary
    bgActionPrimaryHover: '#4F46E5',     // Indigo hover
    bgActionPrimaryPressed: '#4338CA',   // Indigo pressed
    bgActionPrimaryDisabled: 'rgba(99,102,241,0.4)', // Indigo disabled

    // Override brand background
    bgBrand: '#6366F1',

    // Keep all other tokens from theme2021
  },
});

function PartnerApp() {
  usePicnicStyles(customBrandTheme);
  return <div>...</div>;
}
```

---

## 8. Complete Token Count Summary

| Token Scale | Count | Section |
|-------------|-------|---------|
| Raw palette colors | 67 | [Raw Perceptual Palette](#raw-perceptual-palette) |
| Functional bg colors (`$bg*`) | 53 | [Functional Background Tokens](#functional-background-tokens-bg) |
| Functional text colors (`$text*`) | 16 | [Functional Text Tokens](#functional-text-tokens-text) |
| Functional icon colors (`$icon*`) | 15 | [Functional Icon Tokens](#functional-icon-tokens-icon) |
| Functional border colors (`$border*`) | 13 | [Functional Border Tokens](#functional-border-tokens-border) |
| Space tokens (`$space*`) | 17 | [Space Tokens](#space-tokens) |
| Size tokens (`$size*` + bp widths) | 21 | [Size Tokens](#size-tokens) |
| Font families | 2 | [Font Family Tokens](#font-family-tokens) |
| Font sizes | 7 | [Font Size Tokens](#font-size-tokens) |
| Font weights | 2 | [Font Weight Tokens](#font-weight-tokens) |
| Line heights | 7 | [Line Height Tokens](#line-height-tokens) |
| Letter spacings | 3 | [Letter Spacing Tokens](#letter-spacing-tokens) |
| Border radii | 4 | [Border Radius Tokens](#border-radius-tokens) |
| Border widths | 4 | [Border Width Tokens](#border-width-tokens) |
| Shadows | 7 | [Shadow Tokens](#shadow-tokens) |
| Z-indices | 6 | [Z-Index Tokens](#z-index-tokens) |
| Breakpoints (media) | 4 | [Breakpoint Definitions](#breakpoint-definitions) |
| **Total unique tokens** | **~248** | |

Custom Stitches utilities: 21 (14 spacing + 7 other)

---

## Quick Reference Card

### Most Commonly Used Tokens

| Category | Tokens |
|----------|--------|
| **Backgrounds** | `$bgDefault`, `$bgAccent`, `$bgAccentSubtle`, `$bgActionPrimary`, `$bgInverted` |
| **Text** | `$textDefault`, `$textSubdued`, `$textDisabled`, `$textInverted`, `$textLink` |
| **Icons** | `$iconDefault`, `$iconSubdued`, `$iconDisabled` |
| **Borders** | `$borderDefault`, `$borderInput`, `$borderFocus` |
| **Spacing** | `$space2` (8px), `$space3` (12px), `$space4` (16px), `$space6` (24px), `$space8` (32px) |
| **Sizes** | `$size9` (36px small btn), `$size12` (48px med btn), `$size13` (52px lg btn) |
| **Typography** | `$display`, `$body`, `$fontSize3` (16px), `$regular`, `$bold` |
| **Radii** | `$radius1` (4px), `$radius2` (8px), `$radiusMax` (pill) |
| **Shadows** | `$focus`, `$shadow1`, `$shadow2` |
| **Z-index** | `$layer1` (sticky), `$layer2` (dropdown), `$layer3` (modal) |
| **Breakpoints** | `@bp1` (640px), `@bp2` (768px), `@bp3` (1024px), `@bp4` (1280px) |

### Token Naming Conventions

| Prefix | Scale | Example |
|--------|-------|---------|
| `$bg` | Colors (backgrounds) | `$bgActionPrimary` |
| `$text` | Colors (text) | `$textDefault` |
| `$icon` | Colors (icons) | `$iconSuccess` |
| `$border` | Colors (borders) | `$borderInput` |
| `$space` | Space | `$space4` |
| `$size` | Sizes | `$size12` |
| `$fontSize` | Font sizes | `$fontSize3` |
| `$lineHeight` | Line heights | `$lineHeight2` |
| `$letterSpacing` | Letter spacings | `$letterSpacing1` |
| `$radius` | Border radii | `$radius2` |
| `$borderWidth` | Border widths | `$borderWidth1` |
| `$shadow` | Shadows | `$shadow2` |
| `$layer` | Z-indices | `$layer3` |
| `@bp` | Breakpoints | `@bp2` |

### State Suffix Conventions

| Suffix | Meaning | Example |
|--------|---------|---------|
| `Default` | Resting/normal state | `$bgSuccessDefault` |
| `Hover` | Mouse hover state | `$bgActionPrimaryHover` |
| `Pressed` | Active/pressed state | `$bgActionPrimaryPressed` |
| `Disabled` | Disabled/inactive state | `$bgActionPrimaryDisabled` |
| `Selected` | Selected/active state | `$bgRowSelected` |
| `Accent` | Stronger/emphasized variant | `$bgSuccessAccent` |
| `Subtle` | Weaker/de-emphasized variant | `$bgAccentSubtle` |

---

**Source files**: `libs/picnic/src/themes/theme-2021.ts`, `libs/picnic/src/themes/theme-dark.ts`, `libs/picnic/src/stitches.config.ts`, `libs/picnic/src/media.ts`, `libs/picnic/src/utils/`
