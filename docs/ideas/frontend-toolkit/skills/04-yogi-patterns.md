# Skill Plan: Yogi Patterns

## Purpose and Scope

This skill provides comprehensive knowledge of Yogi, the organization's library of Relay-connected components that provide live data integration out of the box. It enables agents to:

- Understand the complete catalog of Yogi connected components
- Select appropriate Yogi components for data-driven UI needs
- Integrate Yogi components with Relay fragments correctly
- Customize Yogi components through props and render props
- Handle loading, error, and empty states in Yogi components
- Apply filtering, sorting, and pagination patterns
- Understand performance characteristics of connected components
- Know when to use Yogi vs. building custom Relay-connected components
- Compose Yogi components with Picnic components

The skill covers all Yogi components (LiveTable, ConnectedDropdown, LiveSearch, ConnectedAutocomplete, etc.) and their integration patterns with the organization's GraphQL API.

## Trigger Description

```yaml
description: >
  This skill provides comprehensive knowledge of Yogi connected components, which are Relay-integrated
  UI components that handle data fetching, loading states, and real-time updates automatically.
  This skill should be used when the user asks about Yogi components, connected tables, connected dropdowns,
  live data components, how to display data with automatic updates, integrate Relay fragments with UI components,
  or select between Yogi and custom Relay components.
```

## SKILL.md Specification

Target length: 1800 words

### Section 1: Introduction to Yogi (250 words)
- Overview of Yogi as the connected component library
- Philosophy: data integration made simple
- Relationship to Relay and GraphQL API
- Relationship to Picnic design system
- When to use Yogi vs. custom components
- Component status and versioning
- Import patterns and package structure

### Section 2: Yogi Component Discovery (200 words)
- Complete catalog of Yogi components
- Component categories (data display, input, search)
- Selecting the right Yogi component
- Component capabilities and limitations
- Checking component documentation

### Section 3: Relay Integration Patterns (400 words)
- Fragment requirements for Yogi components
- Fragment naming conventions for Yogi
- Spreading Yogi fragments in parent queries
- Data flow from query to Yogi component
- Type safety with generated types
- Connection patterns for list components
- Pagination integration
- Real-time updates and subscriptions

### Section 4: LiveTable Component (350 words)
- Use cases and capabilities
- Required fragment structure
- Column configuration
- Sorting and filtering
- Pagination patterns
- Row actions and selection
- Custom cell renderers
- Loading and empty states
- Expandable rows
- Export functionality

### Section 5: Connected Input Components (250 words)
- ConnectedDropdown usage
- ConnectedAutocomplete patterns
- LiveSearch integration
- Fragment requirements
- Option rendering and customization
- Multi-select patterns
- Async loading states

### Section 6: Customization Patterns (200 words)
- Props-based customization
- Render props for custom rendering
- Slot props for component injection
- Styling customization
- Behavior customization
- Event handlers

### Section 7: Performance Considerations (150 words)
- When Yogi components are efficient
- When to use custom components instead
- Pagination for large datasets
- Virtual scrolling support
- Memoization of custom renderers

## Reference Files

### connected-components.md
**Purpose**: Complete reference of all Yogi components with props, usage patterns, and Relay integration

**Estimated size**: 7,000-9,000 lines

**Outline**:
1. **Component Index** (200 lines)
   - Data Display components
   - Input components
   - Search components
   - Status by component

2. **LiveTable Component** (2,000 lines)
   - Component overview
   - Required fragment structure
   - Props reference table
   - Column configuration
   - Sorting configuration
   - Filter configuration
   - Pagination setup
   - Row actions
   - Row selection
   - Expandable rows
   - Custom cell renderers
   - Loading states
   - Empty states
   - Error handling
   - Export functionality
   - Complete usage examples
   - Integration with Picnic
   - Performance optimization

3. **ConnectedDropdown Component** (800 lines)
   - Component overview
   - Required fragment structure
   - Props reference
   - Single-select example
   - Multi-select example
   - Custom option rendering
   - Search/filter integration
   - Loading states
   - Error handling
   - Controlled vs. uncontrolled

4. **ConnectedAutocomplete Component** (900 lines)
   - Component overview
   - Required fragment structure
   - Props reference
   - Async data loading
   - Debounce configuration
   - Custom option rendering
   - Multi-select patterns
   - Recent selections
   - Free-form input vs. strict selection

