# Proposal 07: Token Optimization — Claude Knowledge Analysis

**Task**: #4 — Research what Claude already knows vs. what must be taught
**Author**: Knowledge Analyst Agent

---

## Executive Summary

Claude (the model reading these skills) already has extensive training-data knowledge of React, TypeScript, Stitches CSS-in-JS, Radix UI, Formik/Yup, Downshift, CSS layout, and accessibility patterns. Roughly **25-30% of the proposed skill content teaches Claude things it already knows**, and another **8-10% can be compressed to single-line reminders**. The remaining **60-65% is genuinely Picnic-specific knowledge that must be taught**.

Estimated token savings from removing/compressing categories A and B: **~24,000 tokens** across all skills and references.

---

## Classification Framework

### A. "Claude Knows This" (REMOVE)
Generic knowledge Claude has from training data. Teaching it wastes tokens and dilutes the signal-to-noise ratio of the skill.

### B. "Claude Might Know This" (COMPRESS to 1 line)
Knowledge Claude probably has, but where the Picnic-specific deviation or constraint is critical. Compress to a single-line reminder.

### C. "Claude Doesn't Know This" (KEEP)
Picnic-specific knowledge that exists nowhere in training data. This is the **entire value** of the skill system.

---

## What Claude Already Knows (Global)

Before analyzing each skill, here's the baseline of Claude's training-data knowledge that should NEVER be taught:

| Domain | What Claude Knows | Confidence |
|--------|------------------|------------|
| React | Hooks, Context, compound components, dot-notation APIs, refs, portals, Children.map | Very high |
| TypeScript | Generics, discriminated unions, VariantProps extraction, type inference | Very high |
| Stitches | `styled()`, `css` prop, `$token` syntax, variants, compoundVariants, defaultVariants, responsive @bp | High |
| Radix UI | Dialog, Tooltip, Accordion, Popover, DropdownMenu, Tabs, Checkbox, RadioGroup, Switch, Separator, VisuallyHidden — all APIs, ARIA roles, keyboard nav, asChild, controlled/uncontrolled, focus trapping, scroll locking, portal rendering | High |
| Formik | Form, Field, useFormik, initialValues, onSubmit, validationSchema, values/errors/touched/setFieldValue, enableReinitialize | High |
| Yup | object(), string(), number(), required(), email(), conditional validation, custom validators | High |
| Downshift | Select, ComboBox, useSelect, useCombobox | Moderate |
| CSS | Flexbox, Grid, media queries, pseudo-classes, pseudo-elements, box-shadow, z-index stacking | Very high |
| Accessibility | ARIA roles, screen readers, keyboard navigation, focus management, alt text, aria-label | Very high |
| Design Systems | Token-based design, semantic color systems, spacing scales, typography scales | High |

---

## Per-Skill Analysis

### 1. Current SKILL.md (~315 lines)

#### A. Remove (~90 lines, 29%)

| Section | Content to Remove | Why Claude Knows It |
|---------|------------------|---------------------|
| Introduction | "built on Stitches CSS-in-JS for styling, Radix UI primitives for accessible interactive components, and Formik for form state management with Yup validation" | Claude knows what these libraries do |
| Introduction | "targets React 18.1.0 with TypeScript 5.4, uses Vitest for testing" | Generic tech stack description |
| Introduction | "consistency through tokens, accessibility through Radix, composition through compound components" | Generic design system philosophy |
| Component Discovery | "Search by UI intent across..." concept explanation | Claude knows component categorization |
| Discovery | "Always prefer the namespace API over manual composition when available" | Generic compound component best practice |
| Stitches Patterns | How `styled()` works (basic syntax, extending, VariantProps) | Claude knows Stitches styled() API |
| Stitches Patterns | "Apply inline style overrides via the css prop" explanation | Claude knows Stitches css prop |
| Compound Components | "Parent components expose sub-components as static properties via dot notation" | Claude knows this pattern |
| Compound Components | "Compound components are created via utility or manual static property assignment" | Generic React pattern |
| Compound Components | "Parent variants automatically flow to children via React Context" | Claude knows Context propagation |
| Compound Components | "Some components parse React.Children by type to place children into specific layout slots" | Claude knows Children.map patterns |
| Variant System | How variants work in styled() (declaration, consumption, compound, boolean, defaults) | Claude knows Stitches variants |
| Tokens | General concept of "design tokens" and why they exist | Claude knows design systems |
| Form System | "wraps Formik, providing..." + Formik concepts (initialValues, onSubmit, validationSchema) | Claude knows Formik |
| Accessibility | "Radix primitives with built-in ARIA roles, keyboard navigation, and focus management" | Claude knows Radix a11y |
| Accessibility | List of which components wrap Radix primitives | Claude knows which Radix primitives exist |
| Accessibility | "Keyboard navigation handled automatically by Radix" | Claude knows this |
| Accessibility | "VisuallyHidden component re-exported from Radix" | Claude knows VisuallyHidden |

