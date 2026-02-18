# Skill Plan: Picnic Components

## Research Status

**Status**: Revised after deep library analysis (2026-02-17)
**Library analyzed**: `@attentive/picnic` at `/libs/picnic`
**Previous version**: Based on assumptions (Tailwind, generic patterns) — ~70% of content was inaccurate

---

## Purpose and Scope

This skill provides comprehensive knowledge of the Picnic design system component library (`@attentive/picnic`) used across the organization's frontend applications. It enables agents to:

- Understand the complete catalog of 57 Picnic components
- Select appropriate components for specific UI requirements
- Apply correct Stitches CSS-in-JS styling patterns (`css` prop, `$tokenName` syntax)
- Use the compound component pattern (`Form.TextInput`, `Table.HeaderCell`, `Dialog.Content`)
- Reference the two-tier design token system (raw colors → functional/semantic tokens)
- Compose components using Box + `css` prop, Stack, and Grid
- Understand the Radix UI accessibility layer underlying interactive components
- Use Formik-integrated Form compound components with Yup validation

The skill covers the full component library (57 components across 10 categories), the Stitches design token system, and the compound component API pattern that dominates the library.

---

## Gap Analysis: Original Plan vs. Actual Library

### Critical Gaps (require full rewrite)

| Aspect | Original Assumption | Actual (from library analysis) |
|--------|---------------------|-------------------------------|
| **Styling system** | Tailwind utility classes | **Stitches CSS-in-JS** (`@stitches/react` 1.2.8) |
| **Style application** | `className="bg-primary-600"` | `css={{ backgroundColor: '$bgActionPrimary' }}` |
| **Style prop** | `sx`, `className`, `style` | **`css` prop** (typed as `PicnicCss`) |
| **Token syntax** | `theme.colors.primary[600]` | `'$bgActionPrimary'` (dollar-sign prefix) |
| **Color system** | Numeric scales (`primary.50`-`primary.900`) | Two-tier: named raw colors → ~100 functional tokens |
| **All code examples** | Tailwind/generic React patterns | Must use Stitches `css` prop and `$token` syntax |

### High-Impact Gaps

| Aspect | Original Assumption | Actual |
|--------|---------------------|--------|
| **Package name** | `@company/picnic` | `@attentive/picnic` |
| **Icons package** | `@company/picnic-icons` (separate) | Icons built-in: `<Icon name="X" />` component |
| **Component pattern** | Slot/render props | **Compound components** (`Component.SubComponent`) via `compositeComponent()` |
| **Form system** | Generic `FormField`, `FormGroup` | **Formik wrapper**: `<Form>` wraps Formik, compound sub-components, Yup validation |
| **Data table** | Generic `DataTable` | **`Table` compound**: CSS Grid-based, `role="table"`, 10+ sub-components |
| **Dialog/Modal** | Generic `Modal` | **`Dialog`** (Radix): compound with `.Trigger`, `.Content`, `.Header`, `.Close` |
| **Testing** | Jest | **Vitest** with `@attentive/test-utils` |
| **Storybook** | 7+ | **9.1.x** with Chromatic |
| **Responsive** | Not covered | Array syntax via `responsiveRule()`, `@bp1`-`@bp4` media queries, `useBreakpoints()` hook |

### Missing from Original Plan (new content needed)

1. **Stitches reference file** — `styled()` API, `css` prop, custom utilities, variants
2. **Compound component pattern** — dominant API pattern, must be a dedicated section
3. **Formik integration** — Form.* namespace, `useForm()` hook, Yup schemas
4. **Radix UI dependency** — understanding which components wrap Radix primitives
5. **Custom Stitches utilities** — `px`, `my`, `focusVisible`, `defaultTransition`, etc.
6. **Responsive design patterns** — `ResponsiveValue<T>`, `useBreakpoints()`, media tokens

---

## ui-ux-pro-max Integration Analysis

**Recommendation: Do NOT extend ui-ux-pro-max. Build standalone skill.**

| Dimension | ui-ux-pro-max | Picnic Skill Needs |
|-----------|--------------|-------------------|
| **Purpose** | "What design system should I use?" (design intelligence) | "How do I use our existing design system correctly?" (API reference) |
| **Data model** | Industry categories → style recommendations | Component catalog → props, variants, tokens |
| **Colors** | 96 generic industry palettes (hex values) | Stitches design tokens (`$bgActionPrimary`, semantic system) |
| **Typography** | Google Fonts pairings | Internal Ginto font stack, Stitches typography tokens |
| **Components** | None — no component API knowledge | 57 components with typed props and Stitches variants |
| **Code output** | Generic CSS/Tailwind | React + TypeScript + Stitches + `@attentive/picnic` imports |
| **Search paradigm** | BM25 fuzzy matching on keywords | Exact component/prop lookup |
| **Extension points** | None — hardcoded 10 domains in `core.py`, closed CSV data model | N/A |

