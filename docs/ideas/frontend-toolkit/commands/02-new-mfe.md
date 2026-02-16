# /new-mfe Command - Planning Document

## Overview

The `/new-mfe` command provides a guided workflow for creating new Micro Frontend (MFE) applications with proper directory structure, routing configuration, entry points, and boilerplate components. It orchestrates specialized agents to handle architecture planning and scaffolding.

**Target audience**: Frontend engineers working with Micro Frontend architecture, React Router, TypeScript, and module federation

**Design goals**:
- Scaffold complete MFE with correct boundaries
- Configure routing and navigation
- Set up module federation entry points
- Generate boilerplate layout and placeholder pages
- Enforce team conventions for MFE structure
- Integrate with existing MFE infrastructure

---

## Command Metadata

### Frontmatter

```yaml
---
description: Create a new Micro Frontend application with routing, entry points, and boilerplate structure
argument-hint: mfe-name [--route /path] [--port 3001] [--shared-deps]
---
```

### Command Invocation

```bash
# Interactive mode (asks all questions)
/new-mfe

# With MFE name
/new-mfe user-profile

# With routing configuration
/new-mfe user-profile --route /profile

# Full specification
/new-mfe user-profile --route /profile --port 3001 --shared-deps react,react-dom,react-router
```

### Argument Parsing

- **$ARGUMENTS**: User input after command name
- Parse flags: `--route`, `--port`, `--shared-deps`, `--template`
- MFE name: First positional argument (kebab-case)

---

## Command .md Content Outline

### Header Section

```markdown
# Create New Micro Frontend

This command scaffolds a new Micro Frontend (MFE) application with:
- Complete directory structure following team conventions
- Module federation configuration (Webpack/Vite)
- Routing setup (React Router)
- Entry point and bootstrap logic
- Layout component and placeholder pages
- Shared dependency configuration
- Development server setup

The command uses specialized agents to ensure architectural consistency and proper MFE boundaries.

## Usage

```bash
/new-mfe [mfe-name] [options]
```

### Options

- `--route <path>`: Base route for the MFE (default: /mfe-name)
  - Example: `--route /profile` for profile MFE
  - Must be unique across MFEs
  - Should start with /

- `--port <number>`: Development server port (default: auto-assigned)
  - Example: `--port 3001`
  - Must be available and not conflict with other MFEs
  - Typically 3001-3010 range

- `--shared-deps <comma-separated>`: Shared dependencies via module federation
  - Example: `--shared-deps react,react-dom,react-router`
  - Default: react, react-dom, react-router-dom
  - Use for dependencies that should be singleton across MFEs

- `--template <name>`: MFE template (default: standard)
  - **standard**: Full-featured MFE with routing and layout
  - **simple**: Minimal MFE without routing (single component)
  - **dashboard**: Dashboard-style MFE with widgets and grid layout

### Examples

```bash
# Create user profile MFE
/new-mfe user-profile --route /profile --port 3001

# Create settings MFE with custom shared deps
/new-mfe settings --route /settings --port 3002 --shared-deps react,react-dom,relay-runtime

# Create simple widget MFE (no routing)
/new-mfe header-widget --template simple
```

## MFE Architecture

Micro Frontends enable independent development and deployment of application features. Each MFE:
- Runs as a standalone application in development
- Exposes components via module federation in production
- Has its own routing, state management, and dependencies
- Communicates with other MFEs via shared event bus or props
- Can be deployed independently

### Team Conventions

- **Naming**: kebab-case for MFE names (user-profile, admin-dashboard)
- **Routes**: Each MFE owns a top-level route (e.g., /profile/*)
- **Ports**: Development ports 3001-3010 reserved for MFEs
- **Shared deps**: React, React Router, and Relay always shared
- **Host app**: Shell application (port 3000) orchestrates MFEs
```

---

### Phase 1: Discovery

```markdown
## Phase 1: Discovery

**Goal**: Gather all information needed to architect and scaffold the MFE.

### 1.1 Parse Arguments

Check if MFE name and options were provided:

```bash
MFE_NAME="${ARGUMENTS%% --*}"  # Extract first positional arg
ROUTE_FLAG=$(echo "$ARGUMENTS" | grep -oP '(?<=--route )[^\s]+' || echo "")
PORT_FLAG=$(echo "$ARGUMENTS" | grep -oP '(?<=--port )\d+' || echo "")
SHARED_DEPS_FLAG=$(echo "$ARGUMENTS" | grep -oP '(?<=--shared-deps )[^\s]+' || echo "")
TEMPLATE_FLAG=$(echo "$ARGUMENTS" | grep -oP '(?<=--template )[^\s]+' || echo "standard")
```

If MFE name is missing, prompt user:

**Prompt**:
```
What is the MFE name? (kebab-case, e.g., user-profile, admin-dashboard, payment-flow)

