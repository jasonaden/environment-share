# Picnic Component Catalog

Complete reference of all 57 `@attentive/picnic` components with TypeScript props, Stitches variants, compound sub-components, and usage examples.

**Import pattern**: `import { ComponentName } from '@attentive/picnic'`
**Styling**: Use the `css` prop with `$token` syntax. Never use Tailwind or `className`.

---

## Index by Category

### Layout (6)

| Component | Primitive | Compound | Description |
|-----------|-----------|----------|-------------|
| Box | `react-polymorphic-box` | No | Base layout primitive with polymorphic `as` prop |
| Stack | Styled `div` | No | Vertical/horizontal stack with spacing |
| Grid | Styled `div` | Yes (.Cell) | CSS Grid layout container |
| PageLayout | Styled `div` | Yes (.Header, .Description, .Button, .TextContainer, .ButtonContainer) | Page-level layout with responsive header |
| FooterLayout | Styled `div` | No | Fixed footer layout |
| Separator | Radix Separator | No | Visual divider line |

### Typography (3)

| Component | Primitive | Compound | Description |
|-----------|-----------|----------|-------------|
| Heading | Styled `h1`-`h6` | No | Semantic heading with size variants |
| Text | Styled `span` | No | Body text with variant scales |
| TextWithOverflowTooltip | Custom | Yes (.Trigger, .TextItem, .Content, .TooltipText) | Text that shows tooltip on overflow |

### Actions (6)

| Component | Primitive | Compound | Description |
|-----------|-----------|----------|-------------|
| Button | `react-polymorphic-box` | No | Primary action element |
| IconButton | `react-polymorphic-box` | No | Icon-only button with description |
| ButtonBar | Styled `div` | No | Button layout container |
| ButtonGroup | Styled `div` | Yes (.Item, .IconItem) | Toggle button group with active state |
| ButtonGroupNext | Styled `div` | Yes (.Item, .IconItem) | Updated toggle group (new API) |
| PickerButton | Styled `button` | No | Trigger button for pickers |

### Forms (16)

| Component | Primitive | Compound | Description |
|-----------|-----------|----------|-------------|
| Form | Formik + `<form>` | Yes (15 sub-components) | Formik-wrapped form with validation |
| FormField | Radix Label | Yes (.Label, .HelperText, .ErrorText, .IconPopover) | Form field layout organizer |
| TextInput | Styled `input` | No | Single-line text input |
| TextArea | Styled `textarea` | No | Multi-line text input |
| Select | Downshift + Radix Popover | Yes (.Item, .IconItem, .ThirdPartyIconItem, .Group, .Value) | Single-select dropdown |
| MultiSelect | Downshift | Yes (.Item, .Group) | Multi-select with tags |
| SearchableSelect | Downshift | Yes (.Item, .Group) | Searchable single-select |
| Checkbox | Radix Checkbox | Yes (.CheckboxItem) | Checkbox with label |
| RadioGroup | Radix RadioGroup | Yes (.Item) | Radio button group |
| Switch | Radix Switch | No | Toggle switch |
| SearchBar | Styled `input` | No | Search input with icon |
| FileInput | Styled `input` | No | File upload input |
| InputGroup | Styled `div` | No | Group multiple inputs |
| TagSelector | Custom | No | Tag selection input |
| DatePicker | `react-dates` | No | Single date picker |
| DateRangePicker | `react-dates` | No | Date range picker |
| TimePicker | Custom | No | Time selection input |

### Data Display (7)

| Component | Primitive | Compound | Description |
|-----------|-----------|----------|-------------|
| Table | CSS Grid + ARIA | Yes (11 sub-components) | Data table with sorting and selection |
| Badge | Styled `em` | No | Inline or raised annotation |
| Tag | Styled `span` | No | Deletable tag/chip |
| ContainedLabel | Styled `div` | Yes (.Icon, .Tooltip) | Status label with icon |
| ProgressBar | Radix Progress | No | Progress indicator bar |
| StepTracker | Custom | Yes (.Step) | Multi-step progress tracker |
| List | Styled `ul`/`ol` | Yes (.Item) | Ordered/unordered list |

### Navigation (3)

| Component | Primitive | Compound | Description |
|-----------|-----------|----------|-------------|
| Breadcrumbs | Custom | Yes (.Item) | Breadcrumb navigation |
| TabGroup | Radix Tabs | Yes (.List, .Tab, .Panel) | Tabbed content panels |
| Paginator | Custom | Yes (.Label, .ButtonGroup) | Pagination controls |

### Overlays (6)

| Component | Primitive | Compound | Description |
|-----------|-----------|----------|-------------|
| Dialog | Radix Dialog | Yes (.Trigger, .Content, .Header, .Close, .CloseButton) | Modal dialog |
| StandardDialog | Radix Dialog | Yes (.Trigger, .Content, .Header, .Heading, .HeroImage, .Body, .Footer, .Close) | Structured modal with header/body/footer |
| Drawer | Radix Dialog | Yes (.Trigger, .Content, .Header, .CloseButton) | Slide-in panel |
| StandardDrawer | Radix Dialog | Yes (.Trigger, .Content, .Header, .Body, .Footer, .Close) | Structured drawer with header/body/footer |
| Popover | Radix Popover | Yes (.Trigger, .Anchor, .Content, .CloseButton, .CloseIconButton) | Floating popover |
| DropdownMenu | Radix DropdownMenu | Yes (11 sub-components) | Action menu dropdown |

### Feedback (6)

| Component | Primitive | Compound | Description |
|-----------|-----------|----------|-------------|
| Banner | Custom | Yes (.Image, .Heading, .Text, .Action) | Notification banner |
| Accordion | Radix Accordion | Yes (.Item, .Header, .HeaderIcon, .Content) | Collapsible sections |
| Tooltip | Radix Tooltip | Yes (.Provider, .Trigger, .Content) | Hover tooltip |
| IconPopover | Popover + IconButton | No | Icon-triggered popover |
| LoadingIndicator | Custom | No | Animated loading dots |
| LoadingPlaceholder | Styled `div` | No | Shimmer placeholder |

### Media & Branding (9)

| Component | Primitive | Compound | Description |
|-----------|-----------|----------|-------------|
| Icon | SVG | No | System icon with a11y modes |
| ThirdPartyIcon | SVG | No | Third-party brand icons |
| IconCircle | Styled `div` + Icon | No | Icon in colored circle |
| ThirdPartyIconCircle | Styled `div` + ThirdPartyIcon | No | Third-party icon in circle |
| ResponsiveImage | Radix AspectRatio | No | Aspect-ratio image/video |
| ImagePreview | Custom | No | Image preview with remove action |
| Logomark | SVG | No | Attentive logomark |
| Wordmark | SVG | No | Attentive wordmark |
| Emoji | Styled `span` | No | Accessible emoji wrapper |

### Utility (2)

| Component | Primitive | Compound | Description |
|-----------|-----------|----------|-------------|
| ContinuousScroll | IntersectionObserver | No | Infinite scroll container |
| Link | `react-polymorphic-box` | No | Styled anchor link |
| Card | Styled `div` | No | Card container with elevation |

---

## Component Entries


### Layout Components

---

#### Box

**Import**: `import { Box } from '@attentive/picnic'`
**Primitive**: `react-polymorphic-box` — supports polymorphic `as` prop

The foundational layout primitive. All layout composition starts with Box. Renders a `div` by default; change with the `as` prop.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| as | React.ElementType | `'div'` | HTML element or component to render as |
| css | PicnicCss | — | Stitches style object |
| ref | React.Ref | — | Forwarded ref |

Box accepts all HTML attributes for the element specified by `as`.

##### Usage

```tsx
// Basic flex layout
<Box css={{ display: 'flex', gap: '$space4', alignItems: 'center' }}>
  <Icon name="Search" mode="decorative" />
  <Text>Search results</Text>
</Box>

// Polymorphic — render as section
<Box as="section" css={{ p: '$space6', backgroundColor: '$bgAccent' }}>
  <Heading variant="md">Section Title</Heading>
</Box>

// Responsive styles
<Box css={{ p: '$space4', '@bp2': { p: '$space8' } }}>
  Content
</Box>
```

##### Related Components
- **Stack**: Vertical/horizontal stack with automatic spacing
- **Grid**: CSS Grid layout container

---

#### Stack

**Import**: `import { Stack } from '@attentive/picnic'`
**Primitive**: Styled `div` — uses margin on `> * + *` (not CSS `gap`) for Safari compatibility

Arranges children in a vertical or horizontal stack with consistent spacing.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| direction | `'vertical'` \| `'horizontal'` | `'vertical'` | Stack direction |
| spacing | SpaceToken (e.g., `'$space4'`) | `'$space4'` | Gap between children |
| css | PicnicCss | — | Stitches style object |

##### Variants

| Variant | Values | Default |
|---------|--------|---------|
| direction | `vertical`, `horizontal` | `vertical` |

##### Usage

```tsx
// Vertical stack (default)
<Stack spacing="$space4">
  <TextInput placeholder="Email" />
  <TextInput placeholder="Password" />
  <Button variant="primary">Sign In</Button>
</Stack>

// Horizontal stack
<Stack direction="horizontal" spacing="$space2">
  <Badge variant="active">Active</Badge>
  <Badge variant="standard">Pending</Badge>
</Stack>
```

##### Related Components
- **Box**: Lower-level primitive for custom layouts
- **Grid**: Grid-based layout

---

#### Grid

**Import**: `import { Grid } from '@attentive/picnic'`
**Primitive**: Styled `div` with CSS Grid
**Compound**: `Grid.Cell`

##### Props (Grid)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | number | — | Number of equal columns |
| gap | SpaceToken | — | Grid gap |
| css | PicnicCss | — | Stitches style object |

##### Props (Grid.Cell)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| span | number | 1 | Number of columns to span |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<Grid columns={3} gap="$space4">
  <Grid.Cell><Card>Item 1</Card></Grid.Cell>
  <Grid.Cell><Card>Item 2</Card></Grid.Cell>
  <Grid.Cell span={1}><Card>Item 3</Card></Grid.Cell>
</Grid>
```

##### Related Components
- **Stack**: Simpler one-dimensional layout
- **Box**: Raw layout primitive

---

#### PageLayout

**Import**: `import { PageLayout } from '@attentive/picnic'`
**Primitive**: Styled `div`
**Compound**: `PageLayout.Header` (PageHeader compound component)

PageLayout provides page-level structure. PageHeader is a compound component with responsive behavior.

##### PageHeader Sub-Components

| Sub-Component | Description |
|---------------|-------------|
| PageHeader.Heading | Page title (renders `Heading variant="page"`) |
| PageHeader.Description | Page description text |
| PageHeader.Button | Action button (size adapts to variant) |
| PageHeader.TextContainer | Container for heading + description |
| PageHeader.ButtonContainer | Container for action buttons |

##### Props (PageHeader)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'responsive'` \| `'inline'` \| `'stacked'` | `'responsive'` | Layout mode |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
import { PageLayout } from '@attentive/picnic';

<PageLayout.Header variant="responsive">
  <PageLayout.Header.TextContainer>
    <PageLayout.Header.Heading>Campaign Dashboard</PageLayout.Header.Heading>
    <PageLayout.Header.Description>Manage active campaigns</PageLayout.Header.Description>
  </PageLayout.Header.TextContainer>
  <PageLayout.Header.ButtonContainer>
    <PageLayout.Header.Button variant="primary">Create Campaign</PageLayout.Header.Button>
  </PageLayout.Header.ButtonContainer>
</PageLayout.Header>
```

##### Related Components
- **Heading**: Standalone heading component
- **Breadcrumbs**: Page navigation breadcrumbs

---

#### FooterLayout

**Import**: `import { FooterLayout } from '@attentive/picnic'`
**Primitive**: Styled `div`

Fixed footer layout for page-level actions.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<FooterLayout css={{ p: '$space4', borderTop: '$borderWidths$borderWidth1 solid $borderDefault' }}>
  <Button variant="primary">Save</Button>
  <Button variant="secondary">Cancel</Button>
</FooterLayout>
```

---

#### Separator

**Import**: `import { Separator } from '@attentive/picnic'`
**Primitive**: `@radix-ui/react-separator`

Renders a visual divider line between content sections.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| orientation | `'horizontal'` \| `'vertical'` | `'horizontal'` | Line direction |
| decorative | boolean | true | Whether purely decorative (no a11y role) |
| css | PicnicCss | — | Stitches style object |

##### Variants

| Variant | Values | Default |
|---------|--------|---------|
| size | `small`, `large` | `small` |

##### Usage

```tsx
<Box css={{ display: 'flex', flexDirection: 'column', gap: '$space4' }}>
  <Text>Section A</Text>
  <Separator />
  <Text>Section B</Text>
</Box>

// Vertical separator
<Box css={{ display: 'flex', alignItems: 'center', gap: '$space4' }}>
  <Text>Left</Text>
  <Separator orientation="vertical" css={{ height: '$size6' }} />
  <Text>Right</Text>
</Box>
```

##### Related Components
- **Box**: Alternative — use border for custom dividers


---

### Typography Components

---

#### Heading

