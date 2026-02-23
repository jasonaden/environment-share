# Section 6: Validation System

## 6.1 Architecture Overview

Two-layer defense-in-depth validation for generated Picnic code:

| Layer | Type | Scope | When | Rules |
|-------|------|-------|------|-------|
| Per-skill checklists | Preventive | Top 3-5 mistakes per domain | During generation | ~25 total across 8 skills |
| Centralized validator | Detective | All constraints across all components | After generation | 125 rules, 8 categories |

**Per-skill checklists** are embedded in each skill's `## Common Mistakes Checklist` section. They catch the highest-frequency errors for that skill's component domain inline during code generation.

**Centralized validator** (`picnic-validator`) runs as a final pass after any Picnic skill generates code. It scans for all 125 constraint violations across 8 categories. The skill's closing instruction directs: _"Before presenting code to the user, run through the picnic-validator checklist."_

Validation is transparent to the user — the agent auto-fixes violations before presenting code. The user receives clean, validated output.

---

## 6.2 Centralized Validator SKILL.md Specification

Target: **~270 lines / ~5.9KB**. This skill has the highest keep rate (90%) because every rule encodes Picnic-specific constraints that exist nowhere in Claude's training data.

```markdown
---
name: picnic-validator
description: >
  Post-generation validator for Picnic component code. Run after any Picnic
  skill generates TSX. Scans for invalid variants, missing required props,
  deprecated patterns, styling violations, composition errors, accessibility
  gaps, and token misuse. Invoke: "Validate this Picnic component code."
---

# Picnic Validator

Scan generated code against all rules below. Report: `PASS (0 errors, 0 warnings)` or list each violation with rule ID, bad line, and fix.

Severities: **ERROR** = must fix (breaks or incorrect). **WARNING** = should fix (deprecated/non-idiomatic). **INFO** = consider (consistency opportunity).

---

## Category 1: Variant Restrictions (20 rules)

Invalid variant values that don't exist on a component.

V01: Badge variant="secondary" → variant="standard"
     Valid: active | standard | primary | error | magic

V02: Button variant="basic" → variant="secondary"
     (deprecated alias)

V03: Button variant="legacy-inverted" → variant="inverted"

V04: Accordion missing variant prop → add variant="neutral" (REQUIRED)
     Valid: error | info | neutral | warning | decorative3

V05: Tooltip.Content variant="error" → variant="danger"
     Valid: normal | danger

V06: ProgressBar invalid variant → Valid: success | warning | error

V07: Tag invalid variant → Valid: default | error

V08: ContainedLabel variant="error"/"info" → variant="critical"/"informational"
     Valid: neutral | success | informational | warning | critical | decorative1-4 | overMedia | magic

V09: Popover invalid variant → Valid: default | guidance

V10: Heading size="lg" → variant="lg" (variant controls size, not size prop)
     Valid: page | xl | lg | md | sm | subheading

V11: Text variant="small" → Valid: lede | body | caption | micro

V12: Link variant="primary" → Valid: default | inverted

V13: Separator size="medium" → Valid: small | large

V14: Banner variant="critical"/"default" → variant="error"/"neutral"
     Valid: error | info | warning | success | neutral | guidance

V15: LoadingPlaceholder invalid variant → Valid: shimmer | static

V16: Icon color — Valid: default | subdued | success | warning | critical | error | info | guidance | disabled | inverted | decorative1-4 | inherit

V17: IconCircle color — Valid: default | inverted | brand | success | warning | critical | decorative1-4 | disabled | magic

V18: ThirdPartyIconCircle color — Valid: default | inverted ONLY

V19: Heading/Text color="primary"/"error" → use semantic names
     Valid: default | subdued | inverted | success | warning | critical | info | guidance | neutral (+ decorative1-4 for Text)

V20: PageHeader variant="horizontal" → Valid: responsive | inline | stacked

---

## Category 2: Required Props (20 rules)

Missing props that cause errors or broken behavior.

R01: Tag missing onDelete → delete button renders but does nothing
R02: ProgressBar missing total + value → no fill percentage
R03: Accordion missing variant → TypeScript error, no styling
R04: Icon mode="presentational" missing description → TS error
R05: IconButton missing iconName or description → TS error
R06: Emoji missing label → no accessible label
R07: ContinuousScroll missing onLoadMore + isLoading + hasMore → infinite loops
R08: Paginator missing totalItems + maxItemsPerPage + offset + onOffsetChange → broken nav
R09: ImagePreview missing src + altText → no image, a11y fail
R10: Form missing initialValues + onSubmit → Formik crash
R11: Select.Item missing value → selection broken
R12: Select.Group missing label → group heading missing
R13: RadioGroup.Item missing value → selection broken
R14: ButtonGroup.Item missing name → active state broken
R15: ButtonGroup.IconItem missing name + description → active state broken, no a11y
R16: TabGroup.Tab missing value → tab activation broken
R17: TabGroup.Panel missing value → panel display broken
R18: IconCircle missing iconName → no icon rendered
R19: Table missing columns or columnSizes → grid layout broken
R20: Accordion.Item missing value → open/close tracking broken

---

## Category 3: Deprecated Patterns (10 rules)

Patterns that work but must not appear in new code.

D01: ERROR   <Button variant="basic"> → <Button variant="secondary">
D02: WARNING <Button variant="legacy-inverted"> → <Button variant="inverted">
D03: WARNING <TextInput> inside <Form> → <Form.TextInput>
D04: WARNING <Select> inside <Form> → <Form.Select>
D05: WARNING <Checkbox> inside <Form> → <Form.Checkbox>
D06: WARNING <RadioGroup> inside <Form> → <Form.RadioGroup>
D07: WARNING <Switch> inside <Form> → <Form.Switch>
D08: WARNING <TextArea> inside <Form> → <Form.TextArea>
D09: WARNING <DatePicker> inside <Form> → <Form.DatePicker>
D10: WARNING <MultiSelect> inside <Form> → <Form.MultiSelect>

---

## Category 4: Type Discriminations (10 rules)

Conditional prop requirements based on other prop values.

T01: Icon mode="presentational" → REQUIRES description (string)
T02: Icon mode="decorative" → description is unnecessary
T03: Accordion type="single" → value must be string (not string[])
T04: Accordion type="multiple" → value must be string[] (not string)
T05: Checkbox checked="indeterminate" → onChange still receives boolean
T06: Table.RowSelectorCell → REQUIRES checked + onChange + value
T07: Table.SortableHeaderCell → REQUIRES onChange
T08: Dialog controlled → REQUIRES open + onOpenChange together
T09: Button loading={true} → pointer events disabled (onClick won't fire)
T10: Popover variant="guidance" → Content inherits purple/inverted styling

---

## Category 5: Styling Rules (15 rules)

Violations of the Picnic styling contract.

S01: ERROR   color: '#333' → color: '$textDefault'                    (no raw hex)
S02: ERROR   className="my-class" → css={{ ... }}                     (no className)
S03: ERROR   className="flex gap-4" → css={{ display: 'flex', gap: '$space4' }}  (no Tailwind)
S04: ERROR   import styles from './x.module.css' → styled() or css prop  (no CSS modules)
S05: ERROR   padding: '16px' → p: '$space4'                           (no raw px spacing)
S06: ERROR   fontSize: '14px' → fontSize: '$fontSize2'                (no raw font sizes)
S07: ERROR   fontWeight: 600 → fontWeight: '$regular' or '$bold'      (only two weights exist)
S08: ERROR   borderRadius: '8px' → borderRadius: '$radius2'           (no raw radii)
S09: ERROR   boxShadow: '0 2px 4px ...' → boxShadow: '$shadow1'      (no raw shadows)
S10: ERROR   zIndex: 100 → zIndex: '$layer1'                          (no raw z-index)
S11: ERROR   '$bgDefault' in boxShadow → '$colors$bgDefault'          (cross-scale needs path)
S12: WARNING backgroundColor: '$grayscale200' → '$bgAccent'           (no raw palette tokens)
S13: INFO    padding: '$space4' → p: '$space4'                        (prefer shorthand utils)
S14: ERROR   style={{ color: 'red' }} → css={{ color: '$textCritical' }}  (no style prop)
S15: ERROR   fontWeight: '$medium' → '$regular' or '$bold'            (only $regular/$bold exist)

---

## Category 6: Composition Rules (25 rules)

Sub-components that must be nested inside their required parent.

C01: Form.TextInput / Form.Select / etc. → inside <Form>
C02: Table.HeaderCell / Table.BodyCell / etc. → inside <Table>
C03: Table.HeaderRow → inside <Table.Header>
C04: Table.BodyRow / Table.BodyFocusableRow → inside <Table.Body>
C05: Dialog.Content → inside <Dialog>
C06: Drawer.Content → inside <Drawer>
C07: StandardDialog.* subs → inside <StandardDialog>
C08: StandardDrawer.* subs → inside <StandardDrawer>
C09: Accordion.Item → inside <Accordion>
C10: TabGroup.Tab → inside <TabGroup.List> (NOT directly in TabGroup)
C11: TabGroup.Panel → inside <TabGroup>
C12: Popover.Content → inside <Popover>
C13: DropdownMenu.* → inside <DropdownMenu>
C14: Tooltip.Content → inside <Tooltip>
C15: Tooltip (any) → <Tooltip.Provider> must wrap app root
C16: Select.Item → inside <Select>
C17: MultiSelect.Item → inside <MultiSelect>
C18: Breadcrumbs.Item → inside <Breadcrumbs>
C19: Banner.* subs → inside <Banner>
C20: ContainedLabel.Icon → inside <ContainedLabel>
C21: StepTracker.Step → inside <StepTracker>
C22: List.Item → inside <List>
C23: Grid.Cell → inside <Grid>
C24: FormField.* subs → inside <FormField>
C25: RadioGroup.Item → inside <RadioGroup>

---

## Category 7: Accessibility Rules (12 rules)

Missing accessibility requirements specific to Picnic components.

A01: ERROR   Icon mode="presentational" missing description
A02: ERROR   IconButton missing description
A03: ERROR   Emoji missing label
A04: WARNING Checkbox.CheckboxItem standalone missing aria-label
A05: WARNING Table.RowSelectorCell missing aria-label="Select {item}"
A06: WARNING Table.HeaderSelectorCell missing aria-label="Select all rows"
A07: WARNING Separator decorative={true} when semantically meaningful → set decorative={false}
A08: ERROR   ResponsiveImage missing alt
A09: WARNING Logomark/Wordmark missing title for screen readers
A10: ERROR   Decorative Icon as only child → add VisuallyHidden text or switch to presentational
A11: WARNING Dialog/Drawer Content missing Heading for ARIA labeling
A12: WARNING Banner role — use role="alert" for errors, role="status" (default) otherwise

---

## Category 8: Token Rules (13 rules)

Raw values where design tokens must be used.

K01: ERROR   Any #hex in css prop → use $bg*, $text*, $icon*, $border* tokens
K02: ERROR   rgb()/rgba()/hsl() → use functional color tokens
K03: WARNING $grayscale*/$yellow*/$green*/$red* → use functional tokens (not theme-safe)
K04: ERROR   Raw px padding/margin → use $space0-$space16
K05: ERROR   Raw rem/px font-size → use $fontSize1-$fontSize7
K06: ERROR   fontWeight other than 400/500 → $regular (400) or $bold (500)
K07: ERROR   Raw box-shadow → use $shadow1-$shadow4, $focus, $drastic
K08: ERROR   Raw px border-radius → use $radius1-$radius3, $radiusMax
K09: ERROR   Raw numeric z-index → use $layer0-$layerMax
K10: ERROR   Raw font-family → use $display or $body
K11: ERROR   Raw line-height → use $lineHeight1-$lineHeight7
K12: ERROR   Raw px border-width → use $borderWidths$borderWidth*
K13: ERROR   Raw @media queries → use @bp1-@bp4

---

## Rule Summary

| Category | Rules | Severity |
|----------|-------|----------|
| Variant Restrictions | 20 | 20 error |
| Required Props | 20 | 20 error |
| Deprecated Patterns | 10 | 2 error, 8 warning |
| Type Discriminations | 10 | 10 error |
| Styling Rules | 15 | 13 error, 1 warning, 1 info |
| Composition Rules | 25 | 25 error |
| Accessibility Rules | 12 | 6 error, 6 warning |
| Token Rules | 13 | 12 error, 1 warning |
| **Total** | **125** | **108 error, 16 warning, 1 info** |
```