**Rationale**:
1. Different concerns: design intelligence vs. component API reference
2. No natural extension points: closed system with hardcoded domains
3. Maintenance burden: upstream updates could break fork, carries 564KB of unused data
4. Confusion risk: generic advice ("use glassmorphism") mixed with specific guidance ("use `$bgActionPrimary`")
5. Search paradigm mismatch: BM25 fuzzy search wrong for component API lookups

**Complementary use**: Keep ui-ux-pro-max installed separately for rare greenfield design exploration tasks. It's the wrong tool for daily component library reference work.

---

## Library Architecture Summary

### Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Package | `@attentive/picnic` (private) | 0.0.0-development |
| CSS-in-JS | `@stitches/react` | 1.2.8 |
| UI Primitives | `@radix-ui/*` | Various (Accordion, Checkbox, Dialog, DropdownMenu, Popover, RadioGroup, Separator, Switch, Tabs, Tooltip, VisuallyHidden) |
| Forms | `formik` + `yup` | - |
| Select/Combobox | `downshift` | 6.1.0 |
| Polymorphism | `react-polymorphic-box` | - |
| Date Handling | `react-dates` + `date-fns` + `moment` | - |
| Testing | `vitest` + `@testing-library/react` | - |
| Storybook | 9.1.x + Chromatic | - |
| React | 18.1.0 | - |
| TypeScript | 5.4 | - |

### Component Count: 57 across 10 Categories

| Category | Count | Components |
|----------|-------|-----------|
| **Layout** | 6 | Box, Stack, Grid, PageLayout, FooterLayout, Separator |
| **Typography** | 3 | Heading, Text, TextWithOverflowTooltip |
| **Actions** | 6 | Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, PickerButton |
| **Forms** | 15 | Form (compound), TextInput, TextArea, Select, MultiSelect, Checkbox, RadioGroup, Switch, SearchBar, FileInput, InputGroup, TagSelector, DatePicker, DateRangePicker, TimePicker, FormField |
| **Data Display** | 7 | Table (compound), Badge, Tag, ContainedLabel, ProgressBar, StepTracker, List |
| **Navigation** | 3 | Breadcrumbs, TabGroup, Paginator |
| **Overlays** | 6 | Dialog, StandardDialog, Drawer, StandardDrawer, Popover, DropdownMenu |
| **Feedback** | 5 | Banner, Accordion, Tooltip, IconPopover, LoadingIndicator, LoadingPlaceholder |
| **Media/Branding** | 7 | Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark, Emoji |
| **Utility** | 2 | ContinuousScroll, TabGroupTransformer |

### Design Token System

**Two-tier color architecture**:
- **Raw perceptual palette**: `$grayscale0`-`$grayscale1000`, `$yellow100`-`$yellow700`, `$green100`-`$green900`, `$red100`-`$red800`, plus brand colors (creamsicleOrange, aperolOrange, hyperlinkBlue, celeryGreen, cloudBlue, cloveBrown, lavenderPurple, steelBlue)
- **Functional/semantic tokens** (~100): `$bg*` (~50 tokens), `$text*` (~16), `$icon*` (~15), `$border*` (~13) — these are what engineers should use

**Other token scales**:
- **Space**: `$space0` (0) → `$space16` (64px), 4px grid increments
- **Sizes**: `$size0` (0) → `$size16` (64px), same 4px grid + breakpoint widths
- **Fonts**: `$display` (Ginto Nord), `$body` (Ginto Normal)
- **Font sizes**: `$fontSize1` (0.75rem) → `$fontSize7` (2rem)
- **Font weights**: `$regular` (400), `$bold` (500) — only 2 weights
- **Line heights**: `$lineHeight1` (1) → `$lineHeight7` (1.5)
- **Letter spacings**: `$letterSpacing0` (0px), `$letterSpacing1` (0.3px), `$letterSpacing2` (0.5px)
- **Radii**: `$radius1` (4px), `$radius2` (8px), `$radius3` (16px), `$radiusMax` (9999px)
- **Shadows**: `$focus`, `$inputFocus`, `$drastic`, `$shadow1`-`$shadow4`
- **Z-indices**: `$layer0` (0) → `$layerMax` (2147483647), 10000 gaps
- **Breakpoints**: `@bp1` (640px), `@bp2` (768px), `@bp3` (1024px), `@bp4` (1280px)

**Themes**: `theme2021` (default light), `themeDark` (partial override — only ~15 functional color tokens change)

### Custom Stitches Utilities

| Utility | Purpose |
|---------|---------|
| `p`, `pt`, `pr`, `pb`, `pl`, `px`, `py` | Padding shorthands |
| `m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my` | Margin shorthands |
| `focusVisible(shadow)` | Focus ring via `:focus-visible` |
| `defaultTransition(props[])` | 0.2s ease transition generator |
| `gridTemplateColumnsRepeat(n)` | CSS Grid column shorthand |
| `gridColumnSpan(n)` | Grid column span |
| `maxLines(n)` | CSS line clamp |
| `safariOnly(styles)` | Safari-specific CSS |
| `listStyleOverride('unstyled')` | List style reset |

---

## Trigger Description