**Import**: `import { Heading } from '@attentive/picnic'`
**Primitive**: Styled polymorphic heading element (`h1`-`h6`)

Semantic heading component. The `variant` controls visual size; set `as` to the correct semantic heading level independently.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'page'` \| `'xl'` \| `'lg'` \| `'md'` \| `'sm'` \| `'subheading'` | `'lg'` | Visual size |
| color | `'default'` \| `'subdued'` \| `'inverted'` \| `'success'` \| `'warning'` \| `'critical'` \| `'info'` \| `'guidance'` \| `'neutral'` | `'default'` | Text color |
| as | `'h1'` \| `'h2'` \| `'h3'` \| `'h4'` \| `'h5'` \| `'h6'` | `'h2'` | Semantic HTML element |
| css | PicnicCss | — | Stitches style object |

##### Variants

| Variant | Font | Size | Weight | Letter Spacing |
|---------|------|------|--------|----------------|
| page | `$display` (Ginto Nord) | `$fontSize7` (2rem) | `$bold` | `$letterSpacing0` |
| xl | `$display` | `$fontSize6` (1.5rem) | `$bold` | `$letterSpacing0` |
| lg | `$display` | `$fontSize5` (1.25rem) | `$bold` | `$letterSpacing0` |
| md | `$display` | `$fontSize4` (1.125rem) | `$bold` | `$letterSpacing1` |
| sm | `$display` | `$fontSize3` (1rem) | `$bold` | `$letterSpacing1` |
| subheading | `$body` | `$fontSize1` (0.75rem) | `$bold` | `$letterSpacing2` |

##### Usage

```tsx
<Heading variant="page" as="h1">Dashboard</Heading>
<Heading variant="md" as="h2" color="subdued">Settings</Heading>
<Heading variant="subheading" as="h3" css={{ textTransform: 'uppercase' }}>
  Section Title
</Heading>
```

##### Related Components
- **Text**: Body text variant
- **PageLayout.Header.Heading**: Pre-configured page heading

---

#### Text

**Import**: `import { Text } from '@attentive/picnic'`
**Primitive**: Styled `span` (polymorphic via `as`)

Body text component with semantic variants for consistent typography.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'lede'` \| `'body'` \| `'caption'` \| `'micro'` | `'body'` | Text size variant |
| color | `'default'` \| `'subdued'` \| `'inverted'` \| `'success'` \| `'warning'` \| `'critical'` \| `'info'` \| `'guidance'` \| `'neutral'` \| `'decorative1'` \| `'decorative2'` \| `'decorative3'` \| `'decorative4'` | `'default'` | Text color |
| as | React.ElementType | `'span'` | HTML element to render |
| css | PicnicCss | — | Stitches style object |

##### Variants

| Variant | Size | Line Height |
|---------|------|------------|
| lede | `$fontSize4` (1.125rem/18px) | `$lineHeight6` (1.44) |
| body | `$fontSize3` (1rem/16px) | `$lineHeight7` (1.5) |
| caption | `$fontSize2` (0.875rem/14px) | `$lineHeight5` (1.43) |
| micro | `$fontSize1` (0.75rem/12px) | `$lineHeight3` (1.33) |

##### Usage

```tsx
<Text variant="body">Regular body text</Text>
<Text variant="caption" color="subdued">Secondary information</Text>
<Text as="p" variant="lede" css={{ mb: '$space4' }}>
  Lead paragraph with larger text for introductions.
</Text>
<Text variant="micro" css={{ textTransform: 'uppercase', letterSpacing: '$letterSpacing2' }}>
  OVERLINE TEXT
</Text>
```

##### Related Components
- **Heading**: For heading text
- **Link**: For clickable text

---

#### TextWithOverflowTooltip

**Import**: `import { TextWithOverflowTooltip } from '@attentive/picnic'`
**Primitive**: Custom (Text + Tooltip composition)
**Compound**: `.Trigger`, `.TextItem`, `.Content`, `.TooltipText`

Renders text that automatically shows a tooltip when the text overflows its container.

##### Usage

```tsx
<TextWithOverflowTooltip>
  <TextWithOverflowTooltip.Trigger>
    <TextWithOverflowTooltip.TextItem css={{ maxWidth: '200px' }}>
      Very long text that will be truncated and show a tooltip on hover
    </TextWithOverflowTooltip.TextItem>
  </TextWithOverflowTooltip.Trigger>
  <TextWithOverflowTooltip.Content>
    <TextWithOverflowTooltip.TooltipText>
      Very long text that will be truncated and show a tooltip on hover
    </TextWithOverflowTooltip.TooltipText>
  </TextWithOverflowTooltip.Content>
</TextWithOverflowTooltip>
```

##### Related Components
- **Text**: Base text component
- **Tooltip**: Standalone tooltip


---

### Action Components

---

#### Button

**Import**: `import { Button } from '@attentive/picnic'`
**Primitive**: `react-polymorphic-box` (supports `as` prop)

Primary interactive element for user actions. Supports loading state, polymorphic rendering, and five visual variants.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'primary'` \| `'secondary'` \| `'subdued'` \| `'inverted'` \| `'legacy-inverted'` | `'primary'` | Visual style |
| size | `'small'` \| `'medium'` \| `'large'` | `'medium'` | Button size |
| disabled | boolean | false | Disables interaction |
| loading | boolean | false | Shows LoadingIndicator, disables click |
| as | React.ElementType | `'button'` | Polymorphic element type |
| css | PicnicCss | — | Stitches style object |

**Deprecation**: `basic` variant is deprecated — use `secondary` instead.

##### Variant Styles

| Variant | Background | Text Color | Border |
|---------|-----------|------------|--------|
| primary | `$bgActionPrimary` | `$textDefault` | none |
| secondary | `$bgActionBasic` | `$textDefault` | `$borderActionBasic` |
| subdued | transparent | `$textDefault` | none |
| inverted | `$bgDefault` | `$textDefault` | `$borderInverted` |

##### Size Scale

| Size | Height | Padding | Font Size |
|------|--------|---------|-----------|
| small | `$size9` (36px) | `$space4` | `$fontSize2` |
| medium | `$size12` (48px) | `$space6` | `$fontSize3` |
| large | `$size13` (52px) | `$space6` | `$fontSize4` |

##### Compound Variants

| Condition | Style |
|-----------|-------|
| disabled + primary | `$bgActionPrimaryDisabled`, `$textDisabled` |
| disabled + secondary | `$bgActionBasicDisabled`, `$textDisabled` |
| disabled + subdued | `$textDisabled`, cursor `not-allowed` |
| loading (any variant) | Pointer events disabled, shows `LoadingIndicator` |

##### Usage

```tsx
// Standard variants
<Button variant="primary">Save Changes</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="subdued">Learn More</Button>

// Loading state
<Button loading={isSubmitting}>Saving...</Button>

// Custom styling
<Button variant="primary" css={{ minWidth: '$size16' }}>Submit</Button>

// Polymorphic — render as anchor
<Button as="a" href="/dashboard" variant="primary">Go to Dashboard</Button>
```

##### Related Components
- **IconButton**: Icon-only button
- **ButtonGroup**: Grouped toggle buttons
- **ButtonBar**: Button layout container

---

#### IconButton

**Import**: `import { IconButton } from '@attentive/picnic'`
**Primitive**: `react-polymorphic-box`

Button that renders only an icon. Requires `description` for accessibility.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| iconName | IconName | **required** | Name of the icon to display |
| description | string | **required** | Accessible label (aria-label) |
| variant | `'basic'` \| `'primary'` \| `'secondary'` \| `'subdued'` \| `'inverted'` | `'basic'` | Visual style |
| size | `'extraSmall'` \| `'small'` \| `'medium'` \| `'large'` | `'medium'` | Button size |
| iconColor | IconColor | — | Override icon color |
| disabled | boolean | false | Disables interaction |
| loading | boolean | false | Shows loading state |
| as | React.ElementType | `'button'` | Polymorphic element type |
| css | PicnicCss | — | Stitches style object |

##### Size Scale

| Size | Dimensions | Icon Size |
|------|-----------|-----------|
| extraSmall | `$size6` (24px) | extraSmall |
| small | `$size8` (32px) | small |
| medium | `$size10` (40px) | medium |
| large | `$size12` (48px) | large |

##### Usage

```tsx
<IconButton iconName="Edit" description="Edit item" variant="subdued" size="small" />
<IconButton iconName="Delete" description="Remove" variant="basic" iconColor="critical" />
<IconButton iconName="X" description="Close" variant="subdued" size="small" />
```

##### Related Components
- **Button**: Text button
- **Icon**: Standalone icon component

---

#### ButtonBar

**Import**: `import { ButtonBar } from '@attentive/picnic'`
**Primitive**: Styled `div`

Layout container for arranging buttons. Provides consistent spacing and alignment.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| layout | `'auto'` \| `'stretch'` | `'auto'` | Button sizing behavior |
| css | PicnicCss | — | Stitches style object |

##### Variants

| Variant | Values | Default | Description |
|---------|--------|---------|-------------|
| layout | `auto`, `stretch` | `auto` | `auto` = natural width, `stretch` = full width |

##### Usage

```tsx
<ButtonBar layout="stretch">
  <Button variant="primary">Confirm</Button>
  <Button variant="secondary">Cancel</Button>
</ButtonBar>
```

##### Related Components
- **Button**: Button component
- **StandardDialog.Footer**: Uses ButtonBar internally

---

#### ButtonGroup

**Import**: `import { ButtonGroup } from '@attentive/picnic'`
**Primitive**: Styled `div` + Context
**Compound**: `ButtonGroup.Item`, `ButtonGroup.IconItem`

Grouped toggle buttons with mutual exclusive active state. Used for segmented controls and view switchers.

##### Props (ButtonGroup)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| activeItem | string \| null | — | Currently active item identifier |
| css | PicnicCss | — | Stitches style object |

##### Props (ButtonGroup.Item)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | string | **required** | Unique identifier |
| onClick | () => void | — | Click handler |
| disabled | boolean | false | Disables this item |

##### Props (ButtonGroup.IconItem)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | IconName | **required** | Icon name (doubles as identifier) |
| description | string | **required** | Accessible label |
| onClick | () => void | — | Click handler |
| disabled | boolean | false | Disables this item |

##### Usage

```tsx
const [view, setView] = useState('grid');

<ButtonGroup activeItem={view}>
  <ButtonGroup.Item name="grid" onClick={() => setView('grid')}>Grid</ButtonGroup.Item>
  <ButtonGroup.Item name="list" onClick={() => setView('list')}>List</ButtonGroup.Item>
</ButtonGroup>

// Icon-only group
<ButtonGroup activeItem={view}>
  <ButtonGroup.IconItem name="Grid" description="Grid view" onClick={() => setView('Grid')} />
  <ButtonGroup.IconItem name="List" description="List view" onClick={() => setView('List')} />
</ButtonGroup>
```

##### Related Components
- **TabGroup**: For content switching with panels
- **Paginator.ButtonGroup**: For pagination

---

#### ButtonGroupNext

**Import**: `import { ButtonGroupNext } from '@attentive/picnic'`
**Primitive**: Styled `div` + Context
**Compound**: `ButtonGroupNext.Item`, `ButtonGroupNext.IconItem`

Updated version of ButtonGroup with improved API. Same compound pattern with `.Item` and `.IconItem`.

##### Usage

```tsx
<ButtonGroupNext activeItem={activeView}>
  <ButtonGroupNext.Item name="all" onClick={() => setView('all')}>All</ButtonGroupNext.Item>
  <ButtonGroupNext.Item name="active" onClick={() => setView('active')}>Active</ButtonGroupNext.Item>
</ButtonGroupNext>
```

##### Related Components
- **ButtonGroup**: Original version

---

#### PickerButton

**Import**: `import { PickerButton } from '@attentive/picnic'`
**Primitive**: Styled `button`

Trigger button styled for date pickers and select-like controls. Shows a chevron indicator.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `'small'` \| `'medium'` | `'medium'` | Button size |
| state | `'normal'` \| `'error'` | `'normal'` | Visual state |
| disabled | boolean | false | Disables interaction |
| placeholder | string | — | Placeholder text |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<PickerButton size="medium" state="normal" onClick={openPicker}>
  Select date...
</PickerButton>
```

##### Related Components
- **Select**: Uses similar trigger pattern
- **DatePicker**: Date-specific picker


---

### Form Components

---

#### Form

**Import**: `import { Form, useForm } from '@attentive/picnic'`
**Primitive**: Formik (`<Formik>` + `<FormikForm>`)
**Compound**: 15 sub-components

The top-level form wrapper. Integrates Formik for state management and Yup for validation. All `Form.*` sub-components automatically connect to Formik context.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| initialValues | V (FormikValues) | **required** | Initial form state |
| onSubmit | (values: V, helpers: FormikHelpers<V>) => void | **required** | Submit handler |
| validationSchema | Yup.AnyObjectSchema | — | Yup validation schema |
| validate | (values: V) => FormikErrors<V> | — | Custom validation function |
| enableReinitialize | boolean | false | Reset form on initialValues change |
| validateOnMount | boolean | false | Validate immediately |
| css | PicnicCss | — | Stitches style object |

