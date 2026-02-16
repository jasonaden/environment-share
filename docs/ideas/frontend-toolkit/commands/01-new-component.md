# /new-component Command - Planning Document

## Overview

The `/new-component` command provides a guided, multi-phase workflow for creating production-ready React components with TypeScript, tests, and Storybook stories. It orchestrates multiple specialized agents to handle architecture, implementation, testing, and documentation.

**Target audience**: Frontend engineers working with React + Relay + TypeScript (strict) + Storybook + Picnic (component library) + Yogi (Relay-connected components)

**Design goals**:
- Zero-to-complete component in one command
- Enforce team conventions (naming, file structure, testing)
- Generate all required artifacts (implementation, tests, stories, exports)
- Provide architectural guidance upfront
- Validate completeness before finishing

---

## Command Metadata

### Frontmatter

```yaml
---
description: Create a new React component with tests, stories, and exports following team conventions
argument-hint: component-name [--type picnic|composite|yogi] [--path src/components/...]
---
```

### Command Invocation

```bash
# Interactive mode (asks all questions)
/new-component

# With component name
/new-component UserCard

# With component name and type
/new-component UserCard --type yogi

# Full specification
/new-component UserCard --type composite --path src/components/cards
```

### Argument Parsing

- **$ARGUMENTS**: User input after command name
- Parse flags: `--type`, `--path`, `--skip-stories`, `--skip-tests`
- Component name: First positional argument

---

## Command .md Content Outline

### Header Section

```markdown
# Create New Component

This command guides you through creating a new React component with all required files:
- Component implementation (.tsx)
- Unit tests (.test.tsx)
- Storybook stories (.stories.tsx)
- Barrel export (index.ts)

The command uses specialized agents to ensure architectural consistency, type safety, and test coverage.

## Usage

```bash
/new-component [component-name] [options]
```

### Options

- `--type <picnic|composite|yogi>`: Component type (default: composite)
  - **picnic**: Wrapper around Picnic library primitive (Button, Input, etc.)
  - **composite**: Composed from multiple primitives (UserCard, SearchBar, etc.)
  - **yogi**: Relay-connected component with GraphQL data (UserProfile, FeedList, etc.)

- `--path <dir>`: Target directory for component (default: ask interactively)

- `--skip-stories`: Don't generate Storybook stories (not recommended)

- `--skip-tests`: Don't generate unit tests (not recommended)

### Examples

```bash
# Create a composite component interactively
/new-component UserCard

# Create a Yogi-connected component
/new-component UserProfile --type yogi --path src/features/profile/components

# Create a Picnic wrapper
/new-component CustomButton --type picnic --path src/components/buttons
```
```

---

### Phase 1: Discovery

```markdown
## Phase 1: Discovery

**Goal**: Gather all information needed to architect and implement the component.

### 1.1 Parse Arguments

Check if component name and options were provided in command invocation:

```bash
COMPONENT_NAME="${ARGUMENTS%% --*}"  # Extract first positional arg
TYPE_FLAG=$(echo "$ARGUMENTS" | grep -oP '(?<=--type )\w+' || echo "")
PATH_FLAG=$(echo "$ARGUMENTS" | grep -oP '(?<=--path )[^\s]+' || echo "")
```

If component name is missing, prompt user:

**Prompt**:
```
What is the component name? (PascalCase, e.g., UserCard, ProfileHeader)
```

**Validation**:
- Must be PascalCase (starts with capital letter)
- No spaces or special characters
- Should be descriptive noun/noun-phrase

### 1.2 Component Type

If `--type` not provided, ask:

**Prompt**:
```
What type of component are you creating?

1. **Picnic wrapper** - Wraps a Picnic library primitive (Button, Input, Select, etc.)
   - Use when: Customizing or extending a base Picnic component
   - Example: CustomButton, BrandedInput, StyledSelect

2. **Composite** - Composed from multiple primitives/components
   - Use when: Building a reusable UI pattern from smaller pieces
   - Example: UserCard, SearchBar, FormField, ModalHeader

3. **Yogi-connected** - Connected to Relay GraphQL data
   - Use when: Component needs to fetch or display server data
   - Example: UserProfile, FeedList, CommentThread
   - Note: Will include Relay fragment and useFragment hook

