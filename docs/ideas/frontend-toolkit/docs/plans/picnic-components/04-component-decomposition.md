# Proposal 04: Component Decomposition

**Author**: Component Decomposer Agent
**Task**: #4 — Break down 57 components into categorized references and problem-oriented skills
**Status**: Draft

---

## Overview

This proposal maps all 57 Picnic components to exactly one primary location — either a **problem-oriented skill** (for complex compound components with multi-step patterns) or a **categorized reference file** (for simpler standalone components). The architecture follows a hybrid model:

- **Foundation skills** (tokens, Stitches, layout) handle cross-cutting concerns — designed by a separate agent
- **Problem-oriented skills** (this proposal, Part 1) handle complex compositions that require workflow guidance
- **Categorized reference files** (this proposal, Part 2) handle simple standalone components grouped by domain

The guiding principle: a component belongs in a **skill** when using it correctly requires understanding multi-component orchestration, compound sub-component hierarchies, state management integration, or non-obvious patterns. A component belongs in a **reference file** when a props table + usage example + variant list is sufficient.

---

## Part 1: Problem-Oriented Skills

### 1. `data-table` — Building Data Tables

**Problem it solves**: "I need to display tabular data with sorting, selection, pagination, status indicators, and action menus."

#### Component List

| Component | Role in Skill |
|-----------|---------------|
| Table (11 sub-components) | Core — entire compound hierarchy |
| Paginator (3 sub-components) | Pagination controls for tables |
| ContinuousScroll | Infinite scroll alternative to pagination |
| Badge | Status/count annotations within cells |
| Tag | Deletable tags within cells |
| ContainedLabel (3 sub-components) | Status labels within cells |
| DropdownMenu (11 sub-components) | Row action menus |
| IconButton | Row action buttons |
| SearchBar | Table filtering |

#### Content Outline

| Section | Content | Est. Lines |
|---------|---------|------------|
| **When to use** | Decision tree: Table vs List vs Card grid | 15 |
| **Table anatomy** | Full compound hierarchy (11 sub-components), column sizing (number, array, columnSizes) | 40 |
| **Column configuration** | Equal columns, ratio columns, explicit CSS Grid sizes, alignment | 30 |
| **Sorting pattern** | SortableHeaderCell setup, sort state management, ascending/descending toggle | 35 |
| **Row selection pattern** | HeaderSelectorCell + RowSelectorCell, select-all logic, controlled checked state | 35 |
| **Clickable rows** | BodyFocusableRow with navigation, FocusWrapper for keyboard cells | 20 |
| **Cell content patterns** | Using Badge, Tag, ContainedLabel, IconButton, DropdownMenu inside cells | 40 |
| **Pagination** | Paginator integration (offset-based), custom layout with Paginator.Label + Paginator.ButtonGroup | 30 |
| **Infinite scroll** | ContinuousScroll as pagination alternative | 15 |
| **Filtering** | SearchBar above table, filter state management | 20 |
| **Empty/loading states** | LoadingPlaceholder rows, empty state messaging | 15 |
| **Full example** | Complete sortable, selectable, paginated table with status labels and row actions | 50 |
| **Constraints & pitfalls** | ARIA roles, CSS Grid implications, textVariant, column count mismatch | 15 |

**Estimated total**: ~360 lines
**Size budget**: 400 lines max

#### Reference Files Needed
- `data-display-ref.md` — Badge, Tag, ContainedLabel standalone usage
- `actions-ref.md` — IconButton, DropdownMenu standalone usage

#### Foundation Skill Dependencies
- `tokens` — color tokens for status variants ($bgSuccessDefault, $bgCriticalAccent, etc.)
- `stitches` — css prop for cell styling, responsive column patterns
- `layout` — Box for cell content layout, Stack for stacking content within cells

---

### 2. `form-builder` — Building Validated Forms

**Problem it solves**: "I need to build a form with Formik state management, Yup validation, and properly structured field layouts."

#### Component List

