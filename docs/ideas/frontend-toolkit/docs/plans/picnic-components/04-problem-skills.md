# Section 4: Problem-Oriented Skills

5 skills for complex multi-component compositions. Each teaches orchestration patterns — not individual component APIs.

**Global rules applied here**:
- G4: Radix controlled pattern (`open`, `defaultOpen`, `onOpenChange`) stated once in dialog-drawer
- G5: Formik auto-connection stated once in form-builder
- G7: Never explain Radix primitives
- G8: Never explain Formik/Yup concepts
- G9: One canonical example per skill

---

## 4.1 data-table (~115 lines)

```markdown
---
name: data-table
description: >
  Picnic Table component: sortable headers, row selection, clickable rows,
  column sizing, cell content (Badge, Tag, ContainedLabel, DropdownMenu).
  Use when building data tables with sorting, selection, or pagination.
---

# Building Data Tables

Table + SearchBar + ContinuousScroll. `import { Table, SearchBar } from '@attentive/picnic'`

## When to Use

- Table: structured rows/columns with sorting, selection, actions
- Card grid (Grid + Card): visual items without tabular structure
- List: simple ordered/unordered items

## Table API

CSS Grid with ARIA table roles. Column count must match cell count per row.

props: columns(number|number[]) columnSizes(string|string[]) textVariant(body*|caption)

Sub: .Header .HeaderRow .HeaderCell .SortableHeaderCell .Body .BodyRow .BodyFocusableRow .BodyCell .RowSelectorCell .HeaderSelectorCell .FocusWrapper

**Column sizing** (mutually exclusive):
- `columns={4}` — 4 equal columns
- `columns={[1, 4, 3, 2]}` — ratio-based columns
- `columnSizes={['40px', '1fr', '1fr', '100px']}` — explicit CSS Grid sizes

## Non-Obvious Sub-Components

| Sub-Component | Non-obvious |
|---------------|-------------|
| .HeaderRow / .BodyRow | `display: contents` — row is not a box |
| .SortableHeaderCell | `!onChange` `isSortActive(boolean)` `ascending(boolean)` — manages sort indicator |
| .BodyFocusableRow | Adds hover/focus styles + `onClick` for row navigation |
| .RowSelectorCell | `!checked` `!onChange` `!value` — row-level checkbox |
| .HeaderSelectorCell | `!onChange` — select-all checkbox |
| .FocusWrapper | Wraps interactive elements in cells for keyboard focus scoping |

## Sorting Pattern

SortableHeaderCell renders sort indicator. You manage sort state externally:
- `isSortActive` — highlights this column as the active sort
- `ascending` — arrow direction
- `onChange` — toggle sort on click

## Selection Pattern

HeaderSelectorCell (select-all) + RowSelectorCell (per-row). You manage `Set<id>` externally.

## Cell Content

Embed any component inside BodyCell:
- Badge → count/status annotation
- ContainedLabel → rich status with icon
- Tag → deletable item
- IconButton + DropdownMenu → row actions (see dialog-drawer for DropdownMenu API)

## Pagination & Infinite Scroll

- Paginator below Table: see **navigation** skill for full Paginator API
- ContinuousScroll wrapping Table.Body: `onLoadMore` `isLoading(boolean)` `hasMore(boolean)` `threshold(number)`

## SearchBar

Place above Table for filtering. Key prop: `onClear(() => void)` — clear button callback.

## Canonical Example

```tsx
<SearchBar value={query} onChange={e => setQuery(e.target.value)} onClear={() => setQuery('')} />
<Table columnSizes={['40px', '1fr', '1fr', '120px', '80px']}>
  <Table.Header>
    <Table.HeaderRow>
      <Table.HeaderSelectorCell onChange={handleSelectAll} />
      <Table.SortableHeaderCell
        isSortActive={sortField === 'name'} ascending={sortAsc}
        onChange={() => handleSort('name')}
      >
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

## Constraints

