# Skill Plan: Data Router

## Purpose and Scope

This skill provides comprehensive knowledge of the `@attentive/data-router` library and its patterns for building route-based entry points in the frontend application. It enables agents to:

- Create new EntryPoint definitions using `createEntryPoint` and spread them onto `<Route>` elements
- Write EntryPoint page components that receive `EntryPointComponentProps` and use `usePreloadedQuery`
- Define route trees using `RoutesFn<CompanyFeatureFlagNames>` with feature flag gating and permission checks
- Write Storybook stories for EntryPoint components using `createWrapperForEntryPoint`
- Scaffold the standard 3-file page pattern: `*.entrypoint.ts`, `*.tsx`, `*.stories.tsx`
- Configure nested routes with parent/child EntryPoints and `<Outlet />`
- Apply `MockDataOverrideDecorator` and `RelayMSWDecorator` patterns for story data

The skill covers the complete EntryPoint lifecycle from creation through route mounting and Storybook integration.

## Trigger Description

```yaml
description: >
  This skill provides comprehensive knowledge of the @attentive/data-router library and EntryPoint patterns,
  including creating entry points with createEntryPoint, writing EntryPoint page components with
  EntryPointComponentProps, defining route trees with RoutesFn, using DataBundle for feature flags and
  permissions, Storybook integration with createWrapperForEntryPoint, and the 3-file page scaffolding pattern.
  This skill should be used when the user asks about DataRouter, creating an entry point, adding a new page
  or route, scaffolding a page component, createWrapperForEntryPoint, EntryPointComponentProps, RoutesFn,
  DataBundle, route-level data loading, or Storybook stories for EntryPoint components.
```

## SKILL.md Specification

Target length: 1800 words

### Section 1: Introduction to DataRouter (250 words)
- What DataRouter solves: waterfall loading, over-fetching, bundle splitting
- Relationship to React Router 6 Data Router and Relay
- The EntryPoint as the core abstraction
- Public API surface: `createEntryPoint`, `EntryPointComponentProps`, `createDataRouter`, `RoutesFn`
- The 3-file page pattern overview

### Section 2: Creating EntryPoints (350 words)
- `createEntryPoint({ component, getQueries })` function signature
- Dynamic component import requirement (`() => import('./ComponentName')`)
- Static GraphQL query import (from `__generated__/` artifacts)
- `getQueries` function: receives `GetQueriesArgs` (`{ url, params, ...DataBundle }`)
- DataBundle methods available in `getQueries`: `getCurrentCompanyId`, `getCompanyFeatureFlag`, `getPermission`, `getRoles`, `getHasAccessTo`
- Route params: accessing via `params` in `getQueries` (e.g., `params.campaignId`)
- Return shape: `{ query: { parameters: ConcreteRequest, variables: {...} } }`
- DO: Use default exports for entry point components
- DON'T: Statically import the component (breaks code splitting)

### Section 3: EntryPoint Page Components (300 words)
- `EntryPointComponentProps<{ query: QueryType }>` type
- Using `usePreloadedQuery(Query, queries.query)` to access data
- GraphQL query with `@raw_response_type` directive
- Default export requirement (for dynamic import compatibility)
- DO: Destructure `{ queries }` from props
- DON'T: Use `useLazyLoadQuery` in EntryPoint components (data is preloaded by the router)

### Section 4: Route Definitions with RoutesFn (350 words)
- `RoutesFn<CompanyFeatureFlagNames>` type signature — receives `DataBundle` for dynamic route construction
- The spread pattern: `<Route path="list" {...MyEntryPoint} />`
- Feature flag gating: destructure `getCompanyFeatureFlag` from DataBundle, conditional route rendering
- Permission gating with `RoutePermissions` wrapper element
- Nested routes with `<Outlet />` in parent components
- Index route redirects with `replace()` or `<Navigate to="..." replace />`
- How MFE routes mount in client-ui: `<Route path="/mfe-name/*">{MfeRoutes}</Route>`

### Section 5: Storybook Integration for EntryPoints (300 words)
- The problem: EntryPoint components expect preloaded queries from the router
- `createWrapperForEntryPoint<T>(Component, Query, variables)` — the bridge function
- How it works: `useQueryLoader` + `useEffect` to simulate preloaded queries
- Location: each MFE/lib has its own copy in `.storybook/decorators.tsx` or `src/utils/storybook.tsx`
- Required global decorators: `RelayMSWDecorator`, `ReactRouter6Decorator`, `PicnicDecorator`
- Per-story data: `MockDataOverrideDecorator<QueryType>(Query, resolver)` for custom mock data
- DO: Use `MockDataOverrideDecorator` for different data scenarios
- DON'T: Import production DataBundle or router setup into stories

### Section 6: Scaffolding Workflow (150 words)
- The 3-file pattern: `PageName.entrypoint.ts`, `PageName.tsx`, `PageName.stories.tsx`
- Directory structure: `src/pages/PageName/` with `__generated__/` for Relay artifacts
- Step-by-step: Define GraphQL query → Run relay-compiler → Create entrypoint → Create component → Create story → Add route
- Integration: adding the route to the MFE's `routes.tsx`