```yaml
description: >
  This skill provides comprehensive knowledge of the Picnic design system
  component library (@attentive/picnic), including the complete 57-component
  catalog with Stitches CSS-in-JS props, variants, compound component patterns,
  and the two-tier design token system. This skill should be used when the user
  asks to use Picnic components, style with Stitches tokens, create compound
  components, use the css prop, select which Picnic component to use, consult
  the design system, understand available variants, apply design tokens
  ($tokenName syntax), use Form/Formik integration, or ensure design system
  compliance.
```

---

## SKILL.md Specification

Target length: ~2000 words (expanded from 1800 to cover Stitches)

### Section 1: Introduction to Picnic (200 words)
- Package: `@attentive/picnic`, private monorepo library
- Built on: Stitches CSS-in-JS + Radix UI primitives + Formik forms
- 57 components across 10 categories
- Two themes: `theme2021` (default), `themeDark`
- Philosophy: consistency via tokens, accessibility via Radix, composition via compound components
- Import pattern: `import { Button, Box, styled, css } from '@attentive/picnic'`
- Theme activation: `usePicnicStyles()` hook in app root
- Fonts: Ginto Nord (display headings), Ginto Normal (body text)

### Section 2: Component Discovery Workflow (300 words)
- 10-category search (Layout, Typography, Actions, Forms, Data Display, Navigation, Overlays, Feedback, Media/Branding, Utility)
- Checking for compound sub-components (e.g., `Table.HeaderCell`, `Form.TextInput`)
- Decision tree: existing component → composition with Box + css → custom styled component
- Storybook 9.1.x as living documentation with Chromatic visual testing
- Component status awareness (deprecations: `basic` variant → `secondary`)

### Section 3: Stitches Styling Patterns (400 words) — NEW
- `styled()` function for creating components with variants:
  ```tsx
  const Card = styled('div', {
    backgroundColor: '$bgDefault',
    borderRadius: '$radius2',
    variants: { size: { small: { p: '$space2' }, large: { p: '$space6' } } },
    defaultVariants: { size: 'large' },
  });
  ```
- `css` prop for inline overrides (typed as `PicnicCss`):
  ```tsx
  <Box css={{ display: 'flex', gap: '$space4', backgroundColor: '$bgAccent' }}>
  ```
- Token reference syntax: `'$tokenName'` for any theme token (e.g., `'$bgActionPrimary'`, `'$space4'`, `'$fontSize3'`)
- Cross-scale references: `'$colors$bgDefault'` when referencing colors from non-color properties
- Custom utils: `px: '$space4'`, `my: '$space2'`, `focusVisible: '$focus'`, `defaultTransition: ['box-shadow', 'color']`
- Responsive: `{ '@bp1': { fontSize: '$fontSize4' } }` or array syntax via `responsiveRule()`
- `VariantProps<typeof Component>` for extracting variant types in TypeScript

### Section 4: Compound Component Pattern (250 words) — NEW
- Dominant pattern in Picnic: ~20 components use namespace API
- Pattern: `<Form.TextInput>`, `<Table.HeaderRow>`, `<Dialog.Content>`, `<Select.Item>`
- Created via `compositeComponent()` utility or manual static property assignment
- DisplayName convention: `'Component.SubComponent'`
- Context propagation: parent variant flows to children via React Context (e.g., Accordion variant → Item styling, Banner variant → Heading color)
- Child slot parsing: components like Banner, FormField parse `React.Children` by type to place in layout slots
- When to use: always prefer namespace API over manual composition for components that support it

### Section 5: Variant System (250 words) — REVISED
- Stitches `variants` object in `styled()` calls
- Common variant patterns across the library:
  - **Color/variant**: `primary | secondary | subdued | inverted` (Buttons), `default | subdued | inverted | success | warning | critical | info | decorative1-4` (Text, Heading, Icon)
  - **Size**: `small | normal` (Inputs), `small | medium | large` (Buttons), `extraSmall | small | medium | large` (Icons)
  - **State**: `normal | error` (Form inputs)
- `compoundVariants` for cross-variant styles (e.g., disabled + primary = specific disabled colors)
- `defaultVariants` for default prop values
- Boolean variants: `disabledVisually: { true: {...}, false: {...} }`
- Deprecation: `basic` variant → use `secondary`; `legacy-inverted` still present but avoid