- Column count mismatch between header and body rows causes layout breakage (CSS Grid)
- `display: contents` on rows means you cannot style the row element itself
- Use `textVariant="caption"` for dense data tables
- ARIA roles are built-in — do not add redundant `role` attributes
```

---

## 4.2 form-builder (~147 lines)

```markdown
---
name: form-builder
description: >
  Picnic Form + FormField + all input types (TextInput, Select, MultiSelect,
  SearchableSelect, Checkbox, RadioGroup, Switch, DatePicker, TextArea, etc.).
  Use when building forms with validation, Formik state, or standalone inputs.
---

# Building Validated Forms

Form + FormField + 17 input types. `import { Form, useForm, FormField } from '@attentive/picnic'`

## When to Use

- **Form**: Formik-managed form with validation → use `Form.*` sub-components
- **Standalone inputs**: Simple uncontrolled inputs outside Formik → use components directly

## Formik Auto-Connection Rule (G5)

All `Form.*` sub-components auto-connect to Formik context via the `name` prop. `Form.TextInput name="email"` binds to `values.email`, `errors.email`, `touched.email` automatically. This applies to: Form.TextInput, Form.TextArea, Form.Select, Form.MultiSelect, Form.SearchableSelect, Form.Checkbox, Form.RadioGroup, Form.Switch, Form.DatePicker.

## Form Setup

props: !initialValues(V) !onSubmit(fn) validationSchema(Yup.Schema) validate(fn) enableReinitialize(boolean)

Hook: `useForm<V>()` — access Formik context (values, errors, touched, setFieldValue, resetForm, isSubmitting, dirty).

## FormField Layout

Organizes label + input + helpers. Parses children by type into slots.

props: layout(vertical*|horizontal)
Sub: .Label .HelperText .ErrorText .IconPopover

| Sub-Component | Non-obvious |
|---------------|-------------|
| .Label | `requirement(none*\|required\|optional)` — required=red asterisk, optional="(optional)" text |
| .HelperText | Renders as `Text variant="caption"` |
| .ErrorText | Renders as `Text variant="caption"` with `$textCritical` color |
| .IconPopover | Renders IconPopover sized to `$size6` |

## Input Type Decision Guide

| Need | Component | Non-obvious |
|------|-----------|-------------|
| Single-line text | TextInput | `size(small\|normal*)` `state(normal*\|error)` |
| Multi-line text | TextArea | `maxLength` shows character counter |
| Single select | Select | Sub: `.Item` `.IconItem` `.ThirdPartyIconItem` `.Group` `.Value` |
| Multi select | MultiSelect | Sub: `.Item` `.Group` — renders tags for selections |
| Searchable select | SearchableSelect | `onInputValueChange` separate from `onChange` |
| Boolean toggle | Switch | `checked` / `onCheckedChange` |
| Multi-choice | Checkbox | `checked: boolean \| 'indeterminate'` supports indeterminate state |
| Single choice | RadioGroup | Sub: `.Item(value)` — `orientation(horizontal\|vertical*)` |
| Date | DatePicker | Moment.js objects. `isOutsideRange(fn)` disables dates |
| Date range | DateRangePicker | `startDate` + `endDate` (Moment), `onDatesChange({startDate, endDate})` |
| Time | TimePicker | `value` in HH:mm format |
| File upload | FileInput | `accept` string, `multiple(boolean)` |
| Grouped inputs | InputGroup | Shared borders — e.g., country code + phone number |
| Tag creation | TagSelector | `tags(string[])` `onAddTag(fn)` `onRemoveTag(fn)` |

## Select with Groups/Icons

```tsx
<Select value={channel} onChange={setChannel}>
  <Select.Group label="Messaging">
    <Select.IconItem value="sms" iconName="Message">SMS</Select.IconItem>
    <Select.IconItem value="email" iconName="Mail">Email</Select.IconItem>
  </Select.Group>
</Select>
```

Select-specific: `align(start*|end)` dropdown alignment, `selectedLines(one-line*|multi-line)` truncation.

## Validation Patterns

