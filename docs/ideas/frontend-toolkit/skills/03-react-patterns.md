# Skill Plan: React Patterns

## Purpose and Scope

This skill provides comprehensive knowledge of approved React patterns and best practices used across the organization's frontend applications. It enables agents to:

- Apply approved React patterns consistently across the codebase
- Use hooks correctly following React rules and organization conventions
- Implement proper component composition patterns
- Handle state management appropriately (local, lifted, context)
- Design component APIs that are clear and maintainable
- Avoid common anti-patterns and pitfalls
- Apply performance optimization patterns appropriately
- Implement error boundaries and error handling
- Structure components for testability and reusability

The skill covers both React fundamentals and organization-specific patterns that have been established through team experience and code reviews.

## Trigger Description

```yaml
description: >
  This skill provides comprehensive knowledge of approved React patterns and best practices,
  including hooks usage, state management, component composition, error handling, and performance optimization.
  This skill should be used when the user asks about React patterns, how to use hooks correctly,
  state management approaches, component composition techniques, error boundaries, performance optimization,
  or when reviewing React code for pattern compliance.
```

## SKILL.md Specification

Target length: 1900 words

### Section 1: Introduction to React Patterns at [Company] (200 words)
- Overview of approved patterns philosophy
- How patterns are established and evolved
- Relationship to React best practices
- Code review expectations
- Pattern documentation and updates

### Section 2: Hooks Best Practices (450 words)
- Rules of Hooks enforcement
- useState patterns (primitive vs. object state, updater functions)
- useEffect patterns (dependencies, cleanup, async effects)
- useCallback and useMemo usage (when and why)
- useRef patterns (DOM refs, mutable values)
- Custom hooks (naming, single responsibility, composition)
- Hook dependency arrays (complete dependencies, ESLint rules)
- Common hook pitfalls and how to avoid them

### Section 3: Component Composition Patterns (400 words)
- Composition over inheritance principle
- Children prop patterns
- Render props pattern
- Compound components pattern
- Higher-order components (when to use, when to avoid)
- Component injection patterns
- Slot patterns with named children
- Layout components

### Section 4: State Management Strategies (350 words)
- Local state with useState
- Lifted state patterns
- Context API for shared state
- When to use context vs. props
- Context performance considerations
- State colocation principle
- Avoiding prop drilling
- State initialization patterns

### Section 5: Component API Design (250 words)
- Props interface design
- Required vs. optional props
- Boolean props vs. variant enums
- Event handler props naming
- Children vs. render props
- Polymorphic component patterns
- Prop spreading patterns
- Default props vs. default parameters

### Section 6: Error Handling (150 words)
- Error boundaries placement
- Error boundary fallback UI
- Async error handling
- Form validation errors
- Network error handling

### Section 7: Performance Patterns (100 words)
- React.memo usage criteria
- useMemo for expensive computations
- useCallback for stable references
- Code splitting with lazy/Suspense
- Virtualization for long lists

## Reference Files

### approved-patterns.md
**Purpose**: Complete catalog of approved React patterns with examples and anti-patterns

**Estimated size**: 6,000-7,000 lines

**Outline**:
1. **Custom Hooks Patterns** (1,200 lines)
   - useToggle pattern
   - useAsync pattern
   - useDebounce pattern
   - useLocalStorage pattern
   - usePrevious pattern
   - Form management hooks
   - Data fetching hooks (Relay integration)
   - Each pattern includes:
     - Use case
     - Implementation
     - Usage example
     - Do's and Don'ts

2. **State Management Patterns** (1,000 lines)
   - State colocation
   - Lifting state up
   - Context provider patterns
   - Reducer patterns
   - Derived state patterns
   - State initialization from props
   - State synchronization

3. **Component Composition Patterns** (1,500 lines)
   - Compound components (Tabs, Accordion examples)
   - Render props (DataFetcher, Toggle examples)
   - Children as function
   - Slot patterns (Modal with header/footer/body)
   - Component injection (Form with custom inputs)
   - Layout components (Stack, Grid)

4. **Performance Patterns** (800 lines)
   - React.memo with custom comparison
   - useMemo for expensive calculations
   - useCallback for event handlers
   - Code splitting patterns
   - Lazy loading components
   - Virtualization (react-window)

