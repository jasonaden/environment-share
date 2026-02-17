# Storybook for EntryPoint Components

Reference for writing Storybook stories for DataRouter EntryPoint page components.
EntryPoint components receive preloaded queries from DataRouter at the route level.
In Storybook, simulate this preloading with `createWrapperForEntryPoint`.

---

## createWrapperForEntryPoint

### Implementation

Each MFE/lib has its own copy of this function. The canonical implementation:

```tsx
// Located at: .storybook/decorators.tsx  OR  src/utils/storybook.tsx
import React from 'react';
import { VariablesOf, useQueryLoader } from 'react-relay';
import { ConcreteRequest, OperationType } from 'relay-runtime';

import { EntryPointComponentProps } from '@attentive/data-router';

export function createWrapperForEntryPoint<T extends OperationType>(
  Component: React.FC<EntryPointComponentProps<{ query: T }>>,
  Query: ConcreteRequest,
  variables: VariablesOf<T>
) {
  type PreloadedQueries = React.ComponentProps<typeof Component>['queries'];

  return () => {
    const [preloadedQuery, loadQuery] = useQueryLoader<T>(Query);

    React.useEffect(() => {
      loadQuery(variables);
    }, [loadQuery]);

    if (!preloadedQuery) return null;

    return (
      <Component
        queries={{ query: preloadedQuery } as PreloadedQueries}
        entryPoints={{}}
        extraProps={{}}
        props={{}}
      />
    );
  };
}
```

### Type Signature

```
createWrapperForEntryPoint<T extends OperationType>(
  Component: React.FC<EntryPointComponentProps<{ query: T }>>,
  Query: ConcreteRequest,
  variables: VariablesOf<T>
) => React.FC
```

| Parameter   | Type                                              | Purpose                                                        |
|-------------|---------------------------------------------------|----------------------------------------------------------------|
| Component   | `React.FC<EntryPointComponentProps<{ query: T }>>` | The EntryPoint page component to wrap                          |
| Query       | `ConcreteRequest`                                 | The compiled Relay query (imported from `__generated__/`)       |
| variables   | `VariablesOf<T>`                                  | Static query variables to pass (e.g., `{ companyId: 'company-1' }`) |

### How It Works

1. Call `useQueryLoader<T>(Query)` to get a `loadQuery` function and a `preloadedQuery` ref.
2. Fire `loadQuery(variables)` inside a `useEffect` on mount — this simulates DataRouter's route-level preloading.
3. While `preloadedQuery` is `null` (before the effect fires), render nothing.
4. Once loaded, render the component with `queries`, `entryPoints`, `extraProps`, and `props` — mirroring the shape DataRouter passes to EntryPoint components.

### Where To Find It

Each MFE already has a copy. Common locations:

- `.storybook/decorators.tsx` — e.g., `libs/crm/.storybook/decorators.tsx`
- `src/utils/storybook.tsx` — e.g., `mfes/data-health-ui/src/utils/storybook.tsx`

Import accordingly:

```tsx
// From local utils
import { createWrapperForEntryPoint } from '../../utils/storybook';

// From shared storybook config
import { createWrapperForEntryPoint } from '../../../.storybook/decorators';

// From a library's storybook exports
import { createWrapperForEntryPoint } from '@attentive/targeting-common/.storybook';
```

> **Note:** This function is copy-pasted identically across 10+ locations. Each MFE already
> has a copy. Use the existing copy from the target MFE — do not create a new one.

### Coverage

`createWrapperForEntryPoint` covers 29 out of 30 EntryPoint stories in the codebase. The single
exception was a component that needed `actions` props (a Relay artifact), not a pattern to support.

---

## Basic EntryPoint Story

A minimal story file for an EntryPoint page component:

```tsx
// src/pages/DataHealthList/DataHealthList.stories.tsx
import { Meta, StoryFn } from '@storybook/react';
import React from 'react';

import { createWrapperForEntryPoint } from '../../utils/storybook';

import DataHealthList from './DataHealthList';

import Query from './__generated__/DataHealthListQuery.graphql';

// Create the wrapped component with static variables
const WrappedComponent = createWrapperForEntryPoint(DataHealthList, Query, {
  companyId: 'company-1',
});

export default {
  title: 'Pages/DataHealth/DataHealthList',
  component: DataHealthList,
} as Meta;

export const Default: StoryFn = () => <WrappedComponent />;
```

### Import Pattern

Every EntryPoint story needs three imports:

1. **The wrapper** — `createWrapperForEntryPoint` from the MFE's storybook utilities
2. **The component** — the page component itself
3. **The query** — the compiled Relay `ConcreteRequest` from `__generated__/`