- Schema: `validationSchema={Yup.object({ field: Yup.string().required('Required') })}`
- Custom: `validate={(values) => ({ field: values.field ? undefined : 'Required' })}`
- Per-field errors: `<Form.ErrorText name="fieldName" />` auto-displays from Formik

## Submit / Reset

- `Form.SubmitButton` — auto-disables during submission (isSubmitting)
- `Form.ResetButton` — resets Formik state to initialValues

## Canonical Example

```tsx
<Form
  initialValues={{ email: '', role: '', notifications: false, bio: '' }}
  validationSchema={Yup.object({
    email: Yup.string().email().required('Required'),
    role: Yup.string().required('Required'),
  })}
  onSubmit={handleSubmit}
>
  <Stack spacing="$space4">
    <Form.FormField>
      <Form.Label requirement="required">Email</Form.Label>
      <Form.TextInput name="email" />
      <Form.ErrorText name="email" />
    </Form.FormField>

    <Form.FormField>
      <Form.Label requirement="required">Role</Form.Label>
      <Form.Select name="role">
        <Form.Select.Item value="admin">Admin</Form.Select.Item>
        <Form.Select.Item value="editor">Editor</Form.Select.Item>
      </Form.Select>
      <Form.ErrorText name="role" />
    </Form.FormField>

    <Form.FormField>
      <Form.Label>Bio</Form.Label>
      <Form.TextArea name="bio" maxLength={500} />
      <Form.HelperText>Brief description</Form.HelperText>
    </Form.FormField>

    <Form.FormField layout="horizontal">
      <Form.Switch name="notifications" />
      <Form.Label>Enable notifications</Form.Label>
    </Form.FormField>

    <Form.SubmitButton>Create User</Form.SubmitButton>
  </Stack>
</Form>
```

## Standalone Usage

Same API as Form.* minus the `name` prop. Use standard `value`/`onChange` controlled pattern. Wrap in FormField for consistent label/error layout.

## Constraints

- `name` prop MUST match keys in `initialValues` — mismatches silently fail
- Form.* components MUST be inside a `<Form>` — they read Formik context
- Use `enableReinitialize` when initialValues change after mount (e.g., edit forms)
- Never mix Form.* and standalone inputs in the same form
```

---

## 4.3 dialog-drawer (~108 lines)

```markdown
---
name: dialog-drawer
description: >
  Picnic overlays: StandardDialog, Dialog, StandardDrawer, Drawer, Popover,
  DropdownMenu. Use when showing modals, slide-in panels, floating content,
  or action menus.
---

# Overlays, Modals, and Popovers

6 overlay components. `import { StandardDialog, Dialog, Drawer, StandardDrawer, Popover, DropdownMenu } from '@attentive/picnic'`

## Radix Controlled Pattern (G4)

All overlay components follow the same pattern: `open(boolean)` `defaultOpen(boolean)` `onOpenChange((open: boolean) => void)`. Omit for uncontrolled (trigger-driven). This applies to: Dialog, StandardDialog, Drawer, StandardDrawer, Popover, Tooltip, DropdownMenu.

## Decision Guide

| Need | Component |
|------|-----------|
| Structured modal (header/body/footer) | StandardDialog |
| Custom modal layout | Dialog |
| Structured side panel | StandardDrawer |
| Custom side panel | Drawer |
| Floating info/guidance content | Popover |
| Action menu with items | DropdownMenu |

## StandardDialog

Pre-structured modal with slot-based layout. Prefer over Dialog for standard use cases.

Sub: .Trigger .Content .Header .Heading .HeroImage .Body .Footer .Close

| Sub-Component | Non-obvious |
|---------------|-------------|
| .Heading | Renders `Heading variant="md"` automatically |
| .HeroImage | Triggers 16:9 image layout variant; accepts ResponsiveImage props |
| .Body | Scrollable content area |
| .Footer | Uses ButtonBar internally; `layout(auto*\|stretch)` |
| .Close | Renders Button; defaults suitable for cancel actions |

