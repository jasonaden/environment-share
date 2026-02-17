---
name: data-router
description: >
  This skill provides comprehensive knowledge of the @attentive/data-router library and EntryPoint patterns,
  including creating entry points with createEntryPoint, writing EntryPoint page components with
  EntryPointComponentProps, defining route trees with RoutesFn, using DataBundle for feature flags and
  permissions, Storybook integration with createWrapperForEntryPoint, and the 3-file page scaffolding pattern.
  This skill should be used when the user asks about DataRouter, creating an entry point, adding a new page
  or route, scaffolding a page component, createWrapperForEntryPoint, EntryPointComponentProps, RoutesFn,
  DataBundle, route-level data loading, or Storybook stories for EntryPoint components.
---

# DataRouter and EntryPoint Patterns

## Introduction to DataRouter

The `@attentive/data-router` library bridges React Router 6's Data Router with Relay to eliminate three problems inherent to traditional declarative routing: waterfall data loading, over-fetching via monolithic Presenter queries, and loading all MFE JavaScript regardless of the target sub-page.

In the legacy declarative model, routes nest inside components. A parent component must render before child routes are discovered, which triggers sequential data fetches — each waiting on the previous render. The Data Router solves this by defining all routes up front, outside the React render tree. The router matches the full URL path in a single pass and kicks off every matching route's data loader in parallel.

Because route definitions live outside React, hooks like `useCompanyFeatureFlags` are unavailable. The `@attentive/data-router` package addresses this by providing a `DataBundle` — a set of getter functions injected into both route definitions and entry point configurations, giving access to company IDs, feature flags, permissions, and roles without relying on React context.

The **EntryPoint** is the core abstraction. An EntryPoint pairs a dynamically imported component with a `getQueries` function that declares GraphQL data requirements. The router loads both the component code and query data in parallel when a route matches.

The public API surface consists of four primary exports:

- `createEntryPoint` — define an EntryPoint configuration
- `EntryPointComponentProps` — type for page component props
- `RoutesFn` — type for the route definition function
- `DataBundle` — the getter object available in routes and entry points

Every new page follows a **3-file pattern**: an entrypoint definition (`.entrypoint.ts`), a page component (`.tsx`), and a Storybook story (`.stories.tsx`). This pattern ensures code splitting, parallel data loading, and story coverage for every route.

## Creating EntryPoints

Define an EntryPoint using `createEntryPoint`, which accepts an object with two properties: `component` and `getQueries`.

### Component Import

Provide `component` as a dynamic import function. This ensures the page component lives in a separate bundle chunk and loads only when the route matches:

```tsx
component: () => import('./DataHealthList')
```

**DO**: Use default exports for entry point components — `React.lazy` and the Data Router's `Component` prop both require default exports.

**DON'T**: Statically import the component (e.g., `import DataHealthList from './DataHealthList'`). Static imports defeat code splitting by pulling the component into the initial bundle.

### Query Configuration

Import the GraphQL query statically from the `__generated__/` directory. Query artifacts are small metadata objects that belong in the initial chunk — they describe the query without containing component logic:

```tsx
import Query from './__generated__/DataHealthListQuery.graphql';
```

### The getQueries Function

`getQueries` receives a `GetQueriesArgs` object that merges route information with the DataBundle:

- `url` — the matched URL string
- `params` — route parameters extracted from the path (e.g., `params.dataHealthEntryId` for a `:dataHealthEntryId` segment)
- `getCurrentCompanyId()` — return the active company ID
- `getCompanyFeatureFlag(flagName)` — check a feature flag
- `getPermission(permission)` — check a user permission
- `getRoles()` — return the user's role set
- `getHasAccessTo(request)` — check a fine-grained account-level permission

Return an object where each key maps to a query configuration with `parameters` (the `ConcreteRequest` artifact) and `variables`:

```tsx
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

For route-param entry points, destructure `params` instead of DataBundle methods:

```tsx
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

Provide a fallback (e.g., `|| ''`) for optional params to satisfy TypeScript's `string | undefined` type.

Multiple queries can be declared by adding additional keys to the return object. Each key becomes a separate preloaded query available in the component's `queries` prop. Name keys descriptively — `query` for the primary query, `settingsQuery` for supplementary data.

## EntryPoint Page Components