#### B. Compress (~25 lines → ~10 lines, 8% → 3%)

| Current Content | Compressed Version |
|----------------|-------------------|
| "Picnic uses Stitches CSS-in-JS exclusively — not Tailwind, not CSS Modules, not plain CSS. All styling flows through two mechanisms: the styled() function and the css prop." | `Stitches only (@stitches/react 1.2.8). No Tailwind/CSS Modules/className.` |
| "All components import from a single package entry point" + code block | `Import: { Component, styled } from '@attentive/picnic'` |
| "Storybook 9.1.x with Chromatic visual testing" paragraph | `Storybook 9.1.x + Chromatic for visual testing.` |
| "Apply responsive styles using Stitches media tokens..." + explanation | `Responsive: @bp1 (640), @bp2 (768), @bp3 (1024), @bp4 (1280) — mobile-first.` |
| "css prop typed as PicnicCss" paragraph | `css prop type: PicnicCss.` |

#### C. Keep (~200 lines, 63%)

- `@attentive/picnic` import path
- 57+ component names organized by 10 categories (entire discovery table)
- ~20 compound components list with sub-component counts
- Custom Stitches utilities (focusVisible, defaultTransition, maxLines, safariOnly, gridTemplateColumnsRepeat, gridColumnSpan, listStyleOverride)
- Cross-scale reference syntax: `$colors$tokenName`
- Breakpoint values: @bp1-@bp4 with pixel values
- `useBreakpoints()` hook: `{ atBp1, atBp2, atBp3, atBp4 }`
- `responsiveRule()` utility and `ResponsiveValue<T>` type
- `compositeComponent()` utility
- All variant names per component (primary|secondary|subdued|inverted, etc.)
- Button deprecation: basic → secondary, legacy-inverted avoid
- Two-tier color system with functional token prefixes ($bg*, $text*, $icon*, $border*) and counts
- State suffixes: Default, Hover, Pressed, Disabled, Selected, Inverted
- All spacing/sizing/typography/shadow/radii/z-index token names and values
- Ginto Nord / Ginto Normal fonts; only $regular (400) and $bold (500) weights
- `usePicnicStyles()`, theme2021, themeDark
- Form.* namespace (15 sub-components list)
- FormField layout prop, Label requirement prop
- `useForm<V>()` hook
- Icon discriminated union: mode='presentational' (requires description) vs mode='decorative'
- Table uses CSS Grid with ARIA roles

---

### 2. design-tokens Skill (Proposal 03, ~100 lines)

#### A. Remove (~10 lines, 10%)

| Content | Why |
|---------|-----|
| "Design tokens are referenced with $ prefix syntax" explanation | Claude knows Stitches $ syntax |
| General explanation of what semantic/functional tokens are | Claude knows design system token architecture |

#### B. Compress (~15 lines → ~5 lines, 15% → 5%)

| Current | Compressed |
|---------|-----------|
| "NEVER use raw CSS values (hex, px, rem)" multi-line explanation | `Rule: NEVER raw CSS. ALWAYS $token. NEVER raw palette ($grayscale*). ALWAYS functional ($bg*, $text*, $icon*, $border*).` |
| "Mobile-first media queries" + see stitches-patterns skill | `Breakpoints: @bp1(640) @bp2(768) @bp3(1024) @bp4(1280). See stitches-patterns.` |

#### C. Keep (~75 lines, 75%)

- Two-tier color system: raw palette vs ~97 functional tokens
- All functional token prefixes with counts ($bg* ~53, $text* ~16, $icon* ~15, $border* ~13)
- State suffixes: Default → Hover → Pressed → Disabled → Selected
- Color Decision Guide (which $bg/$text/$border for which purpose)
- Status coordinated sets (Success/Critical/Warning/Info/Guidance)
- Decorative color sets (celery/cloud/steel/lavender)
- 4px grid: $space0 (0) through $space16 (64px)
- Typography: $display (Ginto Nord), $body (Ginto Normal)
- Sizes: $fontSize1 (12px) through $fontSize7 (32px)
- ONLY two weights: $regular (400), $bold (500)
- Line heights: $lineHeight1-$lineHeight7
- Letter spacing: $letterSpacing1 (0.3px)
- Shadows: $focus, $inputFocus, $shadow1-$shadow4, $drastic
- Radii: $radius1 (4px), $radius2 (8px), $radius3 (16px), $radiusMax (pill)
- Z-index: $layer0-$layerMax with 10000 gaps
- Border widths: $borderWidth1 (1px), $borderWidth2 (2px)
- Cross-scale syntax: `$colors$tokenName`, `$borderWidths$borderWidth1`
- All anti-patterns with specific token corrections

