# Skill Plan: MFE Conventions

## Purpose and Scope

This skill provides comprehensive knowledge of Micro Frontend (MFE) architecture patterns and conventions used across the organization's frontend applications. It enables agents to:

- Understand the MFE architecture and boundaries
- Design new MFEs following organizational conventions
- Implement routing patterns within and across MFEs
- Apply correct state sharing and communication patterns
- Handle cross-MFE navigation and deep linking
- Structure MFE directories and build configurations
- Understand deployment and versioning strategies
- Know when to create a new MFE vs. extending existing ones
- Apply performance optimization for MFE loading
- Handle shared dependencies and version conflicts

The skill covers the complete lifecycle of MFEs from initial scaffolding to production deployment, emphasizing patterns that ensure MFEs work together cohesively while maintaining independence.

## Trigger Description

```yaml
description: >
  This skill provides comprehensive knowledge of Micro Frontend (MFE) architecture patterns,
  including MFE boundaries, routing conventions, state sharing, cross-MFE communication, directory structure,
  and deployment strategies. This skill should be used when the user asks about micro frontends, MFEs,
  creating new areas or applications, routing between MFEs, sharing state across MFEs, MFE architecture decisions,
  or structuring large frontend applications.
```

## SKILL.md Specification

Target length: 1900 words

### Section 1: Introduction to MFE Architecture (250 words)
- Overview of the organization's MFE architecture
- Why MFEs: team autonomy, independent deployment, scalability
- Current MFEs in production and their boundaries
- Shell application and MFE orchestration
- Build and deployment pipeline
- Shared dependencies and federation

### Section 2: MFE Boundaries and Design (350 words)
- Principles for defining MFE boundaries
- Domain-driven design approach
- Team ownership model
- When to create a new MFE vs. extend existing
- Bounded contexts and data ownership
- Shared vs. isolated functionality
- Communication contracts between MFEs
- MFE independence principles

### Section 3: Routing Patterns (400 words)
- Shell-level routing configuration
- MFE-level routing structure
- Route naming conventions
- Route parameters and query strings
- Deep linking across MFEs
- Navigation between MFEs
- Route guards and authentication
- Handling 404s and errors
- Breadcrumb coordination

### Section 4: Cross-MFE Communication (350 words)
- Event bus patterns for loosely coupled communication
- Shared state via context providers
- URL-based state sharing
- Custom events and postMessage
- When to use each communication method
- Anti-patterns to avoid (direct imports, tight coupling)
- Type-safe communication patterns
- Debugging cross-MFE communication

### Section 5: Directory Structure and Setup (250 words)
- Standard MFE directory structure
- Package.json configuration
- Webpack/Vite federation config
- TypeScript configuration
- Shared types and contracts
- Environment variables
- Build scripts and CI/CD integration

### Section 6: Shared Dependencies (200 words)
- Shared dependencies strategy (React, Relay, Picnic)
- Version alignment across MFEs
- Handling version mismatches
- Bundle size optimization
- Tree shaking and code splitting

### Section 7: Development and Testing (100 words)
- Local development with multiple MFEs
- Mocking MFEs in isolation
- Integration testing across MFEs
- E2E testing strategies

## Reference Files

### architecture.md
**Purpose**: Detailed MFE architecture documentation with diagrams and design decisions

**Estimated size**: 4,000-5,000 lines

**Outline**:
1. **Architecture Overview** (500 lines)
   - System architecture diagram
   - Shell application responsibilities
   - MFE orchestration and loading
   - Module federation configuration
   - Build and deployment flow

