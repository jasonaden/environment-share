# EntryPoint Patterns Reference

Complete type definitions and implementation patterns for `@attentive/data-router`.
Load this reference when building entry points, route configurations, or page components
that integrate with the DataRouter system.

---

## 1. Type Reference

### Public Exports

The `@attentive/data-router` package exports exactly four items:

```typescript
// @attentive/data-router/src/index.ts
export { createEntryPoint } from './entry-point';
export type { EntryPointComponentProps } from './entry-point';
export { createDataRouter } from './router';
export type { RoutesFn } from './create-routes-from-elements';
```

### `DataBundle<FeatureFlags>`

The data bundle provides read-only accessors available outside the React render tree.
Route definitions and entry point `getQueries` functions receive a `DataBundle` instance.

```typescript
import { Environment } from 'relay-runtime';
import { HasAccessRequest } from '@attentive/acore-utils';
import { Permission, Role } from '@attentive/data';

type DataBundle<FeatureFlags extends string = string> = {
  /**
   * Access the Relay environment. Internal use only — never call directly
   * in MFE code. The router uses this to preload queries.
   */
  relayEnvironment: Environment;

  /**
   * Check whether a company-level feature flag is enabled.
   * Available in both RoutesFn and getQueries.
   */
  getCompanyFeatureFlag: (featureFlag: FeatureFlags) => boolean;

  /**
   * Return the current company ID as a string.
   * The most common accessor — used as a GraphQL variable in nearly every entry point.
   */
  getCurrentCompanyId: () => string;

  /**
   * Check whether the current user has a specific Permission enum value.
   */
  getPermission: (permission: Permission) => boolean;

  /**
   * Return the current user's set of Role enum values.
   */
  getRoles: () => Set<Role>;

  /**
   * Check a fine-grained account-level permission via HasAccessRequest.
   * Supports featureName, accessType, override roles, and fallback boolean.
   */
  getHasAccessTo: (request: HasAccessRequest) => boolean;
};
```

**Six methods total.** The README documents four (`getCompanyFeatureFlag`,
`getCurrentCompanyId`, `getPermission`, `getRoles`). The source adds `getHasAccessTo`
and the internal `relayEnvironment`. MFE code should use all five public methods
but never access `relayEnvironment` directly.

---

### `GetQueriesArgs`

The argument passed to every `getQueries` function. It combines the DataBundle
with route-level URL information:

```typescript
import { Params } from 'react-router-dom';

type GetQueriesArgs = {
  /** The full request URL string. */
  url: string;

  /** Route params extracted from the path pattern, e.g. { dataHealthEntryId: "abc" }. */
  params: Params;
} & DataBundle;
```

Destructure only the accessors needed:

```typescript
// Company-scoped query
getQueries: ({ getCurrentCompanyId }) => ({ ... })

// Route-param query
getQueries: ({ params }) => ({ ... })

// Both
getQueries: ({ getCurrentCompanyId, params }) => ({ ... })
```

---

### `RouteEntryPoint<C>`

The configuration object passed to `createEntryPoint`. Generic over the component type:

```typescript
import { ComponentType, ComponentProps } from 'react';
import { ConcreteRequest, OperationType } from 'relay-runtime';

type BaseEntryPointComponent = ComponentType<EntryPointComponentProps<any>>;

type Loader<TModule extends BaseEntryPointComponent> = () => Promise<
  TModule | { readonly default: TModule }
>;

type QueriesOf<Component extends BaseEntryPointComponent> =
  ComponentProps<Component>['queries'];

type RouteEntryPoint<Component extends BaseEntryPointComponent> = {
  /**
   * Dynamic import function returning the page component.
   * MUST use dynamic import() — static imports break code splitting.
   */
  component: Loader<Component>;

  /**
   * Return a record of named queries to preload.
   * Each key becomes a property on the component's `queries` prop.
   * All 68 existing entry points use a single key named "query".
   */
  getQueries: (args: GetQueriesArgs) => {
    [Q in keyof QueriesOf<Component>]: {
      parameters: ConcreteRequest;
      variables: QueriesOf<Component>[Q]['variables'];
    };
  };
};
```