Guidelines:
- Use kebab-case (lowercase with hyphens)
- Be descriptive but concise (2-3 words max)
- Reflect the feature/domain (not generic like "app" or "module")

MFE name:
```

**Validation**:
- Must be kebab-case (lowercase, hyphens only)
- No special characters or spaces
- Should be unique (check if MFE already exists)

**Store result**:
```bash
MFE_NAME="<validated-name>"
```

### 1.2 MFE Purpose and Scope

**Prompt**:
```
Describe the purpose of this MFE in 1-2 sentences:
(What feature/domain does it handle? What pages/screens will it include?)
```

**Example responses**:
- "Handles user profile management, including profile view, edit, and settings pages"
- "Admin dashboard for viewing analytics, managing users, and system configuration"
- "Payment flow for checkout, payment method selection, and order confirmation"

**Store result**:
```bash
MFE_DESCRIPTION="<user input>"
```

### 1.3 Routing Configuration

If `--route` not provided, ask:

**Prompt**:
```
What is the base route for this MFE?

The base route is the top-level path that this MFE will handle.
All pages within this MFE will be under this route.

Examples:
- /profile (for user-profile MFE)
- /admin (for admin-dashboard MFE)
- /checkout (for payment-flow MFE)

Base route (start with /):
```

**Validation**:
- Must start with /
- Should be kebab-case
- Check for conflicts with existing MFE routes

**Store result**:
```bash
MFE_ROUTE="<validated-route>"
```

**Ask about subroutes**:
```
What pages/routes will this MFE include?

Enter comma-separated list of subroutes (without base route):
Example for /profile: view, edit, settings
(Generates /profile/view, /profile/edit, /profile/settings)

Subroutes:
```

**Store result**:
```bash
MFE_SUBROUTES="<comma-separated-list>"
# Example: "view,edit,settings"
```

### 1.4 Data Requirements

**Prompt**:
```
What data will this MFE need to fetch/display?

Select all that apply:
1. GraphQL data via Relay
2. REST API data
3. Local state only (no backend)
4. Shared state from other MFEs
5. Real-time data (websockets/subscriptions)

Enter numbers (comma-separated):
```

**Parse response** and store:
```bash
NEEDS_RELAY="<true|false>"
NEEDS_REST="<true|false>"
NEEDS_SHARED_STATE="<true|false>"
NEEDS_REALTIME="<true|false>"
```

If Relay selected, ask:
```
What GraphQL types will this MFE query? (e.g., User, Profile, Settings)

GraphQL types (comma-separated):
```

**Store result**:
```bash
GRAPHQL_TYPES="<comma-separated-list>"
```

### 1.5 Port Assignment

If `--port` not provided:

**Check available ports**:
```bash
# Check ports 3001-3010 for availability
for port in {3001..3010}; do
  if ! lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
    AVAILABLE_PORTS+=($port)
  fi
done
```

**Prompt**:
```
Select development server port:

Available ports: ${AVAILABLE_PORTS[@]}

Recommended: ${AVAILABLE_PORTS[0]} (first available)

Port:
```

**Store result**:
```bash
MFE_PORT="<selected-port>"
```

### 1.6 Shared Dependencies

If `--shared-deps` not provided:

**Default shared dependencies**:
```bash
DEFAULT_SHARED_DEPS="react,react-dom,react-router-dom"
```

**Prompt**:
```
Shared dependencies are loaded once by the host app and shared across MFEs.
This reduces bundle size and ensures singleton behavior.

Default shared deps: ${DEFAULT_SHARED_DEPS}

Add additional shared dependencies? (e.g., relay-runtime, @picnic/components)
Leave blank to use defaults.

Additional shared deps (comma-separated):
```

**Store result**:
```bash
if [[ -n "$ADDITIONAL_DEPS" ]]; then
  SHARED_DEPS="${DEFAULT_SHARED_DEPS},${ADDITIONAL_DEPS}"
else
  SHARED_DEPS="${DEFAULT_SHARED_DEPS}"
fi
```

### 1.7 Template Selection

If `--template` not provided:

**Prompt**:
```
Select MFE template:

1. **standard** (recommended) - Full-featured MFE with routing and layout
   - Multiple pages with React Router
   - Layout component with navigation
   - Placeholder pages for each route

2. **simple** - Minimal MFE without routing (single component)
   - Single root component
   - No routing or navigation
   - Useful for widgets, headers, footers

