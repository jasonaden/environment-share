# Skill Plan: Testing Conventions

## Purpose and Scope

This skill provides comprehensive knowledge of testing patterns and conventions used across the organization's frontend applications. It enables agents to:

- Write effective unit tests for React components
- Test Relay-connected components with mock environments
- Apply React Testing Library best practices
- Test custom hooks with proper isolation
- Mock external dependencies correctly
- Implement integration tests for user workflows
- Achieve appropriate test coverage
- Follow the testing pyramid (unit > integration > e2e)
- Test accessibility requirements
- Debug failing tests effectively

The skill covers the complete testing stack including Jest, React Testing Library, Relay Test Utils, and organization-specific testing utilities and patterns.

## Trigger Description

```yaml
description: >
  This skill provides comprehensive knowledge of testing patterns and conventions for React applications,
  including unit testing with React Testing Library, testing Relay components with mock environments,
  testing custom hooks, coverage requirements, and integration testing patterns. This skill should be used
  when the user asks about testing, writing tests, test coverage, mocking, React Testing Library,
  testing Relay components, testing hooks, or debugging test failures.
```

## SKILL.md Specification

Target length: 1800 words

### Section 1: Introduction to Testing at [Company] (200 words)
- Testing philosophy and principles
- Testing pyramid (unit, integration, e2e)
- Test coverage requirements and goals
- Test file organization (co-located)
- Running tests locally and in CI
- Test naming conventions

### Section 2: React Testing Library Fundamentals (400 words)
- Query priorities (getByRole, getByLabelText, etc.)
- User-centric testing approach
- Avoid implementation details
- Testing user interactions (click, type, etc.)
- Async testing (waitFor, findBy)
- Testing accessibility
- Custom render utilities
- Common patterns and best practices

### Section 3: Testing Relay Components (400 words)
- Creating mock Relay environment
- Mock resolvers for queries and fragments
- Testing loading states
- Testing error states
- Testing mutations with optimistic updates
- Testing pagination
- Testing connections
- Relay test utilities

### Section 4: Testing Custom Hooks (250 words)
- Using renderHook from Testing Library
- Testing hook state changes
- Testing hook side effects
- Testing hooks with dependencies
- Mocking hook dependencies

### Section 5: Mocking Patterns (300 words)
- Mocking modules with jest.mock
- Mocking API calls
- Mocking timers
- Mocking navigation (react-router)
- Mocking Picnic components
- Partial mocks vs. full mocks

### Section 6: Integration Testing (150 words)
- Multi-component workflows
- Testing complete user journeys
- Testing with real routing
- Testing form submissions
- Testing cross-component communication

### Section 7: Coverage and Quality (100 words)
- Coverage thresholds
- What to test vs. what not to test
- Snapshot testing (when to use)
- Visual regression testing
- Accessibility testing

## Reference Files

### testing-patterns.md
**Purpose**: Complete catalog of testing patterns with examples

**Estimated size**: 6,000-7,000 lines

**Outline**:
1. **Test File Structure** (400 lines)
   - File naming conventions
   - Describe blocks organization
   - Setup and teardown patterns
   - beforeEach and afterEach usage
   - Test isolation

2. **React Testing Library Patterns** (1,500 lines)
   - Query methods (getBy, queryBy, findBy)
   - Query priority recommendations
   - User event patterns
   - Async testing patterns
   - Form testing
   - Testing conditional rendering
   - Testing lists and iterations
   - Testing error boundaries
   - Custom render with providers
   - Complete examples

3. **Relay Testing Patterns** (1,500 lines)
   - Mock environment setup
   - Mock resolvers for queries
   - Mock resolvers for fragments
   - Mock resolvers for mutations
   - Testing loading states
   - Testing error states
   - Testing pagination
   - Testing optimistic updates
   - Testing connection updates
   - Complete examples for each

4. **Hook Testing Patterns** (800 lines)
   - renderHook usage
   - Testing state updates
   - Testing effects
   - Testing cleanup
   - Testing hooks with context
   - Testing custom hooks with dependencies
   - Complete examples

5. **Mocking Patterns** (1,000 lines)
   - jest.mock patterns
   - Mock functions (jest.fn)
   - Mock implementations
   - Spies
   - Mocking modules
   - Mocking timers
   - Mocking navigation
   - Mocking GraphQL API
   - Partial mocks

6. **Integration Testing** (800 lines)
   - Multi-component test setup
   - User journey testing
   - Form submission flows
   - Navigation flows
   - State sharing tests
   - Complete workflow examples