---

### `createEntryPoint<C>(entryPoint: RouteEntryPoint<C>)`

Create an entry point configuration. Returns `{ loader, Component }` — an object
compatible with React Router's `<Route>` props via the spread operator.

```typescript
import { LoaderFunction } from 'react-router-dom';

function createEntryPoint<C extends BaseEntryPointComponent>(
  entryPoint: RouteEntryPoint<C>
): {
  /** React Router loader that preloads both the component JS and GraphQL queries. */
  loader: LoaderFunction;

  /** Internal EntryPointRenderer component — reads preloaded data via useLoaderData. */
  Component: React.ComponentType;
};
```

Usage on a `<Route>`:

```tsx
<Route path="list" {...MyEntryPoint} />
// Equivalent to:
<Route path="list" loader={MyEntryPoint.loader} Component={MyEntryPoint.Component} />
```

The `loader` function internally:
1. Calls `getDataBundle()` to retrieve the current DataBundle.
2. Calls `loadEntryPoint` from `react-relay` with the entry point config and args.
3. Returns a `PreloadedEntryPoint` that the `EntryPointRenderer` reads via `useLoaderData`.

---

### `EntryPointComponentProps<Queries>`

The props type for page components rendered by an entry point:

```typescript
import { EntryPoint, EntryPointProps } from 'react-relay';

type EntryPointComponentProps<
  Queries extends Record<string, OperationType>
> = EntryPointProps<
  Queries,
  Record<string, EntryPoint<any, any> | undefined>,
  {},
  {}
>;
```

In practice, only the `queries` property matters. The `entryPoints`, `extraProps`,
and `props` fields are empty objects in DataRouter usage.

Destructure `queries` in the component signature:

```typescript
function MyPage({ queries }: EntryPointComponentProps<{ query: MyPageQueryType }>) {
  const data = usePreloadedQuery(MyQuery, queries.query);
  // ...
}
```

The generic parameter is a record mapping query key names to their generated
`OperationType`. Since all existing entry points use a single `query` key:

```typescript
EntryPointComponentProps<{ query: SomeGeneratedQueryType }>
```

---

### `RoutesFn<FeatureFlags>`

The function type for an MFE's route definition export:

```typescript
type RoutesFn<FeatureFlags extends string> = (
  dataBundle: DataBundle<FeatureFlags>
) => React.ReactNode;
```

At Attentive, `FeatureFlags` is always `CompanyFeatureFlagNames` from `@attentive/acore-utils`:

```typescript
import { CompanyFeatureFlagNames } from '@attentive/acore-utils';
import { RoutesFn } from '@attentive/data-router';

const routes: RoutesFn<CompanyFeatureFlagNames> = (dataBundle) => (
  <Route path="*">
    {/* route tree */}
  </Route>
);

export { routes };
```

---

### `createDataRouter` (Internal — Do Not Call)

Called once during application initialization in `client-ui`. MFE code never
invokes this function directly.

```typescript
type RouterOpts = {
  basename?: string;
};

function createDataRouter<FeatureFlags extends string>(
  routes: React.ReactNode,
  dataBundle: DataBundle<FeatureFlags>,
  opts: RouterOpts
): ReturnType<typeof createBrowserRouter>;
```

Internally, `createDataRouter`:
1. Stores the Relay environment via `setRelayEnvironment`.
2. Stores the DataBundle via `setDataBundle`.
3. Converts the JSX route tree into `RouteObject[]` via `createRoutesFromElements`.
4. Returns a `BrowserRouter` instance from `react-router-dom`.

---

### How MFE Routes Mount in client-ui

Each MFE exports a `routes` function from its package. Client-ui mounts MFE routes
as children of a path-matched `<Route>`:

```tsx
// In client-ui route configuration
<Route path="/data-health/*">{dataHealthRoutes}</Route>
<Route path="/settings/*">{settingsRoutes}</Route>
```

The `RoutesFn` is called with the DataBundle and its return value (JSX route tree)
is inserted as children. The `createRoutesFromElements` utility handles this by
detecting function children and invoking them with the DataBundle before converting
to `RouteObject[]`.

---

