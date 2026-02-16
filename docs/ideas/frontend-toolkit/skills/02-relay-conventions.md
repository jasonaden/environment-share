# Skill Plan: Relay Conventions

## Purpose and Scope

This skill provides comprehensive knowledge of Relay GraphQL patterns and conventions used across the organization's React applications. It enables agents to:

- Understand fragment colocation and data-driven component patterns
- Design efficient GraphQL queries and mutations
- Apply correct naming conventions for fragments and queries
- Implement proper cache update strategies
- Handle pagination, optimistic updates, and error states
- Follow connection patterns for lists and relationships
- Understand the relationship between Relay fragments and TypeScript types
- Know when to use useFragment vs. useLazyLoadQuery vs. useMutation
- Implement proper data dependencies and fetch policies

The skill covers the full Relay workflow from schema design to runtime data management, emphasizing the organization's specific conventions built on top of Relay's best practices.

## Trigger Description

```yaml
description: >
  This skill provides comprehensive knowledge of Relay GraphQL patterns and conventions,
  including fragment colocation, query design, mutations, cache strategies, and naming conventions.
  This skill should be used when the user asks to create Relay fragments, write GraphQL queries,
  implement mutations, fetch data with Relay, use useFragment or useLazyLoadQuery hooks,
  design data dependencies, handle pagination, or work with the GraphQL schema.
```

## SKILL.md Specification

Target length: 2000 words

### Section 1: Introduction to Relay at [Company] (250 words)
- Overview of Relay as the data layer
- Why Relay: type safety, performance, colocation
- Relationship to backend GraphQL API
- Schema evolution and versioning
- Generated types and relay-compiler
- Development workflow (schema updates, codegen)

### Section 2: Fragment Colocation (400 words)
- Core principle: fragments colocated with components
- Fragment naming convention: `ComponentName_propName`
- Fragment composition: child fragments in parent queries
- useFragment hook usage
- Type safety with generated types
- Fragment keys and refs
- When to create fragments vs. inline fields
- Spreading child fragments
- @relay directives (@arguments, @argumentDefinitions)

### Section 3: Query Design Principles (350 words)
- When to use useLazyLoadQuery vs. useQueryLoader
- Query naming convention: `ComponentNameQuery`
- Query variables and input types
- Fetch policies (store-or-network, network-only, store-only)
- Error handling and loading states
- Query fragments composition
- Root fields vs. nested queries
- Variables validation and typing

### Section 4: Mutation Patterns (400 words)
- useMutation hook usage
- Mutation naming convention: `ComponentNameMutation`
- Optimistic updates
- Updater functions for cache updates
- Connection updates (append, prepend, delete)
- Error handling in mutations
- Success callbacks and side effects
- Mutation variables typing
- Rollback on error

### Section 5: Connection Patterns (300 words)
- Relay connection specification
- Pagination with usePaginationFragment
- Forward vs. backward pagination
- Page size conventions
- hasNextPage/hasPreviousPage
- loadNext/loadPrevious
- Infinite scroll implementation
- Connection edge and node structure

### Section 6: Cache Strategy and Updates (200 words)
- Relay store architecture
- Normalized cache with global IDs
- Cache eviction and garbage collection
- Refetch queries after mutations
- Connection edge insertion/deletion
- Invalidating stale data
- Store updates best practices

### Section 7: Advanced Patterns (100 words)
- Deferred data with @defer
- Streamed data with @stream
- Client-side schema extensions
- Local state management
- Subscription patterns

## Reference Files

### fragment-patterns.md
**Purpose**: Complete catalog of fragment patterns with examples

**Estimated size**: 4,000-5,000 lines

**Outline**:
1. **Basic Fragment Pattern** (300 lines)
   - Simple fragment with primitive fields
   - Fragment naming
   - useFragment hook
   - Generated types usage

2. **Nested Fragment Pattern** (400 lines)
   - Parent fragment spreading child fragments
   - Fragment composition
   - Type propagation
   - Multiple child fragments

3. **Fragment with Arguments** (500 lines)
   - @argumentDefinitions usage
   - @arguments on fields
   - Passing variables from parent
   - Type-safe argument handling

4. **Conditional Fragments** (300 lines)
   - @include and @skip directives
   - Conditional field selection
   - Type narrowing with conditions