**Savings: ~20 lines removed/compressed → ~700 tokens**

---

### 3. stitches-patterns Skill (Proposal 03, ~110 lines)

#### A. Remove (~35 lines, 32%)

| Content | Why |
|---------|-----|
| styled() basic syntax and usage | Claude knows Stitches styled() |
| styled() extending components | Claude knows styled(Component, {...}) |
| css prop basic usage and token references | Claude knows Stitches css prop |
| Nested selectors (`& > div`, `&:hover`) | Claude knows CSS-in-JS nesting |
| Pseudo-classes and pseudo-elements | Claude knows these |
| Variants system (string, size, boolean, compound, defaults) | Claude knows Stitches variants |
| VariantProps<typeof Component> type extraction | Claude knows this |
| "Responsive mobile-first" concept | Claude knows responsive design |
| "breakpoints are min-width" concept | Claude knows mobile-first |

#### B. Compress (~15 lines → ~5 lines, 14% → 5%)

| Current | Compressed |
|---------|-----------|
| "Stitches only — never Tailwind, CSS Modules, className, or plain CSS" | `Stitches ONLY. No Tailwind/CSS Modules/className/style prop.` |
| "css prop spread order — always spread incoming css LAST" multi-line | `css prop: spread incoming css LAST so consumer overrides win.` |
| "Responsive mobile-first" with @bp examples | `@bp1(640) @bp2(768) @bp3(1024) @bp4(1280) — min-width, base=mobile.` |

#### C. Keep (~60 lines, 55%)

- `PicnicCss` type name
- All custom utilities: p/pt/pr/pb/pl/px/py, m/mt/mr/mb/ml/mx/my, focusVisible, defaultTransition, gridTemplateColumnsRepeat, gridColumnSpan, maxLines, safariOnly, listStyleOverride
- focusVisible: '$focus' (buttons/cards) vs '$inputFocus' (inputs)
- defaultTransition: 0.2s ease timing
- Shared base styles cast: `as unknown as PicnicCss`
- responsiveRule() utility with array-to-breakpoint mapping
- ResponsiveValue<T> type
- useBreakpoints() hook: { atBp1, atBp2, atBp3, atBp4 }
- usePicnicStyles(): global reset + theme application
- Themes: theme2021 (light), themeDark (~13 overrides)
- createTheme('name', { colors: { ...overrides } })
- Stack gap silently stripped anti-pattern
- Standard transition timing (always defaultTransition)
- Cast shared styles pattern
- String interpolation in token values: `padding: '$space3 $space4'`
- Display name convention: Component.displayName = 'ComponentName'

**Savings: ~45 lines removed/compressed → ~1,575 tokens**

---

### 4. layout-primitives Skill (Proposal 03, ~70 lines)

#### A. Remove (~10 lines, 14%)

| Content | Why |
|---------|-----|
| "Box: raw layout primitive" conceptual description | Claude knows Box/div wrappers |
| "Stack: vertical or horizontal children with consistent spacing" concept | Claude knows Stack patterns |
| "Grid: CSS Grid with equal columns" concept | Claude knows CSS Grid |
| Box is polymorphic (`as` prop) explanation | Claude knows polymorphic components |

#### B. Compress (~10 lines → ~5 lines, 14% → 7%)

| Current | Compressed |
|---------|-----------|
| Decision Guide multi-line explanation | `Prefer: Stack > Grid > Box (highest abstraction first).` |
| Separator wraps @radix-ui/react-separator | `Separator: Radix-based. orientation, decorative (default true), size (small|large).` |

#### C. Keep (~50 lines, 71%)

- Stack: uses margin `(> * + *)` NOT CSS gap — Safari compat
- **CRITICAL: gap in Stack css prop is SILENTLY STRIPPED — use spacing prop only**
- Stack props: direction ('vertical'|'horizontal'), spacing (token, default '$space4')
- Grid props: columns (number|ResponsiveValue), gap (token)
- Grid.Cell: colSpan (number|ResponsiveValue)
- Grid responsive arrays: [1, 2, 3, 4] maps to base, @bp1, @bp2, @bp3
- gridTemplateColumnsRepeat utility (internal)
- PageLayout compound hierarchy: .Header (variant: responsive|inline|stacked), .Header.Heading, .Header.Description, .Header.Button, .Header.TextContainer, .Header.ButtonContainer
- FooterLayout: fixed footer for page actions
- Separator: size variants (small|large)
- Common layout patterns (page structure, card grid, form layout, sidebar+main, centered container)