## 2. Basic EntryPoint — Company-Scoped Query

A complete three-file example based on the DataHealthList page. This is the most
common pattern: a page that loads data scoped to the current company.

### Entry Point File

```typescript
// src/pages/DataHealthList/DataHealthList.entrypoint.ts

import { createEntryPoint } from '@attentive/data-router';

import Query from './__generated__/DataHealthListQuery.graphql';

export const DataHealthListEntryPoint = createEntryPoint({
  // Dynamic import — MUST use import(), never a static import
  component: () => import('./DataHealthList'),

  // Destructure only the DataBundle accessors needed
  getQueries: ({ getCurrentCompanyId }) => {
    return {
      query: {
        parameters: Query,
        variables: {
          companyId: getCurrentCompanyId(),
        },
      },
    };
  },
});
```

Key points:
- The `Query` import is a Relay-generated artifact (`__generated__/`). It is a static
  import because it's a small JSON-like object, not a component.
- The `component` value is a function returning `import()`. This enables code splitting —
  the page component JS is only loaded when the route matches.
- The query key is `query`. All 68 entry points in the codebase use this single key name.

### Page Component File

```tsx
// src/pages/DataHealthList/DataHealthList.tsx

import { usePreloadedQuery } from 'react-relay';
import { Outlet } from 'react-router-dom';
import { graphql } from '@attentive/data';
import { EntryPointComponentProps } from '@attentive/data-router';
import { DataHealthListQuery as DataHealthListQueryType } from './__generated__/DataHealthListQuery.graphql';

function DataHealthList({ queries }: EntryPointComponentProps<{ query: DataHealthListQueryType }>) {
  const data = usePreloadedQuery(
    graphql`
      query DataHealthListQuery($companyId: ID!) @raw_response_type {
        company: node(id: $companyId) {
          ... on Company {
            dataHealthEntries { edges { node { id eventType source status vendor } } }
          }
        }
      }
    `,
    queries.query
  );

  // Render using data.company?.dataHealthEntries?.edges
  // Include <Outlet /> to render child routes (see Section 5)
}

export default DataHealthList;
```

Key points:
- Type props with `EntryPointComponentProps<{ query: QueryType }>`.
- `usePreloadedQuery` reads preloaded data — the router kicked off the query before rendering.
- Include `@raw_response_type` directive on the GraphQL query.
- Default export required for dynamic `import()`.

For Storybook integration with this EntryPoint, see `references/storybook-entrypoint.md`.

---

## 3. Route-Param EntryPoint

An entry point that reads dynamic segments from the URL path. Use `params` from
`GetQueriesArgs` to access route parameters.

### Entry Point File

```typescript
// src/pages/DataHealthEntryDetails/DataHealthEntryDetails.entrypoint.ts

import { createEntryPoint } from '@attentive/data-router';

import Query from './__generated__/DataHealthEntryDetailsQuery.graphql';

export const DataHealthEntryDetailsEntryPoint = createEntryPoint({
  component: () => import('./DataHealthEntryDetails'),
  getQueries: ({ params }) => {
    return {
      query: {
        parameters: Query,
        variables: {
          dataHealthEntryId: params.dataHealthEntryId || '',
        },
      },
    };
  },
});
```

The `params` object is typed as `Params` from `react-router-dom` — all values are
`string | undefined`. Provide a fallback (e.g., `|| ''`) when the param could be
undefined in the type system, even if the route path guarantees it.

### Page Component File

```tsx
// src/pages/DataHealthEntryDetails/DataHealthEntryDetails.tsx

import { usePreloadedQuery } from 'react-relay';
import { graphql } from '@attentive/data';
import { EntryPointComponentProps } from '@attentive/data-router';
import { DataHealthEntryDetailsQuery as DataHealthEntryDetailsQueryType } from './__generated__/DataHealthEntryDetailsQuery.graphql';

function DataHealthEntryDetails({
  queries,
}: EntryPointComponentProps<{ query: DataHealthEntryDetailsQueryType }>) {
  const data = usePreloadedQuery(
    graphql`
      query DataHealthEntryDetailsQuery($dataHealthEntryId: ID!) @raw_response_type {
        node(id: $dataHealthEntryId) {
          ... on DataHealthEntry { id eventType source status vendor }
        }
      }
    `,
    queries.query
  );
  // Render using data.node...
}

export default DataHealthEntryDetails;
```