##### Sub-Components

| Sub-Component | Description |
|---------------|-------------|
| Form.FormField | Field layout container (label + input + helpers) |
| Form.Label | Form field label |
| Form.TextInput | Formik-connected text input |
| Form.TextArea | Formik-connected textarea |
| Form.Select | Formik-connected select |
| Form.MultiSelect | Formik-connected multi-select |
| Form.SearchableSelect | Formik-connected searchable select |
| Form.Checkbox | Formik-connected checkbox |
| Form.RadioGroup | Formik-connected radio group |
| Form.Switch | Formik-connected switch toggle |
| Form.DatePicker | Formik-connected date picker |
| Form.ErrorText | Displays Formik field error |
| Form.HelperText | Displays helper text below field |
| Form.SubmitButton | Submit button (disabled during submission) |
| Form.ResetButton | Reset button (resets Formik state) |

##### Hook

```tsx
function useForm<V extends FormikValues>(): FormikContextType<V>
```

Access Formik context (values, errors, touched, setFieldValue, etc.) from any child component.

##### Usage

```tsx
import { Form } from '@attentive/picnic';
import * as Yup from 'yup';

const schema = Yup.object({
  email: Yup.string().email('Invalid email').required('Required'),
  name: Yup.string().required('Required'),
  role: Yup.string().required('Required'),
  notifications: Yup.boolean(),
});

<Form
  initialValues={{ email: '', name: '', role: '', notifications: false }}
  validationSchema={schema}
  onSubmit={(values) => handleSubmit(values)}
>
  <Form.FormField>
    <Form.Label requirement="required">Email</Form.Label>
    <Form.TextInput name="email" placeholder="Enter email" />
    <Form.ErrorText name="email" />
  </Form.FormField>

  <Form.FormField>
    <Form.Label requirement="required">Name</Form.Label>
    <Form.TextInput name="name" />
    <Form.ErrorText name="name" />
  </Form.FormField>

  <Form.FormField>
    <Form.Label>Role</Form.Label>
    <Form.Select name="role" placeholder="Select role">
      <Form.Select.Item value="admin">Admin</Form.Select.Item>
      <Form.Select.Item value="editor">Editor</Form.Select.Item>
    </Form.Select>
  </Form.FormField>

  <Form.FormField layout="horizontal">
    <Form.Switch name="notifications" />
    <Form.Label>Enable notifications</Form.Label>
  </Form.FormField>

  <Form.SubmitButton>Create User</Form.SubmitButton>
</Form>
```

##### Related Components
- **FormField**: Standalone field layout (for non-Formik use)
- **TextInput**: Standalone text input

---

#### FormField

**Import**: `import { FormField } from '@attentive/picnic'`
**Primitive**: Radix Label + Box
**Compound**: `FormField.Label`, `FormField.HelperText`, `FormField.ErrorText`, `FormField.IconPopover`

Organizes a form field's label, input, helper text, error text, and info popover. Parses children by type and arranges them in the correct layout.

##### Props (FormField)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| layout | `'vertical'` \| `'horizontal'` | `'vertical'` | Field arrangement |
| css | PicnicCss | — | Stitches style object |

##### Props (FormField.Label)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| disabled | boolean | false | Gray out label |
| requirement | `'none'` \| `'required'` \| `'optional'` | `'none'` | Show requirement indicator |
| css | PicnicCss | — | Stitches style object |

`requirement="required"` renders a red asterisk. `requirement="optional"` renders "(optional)".

##### Props (FormField.HelperText)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| disabled | boolean | false | Gray out text |
| css | PicnicCss | — | Stitches style object |

Renders as `Text variant="caption"`.

##### Props (FormField.ErrorText)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| css | PicnicCss | — | Stitches style object |

Renders as `Text variant="caption"` with `$textCritical` color.

##### Props (FormField.IconPopover)

Renders an `IconPopover` sized to `$size6`. Pass children for popover content.

##### Usage

```tsx
// Vertical layout (default)
<FormField>
  <FormField.Label requirement="required">Email Address</FormField.Label>
  <FormField.HelperText>Enter your work email</FormField.HelperText>
  <TextInput placeholder="email@company.com" />
  <FormField.ErrorText>Please enter a valid email</FormField.ErrorText>
</FormField>

// Horizontal layout (label next to input)
<FormField layout="horizontal">
  <Switch checked={enabled} onChange={setEnabled} />
  <FormField.Label>Enable Feature</FormField.Label>
  <FormField.HelperText>Toggle to activate</FormField.HelperText>
</FormField>

// With info popover
<FormField>
  <FormField.Label>API Key</FormField.Label>
  <FormField.IconPopover>
    <Text variant="caption">Find your API key in Settings > Developer.</Text>
  </FormField.IconPopover>
  <TextInput name="apiKey" />
</FormField>
```

##### Related Components
- **Form.FormField**: Formik-connected version
- **TextInput**: Input component

---

#### TextInput

**Import**: `import { TextInput } from '@attentive/picnic'`
**Primitive**: Styled `input`

Single-line text input with size and state variants. Supports adornments (start/end icons or text).

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| size | `'small'` \| `'normal'` | `'normal'` | Input size |
| state | `'normal'` \| `'error'` | `'normal'` | Visual state (error shows red border) |
| disabled | boolean | false | Disables input |
| placeholder | string | — | Placeholder text |
| value | string | — | Controlled value |
| onChange | (e: ChangeEvent) => void | — | Change handler |
| css | PicnicCss | — | Stitches style object |

All standard `<input>` HTML attributes are supported.

##### Variants

| Variant | Values | Default |
|---------|--------|---------|
| size | `small`, `normal` | `normal` |
| state | `normal`, `error` | `normal` |

##### Usage

```tsx
<TextInput placeholder="Enter name" size="normal" />
<TextInput value={email} onChange={handleChange} state={hasError ? 'error' : 'normal'} />
<TextInput disabled placeholder="Read-only value" css={{ width: '300px' }} />
```

##### Related Components
- **TextArea**: Multi-line variant
- **SearchBar**: Search-specific input
- **Form.TextInput**: Formik-connected version

---

#### TextArea

**Import**: `import { TextArea } from '@attentive/picnic'`
**Primitive**: Styled `textarea`

Multi-line text input with optional character counter.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| state | `'normal'` \| `'error'` | `'normal'` | Visual state |
| disabled | boolean | false | Disables input |
| maxLength | number | — | Maximum characters (shows counter) |
| rows | number | 3 | Number of visible rows |
| placeholder | string | — | Placeholder text |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<TextArea placeholder="Enter description..." rows={5} maxLength={500} />
<TextArea state="error" value={desc} onChange={handleChange} />
```

##### Related Components
- **TextInput**: Single-line variant
- **Form.TextArea**: Formik-connected version

---

#### Select

**Import**: `import { Select } from '@attentive/picnic'`
**Primitive**: Downshift `useSelect` + Radix Popover
**Compound**: `Select.Item`, `Select.IconItem`, `Select.ThirdPartyIconItem`, `Select.Group`, `Select.Value`

Custom single-select dropdown with keyboard navigation. Built on Downshift for accessibility.

##### Props (Select)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string \| number \| null | — | Selected value |
| onChange | (value: string \| number \| null) => void | — | Selection handler |
| placeholder | string | — | Placeholder text |
| disabled | boolean | false | Disables select |
| size | `'small'` \| `'medium'` | `'medium'` | Trigger size |
| state | `'normal'` \| `'error'` | `'normal'` | Visual state |
| align | `'start'` \| `'end'` | `'start'` | Dropdown alignment |
| selectedLines | `'one-line'` \| `'multi-line'` | `'one-line'` | Selected text truncation |
| css | PicnicCss | — | Stitches style object |

##### Props (Select.Item)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string \| number | **required** | Option value |
| disabled | boolean | false | Disables this option |
| children | ReactNode | — | Display label |

##### Props (Select.IconItem)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string \| number | **required** | Option value |
| iconName | IconName | **required** | Icon to display |
| children | ReactNode | — | Display label |

##### Props (Select.Group)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | **required** | Group heading |

##### Props (Select.Value)

Custom display for the selected value. Replace default label rendering with custom content.

##### Usage

```tsx
// Basic select
<Select value={role} onChange={setRole} placeholder="Choose role">
  <Select.Item value="admin">Administrator</Select.Item>
  <Select.Item value="editor">Editor</Select.Item>
  <Select.Item value="viewer">Viewer</Select.Item>
</Select>

// With groups and icons
<Select value={channel} onChange={setChannel} placeholder="Select channel">
  <Select.Group label="Messaging">
    <Select.IconItem value="sms" iconName="Message">SMS</Select.IconItem>
    <Select.IconItem value="email" iconName="Mail">Email</Select.IconItem>
  </Select.Group>
  <Select.Group label="Social">
    <Select.IconItem value="instagram" iconName="Instagram">Instagram</Select.IconItem>
  </Select.Group>
</Select>

// Custom selected value display
<Select value={color} onChange={setColor}>
  <Select.Value>
    <Box css={{ display: 'flex', alignItems: 'center', gap: '$space2' }}>
      <Box css={{ width: '$size4', height: '$size4', backgroundColor: color, borderRadius: '$radiusMax' }} />
      <Text>{color}</Text>
    </Box>
  </Select.Value>
  <Select.Item value="red">Red</Select.Item>
  <Select.Item value="blue">Blue</Select.Item>
</Select>
```

##### Related Components
- **MultiSelect**: For multiple selections
- **SearchableSelect**: Searchable single-select
- **Form.Select**: Formik-connected version

---

#### MultiSelect

**Import**: `import { MultiSelect } from '@attentive/picnic'`
**Primitive**: Downshift `useMultipleSelection` + `useCombobox`
**Compound**: `MultiSelect.Item`, `MultiSelect.Group`

Multi-value select with tag display and search filtering.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | Array<string \| number> | — | Selected values |
| onChange | (values: Array<string \| number>) => void | — | Selection handler |
| placeholder | string | — | Placeholder text |
| disabled | boolean | false | Disables component |
| size | `'small'` \| `'medium'` | `'medium'` | Trigger size |
| state | `'normal'` \| `'error'` | `'normal'` | Visual state |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<MultiSelect value={tags} onChange={setTags} placeholder="Select tags">
  <MultiSelect.Item value="important">Important</MultiSelect.Item>
  <MultiSelect.Item value="urgent">Urgent</MultiSelect.Item>
  <MultiSelect.Item value="low">Low Priority</MultiSelect.Item>
</MultiSelect>
```

##### Related Components
- **Select**: Single-select variant
- **TagSelector**: Tag-based selection
- **Form.MultiSelect**: Formik-connected version

---

#### SearchableSelect

**Import**: `import { SearchableSelect } from '@attentive/picnic'`
**Primitive**: Downshift `useCombobox`
**Compound**: `SearchableSelect.Item`, `SearchableSelect.Group`

Single-select with search/filter input. Users type to filter available options.

##### Props

Same as Select, plus:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onInputValueChange | (value: string) => void | — | Search input change handler |

##### Usage

```tsx
<SearchableSelect value={country} onChange={setCountry} placeholder="Search countries...">
  <SearchableSelect.Item value="us">United States</SearchableSelect.Item>
  <SearchableSelect.Item value="uk">United Kingdom</SearchableSelect.Item>
  <SearchableSelect.Item value="ca">Canada</SearchableSelect.Item>
</SearchableSelect>
```

##### Related Components
- **Select**: Non-searchable variant
- **Form.SearchableSelect**: Formik-connected version

---

#### Checkbox

**Import**: `import { Checkbox } from '@attentive/picnic'`
**Primitive**: Radix Checkbox
**Compound**: `Checkbox.CheckboxItem`

Checkbox with label support and indeterminate state.

##### Props (Checkbox / Checkbox.CheckboxItem)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| checked | boolean \| `'indeterminate'` | false | Checked state |
| onChange | (checked: boolean) => void | — | Change handler |
| disabled | boolean | false | Disables interaction |
| aria-label | string | — | Accessible label |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<Checkbox checked={agreed} onChange={setAgreed}>
  I agree to the terms and conditions
</Checkbox>

// Standalone checkbox item (no label)
<Checkbox.CheckboxItem
  checked={selected}
  onChange={setSelected}
  aria-label="Select row"
/>
```

##### Related Components
- **Switch**: Toggle switch alternative
- **RadioGroup**: Single-choice alternative
- **Form.Checkbox**: Formik-connected version

---

#### RadioGroup

**Import**: `import { RadioGroup } from '@attentive/picnic'`
**Primitive**: Radix RadioGroup
**Compound**: `RadioGroup.Item`

Radio button group for single-choice selection. Built on Radix for keyboard navigation.

##### Props (RadioGroup)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | — | Selected value |
| onValueChange | (value: string) => void | — | Selection handler |
| disabled | boolean | false | Disables all items |
| orientation | `'horizontal'` \| `'vertical'` | `'vertical'` | Layout direction |
| css | PicnicCss | — | Stitches style object |

##### Props (RadioGroup.Item)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | **required** | Option value |
| disabled | boolean | false | Disables this option |
| children | ReactNode | — | Label text |

##### Usage

```tsx
<RadioGroup value={plan} onValueChange={setPlan}>
  <RadioGroup.Item value="free">Free Plan</RadioGroup.Item>
  <RadioGroup.Item value="pro">Pro Plan</RadioGroup.Item>
  <RadioGroup.Item value="enterprise">Enterprise</RadioGroup.Item>