**Savings: ~15 lines removed/compressed → ~525 tokens**

---

### 5. data-table Skill (Proposal 04, ~360 lines)

#### A. Remove (~80 lines, 22%)

| Content | Why |
|---------|-----|
| General concept of data tables, what sorting/selection/pagination are | Claude knows data table patterns |
| CSS Grid column sizing concepts | Claude knows CSS Grid |
| Sort state management (ascending/descending toggle) generic pattern | Claude knows sorting UI patterns |
| Select-all checkbox logic (generic) | Claude knows selection patterns |
| "Keyboard navigation in tables" generic concept | Claude knows a11y |
| Pagination concept (offset-based navigation) | Claude knows pagination |
| Infinite scroll concept | Claude knows virtual scrolling |
| "ARIA roles for table semantics" general explanation | Claude knows ARIA table roles |
| Empty state messaging concept | Generic UI pattern |
| Filter state management concept | Generic state management |

#### B. Compress (~40 lines → ~15 lines, 11% → 4%)

| Current | Compressed |
|---------|-----------|
| Decision tree: Table vs List vs Card grid | `Table: tabular data. List: simple lists. Card grid: visual items. Grid for cards.` |
| Clickable rows explanation | `BodyFocusableRow: clickable row. FocusWrapper: keyboard-focusable cells.` |
| Empty/loading states section | `Empty: message in full-width row. Loading: LoadingPlaceholder rows matching column count.` |

#### C. Keep (~240 lines, 67%)

- Table compound hierarchy (11 sub-components: Header, HeaderRow, HeaderCell, SortableHeaderCell, HeaderSelectorCell, Body, BodyRow, BodyFocusableRow, BodyCell, FocusWrapper, RowSelectorCell)
- Column configuration: `columns` (number) vs `columnSizes` (string[] CSS Grid values)
- Equal columns, ratio columns, explicit CSS Grid sizes
- Cell alignment variants (cellAlignVariants)
- SortableHeaderCell: specific API, onChange callback
- RowSelectorCell/HeaderSelectorCell: specific API, checked/onChange/value props
- BodyFocusableRow + FocusWrapper keyboard pattern
- Badge valid variants in table context: active, standard, primary, error, magic
- ContainedLabel valid variants: neutral, success, informational, warning, critical, decorative1-4, overMedia, magic
- Paginator integration: totalItems, maxItemsPerPage, offset, onOffsetChange
- Paginator compound: .Label, .ButtonGroup
- ContinuousScroll: onLoadMore, isLoading, hasMore, threshold
- DropdownMenu for row actions (11 sub-component hierarchy)
- SearchBar filtering pattern above table
- textVariant on cells
- Full example with all patterns combined
- Column count mismatch pitfall

**Savings: ~105 lines removed/compressed → ~3,675 tokens**

---

### 6. form-builder Skill (Proposal 04, ~395 lines)

#### A. Remove (~100 lines, 25%)

| Content | Why |
|---------|-----|
| Formik concepts (initialValues, onSubmit, validationSchema) | Claude knows Formik |
| Yup schema patterns (string().email().required(), object()) | Claude knows Yup |
| Conditional validation with Yup (when/is/then) | Claude knows Yup conditional |
| Custom validate function concept | Claude knows Formik validate |
| Field-level validation concept | Claude knows Formik field-level |
| Form state access concepts (values, errors, touched, setFieldValue, isSubmitting) | Claude knows Formik state |
| resetForm, dirty/touched concepts | Claude knows Formik |
| enableReinitialize concept | Claude knows Formik |
| "Character counter" generic pattern | Generic UI pattern |
| Submit/reset button loading state concept | Generic pattern |
| Formik re-render optimization concepts | Claude knows Formik optimization |

#### B. Compress (~45 lines → ~15 lines, 11% → 4%)

| Current | Compressed |
|---------|-----------|
| Form vs standalone decision section | `Form.*: use inside <Form> for Formik binding. Standalone: use outside <Form> for simple uncontrolled inputs.` |
| "Moment.js integration" section for DatePicker | `DatePicker/DateRangePicker/TimePicker: Moment.js values. Import moment.` |
| Select pattern explanation | `Select: Downshift-based. Select.Item(value), Select.Group(label), Select.IconItem, Select.Value.` |

#### C. Keep (~250 lines, 63%)

