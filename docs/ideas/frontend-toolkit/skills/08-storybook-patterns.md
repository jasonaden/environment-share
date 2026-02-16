# Skill Plan: Storybook Patterns

## Purpose and Scope

This skill provides comprehensive knowledge of Storybook patterns and conventions used across the organization's frontend applications. It enables agents to:

- Write effective Storybook stories for component documentation
- Apply CSF3 (Component Story Format 3) patterns correctly
- Configure args and controls for interactive documentation
- Use decorators for providing context (theme, Relay, routing)
- Document component variants and states comprehensively
- Implement accessibility testing in Storybook
- Create play functions for interaction testing
- Structure stories for discoverability
- Generate documentation with MDX when needed
- Integrate Storybook with design system and testing tools

The skill covers the complete Storybook workflow from basic stories to advanced patterns with Relay mock environments, interaction testing, and automated documentation generation.

## Trigger Description

```yaml
description: >
  This skill provides comprehensive knowledge of Storybook patterns and conventions for component documentation,
  including CSF3 story format, args and controls configuration, decorators for context providers, Relay mock stories,
  interaction testing with play functions, and documentation generation. This skill should be used when the user asks
  about Storybook, writing stories, documenting components, story decorators, visual testing, interaction testing,
  or component documentation.
```

## SKILL.md Specification

Target length: 1800 words

### Section 1: Introduction to Storybook at [Company] (200 words)
- Storybook as living documentation
- Why Storybook: component catalog, visual testing, development environment
- Storybook workflow in development
- Story file organization (co-located .stories.tsx)
- Running Storybook locally
- Storybook in CI/CD and deployment

### Section 2: CSF3 Story Format (350 words)
- Meta export for component configuration
- Story functions vs. objects
- Args pattern for props
- Story naming conventions
- Story organization and hierarchy
- Default exports and named exports
- Story parameters
- Tags for filtering and organization

### Section 3: Args and Controls (300 words)
- Defining args in stories
- ArgTypes configuration
- Control types (select, boolean, text, etc.)
- Grouping controls
- Disabling controls
- Mapping args to props
- Args composition and inheritance

### Section 4: Decorators and Context (350 words)
- Global decorators vs. story decorators
- Theme provider decorator
- Relay environment decorator
- Router decorator
- Layout decorators
- Combining multiple decorators
- Decorator ordering

### Section 5: Story Patterns by Component Type (400 words)
- Simple presentational components
- Components with Picnic dependencies
- Relay-connected components (mock environment)
- Form components with validation
- Interactive components with state
- Components with routing
- Modal and overlay components

### Section 6: Interaction Testing (150 words)
- Play functions for interactions
- Testing user flows in stories
- Accessibility testing in Storybook
- Visual regression testing
- Chromatic integration

### Section 7: Documentation (50 words)
- Auto-generated docs
- MDX for custom documentation
- Component API documentation

## Reference Files

### story-templates.md
**Purpose**: Complete templates and examples for different component types

**Estimated size**: 5,000-6,000 lines

**Outline**:
1. **Basic Story Template** (500 lines)
   - Meta configuration
   - Default story
   - Multiple variant stories
   - Args and argTypes
   - Complete example with Button component

2. **Picnic Component Stories** (800 lines)
   - Stories for components using Picnic
   - Theme decorator usage
   - Design token documentation
   - All variant stories
   - Complete example with Card component

3. **Relay Component Stories** (1,200 lines)
   - Mock Relay environment setup
   - Mock resolvers for fragments
   - Stories for loading states
   - Stories for error states
   - Stories for different data scenarios
   - Complete example with UserProfile component
   - Complete example with LiveTable component

4. **Form Component Stories** (800 lines)
   - Form input stories
   - Validation state stories
   - Form submit stories
   - Complete example with LoginForm component

5. **Interactive Component Stories** (700 lines)
   - Stories with play functions
   - User interaction testing
   - State change stories
   - Complete example with Dropdown component
   - Complete example with Modal component

6. **Advanced Patterns** (1,000 lines)
   - Stories with routing
   - Stories with multiple decorators
   - Stories with complex state
   - Stories with real-time updates
   - Accessibility testing stories
   - Visual regression testing setup