Choose type (1/2/3 or picnic/composite/yogi):
```

**Store result**:
```bash
COMPONENT_TYPE="<picnic|composite|yogi>"
```

### 1.3 Component Location

If `--path` not provided, ask:

**Prompt**:
```
Where should the component be created?

Recommended locations:
- src/components/       # Shared, reusable components
- src/features/<name>/components/  # Feature-specific components
- src/pages/<name>/components/     # Page-specific components

Enter directory path (or press Enter for src/components/):
```

**Validation**:
- Path must exist or be creatable
- Must be under project root
- Should follow team directory conventions

**Store result**:
```bash
COMPONENT_DIR="<path>/$COMPONENT_NAME"
```

### 1.4 Component Requirements

Ask clarifying questions based on component type:

**For all types**:
```
Brief description of the component's purpose:
[User input: one-sentence description]
```

**For Picnic wrappers**:
```
Which Picnic component are you wrapping? (e.g., Button, Input, Select)
[User input: Picnic component name]

What customizations are needed? (e.g., custom styling, additional props, behavior)
[User input: customization description]
```

**For Composite components**:
```
What sub-components or primitives will it use? (e.g., Button + Input + Icon)
[User input: list of child components]

What props should it accept? (e.g., title, onSubmit, isLoading)
[User input: list of key props]
```

**For Yogi-connected components**:
```
What data does this component display? (e.g., user profile, list of posts)
[User input: data description]

What GraphQL type will the fragment query? (e.g., User, Post, Comment)
[User input: GraphQL type name]

What fields are needed? (e.g., name, email, avatarUrl)
[User input: list of fields]
```

### 1.5 Validation Summary

Present gathered information to user:

**Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Component Creation Summary
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Name:        UserCard
Type:        composite
Location:    src/components/cards/UserCard/
Description: Displays user avatar, name, and role in a card layout

Props:       user (User type), onClick (optional), isActive (boolean)
Children:    Avatar, Text, Badge

Files to create:
  - UserCard.tsx          # Component implementation
  - UserCard.test.tsx     # Unit tests
  - UserCard.stories.tsx  # Storybook stories
  - index.ts              # Barrel export

Proceed with this configuration? (yes/no):
```

If user says no, return to discovery questions.
```

---

### Phase 2: Architecture

```markdown
## Phase 2: Architecture

**Goal**: Design the component's structure, props API, and composition before writing code.

### 2.1 Spawn Component Architect Agent

Use the Task tool to spawn a specialized agent for architectural planning:

```typescript
// Spawn component-architect agent
Task({
  subagent_type: "agent",
  name: "component-architect",
  prompt: `You are a React component architect specializing in TypeScript, Relay, and component design patterns.

Your task: Design the architecture for the ${COMPONENT_NAME} component.

Component specifications:
- Name: ${COMPONENT_NAME}
- Type: ${COMPONENT_TYPE}
- Location: ${COMPONENT_DIR}
- Description: ${DESCRIPTION}
${COMPONENT_TYPE === 'yogi' ? `- GraphQL Type: ${GRAPHQL_TYPE}\n- Fields: ${FIELDS}` : ''}

Create a detailed architectural blueprint including:

1. **Props Interface**
   - Define TypeScript interface for all props
   - Mark required vs optional props
   - Include JSDoc comments explaining each prop
   - Consider accessibility props (aria-label, role, etc.)

2. **Component Structure**
   - Outline the component's JSX structure
   - Identify sub-components and composition
   - Plan conditional rendering logic
   - Consider responsive behavior

${COMPONENT_TYPE === 'yogi' ? `
3. **Relay Integration**
   - Define GraphQL fragment with naming convention: ${COMPONENT_NAME}_data
   - Specify which fields to query
   - Plan fragment spreading in parent queries
   - Include useFragment hook usage
` : ''}

4. **State Management**
   - Identify internal state needs (if any)
   - Plan derived state or computed values
   - Consider side effects (useEffect)

5. **Event Handlers**
   - List all user interactions (onClick, onChange, etc.)
   - Define callback prop signatures
   - Plan event bubbling/stopping

6. **Styling Approach**
   - Tailwind utility classes to use
   - Responsive breakpoints (sm:, md:, lg:)
   - Dark mode considerations (dark:)
   - Animation/transition needs

7. **Accessibility**
   - Semantic HTML elements
   - ARIA attributes needed
   - Keyboard navigation support
   - Screen reader considerations