- Form compound namespace: all 15 sub-components (Form.FormField, Form.TextInput, Form.Select, Form.Checkbox, Form.Switch, Form.RadioGroup, Form.DatePicker, Form.MultiSelect, Form.SearchableSelect, Form.TextArea, Form.Label, Form.ErrorText, Form.HelperText, Form.SubmitButton, Form.ResetButton)
- **Critical: Form.* vs standalone — Form.TextInput auto-binds to Formik, standalone TextInput does not**
- FormField layout: 'vertical' | 'horizontal'
- FormField slot-based parsing (Label, input, HelperText, ErrorText, IconPopover)
- Label requirement: 'none' | 'required' | 'optional'
- useForm<V>() hook (Picnic-specific, not useFormik)
- Select compound: Select.Item, Select.Group, Select.IconItem, Select.Value
- MultiSelect compound: MultiSelect.Item
- SearchableSelect compound: SearchableSelect.Item
- Checkbox.CheckboxItem sub-component
- RadioGroup.Item sub-component
- DatePicker, DateRangePicker, TimePicker — Moment.js value types
- FileInput props
- InputGroup pattern (phone number example)
- TagSelector pattern
- Size variants on inputs: 'small' | 'normal'
- State variants on inputs: 'normal' | 'error'
- Full multi-field form example with all patterns
- All per-component prop requirements

**Savings: ~130 lines removed/compressed → ~4,550 tokens**

---

### 7. dialog-drawer Skill (Proposal 04, ~350 lines)

#### A. Remove (~100 lines, 29%)

| Content | Why |
|---------|-----|
| Radix Dialog concepts (portal, overlay, focus trapping, scroll locking) | Claude knows Radix Dialog |
| Radix Popover concepts (positioning, side/align, arrow) | Claude knows Radix Popover |
| Radix DropdownMenu concepts (trigger, content, items) | Claude knows Radix DropdownMenu |
| Controlled vs uncontrolled (open/onOpenChange) | Claude knows Radix patterns |
| Trigger asChild pattern explanation | Claude knows Radix asChild |
| Portal rendering concept | Claude knows React portals |
| Focus trapping and scroll locking | Claude knows Radix handles this |
| Z-index stacking concept | Claude knows z-index stacking |
| "Exactly one React element child for trigger" | Claude knows Radix asChild constraint |

#### B. Compress (~30 lines → ~10 lines, 9% → 3%)

| Current | Compressed |
|---------|-----------|
| Decision tree: Dialog vs Drawer vs Popover vs DropdownMenu | `Dialog: blocking confirmation. Drawer: slide-in panel (forms, details). Popover: non-blocking info. DropdownMenu: action list.` |
| Standard vs raw component distinction | `Standard*: pre-structured (Header/Body/Footer slots). Raw: custom layout, no slots.` |
| Overlay stacking section | `Z-index: $layer* tokens. Radix handles stacking automatically.` |

#### C. Keep (~220 lines, 63%)

- StandardDialog compound (8 sub-components: Header, Heading, HeroImage, Body, Footer, Close, Description, Content)
- Dialog compound (5 sub-components: Trigger, Content, Overlay, Close, Portal)
- StandardDrawer compound (6 sub-components: Header, Body, Footer, Close, Content, Overlay)
- Drawer compound (4 sub-components: Trigger, Content, Overlay, Close)
- Drawer animation: 300ms, onCloseFinish callback
- Drawer overlay control
- Popover compound (5 sub-components: Trigger, Anchor, Content, Arrow, Close)
- Popover variant: 'default' | 'guidance' ONLY (not info, primary)
- Popover guidance variant: purple/inverted styling
- DropdownMenu compound (11 sub-components: Trigger, Button, Content, Item, TextItem, Label, Separator, CheckboxItem, RadioItem, RadioGroup, Sub)
- StandardDialog.Footer slot: ButtonBar pattern
- StandardDrawer.Footer layout="auto"
- Slot-based layout parsing (Children by type)
- Composition patterns: Form inside StandardDialog, Table inside Drawer, nested Popover
- Close button patterns
- Full examples for each overlay type

**Savings: ~120 lines removed/compressed → ~4,200 tokens**

---

### 8. navigation Skill (Proposal 04, ~220 lines)

#### A. Remove (~50 lines, 23%)

| Content | Why |
|---------|-----|
| Breadcrumbs concept (hierarchical page navigation) | Claude knows breadcrumbs |
| Tab panel concept (tabbed content) | Claude knows tabs |
| Pagination concept (page-based navigation) | Claude knows pagination |
| Radix Tabs keyboard navigation (arrow keys) | Claude knows Radix Tabs |
| Step wizard concept | Claude knows multi-step wizards |
| "TabGroup panel mounting" behavior | Claude knows Radix Tabs lazy rendering |