7. **Accessibility Testing** (500 lines)
   - Testing with screen readers
   - Keyboard navigation testing
   - ARIA attribute testing
   - Color contrast testing
   - Focus management testing

8. **Best Practices and Anti-Patterns** (500 lines)
   - What to test (user behavior, not implementation)
   - What not to test (implementation details)
   - Avoiding brittle tests
   - Test maintainability
   - Common anti-patterns

## Used By Agents

- **test-writer**: Writes tests following patterns
- **frontend-reviewer**: Validates test quality and coverage
- **component-builder**: Writes tests alongside components

## Dependencies

- **react-patterns**: Understanding components to test them
- **relay-conventions**: Understanding Relay patterns to test them
- **typescript-strict**: Typing test utilities and mocks

## Skills to Load When Building

- `plugin-dev:skill-development` (required for skill creation)

## Validation Criteria

### Should Trigger (3 test queries)

1. "How do I test this Relay component?"
2. "What's the correct way to mock a GraphQL query in tests?"
3. "How do I test user interactions with React Testing Library?"

### Should NOT Trigger (2 test queries)

1. "How do I create a Relay fragment?" (relay-conventions)
2. "Which Picnic component should I use?" (picnic-components)

### Progressive Disclosure Test

1. **Frontmatter only**: User asks "Should I write a test for this component?"
   - Expected: Agent confirms tests should be written

2. **SKILL.md loaded**: User asks "How do I test a component with Relay?"
   - Expected: Agent provides overview of Relay testing approach

3. **References loaded**: User asks "Show me a complete example of testing a paginated list"
   - Expected: Agent provides full example from testing-patterns.md

## Example Content Snippets

### Example 1: Testing Relay Component with Mock Environment

```markdown
## Testing Relay Components

### Setting Up Mock Relay Environment

```tsx
// testUtils/relayTestUtils.tsx
import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils'
import { RelayEnvironmentProvider } from 'react-relay'
import type { MockResolvers } from 'relay-test-utils'

export function createTestRelayEnvironment() {
  return createMockEnvironment()
}

export function RelayTestWrapper({ environment, children }: {
  environment: ReturnType<typeof createMockEnvironment>
  children: React.ReactNode
}) {
  return (
    <RelayEnvironmentProvider environment={environment}>
      {children}
    </RelayEnvironmentProvider>
  )
}

// Custom render with Relay
export function renderWithRelay(
  ui: React.ReactElement,
  environment?: ReturnType<typeof createMockEnvironment>
) {
  const env = environment ?? createMockEnvironment()

  return {
    environment: env,
    ...render(ui, {
      wrapper: ({ children }) => (
        <RelayTestWrapper environment={env}>{children}</RelayTestWrapper>
      ),
    }),
  }
}
```

### Testing Component with Fragment

```tsx
// UserProfile.test.tsx
import { graphql } from 'react-relay'
import { MockPayloadGenerator } from 'relay-test-utils'
import { renderWithRelay } from '@/testUtils/relayTestUtils'
import { UserProfile } from './UserProfile'

describe('UserProfile', () => {
  it('renders user information', () => {
    const { environment } = renderWithRelay(
      <UserProfile user={/* fragment ref */} />
    )

    // Mock the fragment data
    environment.mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return {
            id: 'user-1',
            name: 'Alice Johnson',
            email: 'alice@example.com',
            avatarUrl: 'https://example.com/avatar.jpg',
          }
        },
      })
    )

    expect(screen.getByText('Alice Johnson')).toBeInTheDocument()
    expect(screen.getByText('alice@example.com')).toBeInTheDocument()
  })
})
```

### Testing Component with Query

```tsx
// UserListPage.test.tsx
import { graphql } from 'react-relay'
import { screen, waitFor } from '@testing-library/react'
import { MockPayloadGenerator } from 'relay-test-utils'
import { renderWithRelay } from '@/testUtils/relayTestUtils'
import { UserListPage } from './UserListPage'

