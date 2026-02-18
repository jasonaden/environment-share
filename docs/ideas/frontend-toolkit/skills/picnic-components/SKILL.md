---
name: picnic-components
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
---

# Picnic Design System Components

## Introduction to Picnic

`@attentive/picnic` is Attentive's private design system component library, maintained as a monorepo package at `/libs/picnic`. It provides 57 components across 10 categories, built on three foundational technologies: **Stitches CSS-in-JS** (`@stitches/react` 1.2.8) for styling, **Radix UI** primitives for accessible interactive components, and **Formik** for form state management with Yup validation.

The library ships two themes — `theme2021` (the default light theme) and `themeDark` (a partial dark override that changes ~15 functional color tokens). Typography uses the Ginto font family: **Ginto Nord** for display headings and **Ginto Normal** for body text, with only two font weights available (`$regular` at 400 and `$bold` at 500).

All components import from a single package entry point:

```tsx
import { Button, Box, Stack, Text, styled } from '@attentive/picnic';
```

Activate the theme in the application root by calling `usePicnicStyles()`, which applies global reset styles, sets the body font family, background color, and default text properties. The library targets React 18.1.0 with TypeScript 5.4, uses Vitest for testing, and documents components in Storybook 9.1.x with Chromatic visual testing.

The core philosophy prioritizes **consistency through tokens** (never raw CSS values), **accessibility through Radix** (built-in ARIA and keyboard navigation), and **composition through compound components** (namespace dot-notation API).

## Component Discovery Workflow

### Step 1: Identify the Category

Search by UI intent across the 10 component categories:

- **User input?** → Forms (15): TextInput, TextArea, Select, MultiSelect, Checkbox, RadioGroup, Switch, SearchBar, FileInput, InputGroup, TagSelector, DatePicker, DateRangePicker, TimePicker, FormField
- **Display data?** → Data Display (7): Table, Badge, Tag, ContainedLabel, ProgressBar, StepTracker, List
- **Navigate?** → Navigation (3): Breadcrumbs, TabGroup, Paginator
- **Show/hide content?** → Overlays (6): Dialog, StandardDialog, Drawer, StandardDrawer, Popover, DropdownMenu
- **Provide feedback?** → Feedback (5+): Banner, Accordion, Tooltip, IconPopover, LoadingIndicator, LoadingPlaceholder
- **Arrange layout?** → Layout (6): Box, Stack, Grid, PageLayout, FooterLayout, Separator
- **Display text?** → Typography (3): Heading, Text, TextWithOverflowTooltip
- **Trigger actions?** → Actions (6): Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, PickerButton
- **Show icons/images?** → Media/Branding (7+): Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark, Emoji
- **Utility behavior?** → Utility (2): ContinuousScroll, TabGroupTransformer

### Step 2: Check for Compound Sub-Components

Many Picnic components expose sub-components via dot notation. Before manually composing UI, check whether the target component has a namespace API — approximately 20 components are compound. For example, `Table.HeaderCell`, `Form.TextInput`, `Dialog.Content`, `Select.Item`, `Accordion.Item`. Always prefer the namespace API over manual composition when available.

### Step 3: Decision Tree

Follow this priority order when building UI:

1. **Existing component** — check if a Picnic component already handles the use case
2. **Composition with Box + css** — combine existing components using `Box` with the `css` prop for layout
3. **Custom styled component** — create a new component with `styled()` only when no combination of existing components suffices

### Step 4: Validate in Storybook

Consult the Picnic Storybook (9.1.x with Chromatic) as living documentation. Watch for deprecation notices — the `basic` variant on Button is deprecated in favor of `secondary`.

Refer to `references/component-catalog.md` for the complete 57-component reference with props, variants, and code examples.

## Stitches Styling Patterns

Picnic uses Stitches CSS-in-JS exclusively — not Tailwind, not CSS Modules, not plain CSS. All styling flows through two mechanisms: the `styled()` function and the `css` prop.

### The styled() Function

Create styled components with variants using `styled()`:

