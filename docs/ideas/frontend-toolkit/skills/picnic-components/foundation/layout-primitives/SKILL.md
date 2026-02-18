---
name: layout-primitives
description: >
  Picnic layout components: Box, Stack, Grid, PageLayout, FooterLayout, Separator.
  Use when arranging page structure, choosing between flex/grid layouts, adding
  spacing, building page headers, or adding dividers.
---

# Picnic Layout Primitives

6 components for page structure and content arrangement. `import { Box, Stack, Grid, PageLayout, FooterLayout, Separator } from '@attentive/picnic'`

## Decision Guide

Prefer highest abstraction: **Stack > Grid > Box**
- Stack: consistent spacing between children (vertical or horizontal)
- Grid: equal/responsive columns
- Box: custom flex/grid when Stack/Grid don't fit
- PageLayout: page-level header structure
- FooterLayout: fixed page footer
- Separator: visual divider

## Box

Polymorphic base primitive. `<Box as="section">`, `<Box as="nav">`, `<Box as="ul">`

Use for custom layouts when Stack/Grid don't fit:
```tsx
<Box css={{ display: 'flex', gap: '$space4', alignItems: 'center' }}>
```

## Stack

Vertical/horizontal children with consistent spacing.

props: direction(vertical*|horizontal) spacing(token, default $space4) as(element)

**CRITICAL**: Stack uses margin `(> * + *)`, NOT CSS gap. `gap` in css prop is **silently stripped**. Always use the `spacing` prop.

```tsx
<Stack spacing="$space4">          {/* vertical, marginTop between */}
<Stack direction="horizontal" spacing="$space2">  {/* row, marginLeft */}
<Stack as="nav" spacing="$space6">  {/* semantic element */}
```

## Grid

CSS Grid with equal or responsive columns.

props: columns(number|ResponsiveValue) gap(token)
Sub: .Cell
Cell: colSpan(number|ResponsiveValue)

Responsive arrays map to [base, @bp1, @bp2, @bp3]:
```tsx
<Grid columns={3} gap="$space4">          {/* static 3-col */}
<Grid columns={[1, 2, 3, 4]}>             {/* responsive */}
  <Grid.Cell colSpan={2}>wide</Grid.Cell>  {/* spanning */}
</Grid>
```

## PageLayout

Page-level structure with responsive header.

Sub: .Header .Header.Heading .Header.Description .Header.Button .Header.TextContainer .Header.ButtonContainer
Header: variant(responsive*|inline|stacked)

```tsx
<PageLayout.Header variant="responsive">
  <PageLayout.Header.TextContainer>
    <PageLayout.Header.Heading>Title</PageLayout.Header.Heading>
    <PageLayout.Header.Description>Desc</PageLayout.Header.Description>
  </PageLayout.Header.TextContainer>
  <PageLayout.Header.ButtonContainer>
    <PageLayout.Header.Button variant="primary">Action</PageLayout.Header.Button>
  </PageLayout.Header.ButtonContainer>
</PageLayout.Header>
```

## FooterLayout

Fixed footer for page-level actions (Save/Cancel). Style entirely via `css` prop.

## Separator

Radix-based visual divider.

props: orientation(horizontal*|vertical) decorative(true*|false) size(small*|large)

Set `decorative={false}` for semantically meaningful dividers.

## Common Patterns

- **Page**: PageLayout.Header + Stack of sections + FooterLayout
- **Card grid**: `<Grid columns={[1, 2, 3]}>`
- **Form layout**: `<Stack spacing="$space4">` wrapping FormFields
- **Sidebar + main**: Box display:flex, sidebar fixed-width, main flex:1
- **Centered**: `<Box css={{ mx: 'auto', maxWidth: '$bp3', px: '$space6' }}>`

## Constraints

- Stack `gap` is silently stripped — always use `spacing` prop
- Stack uses margins, not CSS gap (Safari compat)
- Grid responsive arrays: [base, @bp1, @bp2, @bp3]
- PageLayout: always use compound sub-component API
- Separator `decorative={true}` by default