8. **Testing Strategy**
   - Key behaviors to test
   - Edge cases to cover
   - Mock data requirements

9. **Storybook Stories**
   - Default story (typical usage)
   - Variant stories (different states)
   - Edge case stories (empty, error, loading)

Present the blueprint as a structured document. Store the full architecture in task metadata as 'architecture_blueprint'.`,

  autonomous: true,
  max_turns: 10
})
```

### 2.2 Review Architecture Blueprint

When component-architect agent completes:

**Extract blueprint**:
```typescript
const blueprint = architectTask.metadata.architecture_blueprint;
```

**Present to user**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Component Architecture Blueprint
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Display formatted blueprint with sections]

Does this architecture look correct?

Options:
- yes: Proceed to implementation
- no: Describe changes needed
- revise: Re-run architect with your feedback
```

If user requests changes:
- Update prompt with user feedback
- Re-spawn component-architect with revised requirements
- Present updated blueprint for approval

### 2.3 Store Architecture Decisions

Save approved blueprint for subsequent phases:

```bash
# Store in environment variables for other agents
export COMPONENT_PROPS_INTERFACE="<props interface>"
export COMPONENT_STRUCTURE="<JSX structure>"
export COMPONENT_STYLING="<Tailwind classes>"
export RELAY_FRAGMENT="<GraphQL fragment>" # If Yogi type
```
```

---

### Phase 3: Implementation

