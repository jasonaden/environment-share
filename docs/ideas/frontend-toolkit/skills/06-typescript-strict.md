# Skill Plan: TypeScript Strict Mode

## Purpose and Scope

This skill provides comprehensive knowledge of TypeScript strict mode patterns and conventions used across the organization's frontend applications. It enables agents to:

- Apply TypeScript strict mode rules correctly
- Design type-safe component APIs and function signatures
- Use utility types effectively for common patterns
- Handle Relay-generated types correctly
- Implement discriminated unions for complex state
- Apply generic types appropriately
- Avoid common TypeScript anti-patterns
- Configure tsconfig.json for strict mode
- Leverage type inference while maintaining safety
- Debug complex type errors effectively

The skill emphasizes practical TypeScript patterns that work well with React, Relay, and the organization's component libraries, while maintaining the strictest possible type safety.

## Trigger Description

```yaml
description: >
  This skill provides comprehensive knowledge of TypeScript strict mode patterns and conventions,
  including strict-mode rules, type utilities, generic patterns, discriminated unions, and proper typing
  of React and Relay code. This skill should be used when the user asks about TypeScript patterns,
  type errors, strict mode configuration, type utilities, generic types, typing React components,
  typing Relay fragments, or resolving TypeScript compilation errors.
```

## SKILL.md Specification

Target length: 1900 words

### Section 1: Introduction to TypeScript Strict Mode (200 words)
- Overview of strict mode at the organization
- Why strict mode: catch bugs early, better IDE support
- Strict mode flags in tsconfig.json
- Migration strategy for existing code
- ESLint integration for TypeScript
- Type checking in CI/CD

### Section 2: Strict Mode Rules and Patterns (400 words)
- No implicit any (explicit types required)
- Strict null checks (handling null and undefined)
- Strict function types
- No unused locals and parameters
- Exact optional property types
- Strict bind/call/apply
- Strict property initialization
- Common patterns for each rule

### Section 3: React Component Typing (350 words)
- Typing functional components
- Props interfaces vs. types
- Children prop patterns
- Event handler typing
- Ref typing (useRef, forwardRef)
- Generic component props
- Discriminated union props (variants)
- Polymorphic component typing (as prop)

### Section 4: Relay Type Patterns (300 words)
- Fragment key types (FragmentName_type$key)
- Fragment data types (FragmentName_type$data)
- Query types for useLazyLoadQuery
- Mutation types for useMutation
- Connection typing
- Type narrowing with fragments
- Optional fragments (?? operator)

### Section 5: Utility Types (350 words)
- Built-in utilities (Partial, Required, Pick, Omit, etc.)
- Custom utility types for common patterns
- Conditional types
- Mapped types
- Template literal types
- Type guards and predicates
- Type assertions (when necessary)

### Section 6: Generics Patterns (200 words)
- When to use generics
- Generic components
- Generic hooks
- Constraint types
- Default type parameters
- Generic inference

### Section 7: Common Patterns and Anti-Patterns (100 words)
- Discriminated unions for state machines
- Exhaustiveness checking
- Avoiding type assertions (as)
- Avoiding any and unknown
- Type narrowing techniques

## Reference Files

### type-patterns.md
**Purpose**: Complete catalog of TypeScript patterns with examples

**Estimated size**: 5,000-6,000 lines

**Outline**:
1. **Strict Mode Configuration** (400 lines)
   - Complete tsconfig.json
   - All strict flags explained
   - Compiler options for React
   - Path mapping
   - ESLint configuration

2. **React Component Typing** (1,200 lines)
   - Functional component patterns
   - Props typing patterns
   - Children patterns
   - Event handlers
   - Refs and forwardRef
   - Generic components
   - Polymorphic components
   - Compound component typing
   - Each with examples

3. **Relay Type Patterns** (800 lines)
   - Fragment typing
   - Query typing
   - Mutation typing
   - Pagination fragment typing
   - Refetchable fragment typing
   - Connection typing
   - Error handling types

4. **Utility Types Library** (1,000 lines)
   - Built-in utility types with examples
   - Custom utility types:
     - PropsWithClassName
     - PropsWithTestId
     - ValueOf<T>
     - RequireAtLeastOne<T>
     - RequireOnlyOne<T>
     - DeepPartial<T>
     - DeepReadonly<T>
   - When to use each

5. **Discriminated Unions** (600 lines)
   - State machine typing
   - Loading/error/success states
   - Exhaustiveness checking
   - Type narrowing patterns
   - Real-world examples

6. **Generic Patterns** (500 lines)
   - Generic components
   - Generic hooks
   - Generic utility functions
   - Constraints and defaults
   - Type inference

7. **Advanced Patterns** (500 lines)
   - Conditional types
   - Mapped types
   - Template literal types
   - Recursive types
   - Type predicates