describe('UserListPage', () => {
  it('renders list of users after loading', async () => {
    const { environment } = renderWithRelay(<UserListPage />)

    // Initially shows loading state
    expect(screen.getByText(/loading/i)).toBeInTheDocument()

    // Resolve the query
    environment.mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        User() {
          return {
            id: 'user-1',
            name: 'Alice',
          }
        },
      })
    )

    // Wait for users to appear
    await waitFor(() => {
      expect(screen.getByText('Alice')).toBeInTheDocument()
    })
  })

  it('shows error message when query fails', async () => {
    const { environment } = renderWithRelay(<UserListPage />)

    // Reject the query with an error
    environment.mock.rejectMostRecentOperation(
      new Error('Failed to fetch users')
    )

    await waitFor(() => {
      expect(screen.getByText(/failed to fetch users/i)).toBeInTheDocument()
    })
  })
})
```

### Testing Mutation

```tsx
// DeleteUserButton.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockPayloadGenerator } from 'relay-test-utils'
import { renderWithRelay } from '@/testUtils/relayTestUtils'
import { DeleteUserButton } from './DeleteUserButton'

describe('DeleteUserButton', () => {
  it('deletes user when confirmed', async () => {
    const user = userEvent.setup()
    const onDelete = jest.fn()

    const { environment } = renderWithRelay(
      <DeleteUserButton userId="user-1" onDelete={onDelete} />
    )

    // Click delete button
    await user.click(screen.getByRole('button', { name: /delete/i }))

    // Confirm in dialog
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    // Get the mutation operation
    const operation = environment.mock.getMostRecentOperation()
    expect(operation.request.variables).toEqual({
      input: { id: 'user-1' },
    })

    // Resolve the mutation
    environment.mock.resolve(
      operation,
      MockPayloadGenerator.generate(operation, {
        DeleteUserPayload() {
          return {
            deletedUserId: 'user-1',
            errors: [],
          }
        },
      })
    )

    // Verify callback was called
    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith('user-1')
    })
  })

  it('shows error message when mutation fails', async () => {
    const user = userEvent.setup()

    const { environment } = renderWithRelay(
      <DeleteUserButton userId="user-1" />
    )

    await user.click(screen.getByRole('button', { name: /delete/i }))
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    // Reject the mutation
    environment.mock.rejectMostRecentOperation(
      new Error('Failed to delete user')
    )

    await waitFor(() => {
      expect(screen.getByText(/failed to delete user/i)).toBeInTheDocument()
    })
  })
})
```

### Testing Pagination

```tsx
// UserList.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MockPayloadGenerator } from 'relay-test-utils'
import { renderWithRelay } from '@/testUtils/relayTestUtils'
import { UserList } from './UserList'

describe('UserList pagination', () => {
  it('loads more users when clicking load more button', async () => {
    const user = userEvent.setup()

    const { environment } = renderWithRelay(<UserList query={/* query ref */} />)

    // Resolve initial query
    environment.mock.resolveMostRecentOperation((operation) =>
      MockPayloadGenerator.generate(operation, {
        PageInfo() {
          return {
            hasNextPage: true,
            endCursor: 'cursor-1',
          }
        },
      })
    )

    // Wait for initial render
    await waitFor(() => {
      expect(screen.getByText('User 1')).toBeInTheDocument()
    })

    // Click load more
    await user.click(screen.getByRole('button', { name: /load more/i }))

    // Resolve pagination query
    const paginationOperation = environment.mock.getMostRecentOperation()
    expect(paginationOperation.request.variables).toMatchObject({
      first: 20,
      after: 'cursor-1',
    })

    environment.mock.resolve(
      paginationOperation,
      MockPayloadGenerator.generate(paginationOperation, {
        PageInfo() {
          return {
            hasNextPage: false,
            endCursor: 'cursor-2',
          }
        },
      })
    )

    // Verify more users loaded
    await waitFor(() => {
      expect(screen.getByText('User 21')).toBeInTheDocument()
    })

    // Load more button should be hidden
    expect(screen.queryByRole('button', { name: /load more/i })).not.toBeInTheDocument()
  })
})
```

### Custom Mock Resolvers

```tsx
// Create reusable mock data
const mockUser = {
  id: 'user-1',
  name: 'Alice Johnson',
  email: 'alice@example.com',
  role: 'ADMIN',
  isActive: true,
  createdAt: '2024-01-15T10:00:00Z',
}

const mockResolvers = {
  User() {
    return mockUser
  },
  UserConnection() {
    return {
      edges: [
        { node: mockUser },
        { node: { ...mockUser, id: 'user-2', name: 'Bob Smith' } },
      ],
      pageInfo: {
        hasNextPage: false,
        hasPreviousPage: false,
        startCursor: 'cursor-1',
        endCursor: 'cursor-2',
      },
    }
  },
}