```tsx
import { createWrapperForEntryPoint } from '../../utils/storybook';
import DataHealthList from './DataHealthList';
import Query from './__generated__/DataHealthListQuery.graphql';
```

When using `MockDataOverrideDecorator`, also import the query's type:

```tsx
import Query, {
  DataHealthListQuery as DataHealthListQueryType,
} from './__generated__/DataHealthListQuery.graphql';
```

### Creating the Wrapped Component

Call `createWrapperForEntryPoint` at module scope (outside the story functions). Pass
realistic but static variables:

```tsx
const WrappedComponent = createWrapperForEntryPoint(DataHealthList, Query, {
  companyId: 'company-1',
});
```

For pages with route parameters:

```tsx
const WrappedComponent = createWrapperForEntryPoint(DataHealthEntryDetails, Query, {
  dataHealthEntryId: 'dataHealthEntry-1',
});
```

For pages with multiple variables:

```tsx
const WrappedComponent = createWrapperForEntryPoint(SegmentDetailsPage, Query, {
  companyId: 'Company-1',
  segmentId: 'Segment-1',
});
```

### Story Title Convention

Follow `Pages/FeatureName/PageName` for page-level stories:

```tsx
export default {
  title: 'Pages/DataHealth/DataHealthList',
  component: DataHealthList,
} as Meta;
```

For component-level stories within a feature:

```tsx
export default {
  title: 'components/Segments Table',
  component: SegmentsTable,
} as Meta;
```

### Basic Default Story

The simplest story renders the wrapped component with no additional configuration:

```tsx
export const Default: StoryFn = () => <WrappedComponent />;
```

### Story with Route Parameters

When the page reads from `react-router-dom` (e.g., `useParams`, `useLocation`), configure
route parameters via `parameters`:

```tsx
export default {
  title: 'Pages/SegmentDetails',
  component: SegmentDetailsPage,
  parameters: {
    initialEntries: ['/segments/1234'],
    path: '/segments/:id',
  },
} as Meta;
```

### Story with Named Export

Apply a display name to stories for cleaner Storybook sidebar navigation:

```tsx
export const SegmentsListStory: StoryFn = () => <WrappedComponent />;
SegmentsListStory.storyName = 'Segments List';
```

Or use `StoryObj` with `name`:

```tsx
export const Default: StoryObj = {
  name: 'Subscribers List Page',
};
```

---

## Stories with Mock Data and Variants

### MockDataOverrideDecorator

Override Relay mock data per-story or at the meta level. Imported from `@attentive/mock-data`.

#### Type Signature

```tsx
function MockDataOverrideDecorator<T extends RelayQueryType>(
  query: ConcreteRequest,
  dataGenerator: (
    req: GraphQLRequestInfo<T['variables']>,
    ctx: StoryContext
  ) => DeepPartial<T['rawResponse']>,
  configGenerator?: (
    req: GraphQLRequestInfo<T['variables']>,
    ctx: StoryContext
  ) => OverrideConfig
): Decorator
```

| Parameter       | Type                                            | Purpose                                       |
|-----------------|-------------------------------------------------|-----------------------------------------------|
| query           | `ConcreteRequest`                               | The Relay query to override mock data for      |
| dataGenerator   | `(req, ctx) => DeepPartial<T['rawResponse']>`   | Return partial response data; merged with defaults |
| configGenerator | `(req, ctx) => { delay?, networkError? }`       | Optional: control response timing or errors    |

The `ctx` parameter gives access to `ctx.args` — the current Storybook args/controls values.
This enables dynamic mock data driven by interactive controls.

#### Meta-Level Override (All Stories)

Apply `MockDataOverrideDecorator` to the `decorators` array in the default export. All stories
in the file receive this mock data:

```tsx
import { MockDataOverrideDecorator } from '@attentive/mock-data';

import Query, {
  SegmentsListPageEntrypoint_Query as QueryType,
} from './__generated__/SegmentsListPageEntrypoint_Query.graphql';

export default {
  title: 'Pages/Segments/SegmentsList',
  component: SegmentsListPage,
  decorators: [
    MockDataOverrideDecorator<QueryType>(Query, (_, { args }) => ({
      company: {
        __typename: 'Company',
        id: 'Company-1',
        companyVendorIntegrations: args.companyVendorIntegrations
          ? [...args.companyVendorIntegrations]
          : [],
      },
    })),
  ],
} as Meta;
```

#### Per-Story Override

Apply `MockDataOverrideDecorator` to an individual story's `decorators` array.
This overrides (or supplements) the meta-level decorator for that story only:

