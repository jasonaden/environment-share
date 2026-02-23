# Proposal #05: Picnic Validation System

## Overview

This proposal defines a two-layer validation architecture for generated Picnic code:

1. **`picnic-validator` skill** — Centralized post-generation validator that catches all constraint violations
2. **Per-skill checklists** — Embedded preventive "common mistakes" sections in each problem-oriented skill

The validator acts as a safety net; the per-skill checklists act as guardrails during generation. Together they ensure generated code is correct-by-construction and verified-after-generation.

---

## Part 1: Complete Validation Rule Catalog

Every rule extracted from the component catalog, SKILL.md, and design token references. Each rule has an ID for cross-referencing.

### Category 1: Variant Restrictions

Rules for invalid variant values that don't exist on a component.

| ID | Component | Rule | Invalid Values | Valid Values |
|----|-----------|------|----------------|--------------|
| V01 | Badge | No `secondary` variant | `secondary`, `success`, `info`, `warning`, `default` | `active`, `standard`, `primary`, `error`, `magic` |
| V02 | Button | No `basic` variant (deprecated) | `basic` | `primary`, `secondary`, `subdued`, `inverted` |
| V03 | Button | No `legacy-inverted` in new code | `legacy-inverted` | `primary`, `secondary`, `subdued`, `inverted` |
| V04 | Accordion | `variant` is required — omitting it is invalid | _(missing)_ | `error`, `info`, `neutral`, `warning`, `decorative3` |
| V05 | Tooltip.Content | Uses `danger`, not `error` | `error` | `normal`, `danger` |
| V06 | ProgressBar | Only three variants | `info`, `primary`, `default` | `success`, `warning`, `error` |
| V07 | Tag | Only two variants | `primary`, `secondary`, `active` | `default`, `error` |
| V08 | ContainedLabel | Uses `critical`/`informational`, not `error`/`info` | `error`, `info`, `primary`, `secondary` | `neutral`, `success`, `informational`, `warning`, `critical`, `decorative1`-`4`, `overMedia`, `magic` |
| V09 | Popover | Only two variants | `info`, `primary` | `default`, `guidance` |
| V10 | Heading | `variant` controls size, not `size` prop | using `size` prop | `page`, `xl`, `lg`, `md`, `sm`, `subheading` |
| V11 | Text | Four size variants | `small`, `large`, `xl` | `lede`, `body`, `caption`, `micro` |
| V12 | Link | Only two variants | `primary`, `subdued` | `default`, `inverted` |
| V13 | Separator | Size uses `small`/`large` | `medium`, `normal` | `small`, `large` |
| V14 | Banner | Six specific variants | `default`, `primary`, `critical` | `error`, `info`, `warning`, `success`, `neutral`, `guidance` |
| V15 | LoadingPlaceholder | Only two variants | `loading`, `animated` | `shimmer`, `static` |
| V16 | Icon color | Uses `critical` (not just `error`) | _(check context)_ | `default`, `subdued`, `success`, `warning`, `critical`, `error`, `info`, `guidance`, `disabled`, `inverted`, `decorative1`-`4`, `inherit` |
| V17 | IconCircle color | Specific color set | `info`, `primary` | `default`, `inverted`, `brand`, `success`, `warning`, `critical`, `decorative1`-`4`, `disabled`, `magic` |
| V18 | ThirdPartyIconCircle | Only two colors | All others | `default`, `inverted` |
| V19 | Heading/Text color | Uses semantic names | `primary`, `error`, `danger` | `default`, `subdued`, `inverted`, `success`, `warning`, `critical`, `info`, `guidance`, `neutral` (+ `decorative1-4` for Text) |
| V20 | PageHeader | Three layout variants | `horizontal`, `vertical` | `responsive`, `inline`, `stacked` |

### Category 2: Required Props

Props that must be present or the component will error/misbehave.