3. **dashboard** - Dashboard-style MFE with grid layout
   - Widget-based layout
   - Drag-and-drop grid (react-grid-layout)
   - Multiple dashboard widgets

Choose template (1/2/3 or name):
```

**Store result**:
```bash
MFE_TEMPLATE="<standard|simple|dashboard>"
```

### 1.8 Discovery Summary

Present gathered information to user:

**Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MFE Creation Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:        ${MFE_NAME}
Description: ${MFE_DESCRIPTION}
Template:    ${MFE_TEMPLATE}

Routing:
  Base route: ${MFE_ROUTE}
  Subroutes:  ${MFE_SUBROUTES}

Data sources:
  ${NEEDS_RELAY:+✓ Relay (GraphQL types: ${GRAPHQL_TYPES})}
  ${NEEDS_REST:+✓ REST API}
  ${NEEDS_SHARED_STATE:+✓ Shared state}
  ${NEEDS_REALTIME:+✓ Real-time updates}

Configuration:
  Port:         ${MFE_PORT}
  Shared deps:  ${SHARED_DEPS}

Directory structure:
  apps/${MFE_NAME}/
  ├── src/
  │   ├── bootstrap.tsx      # Entry point
  │   ├── App.tsx             # Root component
  │   ├── routes.tsx          # Route definitions
  │   ├── components/         # MFE components
  │   ├── pages/              # Page components
  │   └── shared/             # Shared utilities
  ├── public/                 # Static assets
  ├── webpack.config.js       # Module federation config
  ├── tsconfig.json           # TypeScript config
  └── package.json            # Dependencies

Proceed with this configuration? (yes/no):
```

If user says no, return to discovery questions.
```

---

### Phase 2: Architecture

```markdown
## Phase 2: Architecture

**Goal**: Design the MFE's architecture, boundaries, and integration points.

### 2.1 Spawn MFE Architect Agent

```typescript
Task({
  subagent_type: "agent",
  name: "mfe-architect",
  prompt: `You are a Micro Frontend architect specializing in module federation, React Router, and distributed system design.

Your task: Design the architecture for the ${MFE_NAME} MFE.

MFE specifications:
- Name: ${MFE_NAME}
- Description: ${MFE_DESCRIPTION}
- Base route: ${MFE_ROUTE}
- Subroutes: ${MFE_SUBROUTES}
- Template: ${MFE_TEMPLATE}
- Port: ${MFE_PORT}
- Data sources: ${NEEDS_RELAY ? 'Relay' : ''} ${NEEDS_REST ? 'REST' : ''} ${NEEDS_SHARED_STATE ? 'Shared State' : ''}

Create a detailed architectural blueprint including:

1. **MFE Boundaries**
   - What functionality belongs in this MFE
   - What should be handled by other MFEs or the host
   - Clear interfaces/contracts with other MFEs
   - Dependency relationships

2. **Routing Strategy**
   - Route structure and nesting
   - Route parameters and query strings
   - Protected routes (authentication)
   - Navigation between MFEs
   - Deep linking support

3. **Module Federation Configuration**
   - Exposed components/modules
   - Remote entry point
   - Shared dependencies (version strategy)
   - Singleton requirements
   - Webpack/Vite specific config

4. **State Management**
   - Local state (useState, useReducer)
   - Shared state across MFE (context, event bus)
   ${NEEDS_RELAY ? '- Relay store and environment setup' : ''}
   - State synchronization with other MFEs
   - Persistence strategy

5. **Data Fetching**
   ${NEEDS_RELAY ? `
   - Relay environment configuration
   - GraphQL fragments and queries for: ${GRAPHQL_TYPES}
   - Suspense boundaries for loading states
   - Error boundaries for query failures
   ` : ''}
   ${NEEDS_REST ? `
   - REST API endpoints
   - Fetch/axios configuration
   - Caching strategy
   - Error handling
   ` : ''}

6. **Communication Patterns**
   - Events published by this MFE
   - Events consumed from other MFEs
   - Shared event bus specification
   - Props passed from host app
   - Callbacks/handlers

7. **Layout Structure**
   - Top-level layout component
   - Navigation within MFE
   - Shared header/footer (if any)
   - Responsive behavior
   - Loading/error states

8. **Page Components**
   For each subroute in ${MFE_SUBROUTES}:
   - Page purpose and key features
   - Required data/props
   - Child components needed
   - User interactions

9. **Performance Considerations**
   - Code splitting strategy
   - Lazy loading of pages/components
   - Bundle size targets
   - Initial load performance
   - Runtime performance

10. **Development Workflow**
    - Standalone development setup
    - Integration with host app
    - Hot module replacement
    - Debugging across MFE boundaries