```tsx
const Card = styled('div', {
  backgroundColor: '$bgDefault',
  borderRadius: '$radius2',
  p: '$space4',
  variants: {
    elevation: {
      flat: { boxShadow: 'none' },
      raised: { boxShadow: '$shadow2' },
    },
  },
  defaultVariants: { elevation: 'flat' },
});
```

Extend existing components by passing a component as the first argument: `const SpecialCard = styled(Card, { border: '1px solid $borderDefault' })`. Extract variant types in TypeScript with `VariantProps<typeof Card>`.

### The css Prop

Apply inline style overrides via the `css` prop, typed as `PicnicCss`. Every Picnic component accepts this prop:

```tsx
<Box css={{ display: 'flex', gap: '$space4', backgroundColor: '$bgAccent' }}>
  <Text css={{ color: '$textSubdued' }}>Muted label</Text>
</Box>
```

### Token Reference Syntax

Reference any theme token with the `$` prefix: `'$bgActionPrimary'`, `'$space4'`, `'$fontSize3'`, `'$radius2'`. For cross-scale references (e.g., using a color token in a non-color property like `boxShadow`), use the explicit scale path: `'0 0 0 2px $colors$bgDefault'`.

### Custom Stitches Utilities

Picnic configures several custom CSS utilities that expand into standard properties:

- **Spacing shorthands**: `p`, `pt`, `pr`, `pb`, `pl`, `px`, `py` for padding; `m`, `mt`, `mr`, `mb`, `ml`, `mx`, `my` for margin — e.g., `px: '$space4'`, `my: '$space2'`
- **Focus**: `focusVisible: '$focus'` — generates `:focus` and `:focus-visible` rules with box-shadow
- **Transition**: `defaultTransition: ['box-shadow', 'color']` — applies 0.2s ease transitions
- **Grid**: `gridTemplateColumnsRepeat: 3`, `gridColumnSpan: 2`
- **Text**: `maxLines: 2` — applies CSS line clamp
- **Browser**: `safariOnly: { ... }` — Safari-specific CSS
- **List**: `listStyleOverride: 'unstyled'` — resets list styles

### Responsive Styles

Apply responsive styles using Stitches media tokens inside the `css` prop or `styled()`:

```tsx
<Heading css={{ fontSize: '$fontSize4', '@bp2': { fontSize: '$fontSize6' } }}>
  Responsive Title
</Heading>
```

Breakpoints are mobile-first (min-width): `@bp1` (640px), `@bp2` (768px), `@bp3` (1024px), `@bp4` (1280px). For JavaScript-based responsive logic, use the `useBreakpoints()` hook which returns `{ atBp1, atBp2, atBp3, atBp4 }` booleans. The `responsiveRule()` utility and `ResponsiveValue<T>` type support array-based responsive prop values.

Refer to `references/stitches-patterns.md` for the complete styling API reference with all utilities, theming, and responsive patterns.

## Compound Component Pattern

The compound component pattern is the dominant API pattern in Picnic — approximately 20 components use a namespace dot-notation API. Understanding this pattern is essential for using the library correctly.

### How It Works

Parent components expose sub-components as static properties accessed via dot notation:

```tsx
<Table columns={3}>
  <Table.Header>
    <Table.HeaderRow>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
    </Table.HeaderRow>
  </Table.Header>
  <Table.Body>
    <Table.BodyRow>
      <Table.BodyCell>John Doe</Table.BodyCell>
      <Table.BodyCell><Badge variant="active">Active</Badge></Table.BodyCell>
    </Table.BodyRow>
  </Table.Body>
</Table>
```

### Implementation Mechanism

Compound components are created via the `compositeComponent()` utility or manual static property assignment. Sub-components follow the `DisplayName` convention of `'Component.SubComponent'` (e.g., `'Table.HeaderCell'`).

### Context Propagation

Parent variants automatically flow to children via React Context. For example, the Accordion's variant determines Item styling, and Banner's variant controls Heading color. Some components like Banner and FormField parse `React.Children` by type to place children into specific layout slots.

### Key Compound Components