| Component | Role in Skill |
|-----------|---------------|
| Form (15 sub-components) | Core — Formik wrapper + all Form.* inputs |
| FormField (4 sub-components) | Field layout organizer (label + input + helpers) |
| TextInput | Standalone input (outside Form context) |
| TextArea | Standalone multi-line input |
| Select (5 sub-components) | Single-select dropdown |
| MultiSelect (2 sub-components) | Multi-select with tags |
| SearchableSelect (2 sub-components) | Searchable single-select |
| Checkbox (1 sub-component) | Checkbox with label |
| RadioGroup (2 sub-components) | Radio button group |
| Switch | Toggle switch |
| DatePicker | Single date input |
| DateRangePicker | Date range input |
| TimePicker | Time input |
| FileInput | File upload |
| InputGroup | Grouped inputs |
| TagSelector | Tag creation input |

#### Content Outline

| Section | Content | Est. Lines |
|---------|---------|------------|
| **When to use Form vs standalone** | Decision: Formik-managed form vs uncontrolled standalone inputs | 15 |
| **Form setup** | initialValues, onSubmit, validationSchema with Yup, enableReinitialize | 30 |
| **FormField layout** | Vertical vs horizontal layout, Label requirement indicators, HelperText, ErrorText, IconPopover | 35 |
| **Text inputs** | Form.TextInput, Form.TextArea, size/state variants, character counter | 25 |
| **Select inputs** | Form.Select with Item/IconItem/Group/Value, Form.MultiSelect, Form.SearchableSelect | 40 |
| **Boolean inputs** | Form.Checkbox, Form.RadioGroup, Form.Switch — patterns and when to use each | 30 |
| **Date/time inputs** | Form.DatePicker, DateRangePicker, TimePicker, Moment.js integration | 25 |
| **Specialized inputs** | FileInput, InputGroup (phone number pattern), TagSelector | 25 |
| **Validation patterns** | Yup schema patterns, conditional validation, custom validate function, field-level validation | 35 |
| **Accessing form state** | useForm<V>() hook, setFieldValue, resetForm, isSubmitting, dirty/touched | 25 |
| **Submit/reset** | Form.SubmitButton, Form.ResetButton, custom submit handlers, loading state | 20 |
| **Full example** | Complete multi-field form with validation, conditional fields, and error handling | 50 |
| **Standalone usage** | Using TextInput, Select, Checkbox etc. outside Form context for simple cases | 25 |
| **Constraints & pitfalls** | name prop matching, Form.* vs standalone, Formik re-render optimization | 15 |

**Estimated total**: ~395 lines
**Size budget**: 420 lines max

#### Reference Files Needed
- `actions-ref.md` — Button variants for custom submit buttons
- `typography-ref.md` — Text/Heading for form section headers

#### Foundation Skill Dependencies
- `tokens` — spacing tokens for form layout ($space4, $space6)
- `stitches` — css prop for custom field styling
- `layout` — Stack for field groups, Box for custom layouts, Grid for multi-column forms

---

### 3. `dialog-drawer` — Overlays, Modals, and Popovers

**Problem it solves**: "I need to display content in a modal, slide-in drawer, floating popover, or dropdown menu."

#### Component List

| Component | Role in Skill |
|-----------|---------------|
| Dialog (5 sub-components) | Low-level modal dialog |
| StandardDialog (8 sub-components) | Pre-structured modal with header/body/footer |
| Drawer (4 sub-components) | Low-level slide-in panel |
| StandardDrawer (6 sub-components) | Pre-structured drawer with header/body/footer |
| Popover (5 sub-components) | Floating content panel |
| DropdownMenu (11 sub-components) | Action menu dropdown |

#### Content Outline

| Section | Content | Est. Lines |
|---------|---------|------------|
| **Decision tree** | Dialog vs Drawer vs Popover vs DropdownMenu — when to use which | 25 |
| **StandardDialog** | Header/Heading/HeroImage/Body/Footer slots, Close button, ButtonBar footer | 40 |
| **Dialog** | Custom layouts, unstyled content, controlled open state, portal containers | 30 |
| **StandardDrawer** | Header/Body/Footer slots, Close button, default layout="auto" footer | 35 |
| **Drawer** | Custom layouts, slide animation (300ms), onCloseFinish callback, overlay control | 25 |
| **Popover** | Trigger/Anchor/Content, arrow/close configuration, side/align, default vs guidance variant | 30 |
| **DropdownMenu** | Full hierarchy: Trigger, Button, Content, Item/TextItem, Label, Separator, Sub-menus | 40 |
| **Controlled vs uncontrolled** | open/onOpenChange pattern, defaultOpen, trigger-based vs programmatic | 20 |
| **Composition patterns** | Form inside StandardDialog, Table inside Drawer, nested Popover in Dialog | 30 |
| **Overlay stacking** | Z-index layers ($layer0-$layerMax), portal behavior, multiple overlays | 15 |
| **Full examples** | Confirmation dialog, edit drawer, info popover, action dropdown | 45 |
| **Constraints & pitfalls** | Radix asChild on triggers, portal rendering, focus trapping, scroll locking | 15 |