// Use in test
environment.mock.resolveMostRecentOperation((operation) =>
  MockPayloadGenerator.generate(operation, mockResolvers)
)
```
```

### Example 2: Testing User Interactions with React Testing Library

```markdown
## Testing User Interactions

### Testing Form Input

```tsx
// LoginForm.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/testUtils'
import { LoginForm } from './LoginForm'

describe('LoginForm', () => {
  it('allows user to enter credentials and submit', async () => {
    const user = userEvent.setup()
    const onSubmit = jest.fn()

    render(<LoginForm onSubmit={onSubmit} />)

    // Find inputs by label (accessible way)
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)

    // Type into inputs
    await user.type(emailInput, 'alice@example.com')
    await user.type(passwordInput, 'password123')

    // Verify values
    expect(emailInput).toHaveValue('alice@example.com')
    expect(passwordInput).toHaveValue('password123')

    // Submit form
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    // Verify callback
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'alice@example.com',
      password: 'password123',
    })
  })

  it('shows validation errors for invalid input', async () => {
    const user = userEvent.setup()

    render(<LoginForm onSubmit={jest.fn()} />)

    const emailInput = screen.getByLabelText(/email/i)

    // Type invalid email
    await user.type(emailInput, 'invalid-email')

    // Blur to trigger validation
    await user.tab()

    // Error message should appear
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument()
  })
})
```

### Testing Dropdowns and Selects

```tsx
// UserRoleSelector.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/testUtils'
import { UserRoleSelector } from './UserRoleSelector'

describe('UserRoleSelector', () => {
  it('allows user to select a role', async () => {
    const user = userEvent.setup()
    const onChange = jest.fn()

    render(<UserRoleSelector value={null} onChange={onChange} />)

    // Open dropdown
    await user.click(screen.getByRole('combobox', { name: /select role/i }))

    // Select option
    await user.click(screen.getByRole('option', { name: /admin/i }))

    // Verify callback
    expect(onChange).toHaveBeenCalledWith('ADMIN')
  })
})
```

### Testing Checkboxes and Toggles

```tsx
// NotificationSettings.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/testUtils'
import { NotificationSettings } from './NotificationSettings'

describe('NotificationSettings', () => {
  it('toggles email notifications', async () => {
    const user = userEvent.setup()
    const onSave = jest.fn()

    render(<NotificationSettings onSave={onSave} />)

    // Find checkbox by label
    const emailCheckbox = screen.getByRole('checkbox', {
      name: /email notifications/i,
    })

    // Initially unchecked
    expect(emailCheckbox).not.toBeChecked()

    // Click to check
    await user.click(emailCheckbox)
    expect(emailCheckbox).toBeChecked()

    // Save
    await user.click(screen.getByRole('button', { name: /save/i }))

    expect(onSave).toHaveBeenCalledWith({
      emailNotifications: true,
    })
  })
})
```

### Testing Button Clicks and Actions

```tsx
// ProductCard.test.tsx
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/testUtils'
import { ProductCard } from './ProductCard'

describe('ProductCard', () => {
  const mockProduct = {
    id: 'product-1',
    name: 'Laptop',
    price: 999,
  }

  it('calls onAddToCart when add to cart button is clicked', async () => {
    const user = userEvent.setup()
    const onAddToCart = jest.fn()

    render(
      <ProductCard product={mockProduct} onAddToCart={onAddToCart} />
    )

    await user.click(screen.getByRole('button', { name: /add to cart/i }))

    expect(onAddToCart).toHaveBeenCalledWith('product-1')
  })

  it('navigates to product details when card is clicked', async () => {
    const user = userEvent.setup()
    const navigate = jest.fn()

    // Mock useNavigate hook
    jest.mock('react-router-dom', () => ({
      ...jest.requireActual('react-router-dom'),
      useNavigate: () => navigate,
    }))

    render(<ProductCard product={mockProduct} />)

    await user.click(screen.getByRole('article'))

    expect(navigate).toHaveBeenCalledWith('/products/product-1')
  })
})
```

### Testing Async Operations

```tsx
// SearchInput.test.tsx
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render } from '@/testUtils'
import { SearchInput } from './SearchInput'