5. **LiveSearch Component** (700 lines)
   - Component overview
   - Required fragment structure
   - Search input integration
   - Results rendering
   - Pagination in results
   - Filters and facets
   - Highlight matching text
   - Empty and no-results states

6. **ConnectedForm Component** (600 lines)
   - Component overview
   - Form with connected inputs
   - Validation integration
   - Submit with mutation
   - Optimistic updates
   - Error handling

7. **LiveChart Components** (800 lines)
   - LiveLineChart
   - LiveBarChart
   - LivePieChart
   - Data transformation
   - Real-time updates
   - Custom tooltips

8. **Advanced Patterns** (1,000 lines)
   - Composing multiple Yogi components
   - Master-detail patterns
   - Nested connected components
   - Custom connected component creation
   - Testing Yogi components

9. **Migration Guides** (500 lines)
   - Migrating from custom Relay components to Yogi
   - Upgrading between Yogi versions
   - Common migration patterns

## Used By Agents

- **component-architect**: Selects Yogi components for data-driven features
- **component-builder**: Implements Yogi component integration
- **relay-architect**: Designs fragments for Yogi components

## Dependencies

- **relay-conventions**: Understanding Relay fragments and queries
- **picnic-components**: Composing Yogi with Picnic components
- **react-patterns**: React hooks and patterns used with Yogi

## Skills to Load When Building

- `plugin-dev:skill-development` (required for skill creation)

## Validation Criteria

### Should Trigger (3 test queries)

1. "How do I use LiveTable to display a list of users?"
2. "What's the correct fragment structure for ConnectedDropdown?"
3. "Should I use Yogi or build a custom Relay component for this data table?"

### Should NOT Trigger (2 test queries)

1. "How do I write a Relay mutation?" (relay-conventions)
2. "Which Picnic component should I use for layout?" (picnic-components)

### Progressive Disclosure Test

1. **Frontmatter only**: User asks "Can I display a data table with live updates?"
   - Expected: Agent suggests using Yogi LiveTable component

2. **SKILL.md loaded**: User asks "What props does LiveTable accept?"
   - Expected: Agent provides overview of key props categories

3. **References loaded**: User asks "Show me a complete LiveTable example with sorting and pagination"
   - Expected: Agent provides full example from connected-components.md

## Example Content Snippets

### Example 1: LiveTable Complete Example

```markdown
## LiveTable Component

### Overview

`LiveTable` is a powerful data table component that integrates with Relay to display lists of data with built-in sorting, filtering, pagination, and real-time updates. It handles loading states, empty states, and error states automatically.

**Import**: `import { LiveTable } from '@company/yogi'`

**Status**: Stable

**Use Cases**:
- User management tables
- Product catalogs
- Order history
- Any list-based data display with actions

### Required Fragment Structure

LiveTable requires a Relay connection fragment with specific fields:

```tsx
// UserTable.tsx
import { graphql, useFragment } from 'react-relay'
import { LiveTable } from '@company/yogi'
import type { UserTable_query$key } from './__generated__/UserTable_query.graphql'

interface UserTableProps {
  query: UserTable_query$key
}

export function UserTable({ query }: UserTableProps) {
  const data = useFragment(
    graphql`
      fragment UserTable_query on Query
      @argumentDefinitions(
        first: { type: "Int", defaultValue: 20 }
        after: { type: "String" }
        sortBy: { type: "UserSortField", defaultValue: CREATED_AT }
        sortDirection: { type: "SortDirection", defaultValue: DESC }
        filters: { type: "UserFilters" }
      ) {
        users(
          first: $first
          after: $after
          sortBy: $sortBy
          sortDirection: $sortDirection
          filters: $filters
        ) @connection(key: "UserTable_users") {
          edges {
            node {
              id
              ...UserTable_user
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
          totalCount
        }
      }
    `,
    query
  )

  return (
    <LiveTable
      connection={data.users}
      columns={userColumns}
      sortable
      paginated
    />
  )
}
```

### Column Configuration

Columns are defined with type-safe configuration:

```tsx
import { type LiveTableColumn } from '@company/yogi'
import type { UserTable_user$key } from './__generated__/UserTable_user.graphql'