| ID | Component | Required Prop(s) | What Happens If Missing |
|----|-----------|-----------------|------------------------|
| R01 | Tag | `onDelete` | Component expects delete handler; renders X button that does nothing |
| R02 | ProgressBar | `total`, `value` | Bar cannot render fill percentage |
| R03 | Accordion | `variant` | TypeScript error; no styling applied |
| R04 | Icon (mode=presentational) | `description` | TypeScript error; no accessible label |
| R05 | IconButton | `iconName`, `description` | TypeScript error; no icon or aria-label |
| R06 | Emoji | `label` | No accessible label; fails a11y |
| R07 | ContinuousScroll | `onLoadMore`, `isLoading`, `hasMore` | Scroll sentinel broken; infinite loops |
| R08 | Paginator | `totalItems`, `maxItemsPerPage`, `offset`, `onOffsetChange` | Navigation broken |
| R09 | ImagePreview | `src`, `altText` | No image; fails a11y |
| R10 | Form | `initialValues`, `onSubmit` | Formik crashes without initial state |
| R11 | Select.Item | `value` | Selection broken |
| R12 | Select.Group | `label` | Group heading missing |
| R13 | RadioGroup.Item | `value` | Selection broken |
| R14 | ButtonGroup.Item | `name` | Active state tracking broken |
| R15 | ButtonGroup.IconItem | `name`, `description` | Active state broken; no a11y label |
| R16 | TabGroup.Tab | `value` | Tab activation broken |
| R17 | TabGroup.Panel | `value` | Panel display broken |
| R18 | IconCircle | `iconName` | No icon rendered |
| R19 | Table | `columns` or `columnSizes` | Grid layout broken — no column definitions |
| R20 | Accordion.Item | `value` | Open/close tracking broken |

### Category 3: Deprecated Patterns

Patterns that still work but should not appear in new code.

| ID | Pattern | Replacement | Severity |
|----|---------|-------------|----------|
| D01 | `<Button variant="basic">` | `<Button variant="secondary">` | error |
| D02 | `<Button variant="legacy-inverted">` | `<Button variant="inverted">` | warning |
| D03 | Standalone `<TextInput>` inside `<Form>` | `<Form.TextInput>` | warning |
| D04 | Standalone `<Select>` inside `<Form>` | `<Form.Select>` | warning |
| D05 | Standalone `<Checkbox>` inside `<Form>` | `<Form.Checkbox>` | warning |
| D06 | Standalone `<RadioGroup>` inside `<Form>` | `<Form.RadioGroup>` | warning |
| D07 | Standalone `<Switch>` inside `<Form>` | `<Form.Switch>` | warning |
| D08 | Standalone `<TextArea>` inside `<Form>` | `<Form.TextArea>` | warning |
| D09 | Standalone `<DatePicker>` inside `<Form>` | `<Form.DatePicker>` | warning |
| D10 | Standalone `<MultiSelect>` inside `<Form>` | `<Form.MultiSelect>` | warning |

### Category 4: Type Discriminations

Props whose value requires or forbids other props.

| ID | Component | Condition | Required Prop | Forbidden Prop |
|----|-----------|-----------|---------------|----------------|
| T01 | Icon | `mode="presentational"` | `description` (string) | — |
| T02 | Icon | `mode="decorative"` | — | `description` (unnecessary) |
| T03 | Accordion | `type="single"` | value is `string` | value as `string[]` |
| T04 | Accordion | `type="multiple"` | value is `string[]` | value as `string` |
| T05 | Checkbox | `checked="indeterminate"` | — | `onChange` receives boolean |
| T06 | Table.RowSelectorCell | always | `checked`, `onChange`, `value` | — |
| T07 | Table.SortableHeaderCell | always | `onChange` | — |
| T08 | Dialog | controlled mode | `open` + `onOpenChange` together | — |
| T09 | Button | `loading={true}` | — | `onClick` (pointer events disabled) |
| T10 | Popover | `variant="guidance"` | — | Content inherits purple/inverted styling |

### Category 5: Styling Rules

Patterns that violate the Picnic styling contract.