5. **Connection Fragment Pattern** (800 lines)
   - usePaginationFragment
   - Connection structure
   - Edge and node access
   - Pagination variables
   - Loading more items
   - Infinite scroll example

6. **Refetchable Fragment Pattern** (500 lines)
   - useRefetchableFragment
   - @refetchable directive
   - Refetch with new variables
   - Loading states during refetch

7. **Fragment Masking** (400 lines)
   - Data masking principle
   - Preventing data access without fragments
   - Type safety benefits
   - Common pitfalls

8. **Real-World Examples** (800 lines)
   - User profile fragment
   - Product list fragment
   - Comment thread fragment
   - Dashboard widget fragments

### query-patterns.md
**Purpose**: Complete catalog of query patterns and best practices

**Estimated size**: 3,500-4,000 lines

**Outline**:
1. **Basic Query Pattern** (400 lines)
   - useLazyLoadQuery usage
   - Query naming
   - Variables typing
   - Loading and error handling

2. **Preloaded Query Pattern** (500 lines)
   - useQueryLoader + usePreloadedQuery
   - Early query execution
   - Code splitting with queries
   - Route-based preloading

3. **Query with Nested Fragments** (400 lines)
   - Composing fragments in queries
   - Passing data to child components
   - Type flow from query to fragments

4. **Parameterized Queries** (500 lines)
   - Query variables
   - Input object types
   - Variable validation
   - Default values

5. **Error Handling Patterns** (400 lines)
   - Network errors
   - GraphQL errors
   - Error boundaries
   - Retry logic
   - User-facing error messages

6. **Fetch Policy Usage** (300 lines)
   - store-or-network (default)
   - network-only (fresh data)
   - store-only (cache-only)
   - When to use each policy

7. **Real-World Query Examples** (1,000 lines)
   - Dashboard query
   - User settings query
   - Search results query
   - Detail page query

### schema-reference.md
**Purpose**: Organization's GraphQL schema documentation and conventions

**Estimated size**: 6,000-8,000 lines

**Outline**:
1. **Schema Overview** (300 lines)
   - Root query type
   - Root mutation type
   - Node interface
   - Connection patterns

2. **Node Types** (2,000 lines)
   - User type
   - Product type
   - Order type
   - Organization type
   - [All major domain types]
   - Fields, arguments, relationships

3. **Connection Types** (1,000 lines)
   - UserConnection
   - ProductConnection
   - Edge types
   - PageInfo
   - Cursor-based pagination

4. **Input Types** (1,500 lines)
   - CreateUserInput
   - UpdateProductInput
   - Filter inputs
   - Sort inputs
   - Validation rules

5. **Mutation Types** (1,500 lines)
   - Create mutations
   - Update mutations
   - Delete mutations
   - Payload types
   - Error types

6. **Custom Scalars** (200 lines)
   - DateTime
   - JSON
   - Upload
   - URL

7. **Enums** (500 lines)
   - UserRole
   - OrderStatus
   - ProductCategory
   - SortDirection

8. **Directives** (200 lines)
   - Custom directives
   - Usage patterns

## Used By Agents

- **relay-architect**: Designs data fetching strategies and query structure
- **component-builder**: Implements fragments and queries in components
- **frontend-reviewer**: Validates Relay pattern compliance

## Dependencies

- **react-patterns**: Understanding hooks and component patterns
- **typescript-strict**: Proper typing of generated Relay types

## Skills to Load When Building

- `plugin-dev:skill-development` (required for skill creation)

## Validation Criteria

### Should Trigger (3 test queries)

1. "How do I create a Relay fragment for the UserProfile component?"
2. "What's the correct way to implement pagination with Relay connections?"
3. "How do I update the cache after a mutation that adds an item to a list?"

### Should NOT Trigger (2 test queries)

1. "Which Picnic component should I use for this UI?" (picnic-components)
2. "How do I write a test for this component?" (testing-conventions)

### Progressive Disclosure Test

1. **Frontmatter only**: User asks "Should I use a Relay fragment here?"
   - Expected: Agent confirms fragments should be used for data dependencies

2. **SKILL.md loaded**: User asks "What's the naming convention for fragments?"
   - Expected: Agent provides `ComponentName_propName` convention with example