8. **Anti-Patterns to Avoid** (500 lines)
   - Using any (alternatives)
   - Type assertions (when to avoid)
   - Loose typing
   - Ignoring null/undefined
   - Each with correct alternative

## Used By Agents

- **component-architect**: Designs type-safe component APIs
- **component-builder**: Implements components with correct types
- **frontend-reviewer**: Validates TypeScript type safety
- **test-writer**: Types test utilities and mocks

## Dependencies

- **react-patterns**: Understanding React patterns to type correctly
- **relay-conventions**: Relay-generated types usage

## Skills to Load When Building

- `plugin-dev:skill-development` (required for skill creation)

## Validation Criteria

### Should Trigger (3 test queries)

1. "How do I type this React component with generic props?"
2. "What's the correct type for a Relay fragment ref?"
3. "How do I fix this TypeScript strict null check error?"

### Should NOT Trigger (2 test queries)

1. "How do I fetch data with Relay?" (relay-conventions)
2. "Which design system component should I use?" (picnic-components)

### Progressive Disclosure Test

1. **Frontmatter only**: User asks "I have a TypeScript type error"
   - Expected: Agent suggests checking strict mode patterns

2. **SKILL.md loaded**: User asks "How do I handle null values in strict mode?"
   - Expected: Agent provides strict null check patterns

3. **References loaded**: User asks "Show me how to type a generic dropdown component"
   - Expected: Agent provides complete generic component example from type-patterns.md

## Example Content Snippets

### Example 1: Strict Null Checks Pattern

```markdown
## Strict Null Checks

With `strictNullChecks: true`, TypeScript treats `null` and `undefined` as distinct from other types. You must explicitly handle them.

### The Problem

```tsx
// ERROR: Object is possibly 'null' or 'undefined'
interface User {
  name: string
  email: string | null
}

function UserProfile({ user }: { user: User | null }) {
  return <div>{user.name}</div>  // Error!
}
```

### Solution 1: Optional Chaining

```tsx
function UserProfile({ user }: { user: User | null }) {
  return <div>{user?.name}</div>  // Returns undefined if user is null
}
```

### Solution 2: Nullish Coalescing

```tsx
function UserProfile({ user }: { user: User | null }) {
  return <div>{user?.name ?? 'Guest'}</div>  // Fallback to 'Guest'
}
```

### Solution 3: Type Guard

```tsx
function UserProfile({ user }: { user: User | null }) {
  if (!user) {
    return <div>No user found</div>
  }

  // TypeScript knows user is User (not null) here
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email ?? 'No email provided'}</p>
    </div>
  )
}
```

### Solution 4: Non-null Assertion (Use Sparingly)

```tsx
function UserProfile({ user }: { user: User | null }) {
  // Only if you're 100% certain user is not null
  return <div>{user!.name}</div>
}
```

**Warning**: Non-null assertion (!) bypasses type checking. Use only when you have external guarantees (like after a type guard in a different scope).

### Handling Relay Fragment Refs

Relay fragment refs are never null by design, but optional fragments need handling:

```tsx
// Required fragment (never null)
interface Props {
  user: UserProfile_user$key
}

function UserProfile({ user }: Props) {
  const data = useFragment(fragment, user)
  // data is User, not User | null
  return <div>{data.name}</div>
}

// Optional fragment (might be null)
interface Props {
  user: UserProfile_user$key | null
}

function UserProfile({ user }: Props) {
  const data = useFragment(fragment, user ?? null)

  if (!data) {
    return <div>No user</div>
  }

  return <div>{data.name}</div>
}
```

### Handling Array Methods

Array methods like `find` return `T | undefined`:

```tsx
const users: User[] = [...]

// ERROR: Object is possibly 'undefined'
const admin = users.find(u => u.role === 'admin')
console.log(admin.name)

// CORRECT: Check for undefined
const admin = users.find(u => u.role === 'admin')
if (admin) {
  console.log(admin.name)
}

// CORRECT: Provide default
const admin = users.find(u => u.role === 'admin') ?? { name: 'No admin', role: 'admin' }
console.log(admin.name)
```

### Strict Null Checks in Function Parameters

```tsx
// Make parameters explicitly nullable if they can be null
function updateUser(userId: string, updates: Partial<User> | null) {
  if (!updates) {
    return
  }

  // TypeScript knows updates is not null here
  api.updateUser(userId, updates)
}
```

### Optional vs. Undefined vs. Null

```tsx
// Optional property (can be omitted)
interface User {
  name: string
  email?: string  // string | undefined
}

const user1: User = { name: 'Alice' }  // Valid
const user2: User = { name: 'Bob', email: 'bob@example.com' }  // Valid

// Explicit undefined (must be present but can be undefined)
interface User {
  name: string
  email: string | undefined
}