## Reference Files

### entrypoint-patterns.md
**Purpose**: Type reference and code examples for all EntryPoint variations

**Estimated size**: 1,500-2,000 lines

**Outline**:
1. **Type Reference** (350 lines)
   - `createEntryPoint` full type signature with generics (`RouteEntryPoint<C>`, `GetQueriesArgs`)
   - `EntryPointComponentProps` generic type and props breakdown
   - `RoutesFn` type signature with FeatureFlags generic
   - `DataBundle<FeatureFlags>` full definition with all 6 methods

2. **Basic EntryPoint** (200 lines)
   - Complete 3-file example based on DataHealthList pattern
   - Company-scoped query with `getCurrentCompanyId`

3. **Route-Param EntryPoint** (150 lines)
   - EntryPoint using `params` from route path
   - Complete example based on DataHealthEntryDetails pattern

4. **Feature-Flagged Routes** (200 lines)
   - RoutesFn with `getCompanyFeatureFlag` destructured
   - Permission-guarded routes with `RoutePermissions`

5. **Nested EntryPoints** (250 lines)
   - Parent EntryPoint with `<Outlet />`
   - Child EntryPoints mounted as nested routes
   - Index route redirects

6. **Advanced Patterns** (200 lines)
   - Empty query EntryPoint (`getQueries: () => ({})`)
   - EntryPoint with `fetchPolicy: 'store-and-network'`
   - Mixed mode: EntryPoint routes alongside plain `React.lazy` routes

7. **Anti-Patterns** (150 lines)
   - Using `useLazyLoadQuery` instead of `usePreloadedQuery`
   - Statically importing component in entrypoint file
   - Named exports instead of default exports
   - Mutating DataBundle state
   - Importing router internals (`getRelayEnvironment`, `getDataBundle`)

### storybook-entrypoint.md
**Purpose**: Storybook integration guide for EntryPoint components

**Estimated size**: 600-800 lines

**Outline**:
1. **createWrapperForEntryPoint** (100 lines)
   - Full implementation source code (~20 lines)
   - Type signature breakdown
   - Where to place it in a project

2. **Basic EntryPoint Story** (150 lines)
   - Import pattern: wrapper + component + generated query
   - Creating WrappedComponent with static variables
   - Story definition with `StoryFn`

3. **Stories with Mock Data and Variants** (250 lines)
   - `MockDataOverrideDecorator` usage
   - Empty state, loading state, populated state stories
   - `FeatureFlagDecorator` and `RoleDecorator` for interactive controls

4. **Required Decorators Checklist** (100 lines)
   - Global decorators: `mswDecorator`, `RelayMSWDecorator`, `ReactRouter6Decorator`, `PicnicDecorator`
   - Per-story decorators: `MockDataOverrideDecorator`, `FeatureFlagDecorator`, `RoleDecorator`
   - Decorator ordering

## Used By Agents

- **mfe-scaffolder**: Creates new pages with EntryPoint boilerplate in MFEs
- **component-builder**: Implements EntryPoint page components
- **storybook-writer**: Writes stories for EntryPoint components using createWrapperForEntryPoint
- **mfe-architect**: Plans route structures and EntryPoint organization
- **frontend-reviewer**: Reviews EntryPoint patterns, route definitions, and story coverage

## Dependencies

- **relay-conventions**: Understanding GraphQL queries, fragments, preloaded queries
- **react-patterns**: Component structure, hooks, default exports
- **storybook-patterns**: CSF3 format, decorators, story structure
- **typescript-strict**: Type safety for EntryPointComponentProps generics, DataBundle typing
- **mfe-conventions**: MFE route mounting, module federation context

## Skills to Load When Building

- `plugin-dev:skill-development` (required for skill creation)

## Validation Criteria

### Should Trigger (3 test queries)

1. "Create a new EntryPoint page for the campaigns list"
2. "How do I write a Storybook story for a DataRouter entry point component?"
3. "Add a new route with feature flag gating to the settings MFE"

### Should NOT Trigger (2 test queries)

1. "How do I write a Relay fragment for a component?" (relay-conventions)
2. "How do I set up Webpack module federation for a new MFE?" (mfe-conventions)

### Progressive Disclosure Test

1. **Frontmatter only**: User asks "Should I use DataRouter for this new page?"
   - Expected: Agent confirms DataRouter is the standard for new route-based pages and briefly explains the EntryPoint pattern

2. **SKILL.md loaded**: User asks "Walk me through creating a new EntryPoint page"
   - Expected: Agent provides the 3-file scaffolding workflow with the entrypoint, component, and story file structure

3. **References loaded**: User asks "Show me a complete example of a feature-flagged route with nested EntryPoints and Storybook stories"
   - Expected: Agent provides full code examples from entrypoint-patterns.md and storybook-entrypoint.md references

## Example Content Snippets

### Example 1: Basic EntryPoint Creation

```markdown
## Creating an EntryPoint

### EntryPoint Definition File

```tsx
// DataHealthList.entrypoint.ts
import { createEntryPoint } from '@attentive/data-router';
import Query from './__generated__/DataHealthListQuery.graphql';