---

## 6.3 Per-Skill Validation Checklists

Each skill embeds a `## Common Mistakes Checklist` section with 3-5 rules specific to its component domain. These are the highest-frequency errors for that skill.

### Foundation Skills

#### design-tokens

```
- [ ] No raw hex/rgb/hsl values — always use $token syntax
- [ ] Functional tokens ($bg*, $text*) over raw palette ($grayscale*, $yellow*)
- [ ] Only two font weights: $regular (400) and $bold (500)
- [ ] Cross-scale reference uses explicit path: $colors$tokenName in boxShadow/border
```

#### stitches-patterns

```
- [ ] No className, style prop, Tailwind, or CSS Modules — Stitches css prop only
- [ ] Spread incoming css LAST so consumer overrides win
- [ ] Stack gap is silently stripped — use spacing prop, not gap in css
- [ ] Shared base styles cast: `as unknown as PicnicCss`
```

#### layout-primitives

```
- [ ] Stack spacing via prop, NOT gap in css (silently stripped)
- [ ] Grid responsive arrays: [base, @bp1, @bp2, @bp3] (4 values max)
- [ ] PageLayout uses compound API (Header.TextContainer, Header.ButtonContainer)
- [ ] Separator decorative={false} for semantically meaningful dividers
```

### Problem Skills