```tsx
export const WithManyEntries: StoryFn = () => <WrappedComponent />;
WithManyEntries.decorators = [
  MockDataOverrideDecorator<DataHealthListQueryType>(Query, () => ({
    company: {
      dataHealthEntries: {
        edges: Array.from({ length: 50 }, (_, i) => ({
          node: { id: `entry-${i}`, name: `Entry ${i + 1}`, status: 'HEALTHY' },
        })),
      },
    },
  })),
];
```

### Empty State Story

Return empty arrays or null values to render the empty/zero state:

```tsx
export const EmptyState: StoryFn = () => <WrappedComponent />;
EmptyState.decorators = [
  MockDataOverrideDecorator<DataHealthListQueryType>(Query, () => ({
    company: {
      dataHealthEntries: { edges: [] },
    },
  })),
];
```

### Populated State Story

Return lists with multiple items to exercise table/list rendering:

```tsx
export const PopulatedState: StoryFn = () => <WrappedComponent />;
PopulatedState.decorators = [
  MockDataOverrideDecorator<QueryType>(Query, () => ({
    company: {
      dataHealthEntries: {
        edges: Array.from({ length: 25 }, (_, i) => ({
          node: {
            id: `entry-${i}`,
            name: `Health Entry ${i + 1}`,
            status: i % 3 === 0 ? 'WARNING' : 'HEALTHY',
            lastChecked: '2024-01-15T12:00:00Z',
          },
        })),
      },
    },
  })),
];
```

### Loading State Story

Use `configGenerator` (third argument) or `storeMSWHeaders` to simulate loading delays:

```tsx
// Using configGenerator on MockDataOverrideDecorator
export const Loading: StoryFn = () => <WrappedComponent />;
Loading.decorators = [
  MockDataOverrideDecorator<QueryType>(
    Query,
    () => ({ company: { dataHealthEntries: { edges: [] } } }),
    () => ({ delay: 5000 })
  ),
];
```

```tsx
// Using storeMSWHeaders for REST endpoints
import { storeMSWHeaders } from '@attentive/mock-data';

export const LoadingSegments: StoryFn = () => {
  storeMSWHeaders({ getSegmentsDelay: 5000 });
  return <WrappedComponent />;
};
```

### Error State Story

Use `storeMSWHeaders` to return error status codes for REST-backed data:

```tsx
export const ErrorState: StoryFn = () => {
  storeMSWHeaders({ getSegmentsStatus: 500 });
  return <WrappedComponent />;
};
```

Or use `configGenerator` to trigger a network error on GraphQL:

```tsx
export const NetworkError: StoryFn = () => <WrappedComponent />;
NetworkError.decorators = [
  MockDataOverrideDecorator<QueryType>(
    Query,
    () => ({}),
    () => ({ networkError: 'Failed to fetch' })
  ),
];
```

### Dynamic Mock Data from Args

Access `ctx.args` in the data generator to make mock data respond to Storybook controls:

```tsx
export default {
  title: 'Pages/SubscriberDetails',
  decorators: [
    MockDataOverrideDecorator<SubscriberDetailQueryType>(
      SubscriberDetailQuery,
      (_, { args }) => ({
        subscriber: !args.noDetails
          ? {
              id: 'user-1',
              firstName: 'Georgina',
              lastName: 'Gorgeous',
              subscribedPhone: '(999) 111 2222',
              email: 'georgina@gorgeous.com',
            }
          : null,
      }),
      (_, { args }) => ({ delay: args.delay })
    ),
  ],
  args: {
    noDetails: false,
    delay: 0,
  },
  argTypes: {
    noDetails: { control: 'boolean' },
    delay: { control: { type: 'number' } },
  },
} as Meta;
```

### FeatureFlagDecorator

Toggle feature flags in stories via interactive Storybook controls. Imported from
`.storybook/decorators.tsx` or `@attentive/targeting-common/decorators`. Each MFE
already has this decorator — use the existing copy.

**Usage:** Define default flags in `parameters.companyFeatureFlags`, expose with
`getFeatureFlagArgTypes`, toggle per-story via `args.featureFlags`:

```tsx
import { FeatureFlagDecorator, getFeatureFlagArgTypes } from '@attentive/targeting-common/decorators';

const defaultCompanyFeatureFlags = { ENABLE_PUSH_COMPANY: false };

export default {
  decorators: [FeatureFlagDecorator],
  parameters: { companyFeatureFlags: defaultCompanyFeatureFlags },
  argTypes: { ...getFeatureFlagArgTypes(defaultCompanyFeatureFlags) },
} as Meta;

export const WithPush: StoryFn = () => <WrappedComponent />;
WithPush.args = { featureFlags: ['ENABLE_PUSH_COMPANY'] };
```