2. **Current MFEs** (800 lines)
   Each MFE documented with:
   - Name and purpose
   - Owned routes
   - Team ownership
   - Key features
   - Dependencies
   - API endpoints used
   - Links to repos

   Example MFEs:
   - **Auth MFE**: Login, signup, password reset (/auth/*)
   - **Dashboard MFE**: Home dashboard, widgets (/dashboard/*)
   - **Users MFE**: User management, profiles (/users/*)
   - **Products MFE**: Product catalog, details (/products/*)
   - **Orders MFE**: Order management, history (/orders/*)
   - **Settings MFE**: App settings, preferences (/settings/*)

3. **Boundary Principles** (600 lines)
   - Domain-driven boundaries
   - Team topology alignment
   - Data ownership principles
   - Shared functionality identification
   - When to split vs. merge MFEs
   - Case studies of past decisions

4. **Communication Patterns** (700 lines)
   - Event bus architecture
   - Event naming conventions
   - Event payload typing
   - Context provider patterns
   - URL state sharing patterns
   - Examples of each pattern

5. **Shared Dependencies** (500 lines)
   - List of shared dependencies
   - Version management strategy
   - Dependency upgrade process
   - Bundle size impact
   - Performance considerations

6. **Security Considerations** (400 lines)
   - Authentication propagation
   - Authorization in MFEs
   - CSRF protection
   - XSS prevention
   - Content Security Policy

7. **Performance Optimization** (500 lines)
   - Lazy loading MFEs
   - Preloading strategies
   - Bundle splitting
   - Caching strategies
   - Monitoring and metrics

### routing-patterns.md
**Purpose**: Complete routing configuration patterns and examples

**Estimated size**: 3,000-3,500 lines

**Outline**:
1. **Shell Routing Configuration** (600 lines)
   - Top-level route configuration
   - MFE registration
   - Route matching and loading
   - Fallback routes
   - Complete example shell config

2. **MFE Routing Setup** (700 lines)
   - React Router setup within MFE
   - Route definitions
   - Nested routes
   - Route parameters
   - Query string handling
   - Complete example MFE routes

3. **Cross-MFE Navigation** (500 lines)
   - Navigating between MFEs
   - Link component usage
   - Programmatic navigation
   - Passing state between MFEs
   - Deep linking patterns

4. **Route Guards** (400 lines)
   - Authentication guards
   - Authorization guards
   - Feature flag guards
   - Loading states during guards
   - Redirect patterns

5. **Advanced Routing** (500 lines)
   - Modal routes (route modals)
   - Parallel routes
   - Catch-all routes
   - Breadcrumb generation
   - Route-based code splitting

6. **Real-World Examples** (300 lines)
   - Complete routing setup for sample MFE
   - Multi-level nested routes
   - Complex navigation flows

## Used By Agents

- **mfe-architect**: Designs MFE boundaries and communication patterns
- **mfe-scaffolder**: Creates new MFEs from templates
- **component-architect**: Understands MFE context when designing components

## Dependencies

- **react-patterns**: React Router and navigation patterns
- **typescript-strict**: Type-safe routing and communication

## Skills to Load When Building

- `plugin-dev:skill-development` (required for skill creation)

## Validation Criteria

### Should Trigger (3 test queries)

1. "Should I create a new MFE for the analytics feature?"
2. "How do I navigate from the Users MFE to the Products MFE?"
3. "What's the correct way to share authentication state across MFEs?"

### Should NOT Trigger (2 test queries)

1. "How do I query data with Relay?" (relay-conventions)
2. "Which component should I use for a button?" (picnic-components)

### Progressive Disclosure Test

1. **Frontmatter only**: User asks "Should this be a separate MFE?"
   - Expected: Agent suggests checking MFE boundary principles

2. **SKILL.md loaded**: User asks "How do I navigate between MFEs?"
   - Expected: Agent provides navigation pattern overview

3. **References loaded**: User asks "Show me the complete routing setup for a new MFE"
   - Expected: Agent provides full example from routing-patterns.md

## Example Content Snippets

### Example 1: MFE Boundary Decision Framework

```markdown
## Deciding MFE Boundaries

### Principles for MFE Boundaries

MFE boundaries should align with:

1. **Domain Boundaries**: Each MFE owns a clear domain or subdomain
2. **Team Boundaries**: One team owns one MFE (or a team owns multiple small MFEs)
3. **User Workflow Boundaries**: Users perceive distinct areas of the application
4. **Data Ownership**: Each MFE primarily works with data it owns or has clear access to
5. **Deployment Independence**: MFEs that need to deploy independently should be separate

### Decision Framework

Ask these questions when considering a new MFE:

#### 1. Is this a distinct domain?

```
✅ YES: User Management, Product Catalog, Order Processing
   → These are clear business domains with distinct concepts

❌ NO: "Product Images", "Product Reviews" (sub-features of Products)
   → These are parts of the Product domain
```

#### 2. Will a separate team own and maintain this?

```
✅ YES: A dedicated Payments Team will own payment processing
   → Team autonomy supports separate MFE

❌ NO: One engineer will build a small reporting feature
   → Not worth MFE overhead for small features
```

#### 3. Does it need independent deployment?

```
✅ YES: Payments must deploy updates without affecting other areas
   → Critical path, separate deployment needed

❌ NO: UI theme changes need to be coordinated across the app
   → Better as a shared library, not an MFE
```

#### 4. Is the domain large enough to justify the overhead?

```
✅ YES: 20+ routes, 50+ components, complex workflows
   → Sufficient size to benefit from isolation

❌ NO: 3 routes, 10 components, simple CRUD
   → Better as a feature within an existing MFE
```

#### 5. Does it have clear communication boundaries?

```
✅ YES: Products MFE communicates with Orders MFE via events
   → Loose coupling is achievable

❌ NO: Every feature needs constant data from every other feature
   → Too tightly coupled, reconsider boundaries
```

### Current MFE Boundaries

Our application is divided into these MFEs:

1. **Shell** (`/`)
   - Top-level navigation
   - MFE orchestration
   - Global error handling
   - Routes: None (delegates to MFEs)

2. **Auth MFE** (`/auth/*`)
   - Domain: Authentication and authorization
   - Team: Security Team
   - Key features: Login, signup, password reset, SSO
   - Routes: `/auth/login`, `/auth/signup`, `/auth/reset-password`

3. **Dashboard MFE** (`/dashboard/*`)
   - Domain: Home dashboard and overview widgets
   - Team: Platform Team
   - Key features: Widget system, activity feed, quick actions
   - Routes: `/dashboard`, `/dashboard/widgets`

4. **Users MFE** (`/users/*`)
   - Domain: User and team management
   - Team: Users Team
   - Key features: User list, profiles, permissions, teams
   - Routes: `/users`, `/users/:id`, `/users/:id/edit`, `/teams/*`

5. **Products MFE** (`/products/*`)
   - Domain: Product catalog and inventory
   - Team: Products Team
   - Key features: Product list, details, categories, inventory
   - Routes: `/products`, `/products/:id`, `/products/new`, `/categories/*`

6. **Orders MFE** (`/orders/*`)
   - Domain: Order management and fulfillment
   - Team: Orders Team
   - Key features: Order list, details, fulfillment, returns
   - Routes: `/orders`, `/orders/:id`, `/orders/:id/fulfill`

7. **Settings MFE** (`/settings/*`)
   - Domain: Application settings and preferences
   - Team: Platform Team
   - Key features: User preferences, app config, integrations
   - Routes: `/settings/profile`, `/settings/notifications`, `/settings/integrations`

### Example Decision: Should Analytics be a separate MFE?

**Scenario**: Building a new analytics and reporting feature.

**Analysis**:
- Domain: Yes, analytics is a distinct domain
- Team: Small feature, no dedicated team (2 engineers)
- Deployment: No critical deployment independence needed
- Size: Estimated 10 routes, 30 components
- Communication: Needs data from all other domains

**Decision**: **No**, create as a section within Dashboard MFE.

**Reasoning**:
- No dedicated team ownership
- Small to medium size (doesn't justify MFE overhead)
- Tightly coupled to all domains (would require extensive cross-MFE communication)
- Can live at `/dashboard/analytics/*`
- Can be extracted to separate MFE later if it grows significantly

### Example Decision: Should Payments be a separate MFE?

**Scenario**: Adding payment processing capabilities.

**Analysis**:
- Domain: Yes, payments is a distinct domain
- Team: Yes, dedicated Payments Team (5 engineers)
- Deployment: Yes, PCI compliance requires controlled deployments
- Size: Estimated 15 routes, 40 components, complex workflows
- Communication: Integrates with Orders but has clear boundaries

**Decision**: **Yes**, create a new Payments MFE.

**Reasoning**:
- Dedicated team ownership
- Security and compliance require deployment control
- Sufficient size and complexity
- Clear domain boundaries (payment methods, transactions, refunds)
- Loose coupling possible (communicates via events and APIs)
- Route: `/payments/*`

### When to Split an Existing MFE

Consider splitting an MFE when:

1. **Size**: The MFE has grown to 50+ routes, 200+ components
2. **Team**: Multiple sub-teams working on different parts
3. **Deployment**: Different parts need different deployment schedules
4. **Performance**: Bundle size is impacting load time (>1MB)
5. **Domain**: Clear sub-domains have emerged

Example: If the Products MFE grows to include complex inventory management, warehouse operations, and vendor management, consider splitting:
- **Products MFE**: Product catalog, categories, attributes
- **Inventory MFE**: Inventory tracking, warehouse operations
- **Vendors MFE**: Vendor management, purchase orders
```

### Example 2: Cross-MFE Navigation Pattern

```markdown
## Cross-MFE Navigation

### Using the Link Component

The shell provides a `Link` component that works across MFE boundaries:

```tsx
// In any MFE
import { Link } from '@company/shell-components'

// Navigate from Users MFE to Products MFE
<Link to="/products/123">
  View Product
</Link>

// Navigate within the same MFE
<Link to="/users/456/edit">
  Edit User
</Link>
```

### Programmatic Navigation

Use the `navigate` function from the shell router:

```tsx
import { useNavigate } from '@company/shell-components'

function UserCard({ userId }: { userId: string }) {
  const navigate = useNavigate()

  const handleViewDetails = () => {
    // Navigate to Products MFE from Users MFE
    navigate(`/products/${userId}`)
  }

  return (
    <Card>
      <Button onClick={handleViewDetails}>View Details</Button>
    </Card>
  )
}
```

### Passing State Between MFEs

#### Option 1: URL Parameters (Recommended for Simple Data)

```tsx
// Users MFE: Navigate with query params
<Link to={`/orders?userId=${user.id}&userName=${user.name}`}>
  View Orders
</Link>

// Orders MFE: Read query params
import { useSearchParams } from 'react-router-dom'

function OrdersPage() {
  const [searchParams] = useSearchParams()
  const userId = searchParams.get('userId')
  const userName = searchParams.get('userName')

  // Use the params to filter orders
}
```

#### Option 2: Navigation State (For Complex Data)

```tsx
// Users MFE: Navigate with state
navigate('/orders/new', {
  state: {
    prefillData: {
      customerId: user.id,
      customerName: user.name,
      shippingAddress: user.defaultAddress,
    },
  },
})

// Orders MFE: Read navigation state
import { useLocation } from 'react-router-dom'

function CreateOrderPage() {
  const location = useLocation()
  const prefillData = location.state?.prefillData

  const [formData, setFormData] = useState({
    customerId: prefillData?.customerId || '',
    customerName: prefillData?.customerName || '',
    shippingAddress: prefillData?.shippingAddress || {},
  })

  // Use prefilled data in form
}
```

**Note**: Navigation state is lost on page refresh. Use URL params for data that should persist.

#### Option 3: Event Bus (For Loosely Coupled Communication)

```tsx
// Users MFE: Emit event when user is updated
import { eventBus } from '@company/shell-components'

const handleUserUpdate = async (userId: string, updates: UserUpdates) => {
  await updateUser(userId, updates)

  // Emit event for other MFEs
  eventBus.emit('user.updated', {
    userId,
    userName: updates.name,
    timestamp: Date.now(),
  })
}

// Orders MFE: Listen for user updates
import { eventBus } from '@company/shell-components'
import { useEffect } from 'react'

function OrderDetailsPage() {
  useEffect(() => {
    const handler = (event: UserUpdatedEvent) => {
      // Update UI if this order belongs to the updated user
      if (order.customerId === event.userId) {
        refetchOrder()
      }
    }

    eventBus.on('user.updated', handler)

    return () => {
      eventBus.off('user.updated', handler)
    }
  }, [order.customerId])
}
```

### Deep Linking

Deep links should work across MFEs:

```tsx
// All these should work when user lands directly on URL:
/users/123
/users/123/edit
/products/456/reviews
/orders/789?tab=shipments
/settings/integrations/slack
```

Each MFE is responsible for:
1. Handling its route parameters
2. Loading necessary data based on the route
3. Showing appropriate loading/error states

```tsx
// Users MFE: Handle deep link to user edit page
function UserEditPage() {
  const { userId } = useParams()

  // Load user data based on URL param
  const data = useLazyLoadQuery(
    graphql`
      query UserEditPageQuery($userId: ID!) {
        user(id: $userId) {
          id
          name
          email
          ...UserEditForm_user
        }
      }
    `,
    { userId }
  )

  return <UserEditForm user={data.user} />
}
```

### Opening Routes in New Tab

```tsx
// Open in new tab (cmd+click or right-click should work)
<Link to="/products/123" target="_blank" rel="noopener noreferrer">
  View Product in New Tab
</Link>

// Programmatic new tab
const openInNewTab = () => {
  window.open('/products/123', '_blank', 'noopener,noreferrer')
}
```

### Navigation with Route Modals

Modal routes allow showing modals while preserving the underlying route:

```tsx
// Shell routing config
{
  path: '/products',
  element: <ProductsPage />,
  children: [
    {
      path: ':id/quick-view',
      element: <ProductQuickViewModal />,
    },
  ],
}

// Navigate to show modal
<Link to={`/products/${product.id}/quick-view`}>
  Quick View
</Link>

// The URL becomes /products/123/quick-view
// But the modal is shown over the products list
// Closing the modal navigates back to /products
```
```

### Example 3: MFE Directory Structure

```markdown
## MFE Directory Structure

### Standard Structure

Every MFE follows this directory structure:

```
products-mfe/
├── public/
│   └── favicon.ico
├── src/
│   ├── __generated__/         # Relay generated files
│   ├── components/             # Shared components within this MFE
│   │   ├── ProductCard/
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductCard.test.tsx
│   │   │   └── index.ts
│   │   └── CategoryBadge/
│   ├── features/               # Feature-based organization
│   │   ├── product-list/
│   │   │   ├── ProductListPage.tsx
│   │   │   ├── ProductFilter.tsx
│   │   │   ├── ProductSort.tsx
│   │   │   └── index.ts
│   │   ├── product-detail/
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── ProductInfo.tsx
│   │   │   ├── ProductReviews.tsx
│   │   │   └── index.ts
│   │   └── product-create/
│   ├── hooks/                  # Custom hooks for this MFE
│   │   ├── useProductFilters.ts
│   │   └── useProductSearch.ts
│   ├── utils/                  # Utility functions
│   │   ├── formatters.ts
│   │   └── validators.ts
│   ├── types/                  # TypeScript types
│   │   ├── product.ts
│   │   └── category.ts
│   ├── routes/                 # Route configuration
│   │   └── index.tsx
│   ├── App.tsx                 # MFE root component
│   ├── bootstrap.tsx           # MFE entry point
│   └── index.ts                # Module federation export
├── relay.config.js             # Relay compiler config
├── webpack.config.js           # Webpack + Module Federation
├── tsconfig.json               # TypeScript config
├── package.json
└── README.md
```

### Key Files

#### package.json

```json
{
  "name": "@company/products-mfe",
  "version": "1.2.3",
  "private": true,
  "scripts": {
    "dev": "webpack serve --mode development",
    "build": "webpack --mode production",
    "relay": "relay-compiler",
    "test": "jest",
    "lint": "eslint src",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "18.2.0",
    "react-dom": "18.2.0",
    "react-relay": "14.1.0",
    "react-router-dom": "6.10.0",
    "@company/picnic": "^2.0.0",
    "@company/yogi": "^1.5.0",
    "@company/shell-components": "^1.0.0"
  },
  "devDependencies": {
    "@types/react": "18.2.0",
    "@types/react-dom": "18.2.0",
    "webpack": "5.80.0",
    "webpack-cli": "5.0.0",
    "webpack-dev-server": "4.13.0",
    "@module-federation/webpack-5": "^1.0.0",
    "typescript": "5.0.0",
    "relay-compiler": "14.1.0"
  }
}
```

#### webpack.config.js (Module Federation)

```js
const ModuleFederationPlugin = require('@module-federation/webpack-5').ModuleFederationPlugin
const packageJson = require('./package.json')

module.exports = {
  entry: './src/index.ts',
  mode: process.env.NODE_ENV || 'development',
  devServer: {
    port: 3002,
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: 'auto',
    uniqueName: 'products-mfe',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: 'products',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
        './routes': './src/routes',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: packageJson.dependencies.react,
        },
        'react-dom': {
          singleton: true,
          requiredVersion: packageJson.dependencies['react-dom'],
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: packageJson.dependencies['react-router-dom'],
        },
        'react-relay': {
          singleton: true,
          requiredVersion: packageJson.dependencies['react-relay'],
        },
      },
    }),
  ],
}
```

#### src/index.ts (Module Federation Export)

```tsx
import('./bootstrap')
```

#### src/bootstrap.tsx (MFE Entry)

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { RelayEnvironmentProvider } from 'react-relay'
import { PicnicProvider } from '@company/picnic'
import { App } from './App'
import { relayEnvironment } from '@company/shell-components'

// Only render standalone in development
if (process.env.NODE_ENV === 'development') {
  const root = document.getElementById('root')
  if (root) {
    ReactDOM.createRoot(root).render(
      <React.StrictMode>
        <RelayEnvironmentProvider environment={relayEnvironment}>
          <PicnicProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </PicnicProvider>
        </RelayEnvironmentProvider>
      </React.StrictMode>
    )
  }
}

// Export for shell to consume
export { App } from './App'
export { routes } from './routes'
```

#### src/routes/index.tsx (Route Configuration)

```tsx
import { lazy } from 'react'
import type { RouteObject } from 'react-router-dom'

const ProductListPage = lazy(() => import('../features/product-list/ProductListPage'))
const ProductDetailPage = lazy(() => import('../features/product-detail/ProductDetailPage'))
const ProductCreatePage = lazy(() => import('../features/product-create/ProductCreatePage'))

export const routes: RouteObject[] = [
  {
    path: '/products',
    children: [
      {
        index: true,
        element: <ProductListPage />,
      },
      {
        path: 'new',
        element: <ProductCreatePage />,
      },
      {
        path: ':productId',
        element: <ProductDetailPage />,
      },
      {
        path: ':productId/edit',
        element: <ProductEditPage />,
      },
    ],
  },
]
```

### Shared Types (Cross-MFE Communication)

Create shared types in a separate package:

```
packages/
└── mfe-contracts/
    ├── src/
    │   ├── events/
    │   │   ├── user-events.ts
    │   │   ├── product-events.ts
    │   │   └── order-events.ts
    │   └── index.ts
    ├── package.json
    └── tsconfig.json
```

```tsx
// packages/mfe-contracts/src/events/user-events.ts
export interface UserUpdatedEvent {
  type: 'user.updated'
  payload: {
    userId: string
    userName: string
    email: string
    timestamp: number
  }
}

export interface UserDeletedEvent {
  type: 'user.deleted'
  payload: {
    userId: string
    timestamp: number
  }
}

export type UserEvents = UserUpdatedEvent | UserDeletedEvent
```

Each MFE imports these types for type-safe communication.
```