The major compound component families include: `Form` (15 sub-components), `Table` (11 sub-components), `Dialog`, `Drawer`, `Select`, `MultiSelect`, `DropdownMenu`, `Popover`, `Tooltip`, `Accordion`, `TabGroup`, `Banner`, `FormField`, `Breadcrumbs`, `Paginator`, `StepTracker`, `List`, `Grid`, `ContainedLabel`, and `TextWithOverflowTooltip`.

Always prefer the namespace API over manual composition. Use `<Form.TextInput>` inside a `<Form>`, not a standalone `<TextInput>` — the compound version connects to Formik state automatically.

## Variant System

Picnic components use Stitches variants to expose predefined visual and behavioral options. Variants are declared in `styled()` calls and consumed as component props.

### Common Variant Patterns

Consistent variant names recur across the library:

- **Color/variant**: `primary | secondary | subdued | inverted` (Buttons); `default | subdued | inverted | success | warning | critical | info | decorative1-4` (Text, Heading, Icon)
- **Size**: `small | normal` (form inputs); `small | medium | large` (Buttons); `extraSmall | small | medium | large` (Icons)
- **State**: `normal | error` (form inputs reflect validation state)

### Compound Variants

`compoundVariants` apply styles when multiple variant values combine. For example, a Button's disabled state combined with the primary variant applies specific disabled background and text colors distinct from a disabled secondary button.

### Default Variants

`defaultVariants` set the initial prop values when no variant prop is passed. Check component documentation or Storybook for default values — they vary per component.

### Boolean Variants

Some variants accept boolean values: `disabledVisually: { true: { ... }, false: { ... } }`. Pass them as boolean props: `<Button disabledVisually>`.

### Deprecations

The `basic` variant on Button is deprecated — use `secondary` instead. The `legacy-inverted` variant still exists but should be avoided in new code.

Refer to `references/component-catalog.md` for the full variant matrix showing which components support which variant values.

## Design Tokens Quick Reference

Picnic uses a Stitches-powered token system where all design values are referenced with `$` prefix syntax. Never use raw CSS values — always use tokens to ensure theme compatibility.

### Two-Tier Color System

1. **Raw perceptual palette** — named color scales like `$grayscale0`–`$grayscale1000`, `$yellow100`–`$yellow700`, `$green100`–`$green900`, `$red100`–`$red800`, plus brand colors (creamsicleOrange, aperolOrange, hyperlinkBlue, celeryGreen, cloudBlue, cloveBrown, lavenderPurple, steelBlue). **Do not use these directly in components.**
2. **Functional/semantic tokens** (~100) — purpose-based tokens prefixed by category: `$bg*` (~50 background tokens), `$text*` (~16 text tokens), `$icon*` (~15 icon tokens), `$border*` (~13 border tokens). **Always use these.**

Functional tokens use state suffixes: `Default`, `Hover`, `Pressed`, `Disabled`, `Selected`, `Inverted`. For example: `$bgActionPrimary` → `$bgActionPrimaryHover` → `$bgActionPrimaryPressed`.

### Spacing and Sizing

A 4px grid governs all spacing: `$space0` (0) through `$space16` (64px) in 4px increments. Sizes mirror the same scale: `$size0` through `$size16`.

### Typography

- **Fonts**: `$display` (Ginto Nord — headings), `$body` (Ginto Normal — everything else)
- **Font sizes**: `$fontSize1` (0.75rem / 12px) through `$fontSize7` (2rem / 32px)
- **Weights**: Only two — `$regular` (400) and `$bold` (500). No semibold, medium, or light.
- **Line heights**: `$lineHeight1` (1) through `$lineHeight7` (1.5)

### Shadows, Radii, and Z-Index

- **Shadows**: `$focus` (focus ring), `$inputFocus` (input focus ring), `$shadow1`–`$shadow4` (elevation), `$drastic` (heavy shadow)
- **Radii**: `$radius1` (4px), `$radius2` (8px), `$radius3` (16px), `$radiusMax` (9999px / pill)
- **Z-index**: `$layer0` (0) through `$layerMax` (2147483647) with 10000 gaps between layers

### Breakpoints