### Route Definition

Mount the route-param entry point as a child of the parent route. The `:dataHealthEntryId`
segment in the path becomes available as `params.dataHealthEntryId` in `getQueries`:

```tsx
// src/routes.tsx (relevant excerpt)

import { DataHealthEntryDetailsEntryPoint } from './pages/DataHealthEntryDetails/DataHealthEntryDetails.entrypoint';
import { DataHealthListEntryPoint } from './pages/DataHealthList/DataHealthList.entrypoint';

<Route path="list" {...DataHealthListEntryPoint}>
  <Route path=":dataHealthEntryId" {...DataHealthEntryDetailsEntryPoint} />
</Route>
```

The route path pattern defines the param name. Common examples:

```tsx
// Single param
<Route path=":dataHealthEntryId" {...DetailEntryPoint} />
// params.dataHealthEntryId

// Multiple params
<Route path=":id/:activeSyncDetailTab/:syncRunId" {...SyncRunDetailEntryPoint} />
// params.id, params.activeSyncDetailTab, params.syncRunId

// Optional param (trailing ?)
<Route path="user-account-management/:tab?" {...UserAccountManagementPageEntryPoint} />
// params.tab (may be undefined)
```

---

## 4. Feature-Flagged Routes

Use the `RoutesFn` callback to destructure DataBundle methods and conditionally
render route branches based on feature flags, roles, and permissions.

### Complete Routes File with Feature Flags

```tsx
// src/routes.tsx — simplified example based on settings-ui patterns

import React from 'react';
import { Navigate, Route } from 'react-router-dom';

import { CompanyFeatureFlagNames, RoutePermissions } from '@attentive/acore-utils';
import { Permission, Role } from '@attentive/data';
import { RoutesFn } from '@attentive/data-router';

import { DashboardEntryPoint } from './pages/Dashboard/Dashboard.entrypoint';
import { SyncListEntryPoint } from './pages/SyncList/SyncList.entrypoint';
import { SyncDetailEntryPoint } from './pages/SyncDetail/SyncDetail.entrypoint';
import { AdminSettingsEntryPoint } from './pages/AdminSettings/AdminSettings.entrypoint';
import { UserManagementEntryPoint } from './pages/UserManagement/UserManagement.entrypoint';

const routes: RoutesFn<CompanyFeatureFlagNames> = ({
  getCompanyFeatureFlag,
  getRoles,
  getHasAccessTo,
}) => {
  // --- Feature flags ---
  const ENABLE_SYNC_UI = getCompanyFeatureFlag('ENABLE_EDS_UI');
  const ENABLE_ADMIN_PANEL = getCompanyFeatureFlag('ENABLE_ADMIN_PANEL');

  // --- Roles ---
  const roles = getRoles();

  // --- Fine-grained permissions via getHasAccessTo ---
  const canAccessUserManagement = getHasAccessTo({
    featureName: 'ACCOUNT_PERMISSION_FEATURE_NAME_USER_MANAGEMENT',
    accessType: 'READ',
    // fallback: when no account permission record exists, fall back to this boolean
    fallback: !roles.has(Role.RoleClientManagedAccount),
  });

  const canAccessSubscriberUpload = getHasAccessTo({
    featureName: 'ACCOUNT_PERMISSION_FEATURE_NAME_SUBSCRIBER_UPLOAD',
    accessType: 'READ',
    // override: these roles always pass the check regardless of permission records
    override: [Role.RoleSuperUser],
    fallback: false,
  });

  return (
    <Route Component={React.lazy(() => import('./MfeLayout'))}>
      {/* Index route: redirect to a default sub-route */}
      <Route path="" element={<Navigate replace={true} to="dashboard" />} />

      {/* Unconditional route — always available */}
      <Route path="dashboard" {...DashboardEntryPoint} />

      {/* Feature-flag gated route group */}
      <Route element={<RoutePermissions permission={() => ENABLE_SYNC_UI} />}>
        <Route path="data-sync">
          <Route path="syncs" {...SyncListEntryPoint} />
          <Route path=":id/:tab" {...SyncDetailEntryPoint} />
          <Route path="" element={<Navigate to="syncs" />} />
        </Route>
      </Route>

      {/* Permission enum gated route */}
      <Route element={<RoutePermissions permission={Permission.SuperUserAccess} />}>
        <Route path="admin-settings/*" {...AdminSettingsEntryPoint} />
      </Route>

      {/* getHasAccessTo gated route */}
      <Route element={<RoutePermissions permission={() => canAccessUserManagement} />}>
        <Route path="user-management" {...UserManagementEntryPoint} />
      </Route>

      {/* Combined feature flag + permission check */}
      <Route
        element={
          <RoutePermissions
            permission={(checkPermissions) =>
              ENABLE_ADMIN_PANEL && checkPermissions(Permission.SuperUserAccess)
            }
          />
        }
      >
        <Route path="advanced-admin" {...AdminSettingsEntryPoint} />
      </Route>

      {/* Catch-all */}
      <Route path="*" Component={React.lazy(() => import('./NotFound'))} />
    </Route>
  );
};

export { routes };
```