**Estimated total**: ~350 lines
**Size budget**: 380 lines max

#### Reference Files Needed
- `actions-ref.md` — Button for dialog footer actions
- `typography-ref.md` — Heading for dialog/drawer titles

#### Foundation Skill Dependencies
- `tokens` — z-index tokens ($layer*), shadow tokens for elevation
- `stitches` — css prop for content sizing/styling
- `layout` — Box/Stack for dialog body layouts

---

### 4. `navigation` — Navigation Patterns

**Problem it solves**: "I need to implement page navigation, breadcrumbs, tab panels, step tracking, or pagination."

#### Component List

| Component | Role in Skill |
|-----------|---------------|
| Breadcrumbs (1 sub-component) | Hierarchical page navigation |
| TabGroup (3 sub-components) | Tabbed content panels |
| Paginator (2 sub-components) | Page-based data navigation |
| StepTracker (1 sub-component) | Multi-step wizard progress |

#### Content Outline

| Section | Content | Est. Lines |
|---------|---------|------------|
| **Decision tree** | Breadcrumbs vs TabGroup vs StepTracker vs Paginator — when to use which | 20 |
| **Breadcrumbs** | Item hierarchy, LinkProps on Items, auto-bold last item, routing integration | 25 |
| **TabGroup** | List/Tab/Panel structure, controlled vs defaultValue, keyboard navigation (arrow keys) | 35 |
| **StepTracker** | Step states (completed/active/incomplete), activeStep, clickable steps, inline vs stacked | 30 |
| **Paginator** | Offset-based pagination, totalItems/maxItemsPerPage, start/end buttons, custom layout with sub-components | 30 |
| **Combining patterns** | Breadcrumbs + TabGroup on a page, StepTracker in a Drawer, Paginator with Table | 25 |
| **Full examples** | Multi-step wizard with StepTracker, tabbed dashboard, breadcrumb-driven page | 40 |
| **Constraints & pitfalls** | TabGroup panel mounting, Radix Tabs accessibility, Paginator offset semantics | 15 |

**Estimated total**: ~220 lines
**Size budget**: 250 lines max

#### Reference Files Needed
- `typography-ref.md` — Link component (used in Breadcrumbs.Item)

#### Foundation Skill Dependencies
- `tokens` — border tokens for active states
- `layout` — Box/Stack for page layout composition with navigation

---

### 5. `feedback-notifications` — User Feedback and Loading States

**Problem it solves**: "I need to show banners, collapsible sections, tooltips, info popovers, or loading indicators."

#### Component List

| Component | Role in Skill |
|-----------|---------------|
| Banner (4 sub-components) | Notification banners (error, info, warning, success, neutral, guidance) |
| Accordion (4 sub-components) | Collapsible content sections |
| Tooltip (3 sub-components) | Hover/focus tooltips |
| IconPopover | Icon-triggered information popover |
| LoadingIndicator | Animated loading dots |
| LoadingPlaceholder | Shimmer skeleton placeholders |

#### Content Outline

| Section | Content | Est. Lines |
|---------|---------|------------|
| **Decision tree** | Banner vs Accordion vs Tooltip vs Popover — when to use which feedback pattern | 20 |
| **Banner** | Variant-specific icons, Heading/Text/Action slots, dismissible pattern, custom iconName | 35 |
| **Accordion** | Single vs multiple open, variant propagation, collapsible, HeaderIcon, animated content | 35 |
| **Tooltip** | Provider setup (app root), Trigger/Content, normal vs danger variant, side positioning | 30 |
| **IconPopover** | Convenience wrapper, default icon/description, custom positioning, vs FormField.IconPopover | 20 |
| **Loading states** | LoadingIndicator (inline, centered, in buttons), LoadingPlaceholder (text, cards, skeleton screens) | 30 |
| **Composition patterns** | Banner above page content, Accordion FAQ, Tooltip on disabled buttons, skeleton table rows | 25 |
| **Full examples** | Error banner with dismiss, FAQ accordion, form field with tooltip help, full skeleton page | 35 |
| **Constraints & pitfalls** | Tooltip.Provider requirement, non-interactive tooltip content, Accordion variant required prop | 10 |