## Dialog

Low-level modal. Use for fully custom layouts.

Sub: .Trigger .Content .Header .Close .CloseButton

Content: `styling(default*|unstyled)` — unstyled removes all defaults. `portalContainer` for custom portal target.
CloseButton: positioned top-right by default.

## StandardDrawer

Slide-in panel (right side) with slot-based layout.

Sub: .Trigger .Content .Header .Body .Footer .Close

| Sub-Component | Non-obvious |
|---------------|-------------|
| .Footer | `layout="auto"` by default |
| .Close | `variant="subdued"` by default |

## Drawer

Low-level slide-in panel. `onCloseFinish` fires after 300ms close animation. `includeOverlay(boolean, default true)`.

Sub: .Trigger .Content .Header .CloseButton

## Popover

Floating content panel anchored to trigger.

Sub: .Trigger .Anchor .Content .CloseButton .CloseIconButton

props: variant(default*|guidance)

| Variant | Style |
|---------|-------|
| default | White bg, border, white arrow |
| guidance | Purple bg (`$lavenderPurple700`), inverted text, purple arrow |

Content: `showCloseButton(true*)` `showArrow(true*)` `side(top|right|bottom|left)` `align(start|center|end)` `alignOffset(number, default 4)`

## DropdownMenu

Action menu with keyboard navigation and sub-menus.

Sub: .Trigger .Button .Content .Item .TextItem .Label .Separator .Sub .SubMenuTriggerItem .SubContent .UnstyledItem

| Sub-Component | Non-obvious |
|---------------|-------------|
| .Button | Pre-styled trigger with chevron icon |
| .Label | Non-interactive group heading |
| .Sub + .SubMenuTriggerItem + .SubContent | Nested sub-menu pattern |

## Canonical Example

```tsx
<StandardDialog open={isOpen} onOpenChange={setIsOpen}>
  <StandardDialog.Trigger>
    <Button>Create Campaign</Button>
  </StandardDialog.Trigger>
  <StandardDialog.Content css={{ width: '500px' }}>
    <StandardDialog.Header>
      <StandardDialog.Heading>Create Campaign</StandardDialog.Heading>
    </StandardDialog.Header>
    <StandardDialog.Body>
      <Form initialValues={{ name: '' }} onSubmit={handleCreate} validationSchema={schema}>
        <Stack spacing="$space4">
          <Form.FormField>
            <Form.Label requirement="required">Campaign Name</Form.Label>
            <Form.TextInput name="name" />
            <Form.ErrorText name="name" />
          </Form.FormField>
        </Stack>
        <StandardDialog.Footer>
          <StandardDialog.Close variant="secondary">Cancel</StandardDialog.Close>
          <Form.SubmitButton>Create</Form.SubmitButton>
        </StandardDialog.Footer>
      </Form>
    </StandardDialog.Body>
  </StandardDialog.Content>
</StandardDialog>
```

## Constraints

- Trigger children use Radix `asChild` — trigger must accept a ref and forward props
- All overlays portal to document.body by default (use `portalContainer` to override)
- Dialog/Drawer trap focus automatically — no manual focus management needed
- DropdownMenu.Trigger wraps child with `asChild`; use `.Button` for the pre-styled option
```

---

## 4.4 navigation (~70 lines)

```markdown
---
name: navigation
description: >
  Picnic navigation: Breadcrumbs, TabGroup, Paginator, StepTracker.
  Use when building page navigation, tabs, pagination, or multi-step wizards.
---

# Navigation Patterns

4 navigation components. `import { Breadcrumbs, TabGroup, Paginator, StepTracker } from '@attentive/picnic'`

## Decision Guide

| Need | Component |
|------|-----------|
| Hierarchical page path | Breadcrumbs |
| Content section switching | TabGroup |
| Page-based data navigation | Paginator |
| Multi-step wizard progress | StepTracker |

## Breadcrumbs

Sub: .Item — extends LinkProps (accepts `href`, `as`, etc.)