5. **Error Handling Patterns** (600 lines)
   - Error boundary implementation
   - Async error handling
   - Form error display
   - Optimistic UI with rollback
   - Retry mechanisms

6. **Testing Patterns** (800 lines)
   - Component testing structure
   - Hook testing patterns
   - Mock patterns for Relay
   - Testing async behavior
   - Testing error states

7. **Anti-Patterns to Avoid** (1,000 lines)
   - Massive components (god components)
   - Props drilling (when to use context)
   - Unnecessary state
   - Side effects in render
   - Missing dependencies in useEffect
   - Premature optimization
   - Inline function definitions in JSX
   - Each anti-pattern includes:
     - Why it's problematic
     - Example of the anti-pattern
     - Correct alternative

## Used By Agents

- **component-architect**: Designs component structure using approved patterns
- **component-builder**: Implements components following patterns
- **frontend-reviewer**: Validates pattern compliance in code reviews
- **test-writer**: Writes tests following testing patterns

## Dependencies

- **typescript-strict**: Proper typing of component props and hooks
- **relay-conventions**: Relay-specific hooks and patterns

## Skills to Load When Building

- `plugin-dev:skill-development` (required for skill creation)

## Validation Criteria

### Should Trigger (3 test queries)

1. "What's the correct way to handle state in this component?"
2. "Should I use useCallback or useMemo here?"
3. "How do I implement a compound component pattern?"

### Should NOT Trigger (2 test queries)

1. "How do I query data with Relay?" (relay-conventions)
2. "Which design system component should I use?" (picnic-components)

### Progressive Disclosure Test

1. **Frontmatter only**: User asks "Are there any React patterns I should follow?"
   - Expected: Agent confirms there are approved patterns and suggests checking them

2. **SKILL.md loaded**: User asks "When should I use useCallback?"
   - Expected: Agent provides guidelines for useCallback usage

3. **References loaded**: User asks "Show me an example of the compound component pattern"
   - Expected: Agent provides complete example from approved-patterns.md

## Example Content Snippets

### Example 1: Custom Hook Pattern (useToggle)

```markdown
## useToggle Pattern

### Use Case

Managing boolean state (open/closed, visible/hidden, on/off) with convenient toggle and explicit set functions.

### Implementation

```tsx
// hooks/useToggle.ts
import { useState, useCallback } from 'react'

export function useToggle(initialValue = false): [
  boolean,
  {
    toggle: () => void
    setTrue: () => void
    setFalse: () => void
    setValue: (value: boolean) => void
  }
] {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => {
    setValue((v) => !v)
  }, [])

  const setTrue = useCallback(() => {
    setValue(true)
  }, [])

  const setFalse = useCallback(() => {
    setValue(false)
  }, [])

  return [value, { toggle, setTrue, setFalse, setValue }]
}
```

### Usage Example

```tsx
// Modal.tsx
import { useToggle } from '@/hooks/useToggle'

export function UserProfilePage() {
  const [isModalOpen, { setTrue: openModal, setFalse: closeModal }] = useToggle()

  return (
    <div>
      <Button onClick={openModal}>Edit Profile</Button>

      <Modal open={isModalOpen} onClose={closeModal}>
        <ProfileEditForm onSave={closeModal} />
      </Modal>
    </div>
  )
}
```

### Do's

- Use destructuring to get only the functions you need
- Use stable functions (useCallback) to prevent unnecessary re-renders
- Provide both toggle and explicit set functions
- Start with false as default unless there's a clear reason otherwise

### Don'ts

```tsx
// DON'T: Create inline boolean state management
const [isOpen, setIsOpen] = useState(false)
const toggle = () => setIsOpen(!isOpen)  // Not memoized, creates new function every render

// DO: Use useToggle hook
const [isOpen, { toggle }] = useToggle()
```

```tsx
// DON'T: Use toggle for values that should be explicit
const handleSubmit = () => {
  toggle()  // Unclear - are we opening or closing?
}

// DO: Use explicit functions
const handleSubmit = () => {
  closeModal()  // Clear intent
}
```

### When to Use

- Modal/dialog open states
- Dropdown/menu visibility
- Feature flags or switches
- Accordion expand/collapse states
- Any boolean flag that needs toggling

### When NOT to Use

- Non-boolean state
- State that has more than two values (use useState with string/enum)
- State that never toggles (just use explicit useState(false) or useState(true))
```