### RoutePermissions Patterns

`RoutePermissions` is from `@attentive/acore-utils`, not from `@attentive/data-router`.
It wraps child routes and blocks rendering when the permission check fails.

**Pattern 1: Boolean from feature flag or getHasAccessTo**

```tsx
<Route element={<RoutePermissions permission={() => ENABLE_FEATURE_X} />}>
  <Route path="feature-x" {...FeatureXEntryPoint} />
</Route>
```

**Pattern 2: Permission enum value**

```tsx
<Route element={<RoutePermissions permission={Permission.SuperUserAccess} />}>
  <Route path="admin" {...AdminEntryPoint} />
</Route>
```

**Pattern 3: checkPermissions callback**

```tsx
<Route
  element={
    <RoutePermissions
      permission={(checkPermissions) => checkPermissions(Permission.SuperUserAccess)}
    />
  }
>
  <Route path="settings" {...SettingsEntryPoint} />
</Route>
```

**Pattern 4: Combined flag + permission callback**

```tsx
<Route
  element={
    <RoutePermissions
      permission={(checkPermissions) =>
        ENABLE_SOME_FEATURE && checkPermissions(Permission.SomeAccess)
      }
    />
  }
>
  <Route path="gated-feature" {...GatedEntryPoint} />
</Route>
```

### getHasAccessTo — HasAccessRequest Shape

```typescript
const canAccess = getHasAccessTo({
  // Required: the account permission feature name string
  featureName: 'ACCOUNT_PERMISSION_FEATURE_NAME_SUBSCRIBER_UPLOAD',

  // Required: the access level to check
  accessType: 'READ',    // or 'CREATE', 'UPDATE', 'DELETE'

  // Optional: roles that bypass the permission check entirely
  override: [Role.RoleSuperUser],

  // Optional: default when no permission record exists for this feature
  fallback: false,
});
```

### Index Route with Redirect

Use `replace()` from `react-router-dom` as a loader, or use `<Navigate>` as an element:

```tsx
import { replace } from 'react-router-dom';

// Loader-based redirect (data-health-ui pattern)
<Route index loader={() => replace('list')} />

// Element-based redirect (settings-ui pattern)
<Route path="" element={<Navigate replace={true} to="dashboard" />} />

// Conditional redirect
<Route
  index
  element={
    <Navigate
      replace={true}
      to={canAccessFeatureA ? 'feature-a' : 'feature-b'}
    />
  }
/>
```

---

## 5. Nested EntryPoints

Parent and child entry points each define their own `getQueries` and load data
independently. The parent renders `<Outlet />` where child content appears.

### Parent/Child Route Structure