#### B. Compress (~20 lines → ~8 lines, 9% → 4%)

| Current | Compressed |
|---------|-----------|
| Decision tree section | `Breadcrumbs: hierarchy. TabGroup: content panels. StepTracker: wizard progress. Paginator: data pages.` |
| Routing integration for Breadcrumbs and Link | `Breadcrumbs.Item extends LinkProps. Link: polymorphic as prop for router (e.g., as={RouterLink}).` |
| Auto-bold last item explanation | `Breadcrumbs: last Item auto-styled as current page (no href needed).` |

#### C. Keep (~150 lines, 68%)

- Breadcrumbs compound: Breadcrumbs.Item with LinkProps
- TabGroup compound: TabGroup.List, TabGroup.Tab(value), TabGroup.Panel(value)
- **Critical: Tab must be inside TabGroup.List, not directly in TabGroup**
- TabGroup: controlled vs defaultValue
- StepTracker compound: StepTracker.Step
- StepTracker states: completed, active, incomplete
- StepTracker props: activeStep, clickable steps
- StepTracker layout: inline vs stacked
- Paginator compound: Paginator.Label, Paginator.ButtonGroup
- Paginator required props: totalItems, maxItemsPerPage, offset, onOffsetChange
- Paginator offset semantics (0-based)
- Paginator start/end buttons
- Combining patterns (Breadcrumbs + TabGroup, StepTracker in Drawer, Paginator with Table)
- Full examples for each component

**Savings: ~62 lines removed/compressed → ~2,170 tokens**

---

### 9. feedback-notifications Skill (Proposal 04, ~240 lines)

#### A. Remove (~50 lines, 21%)

| Content | Why |
|---------|-----|
| Banner concept (notification display) | Claude knows notification banners |
| Accordion concept (collapsible content) | Claude knows accordions |
| Tooltip concept (hover information) | Claude knows Radix Tooltip |
| Loading indicator concept (animated feedback) | Claude knows loading states |
| Skeleton placeholder concept | Claude knows skeleton screens |
| Radix Accordion behavior (single/multiple) | Claude knows Radix Accordion |
| Radix Tooltip delay coordination | Claude knows Radix Tooltip.Provider |

#### B. Compress (~20 lines → ~8 lines, 8% → 3%)

| Current | Compressed |
|---------|-----------|
| Decision tree section | `Banner: page-level notification. Accordion: collapsible sections. Tooltip: hover info. IconPopover: info icon + popover.` |
| Tooltip.Provider requirement | `Tooltip.Provider: MUST wrap app root for delay coordination.` |
| LoadingIndicator usage | `LoadingIndicator: inline dots. Center with Box. Use inside Button for loading state.` |

#### C. Keep (~170 lines, 71%)

- Banner compound (4 sub-components: Heading, Text, Action, DismissButton)
- **Banner variants: error, info, warning, success, neutral, guidance — NOT critical/default**
- Banner variant-specific icons (auto-mapped)
- Banner custom iconName override
- Banner dismissible pattern
- Accordion compound (4 sub-components: Item, Trigger, Content, HeaderIcon)
- **Accordion variant is REQUIRED (not optional) — TypeScript error without it**
- Accordion variants: error, info, neutral, warning, decorative3
- Accordion: single vs multiple type, collapsible
- Accordion: variant propagation to Items via Context
- Tooltip compound (3 sub-components: Trigger, Content, Provider)
- **Tooltip.Content variant: 'normal' | 'danger' — NOT 'error'**
- Tooltip side positioning
- IconPopover: convenience wrapper with default icon/description
- IconPopover vs FormField.IconPopover
- LoadingPlaceholder variants: 'shimmer' | 'static'
- LoadingPlaceholder usage patterns (text, cards, skeleton screens)
- Full examples for each feedback pattern
- Banner.Action slot pattern

**Savings: ~62 lines removed/compressed → ~2,170 tokens**

---

### 10. picnic-validator Skill (Proposal 05, ~300 lines)

#### A. Remove (~20 lines, 7%)

| Content | Why |
|---------|-----|
| General concept of "post-generation validation" | Claude knows validation patterns |
| "Extract all JSX elements" scan procedure step | Obvious, needs no instruction |
| Output format template boilerplate | Claude can format output |
| General validation workflow explanation | Process description, not knowledge |

#### B. Compress (~10 lines → ~3 lines, 3% → 1%)