**Estimated total**: ~240 lines
**Size budget**: 260 lines max

#### Reference Files Needed
- (self-contained — most feedback components are fully covered here)

#### Foundation Skill Dependencies
- `tokens` — variant color tokens ($bgCriticalDefault, $bgSuccessDefault, etc.)
- `stitches` — css prop for custom sizing of placeholders
- `layout` — Stack for skeleton layouts, Box for centered loading states

---

## Part 2: Categorized Reference Files

### 1. `actions-ref.md` — Action Components

#### Component List

| Component | Props Summary |
|-----------|--------------|
| Button | variant (primary/secondary/subdued/inverted), size (S/M/L), loading, polymorphic `as` |
| IconButton | iconName, description (required), variant, size (XS/S/M/L), iconColor |
| ButtonBar | layout (auto/stretch) |
| ButtonGroup | activeItem, compound: .Item(name, onClick), .IconItem(name, description) |
| ButtonGroupNext | Same as ButtonGroup with updated API |
| PickerButton | size (small/medium), state (normal/error), placeholder |

#### Format per Component
- Import statement
- Props table (name, type, default, description)
- Variant styles table (where applicable)
- Size scale table (where applicable)
- 2-3 usage examples
- Related components cross-reference

#### Estimated Size: ~250 lines

#### Referenced By Skills
- `form-builder` — Button for custom submit, PickerButton for date triggers
- `dialog-drawer` — Button for footer actions, IconButton for close buttons, DropdownMenu.Button
- `data-table` — IconButton for row actions
- `navigation` — ButtonGroup overlap with Paginator.ButtonGroup

---

### 2. `typography-ref.md` — Typography Components

#### Component List

| Component | Props Summary |
|-----------|--------------|
| Heading | variant (page/xl/lg/md/sm/subheading), color (9 options), semantic `as` (h1-h6) |
| Text | variant (lede/body/caption/micro), color (13 options), polymorphic `as` |
| TextWithOverflowTooltip | Compound: .Trigger, .TextItem, .Content, .TooltipText |
| Link | variant (default/inverted), href, polymorphic `as` (router integration) |

#### Format per Component
- Import statement
- Props table
- Variant/size typography scale table (font, size, weight, line-height)
- Color options table
- 2-3 usage examples
- Related components

#### Estimated Size: ~200 lines

#### Referenced By Skills
- `form-builder` — Text for helper text, Heading for form sections
- `dialog-drawer` — Heading for dialog/drawer titles
- `data-table` — Text for cell content
- `navigation` — Link for Breadcrumbs.Item, Heading for page titles
- `feedback-notifications` — Text in Banner/Tooltip content

---

### 3. `media-ref.md` — Media and Branding Components

#### Component List

| Component | Props Summary |
|-----------|--------------|
| Icon | name (IconName), mode (presentational/decorative), description, size (XS/S/M/L), color (15 options) |
| ThirdPartyIcon | Same as Icon with ThirdPartyIconName |
| IconCircle | iconName, size (XS/S/M/L), color (12 options), auto icon-color mapping |
| ThirdPartyIconCircle | iconName (ThirdPartyIconName), size, color (default/inverted) |
| ResponsiveImage | ratio, polymorphic as (img/video), src, alt |
| ImagePreview | src, altText, size (S/M/L), onRemove |
| Logomark | title, variant |
| Wordmark | title, color |
| Emoji | label (required), decorational |

#### Format per Component
- Import statement
- Props table
- Size/color variant tables (Icon and IconCircle have extensive ones)
- Accessibility notes (Icon discriminated union pattern)
- 1-2 usage examples
- Related components

#### Estimated Size: ~280 lines

#### Referenced By Skills
- `data-table` — Icon/IconButton in cells
- `form-builder` — Icon in form fields, Select.IconItem
- `dialog-drawer` — StandardDialog.HeroImage uses ResponsiveImage
- `feedback-notifications` — Icon in Banner, Accordion.HeaderIcon

---

### 4. `data-display-ref.md` — Data Display Components (Standalone)

#### Component List