const userColumns: LiveTableColumn<UserTable_user$key>[] = [
  {
    key: 'name',
    header: 'Name',
    sortKey: 'NAME',
    cell: (userRef) => {
      const user = useFragment(
        graphql`
          fragment UserTable_user on User {
            id
            name
            email
            avatarUrl
          }
        `,
        userRef
      )

      return (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={user.avatarUrl} alt={user.name} size="sm" />
          <Box>
            <Text weight="medium">{user.name}</Text>
            <Text size="sm" color="muted">{user.email}</Text>
          </Box>
        </Box>
      )
    },
    width: '300px',
  },
  {
    key: 'role',
    header: 'Role',
    sortKey: 'ROLE',
    cell: (userRef) => {
      const user = useFragment(
        graphql`
          fragment UserTable_user_role on User {
            role
          }
        `,
        userRef
      )

      return <Badge variant="primary">{user.role}</Badge>
    },
    width: '150px',
  },
  {
    key: 'status',
    header: 'Status',
    sortKey: 'STATUS',
    cell: (userRef) => {
      const user = useFragment(
        graphql`
          fragment UserTable_user_status on User {
            isActive
          }
        `,
        userRef
      )

      return (
        <Badge variant={user.isActive ? 'success' : 'secondary'}>
          {user.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    width: '120px',
  },
  {
    key: 'createdAt',
    header: 'Joined',
    sortKey: 'CREATED_AT',
    cell: (userRef) => {
      const user = useFragment(
        graphql`
          fragment UserTable_user_createdAt on User {
            createdAt
          }
        `,
        userRef
      )

      return (
        <Text size="sm">
          {format(new Date(user.createdAt), 'MMM d, yyyy')}
        </Text>
      )
    },
    width: '150px',
  },
]
```

### Row Actions

Add actions to each row:

```tsx
<LiveTable
  connection={data.users}
  columns={userColumns}
  rowActions={(userRef) => {
    const user = useFragment(
      graphql`
        fragment UserTable_user_actions on User {
          id
          name
        }
      `,
      userRef
    )

    return [
      {
        label: 'Edit',
        icon: <EditIcon />,
        onClick: () => navigate(`/users/${user.id}/edit`),
      },
      {
        label: 'View Profile',
        icon: <UserIcon />,
        onClick: () => navigate(`/users/${user.id}`),
      },
      {
        label: 'Delete',
        icon: <TrashIcon />,
        variant: 'danger',
        onClick: () => handleDelete(user.id),
        confirm: {
          title: 'Delete User',
          message: `Are you sure you want to delete ${user.name}?`,
        },
      },
    ]
  }}
/>
```

### Sorting

Enable sorting with the `sortable` prop. LiveTable automatically handles sort state:

```tsx
<LiveTable
  connection={data.users}
  columns={userColumns}
  sortable
  defaultSort={{
    key: 'CREATED_AT',
    direction: 'DESC',
  }}
  onSortChange={(sortKey, direction) => {
    // Optional callback for analytics
    analytics.track('table_sorted', { sortKey, direction })
  }}
/>
```

Each column's `sortKey` must match a value from the GraphQL enum `UserSortField`.

### Filtering

Add filters with the filter prop:

```tsx
<LiveTable
  connection={data.users}
  columns={userColumns}
  filters={[
    {
      key: 'role',
      label: 'Role',
      type: 'select',
      options: [
        { label: 'Admin', value: 'ADMIN' },
        { label: 'Member', value: 'MEMBER' },
        { label: 'Guest', value: 'GUEST' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      type: 'select',
      options: [
        { label: 'Active', value: 'true' },
        { label: 'Inactive', value: 'false' },
      ],
    },
    {
      key: 'search',
      label: 'Search',
      type: 'text',
      placeholder: 'Search by name or email...',
    },
  ]}
  onFilterChange={(filters) => {
    // Filters are automatically applied to the query
    // Optional callback for analytics
    analytics.track('table_filtered', { filters })
  }}
/>
```

### Pagination

Enable pagination with the `paginated` prop:

```tsx
<LiveTable
  connection={data.users}
  columns={userColumns}
  paginated
  pageSize={20}
  pageSizeOptions={[10, 20, 50, 100]}
/>
```

LiveTable automatically uses the connection's `pageInfo` to show/hide pagination controls.

### Row Selection

Enable row selection for bulk actions:

```tsx
function UserTableWithBulkActions({ query }: UserTableProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  return (
    <>
      {selectedUserIds.length > 0 && (
        <Box mb={4} display="flex" gap={2}>
          <Text>{selectedUserIds.length} users selected</Text>
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleBulkEdit(selectedUserIds)}
          >
            Edit Selected
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleBulkDelete(selectedUserIds)}
          >
            Delete Selected
          </Button>
        </Box>
      )}

      <LiveTable
        connection={data.users}
        columns={userColumns}
        selectable
        selectedIds={selectedUserIds}
        onSelectionChange={setSelectedUserIds}
      />
    </>
  )
}
```

### Empty State

Customize the empty state:

```tsx
<LiveTable
  connection={data.users}
  columns={userColumns}
  emptyState={
    <Box py={8} textAlign="center">
      <UsersIcon size="lg" color="muted" />
      <Heading size="md" mt={4}>No users found</Heading>
      <Text color="muted" mt={2}>
        Get started by inviting your first user.
      </Text>
      <Button variant="primary" mt={4} onClick={openInviteModal}>
        Invite User
      </Button>
    </Box>
  }
/>
```

### Loading State

Loading state is handled automatically, but you can customize it:

```tsx
<LiveTable
  connection={data.users}
  columns={userColumns}
  loadingRows={10}  // Number of skeleton rows to show
/>
```

### Complete Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| connection | Connection<T> | required | Relay connection data |
| columns | Column<T>[] | required | Column configuration |
| sortable | boolean | false | Enable sorting |
| defaultSort | SortConfig | - | Initial sort state |
| onSortChange | (key, dir) => void | - | Sort change callback |
| filters | Filter[] | [] | Filter configuration |
| onFilterChange | (filters) => void | - | Filter change callback |
| paginated | boolean | false | Enable pagination |
| pageSize | number | 20 | Items per page |
| pageSizeOptions | number[] | [10,20,50] | Page size options |
| selectable | boolean | false | Enable row selection |
| selectedIds | string[] | [] | Selected row IDs |
| onSelectionChange | (ids) => void | - | Selection callback |
| rowActions | (ref) => Action[] | - | Row action menu |
| emptyState | ReactNode | default | Custom empty state |
| loadingRows | number | 5 | Skeleton row count |
| onRowClick | (ref) => void | - | Row click handler |
| expandable | boolean | false | Enable expandable rows |
| renderExpanded | (ref) => Node | - | Expanded row content |

```

### Example 2: ConnectedDropdown with Custom Rendering

```markdown
## ConnectedDropdown Component

### Overview

`ConnectedDropdown` is a select input component that fetches its options via Relay and handles loading states automatically.

**Import**: `import { ConnectedDropdown } from '@company/yogi'`

**Status**: Stable

### Basic Usage

```tsx
// ProjectSelector.tsx
import { graphql, useFragment } from 'react-relay'
import { ConnectedDropdown } from '@company/yogi'
import type { ProjectSelector_query$key } from './__generated__/ProjectSelector_query.graphql'

interface ProjectSelectorProps {
  query: ProjectSelector_query$key
  value: string | null
  onChange: (projectId: string) => void
}

export function ProjectSelector({ query, value, onChange }: ProjectSelectorProps) {
  const data = useFragment(
    graphql`
      fragment ProjectSelector_query on Query {
        projects {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    `,
    query
  )

  return (
    <ConnectedDropdown
      label="Select Project"
      options={data.projects.edges.map((edge) => edge.node)}
      value={value}
      onChange={onChange}
      getOptionLabel={(project) => project.name}
      getOptionValue={(project) => project.id}
    />
  )
}
```

### Custom Option Rendering

Render rich options with avatars, descriptions, etc.:

```tsx
// UserSelector.tsx
export function UserSelector({ query, value, onChange }: UserSelectorProps) {
  const data = useFragment(
    graphql`
      fragment UserSelector_query on Query {
        users {
          edges {
            node {
              id
              name
              email
              avatarUrl
              role
            }
          }
        }
      }
    `,
    query
  )

  return (
    <ConnectedDropdown
      label="Assign to User"
      options={data.users.edges.map((edge) => edge.node)}
      value={value}
      onChange={onChange}
      getOptionLabel={(user) => user.name}
      getOptionValue={(user) => user.id}
      renderOption={(user) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={user.avatarUrl} size="sm" />
          <Box flex={1}>
            <Text weight="medium">{user.name}</Text>
            <Text size="sm" color="muted">{user.email}</Text>
          </Box>
          <Badge size="sm">{user.role}</Badge>
        </Box>
      )}
      renderValue={(user) => (
        <Box display="flex" alignItems="center" gap={2}>
          <Avatar src={user.avatarUrl} size="xs" />
          <Text>{user.name}</Text>
        </Box>
      )}
    />
  )
}
```

### Multi-Select

Enable multi-select mode:

```tsx
<ConnectedDropdown
  label="Select Tags"
  options={data.tags.edges.map((edge) => edge.node)}
  value={selectedTags}  // string[]
  onChange={setSelectedTags}
  multiple
  getOptionLabel={(tag) => tag.name}
  getOptionValue={(tag) => tag.id}
  placeholder="Select one or more tags..."
/>
```

### With Search/Filter

Add search functionality:

```tsx
<ConnectedDropdown
  label="Select Country"
  options={data.countries.edges.map((edge) => edge.node)}
  value={value}
  onChange={onChange}
  searchable
  searchPlaceholder="Search countries..."
  getOptionLabel={(country) => country.name}
  getOptionValue={(country) => country.code}
  filterOption={(country, searchValue) => {
    return country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
           country.code.toLowerCase().includes(searchValue.toLowerCase())
  }}
/>
```

### Loading State

Loading state is automatic when using with Suspense:

```tsx
<Suspense fallback={<ConnectedDropdown.Skeleton label="Select Project" />}>
  <ProjectSelector query={data} value={value} onChange={onChange} />
</Suspense>
```
```

### Example 3: When to Use Yogi vs. Custom Components

```markdown
## Choosing Between Yogi and Custom Components

### Use Yogi When...

1. **Standard data table with CRUD operations**
   ```
   ✅ User list with edit/delete actions
   ✅ Product catalog with filters and sorting
   ✅ Order history with pagination
   ```

2. **Form inputs that need data from GraphQL**
   ```
   ✅ Project selector dropdown
   ✅ User assignment autocomplete
   ✅ Category multi-select
   ```

3. **Search with standard results display**
   ```
   ✅ Product search
   ✅ User search
   ✅ Document search
   ```

4. **You want to move fast**
   - Yogi handles loading states, error states, pagination, sorting automatically
   - Less code to write and maintain
   - Consistent UX across the application

### Build Custom Component When...

1. **Highly custom UI that doesn't match Yogi's patterns**
   ```
   ❌ Kanban board (use custom with usePaginationFragment)
   ❌ Calendar view (use custom with useFragment)
   ❌ Graph visualization (use custom with useFragment)
   ```

2. **Complex interactions Yogi doesn't support**
   ```
   ❌ Drag-and-drop reordering
   ❌ Inline editing with auto-save
   ❌ Complex nested relationships
   ```

3. **Performance-critical rendering**
   ```
   ❌ Virtual scrolling with 10,000+ items
   ❌ Real-time updates every 100ms
   ❌ Complex calculations on every row
   ```
   Note: Yogi has good performance, but for extreme cases, custom optimization may be needed.

4. **Design requires significant deviation from Picnic**
   - Yogi components are styled with Picnic
   - If your design doesn't match Picnic, customization becomes complex
   - Better to build custom with Relay + Picnic primitives

### Hybrid Approach

You can use Yogi for some parts and custom for others:

```tsx
// Use LiveTable for the main list
<LiveTable
  connection={data.products}
  columns={productColumns}
  // Custom cell renderer for complex column
  columns={[
    ...standardColumns,
    {
      key: 'inventory',
      header: 'Inventory',
      cell: (productRef) => (
        <CustomInventoryCell product={productRef} />  // Custom component
      ),
    },
  ]}
/>
```

### Decision Matrix

| Requirement | Yogi | Custom |
|-------------|------|--------|
| Standard table with sorting/filtering | ✅ | - |
| Form dropdown/autocomplete | ✅ | - |
| Matches Picnic design system | ✅ | ✅ |
| Need custom UI layout | - | ✅ |
| Drag-and-drop | - | ✅ |
| Virtual scrolling (10k+ items) | - | ✅ |
| Real-time updates (<1s) | ✅ | ✅ |
| Custom cell rendering | ✅ | ✅ |
| Development speed | ✅ | - |
| Maximum flexibility | - | ✅ |
```