| ID | Rule | Bad Pattern | Correct Pattern | Severity |
|----|------|-------------|-----------------|----------|
| S01 | No raw CSS color values | `color: '#333'` | `color: '$textDefault'` | error |
| S02 | No className prop | `className="my-class"` | `css={{ ... }}` | error |
| S03 | No Tailwind classes | `className="flex gap-4"` | `css={{ display: 'flex', gap: '$space4' }}` | error |
| S04 | No CSS modules import | `import styles from './x.module.css'` | Use `styled()` or `css` prop | error |
| S05 | No raw pixel spacing | `padding: '16px'` | `p: '$space4'` | error |
| S06 | No raw font sizes | `fontSize: '14px'` | `fontSize: '$fontSize2'` | error |
| S07 | No invalid font weights | `fontWeight: 600` or `$semibold` | `fontWeight: '$regular'` or `'$bold'` | error |
| S08 | No raw border-radius | `borderRadius: '8px'` | `borderRadius: '$radius2'` | error |
| S09 | No raw shadows | `boxShadow: '0 2px 4px rgba(0,0,0,.1)'` | `boxShadow: '$shadow1'` | error |
| S10 | No raw z-index | `zIndex: 100` | `zIndex: '$layer1'` | error |
| S11 | Cross-scale needs explicit path | `boxShadow: '0 0 0 2px $bgDefault'` | `boxShadow: '0 0 0 2px $colors$bgDefault'` | error |
| S12 | No raw perceptual palette tokens | `backgroundColor: '$grayscale200'` | `backgroundColor: '$bgAccent'` | warning |
| S13 | Use spacing utilities | `padding: '$space4'` (longhand) | `p: '$space4'` (utility) | info |
| S14 | No `style` prop | `style={{ color: 'red' }}` | `css={{ color: '$textCritical' }}` | error |
| S15 | Only two font weights exist | `fontWeight: '$medium'`, `'$light'`, `'$thin'` | `fontWeight: '$regular'` or `'$bold'` | error |

### Category 6: Composition Rules

Components that must be nested within specific parents.

| ID | Child Component | Required Parent | Notes |
|----|----------------|-----------------|-------|
| C01 | `Form.TextInput`, `Form.Select`, etc. | `<Form>` | Form.* sub-components need Formik context |
| C02 | `Table.HeaderCell`, `Table.BodyCell`, etc. | `<Table>` | Grid layout requires Table container |
| C03 | `Table.HeaderRow` | `<Table.Header>` | Semantic row grouping |
| C04 | `Table.BodyRow` / `Table.BodyFocusableRow` | `<Table.Body>` | Semantic row grouping |
| C05 | `Dialog.Content` | `<Dialog>` | Radix portal/overlay context |
| C06 | `Drawer.Content` | `<Drawer>` | Animation + overlay context |
| C07 | `StandardDialog.*` sub-components | `<StandardDialog>` | Slot-based layout parsing |
| C08 | `StandardDrawer.*` sub-components | `<StandardDrawer>` | Slot-based layout parsing |
| C09 | `Accordion.Item` | `<Accordion>` | Variant + open state context |
| C10 | `TabGroup.Tab` | `<TabGroup.List>` | Tab list semantics |
| C11 | `TabGroup.Panel` | `<TabGroup>` | Panel value matching |
| C12 | `Popover.Content` | `<Popover>` | Positioning + open state |
| C13 | `DropdownMenu.*` | `<DropdownMenu>` | Menu context |
| C14 | `Tooltip.Content` | `<Tooltip>` | Hover/focus context |
| C15 | `Tooltip` (any) | `<Tooltip.Provider>` at app root | Delay coordination |
| C16 | `Select.Item` | `<Select>` | Downshift context |
| C17 | `MultiSelect.Item` | `<MultiSelect>` | Selection context |
| C18 | `Breadcrumbs.Item` | `<Breadcrumbs>` | Last-item auto-styling |
| C19 | `Banner.*` sub-components | `<Banner>` | Slot-based parsing |
| C20 | `ContainedLabel.Icon` | `<ContainedLabel>` | Auto-coloring context |
| C21 | `StepTracker.Step` | `<StepTracker>` | Active step context |
| C22 | `List.Item` | `<List>` | List semantics |
| C23 | `Grid.Cell` | `<Grid>` | Grid layout |
| C24 | `FormField.*` sub-components | `<FormField>` | Slot-based parsing |
| C25 | `RadioGroup.Item` | `<RadioGroup>` | Selection context |

