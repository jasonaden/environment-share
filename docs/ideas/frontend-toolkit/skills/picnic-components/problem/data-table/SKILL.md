---
name: data-table
description: >
  Picnic Table component: sortable headers, row selection, clickable rows,
  column sizing, cell content (Badge, Tag, ContainedLabel, DropdownMenu).
  Use when building data tables with sorting, selection, or pagination.
triggers:
  - create a table
  - data grid
  - sortable columns
  - table with selection
---

# Building Data Tables

Table + SearchBar + ContinuousScroll. `import { Table, SearchBar, ContinuousScroll } from '@attentive/picnic'`

## Compound Hierarchy

```
Table columns|columnSizes|textVariant
  .Header
    .HeaderRow                        (display: contents)
      .HeaderSelectorCell             !onChange — select-all checkbox
      .HeaderCell                     align(left*|center|right)
      .SortableHeaderCell             !onChange isSortActive(boolean) ascending(boolean)
  .Body
    .BodyRow                          (display: contents)
    .BodyFocusableRow                 onClick — hover/focus styles
      .RowSelectorCell                !checked !onChange !value — row checkbox
      .BodyCell                       align(left*|center|right)
        .FocusWrapper                 keyboard focus scoping for interactive elements
```

## Column Sizing (mutually exclusive)

- `columns={4}` — 4 equal columns
- `columns={[1, 4, 3, 2]}` — ratio-based
- `columnSizes={['40px', '1fr', '1fr', '100px']}` — explicit CSS Grid sizes

## Sorting

SortableHeaderCell renders sort indicator. You manage state externally: `isSortActive` highlights active column, `ascending` sets arrow direction, `onChange` toggles on click.

## Selection

`HeaderSelectorCell` (select-all) + `RowSelectorCell` (per-row). Manage `Set<id>` externally.

## Cell Content

Embed inside BodyCell: Badge (counts), ContainedLabel (status), Tag (deletable), IconButton + DropdownMenu (row actions — see dialog-drawer skill).

## ContinuousScroll

Wraps Table.Body for infinite scroll: `!onLoadMore(fn)` `!isLoading(boolean)` `!hasMore(boolean)` `threshold(number, 0-1)`. For page-based pagination, use Paginator (see navigation skill).

## Canonical Example

SearchBar above Table for filtering: `onClear(() => void)` clears the search.

```tsx
// State: query, selected (Set<string>), sortField, sortAsc — managed externally
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
      <Table.HeaderCell>Email</Table.HeaderCell>
      <Table.HeaderCell align="right">Actions</Table.HeaderCell>
    </Table.HeaderRow>
  </Table.Header>
  <Table.Body>
    {items.map(item => (
      <Table.BodyFocusableRow key={item.id} onClick={() => navigate(`/item/${item.id}`)}>
        <Table.RowSelectorCell
          checked={selected.has(item.id)} onChange={() => toggle(item.id)} value={item.id}
        />
        <Table.BodyCell>{item.name}</Table.BodyCell>
        <Table.BodyCell><ContainedLabel variant="success">Active</ContainedLabel></Table.BodyCell>
        <Table.BodyCell>{item.email}</Table.BodyCell>
        <Table.BodyCell align="right">
          <Table.FocusWrapper>
            <DropdownMenu>
              <DropdownMenu.Trigger>
                <IconButton iconName="MoreHorizontal" description="Actions" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.TextItem onClick={() => edit(item.id)}>Edit</DropdownMenu.TextItem>
                <DropdownMenu.TextItem onClick={() => remove(item.id)}>Delete</DropdownMenu.TextItem>
              </DropdownMenu.Content>
            </DropdownMenu>
          </Table.FocusWrapper>
        </Table.BodyCell>
      </Table.BodyFocusableRow>
    ))}
  </Table.Body>
</Table>
<Paginator totalItems={total} maxItemsPerPage={25} offset={page} onOffsetChange={setPage} />
```

## Common Mistakes Checklist

- Column count in header MUST match cell count per body row (CSS Grid breaks silently)
- `display: contents` on rows means you cannot style the row element itself — style cells instead
- Use `Table.FocusWrapper` around interactive elements (buttons, links) inside cells for keyboard focus scoping
- Use `textVariant="caption"` for dense data tables
- ARIA roles are built-in — do not add redundant `role` attributes