#### data-table

```
- [ ] Table has columns (number) or columnSizes (string[]) — grid breaks without it
- [ ] Badge valid variants: active | standard | primary | error | magic (NOT secondary/success/info)
- [ ] ContainedLabel uses critical/informational (NOT error/info)
- [ ] SortableHeaderCell has onChange + isSortActive + ascending
- [ ] Paginator has all 4 required props: totalItems, maxItemsPerPage, offset, onOffsetChange
```

#### form-builder

```
- [ ] All inputs inside <Form> use Form.* namespace (Form.TextInput, NOT standalone TextInput)
- [ ] Form has both initialValues and onSubmit props
- [ ] Every Form.FormField with required field has <Form.Label requirement="required">
- [ ] Every input has matching <Form.ErrorText name="fieldName" /> for validation display
- [ ] Only two font weights: $regular and $bold (no $semibold, $medium, $light)
```

#### dialog-drawer

```
- [ ] StandardDialog/StandardDrawer subs (.Header, .Body, .Footer) inside their parent
- [ ] Dialog.Trigger / Drawer.Trigger wraps exactly ONE ReactElement child (Radix asChild)
- [ ] Every Dialog/Drawer Content has a Heading for ARIA labeling
- [ ] Popover variant is default or guidance ONLY (NOT info, primary)
```