### RoleDecorator

Test different user roles via a Storybook dropdown. Imported from `.storybook/decorators.tsx`.
Each MFE already has this decorator.

**Usage:** Add `RoleDecorator` and `roleArgTypes` to the meta, set roles per-story:

```tsx
import { RoleDecorator, roleArgTypes } from '../../../.storybook/decorators';

export default {
  decorators: [RoleDecorator],
  argTypes: roleArgTypes,
} as Meta;

export const AdminView: StoryFn = () => <WrappedComponent />;
AdminView.args = { role: Role.RoleSuperUser };
```

### Composing Multiple Decorators

Stack decorators on the meta-level `decorators` array. Per-story decorators are
**additive** — they run alongside meta decorators, not instead of them.

```tsx
export default {
  decorators: [
    FeatureFlagDecorator,
    RoleDecorator,
    MockDataOverrideDecorator<QueryType>(Query, () => ({ /* baseline data */ })),
    JotaiDecorator,
  ],
  argTypes: { ...getFeatureFlagArgTypes(flags), ...roleArgTypes },
  parameters: { companyFeatureFlags: flags },
} as Meta;

// Per-story: adds a second MockDataOverrideDecorator for a different query
export const Variant: StoryFn = () => <WrappedComponent />;
Variant.decorators = [
  MockDataOverrideDecorator<OtherQueryType>(OtherQuery, () => ({ /* variant data */ })),
];
```

---

## Required Decorators Checklist

### Global Decorators

Configured in `.storybook/preview.ts` (or `preview.tsx`). These apply to ALL stories in
the MFE/lib automatically. Do not add them to individual story files.

| Decorator               | Package                  | Purpose                                     |
|-------------------------|--------------------------|---------------------------------------------|
| `mswDecorator`          | `@attentive/data`        | MSW service worker for API mocking           |
| `RelayMSWDecorator`     | `@attentive/data`        | Relay-specific MSW integration               |
| `ReactRouter6Decorator` | `@attentive/acore-utils` | React Router v6 context (`MemoryRouter`)     |
| `PicnicDecorator`       | `@attentive/picnic`      | Picnic design system theme and context       |
| `JotaiDecorator`        | `@attentive/acore-utils` | Jotai atom provider for global state         |
| `ProjectNameDecorator`  | `@attentive/acore-utils` | Sets project name in context                 |

These are configured in each MFE's `.storybook/preview.ts`. Do not add them to
individual story files — they are already present globally.

### Per-Story Decorators

Applied to individual stories or at the meta level in story files. Import these
as needed — they are not global.

| Decorator                  | Import Source                          | Purpose                                  |
|----------------------------|---------------------------------------|------------------------------------------|
| `MockDataOverrideDecorator` | `@attentive/mock-data`               | Override Relay mock data per-query         |
| `FeatureFlagDecorator`     | `.storybook/decorators` or `@attentive/targeting-common/decorators` | Toggle feature flags via controls |
| `RoleDecorator`            | `.storybook/decorators`               | Set user role via dropdown control        |

#### When to use each

- **MockDataOverrideDecorator** — Use whenever the story needs specific query response data.
  Apply at meta level for a shared baseline; apply per-story for variant-specific overrides.

- **FeatureFlagDecorator** — Use when the component's behavior varies by feature flag. Define
  `defaultCompanyFeatureFlags` in `parameters`, expose with `getFeatureFlagArgTypes`, and
  toggle via `args.featureFlags` on individual stories.

- **RoleDecorator** — Use when the component renders differently based on user role. Add
  `roleArgTypes` to `argTypes` and set `args.role` on individual stories.

### Decorator Ordering

Decorators execute **bottom-to-top** (last in array = innermost wrapper). Place
provider decorators (`JotaiDecorator`) last so they wrap innermost.

### Quick Reference: Story File Structure

```tsx
import { createWrapperForEntryPoint } from '../../utils/storybook';
import { MockDataOverrideDecorator } from '@attentive/mock-data';
import MyPage from './MyPage';
import Query, { MyPageQuery as QueryType } from './__generated__/MyPageQuery.graphql';

const WrappedComponent = createWrapperForEntryPoint(MyPage, Query, { companyId: 'company-1' });

export default {
  title: 'Pages/Feature/MyPage',
  component: MyPage,
  decorators: [MockDataOverrideDecorator<QueryType>(Query, () => ({ /* baseline */ }))],
} as Meta;

export const Default: StoryFn = () => <WrappedComponent />;

export const EmptyState: StoryFn = () => <WrappedComponent />;
EmptyState.decorators = [MockDataOverrideDecorator<QueryType>(Query, () => ({ /* empty */ }))];
```
