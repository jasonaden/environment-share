# Skill Plan: Picnic Components

## Purpose and Scope

This skill provides comprehensive knowledge of the Picnic design system component library used across the organization's frontend applications. It enables agents to:

- Understand the complete catalog of available Picnic components
- Select appropriate components for specific UI requirements
- Apply correct props, variants, and composition patterns
- Follow design system conventions for consistency
- Access design tokens (colors, spacing, typography) that underpin the system
- Understand accessibility requirements built into each component
- Know when to compose existing components vs. creating new ones

The skill covers the full component library, from basic primitives (Button, Input, Text) to complex compositions (DataTable, Modal, Form), plus the design token system that ensures visual consistency.

## Trigger Description

```yaml
description: >
  This skill provides comprehensive knowledge of the Picnic design system component library,
  including the complete component catalog with props, variants, usage patterns, and design tokens.
  This skill should be used when the user asks to use Picnic components, create a new component,
  select which Picnic component to use, consult the design system, understand available variants,
  apply design tokens, or ensure design system compliance.
```

## SKILL.md Specification

Target length: 1800 words

### Section 1: Introduction to Picnic (200 words)
- Overview of Picnic as the organization's design system
- Philosophy: consistency, accessibility, composability
- Relationship to Figma designs and design team
- Versioning and update cadence
- Import patterns and package structure

### Section 2: Component Discovery Workflow (300 words)
- Step-by-step process for finding the right component
- Decision tree: primitive vs. composite vs. custom
- When to compose existing components vs. request new ones
- How to search the component catalog effectively
- Checking component status (stable, beta, deprecated)
- Accessing component documentation and examples

### Section 3: Component Composition Patterns (400 words)
- Composition over configuration philosophy
- Common composition patterns:
  - Layout components (Box, Stack, Grid)
  - Form components (FormField, FormGroup)
  - Data display (Card, List, DataTable)
  - Navigation (Nav, Tabs, Breadcrumbs)
- Slot patterns and children props
- Render props vs. component props
- Polymorphic component usage (as="..." prop)
- Forwarding refs correctly

### Section 4: Naming and File Conventions (200 words)
- Component file naming: PascalCase
- Story file co-location
- Test file co-location
- Import paths and barrel exports
- Component display names
- Prop type naming conventions

### Section 5: Props and Variants (300 words)
- Required vs. optional props
- Variant props (size, color, variant)
- Boolean flag props (disabled, loading, error)
- Handler props (onClick, onChange, etc.)
- Style props (className, style, sx)
- Data props (data-testid, aria-*)
- Children and render props

### Section 6: Design Tokens Usage (250 words)
- Token categories: colors, spacing, typography, shadows, borders
- Token naming conventions
- Using tokens in custom styles
- Theme integration
- Dark mode support
- Responsive token values

### Section 7: Accessibility Requirements (150 words)
- Built-in ARIA attributes
- Keyboard navigation expectations
- Focus management
- Screen reader considerations
- Color contrast compliance
- Testing accessibility

## Reference Files

### component-catalog.md
**Purpose**: Complete reference of all Picnic components with props, variants, and usage examples

**Estimated size**: 8,000-10,000 lines

**Outline**:
1. **Index by Category** (200 lines)
   - Primitives
   - Layout
   - Forms
   - Data Display
   - Navigation
   - Feedback
   - Overlays
   - Typography

2. **Component Entries** (alphabetical, 50-200 lines each)
   Each entry contains:
   - Component name and import path
   - Purpose and use cases
   - Status (stable/beta/deprecated)
   - Props table with types and descriptions
   - Available variants
   - Code example (basic usage)
   - Code example (advanced usage)
   - Composition examples
   - Accessibility notes
   - Related components
   - Figma component link

3. **Quick Reference Tables** (500 lines)
   - All components by category
   - Variant support matrix
   - Prop commonalities across components

### design-tokens.md
**Purpose**: Complete reference of design tokens used throughout Picnic components

**Estimated size**: 3,000-4,000 lines

**Outline**:
1. **Token System Overview** (200 lines)
   - Token philosophy and usage
   - Token naming conventions
   - How to reference tokens in code
   - Theme structure

2. **Color Tokens** (1,000 lines)
   - Brand colors (primary, secondary, accent)
   - Semantic colors (success, warning, error, info)
   - Neutral colors (gray scale)
   - Text colors
   - Background colors
   - Border colors
   - Shadow colors
   - Color usage guidelines

3. **Spacing Tokens** (500 lines)
   - Spacing scale (0-20)
   - Common spacing patterns
   - Margin and padding conventions
   - Gap values for flex/grid

4. **Typography Tokens** (800 lines)
   - Font families
   - Font sizes (xs, sm, base, lg, xl, 2xl, etc.)
   - Font weights (light, normal, medium, semibold, bold)
   - Line heights
   - Letter spacing
   - Text styles (heading-1 through heading-6, body, caption, etc.)