Type the page component's props using `EntryPointComponentProps`, parameterized with the query map shape matching the return value of `getQueries`:

```tsx
import { EntryPointComponentProps } from '@attentive/data-router';
import type { DataHealthListQuery as DataHealthListQueryType }
  from './__generated__/DataHealthListQuery.graphql';

type Props = EntryPointComponentProps<{ query: DataHealthListQueryType }>;
```

### Accessing Preloaded Data

Destructure `queries` from props. Pass the preloaded query reference into `usePreloadedQuery` from `react-relay`, along with the GraphQL query definition:

```tsx
function DataHealthList({ queries }: Props) {
  const data = usePreloadedQuery(
    graphql`
      query DataHealthListQuery($companyId: ID!) @raw_response_type {
        company: node(id: $companyId) {
          ... on Company { dataHealthEntries { edges { node { id status } } } }
        }
      }
    `,
    queries.query
  );
  // render using data...
}

export default DataHealthList;
```

Include the `@raw_response_type` directive on GraphQL queries used in EntryPoint components. This directive generates the full response type needed for Storybook mock data resolvers.

**DO**: Destructure `{ queries }` from props and pass individual query references to `usePreloadedQuery`.

**DON'T**: Use `useLazyLoadQuery` in EntryPoint components. The router has already preloaded the data — `useLazyLoadQuery` would trigger a redundant fetch and bypass the parallel loading optimization.