```tsx
// src/routes.tsx

import React from 'react';
import { Route, replace } from 'react-router-dom';

import { CompanyFeatureFlagNames } from '@attentive/acore-utils';
import { RoutesFn } from '@attentive/data-router';

import { DataHealthEntryDetailsEntryPoint } from './pages/DataHealthEntryDetails/DataHealthEntryDetails.entrypoint';
import { DataHealthListEntryPoint } from './pages/DataHealthList/DataHealthList.entrypoint';

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

### How Data Flows

1. **User navigates to `/data-health/list/abc-123`.**
2. The router matches both the `list` route and the `:dataHealthEntryId` child route.
3. Both entry points' `loader` functions fire **in parallel**:
   - `DataHealthListEntryPoint` fetches `DataHealthListQuery` with `companyId`.
   - `DataHealthEntryDetailsEntryPoint` fetches `DataHealthEntryDetailsQuery` with `dataHealthEntryId: "abc-123"`.
4. Both components render when their data arrives:
   - `DataHealthList` renders the table and `<Outlet />`.
   - `DataHealthEntryDetails` renders inside the `<Outlet />`.

There is no data passing from parent to child. Each entry point is self-contained.
The parent does not wait for the child, and the child does not depend on parent data.

### Parent Component with Outlet

The parent component must include `<Outlet />` from `react-router-dom` to render
child route content:

```tsx
import { Outlet } from 'react-router-dom';

function ParentPage({ queries }: EntryPointComponentProps<{ query: ParentQueryType }>) {
  const data = usePreloadedQuery(ParentQuery, queries.query);

  return (
    <>
      {/* Parent content */}
      <Outlet /> {/* Child entry point renders here */}
    </>
  );
}

export default ParentPage;
```

### Nested Routes with Tabs

A common pattern: a parent entry point renders a tab bar, and each tab is a child
entry point. From the settings-ui content management example:

```tsx
// Routes definition
<Route path="content-management" {...ContentManagementTabsEntryPoint}>
  <Route path="content" {...ContentTabEntryPoint} />
  <Route path="tags/:id/manage-content" {...ManageTagContentDialogEntryPoint} />
  <Route path="tags" {...TagsTabEntryPoint} />
  <Route path="companies" {...CompaniesTabEntryPoint} />
  <Route index element={<Navigate to="tags" replace={true} />} />
</Route>
```

The parent `ContentManagementTabsEntryPoint` renders the tab navigation UI and
an `<Outlet />`. Each child entry point renders the tab content. The index route
redirects to the default tab.

### Nested Permission-Gated Children

Child routes can have their own `RoutePermissions` wrapper:

```tsx
<Route path="subscriber-tools" {...SubscriberToolsTabsEntryPoint}>
  <Route element={<RoutePermissions permission={() => canAccessUpload} />}>
    <Route path="subscriber-upload">
      <Route path="history" {...SubscriberUploadListEntryPoint} />
      <Route element={<RoutePermissions permission={() => canCreateUpload} />}>
        <Route path="create" {...SubscriberUploadDialogEntryPoint} />
      </Route>
      <Route path=":id" {...UploadDetailEntryPoint} />
      <Route path="" element={<Navigate replace={true} to="history" />} />
    </Route>
  </Route>

  <Route element={<RoutePermissions permission={() => canAccessBulkOptOut} />}>
    <Route path="bulk-email-opt-out">
      <Route index {...BulkOptOutEmailEntryPoint} />
      <Route path=":id" {...UploadDetailEntryPoint} />
    </Route>
  </Route>

  <Route
    index
    element={
      <Navigate replace={true} to={canAccessUpload ? 'subscriber-upload' : 'bulk-email-opt-out'} />
    }
  />
</Route>
```

This shows multiple levels of nesting:
- The outer parent entry point (`SubscriberToolsTabsEntryPoint`) provides layout/tabs.
- Each section has its own permission gate.
- Sub-sections can have further permission gates (e.g., `canCreateUpload` for the create route).
- The index route conditionally redirects based on what the user can access.

---

## 6. Advanced Patterns

### Empty Query EntryPoint

For pages that do not need server data at route entry time. The component may
still fetch data via hooks after rendering — this only skips route-level preloading:

```typescript
// src/pages/StaticPage/StaticPage.entrypoint.ts

import { createEntryPoint } from '@attentive/data-router';