5. **Other Tokens** (500 lines)
   - Border radius values
   - Border widths
   - Shadow definitions (elevation levels)
   - Z-index scale
   - Transition timings
   - Breakpoint values

## Used By Agents

- **component-architect**: Selects appropriate components for requirements
- **component-builder**: Implements components using Picnic primitives
- **storybook-writer**: Documents component usage in Storybook
- **frontend-reviewer**: Validates design system compliance

## Dependencies

- **react-patterns**: Understanding React composition patterns
- **typescript-strict**: Correct typing of component props

## Skills to Load When Building

- `plugin-dev:skill-development` (required for skill creation)

## Validation Criteria

### Should Trigger (3 test queries)

1. "Which Picnic component should I use to display a list of items with actions?"
2. "How do I use the Button component with the primary variant?"
3. "What are the available spacing tokens in the design system?"

### Should NOT Trigger (2 test queries)

1. "How do I fetch data with Relay?" (relay-conventions)
2. "What's the best way to test this component?" (testing-conventions)

### Progressive Disclosure Test

1. **Frontmatter only**: User asks "Do we have a modal component?"
   - Expected: Agent confirms Picnic has a Modal component, suggests checking docs

2. **SKILL.md loaded**: User asks "How do I use the Modal component with custom footer?"
   - Expected: Agent provides composition pattern with footer slot

3. **References loaded**: User asks "Show me all the props for the Modal component"
   - Expected: Agent provides complete props table from component-catalog.md

## Example Content Snippets

### Example 1: Component Catalog Entry (Button)

```markdown
## Button

**Import**: `import { Button } from '@company/picnic'`

**Status**: Stable

**Purpose**: Primary interactive element for user actions. Use for forms, dialogs, and call-to-action elements.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'tertiary' \| 'danger' | 'primary' | Visual style variant |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Button size |
| disabled | boolean | false | Disables interaction |
| loading | boolean | false | Shows loading spinner |
| fullWidth | boolean | false | Expands to container width |
| leftIcon | ReactNode | - | Icon before text |
| rightIcon | ReactNode | - | Icon after text |
| onClick | (event: MouseEvent) => void | - | Click handler |
| type | 'button' \| 'submit' \| 'reset' | 'button' | Button type attribute |
| as | ElementType | 'button' | Polymorphic component type |

### Variants

**Primary**: High-emphasis actions
```tsx
<Button variant="primary">Save Changes</Button>
```

**Secondary**: Medium-emphasis actions
```tsx
<Button variant="secondary">Cancel</Button>
```

**Tertiary**: Low-emphasis actions
```tsx
<Button variant="tertiary">Learn More</Button>
```

**Danger**: Destructive actions
```tsx
<Button variant="danger">Delete Account</Button>
```

### Size Examples

```tsx
<Button size="sm">Small Button</Button>
<Button size="md">Medium Button</Button>
<Button size="lg">Large Button</Button>
```

### With Icons

```tsx
import { PlusIcon, ArrowRightIcon } from '@company/picnic-icons'

<Button leftIcon={<PlusIcon />}>Add Item</Button>
<Button rightIcon={<ArrowRightIcon />}>Continue</Button>
```

### Loading State

```tsx
<Button loading>Saving...</Button>
```

### Composition Examples

**Button Group**:
```tsx
<Box display="flex" gap={2}>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</Box>
```

**Form Submit**:
```tsx
<form onSubmit={handleSubmit}>
  <FormField label="Email" name="email" />
  <Button type="submit" fullWidth>Sign In</Button>
</form>
```

**Link as Button**:
```tsx
<Button as="a" href="/dashboard" variant="primary">
  Go to Dashboard
</Button>
```

### Accessibility

- Includes proper ARIA attributes automatically
- Keyboard accessible (Enter/Space to activate)
- Focus visible state included
- Disabled state prevents interaction
- Loading state announces to screen readers
- Minimum touch target size (44x44px) enforced

### Related Components

- **IconButton**: For icon-only buttons
- **ButtonGroup**: For visually grouped buttons
- **LinkButton**: For styled links that look like buttons

### Figma Component

[Button Component](https://figma.com/file/xxx/Picnic?node-id=123)
```

### Example 2: Design Tokens (Color System)

```markdown
## Color Tokens

### Token Reference

All color tokens are available via the theme object:

```tsx
import { useTheme } from '@company/picnic'