### Category 7: Accessibility Rules

Missing accessibility patterns.

| ID | Component | Rule | Fix |
|----|-----------|------|-----|
| A01 | Icon (presentational) | Must have `description` | Add `description="meaningful text"` |
| A02 | IconButton | Must have `description` | Add `description="action description"` |
| A03 | Emoji | Must have `label` | Add `label="emoji meaning"` |
| A04 | Checkbox.CheckboxItem | Should have `aria-label` when standalone | Add `aria-label="selection purpose"` |
| A05 | Table.RowSelectorCell | Should have `aria-label` | Add `aria-label="Select {item}"` |
| A06 | Table.HeaderSelectorCell | Should have `aria-label` | Add `aria-label="Select all rows"` |
| A07 | Separator | Set `decorative={false}` if meaningful | Add `decorative={false}` for semantic dividers |
| A08 | ResponsiveImage | Must have `alt` | Add `alt="description"` |
| A09 | Logomark/Wordmark | Should have `title` | Add `title="Attentive"` for screen readers |
| A10 | Icon (decorative) used as only child | Screen reader sees nothing | Add VisuallyHidden text or switch to presentational |
| A11 | Dialog/Drawer | Content should have heading | Include Dialog.Header with Heading for ARIA labeling |
| A12 | Banner | Check role attribute | `role="status"` (default) or `role="alert"` for errors |

### Category 8: Token Rules

Raw values used where tokens should be.

| ID | Category | Pattern to Flag | Correct Token | Notes |
|----|----------|----------------|---------------|-------|
| K01 | Colors | Any `#` hex value in css prop | Use `$bg*`, `$text*`, `$icon*`, `$border*` | Breaks theming |
| K02 | Colors | `rgb()`, `rgba()`, `hsl()` | Use functional color tokens | Breaks theming |
| K03 | Colors | Perceptual tokens (`$grayscale*`, `$yellow*`, `$green*`, `$red*`, brand colors) | Use functional tokens | Not theme-safe |
| K04 | Spacing | Raw pixel values for padding/margin | Use `$space0`-`$space16` | Breaks grid |
| K05 | Font size | Raw rem/px font sizes | Use `$fontSize1`-`$fontSize7` | Inconsistent |
| K06 | Font weight | Any weight other than 400/500 | `$regular` (400) or `$bold` (500) | Only two exist |
| K07 | Shadows | Raw box-shadow strings | Use `$shadow1`-`$shadow4`, `$focus`, `$drastic` | Breaks theming |
| K08 | Radii | Raw px border-radius | Use `$radius1`-`$radius3`, `$radiusMax` | Inconsistent |
| K09 | Z-index | Raw numeric z-index | Use `$layer0`-`$layerMax` | Layer collision |
| K10 | Fonts | Raw font-family strings | Use `$display` or `$body` | Wrong font |
| K11 | Line height | Raw numeric/px line-height | Use `$lineHeight1`-`$lineHeight7` | Inconsistent |
| K12 | Border width | Raw px border-width | Use `$borderWidths$borderWidth*` | Inconsistent |
| K13 | Breakpoints | Raw `@media` queries | Use `@bp1`-`@bp4` | Non-standard |

---

## Part 2: Centralized `picnic-validator` Skill Design

### Skill Metadata

```yaml
name: picnic-validator
description: >
  Post-generation validator for Picnic component code. Scans generated TSX
  for constraint violations including invalid variants, missing required props,
  deprecated patterns, styling anti-patterns, composition errors, accessibility
  gaps, and token misuse. Run after any Picnic skill generates code.
```

### Rule Format

Each rule is structured as a scannable entry with five fields:

```
[SEVERITY] RULE-ID: One-line description
  Pattern: What to look for in generated code
  Fix: Exact replacement or action
  Example Bad:  <Code that violates>
  Example Good: <Code that fixes>
```