### Example 2: Compound Component Pattern

```markdown
## Compound Component Pattern

### Overview

Compound components work together to provide a complete UI pattern while giving consumers flexibility in composition. The parent component manages shared state, and child components access it through context.

### Use Case

- Tab components (Tabs, TabList, Tab, TabPanel)
- Accordion components
- Menu components
- Any component where multiple parts need to coordinate

### Implementation Example: Tabs

```tsx
// Tabs.tsx
import { createContext, useContext, useState, ReactNode } from 'react'

// Context for sharing tab state
interface TabsContextValue {
  activeTab: string
  setActiveTab: (id: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabs() {
  const context = useContext(TabsContext)
  if (!context) {
    throw new Error('Tabs compound components must be used within <Tabs>')
  }
  return context
}

// Parent component
interface TabsProps {
  defaultTab: string
  children: ReactNode
}

export function Tabs({ defaultTab, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}

// TabList component
interface TabListProps {
  children: ReactNode
}

function TabList({ children }: TabListProps) {
  return (
    <div className="tab-list" role="tablist">
      {children}
    </div>
  )
}

// Tab component
interface TabProps {
  id: string
  children: ReactNode
}

function Tab({ id, children }: TabProps) {
  const { activeTab, setActiveTab } = useTabs()
  const isActive = activeTab === id

  return (
    <button
      role="tab"
      aria-selected={isActive}
      onClick={() => setActiveTab(id)}
      className={isActive ? 'tab-active' : 'tab'}
    >
      {children}
    </button>
  )
}

// TabPanel component
interface TabPanelProps {
  id: string
  children: ReactNode
}

function TabPanel({ id, children }: TabPanelProps) {
  const { activeTab } = useTabs()

  if (activeTab !== id) return null

  return (
    <div role="tabpanel" className="tab-panel">
      {children}
    </div>
  )
}

// Attach components as properties
Tabs.List = TabList
Tabs.Tab = Tab
Tabs.Panel = TabPanel
```

### Usage

```tsx
// UserSettings.tsx
import { Tabs } from '@/components/Tabs'

export function UserSettings() {
  return (
    <Tabs defaultTab="profile">
      <Tabs.List>
        <Tabs.Tab id="profile">Profile</Tabs.Tab>
        <Tabs.Tab id="security">Security</Tabs.Tab>
        <Tabs.Tab id="notifications">Notifications</Tabs.Tab>
      </Tabs.List>

      <Tabs.Panel id="profile">
        <ProfileSettings />
      </Tabs.Panel>

      <Tabs.Panel id="security">
        <SecuritySettings />
      </Tabs.Panel>

      <Tabs.Panel id="notifications">
        <NotificationSettings />
      </Tabs.Panel>
    </Tabs>
  )
}
```

### Benefits

1. **Flexibility**: Consumer controls the structure and composition
2. **Encapsulation**: State management hidden from consumer
3. **Type Safety**: Each component has proper TypeScript types
4. **Discoverability**: `Tabs.Tab`, `Tabs.Panel` discoverable via autocomplete
5. **Accessibility**: Proper ARIA attributes built-in

### Do's

- Use context for shared state between components
- Throw error if child components used outside parent
- Provide TypeScript types for all components
- Include accessibility attributes (role, aria-*)
- Attach child components to parent for discoverability

### Don'ts

```tsx
// DON'T: Make state management complex
function Tabs({ children, onTabChange, activeTab }) {
  // Controlled component with prop drilling
}

// DO: Keep state internal, expose only what's needed
function Tabs({ defaultTab, children }) {
  const [activeTab, setActiveTab] = useState(defaultTab)
  // Internal state management
}
```

```tsx
// DON'T: Export child components separately
export { Tabs, TabList, Tab, TabPanel }  // Easy to use incorrectly

// DO: Attach child components to parent
Tabs.List = TabList
Tabs.Tab = Tab
Tabs.Panel = TabPanel
export { Tabs }  // Clear parent-child relationship
```

### Pattern Variations

**Controlled Version**:
```tsx
interface TabsProps {
  activeTab: string
  onTabChange: (id: string) => void
  children: ReactNode
}

export function Tabs({ activeTab, onTabChange, children }: TabsProps) {
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: onTabChange }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}
```

**Uncontrolled with Callback**:
```tsx
interface TabsProps {
  defaultTab: string
  onTabChange?: (id: string) => void
  children: ReactNode
}

export function Tabs({ defaultTab, onTabChange, children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  const handleTabChange = (id: string) => {
    setActiveTab(id)
    onTabChange?.(id)
  }

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab: handleTabChange }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  )
}
```
```

### Example 3: Anti-Pattern - Missing Dependencies in useEffect

```markdown
## Anti-Pattern: Missing Dependencies in useEffect

### The Problem

Omitting dependencies from the useEffect dependency array leads to stale closures, where the effect uses outdated values from previous renders.

### Anti-Pattern Example

```tsx
// DON'T: Missing dependency
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    fetchUser(userId).then((data) => {
      setUser(data)
      setLoading(false)
    })
  }, [])  // Missing userId dependency!

  // Bug: When userId prop changes, the effect doesn't re-run
  // We keep showing the old user data
}
```

### Why It's Problematic

1. **Stale Data**: Effect uses old prop values when they change
2. **Race Conditions**: Multiple async operations may complete out of order
3. **Memory Leaks**: Cleanup functions don't run when they should
4. **Difficult Debugging**: Behavior is confusing and inconsistent

### Correct Pattern

```tsx
// DO: Include all dependencies
function UserProfile({ userId }: { userId: string }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false

    setLoading(true)
    fetchUser(userId).then((data) => {
      if (!cancelled) {
        setUser(data)
        setLoading(false)
      }
    })

    return () => {
      cancelled = true  // Cleanup to prevent state updates on unmounted component
    }
  }, [userId])  // userId is a dependency

  if (loading) return <Spinner />
  if (!user) return null

  return <div>{user.name}</div>
}
```

### Advanced Example: Function Dependencies

```tsx
// DON'T: Function dependency causes effect to run every render
function SearchResults({ query }: { query: string }) {
  const fetchResults = (searchQuery: string) => {
    return api.search(searchQuery)
  }

  useEffect(() => {
    fetchResults(query).then(setResults)
  }, [fetchResults, query])  // fetchResults is recreated every render!
}
```

```tsx
// DO: Use useCallback to stabilize function reference
function SearchResults({ query }: { query: string }) {
  const fetchResults = useCallback((searchQuery: string) => {
    return api.search(searchQuery)
  }, [])  // No dependencies, stable function

  useEffect(() => {
    fetchResults(query).then(setResults)
  }, [fetchResults, query])  // Now fetchResults is stable
}
```

```tsx
// BETTER: Inline the function if it's only used in one effect
function SearchResults({ query }: { query: string }) {
  useEffect(() => {
    api.search(query).then(setResults)
  }, [query])  // No function dependency needed
}
```

### ESLint Rule

Always enable the `react-hooks/exhaustive-deps` ESLint rule:

```json
{
  "rules": {
    "react-hooks/exhaustive-deps": "error"
  }
}
```

This rule will warn you when dependencies are missing.

### Common Exceptions (with caution)

Sometimes you intentionally want to run an effect only once:

```tsx
// Legitimate one-time initialization
useEffect(() => {
  // Initialize analytics
  analytics.init(apiKey)
}, [])  // Intentionally empty - only run once
```

If ESLint complains about missing dependencies but you're certain the effect should only run once, add a comment:

```tsx
useEffect(() => {
  analytics.init(apiKey)
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])  // Only run once on mount
```

But think carefully - this is often a code smell indicating the effect should be moved elsewhere (outside the component, into a context provider, etc.).

### Testing for This Issue

Write tests that change props/state and verify the component updates correctly:

```tsx
test('updates user data when userId prop changes', async () => {
  const { rerender } = render(<UserProfile userId="user1" />)

  await waitFor(() => {
    expect(screen.getByText('User 1')).toBeInTheDocument()
  })

  rerender(<UserProfile userId="user2" />)

  await waitFor(() => {
    expect(screen.getByText('User 2')).toBeInTheDocument()
  })
})
```
```