const theme = useTheme()
const primaryColor = theme.colors.primary[600]
```

Or via Tailwind utilities:
```tsx
<Box className="bg-primary-600 text-white" />
```

### Brand Colors

#### Primary
Used for primary actions, links, and brand emphasis.

- `primary.50`: #EFF6FF (lightest backgrounds)
- `primary.100`: #DBEAFE
- `primary.200`: #BFDBFE
- `primary.300`: #93C5FD
- `primary.400`: #60A5FA
- `primary.500`: #3B82F6 (default)
- `primary.600`: #2563EB (interactive elements)
- `primary.700`: #1D4ED8
- `primary.800`: #1E40AF
- `primary.900`: #1E3A8A (darkest text)

**Usage Guidelines**:
- Use 600 for buttons, links, interactive elements
- Use 50-100 for subtle backgrounds
- Use 700-900 for text on light backgrounds
- Ensure 4.5:1 contrast ratio for text

#### Secondary
Supporting brand color for secondary actions.

- `secondary.50`: #F5F3FF
- `secondary.100`: #EDE9FE
- ... [full scale]
- `secondary.600`: #7C3AED (default)
- ... [full scale]
- `secondary.900`: #4C1D95

### Semantic Colors

#### Success
Indicates successful completion, positive states.

- `success.50`: #F0FDF4
- ... [full scale]
- `success.600`: #16A34A (default)
- ... [full scale]

#### Warning
Indicates caution, important information.

- `warning.50`: #FFFBEB
- ... [full scale]
- `warning.600`: #D97706 (default)
- ... [full scale]

#### Error
Indicates errors, destructive actions.

- `error.50`: #FEF2F2
- ... [full scale]
- `error.600`: #DC2626 (default)
- ... [full scale]

#### Info
Indicates informational content.

- `info.50`: #F0F9FF
- ... [full scale]
- `info.600`: #0284C7 (default)
- ... [full scale]

### Neutral Colors

Gray scale for text, backgrounds, borders.

- `gray.50`: #F9FAFB (lightest background)
- `gray.100`: #F3F4F6 (subtle background)
- `gray.200`: #E5E7EB (border light)
- `gray.300`: #D1D5DB (border default)
- `gray.400`: #9CA3AF (disabled text)
- `gray.500`: #6B7280 (muted text)
- `gray.600`: #4B5563 (secondary text)
- `gray.700`: #374151 (body text)
- `gray.800`: #1F2937 (heading text)
- `gray.900`: #111827 (darkest text)

**Text Color Usage**:
- `gray.900`: Primary headings and important text
- `gray.700`: Body text, paragraph content
- `gray.600`: Secondary text, labels
- `gray.500`: Muted text, helper text
- `gray.400`: Disabled text, placeholder text

**Background Color Usage**:
- `white`: Primary background
- `gray.50`: Subtle background, alternating rows
- `gray.100`: Section backgrounds, cards
- `gray.200`: Hover states on gray.100 backgrounds
```

### Example 3: Component Discovery Workflow

```markdown
## Component Discovery Workflow

When you need to build a new UI element, follow this workflow to find the right Picnic component:

### Step 1: Identify the UI Pattern Category

Ask yourself what the component primarily does:

- **User input?** → Check Forms category (Input, Select, Checkbox, Radio, etc.)
- **Display data?** → Check Data Display category (DataTable, List, Card, Badge, etc.)
- **Navigate between views?** → Check Navigation category (Nav, Tabs, Breadcrumbs, Pagination)
- **Show/hide content?** → Check Overlays category (Modal, Drawer, Popover, Tooltip)
- **Provide feedback?** → Check Feedback category (Alert, Toast, Spinner, Progress)
- **Arrange other components?** → Check Layout category (Box, Stack, Grid, Divider)
- **Display text?** → Check Typography category (Heading, Text, Code)

### Step 2: Search the Component Catalog

Once you've identified the category, scan the components in that category:

```
Forms Category:
- Input: Single-line text input
- Textarea: Multi-line text input
- Select: Dropdown selection
- Checkbox: Multi-select options
- Radio: Single-select from options
- Switch: Binary toggle
- DatePicker: Date selection
- FormField: Wrapper with label, error, help text
```

### Step 3: Check Component Status

Before using a component, verify its status:

- **Stable**: Production-ready, full support
- **Beta**: Usable but API may change
- **Deprecated**: Avoid, use suggested alternative

### Step 4: Review Props and Variants

Check if the component supports your requirements:

```tsx
// Example: Need a loading button?
<Button loading={isSubmitting}>
  Save Changes
</Button>

// Example: Need icon with button?
<Button leftIcon={<PlusIcon />}>
  Add Item
</Button>
```

### Step 5: Consider Composition

If no single component matches, can you compose existing components?

**Example: Search Input with Submit Button**
```tsx
<Box display="flex" gap={2}>
  <Input
    placeholder="Search..."
    value={query}
    onChange={setQuery}
    flex={1}
  />
  <Button variant="primary" onClick={handleSearch}>
    Search
  </Button>
</Box>
```

**Example: Card with Header and Actions**
```tsx
<Card>
  <Box display="flex" justifyContent="space-between" alignItems="center">
    <Heading size="md">{title}</Heading>
    <Button variant="tertiary" size="sm">Edit</Button>
  </Box>
  <Text mt={2}>{description}</Text>
</Card>
```

### Step 6: When to Create Custom Components

Only create custom components when:

1. No existing Picnic component matches
2. Composition would be overly complex or repetitive
3. The pattern is reused across multiple features
4. The design team has approved the new pattern

**Before creating custom components**:
- Consult the design team
- Check if it should be added to Picnic
- Ensure it follows design system principles
- Plan for proper documentation and testing
```
