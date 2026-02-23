# 08 - Source Exploration: Picnic Design System

## Directory Tree (Top 3 Levels)

```
libs/picnic/
├── @types/
│   └── mdx.d.ts
├── fonts/
│   ├── assets/                     # Font files
│   ├── fonts.ts
│   └── index.ts
├── node_modules/
├── scripts/
│   └── figma/                      # Icon generation from Figma
│       └── commands/generate-icons.js
├── test/
│   ├── index.ts
│   └── pointer-events.ts
├── src/
│   ├── components/                 # 57 component directories + index.ts
│   │   ├── Accordion/
│   │   ├── Badge/
│   │   ├── Banner/
│   │   ├── ... (57 total)
│   │   ├── Wordmark/
│   │   └── index.ts               # Re-exports all components
│   ├── docs/
│   │   └── overview/
│   │       ├── custom-themes.mdx
│   │       └── getting-started.mdx
│   ├── storybook/
│   │   ├── components/
│   │   ├── custom-theme.stories.tsx
│   │   ├── decorators.tsx
│   │   ├── index.tsx
│   │   ├── stitches-canary.stories.tsx
│   │   └── utils.tsx               # DisplayNamed type, commonArgTypes
│   ├── themes/
│   │   ├── index.ts
│   │   ├── theme-2021.ts           # PRIMARY THEME (~300 lines, all tokens)
│   │   └── theme-dark.ts           # Dark overrides (extends theme2021)
│   ├── transformers/
│   │   ├── index.ts
│   │   └── TabGroupTransformer/
│   ├── utils/
│   │   ├── browser.ts
│   │   ├── composite-component.ts
│   │   ├── focus-visible.ts
│   │   ├── grid.ts
│   │   ├── index.ts
│   │   ├── list.ts
│   │   ├── max-lines.ts
│   │   ├── optional-type.ts
│   │   ├── popper.ts
│   │   ├── radix-button-input-props.ts
│   │   ├── responsive-props.ts
│   │   ├── space.ts                # Shorthand utils: p, pt, px, m, ml, etc.
│   │   ├── transition.ts
│   │   └── visually-hidden.ts
│   ├── index.ts                    # Master barrel: components, transformers, stitches.config, storybook, themes, utils, media
│   ├── media.ts                    # Breakpoints: bp1-bp4 (640-1280px)
│   └── stitches.config.ts          # createStitches config, theme application
├── package.json
├── tsconfig.json
├── vitest.config.mts
├── vitest.setup.ts
├── Tiltfile
└── README.md
```

## Full Component List (57 components)

From `src/components/index.ts`:

Accordion, Badge, Banner, Box, Breadcrumbs, Button, ButtonBar, ButtonGroup, Card, Checkbox, ContainedLabel, ContinuousScroll, DatePicker, Dialog, Drawer, DropdownMenu, Emoji, FileInput, FooterLayout, Form, FormField, Grid, Heading, Icon, IconCircle, IconPopover, ImagePreview, InputGroup, Link, List, LoadingIndicator, LoadingPlaceholder, Logomark, PageLayout, Paginator, PickerButton, Popover, ProgressBar, RadioGroup, ResponsiveImage, SearchBar, Select, Separator, Stack, StepTracker, Switch, TabGroup, Table, Tag, TagSelector, Text, TextArea, TextInput, TextWithOverflowTooltip, TimePicker, Tooltip, Wordmark

## Component File Patterns

### Pattern 1: Simple Stitches Component (Badge, Heading, Separator)

```
ComponentName/
├── ComponentName.tsx        # styled() call with variants
├── ComponentName.stories.tsx
├── guidance.mdx             # Optional Storybook docs
└── index.ts                 # export * from './ComponentName'
```

**Example: Badge.tsx**
- Component defined as `const Badge = styled('em', { variants: { ... }, defaultVariants: { ... } })`
- `Badge.displayName = 'Badge'`
- Type exported as `type BadgeVariant = VariantProps<typeof Badge>['variant']`
- Variants defined inline in the `styled()` call: `variant` (active, standard, primary, error, magic), `position` (inline, raised)