const user1: User = { name: 'Alice' }  // ERROR: email is required
const user2: User = { name: 'Alice', email: undefined }  // Valid

// Null (must be present but can be null)
interface User {
  name: string
  email: string | null
}

const user: User = { name: 'Alice', email: null }  // Valid
```

**Convention**: Use optional (`?`) for properties that may not exist. Use `| null` for properties that exist but may have no value.
```

### Example 2: Discriminated Union for Component States

```markdown
## Discriminated Unions for State Management

Discriminated unions (tagged unions) are the TypeScript pattern for representing mutually exclusive states.

### The Problem: Boolean Flags

```tsx
// BAD: Boolean flags don't prevent impossible states
interface ComponentState {
  loading: boolean
  error: Error | null
  data: User[] | null
}

// Impossible states are possible:
const badState: ComponentState = {
  loading: true,
  error: new Error('Failed'),
  data: [{ id: '1', name: 'Alice' }],
}
// Loading AND error AND data? Which one is true?
```

### The Solution: Discriminated Union

```tsx
// GOOD: Only valid states are possible
type ComponentState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: User[] }

// Only valid states can be created:
const state1: ComponentState = { status: 'idle' }
const state2: ComponentState = { status: 'loading' }
const state3: ComponentState = { status: 'error', error: new Error('Failed') }
const state4: ComponentState = { status: 'success', data: [] }

// Impossible state causes type error:
const badState: ComponentState = {
  status: 'loading',
  data: [],  // ERROR: 'data' does not exist on type { status: 'loading' }
}
```

### Pattern in React Component

```tsx
type FetchState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'error'; error: Error }
  | { status: 'success'; data: T }

function UserList() {
  const [state, setState] = useState<FetchState<User[]>>({ status: 'idle' })

  useEffect(() => {
    setState({ status: 'loading' })

    fetchUsers()
      .then((data) => setState({ status: 'success', data }))
      .catch((error) => setState({ status: 'error', error }))
  }, [])

  // Type narrowing with switch
  switch (state.status) {
    case 'idle':
      return <div>Click to load</div>

    case 'loading':
      return <Spinner />

    case 'error':
      // TypeScript knows state.error exists
      return <ErrorMessage error={state.error} />

    case 'success':
      // TypeScript knows state.data exists
      return (
        <ul>
          {state.data.map((user) => (
            <li key={user.id}>{user.name}</li>
          ))}
        </ul>
      )
  }
}
```

### Exhaustiveness Checking

TypeScript ensures you handle all cases:

```tsx
function renderState(state: FetchState<User[]>) {
  switch (state.status) {
    case 'idle':
      return <div>Idle</div>

    case 'loading':
      return <Spinner />

    case 'error':
      return <ErrorMessage error={state.error} />

    // Forgot 'success' case
  }

  // ERROR: Function lacks ending return statement and return type does not include 'undefined'
}
```

Add exhaustiveness check:

```tsx
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`)
}

function renderState(state: FetchState<User[]>) {
  switch (state.status) {
    case 'idle':
      return <div>Idle</div>

    case 'loading':
      return <Spinner />

    case 'error':
      return <ErrorMessage error={state.error} />

    default:
      return assertNever(state)
      // ERROR: Argument of type '{ status: "success"; data: User[] }' is not assignable to parameter of type 'never'
  }
}
```

### Complex State Machine Example

```tsx
type FormState =
  | { stage: 'editing'; values: FormValues; errors: Record<string, string> }
  | { stage: 'validating'; values: FormValues }
  | { stage: 'submitting'; values: FormValues }
  | { stage: 'success'; submittedValues: FormValues }
  | { stage: 'failed'; values: FormValues; error: Error }

function FormComponent() {
  const [state, setState] = useState<FormState>({
    stage: 'editing',
    values: initialValues,
    errors: {},
  })

  const handleSubmit = () => {
    if (state.stage !== 'editing') return

    setState({ stage: 'validating', values: state.values })

    validateForm(state.values)
      .then(() => {
        setState({ stage: 'submitting', values: state.values })
        return submitForm(state.values)
      })
      .then(() => {
        setState({ stage: 'success', submittedValues: state.values })
      })
      .catch((error) => {
        setState({ stage: 'failed', values: state.values, error })
      })
  }

  // Render based on stage
  if (state.stage === 'editing') {
    return (
      <form onSubmit={handleSubmit}>
        {/* state.values and state.errors are available */}
        <Input value={state.values.name} error={state.errors.name} />
        <Button type="submit">Submit</Button>
      </form>
    )
  }

  if (state.stage === 'validating' || state.stage === 'submitting') {
    return <Spinner />
  }

  if (state.stage === 'success') {
    return <SuccessMessage>Form submitted successfully!</SuccessMessage>
  }

  if (state.stage === 'failed') {
    return (
      <>
        <ErrorMessage error={state.error} />
        <Button onClick={() => setState({ stage: 'editing', values: state.values, errors: {} })}>
          Try Again
        </Button>
      </>
    )
  }

  return assertNever(state)
}
```