3. **References loaded**: User asks "Show me a complete example of a paginated fragment"
   - Expected: Agent provides full usePaginationFragment example from fragment-patterns.md

## Example Content Snippets

### Example 1: Fragment Colocation Pattern

```markdown
## Fragment Colocation Pattern

The core principle of Relay at [Company] is that every component declares its data dependencies using fragments, and these fragments are colocated with the component code.

### Basic Fragment Example

```tsx
// UserAvatar.tsx
import { graphql, useFragment } from 'react-relay'
import type { UserAvatar_user$key } from './__generated__/UserAvatar_user.graphql'

interface UserAvatarProps {
  user: UserAvatar_user$key
}

export function UserAvatar({ user }: UserAvatarProps) {
  const data = useFragment(
    graphql`
      fragment UserAvatar_user on User {
        id
        name
        avatarUrl
      }
    `,
    user
  )

  return (
    <img
      src={data.avatarUrl}
      alt={data.name}
      className="rounded-full"
    />
  )
}
```

### Fragment Naming Convention

**Required pattern**: `ComponentName_propName`

- **ComponentName**: The component file name (PascalCase)
- **propName**: The prop name receiving the fragment data (camelCase)

**Examples**:
- `UserAvatar_user` - fragment for `user` prop in UserAvatar component
- `ProductCard_product` - fragment for `product` prop in ProductCard component
- `CommentList_comments` - fragment for `comments` prop in CommentList component

**Why this naming?**
- Unique fragment names prevent collisions
- IDE autocomplete works better
- Clear which component owns the fragment
- Generated types follow the same pattern

### Fragment Composition (Parent-Child)

When a parent component renders child components that need data, the parent spreads the child fragments:

```tsx
// UserProfile.tsx (parent)
import { graphql, useFragment } from 'react-relay'
import { UserAvatar } from './UserAvatar'
import { UserBio } from './UserBio'
import type { UserProfile_user$key } from './__generated__/UserProfile_user.graphql'

interface UserProfileProps {
  user: UserProfile_user$key
}

export function UserProfile({ user }: UserProfileProps) {
  const data = useFragment(
    graphql`
      fragment UserProfile_user on User {
        id
        name
        email
        # Spread child fragments
        ...UserAvatar_user
        ...UserBio_user
      }
    `,
    user
  )

  return (
    <div>
      <UserAvatar user={data} />
      <h1>{data.name}</h1>
      <UserBio user={data} />
    </div>
  )
}
```

**Key points**:
- Parent fragment spreads child fragments with `...`
- Parent can access its own fields (`name`, `email`)
- Child fragments are masked - parent cannot access child fields
- Type-safe props: `user={data}` passes fragment ref to child

### Fragment with Arguments

Use `@argumentDefinitions` and `@arguments` for parameterized fragments:

```tsx
// ProductImage.tsx
import { graphql, useFragment } from 'react-relay'
import type { ProductImage_product$key } from './__generated__/ProductImage_product.graphql'

interface ProductImageProps {
  product: ProductImage_product$key
  size?: 'small' | 'medium' | 'large'
}

export function ProductImage({ product, size = 'medium' }: ProductImageProps) {
  const data = useFragment(
    graphql`
      fragment ProductImage_product on Product
      @argumentDefinitions(
        size: { type: "ImageSize", defaultValue: MEDIUM }
      ) {
        id
        name
        image(size: $size) {
          url
          width
          height
        }
      }
    `,
    product
  )

  return (
    <img
      src={data.image.url}
      width={data.image.width}
      height={data.image.height}
      alt={data.name}
    />
  )
}
```

**Parent usage**:
```tsx
// Parent component spreading the fragment
const data = useFragment(
  graphql`
    fragment ProductCard_product on Product {
      ...ProductImage_product @arguments(size: LARGE)
    }
  `,
  product
)

return <ProductImage product={data} size="large" />
```

### Type Safety with Generated Types

After running `relay-compiler`, types are generated for every fragment:

```tsx
// __generated__/UserAvatar_user.graphql.ts
export type UserAvatar_user$data = {
  readonly id: string
  readonly name: string
  readonly avatarUrl: string | null
}

