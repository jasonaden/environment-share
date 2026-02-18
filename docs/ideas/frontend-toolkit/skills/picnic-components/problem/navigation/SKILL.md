---
name: navigation
description: >
  Picnic navigation: Breadcrumbs, TabGroup, Paginator, StepTracker.
  Use when building page navigation, tabs, pagination, or multi-step wizards.
triggers:
  - tabs
  - breadcrumbs
  - pagination
  - steps
  - stepper
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

## StepTracker

Multi-step wizard progress. Steps auto-derive state from `activeStep` (0-indexed):
- Before activeStep → checkmark (completed)
- At activeStep → bold text, filled circle (active)
- After activeStep → numbered empty circle (incomplete)

props: activeStep(number, default 0) fontSize(small|medium*) layout(inline*|stacked)
Sub: .Step — add `onClick` to make steps clickable

## Common Mistakes Checklist

- TabGroup Panel content mounts/unmounts on tab switch (not hidden with CSS)
- Paginator `offset` is page index, not item offset — `offset=2` means page 3
- StepTracker `activeStep` is 0-indexed
- Breadcrumbs.Item extends LinkProps — use router's Link `as` prop for client-side nav
- TabGroup.Panel `value` must exactly match a TabGroup.Tab `value`