7. **Documentation Patterns** (500 lines)
   - Auto-generated documentation
   - Custom MDX documentation
   - Component API tables
   - Usage guidelines in stories
   - Do's and don'ts examples

## Used By Agents

- **storybook-writer**: Writes Storybook stories for components
- **component-builder**: Creates stories alongside components
- **frontend-reviewer**: Reviews story quality and coverage

## Dependencies

- **react-patterns**: Understanding components to document them
- **relay-conventions**: Mocking Relay data in stories
- **picnic-components**: Documenting design system usage
- **typescript-strict**: Typing story args and meta configuration

## Skills to Load When Building

- `plugin-dev:skill-development` (required for skill creation)

## Validation Criteria

### Should Trigger (3 test queries)

1. "How do I write a Storybook story for this component?"
2. "How do I mock Relay data in a story?"
3. "What's the correct decorator setup for a component with theme and routing?"

### Should NOT Trigger (2 test queries)

1. "How do I test this component?" (testing-conventions)
2. "How do I fetch data with Relay?" (relay-conventions)

### Progressive Disclosure Test

1. **Frontmatter only**: User asks "Should I write a story for this component?"
   - Expected: Agent confirms stories should be written for components

2. **SKILL.md loaded**: User asks "How do I structure stories for different variants?"
   - Expected: Agent provides overview of story patterns with args

3. **References loaded**: User asks "Show me a complete story example for a Relay component"
   - Expected: Agent provides full example from story-templates.md

## Example Content Snippets

### Example 1: Basic Story with CSF3

```markdown
## Basic Story Pattern (CSF3)

### Simple Presentational Component

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'tertiary', 'danger'],
      description: 'Visual style variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Button size',
    },
    disabled: {
      control: 'boolean',
      description: 'Disables the button',
    },
    loading: {
      control: 'boolean',
      description: 'Shows loading spinner',
    },
  },
}

export default meta
type Story = StoryObj<typeof Button>

// Default story
export const Primary: Story = {
  args: {
    children: 'Click me',
    variant: 'primary',
    size: 'md',
  },
}

// Additional variant stories
export const Secondary: Story = {
  args: {
    children: 'Click me',
    variant: 'secondary',
  },
}

export const Tertiary: Story = {
  args: {
    children: 'Click me',
    variant: 'tertiary',
  },
}

export const Danger: Story = {
  args: {
    children: 'Delete',
    variant: 'danger',
  },
}

// Size variants
export const Small: Story = {
  args: {
    children: 'Small Button',
    size: 'sm',
  },
}

export const Large: Story = {
  args: {
    children: 'Large Button',
    size: 'lg',
  },
}

// State variants
export const Disabled: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
}

export const Loading: Story = {
  args: {
    children: 'Loading',
    loading: true,
  },
}

// With icons
export const WithLeftIcon: Story = {
  args: {
    children: 'Add Item',
    leftIcon: <PlusIcon />,
  },
}

export const WithRightIcon: Story = {
  args: {
    children: 'Continue',
    rightIcon: <ArrowRightIcon />,
  },
}

// All variants showcase
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="tertiary">Tertiary</Button>
      <Button variant="danger">Danger</Button>
    </div>
  ),
}
```

### Story Naming Conventions

Story names should be descriptive and follow these patterns:

- **Default variant**: Component name (e.g., `Primary`, `Default`)
- **Variant**: Variant name (e.g., `Secondary`, `Danger`)
- **State**: State description (e.g., `Disabled`, `Loading`, `Error`)
- **Size**: Size name (e.g., `Small`, `Large`)
- **Use case**: Descriptive name (e.g., `WithIcon`, `LongText`, `MultiLine`)
- **Showcase**: `All[Property]` (e.g., `AllVariants`, `AllSizes`)

### Meta Configuration