### Benefits

1. **Impossible states are impossible**: Can't have `loading: true` and `data: [...]` simultaneously
2. **Type safety**: TypeScript enforces which fields exist in each state
3. **Exhaustiveness**: Compiler ensures all states are handled
4. **Self-documenting**: State machine is clear from the type definition
```

### Example 3: Generic Component Typing

```markdown
## Generic Component Typing

Generic components allow reusable components with type safety for different data types.

### Basic Generic Component

```tsx
interface ListProps<T> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
  keyExtractor: (item: T) => string
}

function List<T>({ items, renderItem, keyExtractor }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={keyExtractor(item)}>{renderItem(item)}</li>
      ))}
    </ul>
  )
}

// Usage with type inference
<List
  items={users}  // User[]
  renderItem={(user) => <div>{user.name}</div>}  // user is inferred as User
  keyExtractor={(user) => user.id}
/>

<List
  items={products}  // Product[]
  renderItem={(product) => <div>{product.title}</div>}  // product is inferred as Product
  keyExtractor={(product) => product.id}
/>
```

### Generic Component with Constraints

```tsx
// Constraint: T must have an 'id' property
interface Identifiable {
  id: string
}

interface ListProps<T extends Identifiable> {
  items: T[]
  renderItem: (item: T) => React.ReactNode
}

function List<T extends Identifiable>({ items, renderItem }: ListProps<T>) {
  return (
    <ul>
      {items.map((item) => (
        <li key={item.id}>{renderItem(item)}</li>  // Can access item.id
      ))}
    </ul>
  )
}

// Usage
interface User extends Identifiable {
  name: string
  email: string
}

<List items={users} renderItem={(user) => <div>{user.name}</div>} />

// ERROR: Type 'number' is not assignable to type 'string'
<List items={[{ id: 123, name: 'Alice' }]} />  // id must be string
```

### Generic Dropdown Component

```tsx
interface DropdownProps<T> {
  options: T[]
  value: T | null
  onChange: (value: T) => void
  getOptionLabel: (option: T) => string
  getOptionValue: (option: T) => string
  renderOption?: (option: T) => React.ReactNode
}

function Dropdown<T>({
  options,
  value,
  onChange,
  getOptionLabel,
  getOptionValue,
  renderOption,
}: DropdownProps<T>) {
  return (
    <select
      value={value ? getOptionValue(value) : ''}
      onChange={(e) => {
        const selectedOption = options.find(
          (opt) => getOptionValue(opt) === e.target.value
        )
        if (selectedOption) {
          onChange(selectedOption)
        }
      }}
    >
      {options.map((option) => (
        <option key={getOptionValue(option)} value={getOptionValue(option)}>
          {renderOption ? renderOption(option) : getOptionLabel(option)}
        </option>
      ))}
    </select>
  )
}

// Usage
<Dropdown
  options={users}
  value={selectedUser}
  onChange={setSelectedUser}
  getOptionLabel={(user) => user.name}
  getOptionValue={(user) => user.id}
/>
```

### Generic Hook

```tsx
interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  execute: (...args: any[]) => Promise<void>
}

function useAsync<T>(asyncFunction: (...args: any[]) => Promise<T>): UseAsyncState<T> {
  const [state, setState] = useState<{
    data: T | null
    loading: boolean
    error: Error | null
  }>({
    data: null,
    loading: false,
    error: null,
  })

  const execute = useCallback(
    async (...args: any[]) => {
      setState({ data: null, loading: true, error: null })

      try {
        const result = await asyncFunction(...args)
        setState({ data: result, loading: false, error: null })
      } catch (error) {
        setState({ data: null, loading: false, error: error as Error })
      }
    },
    [asyncFunction]
  )

  return { ...state, execute }
}

// Usage
const { data: users, loading, error, execute } = useAsync<User[]>(fetchUsers)

useEffect(() => {
  execute()
}, [execute])

// data is typed as User[] | null
```

### Default Type Parameters

```tsx
// Default to string if no type provided
interface InputProps<T = string> {
  value: T
  onChange: (value: T) => void
  parse?: (raw: string) => T
  format?: (value: T) => string
}

function Input<T = string>({
  value,
  onChange,
  parse = (raw) => raw as T,
  format = (val) => String(val),
}: InputProps<T>) {
  return (
    <input
      type="text"
      value={format(value)}
      onChange={(e) => onChange(parse(e.target.value))}
    />
  )
}

// Default string type
<Input value={name} onChange={setName} />

// Explicit number type
<Input<number>
  value={age}
  onChange={setAge}
  parse={(raw) => parseInt(raw, 10)}
  format={(val) => val.toString()}
/>
```
```