**Example: Heading.tsx**
- Same pattern: `const Heading = styled('h1', { variants: { variant: {...}, color: {...} }, defaultVariants: {...} })`
- Variants: `variant` (page, xl, lg, md, sm, subheading), `color` (default, subdued, inverted, success, warning, critical, info, decorative1-4)

### Pattern 2: Wrapped Component with forwardRef (TextInput, TextArea, Tag)

```
ComponentName/
├── ComponentName.tsx        # styled() primitive + forwardRef wrapper
├── ComponentName.stories.tsx
└── index.ts
```

**Example: TextInput.tsx**
- `TextInputPrimitive = styled('input', { variants: { state: { normal, error }, size: { small, normal } } })`
- `TextInputComponent = React.forwardRef(...)` wrapping the primitive
- `TextInput = TextInputComponent as ComponentType & DisplayNamed`
- Exported styles object `textInputStyles` reused by other input-like components
- Props type: `type TextInputProps = React.ComponentProps<ComponentType>`

### Pattern 3: Compound Component (Table, Dialog, StandardDialog, Checkbox, Select)

```
ComponentName/
├── ComponentName.tsx        # Main component + sub-components + CompositeComponent type
├── SubComponent.tsx         # Optional separate sub-component files
├── ComponentName.stories.tsx
├── ComponentName.test.tsx
├── guidance.mdx             # Optional
└── index.ts
```

**Example: Table.tsx** (26 compound components use this pattern)
- Interface `TableProps` defined explicitly (not derived from stitches)
- Sub-components defined as `React.FC` or `React.forwardRef` inline
- Internal styled primitives: `BodyCellPrimitive = styled('div', { variants: { align: {...} } })`
- Composite type defined:
  ```ts
  type ComponentType = typeof TablePrimitive & DisplayNamed;
  interface CompositeComponent extends ComponentType {
    Header: typeof Header & DisplayNamed;
    // ...
  }
  const Table = TablePrimitive as CompositeComponent;
  Table.Header = Header;
  Table.displayName = 'Table';
  Table.Header.displayName = 'Table.Header';
  ```
- Sub-components attached via `Component.Sub = Sub` pattern

**Example: Dialog.tsx** (Radix-based compound)
- Wraps `@radix-ui/react-dialog` primitives
- Internal styled components: `DialogOverlay = styled(DialogPrimitive.Overlay, { variants: { layout: { dialog, portalled } } })`
- Sub-components: Header, Close, CloseButton, Trigger, Content
- Also exports `StandardDialog` from separate file (higher-level compound with Header, Heading, HeroImage, Body, Footer, Trigger, Close, Content)

### Pattern 4: Multi-export Directory (Button, Select, Icon)

```
ComponentName/
├── ComponentName.tsx
├── VariantComponent.tsx     # Additional related components
├── types.ts                 # Shared types (Select only)
├── helpers.ts
├── ComponentName.stories.tsx
├── VariantComponent.stories.tsx
└── index.ts                 # Selective named exports
```

**Example: Button/index.ts**
```ts
export { Button, ButtonStyles } from './Button';
export type { ButtonProps } from './Button';
export { IconButton } from './IconButton';
export type { IconButtonProps } from './IconButton';
```

**Example: Select/index.ts**
- Exports Select, MultiSelect, SearchableSelect components
- Also exports internal helpers: extractItemsHook, Tags, search, select-helpers, NestedListComponents, StyledSelectComponents
- Types exported separately from `./types`

### Pattern 5: Polymorphic Components (Button, IconButton, Link, Breadcrumbs, PageHeader)

```ts
const Button: PolymorphicComponent<ButtonProps, 'button'> = React.forwardRef(...)
```
- Uses `react-polymorphic-box` for polymorphic `as` prop
- 5 components use this pattern

## Where Each Type of Data Lives

### Props / Interfaces

| Pattern | Location | Example |
|---------|----------|---------|
| Stitches-derived props | Inline in styled() call | Badge, Heading, Separator |
| Explicit interface | Same file as component | `TableProps` in Table.tsx |
| Separate types file | `types.ts` in component dir | Only Select has this |
| ComponentProps extraction | Same file | `TextInputProps = React.ComponentProps<typeof TextInputPrimitive>` |
| VariantProps extraction | Same file | `BadgeVariant = VariantProps<typeof Badge>['variant']` |

