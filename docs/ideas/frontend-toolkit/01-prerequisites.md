# Frontend Toolkit Plugin: Prerequisites

## 1. Overview

Before building the `frontend-toolkit` plugin, you must gather or generate reference documents that will populate the 8 skills. These documents encode institutional knowledge about Picnic (component library), Yogi (Relay-connected components), Relay conventions, React patterns, MFE architecture, TypeScript strict mode, testing standards, and Storybook conventions.

This document provides:
1. **Required Reference Documents** — A prioritized list of docs needed
2. **Document Templates** — Structure for each document type
3. **Discovery Guide** — Step-by-step instructions for using Claude Code agents to generate missing docs from codebase analysis
4. **CLAUDE.md Template** — Starter project instructions for the frontend repo

---

## 2. Required Reference Documents

### 2.1 Document Inventory Table

| Document | Purpose | Used By Skills | Priority | Estimated Pages | Source |
|----------|---------|----------------|----------|----------------|--------|
| **Picnic Component Catalog** | API reference for all Picnic components (Button, Card, Modal, Input, etc.) | picnic-components | **P0** | 15-20 | Storybook docs, component source code |
| **Yogi Connected Components Guide** | Usage guide for Yogi components (YogiButton, YogiCard, etc.) and data hooks | yogi-patterns | **P0** | 8-10 | Library README, hook source code |
| **GraphQL Schema Reference** | Schema types, query/mutation signatures, connection patterns | relay-conventions | **P0** | 10-15 | GraphQL schema file, introspection |
| **MFE Architecture Guide** | Module federation config, shell integration, routing patterns | mfe-conventions | **P0** | 6-8 | Architecture docs, Webpack configs |
| **CLAUDE.md for Frontend Repo** | Project overview, directory structure, build commands, conventions | All skills (context) | **P0** | 2-3 | New document (use template below) |
| **React Patterns Doc** | Component structure, hooks guidelines, error boundaries, composition | react-patterns | **P1** | 5-7 | Code review guidelines, senior engineer knowledge |
| **TypeScript Conventions** | Strict mode patterns, null checks, type inference, generics | typescript-strict | **P1** | 4-6 | tsconfig.json + code examples |
| **Testing Standards** | RTL patterns, Relay mocks, coverage thresholds, what to test | testing-conventions | **P1** | 5-7 | Testing guidelines doc, jest.config.js |
| **Storybook Guide** | CSF3 format, controls, decorators (Relay env, theme), best practices | storybook-patterns | **P1** | 4-5 | Storybook config, existing stories |
| **Design Tokens** | Color scales, spacing system, typography, breakpoints | picnic-components | **P2** | 3-4 | Design system Figma, theme.ts |
| **Code Style Guide** | Naming conventions, file organization, import order, linting rules | react-patterns, typescript-strict | **P2** | 2-3 | ESLint config, Prettier config |
| **Build Pipeline Docs** | CI/CD pipeline, deployment process, environment variables | mfe-conventions | **P2** | 3-4 | CI config files, DevOps wiki |

**Priority Levels**:
- **P0**: Must have before building skills (blocking)
- **P1**: Should have for quality skills (can draft with 80% accuracy and iterate)
- **P2**: Nice to have for completeness (can add in later versions)

---

## 3. Document Templates

### 3.1 Picnic Component Catalog

**Purpose**: Comprehensive API reference for all Picnic components.

**Template Structure**:

```markdown
# Picnic Component Catalog

## Overview
Brief description of the Picnic design system (1-2 paragraphs).

## Layout Primitives

### Box
- **Purpose**: Foundational layout component with flex/grid support
- **Props**:
  - `as?: keyof JSX.IntrinsicElements` — HTML element to render (default: 'div')
  - `padding?: Spacing` — Spacing scale: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  - `margin?: Spacing` — Spacing scale (same as padding)
  - `display?: 'flex' | 'grid' | 'block' | 'inline'`
  - `gap?: Spacing` — Gap between children (flex/grid)
- **Example**:
  ```tsx
  <Box padding="md" display="flex" gap="sm">
    <Button>Save</Button>
    <Button variant="secondary">Cancel</Button>
  </Box>
  ```

### Stack
- **Purpose**: Vertical or horizontal layout with consistent spacing
- **Props**:
  - `direction?: 'vertical' | 'horizontal'` — Layout direction (default: 'vertical')
  - `spacing?: Spacing` — Spacing between children
  - `align?: 'start' | 'center' | 'end' | 'stretch'`
- **Example**: [...]

## Form Components

### Button
- **Purpose**: Primary interactive element
- **Props**:
  - `variant?: 'primary' | 'secondary' | 'danger' | 'ghost'` — Visual style
  - `size?: 'sm' | 'md' | 'lg'` — Button size
  - `disabled?: boolean` — Disabled state
  - `loading?: boolean` — Show loading spinner
  - `icon?: React.ReactNode` — Leading icon
  - `onClick?: () => void` — Click handler
- **Example**:
  ```tsx
  <Button variant="primary" size="md" loading={isSubmitting} onClick={handleSave}>
    Save Changes
  </Button>
  ```
- **Accessibility**: Built-in ARIA attributes, focus management, keyboard support

### Input
- **Purpose**: Text input field
- **Props**: [...]
- **Example**: [...]

## Feedback Components

### Modal
- **Props**: [...]
- **Example**: [...]

### Toast
- **Props**: [...]
- **Example**: [...]

## Data Display

### Card
- **Props**: [...]
- **Example**: [...]

### Table
- **Props**: [...]
- **Example**: [...]

## Theming

### Color Scale
- **Primary**: `primary-50` to `primary-900` (9 shades)
- **Neutral**: `neutral-50` to `neutral-900`
- **Semantic**: `success`, `warning`, `danger`, `info`

### Spacing Scale
- `xs`: 4px
- `sm`: 8px
- `md`: 16px
- `lg`: 24px
- `xl`: 32px

### Typography
- **Heading Styles**: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`
- **Body Styles**: `body-lg`, `body-md`, `body-sm`
- **Font Families**: `sans` (Inter), `mono` (Fira Code)