</RadioGroup>
```

##### Related Components
- **Checkbox**: Multi-choice alternative
- **ButtonGroup**: Toggle-style alternative
- **Form.RadioGroup**: Formik-connected version

---

#### Switch

**Import**: `import { Switch } from '@attentive/picnic'`
**Primitive**: Radix Switch

Toggle switch for boolean settings.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| checked | boolean | false | Toggle state |
| onCheckedChange | (checked: boolean) => void | — | Change handler |
| disabled | boolean | false | Disables interaction |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<Switch checked={enabled} onCheckedChange={setEnabled} />

// In a FormField
<FormField layout="horizontal">
  <Switch checked={darkMode} onCheckedChange={setDarkMode} />
  <FormField.Label>Dark Mode</FormField.Label>
</FormField>
```

##### Related Components
- **Checkbox**: Alternative for discrete choices
- **Form.Switch**: Formik-connected version

---

#### SearchBar

**Import**: `import { SearchBar } from '@attentive/picnic'`
**Primitive**: Styled `input` with search icon

Text input pre-configured with a search icon and clear button.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | — | Search query |
| onChange | (e: ChangeEvent) => void | — | Input change handler |
| onClear | () => void | — | Clear button handler |
| placeholder | string | `'Search...'` | Placeholder text |
| disabled | boolean | false | Disables input |
| size | `'small'` \| `'normal'` | `'normal'` | Input size |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<SearchBar
  value={query}
  onChange={(e) => setQuery(e.target.value)}
  onClear={() => setQuery('')}
  placeholder="Search campaigns..."
/>
```

##### Related Components
- **TextInput**: Generic text input
- **SearchableSelect**: Search within a select

---

#### FileInput

**Import**: `import { FileInput } from '@attentive/picnic'`
**Primitive**: Styled `input type="file"`

File upload input with customizable accept types.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| accept | string | — | Accepted file types (e.g., `'.png,.jpg'`) |
| multiple | boolean | false | Allow multiple files |
| onChange | (e: ChangeEvent<HTMLInputElement>) => void | — | File selection handler |
| disabled | boolean | false | Disables input |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<FileInput accept=".png,.jpg,.gif" onChange={handleFileSelect} />
```

##### Related Components
- **ImagePreview**: Preview uploaded images

---

#### InputGroup

**Import**: `import { InputGroup } from '@attentive/picnic'`
**Primitive**: Styled `div`

Groups multiple inputs visually (shared borders).

##### Usage

```tsx
<InputGroup>
  <Select value={countryCode} onChange={setCountryCode}>
    <Select.Item value="+1">+1</Select.Item>
    <Select.Item value="+44">+44</Select.Item>
  </Select>
  <TextInput placeholder="Phone number" />
</InputGroup>
```

---

#### TagSelector

**Import**: `import { TagSelector } from '@attentive/picnic'`
**Primitive**: Custom

Input for selecting/creating tags. Combines text input with tag display.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| tags | string[] | — | Current tags |
| onAddTag | (tag: string) => void | — | Add tag handler |
| onRemoveTag | (tag: string) => void | — | Remove tag handler |
| placeholder | string | — | Input placeholder |
| disabled | boolean | false | Disables input |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<TagSelector
  tags={keywords}
  onAddTag={(tag) => setKeywords([...keywords, tag])}
  onRemoveTag={(tag) => setKeywords(keywords.filter(k => k !== tag))}
  placeholder="Add keyword..."
/>
```

##### Related Components
- **Tag**: Standalone tag component
- **MultiSelect**: Alternative multi-value selection

---

#### DatePicker

**Import**: `import { DatePicker } from '@attentive/picnic'`
**Primitive**: `react-dates` (SingleDatePicker)

Single date selection input with calendar popover.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| date | Moment \| null | — | Selected date |
| onDateChange | (date: Moment \| null) => void | — | Date change handler |
| disabled | boolean | false | Disables picker |
| placeholder | string | — | Placeholder text |
| isOutsideRange | (day: Moment) => boolean | — | Disable specific dates |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<DatePicker
  date={startDate}
  onDateChange={setStartDate}
  placeholder="Select start date"
  isOutsideRange={(day) => day.isBefore(moment())}
/>
```

##### Related Components
- **DateRangePicker**: For date ranges
- **TimePicker**: Time selection
- **Form.DatePicker**: Formik-connected version

---

#### DateRangePicker

**Import**: `import { DateRangePicker } from '@attentive/picnic'`
**Primitive**: `react-dates` (DateRangePicker)

Date range selection with start/end date pickers.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| startDate | Moment \| null | — | Range start |
| endDate | Moment \| null | — | Range end |
| onDatesChange | (dates: { startDate: Moment \| null, endDate: Moment \| null }) => void | — | Date change handler |
| disabled | boolean | false | Disables picker |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<DateRangePicker
  startDate={start}
  endDate={end}
  onDatesChange={({ startDate, endDate }) => {
    setStart(startDate);
    setEnd(endDate);
  }}
/>
```

##### Related Components
- **DatePicker**: Single date variant

---

#### TimePicker

**Import**: `import { TimePicker } from '@attentive/picnic'`
**Primitive**: Custom select-based

Time selection input.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | — | Selected time (HH:mm format) |
| onChange | (time: string) => void | — | Time change handler |
| disabled | boolean | false | Disables picker |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<TimePicker value={time} onChange={setTime} />
```

##### Related Components
- **DatePicker**: Date selection


---

### Data Display Components

---

#### Table

**Import**: `import { Table } from '@attentive/picnic'`
**Primitive**: CSS Grid with ARIA table roles
**Compound**: 11 sub-components

CSS Grid-based data table with sorting, row selection, and focusable rows. Uses ARIA roles (`role="table"`, `role="row"`, `role="cell"`, `role="columnheader"`) for accessibility.

##### Props (Table)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| columns | number \| number[] | — | Equal columns (number) or column ratios (array) |
| columnSizes | string \| string[] | — | Explicit CSS Grid column sizes |
| textVariant | `'body'` \| `'caption'` | `'body'` | Base text size |
| css | PicnicCss | — | Stitches style object |

##### Sub-Components

| Sub-Component | Props | Description |
|---------------|-------|-------------|
| Table.Header | children | Header rowgroup wrapper |
| Table.HeaderRow | children | Header row (display: contents) |
| Table.HeaderCell | `align?: 'left' \| 'center' \| 'right'` | Column header cell |
| Table.SortableHeaderCell | `onChange, isSortActive?, ascending?, align?` | Sortable column header |
| Table.Body | children | Body rowgroup wrapper |
| Table.BodyRow | children | Body row (display: contents) |
| Table.BodyFocusableRow | `onClick?` | Clickable body row with hover/focus styles |
| Table.BodyCell | `align?: 'left' \| 'center' \| 'right'` | Body data cell |
| Table.RowSelectorCell | `checked, onChange, value, aria-label?` | Row checkbox cell |
| Table.HeaderSelectorCell | `onChange, aria-label?` | Select-all checkbox header |
| Table.FocusWrapper | `onKeyDown` | Keyboard-focusable cell wrapper |

##### Cell Alignment Variants

| Value | Justification |
|-------|--------------|
| `left` | `flex-start` |
| `center` | `center` |
| `right` | `flex-end` |

##### Usage

```tsx
// Basic table
<Table columns={4}>
  <Table.Header>
    <Table.HeaderRow>
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Email</Table.HeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
      <Table.HeaderCell align="right">Actions</Table.HeaderCell>
    </Table.HeaderRow>
  </Table.Header>
  <Table.Body>
    {users.map((user) => (
      <Table.BodyRow key={user.id}>
        <Table.BodyCell>{user.name}</Table.BodyCell>
        <Table.BodyCell>{user.email}</Table.BodyCell>
        <Table.BodyCell>
          <ContainedLabel variant="success">Active</ContainedLabel>
        </Table.BodyCell>
        <Table.BodyCell align="right">
          <IconButton iconName="Edit" description="Edit user" variant="subdued" size="small" />
        </Table.BodyCell>
      </Table.BodyRow>
    ))}
  </Table.Body>
</Table>

// With sorting
<Table columns={3}>
  <Table.Header>
    <Table.HeaderRow>
      <Table.SortableHeaderCell
        isSortActive={sortField === 'name'}
        ascending={sortAsc}
        onChange={() => handleSort('name')}
      >
        Name
      </Table.SortableHeaderCell>
      <Table.HeaderCell>Email</Table.HeaderCell>
      <Table.SortableHeaderCell
        isSortActive={sortField === 'date'}
        ascending={sortAsc}
        onChange={() => handleSort('date')}
      >
        Date
      </Table.SortableHeaderCell>
    </Table.HeaderRow>
  </Table.Header>
  <Table.Body>{/* rows */}</Table.Body>
</Table>

// With row selection
<Table columns={[1, 4, 3, 2]}>
  <Table.Header>
    <Table.HeaderRow>
      <Table.HeaderSelectorCell
        onChange={handleSelectAll}
        aria-label="Select all rows"
      />
      <Table.HeaderCell>Name</Table.HeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
      <Table.HeaderCell>Actions</Table.HeaderCell>
    </Table.HeaderRow>
  </Table.Header>
  <Table.Body>
    {items.map((item) => (
      <Table.BodyRow key={item.id}>
        <Table.RowSelectorCell
          checked={selected.includes(item.id)}
          onChange={() => toggleSelect(item.id)}
          value={item.id}
          aria-label={`Select ${item.name}`}
        />
        <Table.BodyCell>{item.name}</Table.BodyCell>
        <Table.BodyCell>{item.status}</Table.BodyCell>
        <Table.BodyCell>
          <Button variant="subdued" size="small">Edit</Button>
        </Table.BodyCell>
      </Table.BodyRow>
    ))}
  </Table.Body>
</Table>

// Custom column sizes
<Table columnSizes={['200px', '1fr', '1fr', '100px']}>
  {/* ... */}
</Table>

// Clickable rows
<Table columns={3}>
  <Table.Header>{/* ... */}</Table.Header>
  <Table.Body>
    <Table.BodyFocusableRow onClick={() => navigate(`/user/${id}`)}>
      <Table.BodyCell>John Doe</Table.BodyCell>
      <Table.BodyCell>Active</Table.BodyCell>
      <Table.BodyCell>2024-01-15</Table.BodyCell>
    </Table.BodyFocusableRow>
  </Table.Body>
</Table>
```

##### Related Components
- **Paginator**: Pagination controls for tables
- **ContinuousScroll**: Infinite scrolling alternative

---

#### Badge

**Import**: `import { Badge } from '@attentive/picnic'`
**Primitive**: Styled `em`

Inline or raised annotation badge. Used for counts, statuses, and notifications.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'active'` \| `'standard'` \| `'primary'` \| `'error'` \| `'magic'` | `'standard'` | Color variant |
| position | `'inline'` \| `'raised'` | `'raised'` | Positioning mode |
| css | PicnicCss | — | Stitches style object |

##### Variant Styles

| Variant | Background | Text | Notes |
|---------|-----------|------|-------|
| active | `$bgToggleSelected` | `$textInverted` | White border |
| standard | `$bgInformationalDefault` | inherited | Default |
| primary | `$bgActionPrimary` | `$textDefault` | Yellow/brand |
| error | `$bgCriticalAccent` | inherited | Red |
| magic | `$bgGradientMagic` | `$textDefault` | Gradient |

##### Usage

```tsx
// Raised badge (positioned over parent)
<Box css={{ position: 'relative', display: 'inline-block' }}>
  <IconButton iconName="Bell" description="Notifications" />
  <Badge variant="error">3</Badge>
</Box>

// Inline badge
<Badge variant="standard" position="inline">New</Badge>

// Magic gradient
<Badge variant="magic" position="inline">AI</Badge>
```

##### Related Components
- **ContainedLabel**: Richer status label with icon
- **Tag**: Deletable tag

---

#### Tag

**Import**: `import { Tag } from '@attentive/picnic'`
**Primitive**: Styled `span`

Deletable tag/chip component. Always includes a delete (X) icon.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onDelete | () => void | **required** | Delete handler |
| size | `'small'` \| `'normal'` | `'normal'` | Tag size |
| variant | `'default'` \| `'error'` | `'default'` | Color variant |
| disabled | boolean | false | Disables interaction |
| css | PicnicCss | — | Stitches style object |

##### Size Scale

| Size | Font Size | Min Height |
|------|-----------|-----------|
| small | `$fontSize2` | `$size5` |
| normal | `$fontSize3` | `$size7` |

##### Usage

```tsx
<Tag onDelete={() => removeTag('react')}>React</Tag>
<Tag size="small" onDelete={() => removeTag('ts')}>TypeScript</Tag>
<Tag variant="error" onDelete={() => removeError(id)}>Invalid Email</Tag>
```

##### Related Components
- **Badge**: Non-deletable annotation
- **ContainedLabel**: Status label
- **MultiSelect**: Uses tags for selected values

---

#### ContainedLabel

**Import**: `import { ContainedLabel } from '@attentive/picnic'`
**Primitive**: Styled `div` + Context
**Compound**: `ContainedLabel.Icon`, `ContainedLabel.Tooltip`

Status label with pill shape, optional icon, and optional tooltip. Provides icon color via context.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'neutral'` \| `'success'` \| `'informational'` \| `'warning'` \| `'critical'` \| `'decorative1'` \| `'decorative2'` \| `'decorative3'` \| `'decorative4'` \| `'overMedia'` \| `'magic'` | `'neutral'` | Color variant |
| css | PicnicCss | — | Stitches style object |