#### navigation

```
- [ ] TabGroup.Tab inside TabGroup.List (NOT directly in TabGroup)
- [ ] TabGroup.Tab and TabGroup.Panel value props match for each tab
- [ ] Breadcrumbs last Item needs no href (auto-styled as current page)
- [ ] Link variant: default or inverted ONLY (NOT primary, subdued)
- [ ] Paginator has all 4 required props: totalItems, maxItemsPerPage, offset, onOffsetChange
```

#### feedback-notifications

```
- [ ] Accordion has variant prop — it is REQUIRED (TypeScript error without it)
- [ ] Accordion variant: error | info | neutral | warning | decorative3
- [ ] Banner variant uses error (NOT critical), neutral (NOT default)
- [ ] Tooltip.Content variant: normal or danger ONLY (NOT error)
- [ ] Tooltip.Provider wraps app root (prerequisite for any Tooltip usage)
```

---

## 6.4 Integration Workflow

```
Developer Request
       │
       ▼
Skill Selection (router picks skill)
       │
       ▼
Code Generation ◄── Per-skill checklist active (3-5 rules, prevention)
       │
       ▼
Post-Generation ◄── Centralized validator (125 rules, 8 categories)
       │
       ├── PASS → Present code to user
       └── FAIL → Auto-fix violations → Re-validate → Present clean code
```

**Integration points in each skill file:**
1. `## Common Mistakes Checklist` — 3-5 preventive rules at the end of each skill
2. Closing instruction: _"Before presenting code to the user, run through the picnic-validator checklist."_

**Validation is non-blocking for the user.** They never see raw validation failures. The agent auto-fixes violations before presenting code.

---

## 6.5 Token Budget

| Component | Lines | Size |
|-----------|-------|------|
| Validator SKILL.md | ~270 | ~5.9KB |
| Per-skill checklists (embedded) | ~5 lines × 8 skills = ~40 | ~0.9KB |
| **Total validation content** | **~310** | **~6.8KB** |

The validator has the lowest waste rate (10% reduction from original) because 90% of its content is pure Picnic-specific constraint data — variant enumerations, required prop lists, composition hierarchies, and token corrections that exist nowhere in Claude's training data.