```markdown
## Phase 3: Implementation

**Goal**: Generate the component implementation file (.tsx) based on approved architecture.

### 3.1 Spawn Component Builder Agent

```typescript
Task({
  subagent_type: "agent",
  name: "component-builder",
  prompt: `You are a React component implementation specialist.

Your task: Implement the ${COMPONENT_NAME} component based on the approved architecture.

Architecture blueprint:
${blueprint}

Requirements:
1. **File Location**: Create ${COMPONENT_DIR}/${COMPONENT_NAME}.tsx

2. **Imports**:
   - React imports (React, useState, useCallback, etc.)
   ${COMPONENT_TYPE === 'yogi' ? '- Relay: graphql, useFragment from react-relay' : ''}
   - Type imports (PropsWithChildren, ReactNode, etc.)
   - Picnic components from '@picnic/components'
   - Internal components (if needed)

3. **Props Interface**:
   - Use exact interface from architecture blueprint
   - Export interface: export interface ${COMPONENT_NAME}Props { ... }
   - Include JSDoc comments

4. **${COMPONENT_TYPE === 'yogi' ? 'Fragment Definition' : 'Component Function'}**:
   ${COMPONENT_TYPE === 'yogi' ? `
   - Define fragment ABOVE component function
   - Naming: const ${COMPONENT_NAME}Fragment = graphql\`fragment ${COMPONENT_NAME}_data on ${GRAPHQL_TYPE} { ... }\`
   - Include all fields from architecture
   ` : ''}
   - Function signature: export const ${COMPONENT_NAME}: React.FC<${COMPONENT_NAME}Props> = (props) => { ... }

5. **Component Body**:
   - Destructure props
   ${COMPONENT_TYPE === 'yogi' ? '- Call useFragment hook: const data = useFragment(fragment, props.data);' : ''}
   - Implement state management (if needed)
   - Define event handlers
   - Return JSX following architecture structure

6. **JSX Structure**:
   - Use semantic HTML elements
   - Apply Tailwind classes from architecture
   - Include accessibility attributes (aria-*, role, etc.)
   - Add data-testid attributes for testing

7. **TypeScript**:
   - Strict mode compliance (no implicit any)
   - Proper type annotations
   - Generic types where applicable

8. **Code Quality**:
   - Consistent formatting (Prettier-compatible)
   - Clear variable names
   - Logical grouping of code
   - Comments for complex logic only

After creating the file, store the component path in task metadata as 'component_path': '${COMPONENT_DIR}'.`,

  autonomous: true,
  max_turns: 15
})
```

### 3.2 Verify Implementation

When component-builder completes:

**Check generated file**:
- Read ${COMPONENT_DIR}/${COMPONENT_NAME}.tsx
- Verify file exists and is not empty
- TypeScript validation hook will run automatically (from PostToolUse hook)

**If TypeScript errors**:
- Component-builder agent should fix them (hook warnings are visible to agent)
- If agent doesn't fix, prompt: "Please address TypeScript errors before proceeding"

**Output**:
```
✅ Component implementation created
   Location: ${COMPONENT_DIR}/${COMPONENT_NAME}.tsx
   Lines: <line count>
```
```

---

### Phase 4: Stories (Storybook)

```markdown
## Phase 4: Stories

**Goal**: Generate Storybook stories for component documentation and visual testing.

### 4.1 Check Skip Flag

```bash
if [[ "$ARGUMENTS" == *"--skip-stories"* ]]; then
  echo "⏭️  Skipping Storybook stories (--skip-stories flag set)"
  # Continue to Phase 5
fi
```

### 4.2 Spawn Storybook Writer Agent

```typescript
Task({
  subagent_type: "agent",
  name: "storybook-writer",
  prompt: `You are a Storybook story specialist.

Your task: Create Storybook stories for the ${COMPONENT_NAME} component.

Component implementation: ${COMPONENT_DIR}/${COMPONENT_NAME}.tsx

Architecture blueprint:
${blueprint}

Requirements:
1. **File Location**: Create ${COMPONENT_DIR}/${COMPONENT_NAME}.stories.tsx

2. **Imports**:
   - import type { Meta, StoryObj } from '@storybook/react';
   - import { ${COMPONENT_NAME} } from './${COMPONENT_NAME}';
   ${COMPONENT_TYPE === 'yogi' ? "- import { RelayEnvironmentProvider } from 'react-relay';" : ''}
   ${COMPONENT_TYPE === 'yogi' ? "- import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';" : ''}

3. **Meta Configuration**:
   \`\`\`typescript
   const meta: Meta<typeof ${COMPONENT_NAME}> = {
     title: 'Components/${COMPONENT_NAME}',
     component: ${COMPONENT_NAME},
     parameters: {
       layout: 'centered',
     },
     tags: ['autodocs'],
     argTypes: {
       // Configure controls for each prop
     },
   };
   export default meta;
   type Story = StoryObj<typeof meta>;
   \`\`\`

4. **Stories to Create**:

   a) **Default Story** - Typical usage
   \`\`\`typescript
   export const Default: Story = {
     args: {
       // Default prop values
     },
   };
   \`\`\`

   b) **Variant Stories** - Different states from architecture
   - Based on prop combinations
   - Show responsive behavior
   - Demonstrate different sizes/colors/states

   c) **Edge Case Stories**:
   - Loading state (if applicable)
   - Error state (if applicable)
   - Empty state (if applicable)
   - Disabled state (if applicable)

   ${COMPONENT_TYPE === 'yogi' ? `
   d) **Relay Mock Stories**:
   - Use MockPayloadGenerator for fragment data
   - Create realistic mock data
   - Wrap component in RelayEnvironmentProvider
   ` : ''}

5. **Story Decorators** (if needed):
   - Add padding/spacing for better preview
   - Include dark mode decorator for dark: variants
   - Add responsive viewport decorators

6. **Accessibility**:
   - Include a11y addon stories
   - Test keyboard navigation scenarios

After creating the file, ensure all stories render without errors.`,

  autonomous: true,
  max_turns: 10
})
```

### 4.3 Verify Stories

**Check generated file**:
- Read ${COMPONENT_DIR}/${COMPONENT_NAME}.stories.tsx
- Verify file exists

**Optional**: Launch Storybook to verify stories render:
```bash
# Don't block on this, just inform user
echo "💡 To view stories, run: npm run storybook"
```

**Output**:
```
✅ Storybook stories created
   Location: ${COMPONENT_DIR}/${COMPONENT_NAME}.stories.tsx
   Stories: Default, <variant names>, <edge case names>
```
```

---

### Phase 5: Testing

```markdown
## Phase 5: Testing

**Goal**: Generate comprehensive unit tests for the component.

### 5.1 Check Skip Flag

```bash
if [[ "$ARGUMENTS" == *"--skip-tests"* ]]; then
  echo "⏭️  Skipping unit tests (--skip-tests flag set)"
  # Continue to Phase 6