##### Sub-Components

| Sub-Component | Props | Description |
|---------------|-------|-------------|
| ContainedLabel.Icon | `name: IconName, color?: IconColor` | Icon (auto-colored by variant) |
| ContainedLabel.Tooltip | `iconName, iconColor?, description, side?, children` | Info tooltip |

##### Usage

```tsx
// Simple label
<ContainedLabel variant="success">Active</ContainedLabel>

// With icon
<ContainedLabel variant="warning">
  <ContainedLabel.Icon name="CircleExclamation" />
  Pending Review
</ContainedLabel>

// With tooltip
<ContainedLabel variant="informational">
  <ContainedLabel.Icon name="CircleInformation" />
  Beta
  <ContainedLabel.Tooltip
    iconName="CircleQuestion"
    description="More info"
    side="bottom"
  >
    This feature is in beta testing.
  </ContainedLabel.Tooltip>
</ContainedLabel>
```

##### Related Components
- **Badge**: Simpler count/status indicator
- **Tag**: Deletable version

---

#### ProgressBar

**Import**: `import { ProgressBar } from '@attentive/picnic'`
**Primitive**: Radix Progress

Horizontal progress bar with animated fill.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| total | number | **required** | Maximum value |
| value | number | **required** | Current value |
| variant | `'success'` \| `'warning'` \| `'error'` | `'success'` | Fill color |

##### Variant Colors

| Variant | Indicator Color |
|---------|----------------|
| success | `$iconSuccess` (green) |
| warning | `$bgWarningAccent` (orange) |
| error | `$iconCritical` (red) |

##### Usage

```tsx
<ProgressBar total={100} value={75} variant="success" />
<ProgressBar total={500} value={480} variant="warning" />
```

---

#### StepTracker

**Import**: `import { StepTracker } from '@attentive/picnic'`
**Primitive**: Custom
**Compound**: `StepTracker.Step`

Multi-step progress indicator. Steps auto-transition between completed, active, and incompleted states.

##### Props (StepTracker)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| activeStep | number | 0 | Zero-indexed active step |
| fontSize | `'small'` \| `'medium'` | `'medium'` | Label font size |
| layout | `'inline'` \| `'stacked'` | `'inline'` | Horizontal or vertical layout |
| css | PicnicCss | — | Stitches style object |

##### Props (StepTracker.Step)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onClick | () => void | — | Click handler (makes step clickable) |
| css | PicnicCss | — | Stitches style object |

Steps before `activeStep` show a checkmark (completed). The step at `activeStep` shows bold text with filled circle. Steps after show numbered empty circle.

##### Usage

```tsx
<StepTracker activeStep={1}>
  <StepTracker.Step>Account Setup</StepTracker.Step>
  <StepTracker.Step>Configuration</StepTracker.Step>
  <StepTracker.Step>Review</StepTracker.Step>
</StepTracker>

// Clickable steps
<StepTracker activeStep={currentStep} layout="stacked">
  <StepTracker.Step onClick={() => goToStep(0)}>Details</StepTracker.Step>
  <StepTracker.Step onClick={() => goToStep(1)}>Targeting</StepTracker.Step>
  <StepTracker.Step onClick={() => goToStep(2)}>Schedule</StepTracker.Step>
</StepTracker>
```

##### Related Components
- **ProgressBar**: Linear progress indicator
- **Breadcrumbs**: Navigation breadcrumbs

---

#### List

**Import**: `import { List } from '@attentive/picnic'`
**Primitive**: Styled `ul`/`ol`
**Compound**: `List.Item`

Ordered or unordered list component.

##### Props (List)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| as | `'ul'` \| `'ol'` | `'ul'` | List type |
| variant | `'unstyled'` | — | Remove default list styles |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<List>
  <List.Item>First item</List.Item>
  <List.Item>Second item</List.Item>
  <List.Item>Third item</List.Item>
</List>

// Unstyled list
<List variant="unstyled">
  <List.Item css={{ p: '$space2' }}>Custom styled item</List.Item>
</List>
```


---

### Navigation Components

---

#### Breadcrumbs

**Import**: `import { Breadcrumbs } from '@attentive/picnic'`
**Primitive**: Custom (`nav` element)
**Compound**: `Breadcrumbs.Item`

Navigation breadcrumbs with chevron separators. The last item is automatically styled as the current page (bold, non-link).

##### Props (Breadcrumbs)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| css | PicnicCss | — | Stitches style object |

##### Props (Breadcrumbs.Item)

Extends `LinkProps` — accepts all Link props (`href`, `as`, etc.).

##### Usage

```tsx
<Breadcrumbs>
  <Breadcrumbs.Item href="/dashboard">Dashboard</Breadcrumbs.Item>
  <Breadcrumbs.Item href="/campaigns">Campaigns</Breadcrumbs.Item>
  <Breadcrumbs.Item>Holiday Sale 2024</Breadcrumbs.Item>
</Breadcrumbs>
```

Renders: Dashboard > Campaigns > **Holiday Sale 2024**

##### Related Components
- **Link**: Standalone link component
- **TabGroup**: Content section navigation

---

#### TabGroup

**Import**: `import { TabGroup } from '@attentive/picnic'`
**Primitive**: Radix Tabs
**Compound**: `TabGroup.List`, `TabGroup.Tab`, `TabGroup.Panel`

Tabbed navigation with accessible keyboard support (arrow keys). Built on Radix Tabs.

##### Props (TabGroup)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| defaultValue | string | — | Initially active tab |
| value | string | — | Controlled active tab |
| onValueChange | (value: string) => void | — | Tab change handler |
| css | PicnicCss | — | Stitches style object |

##### Props (TabGroup.Tab)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | **required** | Tab identifier |
| disabled | boolean | false | Disables tab |

##### Props (TabGroup.Panel)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | string | **required** | Panel identifier (matches Tab value) |

##### Usage

```tsx
<TabGroup defaultValue="overview">
  <TabGroup.List>
    <TabGroup.Tab value="overview">Overview</TabGroup.Tab>
    <TabGroup.Tab value="analytics">Analytics</TabGroup.Tab>
    <TabGroup.Tab value="settings">Settings</TabGroup.Tab>
  </TabGroup.List>

  <TabGroup.Panel value="overview">
    <Text>Overview content here</Text>
  </TabGroup.Panel>
  <TabGroup.Panel value="analytics">
    <Text>Analytics content here</Text>
  </TabGroup.Panel>
  <TabGroup.Panel value="settings">
    <Text>Settings content here</Text>
  </TabGroup.Panel>
</TabGroup>
```

##### Related Components
- **ButtonGroup**: Toggle without content panels
- **Accordion**: Collapsible sections alternative

---

#### Paginator

**Import**: `import { Paginator } from '@attentive/picnic'`
**Primitive**: Custom (ButtonGroup + Text)
**Compound**: `Paginator.Label`, `Paginator.ButtonGroup`

Page-based pagination controls with label and navigation buttons.

##### Props (Paginator)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| totalItems | number | **required** | Total item count |
| maxItemsPerPage | number | **required** | Items per page |
| offset | number | **required** | Current page index (0-based) |
| onOffsetChange | (offset: number) => void | **required** | Page change handler |
| hasStartEndButtons | boolean | false | Show first/last page buttons |
| disabled | boolean | false | Disables navigation |
| css | PicnicCss | — | Stitches style object |

##### Sub-Components (for custom layout)

| Sub-Component | Props | Description |
|---------------|-------|-------------|
| Paginator.Label | `pageIndex, itemsPerPage, totalItems?` | "Viewing X-Y of Z" text |
| Paginator.ButtonGroup | `hasNext, hasPrevious, loadNext, loadPrevious, hasStartEndButtons?, loadFirst?, loadLast?, disabled?` | Navigation buttons |

##### Usage

```tsx
// Simple paginator
<Paginator
  totalItems={250}
  maxItemsPerPage={25}
  offset={currentPage}
  onOffsetChange={setCurrentPage}
/>

// With first/last buttons
<Paginator
  totalItems={1000}
  maxItemsPerPage={50}
  offset={page}
  onOffsetChange={setPage}
  hasStartEndButtons
/>