| Component | Props Summary |
|-----------|--------------|
| Badge | variant (active/standard/primary/error/magic), position (inline/raised) |
| Tag | onDelete (required), size (small/normal), variant (default/error) |
| ContainedLabel | variant (11 options), compound: .Icon, .Tooltip |
| ProgressBar | total, value, variant (success/warning/error) |
| List | as (ul/ol), variant (unstyled), compound: .Item |

#### Format per Component
- Import statement
- Props table
- Variant styles table
- 2-3 usage examples (standalone use outside Table context)
- Related components

#### Estimated Size: ~180 lines

#### Referenced By Skills
- `data-table` — Badge, Tag, ContainedLabel used inside table cells
- `feedback-notifications` — ProgressBar in progress-related feedback

---

### 5. `utility-ref.md` — Utility Components

#### Component List

| Component | Props Summary |
|-----------|--------------|
| Card | interactive (boolean), active (boolean), hover lift/shadow effect |
| ContinuousScroll | onLoadMore, isLoading, hasMore, direction, threshold |
| Separator | orientation (horizontal/vertical), decorative, size (small/large) |
| PageLayout | Compound: PageLayout.Header (PageHeader) with .Heading, .Description, .Button, .TextContainer, .ButtonContainer |
| FooterLayout | Fixed footer for page-level actions |

#### Format per Component
- Import statement
- Props table
- Variant/behavior table
- 1-2 usage examples
- Related components

#### Estimated Size: ~200 lines

#### Referenced By Skills
- `data-table` — ContinuousScroll as pagination alternative, Card for card-grid view
- `navigation` — PageLayout for page structure
- `dialog-drawer` — FooterLayout for drawer/dialog footers

---

## Part 3: Component Coverage Matrix

### Primary Location (where the full reference lives)

| # | Component | Primary Location | Type |
|---|-----------|-----------------|------|
| 1 | Box | `layout` foundation skill | Foundation |
| 2 | Stack | `layout` foundation skill | Foundation |
| 3 | Grid | `layout` foundation skill | Foundation |
| 4 | PageLayout | `utility-ref.md` | Reference |
| 5 | FooterLayout | `utility-ref.md` | Reference |
| 6 | Separator | `utility-ref.md` | Reference |
| 7 | Heading | `typography-ref.md` | Reference |
| 8 | Text | `typography-ref.md` | Reference |
| 9 | TextWithOverflowTooltip | `typography-ref.md` | Reference |
| 10 | Link | `typography-ref.md` | Reference |
| 11 | Button | `actions-ref.md` | Reference |
| 12 | IconButton | `actions-ref.md` | Reference |
| 13 | ButtonBar | `actions-ref.md` | Reference |
| 14 | ButtonGroup | `actions-ref.md` | Reference |
| 15 | ButtonGroupNext | `actions-ref.md` | Reference |
| 16 | PickerButton | `actions-ref.md` | Reference |
| 17 | Form | `form-builder` skill | Skill |
| 18 | FormField | `form-builder` skill | Skill |
| 19 | TextInput | `form-builder` skill | Skill |
| 20 | TextArea | `form-builder` skill | Skill |
| 21 | Select | `form-builder` skill | Skill |
| 22 | MultiSelect | `form-builder` skill | Skill |
| 23 | SearchableSelect | `form-builder` skill | Skill |
| 24 | Checkbox | `form-builder` skill | Skill |
| 25 | RadioGroup | `form-builder` skill | Skill |
| 26 | Switch | `form-builder` skill | Skill |
| 27 | DatePicker | `form-builder` skill | Skill |
| 28 | DateRangePicker | `form-builder` skill | Skill |
| 29 | TimePicker | `form-builder` skill | Skill |
| 30 | FileInput | `form-builder` skill | Skill |
| 31 | InputGroup | `form-builder` skill | Skill |
| 32 | TagSelector | `form-builder` skill | Skill |
| 33 | SearchBar | `data-table` skill | Skill |
| 34 | Table | `data-table` skill | Skill |
| 35 | Badge | `data-display-ref.md` | Reference |
| 36 | Tag | `data-display-ref.md` | Reference |
| 37 | ContainedLabel | `data-display-ref.md` | Reference |
| 38 | ProgressBar | `data-display-ref.md` | Reference |
| 39 | StepTracker | `navigation` skill | Skill |
| 40 | List | `data-display-ref.md` | Reference |
| 41 | Breadcrumbs | `navigation` skill | Skill |
| 42 | TabGroup | `navigation` skill | Skill |
| 43 | Paginator | `navigation` skill | Skill |
| 44 | Dialog | `dialog-drawer` skill | Skill |
| 45 | StandardDialog | `dialog-drawer` skill | Skill |
| 46 | Drawer | `dialog-drawer` skill | Skill |
| 47 | StandardDrawer | `dialog-drawer` skill | Skill |
| 48 | Popover | `dialog-drawer` skill | Skill |
| 49 | DropdownMenu | `dialog-drawer` skill | Skill |
| 50 | Banner | `feedback-notifications` skill | Skill |
| 51 | Accordion | `feedback-notifications` skill | Skill |
| 52 | Tooltip | `feedback-notifications` skill | Skill |
| 53 | IconPopover | `feedback-notifications` skill | Skill |
| 54 | LoadingIndicator | `feedback-notifications` skill | Skill |
| 55 | LoadingPlaceholder | `feedback-notifications` skill | Skill |
| 56 | Icon | `media-ref.md` | Reference |
| 57 | ThirdPartyIcon | `media-ref.md` | Reference |
| — | IconCircle | `media-ref.md` | Reference |
| — | ThirdPartyIconCircle | `media-ref.md` | Reference |
| — | ResponsiveImage | `media-ref.md` | Reference |
| — | ImagePreview | `media-ref.md` | Reference |
| — | Logomark | `media-ref.md` | Reference |
| — | Wordmark | `media-ref.md` | Reference |
| — | Emoji | `media-ref.md` | Reference |
| — | Card | `utility-ref.md` | Reference |
| — | ContinuousScroll | `utility-ref.md` | Reference |