fi
```

### 5.2 Spawn Test Writer Agent

```typescript
Task({
  subagent_type: "agent",
  name: "test-writer",
  prompt: `You are a React testing specialist using React Testing Library and Jest.

Your task: Create comprehensive unit tests for the ${COMPONENT_NAME} component.

Component implementation: ${COMPONENT_DIR}/${COMPONENT_NAME}.tsx

Architecture blueprint:
${blueprint}

Requirements:
1. **File Location**: Create ${COMPONENT_DIR}/${COMPONENT_NAME}.test.tsx

2. **Imports**:
   - import { render, screen, fireEvent, waitFor } from '@testing-library/react';
   - import userEvent from '@testing-library/user-event';
   - import { ${COMPONENT_NAME} } from './${COMPONENT_NAME}';
   ${COMPONENT_TYPE === 'yogi' ? "- import { createMockEnvironment, MockPayloadGenerator } from 'relay-test-utils';" : ''}
   ${COMPONENT_TYPE === 'yogi' ? "- import { RelayEnvironmentProvider } from 'react-relay';" : ''}

3. **Test Structure**:
   \`\`\`typescript
   describe('${COMPONENT_NAME}', () => {
     // Test cases here
   });
   \`\`\`

4. **Test Categories**:

   a) **Rendering Tests**:
   - Component renders without crashing
   - Renders with required props
   - Renders correct text/content
   - Applies correct CSS classes

   b) **Prop Tests**:
   - Test each prop's effect on rendering
   - Test prop combinations
   - Test default prop values
   - Test prop type validation (TypeScript)

   c) **Interaction Tests**:
   - Test onClick/onChange/onSubmit handlers
   - Test keyboard interactions (Enter, Escape, Tab)
   - Test form submission (if form component)
   - Test focus management

   d) **State Tests** (if component has state):
   - Test state updates on user interaction
   - Test derived state calculations
   - Test side effects (useEffect)

   e) **Accessibility Tests**:
   - Test ARIA attributes presence
   - Test keyboard navigation
   - Test screen reader text (aria-label, aria-describedby)
   - Test focus indicators

   ${COMPONENT_TYPE === 'yogi' ? `
   f) **Relay Tests**:
   - Mock Relay environment setup
   - Mock fragment data with MockPayloadGenerator
   - Test data rendering from fragment
   - Test loading/error states
   ` : ''}

   g) **Edge Cases**:
   - Test with missing optional props
   - Test with extreme values (very long text, etc.)
   - Test error boundaries (if applicable)

5. **Test Utilities**:
   - Create helper function for rendering with default props
   ${COMPONENT_TYPE === 'yogi' ? '- Create helper for Relay environment setup' : ''}
   - Use data-testid for querying complex elements
   - Prefer screen queries: getByRole > getByLabelText > getByTestId

6. **Best Practices**:
   - One assertion per test (mostly)
   - Descriptive test names: it('should <behavior> when <condition>')
   - Arrange-Act-Assert pattern
   - Clean up after tests (RTL does this automatically)
   - Avoid testing implementation details

7. **Coverage Goals**:
   - Aim for 80%+ line coverage
   - Cover all user-facing behaviors
   - Cover error scenarios

After creating tests, ensure they all pass.`,

  autonomous: true,
  max_turns: 15
})
```

### 5.3 Run Tests

**Execute test suite**:
```bash
npm test -- ${COMPONENT_DIR}/${COMPONENT_NAME}.test.tsx --coverage
```

**Parse results**:
- Extract pass/fail status
- Extract coverage percentages
- Extract any failing test names

**If tests fail**:
- Show failure output to user
- Ask: "Tests are failing. Should I fix them? (yes/no)"
- If yes, spawn test-writer again with failure context

**Output**:
```
✅ Unit tests created
   Location: ${COMPONENT_DIR}/${COMPONENT_NAME}.test.tsx
   Tests: <count> passing
   Coverage: <line %>% lines, <branch %>% branches
```
```

---

### Phase 6: Verification