Last item auto-styled as current page (bold, non-link). That's the entire API.

```tsx
<Breadcrumbs>
  <Breadcrumbs.Item href="/dashboard">Dashboard</Breadcrumbs.Item>
  <Breadcrumbs.Item href="/campaigns">Campaigns</Breadcrumbs.Item>
  <Breadcrumbs.Item>Holiday Sale 2024</Breadcrumbs.Item>
</Breadcrumbs>
```

## TabGroup

Radix Tabs. `defaultValue` or controlled `value`/`onValueChange`.

Sub: .List .Tab(!value) .Panel(!value) — Panel `value` must match a Tab `value`.

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

## Paginator

Offset-based pagination. `offset` is a 0-based page index (NOT item offset).

props: !totalItems(number) !maxItemsPerPage(number) !offset(number) !onOffsetChange(fn) hasStartEndButtons(boolean)

Sub (for custom layout):
- `.Label` — "Viewing X-Y of Z" text: `pageIndex` `itemsPerPage` `totalItems`
- `.ButtonGroup` — nav buttons: `hasNext` `hasPrevious` `loadNext` `loadPrevious` `hasStartEndButtons?` `loadFirst?` `loadLast?`

```tsx
{/* Standard usage */}
<Paginator totalItems={250} maxItemsPerPage={25} offset={page} onOffsetChange={setPage} />

{/* Custom layout */}
<Box css={{ display: 'flex', justifyContent: 'space-between' }}>
  <Paginator.Label pageIndex={page} itemsPerPage={25} totalItems={250} />
  <Paginator.ButtonGroup
    hasNext={page < totalPages - 1} hasPrevious={page > 0}
    loadNext={() => setPage(p => p + 1)} loadPrevious={() => setPage(p => p - 1)}
  />
</Box>
```

## StepTracker

Multi-step wizard progress. Steps auto-derive state from `activeStep` (0-indexed):
- Before activeStep → checkmark (completed)
- At activeStep → bold text, filled circle (active)
- After activeStep → numbered empty circle (incomplete)

props: activeStep(number, default 0) fontSize(small|medium*) layout(inline*|stacked)
Sub: .Step — add `onClick` to make steps clickable

```tsx
<StepTracker activeStep={1} layout="stacked">
  <StepTracker.Step onClick={() => goToStep(0)}>Details</StepTracker.Step>
  <StepTracker.Step onClick={() => goToStep(1)}>Targeting</StepTracker.Step>
  <StepTracker.Step onClick={() => goToStep(2)}>Schedule</StepTracker.Step>
</StepTracker>
```

## Constraints

- TabGroup Panel content mounts/unmounts on tab switch (not hidden with CSS)
- Paginator `offset` is page index, not item offset — `offset=2` means page 3
- StepTracker `activeStep` is 0-indexed
- Breadcrumbs.Item extends LinkProps — use router's Link `as` prop for client-side nav
```

---

## 4.5 feedback-notifications (~78 lines)

```markdown
---
name: feedback-notifications
description: >
  Picnic feedback: Banner, Accordion, Tooltip, IconPopover, LoadingIndicator,
  LoadingPlaceholder. Use when showing notifications, collapsible sections,
  tooltips, info popovers, or loading states.
---

# User Feedback and Loading States

6 feedback components. `import { Banner, Accordion, Tooltip, IconPopover, LoadingIndicator, LoadingPlaceholder } from '@attentive/picnic'`

## Decision Guide

| Need | Component |
|------|-----------|
| Page/section notification | Banner |
| Collapsible content sections | Accordion |
| Hover/focus info tooltip | Tooltip |
| Icon-triggered info popover | IconPopover |
| Inline loading animation | LoadingIndicator |
| Skeleton placeholder | LoadingPlaceholder |

## Banner

Notification banner with variant-specific default icons. Parses children by type into slots.

props: variant(error|info*|warning|success|neutral|guidance) dismissible(boolean) onDismiss(fn) iconName(IconName, overrides default)
Sub: .Image .Heading .Text .Action