| Current | Compressed |
|---------|-----------|
| Two-layer validation explanation | `Two layers: per-skill checklist (prevention during generation) + centralized validator (full 125-rule scan after generation).` |
| Severity definitions (ERROR/WARNING/INFO) | `ERROR=must fix. WARNING=should fix. INFO=consider.` |

#### C. Keep (~270 lines, 90%)

**All 125 validation rules are entirely Picnic-specific.** Every single rule encodes knowledge that exists ONLY in Picnic's source code:
- 20 variant restriction rules (specific valid/invalid values per component)
- 20 required prop rules (specific required props per component)
- 10 deprecated pattern rules (basic→secondary, standalone-in-Form)
- 10 type discrimination rules (Icon mode→description, Accordion type→value)
- 15 styling rules (no raw CSS, no className, specific token corrections)
- 25 composition rules (parent-child nesting requirements)
- 12 accessibility rules (specific description/label requirements)
- 13 token rules (raw value → specific token corrections)

**Savings: ~27 lines removed/compressed → ~945 tokens**

---

### 11. Reference Files

#### design-tokens reference (~15KB target)

| Category | Classification | Notes |
|----------|---------------|-------|
| Functional color token tables | C (100% KEEP) | Every token name, purpose, value is Picnic-specific |
| Semantic coordination tables | C (100% KEEP) | Picnic-specific coordinated sets |
| Interactive state progressions | C (100% KEEP) | Picnic-specific state token chains |
| Space/size token tables | C (100% KEEP) | Picnic-specific values |
| Typography token tables | C (100% KEEP) | Picnic-specific fonts, sizes, weights |
| Shadow/radii/z-index tables | C (100% KEEP) | Picnic-specific values |
| Raw palette appendix | C (KEEP, compact) | For theme creation reference |

**Assessment: ~95% C (keep), ~5% prose that can be trimmed. Minimal savings (~750 tokens). Token tables are pure Picnic data.**

#### stitches-patterns reference (~10KB target)

| Category | Classification | Notes |
|----------|---------------|-------|
| styled() API deep dive | A/B (~40% removable) | Claude knows Stitches styled() patterns |
| Variants reference | A/B (~30% removable) | Claude knows variant patterns; keep Picnic-specific examples |
| css prop patterns | A (~50% removable) | Claude knows nested selectors and pseudo-classes |
| Custom utils full reference | C (100% KEEP) | All custom utilities are Picnic-specific |
| Responsive design patterns | B/C (~20% removable) | responsiveRule() is Picnic-specific, @bp concepts are known |

**Assessment: ~35% removable (A+B), ~65% keep (C). Savings: ~3,500 tokens. Keep: custom utils, responsiveRule, theme API, Picnic-specific cast patterns.**

#### Component reference files (actions, typography, media, data-display, utility — ~1,110 lines total)

| Category | Classification | Notes |
|----------|---------------|-------|
| Import statements | C (KEEP) | Picnic-specific imports |
| Props tables | C (100% KEEP) | Picnic-specific prop names, types, defaults |
| Variant/size tables | C (100% KEEP) | Picnic-specific variant values |
| Usage examples | C (mostly KEEP) | Show Picnic-specific API |
| "What is a Button/Heading/etc." explanations | A (REMOVE) | Claude knows these components |
| Cross-references | C (KEEP) | Picnic-specific composition guidance |

**Assessment: ~10% removable (A), ~90% keep (C). Savings: ~1,100 tokens.**

---

## Summary Table

| Skill / Artifact | Total Lines | A (Remove) | B (Compress) | C (Keep) | A% | B% | C% | Token Savings |
|-----------------|-------------|-----------|-------------|---------|-----|-----|-----|--------------|
| Current SKILL.md | 315 | 90 | 25→10 | 200 | 29% | 8% | 63% | ~3,675 |
| design-tokens | 100 | 10 | 15→5 | 75 | 10% | 15% | 75% | ~700 |
| stitches-patterns | 110 | 35 | 15→5 | 60 | 32% | 14% | 55% | ~1,575 |
| layout-primitives | 70 | 10 | 10→5 | 50 | 14% | 14% | 71% | ~525 |
| data-table | 360 | 80 | 40→15 | 240 | 22% | 11% | 67% | ~3,675 |
| form-builder | 395 | 100 | 45→15 | 250 | 25% | 11% | 63% | ~4,550 |
| dialog-drawer | 350 | 100 | 30→10 | 220 | 29% | 9% | 63% | ~4,200 |
| navigation | 220 | 50 | 20→8 | 150 | 23% | 9% | 68% | ~2,170 |
| feedback-notifications | 240 | 50 | 20→8 | 170 | 21% | 8% | 71% | ~2,170 |
| picnic-validator | 300 | 20 | 10→3 | 270 | 7% | 3% | 90% | ~945 |
| design-tokens ref | ~430 lines | ~20 | ~5 | ~405 | 5% | 1% | 94% | ~750 |
| stitches-patterns ref | ~285 lines | ~70 | ~30→10 | ~185 | 25% | 10% | 65% | ~3,150 |
| Component refs (5 files) | ~1,110 lines | ~110 | ~0 | ~1,000 | 10% | 0% | 90% | ~3,850 |
| **Totals** | **~4,285** | **~745** | **~265→94** | **~3,275** | **22%** | **8%** | **70%** | **~31,935** |