**Key finding**: Most props are NOT explicitly typed as interfaces. They are derived from stitches `styled()` calls. The actual prop types are the **variants** object within the styled() config.

### Stitches Variants

All variant definitions live **inline within `styled()` calls** in the component `.tsx` file:

```ts
const Component = styled('div', {
  // base styles...
  variants: {
    variantName: {
      value1: { /* styles */ },
      value2: { /* styles */ },
    },
  },
  compoundVariants: [ /* conditional combos */ ],
  defaultVariants: { variantName: 'value1' },
});
```

**Components with `compoundVariants`**: Button, IconButton (and likely others for disabled states).

### Design Tokens

**Primary source**: `src/themes/theme-2021.ts`

Token categories and counts:
| Category | Token Count | Example |
|----------|-------------|---------|
| borderWidths | 4 | `borderWidth0` - `borderWidth3` |
| colors | ~200 | Perceptual: `grayscale0-1000`, `yellow100-700`, `red100-800`, etc. Functional: `bgDefault`, `textDefault`, `borderDefault`, etc. |
| fonts | 2 | `display` (Ginto Nord), `body` (Ginto Normal) |
| fontSizes | 7 | `fontSize1` (0.75rem) - `fontSize7` (2rem) |
| fontWeights | 2 | `regular` (400), `bold` (500) |
| letterSpacings | 3 | `letterSpacing0-2` |
| lineHeights | 7 | `lineHeight1` (1) - `lineHeight7` (1.5) |
| radii | 4 | `radius1` (4px) - `radiusMax` (9999px) |
| shadows | 7 | `focus`, `inputFocus`, `drastic`, `shadow1-4` |
| sizes | 17 | `size0` (0) - `size16` (64px) + breakpoint widths |
| space | 17 | `space0` (0) - `space16` (64px) |
| zIndices | 6 | `layer0` (0) - `layerMax` (2147483647) |

**Dark theme** (`theme-dark.ts`): Extends theme2021, only overrides functional color tokens (~15 color overrides).

**Breakpoints** (`media.ts`): bp1 (640px), bp2 (768px), bp3 (1024px), bp4 (1280px)

**CSS Utilities** (`utils/`): Shorthand spacing (p, pt, px, m, ml, etc.), grid helpers, list styles, transitions, max-lines, focus-visible.

**Type exports from theme file**:
- `ThemeManifest` (full theme type)
- `PicnicColorsKey`, `PicnicColorsToken`
- `PicnicFontSizesKey`, `PicnicFontSizesToken`
- `PicnicSizesKey`, `PicnicSizesToken`
- `PicnicSpaceKey`, `PicnicSpaceToken`
- `PicnicShadowsKey`, `PicnicShadowsToken`

### Compound Components

26 files define `CompositeComponent` interfaces. The pattern is consistent:

```ts
type ComponentType = typeof PrimitiveComponent & DisplayNamed;
interface CompositeComponent extends ComponentType {
  SubA: typeof SubA & DisplayNamed;
  SubB: typeof SubB & DisplayNamed;
}
const Component = PrimitiveComponent as CompositeComponent;
Component.SubA = SubA;
Component.displayName = 'Component';
Component.SubA.displayName = 'Component.SubA';
```

Notable compound components:
- **Table**: Header, HeaderRow, HeaderCell, SortableHeaderCell, Body, BodyRow, BodyFocusableRow, BodyCell, RowSelectorCell, HeaderSelectorCell, FocusWrapper (11 subs)
- **StandardDialog**: Content, Header, Heading, HeroImage, Body, Footer, Trigger, Close (8 subs)
- **Dialog**: Header, Close, CloseButton, Trigger, Content (5 subs)
- **Select**: Select.Item, Select.Group, etc.
- **Checkbox**: Checkbox.CheckboxItem (used by Table)

### Exports

`src/components/index.ts` uses `export *` from each component directory. Each component directory's `index.ts` re-exports from the main component file(s).