Present the blueprint as a structured document. Store the full architecture in task metadata as 'mfe_architecture'.`,

  autonomous: true,
  max_turns: 15
})
```

### 2.2 Review Architecture Blueprint

When mfe-architect agent completes:

**Extract blueprint**:
```typescript
const architecture = architectTask.metadata.mfe_architecture;
```

**Present to user**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MFE Architecture Blueprint
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Display formatted architecture with all sections]

Key integration points:
- Host app integration: ${HOST_INTEGRATION}
- Other MFE dependencies: ${MFE_DEPENDENCIES}
- Exposed components: ${EXPOSED_COMPONENTS}
- Consumed events: ${CONSUMED_EVENTS}
- Published events: ${PUBLISHED_EVENTS}

Does this architecture look correct?

Options:
- yes: Proceed to scaffolding
- no: Describe changes needed
- revise: Re-run architect with your feedback
```

If user requests changes:
- Update prompt with user feedback
- Re-spawn mfe-architect with revised requirements
- Present updated blueprint for approval

### 2.3 Store Architecture Decisions

Save approved architecture for scaffolding phase:

```bash
# Store in environment variables
export MFE_ARCHITECTURE="<full architecture>"
export EXPOSED_COMPONENTS="<component list>"
export ROUTING_CONFIG="<routing structure>"
export MODULE_FEDERATION_CONFIG="<federation config>"
```
```

---

### Phase 3: Scaffolding

