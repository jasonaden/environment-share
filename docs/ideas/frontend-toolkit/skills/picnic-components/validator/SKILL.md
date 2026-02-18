---
name: picnic-validator
description: >
  Post-generation validator for Picnic component code. Run after any Picnic
  skill generates TSX. Scans for invalid variants, missing required props,
  deprecated patterns, styling violations, composition errors, accessibility
  gaps, and token misuse. Triggers: "validate", "check my code", "review picnic",
  "verify components".
---

# Picnic Validator

Scan generated code against all rules below. Report: `PASS (0 errors, 0 warnings)` or list each violation with rule ID, bad line, and fix. Auto-fix all violations before presenting code to the user.

Severities: **ERROR** = must fix (breaks or incorrect). **WARNING** = should fix (deprecated/non-idiomatic). **INFO** = consider (consistency opportunity).

---

## V: Variant Restrictions (20 rules) — all ERROR

Invalid variant values that don't exist on a component.

```
V01: Badge variant="secondary" → "standard"
     Valid: active | standard | primary | error | magic
V02: Button variant="basic" → "secondary" (deprecated alias, TS removed)
     Valid: primary | secondary | subdued | inverted | legacy-inverted
V03: Button variant="legacy-inverted" → "inverted" (deprecated)
V04: Accordion missing variant → add variant="neutral" (REQUIRED)
     Valid: error | info | neutral | warning | decorative3
V05: Tooltip.Content variant="error" → "danger"
     Valid: normal | danger
V06: ProgressBar invalid variant → Valid: success | warning | error
V07: Tag invalid variant → Valid: default | error
V08: ContainedLabel variant="error"/"info" → "critical"/"informational"
     Valid: neutral | success | informational | warning | critical | decorative1-4 | overMedia | magic
V09: Popover invalid variant → Valid: default | guidance
V10: Heading size="lg" → variant="lg" (variant controls size, not size prop)
     Valid: page | xl | lg | md | sm | subheading
V11: Text variant="small" → Valid: lede | body | caption | micro
V12: Link variant="primary" → Valid: default | inverted
V13: Separator size="medium" → Valid: small | large
V14: Banner variant="critical"/"default" → "error"/"neutral"
     Valid: error | info | warning | success | neutral | guidance
V15: LoadingPlaceholder invalid variant → Valid: shimmer | static
V16: Icon color — Valid: default | subdued | success | warning | critical | error | info | guidance | disabled | inverted | decorative1-4 | inherit
V17: IconCircle color — Valid: default | inverted | brand | success | warning | critical | decorative1-4 | disabled | magic
V18: ThirdPartyIconCircle color — Valid: default | inverted ONLY
V19: Heading/Text color="primary"/"error" → use semantic names
     Heading: default | subdued | inverted | success | warning | critical | info | guidance | neutral
     Text: adds decorative1-4
V20: PageHeader variant="horizontal" → Valid: responsive | inline | stacked
```

---

## R: Required Props (20 rules) — all ERROR

Missing props that cause errors or broken behavior.

```
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
```

---

## D: Deprecated Patterns (10 rules)

Patterns that work but must not appear in new code.

```
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
```

---

## T: Type Discriminations (10 rules) — all ERROR

Conditional prop requirements based on other prop values.

```
T01: Icon mode="presentational" → REQUIRES description (string)
T02: Icon mode="decorative" → description is unnecessary (remove it)
T03: Accordion type="single" → value must be string (not string[])
T04: Accordion type="multiple" → value must be string[] (not string)
T05: Checkbox checked="indeterminate" → onChange still receives boolean
T06: Table.RowSelectorCell → REQUIRES checked + onChange + value
T07: Table.SortableHeaderCell → REQUIRES onChange
T08: Dialog controlled → REQUIRES open + onOpenChange together
T09: Button loading={true} → pointer events disabled (onClick won't fire)
T10: Popover variant="guidance" → Content inherits purple/inverted styling
```

---

## S: Styling Rules (15 rules)

Violations of the Picnic styling contract.

```
S01: ERROR   color: '#333' → color: '$textDefault'                    | no raw hex
S02: ERROR   className="my-class" → css={{ ... }}                     | no className
S03: ERROR   className="flex gap-4" → css={{ display: 'flex', gap: '$space4' }} | no Tailwind
S04: ERROR   import styles from './x.module.css' → styled() or css prop | no CSS modules
S05: ERROR   padding: '16px' → p: '$space4'                           | no raw px spacing
S06: ERROR   fontSize: '14px' → fontSize: '$fontSize2'                | no raw font sizes
S07: ERROR   fontWeight: 600 → fontWeight: '$regular' or '$bold'      | only two weights
S08: ERROR   borderRadius: '8px' → borderRadius: '$radius2'           | no raw radii
S09: ERROR   boxShadow: '0 2px 4px ...' → boxShadow: '$shadow1'      | no raw shadows
S10: ERROR   zIndex: 100 → zIndex: '$layer1'                          | no raw z-index
S11: ERROR   '$bgDefault' in boxShadow → '$colors$bgDefault'          | cross-scale needs path
S12: WARNING backgroundColor: '$grayscale200' → '$bgAccent'           | no raw palette tokens
S13: INFO    padding: '$space4' → p: '$space4'                        | prefer shorthand utils
S14: ERROR   style={{ color: 'red' }} → css={{ color: '$textCritical' }} | no style prop
S15: ERROR   fontWeight: '$medium' → '$regular' or '$bold'            | only $regular/$bold exist
```

---

## C: Composition Rules (25 rules) — all ERROR

Sub-components that must be nested inside their required parent.

```
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
```

---

## A: Accessibility Rules (12 rules)

Missing accessibility requirements specific to Picnic components.

```
A01: ERROR   Icon mode="presentational" missing description
A02: ERROR   IconButton missing description
A03: ERROR   Emoji missing label
A04: WARNING Checkbox.CheckboxItem standalone missing aria-label
A05: WARNING Table.RowSelectorCell missing aria-label="Select {item}"
A06: WARNING Table.HeaderSelectorCell missing aria-label="Select all rows"
A07: WARNING Separator decorative={true} when semantically meaningful → decorative={false}
A08: ERROR   ResponsiveImage missing alt
A09: WARNING Logomark/Wordmark missing title for screen readers
A10: ERROR   Decorative Icon as only child → add VisuallyHidden text or switch to presentational
A11: WARNING Dialog/Drawer Content missing Heading for ARIA labeling
A12: WARNING Banner role — use role="alert" for errors, role="status" (default) otherwise
```

---

## K: Token Rules (13 rules)

Raw values where design tokens must be used.

```
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
```

---

## Rule Summary

| Category | Rules | Errors | Warnings | Info |
|----------|:-----:|:------:|:--------:|:----:|
| V: Variant Restrictions | 20 | 20 | 0 | 0 |
| R: Required Props | 20 | 20 | 0 | 0 |
| D: Deprecated Patterns | 10 | 2 | 8 | 0 |
| T: Type Discriminations | 10 | 10 | 0 | 0 |
| S: Styling Rules | 15 | 13 | 1 | 1 |
| C: Composition Rules | 25 | 25 | 0 | 0 |
| A: Accessibility Rules | 12 | 6 | 6 | 0 |
| K: Token Rules | 13 | 12 | 1 | 0 |
| **Total** | **125** | **108** | **16** | **1** |