> **Note on count**: The original catalog lists 57 components but the Utility category in the index shows only 2 (ContinuousScroll, Link) while the detailed entries include Card (3 total). Media & Branding lists 9 components. The total number of unique named components across all categories is **60** (including Card, Link which appear in Utility). The matrix above accounts for every component entry in the catalog.

### Secondary References (cross-skill mentions)

Components that appear as secondary references in skills other than their primary location:

| Component | Primary Location | Secondary References In |
|-----------|-----------------|------------------------|
| Button | `actions-ref.md` | `form-builder` (submit), `dialog-drawer` (footer actions), `data-table` (row actions), `feedback-notifications` (Banner.Action) |
| IconButton | `actions-ref.md` | `data-table` (row actions), `dialog-drawer` (close buttons), `feedback-notifications` (IconPopover trigger) |
| Heading | `typography-ref.md` | `dialog-drawer` (dialog/drawer titles), `navigation` (page headings), `feedback-notifications` (Banner.Heading) |
| Text | `typography-ref.md` | All skills (used pervasively for content) |
| Link | `typography-ref.md` | `navigation` (Breadcrumbs.Item extends LinkProps) |
| Badge | `data-display-ref.md` | `data-table` (cell status annotations) |
| Tag | `data-display-ref.md` | `data-table` (cell tags), `form-builder` (MultiSelect renders tags) |
| ContainedLabel | `data-display-ref.md` | `data-table` (cell status labels) |
| DropdownMenu | `dialog-drawer` skill | `data-table` (row action menus) |
| Paginator | `navigation` skill | `data-table` (table pagination) |
| ContinuousScroll | `utility-ref.md` | `data-table` (infinite scroll alternative) |
| SearchBar | `data-table` skill | `form-builder` (standalone search input) |
| LoadingIndicator | `feedback-notifications` skill | `data-table` (loading states) |
| LoadingPlaceholder | `feedback-notifications` skill | `data-table` (skeleton table rows) |
| ProgressBar | `data-display-ref.md` | `feedback-notifications` (progress feedback) |
| Card | `utility-ref.md` | `data-table` (card grid alternative) |
| Tooltip | `feedback-notifications` skill | `dialog-drawer` (tooltip in popover), `data-table` (cell tooltips) |
| Icon | `media-ref.md` | All skills (used pervasively for iconography) |

---

## Summary Statistics

### Allocation by Type

| Location Type | Count | Components |
|---------------|-------|------------|
| Foundation skills (layout) | 3 | Box, Stack, Grid |
| Problem-oriented skills | 30 | Form system (16), Table/SearchBar (2), Overlays (6), Navigation (4), Feedback (6) |
| Categorized references | 27 | Actions (6), Typography (4), Media (9), Data Display (5), Utility (5) |
| **Total** | **60** | All components accounted for |