```tsx
const meta: Meta<typeof Component> = {
  // Path in Storybook sidebar
  title: 'Category/Subcategory/ComponentName',

  // The component being documented
  component: Component,

  // Tags for filtering and features
  tags: ['autodocs'],  // Enable auto-generated documentation

  // Component-level parameters
  parameters: {
    // Layout for the story canvas
    layout: 'centered',  // 'centered' | 'padded' | 'fullscreen'

    // Design system documentation
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/...',
    },
  },

  // ArgTypes configuration for controls
  argTypes: {
    propName: {
      control: 'select',  // Control type
      options: ['option1', 'option2'],  // Available options
      description: 'Description of the prop',  // Shown in docs
      table: {
        type: { summary: 'string' },  // Type info
        defaultValue: { summary: 'option1' },  // Default value
      },
    },
  },

  // Global decorators for all stories
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem' }}>
        <Story />
      </div>
    ),
  ],
}
```
```

### Example 2: Relay Component Story with Mock Environment

```markdown
## Relay Component Stories

### Setting Up Relay Mock Environment

```tsx
// .storybook/decorators/RelayDecorator.tsx
import { RelayEnvironmentProvider } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import type { Decorator } from '@storybook/react'

export const RelayDecorator: Decorator = (Story, context) => {
  const environment = createMockEnvironment()

  // Auto-resolve operations with default mock data
  const { parameters } = context
  if (parameters.relay?.mockResolvers) {
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, parameters.relay.mockResolvers)
    )
  }

  return (
    <RelayEnvironmentProvider environment={environment}>
      <Story />
    </RelayEnvironmentProvider>
  )
}
```

### Story for Component with Fragment

```tsx
// UserProfile.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { graphql } from 'react-relay'
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { UserProfile } from './UserProfile'
import { RelayDecorator } from '@/.storybook/decorators/RelayDecorator'

const meta: Meta<typeof UserProfile> = {
  title: 'Features/User/UserProfile',
  component: UserProfile,
  decorators: [RelayDecorator],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof UserProfile>

// Default story
export const Default: Story = {
  parameters: {
    relay: {
      mockResolvers: {
        User() {
          return {
            id: 'user-1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            role: 'ADMIN',
            isActive: true,
            createdAt: '2024-01-15T10:00:00Z',
          }
        },
      },
    },
  },
}

// Different user data scenarios
export const RegularUser: Story = {
  parameters: {
    relay: {
      mockResolvers: {
        User() {
          return {
            id: 'user-2',
            name: 'Bob Smith',
            email: 'bob@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=2',
            role: 'MEMBER',
            isActive: true,
            createdAt: '2023-06-20T14:30:00Z',
          }
        },
      },
    },
  },
}

export const InactiveUser: Story = {
  parameters: {
    relay: {
      mockResolvers: {
        User() {
          return {
            id: 'user-3',
            name: 'Charlie Brown',
            email: 'charlie@example.com',
            avatarUrl: null,
            role: 'GUEST',
            isActive: false,
            createdAt: '2022-03-10T08:00:00Z',
          }
        },
      },
    },
  },
}

export const WithLongName: Story = {
  parameters: {
    relay: {
      mockResolvers: {
        User() {
          return {
            id: 'user-4',
            name: 'Alexander Hamilton-Montgomery Jr.',
            email: 'alexander.hamilton-montgomery@example.com',
            avatarUrl: 'https://i.pravatar.cc/150?img=4',
            role: 'ADMIN',
            isActive: true,
          }
        },
      },
    },
  },
}

export const WithoutAvatar: Story = {
  parameters: {
    relay: {
      mockResolvers: {
        User() {
          return {
            id: 'user-5',
            name: 'Diana Prince',
            email: 'diana@example.com',
            avatarUrl: null,
            role: 'MEMBER',
            isActive: true,
          }
        },
      },
    },
  },
}
```

### Story for Component with Query