The master `src/index.ts` exports:
- `./components` (all components)
- `./transformers`
- `./stitches.config` (styled, css, keyframes, globalCss, themes, etc.)
- `./storybook` (DisplayNamed type, decorators)
- `./themes` (theme2021, themeDark, color/size/space types)
- `./utils` (spacing shortcuts, responsive-props, composite-component, popper, etc.)
- `./media` (breakpoints, useBreakpoints)

### Icons

- **160 built-in icons** in `src/components/Icon/icon-set/icons/` (React SVG components)
- **30 third-party icons** in `src/components/Icon/icon-set/third-party-icons/`
- Icon names are derived from file names: `type IconName = keyof typeof iconSet`
- Icon colors defined in `StyledIconComponents.tsx`: default, subdued, success, warning, critical, error, neutral, info, guidance, disabled, inverted, decorative1-4, inherit
- Icon sizes: extraSmall, small, medium, large

## Existing Metadata / Documentation

### Storybook Stories (`.stories.tsx`)
Every component has at least one `.stories.tsx` file. Some have multiple (Table has 3: Table.stories, SortableGridTable.stories, TableExamples.stories).

### Guidance Files (`guidance.mdx`)
16 of 57 components have a `guidance.mdx` file (Storybook addon-docs format):
Badge, Banner, Box, Breadcrumbs, Button, Checkbox, ContainedLabel, ContinuousScroll, Dialog, Drawer, DropdownMenu, Form, Grid, Heading, Link, Tooltip

These contain:
- Brief component description
- ArgTypes table (auto-generated from stories)
- Canvas examples with toolbar

### Overview Docs
- `src/docs/overview/getting-started.mdx`
- `src/docs/overview/custom-themes.mdx`

### No Existing Codegen/Documentation Scripts
The only scripts are for Figma icon generation (`scripts/figma/`). No existing codegen for component docs, type extraction, or API reference generation.

## Deprecation Markers

**No `@deprecated` JSDoc tags found** anywhere in the source.

Deprecations are marked with inline comments only:
- Button: `// The 'basic' variant is deprecated in favor of 'secondary'` (in Button.tsx:213 and IconButton.tsx:217)
- No formal deprecation annotation system

## Noteworthy Patterns for Extraction

### 1. Variant Data is Extractable via AST
All variant definitions follow a consistent `styled('element', { variants: { ... } })` pattern. The variant keys and their possible values can be extracted by parsing the object literal inside `styled()`.

### 2. Compound Components are Type-Declared
The `CompositeComponent` interface in each compound component explicitly lists all sub-components. This interface is the authoritative source for the compound component structure.

### 3. Three Distinct Component Patterns
An extractor would need to handle:
- **Pure styled** (Badge, Heading): variants in styled() call
- **Wrapped styled** (TextInput, TextArea): styled primitive + forwardRef wrapper, explicit props interface
- **Custom FC** (Table, Dialog): manual React.FC/forwardRef, explicit props interfaces, no stitches variants on the main component (but sub-components may have stitches variants)

### 4. Props Are Heterogeneous
There is no single pattern for where props are defined. Some come from stitches VariantProps, some from explicit interfaces, some from ComponentProps utility type, and some from Radix UI primitives.

### 5. No Central Component Registry
There is no metadata file listing components. The only source of truth for the component list is `src/components/index.ts` which barrel-exports all directories.

### 6. displayName is Consistently Set
Every component and sub-component has `Component.displayName = 'Component'` set, which provides a reliable name mapping.

### 7. Theme Token Data is Plain Objects
The theme files export plain JavaScript objects (not functions), making token extraction trivial - just import or parse the object literal.

### 8. Icon Names are Generated
Icon names come from the icon-set directory file names. The `iconSet.ts` file just re-exports the directory, and `IconName` is derived with `keyof typeof iconSet`.

### 9. Radix UI Wrapper Pattern
Components wrapping Radix primitives (Dialog, Accordion, Checkbox, DropdownMenu, Popover, RadioGroup, Switch, TabGroup, Tooltip) extend Radix props but often don't re-declare them explicitly - they use `...rest` spread patterns.

### 10. CSS Utils as Stitches Utils
The `utils/space.ts` defines shorthand CSS properties (p, px, m, ml, etc.) that are registered as Stitches utils and usable in any `css` prop. These are NOT standard CSS properties but Picnic-specific shorthands.