```markdown
## Phase 6: Verification

**Goal**: Verify component completeness and generate final summary.

### 6.1 Component Completeness Check

The `component-completeness` hook runs automatically on SubagentStop for component-builder agent. It verifies:
- ✅ Component implementation (.tsx)
- ✅ Unit tests (.test.tsx)
- ✅ Storybook stories (.stories.tsx)
- ✅ Barrel export (index.ts)

If any files are missing, the hook will report them.

### 6.2 Create Barrel Export

If index.ts doesn't exist or is incomplete:

**Create index.ts**:
```typescript
export { ${COMPONENT_NAME} } from './${COMPONENT_NAME}';
export type { ${COMPONENT_NAME}Props } from './${COMPONENT_NAME}';
```

**Verify export**:
```bash
# Check if export is valid
node -e "require('${COMPONENT_DIR}')"
```

### 6.3 TypeScript Validation

Run final TypeScript check on all generated files:

```bash
npx tsc --noEmit \
  ${COMPONENT_DIR}/${COMPONENT_NAME}.tsx \
  ${COMPONENT_DIR}/${COMPONENT_NAME}.test.tsx \
  ${COMPONENT_DIR}/${COMPONENT_NAME}.stories.tsx
```

If type errors, report to user and offer to fix.

### 6.4 Lint Check (Optional)

```bash
npx eslint ${COMPONENT_DIR}/*.tsx --fix
```

Auto-fix common issues, report unfixable ones.

### 6.5 Final Summary

**Generate comprehensive summary**:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Component Creation Complete
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Component: ${COMPONENT_NAME}
Type: ${COMPONENT_TYPE}
Location: ${COMPONENT_DIR}/

Files created:
  ✅ ${COMPONENT_NAME}.tsx          (${LINE_COUNT} lines)
  ✅ ${COMPONENT_NAME}.test.tsx     (${TEST_COUNT} tests, ${COVERAGE}% coverage)
  ✅ ${COMPONENT_NAME}.stories.tsx  (${STORY_COUNT} stories)
  ✅ index.ts                        (barrel export)

Validation:
  ✅ TypeScript: No errors
  ✅ Tests: ${TEST_COUNT} passing
  ✅ Lint: No issues

Next steps:
1. Review generated files in your editor
2. Run Storybook to see component: npm run storybook
3. Run tests: npm test ${COMPONENT_NAME}
${COMPONENT_TYPE === 'yogi' ? '4. Update parent GraphQL query to spread fragment' : ''}
4. Export component in parent index.ts (if needed)

Usage example:
\`\`\`typescript
import { ${COMPONENT_NAME} } from '${COMPONENT_DIR}';

<${COMPONENT_NAME} ${EXAMPLE_PROPS} />
\`\`\`

${COMPONENT_TYPE === 'yogi' ? `
Fragment usage:
\`\`\`graphql
fragment ParentComponent_data on Query {
  ${GRAPHQL_TYPE_LOWER} {
    ...${COMPONENT_NAME}_data
  }
}
\`\`\`
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
```

---

## Validation Criteria

### End-to-End Success

A complete, successful /new-component execution produces:

1. **${COMPONENT_DIR}/${COMPONENT_NAME}.tsx**:
   - Valid TypeScript (strict mode)
   - Exported component function
   - Exported props interface
   - Proper imports
   - ${COMPONENT_TYPE === 'yogi' ? 'Relay fragment and useFragment hook' : 'No type errors'}
   - Tailwind styling
   - Accessibility attributes
   - data-testid attributes

2. **${COMPONENT_DIR}/${COMPONENT_NAME}.test.tsx**:
   - Valid TypeScript
   - Imports from React Testing Library
   - Describe block with component name
   - At least 5 test cases
   - Tests pass (npm test)
   - 80%+ code coverage

3. **${COMPONENT_DIR}/${COMPONENT_NAME}.stories.tsx**:
   - Valid TypeScript
   - Proper Storybook v7+ format
   - Meta configuration
   - At least 3 stories (Default + variants)
   - ${COMPONENT_TYPE === 'yogi' ? 'Relay mock environment setup' : 'Proper args configuration'}

4. **${COMPONENT_DIR}/index.ts**:
   - Exports component
   - Exports props interface
   - Valid module syntax

### Validation Checks

At end of Phase 6, verify:

```bash
# All files exist
[[ -f "${COMPONENT_DIR}/${COMPONENT_NAME}.tsx" ]] || exit 1
[[ -f "${COMPONENT_DIR}/${COMPONENT_NAME}.test.tsx" ]] || exit 1
[[ -f "${COMPONENT_DIR}/${COMPONENT_NAME}.stories.tsx" ]] || exit 1
[[ -f "${COMPONENT_DIR}/index.ts" ]] || exit 1

# TypeScript compiles
npx tsc --noEmit ${COMPONENT_DIR}/*.tsx || exit 1

# Tests pass
npm test -- ${COMPONENT_DIR}/${COMPONENT_NAME}.test.tsx --passWithNoTests=false || exit 1

# Stories are valid (syntax check)
node -e "require('${COMPONENT_DIR}/${COMPONENT_NAME}.stories.tsx')" || exit 1
```

---

## Skills to Load When Building

When implementing this command, load the following skill:

```bash
/skill plugin-dev:command-development
```

The `command-development` skill provides:
- Command .md format specification
- Frontmatter schema
- Argument parsing utilities
- Phase structure best practices
- Task tool orchestration patterns
- User interaction patterns

---

## Error Handling

### Common Failure Scenarios

1. **Component name already exists**:
   ```
   Error: Component ${COMPONENT_NAME} already exists at ${COMPONENT_DIR}

   Options:
   - Choose a different name
   - Delete existing component: rm -rf ${COMPONENT_DIR}
   - Use a different path: --path <other-dir>
   ```

2. **TypeScript compilation fails**:
   ```
   Error: TypeScript validation failed after 3 retry attempts

   Errors found in: ${COMPONENT_DIR}/${COMPONENT_NAME}.tsx
   [Show errors]

   This may indicate an issue with component architecture.
   Would you like to:
   1. Revise architecture and regenerate
   2. Fix manually (exit command)
   3. Proceed anyway (not recommended)
   ```

3. **Tests fail**:
   ```
   Error: ${FAILING_TEST_COUNT} tests failing

   Failing tests:
   - should handle click events
   - should render with custom className

   Would you like me to:
   1. Fix failing tests automatically
   2. Show test output for manual fixing
   3. Skip tests and proceed (not recommended)
   ```

4. **Agent timeout**:
   ```
   Error: ${AGENT_NAME} agent exceeded max_turns (15)

   This may indicate:
   - Complex component requiring manual implementation
   - Unclear requirements
   - Tool/API issues

   Partial progress saved to: ${COMPONENT_DIR}
   You can complete the component manually.
   ```

5. **Path doesn't exist**:
   ```
   Error: Directory ${COMPONENT_DIR} does not exist

   Would you like me to create it? (yes/no)
   ```

---

## Integration Notes

### Hooks Integration

This command relies on hooks for quality gates:

1. **typescript-validate** (PostToolUse): Runs after each .tsx file is written
2. **check-relay-fragments** (PostToolUse): Validates fragment naming (Yogi components)
3. **component-completeness** (SubagentStop): Runs after component-builder finishes

Agents see hook warnings and can self-correct before moving to next phase.

### Team Conventions

Command enforces:

- **Naming**: PascalCase component names
- **File structure**: Component directory with 4 files
- **TypeScript**: Strict mode, no implicit any
- **Testing**: React Testing Library, 80%+ coverage goal
- **Storybook**: CSF v3 format, autodocs, multiple stories
- **Relay**: Fragment naming convention (ComponentName_propName)
- **Accessibility**: ARIA attributes, semantic HTML

### Customization Points

Teams can customize by editing command .md:

- Change default component location
- Add/remove required files
- Adjust test coverage threshold
- Modify Storybook configuration
- Add additional validation checks
- Change agent prompts for different code style

---

## Performance Characteristics

### Execution Time

Typical execution time by component type:

- **Picnic wrapper**: 2-3 minutes (simpler implementation)
- **Composite**: 3-5 minutes (more complex structure)
- **Yogi-connected**: 5-7 minutes (includes Relay setup and mocks)

Phases breakdown:
- Phase 1 (Discovery): 30s (user interaction)
- Phase 2 (Architecture): 30-60s (agent planning)
- Phase 3 (Implementation): 60-90s (code generation)
- Phase 4 (Stories): 45-60s (story creation)
- Phase 5 (Testing): 60-90s (test generation + execution)
- Phase 6 (Verification): 15-30s (validation checks)

### Token Usage

Estimated token usage:

- Discovery phase: ~2k tokens (prompts)
- Architecture agent: ~15k tokens (planning)
- Implementation agent: ~20k tokens (code generation)
- Stories agent: ~10k tokens (story generation)
- Test agent: ~15k tokens (test generation)
- **Total**: ~62k tokens per component

For teams with budget constraints, use `--skip-stories` or `--skip-tests` flags to reduce token usage.

---

## Testing Strategy

### Command Testing

Test the complete workflow:

```bash
# Test 1: Simple composite component
/new-component TestCard --type composite --path /tmp/test-components

# Verify:
# - All 4 files created
# - TypeScript compiles
# - Tests pass
# - Stories render

# Test 2: Yogi-connected component
/new-component TestProfile --type yogi --path /tmp/test-components

# Verify:
# - Relay fragment defined
# - useFragment hook used
# - Mock environment in stories
# - Relay tests present

# Test 3: Error handling - existing component
/new-component TestCard --type composite --path /tmp/test-components

# Verify:
# - Error message shown
# - Options presented
# - No files overwritten

# Test 4: Skip flags
/new-component TestButton --type picnic --skip-tests --skip-stories

# Verify:
# - Only .tsx and index.ts created
# - No .test.tsx or .stories.tsx
```

### Agent Testing

Test individual agents in isolation:

```bash
# Test component-architect agent
# Verify blueprint is comprehensive and follows conventions

# Test component-builder agent
# Verify generated code compiles and follows style guide

# Test storybook-writer agent
# Verify stories follow CSF v3 format and render

# Test test-writer agent
# Verify tests pass and achieve coverage goals
```

---

## Future Enhancements

1. **Component templates**: Pre-built templates for common patterns (modal, form, card, etc.)
2. **Migration support**: Convert class components to functional components
3. **Performance optimization**: Add React.memo, useMemo, useCallback where beneficial
4. **Animation support**: Integrate Framer Motion or CSS animations
5. **Responsive preview**: Generate responsive design screenshots in stories
6. **Visual regression**: Integrate Chromatic or Percy for visual testing
7. **Bundle size tracking**: Warn if component exceeds size threshold
8. **Dependency analysis**: Show which other components depend on this one

---

## Appendix: Example Output

### Complete File Structure

```
src/components/cards/UserCard/
├── UserCard.tsx          # 120 lines
├── UserCard.test.tsx     # 85 lines, 12 tests
├── UserCard.stories.tsx  # 65 lines, 5 stories
└── index.ts              # 2 lines
```

### UserCard.tsx (Excerpt)

```typescript
import React from 'react';
import { Avatar, Text, Badge } from '@picnic/components';

export interface UserCardProps {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
    role: 'admin' | 'user' | 'guest';
  };
  isActive?: boolean;
  onClick?: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  user,
  isActive = false,
  onClick,
}) => {
  return (
    <div
      className={`
        flex items-center gap-4 p-4 rounded-lg border
        ${isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
        ${onClick ? 'cursor-pointer hover:shadow-md' : ''}
        transition-shadow
      `}
      onClick={onClick}
      data-testid="user-card"
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Avatar src={user.avatarUrl} alt={user.name} size="md" />
      <div className="flex-1">
        <Text variant="h4" className="font-semibold">
          {user.name}
        </Text>
        <Text variant="body2" className="text-gray-600">
          {user.email}
        </Text>
      </div>
      <Badge variant={user.role === 'admin' ? 'primary' : 'secondary'}>
        {user.role}
      </Badge>
    </div>
  );
};
```

### UserCard.test.tsx (Excerpt)

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  const mockUser = {
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user' as const,
  };

  it('should render user information', () => {
    render(<UserCard user={mockUser} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('user')).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<UserCard user={mockUser} onClick={handleClick} />);

    fireEvent.click(screen.getByTestId('user-card'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  // ... more tests
});
```

---

## Implementation Checklist

- [ ] Write command .md with all 6 phases
- [ ] Define frontmatter (description, argument-hint)
- [ ] Implement argument parsing logic
- [ ] Create component-architect agent prompt
- [ ] Create component-builder agent prompt
- [ ] Create storybook-writer agent prompt
- [ ] Create test-writer agent prompt
- [ ] Add verification logic for Phase 6
- [ ] Handle error scenarios (existing component, TypeScript errors, etc.)
- [ ] Add skip flags (--skip-tests, --skip-stories)
- [ ] Generate final summary output
- [ ] Test with all 3 component types (picnic, composite, yogi)
- [ ] Test error handling paths
- [ ] Verify hooks integration (typescript-validate, check-relay-fragments, component-completeness)
- [ ] Document command in plugin README
- [ ] Get feedback from 3-5 frontend engineers