```tsx
// UserListPage.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { UserListPage } from './UserListPage'
import { RelayDecorator } from '@/.storybook/decorators/RelayDecorator'

const meta: Meta<typeof UserListPage> = {
  title: 'Pages/UserListPage',
  component: UserListPage,
  decorators: [RelayDecorator],
  parameters: {
    layout: 'fullscreen',
  },
}

export default meta
type Story = StoryObj<typeof UserListPage>

export const WithUsers: Story = {
  parameters: {
    relay: {
      mockResolvers: {
        Query() {
          return {
            users: {
              edges: [
                { node: { id: 'user-1', name: 'Alice' } },
                { node: { id: 'user-2', name: 'Bob' } },
                { node: { id: 'user-3', name: 'Charlie' } },
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor-3',
              },
            },
          }
        },
      },
    },
  },
}

export const EmptyList: Story = {
  parameters: {
    relay: {
      mockResolvers: {
        Query() {
          return {
            users: {
              edges: [],
              pageInfo: {
                hasNextPage: false,
                endCursor: null,
              },
            },
          }
        },
      },
    },
  },
}

export const LoadingState: Story = {
  parameters: {
    relay: {
      mockResolvers: null,  // Don't auto-resolve, stay in loading
    },
  },
}

export const WithPagination: Story = {
  parameters: {
    relay: {
      mockResolvers: {
        Query() {
          return {
            users: {
              edges: Array.from({ length: 20 }, (_, i) => ({
                node: {
                  id: `user-${i}`,
                  name: `User ${i + 1}`,
                  email: `user${i + 1}@example.com`,
                  role: i % 3 === 0 ? 'ADMIN' : 'MEMBER',
                  isActive: i % 5 !== 0,
                },
              })),
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor-20',
              },
            },
          }
        },
      },
    },
  },
}
```

### Story for Yogi LiveTable Component

```tsx
// ProductTable.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { ProductTable } from './ProductTable'
import { RelayDecorator } from '@/.storybook/decorators/RelayDecorator'

const meta: Meta<typeof ProductTable> = {
  title: 'Features/Product/ProductTable',
  component: ProductTable,
  decorators: [RelayDecorator],
  parameters: {
    layout: 'padded',
  },
}

export default meta
type Story = StoryObj<typeof ProductTable>

export const Default: Story = {
  parameters: {
    relay: {
      mockResolvers: {
        Query() {
          return {
            products: {
              edges: [
                {
                  node: {
                    id: 'product-1',
                    name: 'Laptop',
                    price: 999,
                    category: 'Electronics',
                    inStock: true,
                  },
                },
                {
                  node: {
                    id: 'product-2',
                    name: 'Mouse',
                    price: 29,
                    category: 'Accessories',
                    inStock: true,
                  },
                },
                {
                  node: {
                    id: 'product-3',
                    name: 'Keyboard',
                    price: 79,
                    category: 'Accessories',
                    inStock: false,
                  },
                },
              ],
              pageInfo: {
                hasNextPage: true,
                endCursor: 'cursor-3',
              },
              totalCount: 100,
            },
          }
        },
      },
    },
  },
}
```
```

### Example 3: Interactive Stories with Play Functions

```markdown
## Interactive Stories with Play Functions

Play functions allow you to test user interactions directly in Storybook.

### Setup

```bash
npm install --save-dev @storybook/addon-interactions @storybook/testing-library
```

```tsx
// .storybook/main.ts
export default {
  addons: [
    '@storybook/addon-interactions',
  ],
}
```

### Story with User Interaction

```tsx
// LoginForm.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { LoginForm } from './LoginForm'

const meta: Meta<typeof LoginForm> = {
  title: 'Forms/LoginForm',
  component: LoginForm,
  parameters: {
    layout: 'centered',
  },
}

export default meta
type Story = StoryObj<typeof LoginForm>

// Basic story without interaction
export const Default: Story = {
  args: {
    onSubmit: () => {},
  },
}

// Story with user interaction
export const FilledForm: Story = {
  args: {
    onSubmit: (data) => {
      console.log('Form submitted:', data)
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Find inputs
    const emailInput = canvas.getByLabelText(/email/i)
    const passwordInput = canvas.getByLabelText(/password/i)

    // Type into inputs
    await userEvent.type(emailInput, 'alice@example.com')
    await userEvent.type(passwordInput, 'password123')

    // Verify values
    await expect(emailInput).toHaveValue('alice@example.com')
    await expect(passwordInput).toHaveValue('password123')
  },
}

// Story testing form submission
export const SubmitForm: Story = {
  args: {
    onSubmit: (data) => {
      console.log('Submitted:', data)
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Fill form
    await userEvent.type(canvas.getByLabelText(/email/i), 'alice@example.com')
    await userEvent.type(canvas.getByLabelText(/password/i), 'password123')

    // Submit
    await userEvent.click(canvas.getByRole('button', { name: /sign in/i }))

    // Verify submission (would need mock to test callback)
  },
}

// Story testing validation
export const ValidationError: Story = {
  args: {
    onSubmit: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Type invalid email
    const emailInput = canvas.getByLabelText(/email/i)
    await userEvent.type(emailInput, 'invalid-email')

    // Blur to trigger validation
    await userEvent.tab()

    // Check for error message
    await expect(canvas.getByText(/invalid email/i)).toBeInTheDocument()
  },
}
```