Severities:
- **ERROR** — Must fix. Code will break or produce incorrect behavior.
- **WARNING** — Should fix. Code works but uses deprecated or non-idiomatic patterns.
- **INFO** — Consider fixing. Opportunity for better consistency.

### Invocation Model

The validator runs in three modes:

1. **Automatic post-check** — After any Picnic skill (data-table, form-builder, dialog-drawer, navigation, feedback-notifications) generates code, the skill's final instruction says: _"Before presenting code to the user, run through the picnic-validator checklist."_

2. **Manual invocation** — User or agent invokes the validator directly: _"Validate this Picnic component code."_

3. **Embedded in problem-oriented skills** — Each skill has a "Common Mistakes" checklist derived from this validator (see Part 3). The skill checks inline during generation.

### Output Format

**Pass:**
```
PICNIC VALIDATION: PASS (0 errors, 0 warnings)
All 8 categories checked. No violations found.
```

**Fail:**
```
PICNIC VALIDATION: FAIL (2 errors, 1 warning)

ERROR V01: Badge variant="secondary" is not valid
  Line: <Badge variant="secondary">New</Badge>
  Fix:  <Badge variant="standard">New</Badge>
  Valid variants: active, standard, primary, error, magic

ERROR S01: Raw hex color in css prop
  Line: css={{ color: '#666' }}
  Fix:  css={{ color: '$textSubdued' }}

WARNING D01: Button variant="basic" is deprecated
  Line: <Button variant="basic">Cancel</Button>
  Fix:  <Button variant="secondary">Cancel</Button>
```

### Skill Structure and Size Budget

Target: ~300 lines (fits well within skill context window).

```
picnic-validator/
  SKILL.md          (~300 lines)
    ├── Invocation instructions (10 lines)
    ├── Scan procedure (20 lines)
    ├── Category 1: Variant restrictions (40 lines, 20 rules)
    ├── Category 2: Required props (30 lines, 20 rules)
    ├── Category 3: Deprecated patterns (15 lines, 10 rules)
    ├── Category 4: Type discriminations (15 lines, 10 rules)
    ├── Category 5: Styling rules (25 lines, 15 rules)
    ├── Category 6: Composition rules (35 lines, 25 rules)
    ├── Category 7: Accessibility rules (20 lines, 12 rules)
    ├── Category 8: Token rules (20 lines, 13 rules)
    └── Output format template (10 lines)
```

### Scan Procedure (embedded in skill)

When validating generated code:

1. **Extract all JSX elements** — Identify every Picnic component usage (imports from `@attentive/picnic`)
2. **Check variant values** — For each component with a `variant` prop, verify the value is in the allowed set (Category 1)
3. **Check required props** — For each component, verify all required props are present (Category 2)
4. **Check deprecated patterns** — Scan for `basic`, `legacy-inverted`, standalone inputs in Form (Category 3)
5. **Check type discriminations** — Verify conditional prop requirements (Icon mode → description) (Category 4)
6. **Check styling patterns** — Scan `css` props and `styled()` calls for raw values, className, Tailwind (Category 5)
7. **Check composition** — Verify compound sub-components are inside their required parents (Category 6)
8. **Check accessibility** — Verify description/label/alt/aria-label on required components (Category 7)
9. **Check tokens** — Scan for raw hex colors, px values, invalid font weights in css props (Category 8)
10. **Report** — Output pass/fail with violation details

---

## Part 3: Per-Skill Validation Checklists

Each problem-oriented skill embeds a "Common Mistakes" section. These are the top violations most likely to occur when using that skill's components.

### data-table skill

Components: Table, Paginator, Badge, ContainedLabel, ContinuousScroll, IconButton

```markdown
## Common Mistakes Checklist

Before presenting table code, verify:

- [ ] Table has `columns` (number) or `columnSizes` (string[]) — grid layout breaks without it
- [ ] Badge uses valid variants only: active, standard, primary, error, magic
      (NOT `secondary`, `success`, `info`, `warning`)
- [ ] ContainedLabel uses `critical`/`informational` (NOT `error`/`info`)
- [ ] Every IconButton has `description` prop for accessibility
- [ ] Paginator has all four required props: totalItems, maxItemsPerPage, offset, onOffsetChange

Example mistake → fix:
  BAD:  <Badge variant="success">Active</Badge>
  GOOD: <ContainedLabel variant="success">Active</ContainedLabel>
  WHY:  Badge doesn't have a "success" variant. For status labels, use ContainedLabel.
```