export type UserAvatar_user$key = {
  readonly " $data"?: UserAvatar_user$data
  readonly " $fragmentSpreads": FragmentRefs<"UserAvatar_user">
}
```

**Usage**:
- `UserAvatar_user$key`: Type for the fragment ref prop
- `UserAvatar_user$data`: Type for the resolved data from useFragment

This ensures:
- Props are correctly typed
- Fields are auto-completed
- Type errors if schema changes
```

### Example 2: Mutation with Cache Update

```markdown
## Mutation Pattern with Cache Update

### Adding Item to Connection

When a mutation creates a new item that should appear in a list, you need to update the connection in the Relay store:

```tsx
// CreateProductButton.tsx
import { graphql, useMutation } from 'react-relay'
import type { CreateProductButtonMutation } from './__generated__/CreateProductButtonMutation.graphql'

export function CreateProductButton() {
  const [commit, isInFlight] = useMutation<CreateProductButtonMutation>(
    graphql`
      mutation CreateProductButtonMutation(
        $input: CreateProductInput!
        $connections: [ID!]!
      ) {
        createProduct(input: $input) {
          productEdge @prependEdge(connections: $connections) {
            node {
              id
              name
              price
              ...ProductCard_product
            }
          }
          errors {
            field
            message
          }
        }
      }
    `
  )

  const handleCreate = () => {
    commit({
      variables: {
        input: {
          name: 'New Product',
          price: 999,
        },
        connections: ['client:root:products_connection'],
      },
      onCompleted: (response) => {
        if (response.createProduct.errors.length > 0) {
          // Handle errors
          console.error(response.createProduct.errors)
        } else {
          // Success - item automatically added to connection
          console.log('Product created!')
        }
      },
      onError: (error) => {
        // Handle network error
        console.error('Network error:', error)
      },
    })
  }

  return (
    <Button onClick={handleCreate} loading={isInFlight}>
      Create Product
    </Button>
  )
}
```

### Mutation Naming Convention

**Pattern**: `ComponentNameMutation` or `ComponentName_actionMutation`

Examples:
- `CreateProductButtonMutation`
- `UpdateUserProfile_saveChangesMutation`
- `DeleteComment_confirmDeleteMutation`

### Optimistic Update

Show the change immediately before server responds:

```tsx
const [commit, isInFlight] = useMutation<UpdateProductNameMutation>(
  graphql`
    mutation UpdateProductNameMutation($input: UpdateProductInput!) {
      updateProduct(input: $input) {
        product {
          id
          name
        }
        errors {
          field
          message
        }
      }
    }
  `
)

const handleUpdate = (newName: string) => {
  commit({
    variables: {
      input: {
        id: productId,
        name: newName,
      },
    },
    optimisticResponse: {
      updateProduct: {
        product: {
          id: productId,
          name: newName,
        },
        errors: [],
      },
    },
    onCompleted: (response) => {
      if (response.updateProduct.errors.length > 0) {
        // Optimistic update will be rolled back automatically
        showError('Failed to update name')
      }
    },
  })
}
```

### Manual Cache Update with Updater

For complex cache updates, use the updater function:

```tsx
const [commit, isInFlight] = useMutation<DeleteProductMutation>(
  graphql`
    mutation DeleteProductMutation($input: DeleteProductInput!) {
      deleteProduct(input: $input) {
        deletedProductId
        errors {
          message
        }
      }
    }
  `
)

const handleDelete = () => {
  commit({
    variables: {
      input: {
        id: productId,
      },
    },
    updater: (store) => {
      const deletedId = store.getRootField('deleteProduct')
        .getValue('deletedProductId')

      // Remove from connection
      const connection = ConnectionHandler.getConnection(
        store.getRoot(),
        'ProductList_products_connection'
      )

      if (connection) {
        ConnectionHandler.deleteNode(connection, deletedId)
      }

      // Delete the record from store
      store.delete(deletedId)
    },
    onCompleted: (response) => {
      if (response.deleteProduct.errors.length === 0) {
        showSuccess('Product deleted')
      }
    },
  })
}
```

### Error Handling Pattern

Always handle both GraphQL errors (business logic) and network errors:

```tsx
commit({
  variables: { input },
  onCompleted: (response) => {
    // Check for GraphQL errors (validation, business logic)
    if (response.createProduct.errors.length > 0) {
      const fieldErrors = response.createProduct.errors.reduce(
        (acc, error) => ({
          ...acc,
          [error.field]: error.message,
        }),
        {}
      )
      setFormErrors(fieldErrors)
      return
    }

    // Success
    showSuccess('Product created successfully')
    navigate(`/products/${response.createProduct.product.id}`)
  },
  onError: (error) => {
    // Network error, server error, or unexpected error
    console.error('Mutation failed:', error)
    showError('Failed to create product. Please try again.')
  },
})
```
```