### Section 6: Design Tokens Quick Reference (250 words) — REVISED
- Two-tier color system: raw colors (don't use directly) → functional tokens (always use these)
- Functional token prefixes: `$bg*`, `$text*`, `$icon*`, `$border*`
- State suffixes: `Default`, `Hover`, `Pressed`, `Disabled`, `Selected`, `Inverted`
- Space/Size: 4px grid (`$space1` = 4px through `$space16` = 64px)
- Typography: Ginto Nord/Normal, `$fontSize1`-`$fontSize7`, only 2 weights (`$regular`, `$bold`)
- Shadows: `$focus` (ring), `$inputFocus`, `$shadow1`-`$shadow4` (elevation)
- Radii: `$radius1` (4px), `$radius2` (8px), `$radius3` (16px), `$radiusMax` (pill)
- Z-index: `$layer0`-`$layerMax` with 10000 gaps
- Breakpoints: `@bp1`-`@bp4` (640/768/1024/1280px) — mobile-first
- Refer to design-tokens.md and stitches-patterns.md references for complete tables

### Section 7: Form System (200 words) — NEW
- `<Form>` wraps Formik: accepts `initialValues`, `onSubmit`, `validationSchema` (Yup)
- Compound sub-components: `Form.FormField`, `Form.TextInput`, `Form.Select`, `Form.Checkbox`, `Form.Switch`, `Form.RadioGroup`, `Form.DatePicker`, `Form.MultiSelect`, `Form.SearchableSelect`, `Form.TextArea`, `Form.Label`, `Form.ErrorText`, `Form.HelperText`, `Form.SubmitButton`, `Form.ResetButton`
- `useForm<V>()` hook for accessing Formik state
- `FormField` organizes label, input, helper text, and error text with `layout: 'vertical' | 'horizontal'`
- `FormField.Label` supports `requirement: 'none' | 'required' | 'optional'`
- Standalone inputs (TextInput, Select, Checkbox) work independently of Form for non-Formik use cases

### Section 8: Accessibility (150 words) — KEPT (updated)
- Radix UI provides built-in ARIA roles, keyboard navigation, and focus management for: Dialog, Drawer, Popover, Tooltip, DropdownMenu, TabGroup, Accordion, Checkbox, RadioGroup, Switch
- `focusVisible` utility for consistent focus ring styling: `focusVisible: '$focus'`
- `VisuallyHidden` component (re-exported from Radix) for screen-reader-only content
- Icon discriminated union: `mode: 'presentational'` (requires `description`) vs. `mode: 'decorative'` (no description needed)
- Table uses `role="table"`, `role="row"`, `role="cell"`, `role="columnheader"` for grid-based table accessibility
- Keyboard navigation built into Radix primitives (arrow keys, Escape, Enter, Space)

---

## Reference Files

### references/component-catalog.md
**Purpose**: Complete reference of all 57 Picnic components with TypeScript props, Stitches variants, and compound sub-components

**Estimated size**: 6,000-8,000 lines

**Outline**:
1. **Index by Category** (~250 lines)
   - Layout (6): Box, Stack, Grid, PageLayout, FooterLayout, Separator
   - Typography (3): Heading, Text, TextWithOverflowTooltip
   - Actions (6): Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, PickerButton
   - Forms (15): Form, TextInput, TextArea, Select, MultiSelect, Checkbox, RadioGroup, Switch, SearchBar, FileInput, InputGroup, TagSelector, DatePicker, DateRangePicker, TimePicker, FormField
   - Data Display (7): Table, Badge, Tag, ContainedLabel, ProgressBar, StepTracker, List
   - Navigation (3): Breadcrumbs, TabGroup, Paginator
   - Overlays (6): Dialog, StandardDialog, Drawer, StandardDrawer, Popover, DropdownMenu
   - Feedback (5): Banner, Accordion, Tooltip, IconPopover, LoadingIndicator, LoadingPlaceholder
   - Media/Branding (7+): Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark, Emoji
   - Utility (2): ContinuousScroll, TabGroupTransformer

2. **Component Entries** (57 components, 50-150 lines each)
   Each entry contains:
   - Component name and import: `import { X } from '@attentive/picnic'`
   - Underlying primitive (Radix? Formik? Downshift? Plain styled?)
   - TypeScript props interface (actual types from source)
   - Stitches variants + compound variants + default variants
   - Compound sub-components (if any) with their props
   - Code example using `css` prop (NOT Tailwind)
   - Accessibility notes (Radix-based behavior)
   - Related components

3. **Compound Component Map** (~200 lines)
   - Lists every compound component and all its sub-components:
     - `Form` → `.FormField`, `.TextInput`, `.Select`, `.Checkbox`, `.Switch`, `.RadioGroup`, `.DatePicker`, `.MultiSelect`, `.SearchableSelect`, `.TextArea`, `.Label`, `.ErrorText`, `.HelperText`, `.SubmitButton`, `.ResetButton`
     - `Table` → `.Header`, `.HeaderRow`, `.HeaderCell`, `.SortableHeaderCell`, `.Body`, `.BodyRow`, `.BodyFocusableRow`, `.BodyCell`, `.RowSelectorCell`, `.HeaderSelectorCell`, `.FocusWrapper`
     - `Dialog` → `.Trigger`, `.Content`, `.Header`, `.Close`, `.CloseButton`
     - `Drawer` → `.Trigger`, `.Content`, `.Header`, `.CloseButton`
     - `Select` → `.Item`, `.IconItem`, `.ThirdPartyIconItem`, `.Group`, `.Value`
     - `MultiSelect` → `.Item`, `.Group`
     - `Banner` → `.Image`, `.Heading`, `.Text`, `.Action`
     - `Accordion` → `.Item`, `.Header`, `.HeaderIcon`, `.Content`
     - `DropdownMenu` → `.Trigger`, `.Content`, `.Item`, `.TextItem`, `.Button`, `.Label`, `.Separator`, `.Sub`, `.SubContent`, `.SubMenuTriggerItem`, `.UnstyledItem`
     - `Popover` → `.Trigger`, `.Anchor`, `.Content`, `.CloseButton`, `.CloseIconButton`
     - `Tooltip` → `.Provider`, `.Trigger`, `.Content`
     - `TabGroup` → `.List`, `.Tab`, `.Panel`
     - `Grid` → `.Cell`
     - `Breadcrumbs` → `.Item`
     - `Paginator` → `.Label`, `.ButtonGroup`
     - `StepTracker` → `.Step`
     - `List` → `.Item`
     - `FormField` → `.Label`, `.HelperText`, `.ErrorText`, `.IconPopover`
     - `ContainedLabel` → `.Icon`, `.Tooltip`
     - `TextWithOverflowTooltip` → `.Trigger`, `.TextItem`, `.Content`, `.TooltipText`

4. **Cross-Cutting Pattern Tables** (~400 lines)
   - All components by category
   - Variant matrix (which components support which variant values)
   - Size scale differences (inputs: small/normal, buttons: small/medium/large, icons: extraSmall/small/medium/large)
   - Radix-based vs. custom components

### references/design-tokens.md — COMPLETE REWRITE
**Purpose**: Complete reference of all Stitches design tokens with actual values

**Estimated size**: 2,500-3,000 lines

**Outline**:
1. **Stitches Token System** (~200 lines)
   - How tokens work: `$tokenName` syntax in `css` prop and `styled()` calls
   - Theme structure: `createStitches({ theme: {...} })`, class prefix `picnic-`
   - Accessing tokens: `css={{ color: '$textDefault' }}` in components
   - `usePicnicStyles(theme?)` hook for theme application
   - `createPicnicTheme(className, themeScales)` for custom themes
   - `ThemeName` enum: `Theme2021`, `ThemeDark`

2. **Color Tokens** (~800 lines)
   - Raw perceptual palette (12+ color families with actual hex values):
     - grayscale: `$grayscale0` (#FFFFFF) through `$grayscale1000` (#000000) + alpha variants
     - yellow: `$yellow100` (#FFFDE5) through `$yellow700` (#F9D100)
     - green: `$green100` (#D8EFE4) through `$green900` (#1F573D)
     - red: `$red100` (#FFD7DE) through `$red800` (#B3283E)
     - Brand colors: creamsicleOrange, aperolOrange, hyperlinkBlue, celeryGreen, cloudBlue, cloveBrown, lavenderPurple, steelBlue
   - Functional tokens (the API engineers use):
     - `$bg*`: ~50 background tokens (Default, Accent, Action states, Row states, Toggle states, semantic colors, decorative)
     - `$text*`: ~16 text tokens (Default, Subdued, semantic, decorative, link, disabled, inverted)
     - `$icon*`: ~15 icon tokens (Default, Subdued, semantic, decorative, disabled, inverted)
     - `$border*`: ~13 border tokens (Default, Input states, Action, Focus)
   - Dark theme overrides (only ~15 functional tokens change)
   - Usage guidelines: always prefer functional over raw, state suffixes (Hover/Pressed/Disabled)

3. **Space & Size Tokens** (~300 lines)
   - 4px grid: `$space0` (0) through `$space16` (64px), every 4px
   - Sizes: `$size0` (0) through `$size16` (64px) + breakpoint widths (`$bp1`-`$bp4`)
   - Stitches utils: `p`, `px`, `py`, `m`, `mx`, `my` shorthands
   - Common patterns: `p: '$space4'`, `mx: '$space2'`, `gap: '$space3'`

4. **Typography Tokens** (~400 lines)
   - Fonts: `$display` (Ginto Nord — headings), `$body` (Ginto Normal — everything else)
   - Sizes: `$fontSize1` (0.75rem/12px) → `$fontSize7` (2rem/32px)
   - Weights: `$regular` (400), `$bold` (500) — ONLY 2 weights, no semibold/medium
   - Line heights: `$lineHeight1` (1) → `$lineHeight7` (1.5)
   - Letter spacings: `$letterSpacing0` (0px), `$letterSpacing1` (0.3px), `$letterSpacing2` (0.5px)
   - Typography component variants mapping: Heading (page/xl/lg/md/sm/subheading), Text (lede/body/caption/micro)

5. **Other Tokens** (~300 lines)
   - Radii: `$radius1` (4px), `$radius2` (8px), `$radius3` (16px), `$radiusMax` (9999px)
   - Border widths: `$borderWidth0` (0px), `$borderWidth1` (1px), `$borderWidth2` (2px), `$borderWidth3` (4px)
   - Shadows: `$focus` (double ring), `$inputFocus` (single ring), `$drastic`, `$shadow1`-`$shadow4`
   - Z-indices: `$layer0` (0), `$layer1` (10000), `$layer2` (20000), `$layer3` (30000), `$layer4` (40000), `$layerMax` (2147483647)

6. **Breakpoints & Responsive Patterns** (~200 lines)
   - Media tokens: `@bp1` (640px), `@bp2` (768px), `@bp3` (1024px), `@bp4` (1280px) — all min-width
   - `useBreakpoints()` hook: returns `{ atBp1, atBp2, atBp3, atBp4 }` booleans
   - Responsive CSS: `{ '@bp2': { fontSize: '$fontSize4' } }`
   - `responsiveRule()` utility and `ResponsiveValue<T>` array syntax

### references/stitches-patterns.md — NEW FILE
**Purpose**: Stitches CSS-in-JS patterns specific to Picnic that engineers need daily

**Estimated size**: 1,500-2,000 lines

**Outline**:
1. **styled() API** (~400 lines)
   - Creating components: `const Foo = styled('div', { ... })`
   - Extending components: `const Bar = styled(Foo, { ... })`
   - Variants, compound variants, default variants
   - `VariantProps<typeof Component>` type extraction
   - `PicnicCss` type annotation for css prop

2. **css Prop Patterns** (~300 lines)
   - Token usage in css objects: `{ backgroundColor: '$bgDefault', p: '$space4' }`
   - Nested selectors: `{ '& > div': { color: '$textSubdued' } }`
   - Pseudo-classes: `{ '&:hover': { backgroundColor: '$bgActionPrimaryHover' } }`
   - Media queries inline: `{ '@bp1': { fontSize: '$fontSize4' } }`
   - Cross-scale token references: `{ boxShadow: '0 0 0 2px $colors$bgDefault' }`

3. **Custom Utils Reference** (~300 lines)
   - Space shorthands: `p`, `pt`, `pr`, `pb`, `pl`, `px`, `py`, `m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my`
   - Grid: `gridTemplateColumnsRepeat`, `gridColumnSpan`
   - Transition: `defaultTransition: ['box-shadow', 'color', 'background-color']`
   - Focus: `focusVisible: '$focus'` — generates `:focus` + `:focus-visible` with box-shadow
   - Text: `maxLines: 2` — CSS line clamp
   - Browser: `safariOnly: { ... }`
   - List: `listStyleOverride: 'unstyled'`
   - Usage examples for each utility

4. **Responsive Design** (~200 lines)
   - Stitches `media` config: `@bp1`-`@bp4`
   - `responsiveRule(property, value)` utility for array-based responsive props
   - `ResponsiveValue<T>` type: `T | T[]` where array indices map to breakpoints
   - `useBreakpoints()` hook for JS-based responsive logic
   - Pattern: Stack doesn't use CSS `gap` (Safari compat) — uses margin on `> * + *`

5. **Theming** (~300 lines)
   - `createPicnicTheme(className, scales)` API
   - `usePicnicStyles(theme?)` hook — applies global reset + theme class
   - `DEFAULT_THEME` constant
   - `Themes` object: `{ theme2021, themeDark }`
   - Dark theme pattern: only overrides functional color tokens
   - Creating custom themes by extending `theme2021`
   - Theme reset styles: sets body fontFamily, backgroundColor, color, letterSpacing, lineHeight

---

## Used By Agents

- **component-architect**: Selects appropriate components, plans compound component usage
- **component-builder**: Implements components using Picnic primitives and Stitches patterns
- **storybook-writer**: Documents component usage in Storybook 9.1.x
- **frontend-reviewer**: Validates design system compliance (tokens, compound patterns, variant usage)

## Dependencies

- **react-patterns**: Understanding React composition and compound component patterns
- **typescript-strict**: Correct typing of `VariantProps`, `PicnicCss`, `ResponsiveValue<T>`

## Skills to Load When Building

- `plugin-dev:skill-development` (required for skill creation)

---

## Validation Criteria

### Should Trigger (5 test queries)

1. "Which Picnic component should I use to display a list of items with actions?"
2. "How do I use the Button component with the primary variant?"
3. "What are the available spacing tokens in the design system?"
4. "How do I style a Box with Stitches tokens?"
5. "How do I create a form with validation using Picnic?"

### Should NOT Trigger (2 test queries)

1. "How do I fetch data with Relay?" (relay-conventions)
2. "What's the best way to test this component?" (testing-conventions)

### Progressive Disclosure Test

1. **Frontmatter only**: User asks "Do we have a modal component?"
   - Expected: Agent confirms Picnic has Dialog and StandardDialog components (Radix-based), suggests checking docs

2. **SKILL.md loaded**: User asks "How do I use the Dialog component with a custom footer?"
   - Expected: Agent explains compound component pattern: `<Dialog><Dialog.Trigger>...<Dialog.Content>...<Dialog.Close>` with `css` prop for custom styling

3. **References loaded**: User asks "Show me all the props for the Select component"
   - Expected: Agent provides complete props table from component-catalog.md including compound sub-components (Select.Item, Select.IconItem, Select.Group, Select.Value) with Stitches variants

---

## Example Content Snippets (Corrected for Actual Library)

### Example 1: Component Catalog Entry (Button)

```markdown
## Button

**Import**: `import { Button } from '@attentive/picnic'`

**Underlying Primitive**: `react-polymorphic-box` (supports `as` prop)

**Purpose**: Primary interactive element for user actions. Use for forms, dialogs, and call-to-action elements.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'subdued' \| 'inverted' \| 'legacy-inverted' | 'primary' | Visual style variant |
| size | 'small' \| 'medium' \| 'large' | 'medium' | Button size |
| disabled | boolean | false | Disables interaction |
| loading | boolean | false | Shows loading indicator |
| as | ElementType | 'button' | Polymorphic component type |
| css | PicnicCss | - | Stitches style overrides |

**Deprecation**: `basic` variant is deprecated — use `secondary` instead.

### Variant Styles (Stitches tokens used)

| Variant | Background | Text | Border |
|---------|-----------|------|--------|
| primary | `$bgActionPrimary` → `$bgActionPrimaryHover` → `$bgActionPrimaryPressed` | `$textDefault` | none |
| secondary | `$bgActionBasic` → `$bgActionBasicHover` → `$bgActionBasicPressed` | `$textDefault` | `$borderActionBasic` |
| subdued | transparent | `$textDefault` → `$textHover` → `$textPressed` | none |
| inverted | `$bgDefault` | `$textInverted` | `$borderInverted` |

### Size Scale

| Size | Height | Horizontal Padding | Font Size |
|------|--------|-------------------|-----------|
| small | `$size9` (36px) | `$space4` (16px) | `$fontSize2` (14px) |
| medium | `$size12` (48px) | `$space6` (24px) | `$fontSize3` (16px) |
| large | `$size13` (52px) | `$space6` (24px) | `$fontSize4` (20px) |

### Usage Examples

**Basic**:
```tsx
<Button variant="primary">Save Changes</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="subdued">Learn More</Button>
```

**With loading state**:
```tsx
<Button loading={isSubmitting}>Saving...</Button>
```

**With css prop override**:
```tsx
<Button variant="primary" css={{ minWidth: '$size16' }}>
  Submit
</Button>
```

**Button group layout**:
```tsx
<Box css={{ display: 'flex', gap: '$space2' }}>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</Box>
```

**Polymorphic (link as button)**:
```tsx
<Button as="a" href="/dashboard" variant="primary">
  Go to Dashboard
</Button>
```

### Related Components

- **IconButton**: For icon-only buttons (`iconName`, `description` props)
- **ButtonGroup**: For grouped toggle buttons with active state
- **ButtonBar**: For button layout arrangements
```

### Example 2: Design Tokens (Stitches Color System)

```markdown
## Color Tokens

### Two-Tier System

Picnic uses a two-tier color token system via Stitches:

1. **Raw perceptual palette** — named color values (DO NOT use directly in components)
2. **Functional/semantic tokens** — purpose-based aliases (ALWAYS use these)

### Referencing Tokens

In `css` prop or `styled()`:
```tsx
<Box css={{ backgroundColor: '$bgDefault', color: '$textDefault' }} />
```

In styled components:
```tsx
const Card = styled('div', {
  backgroundColor: '$bgDefault',
  border: '$borderWidths$borderWidth1 solid $borderDefault',
  borderRadius: '$radius2',
  p: '$space4',
});
```

### Functional Background Tokens

| Token | Purpose | Light Value |
|-------|---------|-------------|
| `$bgDefault` | Primary background | #FFFFFF |
| `$bgAccentSubtle` | Subtle background | #FAFAFA |
| `$bgAccent` | Accent background | #EFF0F0 |
| `$bgActionPrimary` | Primary button/action | yellow300 |
| `$bgActionPrimaryHover` | Primary action hover | yellow600 |
| `$bgActionPrimaryPressed` | Primary action pressed | yellow700 |
| `$bgActionSecondary` | Secondary button | grayscale200 |
| `$bgSuccessDefault` | Success background | green100 |
| `$bgCriticalDefault` | Error/critical background | red100 |
| `$bgWarningDefault` | Warning background | creamsicleOrange100 |
| `$bgInformationalDefault` | Info background | cloveBrown100 |
| `$bgGuidanceDefault` | Guidance background | lavenderPurple030 |
| `$bgOverlay` | Modal/drawer overlay | rgba(0,0,0,0.5) |
| `$bgInverted` | Dark backgrounds | grayscale900 |

### Functional Text Tokens

| Token | Purpose | Light Value |
|-------|---------|-------------|
| `$textDefault` | Primary text | grayscale900 (#1B1F23) |
| `$textSubdued` | Secondary/muted text | grayscale700 (#656567) |
| `$textDisabled` | Disabled text | grayscale900 @ 40% alpha |
| `$textInverted` | Text on dark backgrounds | grayscale0 (#FFFFFF) |
| `$textSuccess` | Success text | green800 |
| `$textCritical` | Error text | red800 |
| `$textWarning` | Warning text | aperolOrange800 |
| `$textHover` | Hover state text | hyperlinkBlue700 |
| `$textLink` | Link text | grayscale900 |
```

### Example 3: Component Discovery (Corrected)

```markdown
## Component Discovery Workflow

### Step 1: Identify the Category

- **User input?** → Forms (TextInput, Select, MultiSelect, Checkbox, RadioGroup, Switch, DatePicker, TimePicker, TagSelector, SearchBar, FileInput)
- **Display data?** → Data Display (Table, Badge, Tag, ContainedLabel, ProgressBar, StepTracker, List)
- **Navigate?** → Navigation (Breadcrumbs, TabGroup, Paginator)
- **Show/hide content?** → Overlays (Dialog, Drawer, Popover, Tooltip, DropdownMenu)
- **Provide feedback?** → Feedback (Banner, Accordion, LoadingIndicator, LoadingPlaceholder)
- **Arrange layout?** → Layout (Box, Stack, Grid, PageLayout, FooterLayout, Separator)
- **Display text?** → Typography (Heading, Text, Link)
- **Show icons/images?** → Media/Branding (Icon, IconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark)

### Step 2: Check for Compound Sub-Components

Many Picnic components are compound — they have sub-components accessed via dot notation:

```tsx
// Table is compound — uses Table.* namespace
<Table columns={3}>
  <Table.Header>
    <Table.HeaderRow>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
      <Table.HeaderCell>Actions</Table.HeaderCell>
    </Table.HeaderRow>
  </Table.Header>
  <Table.Body>
    <Table.BodyRow>
      <Table.BodyCell>John</Table.BodyCell>
      <Table.BodyCell><Badge variant="active">Active</Badge></Table.BodyCell>
      <Table.BodyCell><Button variant="subdued" size="small">Edit</Button></Table.BodyCell>
    </Table.BodyRow>
  </Table.Body>
</Table>
```

### Step 3: Compose with Box + css Prop

If no single component matches, compose with Box:

```tsx
<Box css={{ display: 'flex', gap: '$space4', alignItems: 'center' }}>
  <Icon name="Search" mode="decorative" />
  <TextInput placeholder="Search..." css={{ flex: 1 }} />
  <Button variant="primary" size="small">Search</Button>
</Box>
```
```

### Example 4: Form System (New)

```markdown
## Form System

Picnic's Form wraps Formik with compound sub-components:

```tsx
import { Form } from '@attentive/picnic';
import * as Yup from 'yup';

const schema = Yup.object({
  email: Yup.string().email().required(),
  name: Yup.string().required(),
  role: Yup.string().required(),
});

<Form
  initialValues={{ email: '', name: '', role: '' }}
  validationSchema={schema}
  onSubmit={(values) => handleSubmit(values)}
>
  <Form.FormField>
    <Form.Label requirement="required">Email</Form.Label>
    <Form.TextInput name="email" placeholder="Enter email" />
    <Form.ErrorText name="email" />
  </Form.FormField>

  <Form.FormField>
    <Form.Label requirement="required">Name</Form.Label>
    <Form.TextInput name="name" />
    <Form.ErrorText name="name" />
  </Form.FormField>

  <Form.FormField>
    <Form.Label>Role</Form.Label>
    <Form.Select name="role">
      <Form.Select.Item value="admin">Admin</Form.Select.Item>
      <Form.Select.Item value="editor">Editor</Form.Select.Item>
    </Form.Select>
  </Form.FormField>

  <Form.SubmitButton>Create User</Form.SubmitButton>
</Form>
```
```

---

## Key Patterns Engineers Must Know

These are the patterns most likely to cause mistakes if not documented:

1. **`$` token syntax**: `'$bgActionPrimary'` not `theme.colors.bgActionPrimary`
2. **`css` prop, not `className`**: All styling via `css` prop typed as `PicnicCss`
3. **Compound namespace**: `<Form.TextInput>` not `<FormTextInput>` — know which components are compound
4. **Functional tokens over raw**: Always `$bgDefault` not `$grayscale0` — functional tokens adapt to themes
5. **Formik integration**: `<Form>` IS Formik — no separate setup, use `Form.SubmitButton` not `<Button type="submit">`
6. **Only 2 font weights**: `$regular` (400) and `$bold` (500) — no semibold, medium, or light
7. **Stack uses margins, not gap**: `> * + *` margin pattern for Safari compatibility
8. **Table is CSS Grid**: Not `<table>` — uses CSS Grid with ARIA roles for accessibility
9. **Select uses Downshift**: Fully custom with keyboard support, not native `<select>`
10. **Border shorthand**: `'$borderWidths$borderWidth1 solid $borderDefault'` — string interpolation across token scales
11. **Icon discriminated union**: Must specify `mode: 'presentational'` (with `description`) or `mode: 'decorative'`
12. **Radix `asChild` pattern**: Dialog.Trigger and Dialog.Close use `asChild` to compose with custom trigger elements

---

**Document Version**: 2.0
**Last Updated**: 2026-02-17
**Status**: Revised (library analysis complete, ready for skill authoring)