export const StaticPageEntryPoint = createEntryPoint({
  component: () => import('./StaticPage'),
  getQueries: () => ({}),
});
```

The component receives an empty `queries` object. Type as `EntryPointComponentProps<{}>`.

This is useful for:
- Static/informational pages.
- Pages that fetch data lazily based on user interaction.
- Layout wrapper components that only provide structure.

### fetchPolicy for Stale-While-Revalidate

The entry point's query definition can include a `fetchPolicy` to control Relay's
caching behavior:

```typescript
import { createEntryPoint } from '@attentive/data-router';

import Query from './__generated__/DashboardQuery.graphql';

export const DashboardEntryPoint = createEntryPoint({
  component: () => import('./Dashboard'),
  getQueries: ({ getCurrentCompanyId }) => {
    return {
      query: {
        parameters: Query,
        variables: {
          companyId: getCurrentCompanyId(),
        },
        // Show cached data immediately, refresh in background
        fetchPolicy: 'store-and-network',
      },
    };
  },
});
```

Available fetch policies:
- `'store-or-network'` (default) — Use cache if available, otherwise fetch.
- `'store-and-network'` — Show cached data immediately, then fetch and update.
- `'network-only'` — Always fetch, ignore cache.

### Mixed Mode: EntryPoint Routes + React.lazy Routes

A single `RoutesFn` can contain both entry point routes and plain `React.lazy` routes.
This supports gradual migration of an MFE:

```tsx
const routes: RoutesFn<CompanyFeatureFlagNames> = (_dataBundle) => (
  <Route Component={React.lazy(() => import('./MfeLayout'))}>
    {/* Entry point route — preloads component + data */}
    <Route index {...WelcomeEntryPoint} />

    {/* Plain lazy route — code-splits but no data preloading */}
    <Route path="more" Component={React.lazy(() => import('./pages/More'))} />

    {/* Entry point route */}
    <Route path="relay-conventions" {...RelayConventionsPageEntryPoint} />

    {/* Plain lazy route */}
    <Route
      path="presenter"
      Component={React.lazy(() => import('./pages/graphql-examples/presenter/PresenterPage'))}
    />

    {/* Element-based route — no code splitting at all */}
    <Route path="custom-keywords" element={<CustomKeywordsPage />} />

    {/* Catch-all */}
    <Route path="*" element={<Navigate to="more" replace />} />
  </Route>
);
```

There is no requirement that all routes in a `RoutesFn` use entry points. The three
patterns coexist:
- `{...EntryPoint}` — Component code splitting + data preloading.
- `Component={React.lazy(...)}` — Component code splitting only.
- `element={<Component />}` — No code splitting (component is in the main bundle).

### Multiple Route Params

Access several route parameters in `getQueries`:

```typescript
// Route definition:
// <Route path=":id/:activeSyncDetailTab/:syncRunId" {...SyncRunDetailEntryPoint} />

export const SyncRunDetailEntryPoint = createEntryPoint({
  component: () => import('./SyncRunDetail'),
  getQueries: ({ params }) => {
    return {
      query: {
        parameters: Query,
        variables: {
          syncId: params.id || '',
          syncRunId: params.syncRunId || '',
          // params.activeSyncDetailTab can be used for UI state but
          // may not be needed as a query variable
        },
      },
    };
  },
});
```

### Combining Company ID and Route Params

Some queries need both the company scope and a route parameter:

```typescript
export const CompanyDetailEntryPoint = createEntryPoint({
  component: () => import('./CompanyDetail'),
  getQueries: ({ getCurrentCompanyId, params }) => {
    return {
      query: {
        parameters: Query,
        variables: {
          companyId: getCurrentCompanyId(),
          itemId: params.itemId || '',
        },
      },
    };
  },
});
```

### Feature-Flag Conditional Query Variables

Use `getCompanyFeatureFlag` in `getQueries` to adjust query variables based on
feature state:

```typescript
export const ConditionalEntryPoint = createEntryPoint({
  component: () => import('./ConditionalPage'),
  getQueries: ({ getCurrentCompanyId, getCompanyFeatureFlag }) => {
    return {
      query: {
        parameters: Query,
        variables: {
          companyId: getCurrentCompanyId(),
          includeExperimentalFields: getCompanyFeatureFlag('ENABLE_EXPERIMENTAL_FIELDS'),
        },
      },
    };
  },
});
```

### Entry Point Without a Path (Layout Wrapper)

An entry point can be spread onto a `<Route>` without a `path` prop. This creates
a "layout route" — a pathless route that provides a shared parent component for
its children:

```tsx
<Route {...EmailListMaintenanceEntryPoint}>
  <Route path="email-suppression" {...SuppressionListTabEntryPoint} />
  <Route path="email-list-maintenance" {...ListMaintenanceTabEntryPoint} />