### Example 3: Pagination Pattern

```markdown
## Pagination with usePaginationFragment

### Connection Fragment Setup

```tsx
// ProductList.tsx
import { graphql, usePaginationFragment } from 'react-relay'
import type { ProductList_query$key } from './__generated__/ProductList_query.graphql'
import type { ProductListPaginationQuery } from './__generated__/ProductListPaginationQuery.graphql'

interface ProductListProps {
  query: ProductList_query$key
}

export function ProductList({ query }: ProductListProps) {
  const {
    data,
    loadNext,
    loadPrevious,
    hasNext,
    hasPrevious,
    isLoadingNext,
    isLoadingPrevious,
  } = usePaginationFragment<ProductListPaginationQuery, ProductList_query$key>(
    graphql`
      fragment ProductList_query on Query
      @refetchable(queryName: "ProductListPaginationQuery")
      @argumentDefinitions(
        first: { type: "Int", defaultValue: 20 }
        after: { type: "String" }
        filters: { type: "ProductFilters" }
      ) {
        products(first: $first, after: $after, filters: $filters)
          @connection(key: "ProductList_products") {
          edges {
            node {
              id
              ...ProductCard_product
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `,
    query
  )

  const handleLoadMore = () => {
    if (isLoadingNext || !hasNext) return
    loadNext(20) // Load 20 more items
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {data.products.edges.map((edge) => (
          <ProductCard key={edge.node.id} product={edge.node} />
        ))}
      </div>

      {hasNext && (
        <Button
          onClick={handleLoadMore}
          loading={isLoadingNext}
          className="mt-4"
        >
          Load More
        </Button>
      )}
    </div>
  )
}
```

### Parent Query

The parent component must provide the initial query:

```tsx
// ProductsPage.tsx
import { graphql, useLazyLoadQuery } from 'react-relay'
import { ProductList } from './ProductList'
import type { ProductsPageQuery } from './__generated__/ProductsPageQuery.graphql'

export function ProductsPage() {
  const data = useLazyLoadQuery<ProductsPageQuery>(
    graphql`
      query ProductsPageQuery($filters: ProductFilters) {
        ...ProductList_query @arguments(filters: $filters)
      }
    `,
    {
      filters: {
        category: 'ELECTRONICS',
        inStock: true,
      },
    }
  )

  return <ProductList query={data} />
}
```

### Infinite Scroll Implementation

```tsx
import { useEffect, useRef } from 'react'
import { usePaginationFragment } from 'react-relay'

export function ProductListInfinite({ query }: ProductListProps) {
  const { data, loadNext, hasNext, isLoadingNext } = usePaginationFragment(
    // ... same fragment as above
  )

  const observerRef = useRef<IntersectionObserver>()
  const sentinelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isLoadingNext || !hasNext) return

    observerRef.current = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        loadNext(20)
      }
    })

    if (sentinelRef.current) {
      observerRef.current.observe(sentinelRef.current)
    }

    return () => {
      observerRef.current?.disconnect()
    }
  }, [loadNext, hasNext, isLoadingNext])

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {data.products.edges.map((edge) => (
          <ProductCard key={edge.node.id} product={edge.node} />
        ))}
      </div>

      {hasNext && (
        <div ref={sentinelRef} className="h-10 flex items-center justify-center">
          {isLoadingNext && <Spinner />}
        </div>
      )}
    </div>
  )
}
```

### Key Conventions

1. **@connection directive**: Required for pagination, provides stable connection key
   ```graphql
   @connection(key: "ComponentName_fieldName")
   ```

2. **@refetchable directive**: Generates pagination query
   ```graphql
   @refetchable(queryName: "ComponentNamePaginationQuery")
   ```

3. **Page size**: Default to 20 items, configurable via arguments

4. **Connection key naming**: `ComponentName_fieldName_connection`
```