```markdown
## Phase 3: Scaffolding

**Goal**: Generate complete MFE directory structure and boilerplate code.

### 3.1 Spawn MFE Scaffolder Agent

```typescript
Task({
  subagent_type: "agent",
  name: "mfe-scaffolder",
  prompt: `You are an MFE scaffolding specialist. Generate complete MFE boilerplate code.

Your task: Scaffold the ${MFE_NAME} MFE based on the approved architecture.

Architecture:
${architecture}

MFE configuration:
- Name: ${MFE_NAME}
- Base route: ${MFE_ROUTE}
- Port: ${MFE_PORT}
- Template: ${MFE_TEMPLATE}
- Shared deps: ${SHARED_DEPS}

Generate the following files and directories:

### 1. Directory Structure

Create directory: apps/${MFE_NAME}/

\`\`\`
apps/${MFE_NAME}/
├── src/
│   ├── bootstrap.tsx
│   ├── index.ts
│   ├── App.tsx
│   ├── routes.tsx
│   ├── components/
│   │   └── Layout.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   └── [one file per subroute]
│   ├── shared/
│   │   ├── types.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   ${NEEDS_RELAY ? '├── relay/\n│   │   └── environment.ts' : ''}
│   └── styles/
│       └── index.css
├── public/
│   └── index.html
├── webpack.config.js
├── tsconfig.json
├── package.json
└── README.md
\`\`\`

### 2. Entry Point (src/index.ts)

\`\`\`typescript
// Dynamic import for module federation
// This pattern allows the host app to load shared deps first
import('./bootstrap');

export {};
\`\`\`

### 3. Bootstrap (src/bootstrap.tsx)

\`\`\`typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
${NEEDS_RELAY ? "import { RelayEnvironmentProvider } from 'react-relay';\nimport { relayEnvironment } from './relay/environment';" : ''}
import App from './App';
import './styles/index.css';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <BrowserRouter basename="${MFE_ROUTE}">
      ${NEEDS_RELAY ? '<RelayEnvironmentProvider environment={relayEnvironment}>' : ''}
        <App />
      ${NEEDS_RELAY ? '</RelayEnvironmentProvider>' : ''}
    </BrowserRouter>
  </React.StrictMode>
);
\`\`\`

### 4. App Component (src/App.tsx)

\`\`\`typescript
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { routes } from './routes';

const App: React.FC = () => {
  return (
    <Layout>
      <Routes>
        {routes.map((route) => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
      </Routes>
    </Layout>
  );
};

export default App;

// Export for module federation
export { App };
\`\`\`

### 5. Routes Configuration (src/routes.tsx)

\`\`\`typescript
import { lazy } from 'react';

// Lazy load page components for code splitting
${MFE_SUBROUTES.split(',').map(route =>
  `const ${pascalCase(route)}Page = lazy(() => import('./pages/${pascalCase(route)}Page'));`
).join('\n')}

export interface Route {
  path: string;
  component: React.ComponentType;
  title: string;
  requiresAuth?: boolean;
}

export const routes: Route[] = [
  ${MFE_SUBROUTES.split(',').map((route, idx) => `{
    path: '${route}',
    component: ${pascalCase(route)}Page,
    title: '${titleCase(route)}',
    requiresAuth: false,
  }`).join(',\n  ')}
];
\`\`\`

### 6. Layout Component (src/components/Layout.tsx)

\`\`\`typescript
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { routes } from '../routes';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">
            ${titleCase(MFE_NAME)}
          </h1>
          <nav className="flex gap-4">
            {routes.map((route) => (
              <Link
                key={route.path}
                to={route.path}
                className={\`
                  px-3 py-2 rounded-md text-sm font-medium
                  \${location.pathname === route.path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'}
                \`}
              >
                {route.title}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <React.Suspense fallback={<div>Loading...</div>}>
          {children}
        </React.Suspense>
      </main>

      <footer className="bg-gray-50 border-t border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto text-center text-sm text-gray-600">
          ${titleCase(MFE_NAME)} MFE
        </div>
      </footer>
    </div>
  );
};
\`\`\`

### 7. Page Components (src/pages/*.tsx)

For each subroute in ${MFE_SUBROUTES}, create placeholder page:

\`\`\`typescript
// src/pages/${pascalCase(route)}Page.tsx
import React from 'react';

const ${pascalCase(route)}Page: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">
        ${titleCase(route)}
      </h1>
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-600">
          ${titleCase(route)} page content goes here.
        </p>
      </div>
    </div>
  );
};

export default ${pascalCase(route)}Page;
\`\`\`

${NEEDS_RELAY ? `
### 8. Relay Environment (src/relay/environment.ts)

\`\`\`typescript
import { Environment, Network, RecordSource, Store } from 'relay-runtime';

function fetchQuery(operation: any, variables: any) {
  return fetch(process.env.REACT_APP_GRAPHQL_ENDPOINT || '/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then((response) => response.json());
}

export const relayEnvironment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});
\`\`\`
` : ''}

### 9. Module Federation Config (webpack.config.js)

\`\`\`javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: 'development',
  devServer: {
    port: ${MFE_PORT},
    historyApiFallback: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: 'http://localhost:${MFE_PORT}/',
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\\.tsx?$/,
        loader: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader'],
      },
    ],
  },
  plugins: [
    new ModuleFederationPlugin({
      name: '${camelCase(MFE_NAME)}',
      filename: 'remoteEntry.js',
      exposes: {
        './App': './src/App',
      },
      shared: {
        ${SHARED_DEPS.split(',').map(dep => `'${dep.trim()}': {
          singleton: true,
          requiredVersion: false,
        }`).join(',\n        ')}
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
};
\`\`\`

### 10. TypeScript Config (tsconfig.json)

\`\`\`json
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "allowJs": true,
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
\`\`\`

### 11. Package.json

\`\`\`json
{
  "name": "${MFE_NAME}",
  "version": "1.0.0",
  "description": "${MFE_DESCRIPTION}",
  "scripts": {
    "start": "webpack serve --open",
    "build": "webpack --mode production",
    "test": "jest",
    "lint": "eslint src --ext .ts,.tsx",
    "type-check": "tsc --noEmit"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0"${NEEDS_RELAY ? ',\n    "react-relay": "^16.0.0",\n    "relay-runtime": "^16.0.0"' : ''}
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/react-router-dom": "^5.3.3",
    "ts-loader": "^9.5.1",
    "typescript": "^5.3.3",
    "webpack": "^5.89.0",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.15.1",
    "html-webpack-plugin": "^5.6.0",
    "css-loader": "^6.8.1",
    "style-loader": "^3.3.3",
    "postcss": "^8.4.32",
    "postcss-loader": "^7.3.3",
    "tailwindcss": "^3.3.6",
    "autoprefixer": "^10.4.16"
  }
}
\`\`\`

### 12. README.md

\`\`\`markdown
# ${titleCase(MFE_NAME)} MFE

${MFE_DESCRIPTION}

## Development

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm start

# Open http://localhost:${MFE_PORT}
\`\`\`

## Routes

${MFE_SUBROUTES.split(',').map(route => `- \`${MFE_ROUTE}/${route}\` - ${titleCase(route)}`).join('\n')}

## Module Federation

This MFE exposes the following components:
- \`./App\` - Main application component

## Integration

Add to host app's webpack config:

\`\`\`javascript
remotes: {
  ${camelCase(MFE_NAME)}: '${camelCase(MFE_NAME)}@http://localhost:${MFE_PORT}/remoteEntry.js',
}
\`\`\`

Then import in host:

\`\`\`typescript
const ${pascalCase(MFE_NAME)}App = lazy(() => import('${camelCase(MFE_NAME)}/App'));
\`\`\`
\`\`\`

After creating all files, store the MFE root path in task metadata as 'mfe_path': 'apps/${MFE_NAME}'.`,

  autonomous: true,
  max_turns: 20
})
```

### 3.2 Install Dependencies

When scaffolder completes:

**Run npm install**:
```bash
cd apps/${MFE_NAME}
npm install
```

**Output progress**:
```
📦 Installing dependencies...
   This may take a few minutes...