Export the component as a default export. Both `React.lazy` (used in `createEntryPoint`'s dynamic import) and React Router's `Component` prop require default exports.

Keep the component file focused on rendering. Place business logic in custom hooks and import shared UI components from `@attentive/picnic` or local component directories. The EntryPoint component's sole responsibility is to read preloaded data and compose the page layout.

## Route Definitions with RoutesFn

Define the MFE's route tree as a `RoutesFn<CompanyFeatureFlagNames>`. This function receives the `DataBundle` and returns JSX route elements:

```tsx
import { Route, replace } from 'react-router-dom';
import { CompanyFeatureFlagNames } from '@attentive/acore-utils';
import { RoutesFn } from '@attentive/data-router';

const routes: RoutesFn<CompanyFeatureFlagNames> = () => {
  return (
    <Route path="*">
      <Route index loader={() => replace('list')} />
      <Route path="list" {...DataHealthListEntryPoint}>
        <Route path=":dataHealthEntryId" {...DataHealthEntryDetailsEntryPoint} />
      </Route>
    </Route>
  );
};

export { routes };
```

### Spreading EntryPoints onto Routes

`createEntryPoint` produces an object compatible with React Router's `<Route>` props. Spread the EntryPoint directly onto the `<Route>` element — this sets `Component`, `loader`, and related props in one expression:

```tsx
<Route path="list" {...DataHealthListEntryPoint} />
```

### Feature Flag Gating

Destructure `getCompanyFeatureFlag` from the DataBundle argument. Evaluate flags at the top of the function body, then conditionally render routes:

```tsx
const routes: RoutesFn<CompanyFeatureFlagNames> = ({ getCompanyFeatureFlag }) => {
  const ENABLE_DASHBOARD = getCompanyFeatureFlag('ENABLE_DASHBOARD');
  return (
    <Route path="*">
      <Route path="list" {...ListEntryPoint} />
      {ENABLE_DASHBOARD && <Route path="dashboard" {...DashboardEntryPoint} />}
    </Route>
  );
};
```

### Permission Gating

Wrap routes that require specific permissions in a `RoutePermissions` element. `RoutePermissions` renders an `<Outlet />` only when the permission check passes:

```tsx
import { RoutePermissions } from '@attentive/acore-utils';
import { Permission } from '@attentive/data';

<Route element={<RoutePermissions permission={Permission.SettingsAccess} />}>
  <Route path="settings" {...SettingsEntryPoint} />
</Route>
```

### Nested Routes and Index Redirects

Nest child `<Route>` elements inside parent routes. The parent component must render `<Outlet />` to display matched children. Use `replace()` in an index route's `loader` to redirect from the parent path to a default child:

```tsx
<Route index loader={() => replace('list')} />
```

Alternatively, use `<Navigate to="list" replace />` as the index route's `element`.

### MFE Route Mounting

MFE routes mount inside client-ui's top-level router. Client-ui wraps each MFE's exported routes in a `<Route>` with the MFE's base path and a `handle` object that identifies the MFE for navigation and analytics:

```tsx
<Route path="/data-health/*" handle={{ appName: 'data-health-ui', title: 'Data Health' }}>
  {DataHealthRoutes}
</Route>
```

The wildcard `*` in the MFE mount path delegates all sub-path matching to the MFE's own `RoutesFn`. Export the routes function from the MFE's package entry point so client-ui can import it directly.

## Storybook Integration for EntryPoints

EntryPoint components expect preloaded query references injected by the router. In Storybook, there is no router to preload queries. The `createWrapperForEntryPoint` utility bridges this gap.

### The Wrapper Function

`createWrapperForEntryPoint` accepts the component, the `ConcreteRequest` query artifact, and static variables. It returns a wrapper component that simulates the router's preloading — calling `useQueryLoader` on mount and passing the preloaded reference into the component via the `queries` prop.

Each MFE or library maintains its own copy of this utility, typically at `src/utils/storybook.tsx` or `.storybook/decorators.tsx`. Import from the target MFE's existing copy rather than creating a new one. For the full implementation and type signature, see `references/storybook-entrypoint.md`.

### Writing Stories

Create the wrapper with static variables, then use it as the story's render component:

```tsx
import { createWrapperForEntryPoint } from '../../utils/storybook';
import DataHealthList from './DataHealthList';
import Query from './__generated__/DataHealthListQuery.graphql';

const WrappedComponent = createWrapperForEntryPoint(DataHealthList, Query, {
  companyId: 'company-1',
});

export default {
  title: 'Pages/DataHealthList',
  component: DataHealthList,
};

export const Default: StoryFn = () => <WrappedComponent />;
```

### Required Decorators

Global decorators must be configured in the MFE's `.storybook/preview.ts`: `RelayMSWDecorator` (sets up Relay environment with MSW), `ReactRouter6Decorator` (provides router context), and `PicnicDecorator` (provides the design system theme).

### Per-Story Mock Data

Use `MockDataOverrideDecorator` to customize query responses for individual stories. Pass the query artifact and a resolver function that returns partial response data:

```tsx
export const EmptyState: StoryFn = () => <WrappedComponent />;
EmptyState.decorators = [
  MockDataOverrideDecorator<DataHealthListQuery>(Query, () => ({
    company: { dataHealthEntries: { edges: [] } },
  })),
];
```

**DO**: Use `MockDataOverrideDecorator` for different data scenarios (empty states, error states, large data sets).

**DON'T**: Import production DataBundle or router setup into stories. The wrapper and decorators provide all necessary context.

## Scaffolding Workflow

Follow the 3-file pattern when creating a new page. Place all files in `src/pages/PageName/`:

```
src/pages/PageName/
  PageName.entrypoint.ts    # EntryPoint definition
  PageName.tsx              # Page component
  PageName.stories.tsx      # Storybook stories
  __generated__/            # Relay compiler output (auto-generated)
```

**Step-by-step**:

1. Define the GraphQL query in the page component file
2. Run `relay-compiler` to generate artifacts in `__generated__/`
3. Create the entrypoint file — import the generated query, use `createEntryPoint`
4. Create the page component — type with `EntryPointComponentProps`, use `usePreloadedQuery`
5. Create the Storybook story — use `createWrapperForEntryPoint` with static variables
6. Add the route — import the EntryPoint in the MFE's `routes.tsx`, spread onto a `<Route>`
7. Verify — run `yarn tsc` and `yarn relay-compiler` to confirm types resolve and the generated artifacts are current

Naming convention: match the directory name, component name, query name, and entrypoint export name. For a page called `CampaignsList`, create `CampaignsList.entrypoint.ts` exporting `CampaignsListEntryPoint`, `CampaignsList.tsx` exporting `default CampaignsList`, and the query named `CampaignsListQuery`.

---

For complete code examples covering all EntryPoint variations (basic, route-param, feature-flagged, nested, advanced patterns, and anti-patterns), see `references/entrypoint-patterns.md`.

For the full Storybook integration guide including `createWrapperForEntryPoint` implementation details, decorator configuration, and mock data patterns, see `references/storybook-entrypoint.md`.