Mobile-first media queries: `@bp1` (640px), `@bp2` (768px), `@bp3` (1024px), `@bp4` (1280px).

Refer to `references/design-tokens.md` for the complete token tables with hex values, dark theme overrides, and usage guidelines.

## Form System

Picnic's `<Form>` component wraps Formik, providing a compound component API for building validated forms without manual Formik setup.

### Basic Structure

`<Form>` accepts `initialValues`, `onSubmit`, and `validationSchema` (Yup) — the same props as Formik. Compound sub-components connect to Formik state automatically via the `name` prop:

```tsx
import { Form } from '@attentive/picnic';
import * as Yup from 'yup';

const schema = Yup.object({
  email: Yup.string().email().required(),
  name: Yup.string().required(),
});

<Form initialValues={{ email: '', name: '' }} validationSchema={schema} onSubmit={handleSubmit}>
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
  <Form.SubmitButton>Submit</Form.SubmitButton>
</Form>
```

### Compound Sub-Components

The Form namespace includes: `Form.FormField`, `Form.TextInput`, `Form.Select`, `Form.Checkbox`, `Form.Switch`, `Form.RadioGroup`, `Form.DatePicker`, `Form.MultiSelect`, `Form.SearchableSelect`, `Form.TextArea`, `Form.Label`, `Form.ErrorText`, `Form.HelperText`, `Form.SubmitButton`, `Form.ResetButton`.

### FormField Layout

`FormField` organizes label, input, helper text, and error text within a structured layout. Set `layout: 'vertical' | 'horizontal'` to control field orientation. `FormField.Label` supports `requirement: 'none' | 'required' | 'optional'` to display requirement indicators.

### Accessing Formik State

Use the `useForm<V>()` hook to access Formik state (values, errors, touched, setFieldValue) from within a Form context. Standalone input components (TextInput, Select, Checkbox) also work independently outside of Form for non-Formik use cases.

## Accessibility

Picnic builds accessibility into its foundation through Radix UI primitives and consistent utility patterns.

### Radix UI Foundation

The following components wrap Radix primitives with built-in ARIA roles, keyboard navigation, and focus management: Dialog, Drawer, Popover, Tooltip, DropdownMenu, TabGroup, Accordion, Checkbox, RadioGroup, and Switch. Keyboard navigation (arrow keys, Escape, Enter, Space) is handled automatically by Radix.

### Focus Management

Apply consistent focus ring styling with the `focusVisible` utility: `focusVisible: '$focus'`. This generates both `:focus` and `:focus-visible` rules using box-shadow for the ring.

### Screen Reader Support

Use the `VisuallyHidden` component (re-exported from Radix) for screen-reader-only content that should not be visually displayed.

### Icon Accessibility

The Icon component uses a discriminated union for accessibility: specify `mode: 'presentational'` with a required `description` prop for meaningful icons, or `mode: 'decorative'` for icons that convey no information (no description needed).

### Table Accessibility

Table uses CSS Grid for layout but applies semantic ARIA roles (`role="table"`, `role="row"`, `role="cell"`, `role="columnheader"`) to maintain table semantics for assistive technologies.

---

## Additional Resources

For detailed reference information beyond this skill, consult the following files:

- **`references/component-catalog.md`** — Complete reference of all 57 Picnic components with TypeScript props interfaces, Stitches variant definitions, compound sub-component maps, code examples, and related component cross-references. Use this when looking up specific component APIs, prop types, or the full compound component hierarchy.

- **`references/design-tokens.md`** — Complete token tables for the Stitches design token system including all color tokens (raw palette and ~100 functional tokens with hex values), space/size scales, typography tokens, shadows, radii, z-indices, border widths, and breakpoints. Includes dark theme override mappings and usage guidelines.

- **`references/stitches-patterns.md`** — Stitches CSS-in-JS patterns specific to Picnic covering the `styled()` API in depth, `css` prop patterns with nested selectors and pseudo-classes, all custom utility references with examples, responsive design patterns (`responsiveRule()`, `ResponsiveValue<T>`, `useBreakpoints()`), and theming (`createPicnicTheme`, `usePicnicStyles`, dark theme configuration).