```

### 3.3 Verify Scaffolding

**Check all required files exist**:
```bash
REQUIRED_FILES=(
  "src/bootstrap.tsx"
  "src/index.ts"
  "src/App.tsx"
  "src/routes.tsx"
  "src/components/Layout.tsx"
  "webpack.config.js"
  "tsconfig.json"
  "package.json"
)

for file in "${REQUIRED_FILES[@]}"; do
  if [[ ! -f "apps/${MFE_NAME}/$file" ]]; then
    echo "❌ Missing required file: $file"
    exit 1
  fi
done
```

**Check page components**:
```bash
for route in ${MFE_SUBROUTES//,/ }; do
  PAGE_FILE="src/pages/${pascalCase(route)}Page.tsx"
  if [[ ! -f "apps/${MFE_NAME}/$PAGE_FILE" ]]; then
    echo "❌ Missing page component: $PAGE_FILE"
    exit 1
  fi
done
```

**Output**:
```
✅ MFE scaffolding complete
   Location: apps/${MFE_NAME}/
   Files created: <count>
   Dependencies installed: <count> packages
```
```

---

### Phase 4: Verification

```markdown
## Phase 4: Verification

**Goal**: Verify MFE builds, runs, and integrates correctly.

### 4.1 TypeScript Compilation

**Run type check**:
```bash
cd apps/${MFE_NAME}
npm run type-check
```

**If type errors**:
```
❌ TypeScript compilation failed

Errors:
[Show tsc output]

Would you like me to fix these errors? (yes/no)
```

If yes, spawn mfe-scaffolder again with error context to fix issues.

### 4.2 Webpack Build

**Run webpack build**:
```bash
cd apps/${MFE_NAME}
npm run build
```

**Verify output**:
- Check dist/remoteEntry.js exists
- Verify bundle size is reasonable (<500KB for initial bundle)

**Output**:
```
✅ Webpack build successful
   Bundle size: <size> KB
   Output: dist/remoteEntry.js
```

### 4.3 Development Server

**Start dev server**:
```bash
cd apps/${MFE_NAME}
npm start &
DEV_SERVER_PID=$!
```

**Wait for server to start**:
```bash
# Poll localhost:${MFE_PORT} until it responds
timeout 30s bash -c "until curl -s http://localhost:${MFE_PORT} > /dev/null; do sleep 1; done"
```

**If server doesn't start**:
```
❌ Development server failed to start on port ${MFE_PORT}

Check for:
- Port already in use
- Webpack configuration errors
- Missing dependencies

View logs: tail -f apps/${MFE_NAME}/webpack.log
```

**If server starts successfully**:
```
✅ Development server running
   URL: http://localhost:${MFE_PORT}
   PID: ${DEV_SERVER_PID}
```

### 4.4 Routing Verification

**Test each route**:
```bash
for route in ${MFE_SUBROUTES//,/ }; do
  ROUTE_URL="http://localhost:${MFE_PORT}${MFE_ROUTE}/${route}"
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$ROUTE_URL")

  if [[ "$HTTP_STATUS" == "200" ]]; then
    echo "✅ ${MFE_ROUTE}/${route} - OK"
  else
    echo "❌ ${MFE_ROUTE}/${route} - HTTP $HTTP_STATUS"
  fi
done
```

### 4.5 Module Federation Entry Point

**Verify remoteEntry.js is accessible**:
```bash
REMOTE_ENTRY_URL="http://localhost:${MFE_PORT}/remoteEntry.js"
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$REMOTE_ENTRY_URL")

if [[ "$HTTP_STATUS" == "200" ]]; then
  echo "✅ Module federation entry point accessible"
else
  echo "❌ remoteEntry.js not accessible (HTTP $HTTP_STATUS)"
fi
```

### 4.6 Integration Instructions

**Generate host app integration snippet**:

```typescript
// Host app webpack.config.js
remotes: {
  ${camelCase(MFE_NAME)}: '${camelCase(MFE_NAME)}@http://localhost:${MFE_PORT}/remoteEntry.js',
}

// Host app usage
import { lazy } from 'react';

const ${pascalCase(MFE_NAME)}App = lazy(() => import('${camelCase(MFE_NAME)}/App'));

// In routes:
<Route path="${MFE_ROUTE}/*" element={<${pascalCase(MFE_NAME)}App />} />
```

### 4.7 Final Summary

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MFE Creation Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

MFE: ${MFE_NAME}
Location: apps/${MFE_NAME}/
Template: ${MFE_TEMPLATE}

Routes:
${MFE_SUBROUTES.split(',').map(route => `  ✅ ${MFE_ROUTE}/${route}`).join('\n')}

Configuration:
  Dev server: http://localhost:${MFE_PORT}
  Remote entry: http://localhost:${MFE_PORT}/remoteEntry.js
  Base route: ${MFE_ROUTE}

Validation:
  ✅ TypeScript: No errors
  ✅ Webpack: Build successful
  ✅ Dev server: Running (PID: ${DEV_SERVER_PID})
  ✅ Routes: All accessible
  ✅ Module federation: Entry point available

Files created:
  - src/bootstrap.tsx (entry point)
  - src/App.tsx (root component)
  - src/routes.tsx (routing config)
  - src/components/Layout.tsx (layout)
  - src/pages/*.tsx (${MFE_SUBROUTES.split(',').length} page components)
  - webpack.config.js (module federation)
  - package.json (${PACKAGE_COUNT} dependencies)

Next steps:
1. Visit http://localhost:${MFE_PORT} to see your MFE
2. Edit src/pages/*.tsx to implement page content
3. Add to host app using integration snippet above
4. Configure shared state/event bus (if needed)
${NEEDS_RELAY ? '5. Set up Relay schema and generate types' : ''}

Integration snippet:
\`\`\`typescript
// In host app webpack.config.js
remotes: {
  ${camelCase(MFE_NAME)}: '${camelCase(MFE_NAME)}@http://localhost:${MFE_PORT}/remoteEntry.js',
}

// In host app routes
<Route path="${MFE_ROUTE}/*" element={<${pascalCase(MFE_NAME)}App />} />
\`\`\`

Documentation: apps/${MFE_NAME}/README.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Stop dev server (optional)**:
```
The development server is running in the background.
To stop it, run: kill ${DEV_SERVER_PID}

Leave it running? (yes/no)
```

If user says no:
```bash
kill $DEV_SERVER_PID
echo "✅ Development server stopped"
```
```

---

## Validation Criteria

### Expected Output

A complete, successful /new-mfe execution produces:

1. **Directory structure** at `apps/${MFE_NAME}/`:
   - src/ with all source files
   - public/ with HTML template
   - Configuration files (webpack, tsconfig, package.json)
   - README.md with usage instructions

2. **Entry point** (`src/index.ts` and `src/bootstrap.tsx`):
   - Proper dynamic import pattern for module federation
   - React app initialization
   - Router setup with base route
   - Relay environment (if applicable)

3. **App component** (`src/App.tsx`):
   - Exported for module federation
   - Routes integration
   - Layout wrapper
   - Suspense for lazy loading

4. **Routes** (`src/routes.tsx`):
   - Route configuration array
   - Lazy-loaded page components
   - Type-safe route definitions

5. **Layout** (`src/components/Layout.tsx`):
   - Navigation between routes
   - Consistent header/footer
   - Suspense fallback

6. **Page components** (`src/pages/*.tsx`):
   - One file per subroute
   - Basic placeholder content
   - TypeScript types

7. **Module federation config** (`webpack.config.js`):
   - Correct port and public path
   - Exposes ./App module
   - Shared dependencies configuration
   - HTML plugin setup

8. **TypeScript config** (`tsconfig.json`):
   - Strict mode enabled
   - React JSX support
   - Path aliases

9. **Package.json**:
   - Correct dependencies
   - Start/build/test scripts
   - Module federation peer dependencies

10. **Working dev server**:
    - Runs on specified port
    - All routes accessible
    - remoteEntry.js available
    - No compilation errors

### Validation Checks

```bash
# All required files exist
[[ -f "apps/${MFE_NAME}/src/bootstrap.tsx" ]] || exit 1
[[ -f "apps/${MFE_NAME}/webpack.config.js" ]] || exit 1
[[ -f "apps/${MFE_NAME}/package.json" ]] || exit 1

# TypeScript compiles
cd apps/${MFE_NAME} && npm run type-check || exit 1

# Webpack builds
cd apps/${MFE_NAME} && npm run build || exit 1

# Dev server starts
cd apps/${MFE_NAME} && timeout 30s npm start || exit 1

# Routes are accessible
curl -f http://localhost:${MFE_PORT}${MFE_ROUTE}/view || exit 1

# remoteEntry.js exists
curl -f http://localhost:${MFE_PORT}/remoteEntry.js || exit 1
```

---

## Skills to Load When Building

```bash
/skill plugin-dev:command-development
```

---

## Error Handling

### Common Failure Scenarios

1. **MFE name already exists**:
   ```
   Error: MFE '${MFE_NAME}' already exists at apps/${MFE_NAME}

   Options:
   - Choose a different name
   - Delete existing MFE: rm -rf apps/${MFE_NAME}
   - Update existing MFE instead
   ```

2. **Port already in use**:
   ```
   Error: Port ${MFE_PORT} is already in use

   Process using port: [Show lsof output]

   Options:
   - Choose different port: --port <other-port>
   - Stop process on port ${MFE_PORT}
   ```

3. **Route conflict**:
   ```
   Error: Route ${MFE_ROUTE} is already claimed by MFE: ${EXISTING_MFE}

   Existing routes:
   [List all MFE routes]

   Choose a different base route.
   ```

4. **Webpack build fails**:
   ```
   Error: Webpack build failed

   Errors:
   [Show webpack errors]

   This may indicate:
   - Invalid webpack configuration
   - Missing dependencies
   - TypeScript errors in code

   Would you like me to fix these errors? (yes/no)
   ```

5. **Dev server won't start**:
   ```
   Error: Development server failed to start after 30s

   Check:
   - Port ${MFE_PORT} availability
   - Node version (requires 18+)
   - Webpack configuration
   - Dependencies installed

   View logs: tail -f apps/${MFE_NAME}/webpack.log
   ```

---

## Integration Notes

### Host App Integration

To integrate the new MFE into the host app:

1. **Update host webpack config**:
   ```javascript
   remotes: {
     ${camelCase(MFE_NAME)}: '${camelCase(MFE_NAME)}@http://localhost:${MFE_PORT}/remoteEntry.js',
   }
   ```

2. **Add route to host app**:
   ```typescript
   import { lazy } from 'react';
   const ${pascalCase(MFE_NAME)}App = lazy(() => import('${camelCase(MFE_NAME)}/App'));

   <Route path="${MFE_ROUTE}/*" element={<${pascalCase(MFE_NAME)}App />} />
   ```

3. **Update navigation**:
   Add link to MFE in host app navigation menu.

### Shared State

For MFEs that need shared state:

1. **Event bus pattern** (recommended):
   ```typescript
   // Publish event from MFE
   window.dispatchEvent(new CustomEvent('mfe:user-updated', { detail: user }));

   // Subscribe in other MFE or host
   window.addEventListener('mfe:user-updated', (e) => {
     console.log('User updated:', e.detail);
   });
   ```

2. **Context from host**:
   Host app can pass context providers that wrap MFEs.

### Production Build

For production deployment:

1. Build MFE: `npm run build`
2. Deploy dist/ to CDN
3. Update host app remote URLs to CDN URLs
4. Use versioned URLs for cache busting

---

## Performance Characteristics

### Execution Time

- Discovery phase: 1-2 minutes (user interaction)
- Architecture phase: 1-2 minutes (agent planning)
- Scaffolding phase: 2-3 minutes (file generation)
- npm install: 1-3 minutes (dependency installation)
- Verification phase: 1-2 minutes (build + dev server)
- **Total**: 6-12 minutes

### Token Usage

- Discovery: ~3k tokens
- Architecture agent: ~25k tokens
- Scaffolder agent: ~35k tokens
- **Total**: ~63k tokens

---

## Future Enhancements

1. **Templates**: More templates (admin, marketing, analytics)
2. **Monorepo integration**: Workspace setup for multiple MFEs
3. **Deployment**: CI/CD pipeline generation
4. **E2E tests**: Playwright/Cypress test generation
5. **Monitoring**: Error tracking and analytics setup
6. **Feature flags**: LaunchDarkly or similar integration
7. **A/B testing**: Experimentation framework
8. **SSR support**: Server-side rendering setup

---

## Implementation Checklist

- [ ] Write command .md with all 4 phases
- [ ] Define frontmatter (description, argument-hint)
- [ ] Implement discovery phase with all questions
- [ ] Create mfe-architect agent prompt
- [ ] Create mfe-scaffolder agent prompt
- [ ] Add verification logic (TypeScript, webpack, dev server)
- [ ] Handle error scenarios (port conflict, route conflict, build failures)
- [ ] Generate integration instructions
- [ ] Test with standard, simple, and dashboard templates
- [ ] Test with Relay integration
- [ ] Verify module federation works with host app
- [ ] Document in plugin README
- [ ] Get feedback from 3-5 frontend engineers