export const DataHealthListEntryPoint = createEntryPoint({
  component: () => import('./DataHealthList'),
  getQueries: ({ getCurrentCompanyId }) => ({
    query: {
      parameters: Query,
      variables: { companyId: getCurrentCompanyId() },
    },
  }),
});
```

### Page Component

```tsx
// DataHealthList.tsx
import { EntryPointComponentProps } from '@attentive/data-router';
import { usePreloadedQuery } from 'react-relay';
import { graphql } from '@attentive/data';
import type { DataHealthListQuery } from './__generated__/DataHealthListQuery.graphql';

const Query = graphql`
  query DataHealthListQuery($companyId: ID!) @raw_response_type {
    company(id: $companyId) {
      dataHealthEntries {
        edges {
          node {
            id
            name
            status
          }
        }
      }
    }
  }
`;

function DataHealthList({ queries }: EntryPointComponentProps<{ query: DataHealthListQuery }>) {
  const data = usePreloadedQuery(Query, queries.query);

  return (
    <PageLayout title="Data Health">
      {data.company?.dataHealthEntries?.edges?.map(({ node }) => (
        <DataHealthCard key={node.id} entry={node} />
      ))}
    </PageLayout>
  );
}

export default DataHealthList;
```

### Route-Param Variation

```tsx
// DataHealthEntryDetails.entrypoint.ts
export const DataHealthEntryDetailsEntryPoint = createEntryPoint({
  component: () => import('./DataHealthEntryDetails'),
  getQueries: ({ params }) => ({
    query: {
      parameters: Query,
      variables: { dataHealthEntryId: params.dataHealthEntryId || '' },
    },
  }),
});
```
```

### Example 2: Route Definition with Feature Flags

```markdown
## Defining Routes with RoutesFn

```tsx
// routes.tsx
import { Route, replace, Navigate } from 'react-router-dom';
import { CompanyFeatureFlagNames } from '@attentive/acore-utils';
import { RoutesFn } from '@attentive/data-router';
import { DataHealthListEntryPoint } from './pages/DataHealthList/DataHealthList.entrypoint';
import { DataHealthEntryDetailsEntryPoint } from './pages/DataHealthEntryDetails/DataHealthEntryDetails.entrypoint';

const routes: RoutesFn<CompanyFeatureFlagNames> = ({
  getCompanyFeatureFlag,
  getHasAccessTo,
}) => {
  const ENABLE_NEW_DASHBOARD = getCompanyFeatureFlag('ENABLE_NEW_DASHBOARD');
  const canAccessSettings = getHasAccessTo({
    featureName: 'settings',
    accessType: 'READ',
  });

  return (
    <Route path="*">
      <Route index loader={() => replace('list')} />
      <Route path="list" {...DataHealthListEntryPoint}>
        <Route path=":dataHealthEntryId" {...DataHealthEntryDetailsEntryPoint} />
      </Route>
      {ENABLE_NEW_DASHBOARD && (
        <Route path="dashboard" {...DashboardEntryPoint} />
      )}
      <Route element={<RoutePermissions permission={() => canAccessSettings} />}>
        <Route path="settings" {...SettingsEntryPoint} />
      </Route>
    </Route>
  );
};

export { routes };
```

### How MFE Routes Mount

```tsx
// apps/client-ui/src/routes/app-routes.tsx
import { routes as DataHealthRoutes } from '@attentive/data-health-ui';

<Route
  id="data-health-ui"
  path="/data-health/*"
  handle={{ appName: 'data-health-ui', title: 'Data Health' }}
>
  {DataHealthRoutes}
</Route>
```
```

### Example 3: Storybook Story for EntryPoint Component

```markdown
## Storybook Integration for EntryPoint Components

### Writing the Story

```tsx
// DataHealthList.stories.tsx
import { StoryFn } from '@storybook/react';
import { createWrapperForEntryPoint } from '../../utils/storybook';
import DataHealthList from './DataHealthList';
import { MockDataOverrideDecorator } from '../../../.storybook/decorators';
import Query from './__generated__/DataHealthListQuery.graphql';
import type { DataHealthListQuery } from './__generated__/DataHealthListQuery.graphql';

const WrappedComponent = createWrapperForEntryPoint(
  DataHealthList,
  Query,
  { companyId: 'company-1' },
);

export default {
  title: 'Pages/DataHealth/DataHealthList',
  component: WrappedComponent,
};

export const Default: StoryFn = () => <WrappedComponent />;

export const WithManyEntries: StoryFn = () => <WrappedComponent />;
WithManyEntries.decorators = [
  MockDataOverrideDecorator<DataHealthListQuery>(Query, () => ({
    company: {
      dataHealthEntries: {
        edges: Array.from({ length: 50 }, (_, i) => ({
          node: { id: `entry-${i}`, name: `Entry ${i + 1}`, status: 'HEALTHY' },
        })),
      },
    },
  })),
];

export const EmptyState: StoryFn = () => <WrappedComponent />;
EmptyState.decorators = [
  MockDataOverrideDecorator<DataHealthListQuery>(Query, () => ({
    company: {
      dataHealthEntries: { edges: [] },
    },
  })),
];
```
```
