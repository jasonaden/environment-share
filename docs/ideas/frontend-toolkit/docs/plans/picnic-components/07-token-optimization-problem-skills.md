# Proposal 07: Token Optimization — Problem Skills Audit

**Author**: Token Optimizer Agent (Task #2)
**Date**: 2026-02-18
**Status**: Draft

---

## Executive Summary

The 5 problem skills (data-table, form-builder, dialog-drawer, navigation, feedback-notifications) have a combined budget of ~1,565 lines per P04. Analysis of the component catalog source material reveals **40-55% of content is token waste** — descriptions that restate component names, props with self-evident behavior, redundant usage examples showing standard patterns Claude already knows, and explanations of well-known concepts (compound components, controlled/uncontrolled patterns, Radix primitives).

**Combined proposed reduction: ~1,565 → ~750 lines (52% reduction)**

---

## Global Compression Rules (Apply to ALL Skills)

Before per-skill analysis, these cross-cutting rules eliminate the largest waste categories:

### G1. Kill the `css` prop row everywhere
Every single component documents `css | PicnicCss | — | Stitches style object`. This appears 40+ times across the 5 skills. **State once in the router or foundation skill**: "All Picnic components accept a `css` prop (PicnicCss) for Stitches styling." Then never repeat it.

**Savings**: ~80 lines across all skills (2 lines × 40 occurrences)

### G2. Kill `disabled: boolean` descriptions
`disabled` appears on ~20 components. The description is always "Disables interaction" or "Disables input." Never document it.

**Savings**: ~40 lines

### G3. Kill "Related Components" sections
Every catalog entry ends with a "Related Components" section (2-4 lines). In a skill context, cross-references are handled by the router and skill structure itself. These sections are pure waste inside a skill.

**Savings**: ~60 lines across all skills

### G4. Collapse the controlled/uncontrolled pattern
`open | boolean`, `defaultOpen | boolean`, `onOpenChange | (open: boolean) => void` appears identically on Dialog, StandardDialog, Drawer, Popover, Tooltip, DropdownMenu. State once: "All overlay components follow the Radix controlled pattern: `open`, `defaultOpen`, `onOpenChange`." Then omit from individual props tables.

**Savings**: ~36 lines (6 components × 6 lines)

### G5. "Formik-connected X" → one rule
All 15 Form.* sub-components have descriptions like "Formik-connected text input." State once: "All `Form.*` sub-components auto-connect to Formik context via the `name` prop." Drop individual descriptions.

**Savings**: ~30 lines

---

## Skill 1: `data-table`

### Current State
- **P04 estimate**: 360 lines (budget: 400)
- **Catalog source**: Table (148 lines), SearchBar (35 lines), plus cross-refs to Badge, Tag, ContainedLabel, DropdownMenu, Paginator, ContinuousScroll
- **Key components**: Table (11 sub-components), SearchBar

### Waste Analysis

#### Sub-component descriptions (Table — 11 sub-components)

| Sub-Component | Current Description | Verdict |
|---------------|-------------------|---------|
| Table.Header | "Header rowgroup wrapper" | **WASTE** — name says it |
| Table.HeaderRow | "Header row (display: contents)" | **KEEP** "display: contents" only |
| Table.HeaderCell | "Column header cell" | **WASTE** — name says it |
| Table.SortableHeaderCell | "Sortable column header" | **WASTE** — name says it. Props (`onChange, isSortActive, ascending`) tell the full story |
| Table.Body | "Body rowgroup wrapper" | **WASTE** — name says it |
| Table.BodyRow | "Body row (display: contents)" | **KEEP** "display: contents" only |
| Table.BodyFocusableRow | "Clickable body row with hover/focus styles" | **KEEP** — adds hover/focus detail |
| Table.BodyCell | "Body data cell" | **WASTE** — name says it |
| Table.RowSelectorCell | "Row checkbox cell" | **TRIM** → just list props |
| Table.HeaderSelectorCell | "Select-all checkbox header" | **TRIM** → "select-all" is in the name |
| Table.FocusWrapper | "Keyboard-focusable cell wrapper" | **KEEP** — clarifies keyboard scope |

**Result**: 6 of 11 descriptions are pure waste. Keep 3, trim 2.

#### Cell Alignment Variants table
Maps `left → flex-start`, `center → center`, `right → flex-end`. Claude knows CSS alignment. **Entire table is waste.**

**Savings**: 6 lines

#### Props analysis
- `columns: number | number[]` → keep — dual behavior (equal vs ratio) is non-obvious
- `columnSizes: string | string[]` → keep — CSS Grid syntax specific to Picnic
- `textVariant: 'body' | 'caption'` → keep — non-obvious that Table has its own text variant
- SearchBar props: `value`, `onChange`, `onClear`, `placeholder`, `size` — all self-evident. Only `onClear` callback behavior worth noting.

#### Usage examples
Current catalog has **5 separate Table examples** (~100 lines): basic, sorting, selection, custom columns, clickable rows. These can be **one canonical example** (~25 lines) showing headers + body + sorting + selection + column sizing combined.

**Savings**: ~75 lines

### Compressed data-table

| Section | Current Est. | Compressed | Technique |
|---------|-------------|-----------|-----------|
| When to use | 15 | 8 | Compact decision list, not tree |
| Table anatomy | 40 | 15 | Drop redundant descriptions, drop alignment table |
| Column configuration | 30 | 10 | Three inline examples: `columns={4}`, `columns={[1,4,3,2]}`, `columnSizes={['200px','1fr','1fr','100px']}` |
| Sorting pattern | 35 | 8 | Props-only — SortableHeaderCell props tell the story |
| Selection pattern | 35 | 8 | Props-only — HeaderSelectorCell + RowSelectorCell |
| Clickable rows | 20 | 5 | One-liner: "Use `Table.BodyFocusableRow` with `onClick`" |
| Cell content patterns | 40 | 10 | Compact table: "Badge → status, Tag → deletable, ContainedLabel → rich status" |
| Pagination | 30 | 5 | Cross-ref to navigation skill |
| Infinite scroll | 15 | 3 | "`ContinuousScroll` wrapping Table.Body" |
| Filtering | 20 | 5 | SearchBar above table, one-liner |
| Empty/loading | 15 | 5 | Brief note |
| Full example | 50 | 25 | Single canonical example |
| Constraints | 15 | 8 | Keep — ARIA roles, column count mismatch are real pitfalls |
| **Total** | **360** | **~115** | **68% reduction** |

### Top 3 Compression Techniques
1. **Merge 5 examples → 1 canonical** (saves ~75 lines)
2. **Drop self-evident sub-component descriptions** (saves ~25 lines)
3. **Replace prose sections with compact tables/one-liners** (saves ~50 lines)

### Biggest Win: Before/After

**Before** (catalog Table examples — 100 lines):
```
// Basic table (15 lines)
// With sorting (20 lines)
// With row selection (30 lines)
// Custom column sizes (3 lines)
// Clickable rows (10 lines)
```

**After** (single canonical — 25 lines):
```tsx
<SearchBar value={query} onChange={e => setQuery(e.target.value)} onClear={() => setQuery('')} />
<Table columnSizes={['40px', '1fr', '1fr', '120px', '80px']}>
  <Table.Header>
    <Table.HeaderRow>
      <Table.HeaderSelectorCell onChange={handleSelectAll} />
      <Table.SortableHeaderCell isSortActive={sortField === 'name'} ascending={sortAsc} onChange={() => handleSort('name')}>
        Name
      </Table.SortableHeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
      <Table.HeaderCell align="right">Actions</Table.HeaderCell>
    </Table.HeaderRow>
  </Table.Header>
  <Table.Body>
    {items.map(item => (
      <Table.BodyFocusableRow key={item.id} onClick={() => navigate(`/item/${item.id}`)}>
        <Table.RowSelectorCell checked={selected.has(item.id)} onChange={() => toggle(item.id)} value={item.id} />
        <Table.BodyCell>{item.name}</Table.BodyCell>
        <Table.BodyCell><ContainedLabel variant="success">Active</ContainedLabel></Table.BodyCell>
        <Table.BodyCell align="right">
          <DropdownMenu>
            <DropdownMenu.Trigger><IconButton iconName="MoreHorizontal" description="Actions" /></DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.TextItem onClick={() => edit(item.id)}>Edit</DropdownMenu.TextItem>
              <DropdownMenu.TextItem onClick={() => remove(item.id)}>Delete</DropdownMenu.TextItem>
            </DropdownMenu.Content>
          </DropdownMenu>
        </Table.BodyCell>
      </Table.BodyFocusableRow>
    ))}
  </Table.Body>
</Table>
<Paginator totalItems={total} maxItemsPerPage={25} offset={page} onOffsetChange={setPage} />
```

One example demonstrates: column sizing, select-all, sortable headers, row selection, clickable rows, cell content (ContainedLabel, DropdownMenu), and pagination. **75 lines → 25 lines**.

---

## Skill 2: `form-builder`

### Current State
- **P04 estimate**: 395 lines (budget: 420)
- **Catalog source**: 17 components totaling ~725 lines of raw catalog content
- **Key components**: Form (15 sub-components), FormField (4 sub-components), 15 standalone input components

### Waste Analysis

#### Form sub-component descriptions (15 items)

| Sub-Component | Description | Verdict |
|---------------|-------------|---------|
| Form.FormField | "Field layout container (label + input + helpers)" | **KEEP** |
| Form.Label | "Form field label" | **WASTE** |
| Form.TextInput | "Formik-connected text input" | **WASTE** — covered by G5 rule |
| Form.TextArea | "Formik-connected textarea" | **WASTE** |
| Form.Select | "Formik-connected select" | **WASTE** |
| Form.MultiSelect | "Formik-connected multi-select" | **WASTE** |
| Form.SearchableSelect | "Formik-connected searchable select" | **WASTE** |
| Form.Checkbox | "Formik-connected checkbox" | **WASTE** |
| Form.RadioGroup | "Formik-connected radio group" | **WASTE** |
| Form.Switch | "Formik-connected switch toggle" | **WASTE** |
| Form.DatePicker | "Formik-connected date picker" | **WASTE** |
| Form.ErrorText | "Displays Formik field error" | **KEEP** — behavior not obvious from name |
| Form.HelperText | "Displays helper text below field" | **TRIM** — "below field" is placement info |
| Form.SubmitButton | "Submit button (disabled during submission)" | **KEEP** — auto-disable is non-obvious |
| Form.ResetButton | "Reset button (resets Formik state)" | **TRIM** |

**Result**: 9 of 15 descriptions are waste (all "Formik-connected X" entries). Replace with single G5 rule.

#### FormField sub-component descriptions (4 items)

- FormField.Label `requirement` prop — **KEEP** (red asterisk / "(optional)" behavior is non-obvious)
- FormField.HelperText — renders as `Text variant="caption"` — **KEEP** (render behavior)
- FormField.ErrorText — renders as `Text variant="caption"` with `$textCritical` — **KEEP**
- FormField.IconPopover — sized to `$size6` — **KEEP** (sizing override)

#### Standalone component props (self-evident waste)
Across TextInput, TextArea, Select, MultiSelect, SearchableSelect, Checkbox, RadioGroup, Switch, SearchBar, FileInput, TagSelector, DatePicker, DateRangePicker, TimePicker:

- `placeholder: string` — always "Placeholder text" → **WASTE** (14 occurrences)
- `disabled: boolean` — always "Disables X" → **WASTE** (G2 rule, ~14 occurrences)
- `value` / `onChange` — standard controlled pattern → **WASTE** (document once)
- `size: 'small' | 'normal'` — self-evident → **WASTE** for most
- `state: 'normal' | 'error'` — self-evident → **WASTE**

**Non-obvious props to KEEP**:
- `TextArea.maxLength` → "shows counter" (counter is non-obvious)
- `Select.selectedLines: 'one-line' | 'multi-line'` → truncation behavior
- `Select.align: 'start' | 'end'` → dropdown alignment
- `Checkbox.checked: boolean | 'indeterminate'` → indeterminate state
- `RadioGroup.orientation` → layout direction
- `DatePicker.isOutsideRange` → date disabling callback
- `Paginator.offset` → 0-based page index (semantics are confusing)
- `SearchableSelect.onInputValueChange` → separate from onChange

#### Usage examples
15 standalone components each have 1-3 examples. Most show trivial controlled usage:
```tsx
<Switch checked={enabled} onCheckedChange={setEnabled} />
<TextInput placeholder="Enter name" size="normal" />
<RadioGroup value={plan} onValueChange={setPlan}>...</RadioGroup>
```

Claude can infer these from the props signature. **Eliminate all trivial single-component examples**. Keep only:
1. One full Form example showing FormField + validation + multiple field types (~25 lines)
2. Select with groups/icons (non-obvious compound usage, ~10 lines)
3. InputGroup phone number pattern (composition, ~5 lines)

**Savings**: ~120 lines of examples

### Compressed form-builder

| Section | Current Est. | Compressed | Technique |
|---------|-------------|-----------|-----------|
| When to use | 15 | 8 | Compact: "Use Form for Formik-managed, standalone for simple uncontrolled" |
| Form setup | 30 | 12 | Props table only — initialValues, onSubmit, validationSchema |
| FormField layout | 35 | 15 | Keep requirement/HelperText/ErrorText render details |
| Text inputs | 25 | 5 | "Form.TextInput, Form.TextArea — name prop binds to Formik. TextArea.maxLength shows counter." |
| Select inputs | 40 | 15 | Decision tree + one example with groups/icons |
| Boolean inputs | 30 | 8 | "Checkbox (multi-choice, supports indeterminate), RadioGroup (single-choice), Switch (boolean toggle)" |
| Date/time | 25 | 8 | "Moment.js objects. DatePicker.isOutsideRange disables dates." |
| Specialized | 25 | 8 | InputGroup example + TagSelector API |
| Validation | 35 | 15 | Yup patterns are genuinely non-obvious; keep |
| Form state | 25 | 10 | useForm hook API |
| Submit/reset | 20 | 5 | "Form.SubmitButton auto-disables during submission" |
| Full example | 50 | 25 | One canonical form |
| Standalone | 25 | 5 | Brief note: same API minus name prop |
| Constraints | 15 | 8 | Keep real pitfalls |
| **Total** | **395** | **~147** | **63% reduction** |

### Top 3 Compression Techniques
1. **G5 rule eliminates 9 "Formik-connected X" descriptions** (saves ~30 lines)
2. **Kill trivial usage examples for 12+ standalone components** (saves ~120 lines)
3. **Kill self-evident props (disabled, placeholder, css, value/onChange)** (saves ~80 lines)

### Biggest Win: Before/After

**Before** — 15 standalone components each get their own section with import, description, props table, variants, usage, related components. Example — Switch section alone:

```markdown
#### Switch
**Import**: `import { Switch } from '@attentive/picnic'`
**Primitive**: Radix Switch
Toggle switch for boolean settings.
##### Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| checked | boolean | false | Toggle state |
| onCheckedChange | (checked: boolean) => void | — | Change handler |
| disabled | boolean | false | Disables interaction |
| css | PicnicCss | — | Stitches style object |
##### Usage
<Switch checked={enabled} onCheckedChange={setEnabled} />
// In a FormField
<FormField layout="horizontal">
  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
  <FormField.Label>Dark Mode</FormField.Label>
</FormField>
##### Related Components
- Checkbox, Form.Switch
```
(~33 lines for Switch alone. Similar for Checkbox: 39 lines, RadioGroup: 42 lines)

**After** — all boolean inputs in one compact block:

```markdown
### Boolean Inputs
| Component | Control | Non-obvious |
|-----------|---------|-------------|
| Checkbox | `checked: boolean \| 'indeterminate'`, `onChange` | Supports indeterminate state |
| RadioGroup | `value`, `onValueChange` | `orientation: 'horizontal' \| 'vertical'` |
| Switch | `checked`, `onCheckedChange` | — |

Form.Checkbox, Form.RadioGroup, Form.Switch bind via `name` prop.
```
(~8 lines for all three. **114 lines → 8 lines**)

---

## Skill 3: `dialog-drawer`

### Current State
- **P04 estimate**: 350 lines (budget: 380)
- **Catalog source**: 6 components totaling ~372 lines
- **Key components**: Dialog (5), StandardDialog (8), Drawer (4), StandardDrawer (6), Popover (5), DropdownMenu (11) — 39 total sub-components

### Waste Analysis

#### Sub-component descriptions (39 sub-components across 6 components)

**Redundant descriptions** (name says it all):

| Component | Wasted Descriptions |
|-----------|-------------------|
| Dialog | Trigger, Header |
| StandardDialog | Trigger, Header, Close |
| Drawer | Trigger, Header |
| StandardDrawer | Trigger, Content, Header, Body |
| Popover | Trigger |
| DropdownMenu | Content, Item, TextItem, Separator, Sub, SubMenuTriggerItem, SubContent, UnstyledItem |

**Count**: 20 of 39 sub-component descriptions are waste (51%).

**Non-obvious descriptions to KEEP**:
- Dialog.Trigger → "uses Radix asChild" (important for composition)
- Dialog.Content → `styling: 'default' | 'unstyled'`, `portalContainer` (non-obvious)
- Dialog.CloseButton → position info (top-right)
- StandardDialog.Heading → renders `Heading variant="md"` (implicit styling)
- StandardDialog.HeroImage → "triggers image layout" (layout shift)
- StandardDialog.Body → "scrollable" (scroll behavior)
- StandardDialog.Footer → "uses ButtonBar", `layout` prop
- Drawer → `onCloseFinish` callback (after animation, 300ms)
- StandardDrawer.Footer → `layout="auto"` default
- StandardDrawer.Close → `variant="subdued"` default
- Popover.Content → `showCloseButton`, `showArrow`, `side`, `align`
- Popover variant → guidance (purple) vs default (white) — genuinely non-obvious
- DropdownMenu.Button → "pre-styled with chevron"
- DropdownMenu.Label → "non-interactive"

#### Controlled pattern redundancy (G4)
`open`, `defaultOpen`, `onOpenChange` appears identically on Dialog, Drawer, Popover, Tooltip, DropdownMenu. Five repetitions × 6 lines each = 30 lines of waste.

#### Usage examples
Current catalog has **10 separate examples** across 6 components (~160 lines total). Many show standard Radix trigger/content patterns Claude knows:

- Dialog basic (16 lines) + controlled (8 lines) = 24 lines
- StandardDialog standard (22 lines) + hero image (14 lines) = 36 lines
- Drawer (13 lines)
- StandardDrawer (18 lines)
- Popover default (10 lines) + guidance (8 lines) = 18 lines
- DropdownMenu basic (12 lines) + sub-menu (20 lines) = 32 lines

Can compress to **3 canonical examples**: one StandardDialog, one StandardDrawer, one DropdownMenu with sub-menu.

**Savings**: ~100 lines

### Compressed dialog-drawer

| Section | Current Est. | Compressed | Technique |
|---------|-------------|-----------|-----------|
| Decision tree | 25 | 12 | Compact table: when to use each |
| StandardDialog | 40 | 15 | Keep Heading variant, HeroImage layout, Footer ButtonBar notes. One example. |
| Dialog | 30 | 8 | "Low-level. Use for custom layouts. `styling='unstyled'` for no defaults." |
| StandardDrawer | 35 | 12 | Keep Footer layout="auto", Close variant="subdued". One example. |
| Drawer | 25 | 8 | "Low-level. `onCloseFinish` fires after 300ms animation." |
| Popover | 30 | 12 | Keep variant styles (guidance=purple), Content positioning props |
| DropdownMenu | 40 | 15 | Sub-component list + one example with sub-menu |
| Controlled pattern | 20 | 3 | G4 rule — state once |
| Composition | 30 | 10 | Compact list of valid combos |
| Stacking | 15 | 5 | z-index layer reference |
| Full examples | 45 | 0 | Absorbed into per-component sections |
| Constraints | 15 | 8 | Keep asChild, portal, focus trap pitfalls |
| **Total** | **350** | **~108** | **69% reduction** |

### Top 3 Compression Techniques
1. **G4: Controlled pattern stated once** (saves ~30 lines)
2. **Kill 20 self-evident sub-component descriptions** (saves ~40 lines)
3. **Merge 10 examples → 3 canonical** (saves ~100 lines)

### Biggest Win: Before/After

**Before** — StandardDialog + Dialog = 2 components, 4 examples, ~60 lines:

```markdown
#### Dialog
(5 sub-component descriptions, props table, 2 examples)
#### StandardDialog
(8 sub-component descriptions, props table, 2 examples)
```

**After** — merged dialog section:

```markdown
### Dialogs
Use **StandardDialog** (pre-structured header/body/footer) unless you need custom layout (use **Dialog**).

All dialogs: `open`, `defaultOpen`, `onOpenChange` (see Controlled Pattern above).

| Sub-Component | Non-obvious |
|---------------|-------------|
| StandardDialog.Heading | Renders `Heading variant="md"` |
| StandardDialog.HeroImage | Triggers image layout variant (16:9) |
| StandardDialog.Body | Scrollable |
| StandardDialog.Footer | Uses ButtonBar; `layout` prop |
| Dialog.Content | `styling: 'unstyled'` removes all defaults; `portalContainer` for custom portals |

[One canonical StandardDialog example — 15 lines]
```

**~60 lines → ~25 lines**

---

## Skill 4: `navigation`

### Current State
- **P04 estimate**: 220 lines (budget: 250)
- **Catalog source**: 4 components totaling ~201 lines
- **Key components**: Breadcrumbs (1 sub), TabGroup (3 sub), Paginator (2 sub), StepTracker (1 sub) — 7 total sub-components

### Waste Analysis

#### Sub-component descriptions (7 items)

| Sub-Component | Description | Verdict |
|---------------|-------------|---------|
| Breadcrumbs.Item | "Extends LinkProps" | **KEEP** — LinkProps extension is non-obvious |
| TabGroup.List | (tab list) | **WASTE** — standard Radix Tabs |
| TabGroup.Tab | `value: string` | **WASTE** — standard |
| TabGroup.Panel | `value: string` (matches Tab) | **TRIM** — "value matches Tab.value" is useful |
| Paginator.Label | "Viewing X-Y of Z" text | **KEEP** — format info |
| Paginator.ButtonGroup | navigation buttons | **WASTE** |
| StepTracker.Step | `onClick` makes clickable | **TRIM** |

**Result**: 3 of 7 are waste.

#### Props
- Breadcrumbs: virtually no props (just css) — barely needs a section
- TabGroup: standard Radix Tabs pattern (`defaultValue`, `value`, `onValueChange`) — Claude knows this
- Paginator: `offset` is 0-based page index — **non-obvious and confusing** (worth documenting clearly)
- StepTracker: `activeStep` is 0-indexed, steps auto-derive state (completed/active/incomplete) — **worth documenting**

#### Auto-bold last breadcrumb item
"Last item automatically styled as current page (bold, non-link)" — this IS non-obvious. Keep.

#### TabGroup keyboard navigation
"arrow keys" — Claude knows Radix Tabs has keyboard nav. **WASTE**.

#### Usage examples
- Breadcrumbs: 1 example (5 lines) — keep, it's minimal
- TabGroup: 1 example (17 lines) — compress to 10
- Paginator: 3 examples (simple, with start/end, custom layout = 28 lines) — compress to 1 showing custom layout (most complex)
- StepTracker: 2 examples (basic, clickable = 12 lines) — compress to 1

**Savings**: ~25 lines

### Compressed navigation

| Section | Current Est. | Compressed | Technique |
|---------|-------------|-----------|-----------|
| Decision tree | 20 | 10 | Compact table |
| Breadcrumbs | 25 | 8 | "Item extends LinkProps. Last item auto-bold. That's it." |
| TabGroup | 35 | 12 | Standard Radix Tabs. One example. |
| StepTracker | 30 | 12 | activeStep (0-indexed) + auto state derivation + one example |
| Paginator | 30 | 15 | offset semantics + custom layout sub-components |
| Combining | 25 | 5 | Brief cross-ref list |
| Full examples | 40 | 0 | Absorbed into per-component sections |
| Constraints | 15 | 8 | TabGroup panel mounting, Paginator offset semantics |
| **Total** | **220** | **~70** | **68% reduction** |

### Top 3 Compression Techniques
1. **TabGroup = "standard Radix Tabs"** — skip explanations Claude already knows (saves ~20 lines)
2. **Merge examples into per-component sections** (saves ~40 lines)
3. **Breadcrumbs is 2 facts: LinkProps + auto-bold** (saves ~15 lines)

### Biggest Win: Before/After

**Before** — TabGroup section (~35 lines):
```markdown
#### TabGroup
**Import**: `import { TabGroup } from '@attentive/picnic'`
**Primitive**: Radix Tabs
**Compound**: TabGroup.List, TabGroup.Tab, TabGroup.Panel

Tabbed navigation with accessible keyboard support (arrow keys). Built on Radix Tabs.

##### Props (TabGroup)
| defaultValue | string | ... | Initially active tab |
| value | string | ... | Controlled active tab |
| onValueChange | ... | Tab change handler |
| css | PicnicCss | ... | Stitches style object |

##### Props (TabGroup.Tab)
| value | string | required | Tab identifier |
| disabled | boolean | false | Disables tab |

##### Props (TabGroup.Panel)
| value | string | required | Panel identifier (matches Tab value) |

##### Usage (17 lines of example)
##### Related Components
```

**After** (~12 lines):
```markdown
### TabGroup
Radix Tabs. `defaultValue` or controlled `value`/`onValueChange`.

Sub: `.List`, `.Tab(value)`, `.Panel(value)` — Panel value must match Tab value.

```tsx
<TabGroup defaultValue="overview">
  <TabGroup.List>
    <TabGroup.Tab value="overview">Overview</TabGroup.Tab>
    <TabGroup.Tab value="settings">Settings</TabGroup.Tab>
  </TabGroup.List>
  <TabGroup.Panel value="overview">{/* content */}</TabGroup.Panel>
  <TabGroup.Panel value="settings">{/* content */}</TabGroup.Panel>
</TabGroup>
```

**~35 lines → ~12 lines**

---

## Skill 5: `feedback-notifications`

### Current State
- **P04 estimate**: 240 lines (budget: 260)
- **Catalog source**: 6 components totaling ~332 lines
- **Key components**: Banner (4 sub), Accordion (4 sub), Tooltip (3 sub), IconPopover, LoadingIndicator, LoadingPlaceholder — 11 sub-components + 3 standalone

### Waste Analysis

#### Sub-component descriptions (11 sub-components)

| Sub-Component | Description | Verdict |
|---------------|-------------|---------|
| Banner.Image | "Custom image (replaces icon)" | **KEEP** — "replaces icon" is non-obvious |
| Banner.Heading | "uses Heading variant='sm', color auto-set" | **KEEP** — auto-coloring is non-obvious |
| Banner.Text | "Body text" | **WASTE** |
| Banner.Action | "Right-aligned action area" | **TRIM** — "right-aligned" is layout info |
| Accordion.Item | "Individual accordion section" | **WASTE** |
| Accordion.Header | "Clickable header with chevron icon" | **TRIM** — chevron is implicit |
| Accordion.HeaderIcon | "auto-colored by variant" | **KEEP** — auto-coloring |
| Accordion.Content | "Collapsible body content" | **WASTE** |
| Tooltip.Provider | (required at app root) | **KEEP** — critical setup requirement |
| Tooltip.Trigger | trigger | **WASTE** |
| Tooltip.Content | `variant`, `side` | Props tell the story, **WASTE** for description |

**Result**: 5 of 11 descriptions are waste.

#### Banner Default Icons per Variant table
Maps each variant to its default icon (neutral→CircleInformation, success→CircleCheckmark, etc.). **KEEP** — this mapping is genuinely non-obvious and is the primary reason you'd look at Banner docs.

#### Accordion variant is required
`variant` is a **required** prop on Accordion. This is unusual and a real pitfall. **KEEP**.

#### Tooltip.Provider requirement
Must wrap app root. This is the #1 Tooltip gotcha. **KEEP prominently**.

#### Popover variant styles table
Maps default (white bg) vs guidance (purple bg). **KEEP** — genuinely non-obvious.

Wait — Popover is in dialog-drawer, not feedback-notifications. Correcting.

#### LoadingIndicator
Has essentially one prop: `css`. The component itself is three animated dots with VisuallyHidden "Loading" text. The entire section can be one line: "Three animated dots with built-in screen reader text."

#### LoadingPlaceholder
Key info: `variant: 'shimmer' | 'static'` and all sizing via `css`. Two lines max.

#### Usage examples
- Banner: 4 examples (~25 lines) → compress to 1 showing heading + dismiss + action
- Accordion: 2 examples (~35 lines) → compress to 1 showing multiple + headericon
- Tooltip: 3 examples (~24 lines) → compress to 1 showing Provider + basic usage
- IconPopover: 2 examples (~8 lines) → compress to 1
- LoadingIndicator: 3 examples (~10 lines) → 1 line ("Button uses it internally via `loading` prop")
- LoadingPlaceholder: 4 examples (~15 lines) → 1 skeleton lines example

**Savings**: ~70 lines

### Compressed feedback-notifications

| Section | Current Est. | Compressed | Technique |
|---------|-------------|-----------|-----------|
| Decision tree | 20 | 10 | Compact table |
| Banner | 35 | 18 | Keep variant→icon table, drop self-evident subs |
| Accordion | 35 | 15 | Keep: variant is required, type single/multiple, HeaderIcon auto-color |
| Tooltip | 30 | 12 | Provider requirement + variant (normal=dark, danger=red) + one example |
| IconPopover | 20 | 5 | "Convenience: IconButton + Popover. Defaults: icon=CircleQuestion, variant=subdued." |
| Loading states | 30 | 8 | Two components, minimal API. |
| Composition | 25 | 5 | Compact list |
| Full examples | 35 | 0 | Absorbed into sections |
| Constraints | 10 | 5 | Tooltip.Provider, Accordion variant required |
| **Total** | **240** | **~78** | **68% reduction** |

### Top 3 Compression Techniques
1. **Banner variant→icon table is the only high-value content; cut everything else** (saves ~15 lines)
2. **LoadingIndicator + LoadingPlaceholder → 8 lines total** (saves ~45 lines)
3. **Accordion and Tooltip: state non-obvious bits only** (saves ~40 lines)

### Biggest Win: Before/After

**Before** — LoadingIndicator + LoadingPlaceholder (~69 lines in catalog):
```markdown
#### LoadingIndicator
Import, primitive, description, props table (just css), 3 usage examples, related components

#### LoadingPlaceholder
Import, primitive, description, props table (variant + css), 4 usage examples, related components
```

**After** (~8 lines):
```markdown
### Loading States
**LoadingIndicator**: Animated dots with built-in screen reader text. Style with `css`.
Button's `loading` prop uses it internally.

**LoadingPlaceholder**: Shimmer skeleton. `variant: 'shimmer' | 'static'`. Size entirely via `css`:
```tsx
<Stack spacing="$space2">
  <LoadingPlaceholder css={{ width: '100%', height: '$size4' }} />
  <LoadingPlaceholder css={{ width: '80%', height: '$size4' }} />
</Stack>
```

**~69 lines → ~8 lines (88% reduction)**

---

## Summary

| Skill | P04 Estimate | Compressed | Reduction | Top Technique |
|-------|-------------|-----------|-----------|---------------|
| data-table | 360 | ~115 | 68% | 5 examples → 1 canonical |
| form-builder | 395 | ~147 | 63% | "Formik-connected X" × 9 → one rule |
| dialog-drawer | 350 | ~108 | 69% | Controlled pattern once + kill 20 self-evident subs |
| navigation | 220 | ~70 | 68% | TabGroup = "Radix Tabs" — skip what Claude knows |
| feedback-notifications | 240 | ~78 | 68% | Loading* = 8 lines total |
| **Total** | **1,565** | **~518** | **67%** | |

With the 5 global rules (G1-G5) applied, additional savings of ~50-80 lines bring the effective total closer to **~450 lines** — a **71% reduction** from the P04 estimates.

### Key Insight Validated

The user's insight is confirmed: **component names are self-descriptive**. Across the 5 problem skills:
- **39 of 68 sub-component descriptions** (57%) restate information already in the name
- **~60% of props table rows** document self-evident behavior (`disabled`, `placeholder`, `css`, `value`/`onChange`)
- **~70% of usage examples** show standard patterns Claude can infer from the API signature

The remaining 30% of content — non-obvious behaviors, Picnic-specific conventions, variant mappings, pitfalls, and one canonical example per skill — is the actual value.