### Size Budget Summary

| Artifact | Est. Lines | Budget |
|----------|-----------|--------|
| `data-table` skill | 360 | 400 |
| `form-builder` skill | 395 | 420 |
| `dialog-drawer` skill | 350 | 380 |
| `navigation` skill | 220 | 250 |
| `feedback-notifications` skill | 240 | 260 |
| `actions-ref.md` | 250 | 280 |
| `typography-ref.md` | 200 | 230 |
| `media-ref.md` | 280 | 310 |
| `data-display-ref.md` | 180 | 210 |
| `utility-ref.md` | 200 | 230 |
| **Total** | **2,675** | **2,970** |

Compared to the monolithic skill (~3,400+ lines across SKILL.md + component-catalog.md), the decomposed total is roughly comparable but now organized by problem domain with no duplication of full references — secondary references are brief cross-links, not repeated content.

### Dependency Graph

```
Foundation Layer (separate proposal)
├── tokens
├── stitches
└── layout (Box, Stack, Grid)
    │
Problem-Oriented Skills
├── data-table ──────────── depends on: layout, tokens, stitches
│   ├── refs: actions-ref, data-display-ref, media-ref
│   └── cross-refs: navigation (Paginator), utility-ref (ContinuousScroll)
├── form-builder ────────── depends on: layout, tokens, stitches
│   ├── refs: actions-ref, typography-ref
│   └── cross-refs: data-display-ref (Tag in MultiSelect)
├── dialog-drawer ───────── depends on: layout, tokens, stitches
│   ├── refs: actions-ref, typography-ref
│   └── cross-refs: form-builder (forms in dialogs)
├── navigation ──────────── depends on: layout, tokens
│   ├── refs: typography-ref
│   └── cross-refs: data-table (Paginator)
└── feedback-notifications ─ depends on: layout, tokens, stitches
    └── refs: (self-contained)

Categorized Reference Files
├── actions-ref.md ─────── Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, PickerButton
├── typography-ref.md ──── Heading, Text, TextWithOverflowTooltip, Link
├── media-ref.md ───────── Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark, Emoji
├── data-display-ref.md ── Badge, Tag, ContainedLabel, ProgressBar, List
└── utility-ref.md ─────── Card, ContinuousScroll, Separator, PageLayout, FooterLayout
```

---

## Design Decisions and Rationale

### 1. SearchBar in `data-table` rather than `form-builder`

SearchBar is primarily used for filtering data, not for form submission. Its most common composition is above a Table for filtering rows. It's mentioned as a secondary reference in `form-builder` for standalone search use cases.

### 2. DropdownMenu in `dialog-drawer` as primary, cross-referenced in `data-table`

DropdownMenu is architecturally an overlay component (Radix DropdownMenu primitive, floating content, portal rendering). It shares patterns with Popover and Dialog. However, its most common use case is as a row action menu in tables, so `data-table` includes it as a secondary reference with usage examples specific to table rows.

### 3. Paginator in `navigation` as primary, cross-referenced in `data-table`

Paginator is a navigation component by nature. While most commonly paired with Table, its compound sub-components (Paginator.Label, Paginator.ButtonGroup) are usable independently for any paginated content. The `data-table` skill covers the Table + Paginator integration pattern specifically.

### 4. StepTracker in `navigation` rather than `feedback-notifications`

StepTracker indicates progress through a multi-step workflow, which is fundamentally a navigation concern (where am I in the flow?). ProgressBar handles quantitative progress and stays in `data-display-ref.md`.

### 5. ContinuousScroll in `utility-ref.md` rather than `data-table`

ContinuousScroll is a general-purpose infinite scroll container, not specific to tables. Its primary reference lives in `utility-ref.md`, but `data-table` covers the specific pattern of using it as a Paginator alternative.

### 6. Tooltip in `feedback-notifications` vs `dialog-drawer`

While Tooltip is technically an overlay (Radix primitive, floating content), its purpose is pure feedback — showing contextual information on hover. It groups naturally with Banner, Accordion, and IconPopover as user feedback mechanisms. The `dialog-drawer` skill focuses on interactive overlays that require user action (confirm, fill form, select option).

### 7. Layout primitives (Box, Stack, Grid) excluded from this proposal

These belong in the `layout` foundation skill per the architecture. They are cross-cutting concerns used by every other skill and reference file.