### form-builder skill

Components: Form, FormField, TextInput, TextArea, Select, MultiSelect, Checkbox, RadioGroup, Switch, DatePicker, SearchBar, TagSelector

```markdown
## Common Mistakes Checklist

Before presenting form code, verify:

- [ ] All inputs inside <Form> use Form.* namespace (Form.TextInput, NOT standalone TextInput)
- [ ] Form has both `initialValues` and `onSubmit` props
- [ ] Every Form.FormField with a required field has `<Form.Label requirement="required">`
- [ ] Every input has a matching `<Form.ErrorText name="fieldName" />` for validation display
- [ ] Only two font weights exist: $regular and $bold — never use $semibold, $medium, $light

Example mistake → fix:
  BAD:  <Form><TextInput name="email" /></Form>
  GOOD: <Form><Form.TextInput name="email" /></Form>
  WHY:  Standalone TextInput doesn't connect to Formik state. Form.TextInput auto-binds.
```

### dialog-drawer skill

Components: Dialog, StandardDialog, Drawer, StandardDrawer, Popover, DropdownMenu

```markdown
## Common Mistakes Checklist

Before presenting dialog/drawer code, verify:

- [ ] Prefer StandardDialog/StandardDrawer over raw Dialog/Drawer for structured content
- [ ] StandardDialog/StandardDrawer sub-components are inside their parent (.Header, .Body, .Footer)
- [ ] Dialog.Trigger and Drawer.Trigger wrap a single ReactElement child (Radix asChild pattern)
- [ ] Every Dialog/Drawer Content has a Heading for ARIA labeling
- [ ] Popover variant is `default` or `guidance` only (NOT `info`, `primary`, etc.)

Example mistake → fix:
  BAD:  <Dialog.Trigger><Button>Open</Button><Text>extra</Text></Dialog.Trigger>
  GOOD: <Dialog.Trigger><Button>Open</Button></Dialog.Trigger>
  WHY:  Trigger uses Radix asChild — it must wrap exactly one React element.
```

### navigation skill

Components: Breadcrumbs, TabGroup, Paginator, ButtonGroup, Link

```markdown
## Common Mistakes Checklist

Before presenting navigation code, verify:

- [ ] TabGroup.Tab and TabGroup.Panel `value` props match for each tab
- [ ] TabGroup.Tab is inside TabGroup.List, not directly in TabGroup
- [ ] Breadcrumbs.Item last child needs no href (auto-styled as current page)
- [ ] Link variant is `default` or `inverted` only (NOT `primary`, `subdued`)
- [ ] Paginator has all four required props: totalItems, maxItemsPerPage, offset, onOffsetChange

Example mistake → fix:
  BAD:  <TabGroup><TabGroup.Tab value="a">Tab A</TabGroup.Tab></TabGroup>
  GOOD: <TabGroup><TabGroup.List><TabGroup.Tab value="a">Tab A</TabGroup.Tab></TabGroup.List></TabGroup>
  WHY:  TabGroup.Tab must be inside TabGroup.List for proper tab list semantics.
```

### feedback-notifications skill

Components: Banner, Accordion, Tooltip, IconPopover, LoadingIndicator, LoadingPlaceholder

```markdown
## Common Mistakes Checklist

Before presenting feedback code, verify:

- [ ] Accordion has `variant` prop — it is REQUIRED (not optional)
- [ ] Accordion variant is one of: error, info, neutral, warning, decorative3
- [ ] Banner variant uses `error` (not `critical`), `neutral` (not `default`)
- [ ] Tooltip.Content variant is `normal` or `danger` (NOT `error`)
- [ ] Tooltip.Provider wraps the app root (or is noted as a prerequisite)

Example mistake → fix:
  BAD:  <Accordion type="single"><Accordion.Item value="1">...</Accordion.Item></Accordion>
  GOOD: <Accordion type="single" variant="neutral"><Accordion.Item value="1">...</Accordion.Item></Accordion>
  WHY:  Accordion variant is required — omitting it causes TypeScript errors and no styling.
```