describe('SearchInput', () => {
  it('shows search results after typing', async () => {
    const user = userEvent.setup()

    // Mock API call
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({
            results: [
              { id: '1', name: 'Result 1' },
              { id: '2', name: 'Result 2' },
            ],
          }),
      })
    ) as jest.Mock

    render(<SearchInput />)

    const input = screen.getByRole('textbox', { name: /search/i })

    // Type search query
    await user.type(input, 'laptop')

    // Wait for results to appear
    await waitFor(() => {
      expect(screen.getByText('Result 1')).toBeInTheDocument()
      expect(screen.getByText('Result 2')).toBeInTheDocument()
    })

    // Verify API was called
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('q=laptop')
    )
  })

  it('debounces search input', async () => {
    const user = userEvent.setup()
    global.fetch = jest.fn(() => Promise.resolve({ json: () => Promise.resolve({ results: [] }) }))

    render(<SearchInput />)

    const input = screen.getByRole('textbox', { name: /search/i })

    // Type quickly
    await user.type(input, 'lap')

    // API should not be called immediately
    expect(global.fetch).not.toHaveBeenCalled()

    // Wait for debounce delay
    await waitFor(
      () => {
        expect(global.fetch).toHaveBeenCalled()
      },
      { timeout: 1000 }
    )
  })
})
```

### Query Priority

React Testing Library recommends this query priority:

1. **getByRole**: Most accessible (use for buttons, links, inputs with role)
2. **getByLabelText**: For form inputs with labels
3. **getByPlaceholderText**: For inputs with placeholders
4. **getByText**: For non-interactive elements with text
5. **getByTestId**: Last resort for elements without better queries

```tsx
// GOOD: Query priority
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByText(/welcome/i)

// AVOID: Test IDs unless necessary
screen.getByTestId('submit-button')
```
```

### Example 3: Testing Custom Hooks

```markdown
## Testing Custom Hooks

### Basic Hook Test

```tsx
// useToggle.test.ts
import { renderHook, act } from '@testing-library/react'
import { useToggle } from './useToggle'

describe('useToggle', () => {
  it('initializes with false by default', () => {
    const { result } = renderHook(() => useToggle())

    expect(result.current[0]).toBe(false)
  })

  it('initializes with provided value', () => {
    const { result } = renderHook(() => useToggle(true))

    expect(result.current[0]).toBe(true)
  })

  it('toggles value', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current[1].toggle()
    })

    expect(result.current[0]).toBe(true)

    act(() => {
      result.current[1].toggle()
    })

    expect(result.current[0]).toBe(false)
  })

  it('sets value to true', () => {
    const { result } = renderHook(() => useToggle(false))

    act(() => {
      result.current[1].setTrue()
    })

    expect(result.current[0]).toBe(true)
  })

  it('sets value to false', () => {
    const { result } = renderHook(() => useToggle(true))

    act(() => {
      result.current[1].setFalse()
    })

    expect(result.current[0]).toBe(false)
  })
})
```

### Hook with Async Effects

```tsx
// useUser.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useUser } from './useUser'

// Mock API
jest.mock('@/api/users', () => ({
  fetchUser: jest.fn(),
}))

import { fetchUser } from '@/api/users'

describe('useUser', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('fetches user data on mount', async () => {
    const mockUser = { id: '1', name: 'Alice' }
    ;(fetchUser as jest.Mock).mockResolvedValue(mockUser)

    const { result } = renderHook(() => useUser('1'))

    // Initially loading
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)

    // Wait for data to load
    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(fetchUser).toHaveBeenCalledWith('1')
  })

  it('handles errors', async () => {
    const error = new Error('Failed to fetch')
    ;(fetchUser as jest.Mock).mockRejectedValue(error)

    const { result } = renderHook(() => useUser('1'))

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toEqual(error)
    expect(result.current.user).toBe(null)
  })
})
```

### Hook with Dependencies

```tsx
// useDebounce.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useDebounce } from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('debounces value updates', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    )

    expect(result.current).toBe('initial')

    // Update value
    rerender({ value: 'updated', delay: 500 })

    // Value should not update immediately
    expect(result.current).toBe('initial')

    // Fast-forward time
    jest.advanceTimersByTime(500)

    // Value should update after delay
    expect(result.current).toBe('updated')
  })

  it('cancels previous debounce on rapid updates', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'first' },
      }
    )

    // Rapid updates
    rerender({ value: 'second' })
    jest.advanceTimersByTime(200)

    rerender({ value: 'third' })
    jest.advanceTimersByTime(200)

    rerender({ value: 'fourth' })

    // Only the last value should be used after full delay
    jest.advanceTimersByTime(500)

    expect(result.current).toBe('fourth')
  })
})
```
```