// Custom layout with sub-components
<Box css={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
  <Paginator.Label pageIndex={page} itemsPerPage={25} totalItems={250} />
  <Paginator.ButtonGroup
    hasNext={page < totalPages - 1}
    hasPrevious={page > 0}
    loadNext={() => setPage(page + 1)}
    loadPrevious={() => setPage(page - 1)}
  />
</Box>
```

##### Related Components
- **Table**: Often paired with Paginator
- **ContinuousScroll**: Infinite scroll alternative


---

### Overlay Components

---

#### Dialog

**Import**: `import { Dialog } from '@attentive/picnic'`
**Primitive**: Radix Dialog
**Compound**: `Dialog.Trigger`, `Dialog.Content`, `Dialog.Header`, `Dialog.Close`, `Dialog.CloseButton`

Low-level modal dialog. Use `StandardDialog` for pre-structured dialogs with header/body/footer.

##### Props (Dialog)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | — | Controlled open state |
| defaultOpen | boolean | — | Initially open |
| onOpenChange | (open: boolean) => void | — | Open state handler |
| includeOverlay | boolean | true | Show backdrop overlay |
| children | ReactNode | — | Trigger + Content |

##### Sub-Components

| Sub-Component | Props | Description |
|---------------|-------|-------------|
| Dialog.Trigger | `children: ReactElement` | Wraps trigger element (uses Radix `asChild`) |
| Dialog.Content | `css?, styling?: 'default' \| 'unstyled', portalContainer?` | Dialog body with default centered styling |
| Dialog.Header | `children, css?` | Title + close button header |
| Dialog.Close | ButtonProps | Close button (renders as Button) |
| Dialog.CloseButton | `size?, variant?, iconName?, description?` | X icon close button (top-right) |

##### Usage

```tsx
<Dialog>
  <Dialog.Trigger>
    <Button variant="primary">Open Dialog</Button>
  </Dialog.Trigger>
  <Dialog.Content css={{ width: '480px', p: '$space6' }}>
    <Dialog.Header>
      <Heading variant="md">Confirm Action</Heading>
    </Dialog.Header>
    <Box css={{ py: '$space4' }}>
      <Text>Are you sure you want to proceed?</Text>
    </Box>
    <Box css={{ display: 'flex', gap: '$space2', justifyContent: 'flex-end' }}>
      <Dialog.Close variant="secondary">Cancel</Dialog.Close>
      <Dialog.Close variant="primary">Confirm</Dialog.Close>
    </Box>
  </Dialog.Content>
</Dialog>

// Controlled dialog
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <Dialog.Content css={{ width: '600px' }}>
    <Dialog.Header>
      <Heading variant="md">Edit Profile</Heading>
    </Dialog.Header>
    {/* content */}
  </Dialog.Content>
</Dialog>
```

##### Related Components
- **StandardDialog**: Pre-structured dialog (prefer for standard use cases)
- **Drawer**: Slide-in panel alternative

---

#### StandardDialog

**Import**: `import { StandardDialog } from '@attentive/picnic'`
**Primitive**: Radix Dialog (wraps Dialog)
**Compound**: `StandardDialog.Trigger`, `StandardDialog.Content`, `StandardDialog.Header`, `StandardDialog.Heading`, `StandardDialog.HeroImage`, `StandardDialog.Body`, `StandardDialog.Footer`, `StandardDialog.Close`

Pre-structured dialog with header/body/footer sections, separators, and optional hero image. Content parses children by type into layout slots.

##### Sub-Components

| Sub-Component | Props | Description |
|---------------|-------|-------------|
| StandardDialog.Trigger | `children: ReactElement` | Trigger element |
| StandardDialog.Content | `css?` | Container that organizes child slots |
| StandardDialog.Header | `css?` | Title bar with close button |
| StandardDialog.Heading | Same as Heading | Title text (renders `Heading variant="md"`) |
| StandardDialog.HeroImage | ResponsiveImageProps | 16:9 hero image (triggers image layout) |
| StandardDialog.Body | `css?` | Scrollable body content |
| StandardDialog.Footer | `css?, layout?` | Button bar footer (uses ButtonBar) |
| StandardDialog.Close | ButtonProps | Close action button |

##### Usage

```tsx
// Standard dialog
<StandardDialog>
  <StandardDialog.Trigger>
    <Button>Open</Button>
  </StandardDialog.Trigger>
  <StandardDialog.Content css={{ width: '500px' }}>
    <StandardDialog.Header>
      <StandardDialog.Heading>Create Campaign</StandardDialog.Heading>
    </StandardDialog.Header>
    <StandardDialog.Body>
      <Stack spacing="$space4">
        <FormField>
          <FormField.Label>Campaign Name</FormField.Label>
          <TextInput placeholder="Enter name" />
        </FormField>
      </Stack>
    </StandardDialog.Body>
    <StandardDialog.Footer>
      <StandardDialog.Close variant="secondary">Cancel</StandardDialog.Close>
      <Button variant="primary" onClick={handleCreate}>Create</Button>
    </StandardDialog.Footer>
  </StandardDialog.Content>
</StandardDialog>

// With hero image
<StandardDialog>
  <StandardDialog.Trigger>
    <Button>View Details</Button>
  </StandardDialog.Trigger>
  <StandardDialog.Content>
    <StandardDialog.HeroImage src="/hero.jpg" alt="Campaign preview" />
    <StandardDialog.Header>
      <StandardDialog.Heading>Campaign Preview</StandardDialog.Heading>
    </StandardDialog.Header>
    <StandardDialog.Body>
      <Text>Campaign details here...</Text>
    </StandardDialog.Body>
    <StandardDialog.Footer>
      <StandardDialog.Close variant="primary">Done</StandardDialog.Close>
    </StandardDialog.Footer>
  </StandardDialog.Content>
</StandardDialog>
```

##### Related Components
- **Dialog**: Low-level dialog for custom layouts
- **StandardDrawer**: Side panel equivalent

---

#### Drawer

**Import**: `import { Drawer } from '@attentive/picnic'`
**Primitive**: Radix Dialog (slide-in animation)
**Compound**: `Drawer.Trigger`, `Drawer.Content`, `Drawer.Header`, `Drawer.CloseButton`

Slide-in panel from the right side. Supports animated open/close and optional overlay.

##### Props (Drawer)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | — | Controlled open state |
| onOpenChange | (open: boolean) => void | — | Open state handler |
| includeOverlay | boolean | true | Show backdrop overlay |
| onCloseFinish | () => void | — | Called after close animation completes |

Animation duration: 300ms.

##### Sub-Components

| Sub-Component | Props | Description |
|---------------|-------|-------------|
| Drawer.Trigger | `children: ReactElement` | Trigger element |
| Drawer.Content | `css?` | Drawer panel container |
| Drawer.Header | `children, css?` | Title + close button |
| Drawer.CloseButton | `size?, variant?, iconName?, description?` | X close button |

##### Usage

```tsx
<Drawer open={isOpen} onOpenChange={setIsOpen}>
  <Drawer.Trigger>
    <Button>Open Drawer</Button>
  </Drawer.Trigger>
  <Drawer.Content css={{ width: '400px' }}>
    <Drawer.Header>
      <Heading variant="md">Drawer Title</Heading>
    </Drawer.Header>
    <Box css={{ p: '$space6' }}>
      <Text>Drawer content</Text>
    </Box>
  </Drawer.Content>
</Drawer>
```

##### Related Components
- **StandardDrawer**: Pre-structured drawer
- **Dialog**: Centered modal alternative

---

#### StandardDrawer

**Import**: `import { StandardDrawer } from '@attentive/picnic'`
**Primitive**: Radix Dialog (wraps Drawer)
**Compound**: `StandardDrawer.Trigger`, `StandardDrawer.Content`, `StandardDrawer.Header`, `StandardDrawer.Body`, `StandardDrawer.Footer`, `StandardDrawer.Close`

Pre-structured slide-in drawer with header/body/footer sections.

##### Sub-Components

| Sub-Component | Props | Description |
|---------------|-------|-------------|
| StandardDrawer.Trigger | `children: ReactElement` | Trigger element |
| StandardDrawer.Content | `css?` | Container organizing child slots |
| StandardDrawer.Header | `css?` | Title + close button |
| StandardDrawer.Body | `css?` | Scrollable body content |
| StandardDrawer.Footer | `css?, layout?` | Button bar footer (default: `layout="auto"`) |
| StandardDrawer.Close | ButtonProps | Close button (default: `variant="subdued"`) |

##### Usage

```tsx
<StandardDrawer open={isOpen} onOpenChange={setIsOpen}>
  <StandardDrawer.Content css={{ width: '480px' }}>
    <StandardDrawer.Header>
      <Heading variant="md">Edit Settings</Heading>
    </StandardDrawer.Header>
    <StandardDrawer.Body>
      <Stack spacing="$space4">
        <FormField>
          <FormField.Label>Display Name</FormField.Label>
          <TextInput value={name} onChange={(e) => setName(e.target.value)} />
        </FormField>
      </Stack>
    </StandardDrawer.Body>
    <StandardDrawer.Footer>
      <StandardDrawer.Close>Cancel</StandardDrawer.Close>
      <Button variant="primary" onClick={handleSave}>Save</Button>
    </StandardDrawer.Footer>
  </StandardDrawer.Content>
</StandardDrawer>
```

##### Related Components
- **Drawer**: Low-level drawer
- **StandardDialog**: Centered modal equivalent

---

#### Popover

**Import**: `import { Popover } from '@attentive/picnic'`
**Primitive**: Radix Popover
**Compound**: `Popover.Trigger`, `Popover.Anchor`, `Popover.Content`, `Popover.CloseButton`, `Popover.CloseIconButton`

Floating content panel anchored to a trigger element. Supports `default` and `guidance` variants.

##### Props (Popover)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | — | Controlled open state |
| defaultOpen | boolean | — | Initially open |
| onOpenChange | (open: boolean) => void | — | Open state handler |
| variant | `'default'` \| `'guidance'` | `'default'` | Visual style |

##### Props (Popover.Content)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| showCloseButton | boolean | true | Show X close button |
| showArrow | boolean | true | Show pointing arrow |
| side | `'top'` \| `'right'` \| `'bottom'` \| `'left'` | — | Preferred side |
| align | `'start'` \| `'center'` \| `'end'` | — | Alignment |
| alignOffset | number | 4 | Alignment offset in px |
| css | PicnicCss | — | Stitches style object |

##### Variant Styles

| Variant | Background | Text | Arrow |
|---------|-----------|------|-------|
| default | `$bgDefault` | inherited | White with border |
| guidance | `$lavenderPurple700` | `$textInverted` | Purple fill |

##### Usage

```tsx
// Default popover
<Popover>
  <Popover.Trigger>
    <Button variant="secondary">More Info</Button>
  </Popover.Trigger>
  <Popover.Content side="bottom">
    <Text variant="caption">Additional details about this feature.</Text>
    <Popover.CloseButton variant="primary" css={{ mt: '$space3' }}>Got it</Popover.CloseButton>
  </Popover.Content>
</Popover>

// Guidance variant (purple)
<Popover variant="guidance">
  <Popover.Trigger>
    <IconButton iconName="Lightbulb" description="Tips" />
  </Popover.Trigger>
  <Popover.Content>
    <Text>Pro tip: Use keyboard shortcuts for faster navigation.</Text>
  </Popover.Content>
</Popover>
```

##### Related Components
- **Tooltip**: Simpler hover-based information
- **IconPopover**: Pre-configured icon + popover
- **DropdownMenu**: Action menu alternative

---

#### DropdownMenu

**Import**: `import { DropdownMenu } from '@attentive/picnic'`
**Primitive**: Radix DropdownMenu
**Compound**: 11 sub-components

Action menu dropdown with keyboard navigation, sub-menus, labels, and separators.

##### Props (DropdownMenu)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | — | Controlled open state |
| onOpenChange | (open: boolean) => void | — | Open state handler |

##### Sub-Components

| Sub-Component | Props | Description |
|---------------|-------|-------------|
| DropdownMenu.Trigger | `children: ReactElement` | Trigger element (uses `asChild`) |
| DropdownMenu.Button | ButtonProps + `data-state?` | Pre-styled trigger with chevron |
| DropdownMenu.Content | `align?, css?` | Menu content container |
| DropdownMenu.Item | Styled component | Clickable menu item |
| DropdownMenu.TextItem | Extends Item | Text-styled menu item |
| DropdownMenu.Label | `children` | Non-interactive group label |
| DropdownMenu.Separator | — | Visual separator line |
| DropdownMenu.Sub | Radix Sub | Sub-menu container |
| DropdownMenu.SubMenuTriggerItem | — | Item that opens sub-menu |
| DropdownMenu.SubContent | `css?` | Sub-menu content |
| DropdownMenu.UnstyledItem | Radix Item | Unstyled item primitive |

##### Usage

```tsx
// Basic dropdown
<DropdownMenu>
  <DropdownMenu.Trigger>
    <DropdownMenu.Button>Actions</DropdownMenu.Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.TextItem onClick={handleEdit}>Edit</DropdownMenu.TextItem>
    <DropdownMenu.TextItem onClick={handleDuplicate}>Duplicate</DropdownMenu.TextItem>
    <DropdownMenu.Separator />
    <DropdownMenu.TextItem onClick={handleDelete}>Delete</DropdownMenu.TextItem>
  </DropdownMenu.Content>
</DropdownMenu>

// With sub-menu
<DropdownMenu>
  <DropdownMenu.Trigger>
    <IconButton iconName="MoreHorizontal" description="More actions" />
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.TextItem onClick={handleEdit}>Edit</DropdownMenu.TextItem>
    <DropdownMenu.Sub>
      <DropdownMenu.SubMenuTriggerItem>
        <Text>Move to...</Text>
      </DropdownMenu.SubMenuTriggerItem>
      <DropdownMenu.SubContent>
        <DropdownMenu.TextItem onClick={() => moveTo('drafts')}>Drafts</DropdownMenu.TextItem>
        <DropdownMenu.TextItem onClick={() => moveTo('archive')}>Archive</DropdownMenu.TextItem>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
    <DropdownMenu.Separator />
    <DropdownMenu.Label>Danger Zone</DropdownMenu.Label>
    <DropdownMenu.TextItem onClick={handleDelete}>Delete</DropdownMenu.TextItem>
  </DropdownMenu.Content>
</DropdownMenu>
```

##### Related Components
- **Popover**: Non-action floating content
- **Select**: Form selection dropdown


---

### Feedback Components

---

#### Banner

**Import**: `import { Banner } from '@attentive/picnic'`
**Primitive**: Custom (styled div + context)
**Compound**: `Banner.Image`, `Banner.Heading`, `Banner.Text`, `Banner.Action`

Notification banner with variant-specific icons, optional heading, and action area. Parses children by type into layout slots.

##### Props (Banner)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'error'` \| `'info'` \| `'warning'` \| `'success'` \| `'neutral'` \| `'guidance'` | `'info'` | Color/icon variant |
| dismissible | boolean | false | Show dismiss X button |
| onDismiss | () => void | — | Dismiss callback |
| iconName | IconName | auto (from variant) | Override default icon |
| role | string | `'status'` | ARIA role |
| css | PicnicCss | — | Stitches style object |

##### Default Icons per Variant

| Variant | Icon | Background |
|---------|------|-----------|
| neutral | CircleInformation | `$bgDefault` + border |
| info | CircleInformation | `$bgInformationalDefault` |
| success | CircleCheckmark | `$bgSuccessDefault` |
| warning | CircleExclamation | `$bgWarningDefault` |
| error | CircleError | `$bgCriticalDefault` |
| guidance | Lightbulb | `$bgGuidanceDefault` |

##### Sub-Components

| Sub-Component | Description |
|---------------|-------------|
| Banner.Image | Custom image (replaces icon) |
| Banner.Heading | Banner title (uses `Heading variant="sm"`, color auto-set from variant) |
| Banner.Text | Body text |
| Banner.Action | Right-aligned action area |

##### Usage

```tsx
// Simple info banner
<Banner variant="info">
  <Banner.Text>Your changes have been saved.</Banner.Text>
</Banner>

// Error with heading and dismiss
<Banner variant="error" dismissible onDismiss={() => clearError()}>
  <Banner.Heading>Upload Failed</Banner.Heading>
  <Banner.Text>The file exceeded the maximum size of 10MB.</Banner.Text>
</Banner>

// With action button
<Banner variant="warning">
  <Banner.Heading>Session Expiring</Banner.Heading>
  <Banner.Text>Your session will expire in 5 minutes.</Banner.Text>
  <Banner.Action>
    <Button variant="secondary" size="small">Extend Session</Button>
  </Banner.Action>
</Banner>

// Guidance banner
<Banner variant="guidance">
  <Banner.Heading>Pro Tip</Banner.Heading>
  <Banner.Text>Use keyboard shortcuts to navigate faster.</Banner.Text>
</Banner>
```

##### Related Components
- **Accordion**: Collapsible information sections
- **Tooltip**: Inline contextual information

---

#### Accordion

**Import**: `import { Accordion } from '@attentive/picnic'`
**Primitive**: Radix Accordion
**Compound**: `Accordion.Item`, `Accordion.Header`, `Accordion.HeaderIcon`, `Accordion.Content`

Collapsible content sections with animated open/close. Supports single or multiple open items. Variant propagates to all items via context.

##### Props (Accordion)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| type | `'single'` \| `'multiple'` | — | Allow one or multiple open |
| value | string \| string[] | — | Controlled open items |
| defaultValue | string \| string[] | — | Initially open items |
| onValueChange | (value: string \| string[]) => void | — | Change handler |
| variant | `'error'` \| `'info'` \| `'neutral'` \| `'warning'` \| `'decorative3'` | **required** | Color variant |
| collapsible | boolean | false | Allow all items closed (single mode) |
| css | PicnicCss | — | Stitches style object |

##### Sub-Components

| Sub-Component | Props | Description |
|---------------|-------|-------------|
| Accordion.Item | `value: string` (Radix value) | Individual accordion section |
| Accordion.Header | `css?` | Clickable header with chevron icon |
| Accordion.HeaderIcon | `name: IconName` | Optional icon in header (auto-colored) |
| Accordion.Content | `css?` | Collapsible body content |

##### Variant Styles

| Variant | Item Background | Border |
|---------|----------------|--------|
| neutral | `$bgDefault` | `$borderDefault` |
| info | `$bgInformationalDefault` | `$bgInformationalAccent` |
| warning | `$bgWarningDefault` | `$bgWarningAccent` |
| error | `$bgCriticalDefault` | `$bgCriticalAccent` |
| decorative3 | `$bgDecorative3Default` | `$bgDecorative3Accent` |

##### Usage

```tsx
// Single open item
<Accordion type="single" variant="neutral" collapsible defaultValue="faq-1">
  <Accordion.Item value="faq-1">
    <Accordion.Header>What is Picnic?</Accordion.Header>
    <Accordion.Content>
      <Text>Picnic is the internal design system component library.</Text>
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="faq-2">
    <Accordion.Header>How do I install it?</Accordion.Header>
    <Accordion.Content>
      <Text>Import from @attentive/picnic in your React components.</Text>
    </Accordion.Content>
  </Accordion.Item>
</Accordion>

// Multiple open, with header icons
<Accordion type="multiple" variant="info" defaultValue={['step-1']}>
  <Accordion.Item value="step-1">
    <Accordion.Header>
      <Accordion.HeaderIcon name="CircleCheckmark" />
      Step 1: Configuration
    </Accordion.Header>
    <Accordion.Content>
      <Text>Configure your settings here.</Text>
    </Accordion.Content>
  </Accordion.Item>
  <Accordion.Item value="step-2">
    <Accordion.Header>
      <Accordion.HeaderIcon name="CircleExclamation" />
      Step 2: Review Warnings
    </Accordion.Header>
    <Accordion.Content>
      <Text>Review any warnings before proceeding.</Text>
    </Accordion.Content>
  </Accordion.Item>
</Accordion>
```

##### Related Components
- **Banner**: Non-collapsible notification
- **TabGroup**: Horizontal content switching

---

#### Tooltip

**Import**: `import { Tooltip } from '@attentive/picnic'`
**Primitive**: Radix Tooltip
**Compound**: `Tooltip.Provider`, `Tooltip.Trigger`, `Tooltip.Content`

Hover/focus tooltip for contextual information. Non-interactive (pointer-events disabled).

##### Props (Tooltip)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| open | boolean | — | Controlled open state |
| defaultOpen | boolean | — | Initially open |
| onOpenChange | (open: boolean) => void | — | Open state handler |
| delayDuration | number | 300 | Delay before showing (ms) |

##### Props (Tooltip.Content)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'normal'` \| `'danger'` | `'normal'` | Visual style |
| side | `'top'` \| `'right'` \| `'bottom'` \| `'left'` | `'top'` | Preferred side |
| css | PicnicCss | — | Stitches style object |

##### Variant Styles

| Variant | Background | Text |
|---------|-----------|------|
| normal | `$bgTooltip` (dark) | `$textInverted` (white) |
| danger | `$bgCriticalDefault` | `$textPrimary` |

##### Usage

```tsx
// Wrap app in Provider (once, at root)
<Tooltip.Provider>
  <App />
</Tooltip.Provider>

// Basic tooltip
<Tooltip>
  <Tooltip.Trigger>
    <IconButton iconName="CircleQuestion" description="Help" variant="subdued" />
  </Tooltip.Trigger>
  <Tooltip.Content side="bottom">
    <Text variant="caption">Click here for more options</Text>
  </Tooltip.Content>
</Tooltip>

// Danger tooltip
<Tooltip>
  <Tooltip.Trigger>
    <IconButton iconName="CircleExclamation" description="Warning" iconColor="critical" />
  </Tooltip.Trigger>
  <Tooltip.Content variant="danger">
    This action cannot be undone
  </Tooltip.Content>
</Tooltip>
```

##### Related Components
- **Popover**: Interactive floating content
- **IconPopover**: Icon + popover combination

---

#### IconPopover

**Import**: `import { IconPopover } from '@attentive/picnic'`
**Primitive**: Popover + IconButton composition

Pre-configured icon button that opens a popover on click. Convenience wrapper around Popover.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| iconName | IconName | `'CircleQuestion'` | Trigger icon |
| description | string | `'More information'` | Accessible label |
| variant | ButtonVariant | `'subdued'` | Button variant |
| size | ButtonSize | `'medium'` | Button size |
| side | `'top'` \| `'right'` \| `'bottom'` \| `'left'` | `'top'` | Popover side |
| align | `'start'` \| `'center'` \| `'end'` | `'start'` | Popover alignment |
| alignOffset | number | 2 | Alignment offset |
| open | boolean | — | Controlled state |
| onOpenChange | (open: boolean) => void | — | State handler |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<IconPopover>
  <Text variant="caption">This setting controls how notifications are delivered.</Text>
</IconPopover>

// Custom icon and positioning
<IconPopover iconName="CircleInformation" side="bottom" align="center">
  <Text variant="caption">Additional details about this metric.</Text>
</IconPopover>
```

##### Related Components
- **Popover**: Full popover API
- **Tooltip**: Simpler hover information
- **FormField.IconPopover**: Form field version

---

#### LoadingIndicator

**Import**: `import { LoadingIndicator } from '@attentive/picnic'`
**Primitive**: Custom (animated dots)

Three animated pulsating dots indicating loading state. Includes `VisuallyHidden` "Loading" text for accessibility.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
// Inline loading
<LoadingIndicator />

// Centered loading
<Box css={{ display: 'flex', justifyContent: 'center', p: '$space8' }}>
  <LoadingIndicator />
</Box>

// Inside button
<Button loading>Saving...</Button>  {/* Button uses LoadingIndicator internally */}
```

##### Related Components
- **LoadingPlaceholder**: Skeleton loading
- **Button**: Has built-in `loading` prop

---

#### LoadingPlaceholder

**Import**: `import { LoadingPlaceholder } from '@attentive/picnic'`
**Primitive**: Styled `div` with shimmer animation

Skeleton placeholder with shimmer animation for content loading states.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'shimmer'` \| `'static'` | `'shimmer'` | Animation mode |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
// Text placeholder
<LoadingPlaceholder css={{ width: '200px', height: '$size4' }} />

// Multiple skeleton lines
<Stack spacing="$space2">
  <LoadingPlaceholder css={{ width: '100%', height: '$size4' }} />
  <LoadingPlaceholder css={{ width: '80%', height: '$size4' }} />
  <LoadingPlaceholder css={{ width: '60%', height: '$size4' }} />
</Stack>

// Card skeleton
<LoadingPlaceholder css={{ width: '100%', height: '$size16', borderRadius: '$radius2' }} />

// Static (no animation)
<LoadingPlaceholder variant="static" css={{ width: '$size10', height: '$size10', borderRadius: '$radiusMax' }} />
```

##### Related Components
- **LoadingIndicator**: Animated dots indicator


---

### Media & Branding Components

---

#### Icon

**Import**: `import { Icon } from '@attentive/picnic'`
**Primitive**: SVG
**TypeScript**: Discriminated union on `mode`

System icon component. Uses a discriminated union: `mode="presentational"` requires `description`; `mode="decorative"` hides from screen readers.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| name | IconName | **required** | Icon identifier (e.g., `'Search'`, `'X'`, `'ChevronDown'`) |
| mode | `'presentational'` \| `'decorative'` | `'decorative'` | Accessibility mode |
| description | string | — | **Required** when `mode="presentational"` |
| size | `'extraSmall'` \| `'small'` \| `'medium'` \| `'large'` | `'medium'` | Icon size |
| color | IconColor | `'inherit'` | Icon fill color |
| css | PicnicCss | — | Stitches style object |

##### Size Scale

| Size | Dimensions |
|------|-----------|
| extraSmall | `$size4` (16px) |
| small | `$size5` (20px) |
| medium | `$size6` (24px) |
| large | `$size7` (28px) |

##### Color Variants

| Color | Fill Token |
|-------|-----------|
| default | `$iconDefault` |
| subdued | `$iconSubdued` |
| success | `$iconSuccess` |
| warning | `$iconWarning` |
| critical / error | `$iconCritical` |
| info | `$iconInfo` |
| guidance | `$iconGuidance` |
| disabled | `$iconDisabled` |
| inverted | `$iconInverted` |
| decorative1-4 | `$iconDecorative1`-`$iconDecorative4` |
| inherit | `currentColor` |

##### Usage

```tsx
// Decorative icon (hidden from screen readers)
<Icon name="Search" mode="decorative" size="medium" />

// Presentational icon (accessible)
<Icon name="CircleCheckmark" mode="presentational" description="Success" color="success" />

// In a layout
<Box css={{ display: 'flex', alignItems: 'center', gap: '$space2' }}>
  <Icon name="Mail" size="small" color="subdued" />
  <Text variant="caption">email@example.com</Text>
</Box>
```

##### Related Components
- **IconButton**: Clickable icon
- **IconCircle**: Icon in colored circle
- **ThirdPartyIcon**: External brand icons

---

#### ThirdPartyIcon

**Import**: `import { ThirdPartyIcon } from '@attentive/picnic'`
**Primitive**: SVG

Icons for third-party brands and services. Same discriminated union pattern as Icon.

##### Props

Same as Icon but uses `ThirdPartyIconName` for the `name` prop.

##### Usage

```tsx
<ThirdPartyIcon name="Instagram" size="medium" mode="presentational" description="Instagram" />
```

##### Related Components
- **Icon**: System icons
- **ThirdPartyIconCircle**: Third-party icon in circle

---

#### IconCircle

**Import**: `import { IconCircle } from '@attentive/picnic'`
**Primitive**: Styled `div` + Icon

Icon displayed inside a colored circle background. Icon color automatically adapts to circle color.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| iconName | IconName | **required** | Icon to display |
| size | `'extraSmall'` \| `'small'` \| `'medium'` \| `'large'` | `'medium'` | Circle size |
| color | `'default'` \| `'inverted'` \| `'brand'` \| `'success'` \| `'warning'` \| `'critical'` \| `'decorative1'`-`'decorative4'` \| `'disabled'` \| `'magic'` | `'default'` | Circle background color |
| css | PicnicCss | — | Stitches style object |

##### Size Scale

| Size | Dimensions |
|------|-----------|
| extraSmall | `$size6` (24px) |
| small | `$size8` (32px) |
| medium | `$size10` (40px) |
| large | `$size12` (48px) |

##### Color → Icon Color Mapping

| Circle Color | Icon Color |
|-------------|-----------|
| default (dark bg) | inverted (white) |
| inverted (white bg) | default (dark) |
| brand | default |
| magic | default |
| success/warning/critical/decorativeN | Same as circle |

##### Usage

```tsx
<IconCircle iconName="Mail" color="default" size="medium" />
<IconCircle iconName="CircleCheckmark" color="success" size="large" />
<IconCircle iconName="Lightbulb" color="magic" />
```

##### Related Components
- **Icon**: Icon without circle
- **ThirdPartyIconCircle**: For third-party icons

---

#### ThirdPartyIconCircle

**Import**: `import { ThirdPartyIconCircle } from '@attentive/picnic'`
**Primitive**: Styled `div` + ThirdPartyIcon

Third-party brand icon inside a colored circle.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| iconName | ThirdPartyIconName | **required** | Third-party icon name |
| size | `'extraSmall'` \| `'small'` \| `'medium'` \| `'large'` | `'medium'` | Circle size |
| color | `'default'` \| `'inverted'` | `'default'` | Circle background |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<ThirdPartyIconCircle iconName="Instagram" color="default" size="medium" />
```

---

#### ResponsiveImage

**Import**: `import { ResponsiveImage } from '@attentive/picnic'`
**Primitive**: Radix AspectRatio

Image or video with maintained aspect ratio. Polymorphic — renders `img` or `video`.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| ratio | number | — | Aspect ratio (e.g., `16/9`, `1`) |
| as | `'img'` \| `'video'` | `'img'` | Media element type |
| src | string | — | Media source URL |
| alt | string | — | Image alt text |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<ResponsiveImage ratio={16/9} src="/banner.jpg" alt="Campaign banner" />
<ResponsiveImage ratio={1} src="/avatar.jpg" alt="User avatar" css={{ borderRadius: '$radiusMax' }} />
<ResponsiveImage as="video" ratio={16/9} src="/demo.mp4" />
```

##### Related Components
- **ImagePreview**: Image with remove action
- **StandardDialog.HeroImage**: Dialog hero image

---

#### ImagePreview

**Import**: `import { ImagePreview } from '@attentive/picnic'`
**Primitive**: Custom (img + loading + remove button)

Image preview thumbnail with loading state and optional remove button.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | string \| null | **required** | Image URL |
| altText | string | **required** | Alt text |
| size | `'small'` \| `'medium'` \| `'large'` | `'large'` | Preview size |
| onRemove | () => void | — | Remove handler (shows delete button) |
| css | PicnicCss | — | Stitches style object |

##### Size Scale

| Size | Dimensions |
|------|-----------|
| small | `$size6` (24px) |
| medium | `$size8` (32px) |
| large | `$size12` (48px) |

##### Usage

```tsx
<ImagePreview src={imageUrl} altText="Preview" size="large" onRemove={() => clearImage()} />
<ImagePreview src={null} altText="Loading" size="medium" />
```

##### Related Components
- **ResponsiveImage**: Aspect-ratio image
- **FileInput**: File upload input

---

#### Logomark

**Import**: `import { Logomark } from '@attentive/picnic'`
**Primitive**: SVG (memoized)

Attentive logomark (circular icon mark).

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | — | SVG title for accessibility |
| variant | LogoVariant | `'default'` | Logo color variant |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<Logomark title="Attentive" css={{ width: '$size10', height: '$size10' }} />
```

---

#### Wordmark

**Import**: `import { Wordmark } from '@attentive/picnic'`
**Primitive**: SVG (memoized)

Attentive wordmark (text logo). Uses `currentColor` for fill.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | — | SVG title for accessibility |
| color | PicnicColorsToken \| `'inherit'` | `'inherit'` | Fill color |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<Wordmark title="Attentive" css={{ width: '120px', color: '$textDefault' }} />
```

---

#### Emoji

**Import**: `import { Emoji } from '@attentive/picnic'`
**Primitive**: Styled `span`

Accessible emoji wrapper with `role="img"` and `aria-label`.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| label | string | **required** | Accessible label for the emoji |
| decorational | boolean | false | If true, hides from screen readers |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<Emoji label="celebration">🎉</Emoji>
<Emoji label="warning" decorational>⚠️</Emoji>
```


---

### Utility Components

---

#### ContinuousScroll

**Import**: `import { ContinuousScroll } from '@attentive/picnic'`
**Primitive**: IntersectionObserver

Infinite scroll container. Triggers `onLoadMore` when the scroll sentinel becomes visible.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| onLoadMore | () => void | **required** | Load more data handler |
| isLoading | boolean | **required** | Currently loading |
| hasMore | boolean | **required** | More data available |
| direction | `'vertical'` \| `'horizontal'` | `'vertical'` | Scroll direction |
| threshold | 0-1 (0.1 increments) | 0.1 | IntersectionObserver threshold |
| css | PicnicCss | — | Stitches style object |

##### Usage

```tsx
<ContinuousScroll
  onLoadMore={fetchNextPage}
  isLoading={isFetching}
  hasMore={hasNextPage}
  css={{ maxHeight: '600px' }}
>
  {items.map((item) => (
    <Card key={item.id} css={{ mb: '$space4' }}>
      <Text>{item.name}</Text>
    </Card>
  ))}
</ContinuousScroll>
```

##### Related Components
- **Paginator**: Page-based alternative
- **LoadingIndicator**: Shown during loading

---

#### Link

**Import**: `import { Link } from '@attentive/picnic'`
**Primitive**: Styled `a` (`react-polymorphic-box`)

Styled anchor link with underline and hover colors. Polymorphic for use with routing libraries.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | `'default'` \| `'inverted'` | `'default'` | Color variant |
| href | string | — | Link URL |
| as | React.ElementType | `'a'` | Polymorphic element (e.g., React Router Link) |
| css | PicnicCss | — | Stitches style object |

##### Variant Styles

| Variant | Color | Hover |
|---------|-------|-------|
| default | `$textLink` | `$textHover` |
| inverted | `$textInverted` | `$textInverted` |

##### Usage

```tsx
<Link href="/dashboard">Go to Dashboard</Link>
<Link href="/docs" variant="inverted">Documentation</Link>

// With React Router
import { Link as RouterLink } from 'react-router-dom';
<Link as={RouterLink} to="/settings">Settings</Link>
```

##### Related Components
- **Button**: For actions (not navigation)
- **Breadcrumbs.Item**: Breadcrumb links

---

#### Card

**Import**: `import { Card } from '@attentive/picnic'`
**Primitive**: Styled `div`

Container with border, shadow, and optional interactive hover effects.

##### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| interactive | boolean | false | Enable hover lift/shadow effect |
| active | boolean | false | Show selected border |
| css | PicnicCss | — | Stitches style object |

##### Variant Behavior

| Variant | Value | Effect |
|---------|-------|--------|
| interactive | true | Hover: shadow increases + translateY(-2px). Active: shadow decreases + translateY(2px) |
| active | true | Border changes to `$borderSelectedToggle` |

Default styles: `$bgDefault` background, `$borderDefault` border, `$radius2` corners, `$shadow1`, `$space8` padding.

##### Usage

```tsx
// Static card
<Card>
  <Heading variant="sm">Campaign Stats</Heading>
  <Text css={{ mt: '$space2' }}>Total sends: 1,234</Text>
</Card>

// Interactive card
<Card interactive onClick={() => navigate(`/campaign/${id}`)}>
  <Text>Click to view details</Text>
</Card>

// Selected state
<Card active={isSelected} interactive onClick={() => toggle(id)}>
  <Text>Selectable card</Text>
</Card>
```

##### Related Components
- **Box**: Lower-level container
- **Table.BodyFocusableRow**: Interactive table rows

---

## Compound Component Map

Complete list of all compound components and their sub-components.

| Parent | Sub-Components |
|--------|---------------|
| **Form** | `.FormField`, `.Label`, `.Checkbox`, `.DatePicker`, `.ErrorText`, `.HelperText`, `.MultiSelect`, `.RadioGroup`, `.SearchableSelect`, `.Select`, `.Switch`, `.TextArea`, `.TextInput`, `.ResetButton`, `.SubmitButton` |
| **Table** | `.Header`, `.HeaderRow`, `.HeaderCell`, `.SortableHeaderCell`, `.Body`, `.BodyRow`, `.BodyFocusableRow`, `.BodyCell`, `.RowSelectorCell`, `.HeaderSelectorCell`, `.FocusWrapper` |
| **Dialog** | `.Trigger`, `.Content`, `.Header`, `.Close`, `.CloseButton` |
| **StandardDialog** | `.Trigger`, `.Content`, `.Header`, `.Heading`, `.HeroImage`, `.Body`, `.Footer`, `.Close` |
| **Drawer** | `.Trigger`, `.Content`, `.Header`, `.CloseButton` |
| **StandardDrawer** | `.Trigger`, `.Content`, `.Header`, `.Body`, `.Footer`, `.Close` |
| **DropdownMenu** | `.Trigger`, `.Button`, `.Content`, `.Item`, `.TextItem`, `.Label`, `.Separator`, `.Sub`, `.SubContent`, `.SubMenuTriggerItem`, `.UnstyledItem` |
| **Popover** | `.Trigger`, `.Anchor`, `.Content`, `.CloseButton`, `.CloseIconButton` |
| **Select** | `.Item`, `.IconItem`, `.ThirdPartyIconItem`, `.Group`, `.Value` |
| **MultiSelect** | `.Item`, `.Group` |
| **SearchableSelect** | `.Item`, `.Group` |
| **Banner** | `.Image`, `.Heading`, `.Text`, `.Action` |
| **Accordion** | `.Item`, `.Header`, `.HeaderIcon`, `.Content` |
| **Tooltip** | `.Provider`, `.Trigger`, `.Content` |
| **TabGroup** | `.List`, `.Tab`, `.Panel` |
| **FormField** | `.Label`, `.HelperText`, `.ErrorText`, `.IconPopover` |
| **ContainedLabel** | `.Icon`, `.Tooltip` |
| **Breadcrumbs** | `.Item` |
| **Paginator** | `.Label`, `.ButtonGroup` |
| **StepTracker** | `.Step` |
| **List** | `.Item` |
| **Grid** | `.Cell` |
| **ButtonGroup** | `.Item`, `.IconItem` |
| **ButtonGroupNext** | `.Item`, `.IconItem` |
| **Checkbox** | `.CheckboxItem` |
| **RadioGroup** | `.Item` |
| **TextWithOverflowTooltip** | `.Trigger`, `.TextItem`, `.Content`, `.TooltipText` |
| **PageLayout.Header** | `.Heading`, `.Description`, `.Button`, `.TextContainer`, `.ButtonContainer` |

---

## Cross-Cutting Pattern Tables

### Variant Matrix

Which variant names are supported by which components:

| Variant Value | Components |
|--------------|-----------|
| `primary` | Button, IconButton, Badge |
| `secondary` | Button, IconButton |
| `subdued` | Button, IconButton, Popover (via CloseIconButton) |
| `inverted` | Button, IconButton, Text, Heading, Link, ContainedLabel (`overMedia`) |
| `success` | Text, Heading, ContainedLabel, ProgressBar, Banner, IconCircle |
| `warning` | Text, Heading, ContainedLabel, ProgressBar, Banner, Accordion, IconCircle |
| `error` | Tag, TextInput (state), TextArea (state), Select (state), Banner, Accordion, ProgressBar |
| `critical` | Text, Heading, ContainedLabel, IconCircle |
| `info` | Text, Heading, ContainedLabel, Banner, Accordion |
| `neutral` | Text, Heading, ContainedLabel, Banner, Accordion, Badge |
| `guidance` | Text, Heading, Banner, Popover |
| `decorative1`-`4` | Text, Heading, ContainedLabel, IconCircle |
| `magic` | Badge, ContainedLabel, IconCircle |

### Size Scale Differences

Different components use different size scales:

| Scale | Components | Values |
|-------|-----------|--------|
| **Input sizes** | TextInput, TextArea, Select, MultiSelect, SearchBar, SearchableSelect | `small`, `normal` |
| **Button sizes** | Button | `small`, `medium`, `large` |
| **IconButton sizes** | IconButton | `extraSmall`, `small`, `medium`, `large` |
| **Icon sizes** | Icon, ThirdPartyIcon | `extraSmall`, `small`, `medium`, `large` |
| **IconCircle sizes** | IconCircle, ThirdPartyIconCircle | `extraSmall`, `small`, `medium`, `large` |
| **ImagePreview sizes** | ImagePreview | `small`, `medium`, `large` |
| **Tag sizes** | Tag | `small`, `normal` |
| **Heading sizes** | Heading | `page`, `xl`, `lg`, `md`, `sm`, `subheading` |
| **Text sizes** | Text | `lede`, `body`, `caption`, `micro` |

### Radix UI-Based Components

Components built on Radix UI primitives (get free keyboard navigation, focus management, ARIA):

| Picnic Component | Radix Primitive |
|-----------------|----------------|
| Dialog | `@radix-ui/react-dialog` |
| StandardDialog | `@radix-ui/react-dialog` |
| Drawer | `@radix-ui/react-dialog` |
| StandardDrawer | `@radix-ui/react-dialog` |
| Popover | `@radix-ui/react-popover` |
| DropdownMenu | `@radix-ui/react-dropdown-menu` |
| Tooltip | `@radix-ui/react-tooltip` |
| TabGroup | `@radix-ui/react-tabs` |
| Accordion | `@radix-ui/react-accordion` |
| Checkbox | `@radix-ui/react-checkbox` |
| RadioGroup | `@radix-ui/react-radio-group` |
| Switch | `@radix-ui/react-switch` |
| Separator | `@radix-ui/react-separator` |
| ProgressBar | `@radix-ui/react-progress` |
| ResponsiveImage | `@radix-ui/react-aspect-ratio` |
| FormField.Label | `@radix-ui/react-label` |

### Downshift-Based Components

Components built on Downshift (custom keyboard-accessible select):

| Picnic Component | Downshift Hook |
|-----------------|---------------|
| Select | `useSelect` |
| MultiSelect | `useMultipleSelection` + `useCombobox` |
| SearchableSelect | `useCombobox` |

### Formik-Based Components

Components that integrate with Formik (used inside `<Form>`):

| Component | Formik Connection |
|-----------|------------------|
| Form | Wraps `<Formik>` + `<FormikForm>` |
| Form.TextInput | `useField(name)` |
| Form.TextArea | `useField(name)` |
| Form.Select | `useField(name)` |
| Form.MultiSelect | `useField(name)` |
| Form.SearchableSelect | `useField(name)` |
| Form.Checkbox | `useField(name)` |
| Form.RadioGroup | `useField(name)` |
| Form.Switch | `useField(name)` |
| Form.DatePicker | `useField(name)` |
| Form.ErrorText | `useField(name)` — displays error |
| Form.SubmitButton | `useFormikContext()` — disables during submit |
| Form.ResetButton | `useFormikContext()` — resets form |

---

*Document version: 1.0 | Generated from `@attentive/picnic` source at `/libs/picnic/src/components/`*