### Dropdown Interaction Story

```tsx
// Dropdown.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { Dropdown } from './Dropdown'

const meta: Meta<typeof Dropdown> = {
  title: 'Components/Dropdown',
  component: Dropdown,
}

export default meta
type Story = StoryObj<typeof Dropdown>

const options = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
]

export const OpenDropdown: Story = {
  args: {
    options,
    value: null,
    onChange: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click to open dropdown
    const trigger = canvas.getByRole('button')
    await userEvent.click(trigger)

    // Verify options are visible
    await expect(canvas.getByRole('option', { name: 'Apple' })).toBeVisible()
    await expect(canvas.getByRole('option', { name: 'Banana' })).toBeVisible()
    await expect(canvas.getByRole('option', { name: 'Cherry' })).toBeVisible()
  },
}

export const SelectOption: Story = {
  args: {
    options,
    value: null,
    onChange: () => {},
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open dropdown
    await userEvent.click(canvas.getByRole('button'))

    // Select option
    await userEvent.click(canvas.getByRole('option', { name: 'Banana' }))

    // Verify dropdown closed and value displayed
    await expect(canvas.getByText('Banana')).toBeVisible()
  },
}
```

### Modal Interaction Story

```tsx
// Modal.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { within, userEvent, expect } from '@storybook/test'
import { Modal } from './Modal'

const meta: Meta<typeof Modal> = {
  title: 'Components/Modal',
  component: Modal,
}

export default meta
type Story = StoryObj<typeof Modal>

export const OpenModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <h2>Modal Title</h2>
          <p>Modal content goes here.</p>
        </Modal>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Click button to open
    await userEvent.click(canvas.getByRole('button', { name: /open modal/i }))

    // Verify modal is visible
    await expect(canvas.getByText('Modal Title')).toBeVisible()
    await expect(canvas.getByText('Modal content goes here.')).toBeVisible()
  },
}

export const CloseModal: Story = {
  render: () => {
    const [open, setOpen] = useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open Modal</Button>
        <Modal open={open} onClose={() => setOpen(false)}>
          <h2>Modal Title</h2>
          <Button onClick={() => setOpen(false)}>Close</Button>
        </Modal>
      </>
    )
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    // Open modal
    await userEvent.click(canvas.getByRole('button', { name: /open modal/i }))

    // Close modal
    await userEvent.click(canvas.getByRole('button', { name: /close/i }))

    // Verify modal is hidden
    await expect(canvas.queryByText('Modal Title')).not.toBeInTheDocument()
  },
}
```

### Accessibility Testing in Stories

```tsx
// Button.stories.tsx
import type { Meta, StoryObj } from '@storybook/react'
import { within, expect } from '@storybook/test'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Components/Button',
  component: Button,
}

export default meta
type Story = StoryObj<typeof Button>

export const AccessibilityCheck: Story = {
  args: {
    children: 'Click me',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button', { name: /click me/i })

    // Verify button is accessible
    await expect(button).toBeInTheDocument()
    await expect(button).toHaveAccessibleName('Click me')

    // Verify button can be focused
    button.focus()
    await expect(button).toHaveFocus()

    // Verify button is not disabled
    await expect(button).not.toBeDisabled()
  },
}

export const DisabledAccessibility: Story = {
  args: {
    children: 'Disabled',
    disabled: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)

    const button = canvas.getByRole('button', { name: /disabled/i })

    // Verify button is disabled
    await expect(button).toBeDisabled()

    // Verify aria-disabled attribute
    await expect(button).toHaveAttribute('aria-disabled', 'true')
  },
}
```
```