## Import Paths
```tsx
import { Button, Card, Modal, Stack, Box } from '@company/picnic';
```

## Version
Current version: 2.4.1 (last updated: 2025-12-10)
```

**Key Sections**:
1. Overview (context)
2. Component categories (Layout, Form, Feedback, Data Display)
3. Per-component: Props table, example, accessibility notes
4. Theming reference (color, spacing, typography)
5. Import paths, version

---

### 3.2 Yogi Connected Components Guide

**Template Structure**:

```markdown
# Yogi Connected Components Guide

## Overview
Yogi is a library of higher-order components and hooks that connect Picnic UI components to Relay data. It handles common patterns like loading states, error boundaries, pagination, and optimistic updates.

## Philosophy
- **Composition over Configuration**: Yogi components wrap Picnic primitives, not replace them
- **Data Colocation**: Fragments defined alongside Yogi components
- **Type Safety**: Leverages Relay's generated types for full TypeScript inference

## Connected Components

### YogiButton
**Purpose**: Button with built-in mutation handling (loading, error, success states).

**Props**:
- `mutation: GraphQLTaggedNode` — Relay mutation to execute
- `variables: TVariables` — Mutation variables
- `onSuccess?: (response: TResponse) => void` — Success callback
- `onError?: (error: Error) => void` — Error callback
- All `Button` props from Picnic (variant, size, etc.)

**Example**:
```tsx
import { YogiButton } from '@company/yogi';
import { graphql } from 'react-relay';

const SaveUserMutation = graphql`
  mutation SaveUserMutation($input: UpdateUserInput!) {
    updateUser(input: $input) {
      user {
        id
        name
      }
    }
  }
`;

function UserForm() {
  const [name, setName] = useState('');

  return (
    <YogiButton
      mutation={SaveUserMutation}
      variables={{ input: { name } }}
      onSuccess={() => alert('Saved!')}
      variant="primary"
    >
      Save User
    </YogiButton>
  );
}
```

### YogiCard
**Purpose**: Card component with Relay fragment colocation for user/entity data.

**Props**:
- `fragment: TFragmentRef` — Relay fragment reference
- `loading?: boolean` — Show loading skeleton
- All `Card` props from Picnic

**Fragment Convention**:
```tsx
const YogiCard_user = graphql`
  fragment YogiCard_user on User {
    id
    name
    avatarUrl
  }
`;
```

**Example**: [...]

### YogiTable
**Purpose**: Table with built-in pagination, sorting, filtering.

**Props**: [...]
**Example**: [...]

## Data Hooks

### useYogiQuery
**Purpose**: Execute Relay query with loading/error states.

**Signature**:
```typescript
function useYogiQuery<TQuery extends OperationType>(
  query: GraphQLTaggedNode,
  variables: TQuery['variables']
): {
  data: TQuery['response'] | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

**Example**: [...]

### useYogiMutation
**Purpose**: Execute Relay mutation with optimistic updates.

**Signature**:
```typescript
function useYogiMutation<TMutation extends OperationType>(
  mutation: GraphQLTaggedNode
): [
  (variables: TMutation['variables']) => Promise<TMutation['response']>,
  { loading: boolean; error: Error | null }
]
```

**Example**: [...]

### useYogiPagination
**Purpose**: Manage Relay connection pagination (forward, backward).

**Signature**:
```typescript
function useYogiPagination<TConnection>(
  fragmentRef: TConnection
): {
  data: TConnection['edges'];
  loadNext: (count: number) => void;
  loadPrevious: (count: number) => void;
  hasNext: boolean;
  hasPrevious: boolean;
  isLoadingNext: boolean;
  isLoadingPrevious: boolean;
}
```

**Example**: [...]

## Error Handling

Yogi components use `ErrorBoundary` from Picnic to catch GraphQL errors. Default behavior: show inline error message. Custom error UI via `errorFallback` prop.

## Import Paths
```tsx
import { YogiButton, YogiCard, useYogiQuery, useYogiMutation } from '@company/yogi';
```

## Version
Current version: 1.8.2 (last updated: 2026-01-15)
```

---

### 3.3 GraphQL Schema Reference

**Template Structure**:

```markdown
# GraphQL Schema Reference

## Overview
Schema version: v3.2.0 (last updated: 2026-01-10)

## Core Types

### User
```graphql
type User implements Node {
  id: ID!
  email: String!
  name: String
  avatarUrl: String
  createdAt: DateTime!
  updatedAt: DateTime!
  roles: [Role!]!
  posts(first: Int, after: String): PostConnection!
}
```

**Common Fragments**:
- `User_basic`: id, name, avatarUrl
- `User_full`: All fields except posts

### Post
```graphql
type Post implements Node {
  id: ID!
  title: String!
  content: String!
  author: User!
  createdAt: DateTime!
  tags: [Tag!]!
}
```

## Connections (Pagination)

### Connection Pattern
```graphql
type PostConnection {
  edges: [PostEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type PostEdge {
  node: Post!
  cursor: String!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
}
```

**Usage**: Always use `@connection(key: "ComponentName_connection")` directive in fragments.

## Queries

### Query Root
```graphql
type Query {
  viewer: User
  user(id: ID!): User
  post(id: ID!): Post
  posts(first: Int, after: String, filter: PostFilter): PostConnection!
}
```

**Example**:
```graphql
query PostListQuery($first: Int!, $after: String) {
  posts(first: $first, after: $after) {
    edges {
      node {
        id
        title
        author {
          name
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
```

## Mutations

### Mutation Root
```graphql
type Mutation {
  createPost(input: CreatePostInput!): CreatePostPayload!
  updatePost(input: UpdatePostInput!): UpdatePostPayload!
  deletePost(input: DeletePostInput!): DeletePostPayload!
}
```

**Example**:
```graphql
mutation CreatePostMutation($input: CreatePostInput!) {
  createPost(input: $input) {
    post {
      id
      title
    }
    errors {
      field
      message
    }
  }
}
```

## Error Handling

**GraphQL Errors**: Returned in `errors` field of mutation payload.

**Network Errors**: Handled by Relay environment (retry, exponential backoff).

## Conventions

1. **Fragment Naming**: `ComponentName_fragmentKey` (e.g., `UserCard_user`)
2. **Connection Keys**: `@connection(key: "ComponentName_connection")`
3. **Input Types**: Always use `input: SomeInput!` pattern for mutations
4. **Payload Types**: Mutations return `SomePayload` with `data`, `errors` fields

## Schema Access

- **Development**: `http://localhost:4000/graphql` (GraphiQL playground)
- **Staging**: `https://api-staging.company.com/graphql`
- **Production**: `https://api.company.com/graphql`

## Schema Updates

Schema changes follow semantic versioning. Breaking changes announced 2 weeks in advance via #frontend-announcements Slack channel.
```

---

### 3.4 MFE Architecture Guide

**Template Structure**:

```markdown
# Micro-Frontend (MFE) Architecture Guide

## Overview

Our frontend codebase is split into multiple micro-frontends (MFEs) using Webpack Module Federation. Each MFE is independently deployable and owned by a specific team.

## MFE Structure

### Shell Application (Host)
- **Path**: `apps/shell/`
- **Purpose**: Top-level router, authentication, global layout (header, sidebar)
- **Exposes**: `<AppShell>` component
- **Consumes**: All MFEs (dashboard, analytics, settings, admin)

### Feature MFEs (Remotes)
- `apps/dashboard/` — Home dashboard (default route)
- `apps/analytics/` — Analytics charts and reports
- `apps/settings/` — User/org settings
- `apps/admin/` — Admin panel (role-gated)

## Module Federation Config

### Shell (Host) Config
```javascript
// apps/shell/webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        dashboard: 'dashboard@http://localhost:3001/remoteEntry.js',
        analytics: 'analytics@http://localhost:3002/remoteEntry.js',
        settings: 'settings@http://localhost:3003/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, requiredVersion: '^18.0.0' },
        'react-dom': { singleton: true, requiredVersion: '^18.0.0' },
        'react-relay': { singleton: true, requiredVersion: '^14.0.0' },
        '@company/picnic': { singleton: true },
        '@company/yogi': { singleton: true },
      },
    }),
  ],
};
```

### Remote MFE Config
```javascript
// apps/dashboard/webpack.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App.tsx',  // Main component
        './routes': './src/routes.tsx',  // Route definitions
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-relay': { singleton: true },
        '@company/picnic': { singleton: true },
        '@company/yogi': { singleton: true },
      },
    }),
  ],
};
```

## Routing

### Shell Router
```tsx
// apps/shell/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';

const DashboardApp = lazy(() => import('dashboard/App'));
const AnalyticsApp = lazy(() => import('analytics/App'));

function App() {
  return (
    <BrowserRouter>
      <AppShell>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path="/" element={<DashboardApp />} />
            <Route path="/analytics/*" element={<AnalyticsApp />} />
            <Route path="/settings/*" element={<SettingsApp />} />
          </Routes>
        </Suspense>
      </AppShell>
    </BrowserRouter>
  );
}
```

### MFE Nested Routes
```tsx
// apps/analytics/src/routes.tsx
import { Routes, Route } from 'react-router-dom';

export function AnalyticsRoutes() {
  return (
    <Routes>
      <Route path="/" element={<AnalyticsHome />} />
      <Route path="/reports" element={<Reports />} />
      <Route path="/charts/:id" element={<ChartDetail />} />
    </Routes>
  );
}
```

## Shared State

### Cross-MFE Communication
- **Relay Store**: Shared singleton (cached queries accessible across MFEs)
- **URL Params**: Pass data via query strings (`/analytics?userId=123`)
- **Custom Events**: `window.dispatchEvent(new CustomEvent('userChanged', { detail: userId }))`

**Anti-pattern**: Do NOT use global variables or localStorage for cross-MFE state (race conditions, stale data).

## Development Workflow

### Running Locally
```bash
# Terminal 1: Start shell
cd apps/shell && npm run dev  # Runs on :3000

# Terminal 2: Start dashboard MFE
cd apps/dashboard && npm run dev  # Runs on :3001

# Terminal 3: Start analytics MFE
cd apps/analytics && npm run dev  # Runs on :3002
```

### Building for Production
```bash
# Build all MFEs
npm run build:mfe  # Builds shell + all remotes

# Deploy individually
cd apps/dashboard && npm run deploy  # Deploys dashboard to CDN
```

## Conventions

1. **MFE Naming**: Lowercase, hyphenated (e.g., `user-settings`, not `UserSettings`)
2. **Exposed Modules**: Always expose `./App` (main component) and `./routes` (route definitions)
3. **Shared Dependencies**: Always use `singleton: true` for React, Relay, Picnic, Yogi
4. **Port Allocation**: Shell (3000), dashboard (3001), analytics (3002), settings (3003), admin (3004)

## Troubleshooting

### "Shared module is not available for eager consumption"
**Cause**: MFE tries to import shared module before Module Federation initializes.
**Fix**: Use dynamic import for entry point:
```tsx
// apps/dashboard/src/bootstrap.tsx (not index.tsx)
import('./App');
```

### "Cannot read property 'call' of undefined"
**Cause**: Version mismatch in shared dependencies.
**Fix**: Ensure all MFEs use same React/Relay versions (check package.json).

## Resources

- [Webpack Module Federation Docs](https://webpack.js.org/concepts/module-federation/)
- [Internal MFE Architecture ADR](https://wiki.company.com/adr-024-mfe-architecture)
```

---

### 3.5 React Patterns Doc

**Template Structure**:

```markdown
# React Patterns & Conventions

## Component Structure

### File Organization
```
components/
├── UserCard/
│   ├── UserCard.tsx          # Component implementation
│   ├── UserCard.test.tsx     # Tests
│   ├── UserCard.stories.tsx  # Storybook stories
│   ├── index.ts              # Re-export component
│   └── types.ts              # Component-specific types (optional)
```

### Component Template
```tsx
import { FC } from 'react';
import { Box, Stack, Text } from '@company/picnic';

interface UserCardProps {
  name: string;
  email: string;
  avatarUrl?: string;
  onEdit?: () => void;
}

export const UserCard: FC<UserCardProps> = ({ name, email, avatarUrl, onEdit }) => {
  return (
    <Box padding="md" borderRadius="md" backgroundColor="neutral-50">
      <Stack spacing="sm">
        {avatarUrl && <img src={avatarUrl} alt={name} />}
        <Text variant="body-lg" weight="bold">{name}</Text>
        <Text variant="body-sm" color="neutral-600">{email}</Text>
        {onEdit && <Button onClick={onEdit}>Edit</Button>}
      </Stack>
    </Box>
  );
};
```

**Conventions**:
- Named exports (not default exports) for components
- Props interface named `{ComponentName}Props`
- Use `FC<Props>` type for functional components
- Optional props suffixed with `?`
- Event handlers prefixed with `on` (e.g., `onEdit`, `onSubmit`)

## Hooks Guidelines

### Custom Hook Template
```tsx
import { useState, useEffect } from 'react';

interface UseUserDataOptions {
  userId: string;
}

export function useUserData({ userId }: UseUserDataOptions) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch logic
  }, [userId]);

  return { data, loading, error };
}
```

**Conventions**:
- Custom hooks prefixed with `use`
- Return object (not array) for hooks with >2 values
- Dependencies array must be exhaustive (ESLint: `exhaustive-deps`)
- Use `useCallback` for event handlers passed to child components
- Use `useMemo` for expensive computations

### Dependency Array Rules
```tsx
// BAD: Missing dependency
useEffect(() => {
  fetchData(userId);
}, []);  // ESLint error: userId not included

// GOOD: All dependencies listed
useEffect(() => {
  fetchData(userId);
}, [userId]);

// GOOD: Callback memoized
const handleClick = useCallback(() => {
  onEdit(userId);
}, [onEdit, userId]);
```

## Error Boundaries

### Pattern
```tsx
import { Component, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <Text>Something went wrong.</Text>;
    }
    return this.props.children;
  }
}
```

**Usage**:
```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <UserProfile userId={userId} />
</ErrorBoundary>
```

## Composition Patterns

### Render Props
```tsx
interface DataFetcherProps<T> {
  url: string;
  children: (data: T | null, loading: boolean) => ReactNode;
}

function DataFetcher<T>({ url, children }: DataFetcherProps<T>) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(url).then(res => res.json()).then(setData).finally(() => setLoading(false));
  }, [url]);

  return <>{children(data, loading)}</>;
}

// Usage
<DataFetcher<User> url="/api/user">
  {(user, loading) => loading ? <Loading /> : <UserCard {...user} />}
</DataFetcher>
```

### Higher-Order Components (Avoid)
**Anti-pattern**: Use hooks instead of HOCs for logic reuse. HOCs acceptable only for legacy code migration.

## Performance Optimization

### Memoization
```tsx
import { memo, useMemo } from 'react';

// Memoize component (prevents re-render if props unchanged)
export const UserCard = memo<UserCardProps>(({ name, email }) => {
  return <Box>...</Box>;
});

// Memoize expensive computation
function UserList({ users }: { users: User[] }) {
  const sortedUsers = useMemo(() => {
    return users.sort((a, b) => a.name.localeCompare(b.name));
  }, [users]);

  return <>{sortedUsers.map(user => <UserCard key={user.id} {...user} />)}</>;
}
```

**When to use**:
- `memo`: Component renders with same props frequently
- `useMemo`: Computation is expensive (sorting large arrays, filtering)
- `useCallback`: Function passed to memoized child components

**When NOT to use**:
- Premature optimization (profile first)
- Simple components (overhead > benefit)

## TypeScript Integration

### Generic Components
```tsx
interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
}

function List<T>({ items, renderItem }: ListProps<T>) {
  return <>{items.map((item, idx) => <div key={idx}>{renderItem(item)}</div>)}</>;
}

// Usage (T inferred as User)
<List items={users} renderItem={(user) => <UserCard {...user} />} />
```

### Discriminated Unions
```tsx
type ButtonState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; message: string }
  | { status: 'error'; error: string };

function SubmitButton({ state }: { state: ButtonState }) {
  if (state.status === 'loading') return <Button loading>Saving...</Button>;
  if (state.status === 'error') return <Button variant="danger">{state.error}</Button>;
  return <Button>Submit</Button>;
}
```

## Resources

- [React Docs (2024)](https://react.dev)
- [TypeScript + React Cheatsheet](https://react-typescript-cheatsheet.netlify.app)
```

---

### 3.6 TypeScript Conventions

**Template Structure**:

```markdown
# TypeScript Strict Mode Conventions

## tsconfig.json

```json
{
  "compilerOptions": {
    "strict": true,                      // Enables all strict checks
    "noImplicitAny": true,               // No implicit 'any' types
    "strictNullChecks": true,            // Null/undefined are not assignable to other types
    "strictFunctionTypes": true,         // Function parameter bivariance
    "strictBindCallApply": true,         // Strict bind/call/apply
    "strictPropertyInitialization": true, // Class properties must be initialized
    "noImplicitThis": true,              // 'this' must have explicit type
    "alwaysStrict": true,                // Emit "use strict"
    "noUnusedLocals": true,              // Error on unused local variables
    "noUnusedParameters": true,          // Error on unused function parameters
    "noImplicitReturns": true,           // All code paths must return a value
    "noFallthroughCasesInSwitch": true   // No fallthrough in switch statements
  }
}
```

## Handling Null/Undefined

### Optional Chaining
```typescript
// BAD: Runtime error if user is null
const name = user.name;

// GOOD: Returns undefined if user is null
const name = user?.name;

// GOOD: Deep chaining
const street = user?.address?.street;
```

### Nullish Coalescing
```typescript
// BAD: Falls back to default if value is 0, '', false
const count = value || 10;

// GOOD: Falls back only if null/undefined
const count = value ?? 10;
```

### Type Guards
```typescript
function greet(user: User | null) {
  if (user === null) {
    return 'Hello, guest';
  }
  // TypeScript knows user is non-null here
  return `Hello, ${user.name}`;
}
```

## Type Inference

### Let vs. Const
```typescript
// BAD: Type widened to string
let status = 'loading';  // Type: string

// GOOD: Type narrowed to literal
const status = 'loading';  // Type: 'loading'

// GOOD: Use 'as const' for object literals
const config = { apiUrl: 'https://api.com' } as const;
// Type: { readonly apiUrl: 'https://api.com' }
```

### Discriminated Unions
```typescript
type Result =
  | { success: true; data: User }
  | { success: false; error: string };

function handleResult(result: Result) {
  if (result.success) {
    console.log(result.data.name);  // TypeScript knows 'data' exists
  } else {
    console.error(result.error);     // TypeScript knows 'error' exists
  }
}
```

### Generic Constraints
```typescript
// BAD: No constraint on T
function getProperty<T>(obj: T, key: string) {
  return obj[key];  // Error: Element implicitly has 'any' type
}

// GOOD: Constrain T to object with index signature
function getProperty<T extends Record<string, unknown>>(obj: T, key: keyof T) {
  return obj[key];  // OK: key is guaranteed to exist on obj
}
```

## Relay Types

### Fragment Refs
```typescript
import { graphql, useFragment } from 'react-relay';
import { UserCard_user$key } from './__generated__/UserCard_user.graphql';

interface UserCardProps {
  user: UserCard_user$key;  // Fragment reference type (opaque)
}

function UserCard({ user }: UserCardProps) {
  const data = useFragment(
    graphql`
      fragment UserCard_user on User {
        name
        email
      }
    `,
    user
  );

  // 'data' type inferred as { name: string; email: string }
  return <Box>{data.name}</Box>;
}
```

### Query Types
```typescript
import { useLazyLoadQuery } from 'react-relay';
import { UserListQuery } from './__generated__/UserListQuery.graphql';

function UserList() {
  const data = useLazyLoadQuery<UserListQuery>(
    graphql`
      query UserListQuery {
        users {
          id
          name
        }
      }
    `,
    {}
  );

  // 'data.users' type inferred as Array<{ id: string; name: string }>
  return <>{data.users.map(user => <UserCard key={user.id} user={user} />)}</>;
}
```

### Connection Types
```typescript
import { usePaginationFragment } from 'react-relay';
import { PostList_query$key } from './__generated__/PostList_query.graphql';

function PostList({ query }: { query: PostList_query$key }) {
  const { data, loadNext, hasNext } = usePaginationFragment(
    graphql`
      fragment PostList_query on Query
      @refetchable(queryName: "PostListPaginationQuery") {
        posts(first: $count, after: $cursor)
        @connection(key: "PostList_posts") {
          edges {
            node {
              id
              title
            }
          }
        }
      }
    `,
    query
  );

  // 'data.posts.edges' type inferred as Array<{ node: { id: string; title: string } }>
  return (
    <>
      {data.posts.edges.map(edge => <PostCard key={edge.node.id} post={edge.node} />)}
      {hasNext && <Button onClick={() => loadNext(10)}>Load More</Button>}
    </>
  );
}
```

## Utility Types

### Pick, Omit, Partial
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}

// Pick specific properties
type PublicUser = Pick<User, 'id' | 'name'>;

// Omit specific properties
type UserWithoutPassword = Omit<User, 'password'>;

// Make all properties optional
type PartialUser = Partial<User>;
```

### Record
```typescript
// Map user IDs to User objects
const userCache: Record<string, User> = {
  'user-1': { id: 'user-1', name: 'Alice', ... },
  'user-2': { id: 'user-2', name: 'Bob', ... },
};
```

## Resources

- [TypeScript Handbook (Strict Mode)](https://www.typescriptlang.org/docs/handbook/2/narrowing.html)
- [Relay TypeScript Guide](https://relay.dev/docs/guides/type-emission/)
```

---

### 3.7 Testing Standards

**Template Structure**:

```markdown
# Testing Standards

## Coverage Thresholds

```json
// jest.config.js
{
  "coverageThresholds": {
    "global": {
      "branches": 80,
      "functions": 80,
      "lines": 80,
      "statements": 80
    }
  }
}
```

## React Testing Library Patterns

### Component Test Template
```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('renders user name and email', () => {
    render(<UserCard name="Alice" email="alice@example.com" />);

    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('alice@example.com')).toBeInTheDocument();
  });

  it('calls onEdit when Edit button clicked', async () => {
    const onEdit = jest.fn();
    render(<UserCard name="Alice" email="alice@example.com" onEdit={onEdit} />);

    await userEvent.click(screen.getByRole('button', { name: /edit/i }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
```

**Conventions**:
- Use `screen` queries (not destructured `{ getByText }`)
- Prefer `getByRole` over `getByTestId`
- Use `async/await` with `userEvent` (not `fireEvent`)
- Assertions use `toBeInTheDocument()`, `toHaveTextContent()`, etc. (jest-dom matchers)

## Relay Mocks

### MockPayloadGenerator
```typescript
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';
import { QueryRenderer } from 'react-relay';
import { UserProfileQuery } from './__generated__/UserProfileQuery.graphql';

describe('UserProfile', () => {
  let environment: ReturnType<typeof createMockEnvironment>;

  beforeEach(() => {
    environment = createMockEnvironment();
  });

  it('renders user profile', () => {
    render(
      <QueryRenderer<UserProfileQuery>
        environment={environment}
        query={graphql`
          query UserProfileQuery {
            user(id: "123") {
              name
              email
            }
          }
        `}
        variables={{}}
        render={({ props }) => props ? <UserProfile user={props.user} /> : null}
      />
    );

    // Resolve query with mock data
    environment.mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        User: () => ({ name: 'Alice', email: 'alice@example.com' }),
      })
    );

    expect(screen.getByText('Alice')).toBeInTheDocument();
  });
});
```

### Custom Resolvers
```typescript
environment.mock.resolveMostRecentOperation((operation) =>
  MockPayloadGenerator.generate(operation, {
    User: (context, generateId) => ({
      id: generateId(),
      name: 'Alice',
      email: 'alice@example.com',
      posts: {
        edges: [
          { node: { id: '1', title: 'Post 1' } },
          { node: { id: '2', title: 'Post 2' } },
        ],
      },
    }),
  })
);
```

## What to Test

### DO Test
- Component renders with required props
- Component handles user interactions (clicks, input changes)
- Component displays correct data from props/state
- Component calls callbacks with correct arguments
- Component handles loading/error states
- Component accessibility (ARIA roles, labels)

### DON'T Test
- Implementation details (state variables, internal functions)
- Third-party library internals (Relay, React Router)
- Styling/layout (use visual regression tests instead)

## Mocking External Dependencies

### API Calls (MSW)
```typescript
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/user/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, name: 'Alice' }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

### Router
```typescript
import { MemoryRouter } from 'react-router-dom';

render(
  <MemoryRouter initialEntries={['/users/123']}>
    <UserProfile />
  </MemoryRouter>
);
```

## Resources

- [React Testing Library Docs](https://testing-library.com/docs/react-testing-library/intro)
- [Relay Test Utils](https://relay.dev/docs/guides/testing-relay-components/)
```

---

### 3.8 Storybook Guide

**Template Structure**:

```markdown
# Storybook Conventions

## CSF3 Format

### Component Story Template
```typescript
// UserCard.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { UserCard } from './UserCard';

const meta: Meta<typeof UserCard> = {
  title: 'Components/UserCard',
  component: UserCard,
  tags: ['autodocs'],
  argTypes: {
    onEdit: { action: 'onEdit' },
  },
};

export default meta;
type Story = StoryObj<typeof UserCard>;

export const Default: Story = {
  args: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    avatarUrl: 'https://via.placeholder.com/150',
  },
};

export const WithoutAvatar: Story = {
  args: {
    name: 'Bob Smith',
    email: 'bob@example.com',
  },
};

export const WithEditHandler: Story = {
  args: {
    name: 'Carol White',
    email: 'carol@example.com',
    onEdit: () => alert('Edit clicked'),
  },
};
```

**Conventions**:
- Story file named `{ComponentName}.stories.tsx`
- `meta.title` follows pattern `Category/ComponentName`
- `tags: ['autodocs']` generates automatic documentation
- Use `argTypes` for action handlers
- Export stories as named exports (PascalCase)

## Controls

### ArgTypes
```typescript
const meta: Meta<typeof Button> = {
  component: Button,
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger', 'ghost'],
      description: 'Button visual style',
    },
    size: {
      control: 'radio',
      options: ['sm', 'md', 'lg'],
    },
    disabled: {
      control: 'boolean',
    },
    onClick: {
      action: 'clicked',
    },
  },
};
```

## Decorators

### Relay Environment Decorator
```typescript
// .storybook/preview.tsx
import { RelayEnvironmentProvider } from 'react-relay';
import { createMockEnvironment } from 'relay-test-utils';

export const decorators = [
  (Story) => {
    const environment = createMockEnvironment();
    return (
      <RelayEnvironmentProvider environment={environment}>
        <Story />
      </RelayEnvironmentProvider>
    );
  },
];
```

### Theme Decorator
```typescript
import { ThemeProvider } from '@company/picnic';

export const decorators = [
  (Story) => (
    <ThemeProvider theme="light">
      <Story />
    </ThemeProvider>
  ),
];
```

## Parameters

### Layout
```typescript
export const FullWidth: Story = {
  parameters: {
    layout: 'fullscreen',  // 'centered' | 'fullscreen' | 'padded'
  },
};
```

### Backgrounds
```typescript
export const DarkMode: Story = {
  parameters: {
    backgrounds: {
      default: 'dark',
    },
  },
};
```

## Mocking Relay Data

```typescript
import { graphql } from 'react-relay';
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';

export const WithRelayData: Story = {
  render: () => {
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        User: () => ({ name: 'Alice', email: 'alice@example.com' }),
      })
    );

    return (
      <RelayEnvironmentProvider environment={environment}>
        <UserCard />
      </RelayEnvironmentProvider>
    );
  },
};
```

## Resources

- [Storybook CSF3 Docs](https://storybook.js.org/docs/react/api/csf)
- [Storybook + Relay Guide](https://storybook.js.org/recipes/relay)
```

---

## 4. Discovery Guide

If reference documents don't exist, use Claude Code agents to explore the codebase and generate initial material.

### 4.1 Picnic Component Catalog

**Goal**: Extract all Picnic component APIs (props, examples) from source code.

**Process**:
1. **Find Picnic components**:
   ```
   /task agent:code-explorer "Find all exported components in the Picnic library (likely in packages/picnic/src/components/). List component names, file paths, and primary props."
   ```

2. **Extract prop types**:
   ```
   /task agent:code-explorer "For each Picnic component (Button, Card, Modal, Input, Stack, Box), extract the TypeScript interface for props. Include JSDoc comments if available."
   ```

3. **Find usage examples**:
   ```
   /task agent:code-explorer "Search the codebase for imports from '@company/picnic' and find 3-5 real-world usage examples for Button, Card, Modal."
   ```

4. **Aggregate into catalog**:
   Create `docs/frontend-toolkit/references/picnic-component-catalog.md` using the template in section 3.1, filling in component APIs from exploration results.

**Validation**: Manually test 2-3 components (import in sandbox, verify props match extracted interface).

---

### 4.2 Yogi Connected Components Guide

**Goal**: Document Yogi components and data hooks (YogiButton, useYogiQuery, etc.).

**Process**:
1. **Find Yogi exports**:
   ```
   /task agent:code-explorer "List all exported components and hooks from @company/yogi (likely in packages/yogi/src/). Categorize into: Connected Components (YogiButton, YogiCard) and Data Hooks (useYogiQuery, useYogiMutation)."
   ```

2. **Extract Relay fragment patterns**:
   ```
   /task agent:code-explorer "For YogiCard, find the GraphQL fragment definition. Show how the fragment is used with useFragment."
   ```

3. **Document hook signatures**:
   ```
   /task agent:code-explorer "For useYogiQuery and useYogiMutation, extract TypeScript signatures (parameters, return types). Find 2 usage examples in the codebase."
   ```

4. **Aggregate into guide**:
   Use template from section 3.2, populate with exploration results.

---

### 4.3 GraphQL Schema Reference

**Goal**: Extract schema types, queries, mutations, connection patterns.

**Process**:
1. **Locate schema file**:
   ```
   /task agent:code-explorer "Find the GraphQL schema file (likely schema.graphql or schema.ts). If using introspection, find the GraphQL endpoint URL."
   ```

2. **Extract core types**:
   ```
   /task agent:code-explorer "List the top 10 most-used GraphQL types in the schema (User, Post, Comment, etc.). For each, show fields and relationships."
   ```

3. **Find connection patterns**:
   ```
   /task agent:code-explorer "Search for GraphQL connection types (UserConnection, PostConnection). Extract PageInfo, edges, node structure."
   ```

4. **Document queries/mutations**:
   ```
   /task agent:code-explorer "List all root Query and Mutation fields. For each, show parameters and return type."
   ```

5. **Aggregate into reference**:
   Use template from section 3.3, fill with schema details.

**Alternative**: If GraphQL endpoint is accessible, use introspection:
   ```bash
   npx get-graphql-schema http://localhost:4000/graphql > schema.graphql
   ```

---

### 4.4 MFE Architecture Guide

**Goal**: Document module federation config, shell structure, routing conventions.

**Process**:
1. **Find shell and MFE directories**:
   ```
   /task agent:code-explorer "Find the shell application and all MFE directories (likely apps/shell, apps/dashboard, apps/analytics). List directory structure for each."
   ```

2. **Extract Webpack configs**:
   ```
   /task agent:code-explorer "For apps/shell/webpack.config.js, extract ModuleFederationPlugin configuration (remotes, shared dependencies). Do the same for one remote MFE (e.g., apps/dashboard)."
   ```

3. **Document routing**:
   ```
   /task agent:code-explorer "Show how the shell loads remote MFEs in the router (likely using React Router + lazy imports). Find the route definitions."
   ```

4. **Aggregate into guide**:
   Use template from section 3.4, populate with configs and examples.

---

### 4.5 React/TypeScript/Testing/Storybook Patterns

**Process** (for each doc):
1. **Find config files**:
   ```
   /task agent:code-explorer "Find tsconfig.json, jest.config.js, .storybook/main.ts. Extract key configuration settings (strict mode flags, coverage thresholds, Storybook decorators)."
   ```

2. **Find example files**:
   ```
   /task agent:code-explorer "Find 3 well-written React components in the codebase (components with tests, stories, TypeScript strict mode). Extract patterns: component structure, hooks usage, test patterns."
   ```

3. **Aggregate into docs**:
   Use templates from sections 3.5, 3.6, 3.7, 3.8. Fill with real examples from codebase.

**Validation**: Review extracted examples with senior engineer (ensure patterns are idiomatic, not one-off hacks).

---

## 5. CLAUDE.md Template for Frontend Repo

**Purpose**: Project-specific instructions for Claude Code when working in the frontend repo. This file is committed to the repo root.

**Template**:

```markdown
# Frontend Monorepo

React + Relay + TypeScript codebase with micro-frontend (MFE) architecture.

## Tech Stack

- **Framework**: React 18 (functional components, hooks)
- **Data**: Relay Modern (GraphQL client, fragment colocation)
- **Types**: TypeScript 5 (strict mode enabled)
- **Testing**: Jest + React Testing Library + Relay Test Utils
- **Docs**: Storybook 7
- **Build**: Webpack 5 + Module Federation
- **Internal Libraries**:
  - `@company/picnic` — Design system component library
  - `@company/yogi` — Relay-connected components and data hooks

## Directory Structure

```
frontend/
├── apps/
│   ├── shell/               # Host MFE (router, auth, global layout)
│   ├── dashboard/           # Dashboard MFE (default route)
│   ├── analytics/           # Analytics MFE
│   ├── settings/            # Settings MFE
│   └── admin/               # Admin panel MFE
├── packages/
│   ├── picnic/              # Component library (@company/picnic)
│   ├── yogi/                # Relay-connected components (@company/yogi)
│   └── shared/              # Shared utilities
├── schema.graphql           # GraphQL schema
├── relay.config.js          # Relay compiler config
└── tsconfig.json            # TypeScript config (strict mode)
```

## Build Commands

### Development
```bash
# Run shell + all MFEs
npm run dev

# Run specific MFE
npm run dev:dashboard
npm run dev:analytics
```

### Relay Compiler
```bash
# Watch mode (run in background during development)
npm run relay:watch

# One-time compile
npm run relay
```

### Type Checking
```bash
# Check all apps
npm run typecheck

# Check specific app
npm run typecheck:dashboard
```

### Testing
```bash
# Run all tests
npm test

# Watch mode
npm test:watch

# Coverage report
npm test:coverage
```

### Storybook
```bash
# Run Storybook dev server
npm run storybook

# Build static Storybook
npm run build-storybook
```

## Coding Conventions

### Component Naming
- **Files**: PascalCase (e.g., `UserCard.tsx`)
- **Exports**: Named exports (not default)
- **Props**: Interface named `{ComponentName}Props`

### Relay Conventions
- **Fragment Naming**: `ComponentName_fragmentKey` (e.g., `UserCard_user`)
- **Connection Keys**: `@connection(key: "ComponentName_connection")`
- **Colocation**: Fragments defined in same file as component

### TypeScript
- **Strict Mode**: Enabled (`noImplicitAny`, `strictNullChecks`, etc.)
- **Null Checks**: Use optional chaining (`user?.name`) and nullish coalescing (`value ?? default`)
- **Relay Types**: Import generated types (`UserCard_user$key`)

### File Organization
```
components/UserCard/
├── UserCard.tsx          # Component
├── UserCard.test.tsx     # Tests
├── UserCard.stories.tsx  # Storybook stories
└── index.ts              # Re-export
```

### Testing
- Use React Testing Library (prefer `getByRole` over `getByTestId`)
- Mock Relay data with `createMockEnvironment` + `MockPayloadGenerator`
- Coverage thresholds: 80% (lines, branches, functions)

### Storybook
- CSF3 format (Component Story Format 3.0)
- Stories in `{ComponentName}.stories.tsx`
- Use decorators for Relay environment, theme provider

## Common Tasks

### Create New Component
1. Generate directory: `mkdir -p src/components/ComponentName`
2. Create files: `ComponentName.tsx`, `ComponentName.test.tsx`, `ComponentName.stories.tsx`, `index.ts`
3. Use Picnic primitives (Box, Stack, Text, Button)
4. Add Relay fragment if component needs data
5. Run Relay compiler: `npm run relay`
6. Write tests (aim for 80%+ coverage)
7. Create Storybook story with controls

### Create New MFE
1. Copy `apps/dashboard` directory structure
2. Update `webpack.config.js` (ModuleFederationPlugin: name, filename, exposes)
3. Add remote to `apps/shell/webpack.config.js`
4. Add route to `apps/shell/src/App.tsx`
5. Update port in `package.json` scripts
6. Test: `npm run dev` (verify MFE loads in shell)

### Update GraphQL Schema
1. Edit `schema.graphql`
2. Run Relay compiler: `npm run relay`
3. Update affected components (TypeScript will show errors)
4. Run tests: `npm test`

## Troubleshooting

### Relay Compiler Errors
- **"Unknown fragment"**: Ensure fragment is defined before use
- **"Duplicate definition"**: Check for duplicate fragment/query names across files
- **"Cannot find type"**: Run `npm run relay` to regenerate types

### TypeScript Errors
- **"Type 'undefined' is not assignable"**: Use optional chaining or type guard
- **"Property does not exist"**: Check Relay generated types (`__generated__/`)

### Module Federation Errors
- **"Shared module not available"**: Ensure `singleton: true` for React, Relay in all MFEs
- **"Cannot read property 'call' of undefined"**: Check for version mismatches in shared deps

## Resources

- [Picnic Component Catalog](docs/picnic-component-catalog.md)
- [Yogi Guide](docs/yogi-guide.md)
- [Relay Conventions](docs/relay-conventions.md)
- [MFE Architecture](docs/mfe-architecture.md)
```

---

## 6. Success Criteria

### Prerequisites Complete When:
- [ ] All P0 documents exist (Picnic catalog, Yogi guide, GraphQL schema, MFE architecture, CLAUDE.md)
- [ ] All P1 documents drafted (80%+ complete)
- [ ] All documents reviewed by at least one senior engineer
- [ ] All documents stored in version control (not Confluence/Google Docs — engineers need offline access)

### Discovery Complete When:
- [ ] `code-explorer` agent runs produced usable output (real examples, not boilerplate)
- [ ] Extracted examples compile/run in codebase (not outdated patterns)
- [ ] Senior engineer validates 3+ examples from each document

---

## 7. Next Steps

1. **Audit Existing Docs** — Check Confluence, internal wiki, Storybook, README files for existing material
2. **Fill Gaps with Discovery** — Use code-explorer agent for missing P0/P1 docs
3. **Review with Team** — Share draft docs with 2-3 senior engineers, collect feedback
4. **Iterate** — Refine docs based on feedback (add missing examples, clarify ambiguous patterns)
5. **Proceed to Plugin Build** — Once prerequisites complete, start Phase 1 of `00-master-plan.md`

---

**Document Version**: 1.0
**Last Updated**: 2026-02-13
**Owner**: Frontend Platform Team
**Status**: Prerequisites Planning
```