</Route>
```

The `EmailListMaintenanceEntryPoint` component renders layout/tabs and an `<Outlet />`
for the child routes. It matches whenever any child route matches, without adding
a path segment to the URL.

---

## 7. Anti-Patterns

### Anti-Pattern 1: Using useLazyLoadQuery Instead of usePreloadedQuery

`useLazyLoadQuery` fetches data when the component renders, creating a waterfall
(JS loads → then query fires). `usePreloadedQuery` reads data already preloaded
by the router in parallel with the JS.

**DON'T:**

```tsx
function MyPage() {
  const data = useLazyLoadQuery(MyPageQuery, { companyId });  // fires AFTER render
}
```

**DO:**

```tsx
function MyPage({ queries }: EntryPointComponentProps<{ query: MyPageQueryType }>) {
  const data = usePreloadedQuery(MyPageQuery, queries.query);  // reads preloaded data
}
```

---

### Anti-Pattern 2: Statically Importing the Component in the Entry Point File

Static imports pull the component into the entry point's bundle chunk, adding it
to the initial bundle and defeating code splitting.

**DON'T:**

```typescript
import DataHealthList from './DataHealthList';  // static — bundled at init
component: () => Promise.resolve(DataHealthList),
```

**DO:**

```typescript
component: () => import('./DataHealthList'),  // dynamic — loaded on route match
```

The only static import in an entry point file should be the generated GraphQL query artifact.

---

### Anti-Pattern 3: Named Exports Instead of Default Exports

Dynamic `import()` expects the component to be the default export. Named exports
cause runtime errors or render `undefined`.

**DON'T:**

```tsx
export function MyPage({ queries }: Props) { ... }  // named export
```

**DO:**

```tsx
function MyPage({ queries }: Props) { ... }
export default MyPage;  // default export
```

Named exports for types or test helpers are fine alongside the default export.

---

### Anti-Pattern 4: Mutating DataBundle State

DataBundle methods are read-only accessors returning snapshots. Do not store,
mutate, or cache the bundle outside the RoutesFn/getQueries scope.

**DON'T:**

```typescript
const routes: RoutesFn<CompanyFeatureFlagNames> = (dataBundle) => {
  globalState.dataBundle = dataBundle;          // storing reference
  (dataBundle as any).customField = 'value';    // mutating
  window.__COMPANY_ID__ = dataBundle.getCurrentCompanyId();  // caching globally
  return ( ... );
};
```

**DO:**

```typescript
const routes: RoutesFn<CompanyFeatureFlagNames> = ({ getCompanyFeatureFlag, getRoles }) => {
  const ENABLE_FEATURE = getCompanyFeatureFlag('ENABLE_MY_FEATURE');  // local use only
  const roles = getRoles();
  return ( ... );
};
```

---

### Anti-Pattern 5: Importing Router Internals

Only import from the package's public API. Internal modules may change without notice.

**DON'T:**

```typescript
import { getRelayEnvironment } from '@attentive/data-router/src/relay-environment';
import { getDataBundle } from '@attentive/data-router/src/data-bundle';
import { createRoutesFromElements } from '@attentive/data-router/src/create-routes-from-elements';
```

**DO:**

```typescript
import { createEntryPoint } from '@attentive/data-router';
import type { EntryPointComponentProps, RoutesFn } from '@attentive/data-router';
```

Public exports: `createEntryPoint`, `EntryPointComponentProps`, `RoutesFn`, `createDataRouter` (client-ui only).