---

## Key Findings

### 1. The Validator Has the Highest Signal-to-Noise Ratio (90% C)

The picnic-validator skill is almost pure Picnic-specific knowledge. Every validation rule is a constraint that exists only in Picnic's source code. This should be the **least modified** of all skills — its content is nearly 100% value.

### 2. Stitches-Patterns Has the Most Removable Content (32% A)

Because Claude already knows Stitches well, the stitches-patterns skill should be the most aggressively trimmed. Remove all generic Stitches explanations and keep ONLY:
- Picnic-specific custom utilities (focusVisible, defaultTransition, etc.)
- Picnic-specific types (PicnicCss)
- Picnic-specific constraints (Stack gap stripped, css spread order)
- Picnic-specific API (responsiveRule, useBreakpoints, usePicnicStyles, theming)

### 3. Dialog-Drawer and Form-Builder Have the Most Removable Lines (~100 each)

These skills teach the most generic knowledge because they wrap well-known libraries (Radix and Formik). The rewrite should assume Claude knows these libraries and teach ONLY:
- The Picnic-specific compound sub-component hierarchy
- Picnic-specific naming deviations (Tooltip: danger not error; Banner: error not critical)
- Picnic-specific hooks (useForm, not useFormik)
- Which sub-components exist and their specific prop APIs

### 4. Foundation Skills Are Lean by Design (10-15% A)

The foundation skill proposals were already fairly well-targeted. Design-tokens especially (only 10% removable) is mostly Picnic-specific token names and values. Minor trimming only.

### 5. Reference Files Are Almost Pure Picnic Data (90-95% C)

Token tables, props tables, and variant matrices are all Picnic-specific lookup data. The only waste is occasional prose explaining generic concepts. These references should stay close to their current design.

---

## Recommendations

### For Skill Writers

1. **Never explain how Stitches works** — assume Claude knows `styled()`, `css` prop, variants, $token syntax, responsive @bp. Instead, teach Picnic-specific deviations and custom utilities.

2. **Never explain how Radix works** — assume Claude knows Dialog, Tooltip, Accordion, Popover, DropdownMenu, Tabs, Checkbox, RadioGroup, Switch APIs including asChild, controlled/uncontrolled, focus trapping, keyboard navigation.

3. **Never explain how Formik works** — assume Claude knows initialValues, onSubmit, validationSchema, values/errors/touched, setFieldValue, enableReinitialize. Instead, teach the Form.* namespace mapping.

4. **Never explain generic CSS/React patterns** — assume Claude knows flexbox, grid, media queries, compound components, Context propagation, Children.map, polymorphic components.

5. **DO teach**: Component names, variant enumerations, prop names/types, sub-component hierarchies, naming deviations from convention, custom utilities, token names/values, composition constraints, deprecated patterns.

### Token-Optimized Skill Template

```markdown
# [Skill Name]

## Picnic-Specific Context (2-3 lines)
[Import path, which Picnic components this covers, what library they wrap IF relevant]

## Component API (bulk of skill)
[Compound hierarchy, props, variants — pure lookup data]

## Constraints & Deviations (critical section)
[Where Picnic differs from what you'd guess based on the underlying library]

## Anti-Patterns (compact table)
[BAD → GOOD, one line each]
```

This template eliminates category A entirely and keeps B to single-line constraints.

### Projected Savings If Applied

| Metric | Before Optimization | After Optimization | Savings |
|--------|--------------------|--------------------|---------|
| Skill lines (all) | ~2,460 | ~1,780 | ~680 (28%) |
| Reference lines (all) | ~1,825 | ~1,600 | ~225 (12%) |
| Total lines | ~4,285 | ~3,380 | ~905 (21%) |
| Est. tokens | ~150,000 | ~118,000 | ~32,000 (21%) |

These savings are **in addition to** the architectural savings from decomposing the monolithic skill, which reduces per-invocation token load by only loading relevant sub-skills.