| Variant | Default Icon | Background |
|---------|-------------|-----------|
| neutral | CircleInformation | `$bgDefault` + border |
| info | CircleInformation | `$bgInformationalDefault` |
| success | CircleCheckmark | `$bgSuccessDefault` |
| warning | CircleExclamation | `$bgWarningDefault` |
| error | CircleError | `$bgCriticalDefault` |
| guidance | Lightbulb | `$bgGuidanceDefault` |

| Sub-Component | Non-obvious |
|---------------|-------------|
| .Image | Replaces the default variant icon with custom image |
| .Heading | Renders `Heading variant="sm"`, color auto-set from variant |
| .Action | Right-aligned action area (place Button here) |

## Accordion

Collapsible sections. **`variant` is required** (unusual — most components have defaults).

props: type(single|multiple) !variant(error|info|neutral|warning|decorative3) collapsible(boolean) defaultValue(string|string[]) value(string|string[]) onValueChange(fn)
Sub: .Item(!value) .Header .HeaderIcon .Content

| Sub-Component | Non-obvious |
|---------------|-------------|
| .HeaderIcon | `name(IconName)` — auto-colored by variant |

`collapsible` allows all items closed in single mode (default: one always open).

## Tooltip

**CRITICAL**: `Tooltip.Provider` must wrap your app root (once). Without it, tooltips silently fail.

Follows Radix controlled pattern (see dialog-drawer G4). Non-interactive content (pointer-events disabled).

Sub: .Provider .Trigger .Content
Content: `variant(normal*|danger)` `side(top*|right|bottom|left)`

| Variant | Style |
|---------|-------|
| normal | Dark bg (`$bgTooltip`), white text |
| danger | Red bg (`$bgCriticalDefault`) |

## IconPopover

Convenience wrapper: IconButton + Popover combined. Defaults: `iconName="CircleQuestion"`, `variant="subdued"`, `description="More information"`.

props: iconName(IconName) description(string) side(top*|right|bottom|left) align(start*|center|end) alignOffset(number)

## Loading States

**LoadingIndicator**: Animated dots with built-in screen reader text ("Loading"). Style with `css`. Button's `loading` prop uses it internally.

**LoadingPlaceholder**: Shimmer skeleton. `variant(shimmer*|static)`. Size entirely via `css`:

```tsx
<Stack spacing="$space2">
  <LoadingPlaceholder css={{ width: '100%', height: '$size4' }} />
  <LoadingPlaceholder css={{ width: '80%', height: '$size4' }} />
  <LoadingPlaceholder css={{ width: '60%', height: '$size4' }} />
</Stack>
```

## Canonical Example

```tsx
<Banner variant="error" dismissible onDismiss={clearError}>
  <Banner.Heading>Upload Failed</Banner.Heading>
  <Banner.Text>The file exceeded the maximum size of 10MB.</Banner.Text>
  <Banner.Action>
    <Button variant="secondary" size="small">Retry</Button>
  </Banner.Action>
</Banner>
```

## Constraints

- Tooltip.Provider MUST wrap app root — tooltips silently fail without it
- Accordion `variant` is required (no default)
- Tooltip content is non-interactive — use Popover for clickable content
- Banner parses children by type — don't wrap sub-components in extra divs
```

---

## Line Count Summary

| Skill | Target | Actual (approx) | Key compression |
|-------|--------|------------------|-----------------|
| data-table | ~115 | ~112 | 5 examples → 1 canonical, drop self-evident sub descriptions |
| form-builder | ~147 | ~145 | G5 eliminates 9 descriptions, kill trivial standalone examples |
| dialog-drawer | ~108 | ~106 | G4 stated once, kill 20 self-evident sub descriptions |
| navigation | ~70 | ~68 | TabGroup = Radix Tabs, examples absorbed into sections |
| feedback-notifications | ~78 | ~76 | Loading* = 8 lines total, keep only non-obvious bits |
| **Total** | **~518** | **~507** | **67% reduction from P04 estimates** |