---

## Part 4: Validation Workflow

### End-to-End Flow

```
┌────────────────────────────────────────────────────────────────────┐
│ 1. DEVELOPER REQUEST                                               │
│    "Build a data table with status badges and pagination"          │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│ 2. SKILL SELECTION                                                 │
│    Agent selects: data-table skill                                 │
│    Loads: component references, styling patterns, composition rules│
└──────────────────────────┬─────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│ 3. CODE GENERATION (with inline prevention)                        │
│                                                                    │
│    The data-table skill's "Common Mistakes" checklist is active:   │
│    ✓ Table has columns prop                                        │
│    ✓ Badge uses valid variant (standard, not secondary)            │
│    ✓ ContainedLabel for status (not Badge with success)            │
│    ✓ IconButton has description                                    │
│    ✓ Paginator has all 4 required props                            │
│                                                                    │
│    These checks prevent the most common errors AT GENERATION TIME. │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│ 4. POST-GENERATION VALIDATION (centralized picnic-validator)       │
│                                                                    │
│    Full 8-category scan:                                           │
│    ✓ Variant restrictions (20 rules)                               │
│    ✓ Required props (20 rules)                                     │
│    ✓ Deprecated patterns (10 rules)                                │
│    ✓ Type discriminations (10 rules)                               │
│    ✓ Styling rules (15 rules)                                      │
│    ✓ Composition rules (25 rules)                                  │
│    ✓ Accessibility rules (12 rules)                                │
│    ✓ Token rules (13 rules)                                        │
│                                                                    │
│    Total: 125 rules checked                                        │
└──────────────────────────┬─────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│ 5. RESULT                                                          │
│                                                                    │
│    IF PASS → Present code to developer                             │
│    IF FAIL → Fix violations, re-validate, then present             │
│                                                                    │
│    The agent auto-fixes any violations before showing the user.    │
│    The validation report is included as a comment if requested.    │
└────────────────────────────────────────────────────────────────────┘
```

### Integration Points

1. **Problem-oriented skill files** include a `## Common Mistakes Checklist` section with 3-5 rules specific to their component domain. This is the first line of defense.

2. **The picnic-validator skill** is referenced in each problem-oriented skill's closing section:
   ```
   After generating code, validate against the picnic-validator skill
   for comprehensive constraint checking across all 8 categories.
   ```

3. **Auto-fix behavior** — When the validator catches a violation, the agent should fix it automatically before presenting code. The violation + fix is optionally logged for the developer to see.

4. **Validation is non-blocking for the user** — The developer never sees raw validation failures. They receive clean, validated code. The validation happens transparently within the agent's generation loop.

### Why Two Layers

| Layer | Purpose | Scope | When |
|-------|---------|-------|------|
| Per-skill checklist | Prevention | Top 3-5 mistakes for that domain | During generation |
| Centralized validator | Comprehensive catch-all | All 125 rules across all components | After generation |

The per-skill checklists are fast, domain-specific guardrails. The centralized validator is the exhaustive safety net. Together they provide defense-in-depth: most errors are prevented inline, and any that slip through are caught by the full validator.

---

## Appendix: Rule Count Summary

| Category | Rules | Severity Breakdown |
|----------|-------|-------------------|
| Variant Restrictions | 20 | 20 error |
| Required Props | 20 | 20 error |
| Deprecated Patterns | 10 | 2 error, 8 warning |
| Type Discriminations | 10 | 10 error |
| Styling Rules | 15 | 13 error, 1 warning, 1 info |
| Composition Rules | 25 | 25 error |
| Accessibility Rules | 12 | 6 error, 6 warning |
| Token Rules | 13 | 12 error, 1 warning |
| **Total** | **125** | **108 error, 16 warning, 1 info** |
