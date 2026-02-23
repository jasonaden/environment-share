# Proposal 02: Use Case Analysis for Picnic Skill Decomposition

> **Author**: Use Case Analyst Agent
> **Date**: 2026-02-18
> **Status**: Draft for team review
> **Source**: SKILL.md (monolithic skill) + component-catalog.md (57 components)

## Methodology

This analysis identifies developer use cases from the perspective of someone building a SaaS product with Picnic. Rather than "I need the Table component," the framing is "I need to display tabular data with sorting." Each use case maps to the components it requires, a proposed skill name, complexity tier, and frequency.

---

## Section 1: Cross-Cutting Components

These components appear across nearly every use case. They should be part of a **foundation skill** rather than repeated in each problem-oriented skill.

| Component | Role | Appears In |
|-----------|------|-----------|
| Box | Layout primitive, flex containers, spacing | Every use case |
| Stack | Vertical/horizontal arrangement | Most use cases |
| Text | Body copy, labels, captions | Every use case |
| Heading | Section titles, page titles | Most use cases |
| Icon | Visual indicators, decorative elements | ~80% of use cases |
| Button | Primary/secondary actions | ~70% of use cases |
| IconButton | Compact actions (edit, delete, close) | ~60% of use cases |
| Separator | Visual dividers | ~40% of use cases |
| Link | Navigation text | ~30% of use cases |

**Recommendation**: Create a `picnic-foundations` skill covering Box, Stack, Text, Heading, Icon, Button, IconButton, Separator, Link, and the Stitches styling system (css prop, styled(), tokens). Every problem-oriented skill can assume the developer has access to this foundation.

---

## Section 2: Use Cases by Frequency

### Tier 1: Daily Use (core SaaS patterns)

---

#### UC-01: Display tabular data with sorting and actions

**Problem**: "I need to display a list of records (users, campaigns, orders) in rows and columns, with sortable headers and per-row actions."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-data-table` |
| **Primary components** | Table (11 sub-components), Paginator |
| **Supporting components** | ContainedLabel, Badge, IconButton, DropdownMenu, Checkbox (via Table.RowSelectorCell) |
| **Complexity** | Complex (6+ components) |
| **Frequency** | Daily |

**Sub-patterns covered**:
- Basic read-only table
- Table with sortable columns (SortableHeaderCell)
- Table with row selection (HeaderSelectorCell + RowSelectorCell)
- Table with clickable rows (BodyFocusableRow)
- Table with inline status indicators (ContainedLabel/Badge in cells)
- Table with per-row action menus (DropdownMenu/IconButton in cells)
- Table with pagination (Paginator below table)
- Table with custom column sizing (columnSizes prop)
- Table with infinite scroll (ContinuousScroll wrapping Table.Body)

---

#### UC-02: Build a validated form with mixed input types

**Problem**: "I need to build a form with text fields, selects, checkboxes, and validation that shows error messages."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-forms` |
| **Primary components** | Form (15 sub-components), FormField (4 sub-components) |
| **Supporting components** | TextInput, TextArea, Select, MultiSelect, SearchableSelect, Checkbox, RadioGroup, Switch, DatePicker, DateRangePicker, TimePicker, TagSelector, FileInput, InputGroup |
| **Complexity** | Complex (6+ components) |
| **Frequency** | Daily |

**Sub-patterns covered**:
- Simple text form (Form + Form.TextInput + Form.Label + Form.ErrorText)
- Form with dropdown selection (Form.Select, Form.MultiSelect, Form.SearchableSelect)
- Form with toggle/boolean fields (Form.Switch, Form.Checkbox)
- Form with single-choice selection (Form.RadioGroup)
- Form with date/time fields (Form.DatePicker)
- Yup validation schema integration
- Accessing Formik state with useForm() hook
- Horizontal vs. vertical field layout (FormField layout prop)
- Required/optional field indicators (FormField.Label requirement prop)
- Helper text and info popovers (FormField.HelperText, FormField.IconPopover)
- Standalone inputs outside of Form (non-Formik usage)

---

#### UC-03: Show a confirmation or action dialog

**Problem**: "I need to show a modal asking the user to confirm an action (delete, save, discard changes) with confirm/cancel buttons."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-dialogs` |
| **Primary components** | Dialog, StandardDialog |
| **Supporting components** | ButtonBar, Button |
| **Complexity** | Medium (3-5 components) |
| **Frequency** | Daily |

**Sub-patterns covered**:
- Simple confirmation dialog ("Are you sure?")
- Structured dialog with header/body/footer (StandardDialog)
- Dialog with hero image (StandardDialog.HeroImage)
- Controlled dialog (open/onOpenChange)
- Uncontrolled dialog (Dialog.Trigger + Dialog.Close)
- Custom-styled unstyled dialog (Dialog.Content styling="unstyled")
- Nested form inside dialog (StandardDialog.Body wrapping Form)

---

#### UC-04: Show a slide-in detail/edit panel

**Problem**: "I need a side panel that slides in from the right to show details or an edit form without navigating away."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-drawers` |
| **Primary components** | Drawer, StandardDrawer |
| **Supporting components** | Button, ButtonBar |
| **Complexity** | Medium (3-5 components) |
| **Frequency** | Daily |

**Sub-patterns covered**:
- Detail view drawer (read-only content in StandardDrawer.Body)
- Edit drawer with form (Form inside StandardDrawer.Body with footer save/cancel)
- Controlled drawer (open/onOpenChange)
- Drawer with custom width
- Drawer close animation callback (onCloseFinish)

---

#### UC-05: Show notification/alert banners

**Problem**: "I need to display success, error, warning, or info messages to the user at the top of a page or section."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-feedback` |
| **Primary components** | Banner (4 sub-components) |
| **Supporting components** | Button (for Banner.Action) |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Daily |

**Sub-patterns covered**:
- Success banner after form submission
- Error banner with heading and description
- Dismissible warning banner
- Banner with action button (e.g., "Extend Session")
- Guidance/tip banner
- Custom icon override on banner

---

#### UC-06: Display status indicators and labels

**Problem**: "I need to show the status of a record (active, pending, error, draft) as a colored label or badge."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-status-indicators` |
| **Primary components** | ContainedLabel, Badge, Tag |
| **Supporting components** | Icon (via ContainedLabel.Icon), Tooltip (via ContainedLabel.Tooltip) |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Daily |

**Sub-patterns covered**:
- Status pill label (ContainedLabel: success/warning/critical/neutral)
- Status label with icon (ContainedLabel.Icon)
- Status label with info tooltip (ContainedLabel.Tooltip)
- Notification count badge (Badge: raised position)
- Inline badge (Badge: inline position)
- AI/magic indicator (Badge variant="magic", ContainedLabel variant="magic")
- Removable tags (Tag with onDelete)
- Error tags (Tag variant="error")

---

#### UC-07: Structure a page with header, breadcrumbs, and content area

**Problem**: "I need to set up the overall page structure with a title, description, action button, and breadcrumb navigation."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-page-layout` |
| **Primary components** | PageLayout (PageHeader), Breadcrumbs, FooterLayout |
| **Supporting components** | Heading, Text, Button, Grid |
| **Complexity** | Medium (3-5 components) |
| **Frequency** | Daily |

**Sub-patterns covered**:
- Page header with title and description (PageLayout.Header)
- Page header with action button (PageLayout.Header.ButtonContainer)
- Responsive vs. inline vs. stacked header variants
- Breadcrumb navigation (Breadcrumbs with Breadcrumbs.Item)
- Page-level footer with save/cancel (FooterLayout)
- Grid-based content layout (Grid + Grid.Cell)
- Responsive page layout with breakpoints

---

### Tier 2: Weekly Use (common but not daily)

---

#### UC-08: Build tabbed content sections

**Problem**: "I need to organize related content into tabs that the user can switch between (e.g., Overview, Analytics, Settings)."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-tabs-navigation` |
| **Primary components** | TabGroup (List, Tab, Panel) |
| **Supporting components** | — |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Weekly |

**Sub-patterns covered**:
- Uncontrolled tabs with default active tab
- Controlled tabs with external state
- Disabled tabs
- Tabs without panels (navigation-only, using onValueChange for routing)

---

#### UC-09: Provide contextual help with tooltips and popovers

**Problem**: "I need to show extra context when the user hovers over an icon or clicks an info button."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-contextual-help` |
| **Primary components** | Tooltip, Popover, IconPopover |
| **Supporting components** | TextWithOverflowTooltip |
| **Complexity** | Medium (3-5 components) |
| **Frequency** | Weekly |

**Sub-patterns covered**:
- Hover tooltip on icon or text (Tooltip.Trigger + Tooltip.Content)
- Danger/warning tooltip (Tooltip.Content variant="danger")
- Click-to-open info popover (Popover or IconPopover)
- Guidance popover with purple styling (Popover variant="guidance")
- Overflow text with automatic tooltip (TextWithOverflowTooltip)
- Tooltip Provider setup at app root

---

#### UC-10: Show an action menu / dropdown for a row or item

**Problem**: "I need a 'more actions' menu triggered by a button or icon, with options like Edit, Duplicate, Delete."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-action-menus` |
| **Primary components** | DropdownMenu (11 sub-components) |
| **Supporting components** | IconButton (trigger) |
| **Complexity** | Medium (3-5 components) |
| **Frequency** | Weekly |

**Sub-patterns covered**:
- Basic action menu with text items
- Action menu with sub-menus (DropdownMenu.Sub)
- Action menu with group labels and separators
- Styled trigger button (DropdownMenu.Button with chevron)
- Icon button trigger (DropdownMenu.Trigger + IconButton)
- Danger zone items with visual separation

---

#### UC-11: Show loading and skeleton states

**Problem**: "I need to show loading indicators while data is fetching, including skeleton placeholders for content areas."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-loading-states` |
| **Primary components** | LoadingIndicator, LoadingPlaceholder |
| **Supporting components** | Button (loading prop), Stack |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Weekly |

**Sub-patterns covered**:
- Centered loading spinner (LoadingIndicator in a flex container)
- Skeleton text lines (LoadingPlaceholder at varying widths)
- Skeleton card (LoadingPlaceholder with border radius)
- Skeleton avatar (LoadingPlaceholder circular)
- Button loading state (Button loading prop)
- Static placeholder (LoadingPlaceholder variant="static")

---

#### UC-12: Build a search/filter interface

**Problem**: "I need a search bar or filter controls to let users narrow down a list of items."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-search-filter` |
| **Primary components** | SearchBar, Select, MultiSelect, SearchableSelect |
| **Supporting components** | ButtonGroup/ButtonGroupNext (for view toggles), InputGroup |
| **Complexity** | Medium (3-5 components) |
| **Frequency** | Weekly |

**Sub-patterns covered**:
- Search bar with clear button
- Filter dropdown (Select with filter options)
- Multi-select filter (MultiSelect for multi-value filtering)
- Searchable select for large option lists
- Combined search + filter bar (SearchBar + Select in horizontal Stack)
- View toggle (ButtonGroup: grid/list/card views)
- Grouped select options (Select.Group)

---

#### UC-13: Handle file uploads with preview

**Problem**: "I need a file upload input and a way to preview/remove uploaded images."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-file-upload` |
| **Primary components** | FileInput, ImagePreview |
| **Supporting components** | Button, Stack |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Weekly |

**Sub-patterns covered**:
- Single file upload (FileInput with accept filter)
- Multiple file upload (FileInput multiple)
- Image preview with remove button (ImagePreview + onRemove)
- Upload in a form (FileInput within FormField)

---

#### UC-14: Show collapsible content sections (FAQ, settings groups)

**Problem**: "I need expandable/collapsible sections for FAQ pages, settings groups, or detailed information that shouldn't all be visible at once."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-accordion` |
| **Primary components** | Accordion (4 sub-components) |
| **Supporting components** | — |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Weekly |

**Sub-patterns covered**:
- Single-open accordion (FAQ style)
- Multi-open accordion (settings groups)
- Accordion with header icons (Accordion.HeaderIcon)
- Colored variant accordions (info, warning, error, neutral)
- Collapsible mode (allow all items closed)

---

### Tier 3: Occasional Use

---

#### UC-15: Build a multi-step wizard/flow

**Problem**: "I need to guide the user through a multi-step process (onboarding, campaign creation) with step indicators."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-wizards` |
| **Primary components** | StepTracker, StandardDialog or StandardDrawer |
| **Supporting components** | Form, Button, FooterLayout |
| **Complexity** | Complex (6+ components) |
| **Frequency** | Occasional |

**Sub-patterns covered**:
- Step tracker with completed/active/upcoming states
- Clickable steps for non-linear navigation
- Wizard inside a dialog (StandardDialog with StepTracker in body)
- Wizard inside a drawer (StandardDrawer with StepTracker)
- Inline page wizard (StepTracker + conditional content)
- Stacked (vertical) step layout

---

#### UC-16: Show progress toward a goal or limit

**Problem**: "I need to show progress toward a quota, usage limit, or completion target."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-progress` |
| **Primary components** | ProgressBar |
| **Supporting components** | Text, Box |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Occasional |

**Sub-patterns covered**:
- Simple progress bar (ProgressBar with total/value)
- Color-coded progress (success/warning/error variants)
- Progress with label (Text above/beside ProgressBar)
- Usage meter (ProgressBar with "X of Y used" text)

---

#### UC-17: Paginate through a large dataset

**Problem**: "I need pagination controls below a table or list to navigate through pages of data."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | (Included in `picnic-data-table`) |
| **Primary components** | Paginator |
| **Supporting components** | ContinuousScroll (alternative) |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Occasional (but often paired with UC-01) |

**Sub-patterns covered**:
- Simple paginator (Paginator with totalItems/maxItemsPerPage/offset)
- Paginator with first/last buttons (hasStartEndButtons)
- Custom paginator layout (Paginator.Label + Paginator.ButtonGroup)
- Infinite scroll alternative (ContinuousScroll)

---

#### UC-18: Display selectable cards / card grid

**Problem**: "I need to display items as interactive cards that can be clicked or selected, arranged in a grid."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-cards` |
| **Primary components** | Card, Grid |
| **Supporting components** | Heading, Text, Badge, ContainedLabel, ResponsiveImage |
| **Complexity** | Medium (3-5 components) |
| **Frequency** | Occasional |

**Sub-patterns covered**:
- Static info cards (Card with content)
- Interactive/clickable cards (Card interactive)
- Selectable cards with active state (Card active)
- Card grid layout (Grid + Grid.Cell wrapping Cards)
- Card with image (ResponsiveImage inside Card)
- Card with status badge (Badge/ContainedLabel inside Card)

---

#### UC-19: Display media content with aspect ratio

**Problem**: "I need to display images or videos with correct aspect ratio, including campaign preview images or avatars."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | `picnic-media` |
| **Primary components** | ResponsiveImage, ImagePreview |
| **Supporting components** | Box (for circular avatar styling) |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Occasional |

**Sub-patterns covered**:
- Aspect-ratio image (ResponsiveImage ratio={16/9})
- Circular avatar (ResponsiveImage ratio={1} + borderRadius radiusMax)
- Video embed (ResponsiveImage as="video")
- Image thumbnails with remove (ImagePreview)
- Hero images in dialogs (StandardDialog.HeroImage)

---

#### UC-20: Build a tag/keyword input

**Problem**: "I need an input where users can add and remove tags or keywords."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | (Included in `picnic-forms`) |
| **Primary components** | TagSelector, Tag, MultiSelect |
| **Supporting components** | — |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Occasional |

**Sub-patterns covered**:
- Free-text tag creation (TagSelector with onAddTag/onRemoveTag)
- Tag display with delete (Tag with onDelete)
- Predefined option tags (MultiSelect rendering as tags)
- Error-state tags (Tag variant="error")

---

#### UC-21: Display branding elements

**Problem**: "I need to show the Attentive logo or wordmark in headers, footers, or loading screens."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | (Part of `picnic-foundations` or standalone minimal) |
| **Primary components** | Logomark, Wordmark |
| **Supporting components** | — |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Occasional |

---

#### UC-22: Display third-party brand integrations

**Problem**: "I need to show third-party brand icons (Instagram, Shopify, etc.) with optional colored circle backgrounds for integration displays."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | (Part of `picnic-foundations` or `picnic-media`) |
| **Primary components** | ThirdPartyIcon, ThirdPartyIconCircle, IconCircle |
| **Supporting components** | — |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Occasional |

---

#### UC-23: Display accessible emoji content

**Problem**: "I need to render emoji with proper accessibility labels."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | (Part of `picnic-foundations`) |
| **Primary components** | Emoji |
| **Supporting components** | — |
| **Complexity** | Simple (1 component) |
| **Frequency** | Occasional |

---

#### UC-24: Build segmented controls / toggle groups

**Problem**: "I need a group of toggle buttons where selecting one deselects the others (view switcher, filter mode)."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | (Included in `picnic-search-filter` or `picnic-foundations`) |
| **Primary components** | ButtonGroup, ButtonGroupNext |
| **Supporting components** | — |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Occasional |

---

#### UC-25: Compose grouped inputs (phone number, amount+currency)

**Problem**: "I need to visually group two inputs together (e.g., country code + phone number, amount + currency selector)."

| Attribute | Value |
|-----------|-------|
| **Proposed skill** | (Included in `picnic-forms`) |
| **Primary components** | InputGroup |
| **Supporting components** | TextInput, Select |
| **Complexity** | Simple (1-2 components) |
| **Frequency** | Occasional |

---

## Section 3: Composition Patterns

These are composite use cases that nest multiple problem-oriented skills together.

### CP-01: Table page with search, filters, and actions

**Composition**: UC-07 (page layout) + UC-12 (search/filter) + UC-01 (data table) + UC-10 (action menus) + UC-06 (status indicators)

**Components involved**: PageLayout, Breadcrumbs, SearchBar, Select, ButtonGroup, Table, Paginator, DropdownMenu, ContainedLabel, Badge, IconButton, Banner

**This is the most common full-page pattern in SaaS applications.** A typical campaign list page combines all of these.

---

### CP-02: Create/edit form in a dialog

**Composition**: UC-03 (dialog) + UC-02 (form)

**Components involved**: StandardDialog, Form, FormField, TextInput, Select, Button

**Common pattern**: User clicks "Create" button, dialog opens with a form, user fills and submits, dialog closes.

---

### CP-03: Detail/edit panel in a drawer

**Composition**: UC-04 (drawer) + UC-02 (form) + UC-06 (status indicators)

**Components involved**: StandardDrawer, Form, FormField, TextInput, Select, ContainedLabel, Button

**Common pattern**: User clicks a table row, drawer slides in showing record details with an edit form.

---

### CP-04: Multi-step wizard in a dialog

**Composition**: UC-15 (wizard) + UC-03 (dialog) + UC-02 (form)

**Components involved**: StandardDialog, StepTracker, Form, FormField, TextInput, Select, Button

**Common pattern**: "Create Campaign" wizard with 3-4 steps, each containing a form section.

---

### CP-05: Settings page with accordion groups

**Composition**: UC-07 (page layout) + UC-08 (tabs) + UC-14 (accordion) + UC-02 (form)

**Components involved**: PageLayout, TabGroup, Accordion, Form, FormField, TextInput, Switch, Select

**Common pattern**: Settings page with tab groups (General, Notifications, Security), each containing accordion sections with form fields.

---

### CP-06: Dashboard with cards, progress, and status

**Composition**: UC-07 (page layout) + UC-18 (cards) + UC-16 (progress) + UC-06 (status indicators)

**Components involved**: PageLayout, Grid, Card, ProgressBar, ContainedLabel, Badge, Heading, Text

**Common pattern**: Overview dashboard with metric cards, progress bars, and status summaries.

---

## Section 4: Proposed Skill Mapping

### Standalone Skills (map to distinct use cases)

| # | Skill Name | Use Cases Covered | Primary Components | Tier |
|---|-----------|-------------------|-------------------|------|
| 1 | `picnic-foundations` | Cross-cutting + UC-21, UC-22, UC-23, UC-24 | Box, Stack, Grid, Text, Heading, Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, Separator, Link, Card, Emoji, Logomark, Wordmark, PickerButton | Foundation |
| 2 | `picnic-data-table` | UC-01, UC-17 | Table (11 sub-components), Paginator, ContinuousScroll | Complex |
| 3 | `picnic-forms` | UC-02, UC-20, UC-25 | Form (15 sub-components), FormField (4 sub-components), TextInput, TextArea, Select, MultiSelect, SearchableSelect, Checkbox, RadioGroup, Switch, SearchBar, FileInput, InputGroup, TagSelector, DatePicker, DateRangePicker, TimePicker | Complex |
| 4 | `picnic-dialogs` | UC-03 | Dialog, StandardDialog | Medium |
| 5 | `picnic-drawers` | UC-04 | Drawer, StandardDrawer | Medium |
| 6 | `picnic-feedback` | UC-05, UC-11 | Banner, LoadingIndicator, LoadingPlaceholder | Simple |
| 7 | `picnic-status-indicators` | UC-06 | ContainedLabel, Badge, Tag | Simple |
| 8 | `picnic-page-layout` | UC-07 | PageLayout, Breadcrumbs, FooterLayout | Medium |
| 9 | `picnic-tabs-navigation` | UC-08 | TabGroup | Simple |
| 10 | `picnic-contextual-help` | UC-09 | Tooltip, Popover, IconPopover, TextWithOverflowTooltip | Medium |
| 11 | `picnic-action-menus` | UC-10 | DropdownMenu | Medium |
| 12 | `picnic-search-filter` | UC-12 | SearchBar, Select, MultiSelect, SearchableSelect, ButtonGroup | Medium |
| 13 | `picnic-accordion` | UC-14 | Accordion | Simple |
| 14 | `picnic-wizards` | UC-15 | StepTracker | Simple (component) / Complex (composition) |
| 15 | `picnic-progress` | UC-16 | ProgressBar | Simple |
| 16 | `picnic-media` | UC-13, UC-18, UC-19 | ResponsiveImage, ImagePreview, FileInput, Card | Medium |

### Component Coverage Verification

All 57 components are covered:

| Category | Components | Skill Assignment |
|----------|-----------|-----------------|
| **Layout (6)** | Box, Stack, Grid, PageLayout, FooterLayout, Separator | foundations (Box, Stack, Grid, Separator), page-layout (PageLayout, FooterLayout) |
| **Typography (3)** | Heading, Text, TextWithOverflowTooltip | foundations (Heading, Text), contextual-help (TextWithOverflowTooltip) |
| **Actions (6)** | Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, PickerButton | foundations (all) |
| **Forms (16)** | Form, FormField, TextInput, TextArea, Select, MultiSelect, SearchableSelect, Checkbox, RadioGroup, Switch, SearchBar, FileInput, InputGroup, TagSelector, DatePicker, DateRangePicker, TimePicker | forms (all), search-filter (SearchBar, Select, MultiSelect, SearchableSelect — shared) |
| **Data Display (7)** | Table, Badge, Tag, ContainedLabel, ProgressBar, StepTracker, List | data-table (Table), status-indicators (Badge, Tag, ContainedLabel), progress (ProgressBar), wizards (StepTracker), foundations (List) |
| **Navigation (3)** | Breadcrumbs, TabGroup, Paginator | page-layout (Breadcrumbs), tabs-navigation (TabGroup), data-table (Paginator) |
| **Overlays (6)** | Dialog, StandardDialog, Drawer, StandardDrawer, Popover, DropdownMenu | dialogs (Dialog, StandardDialog), drawers (Drawer, StandardDrawer), contextual-help (Popover), action-menus (DropdownMenu) |
| **Feedback (6)** | Banner, Accordion, Tooltip, IconPopover, LoadingIndicator, LoadingPlaceholder | feedback (Banner, LoadingIndicator, LoadingPlaceholder), accordion (Accordion), contextual-help (Tooltip, IconPopover) |
| **Media & Branding (9)** | Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark, Emoji | foundations (Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, Logomark, Wordmark, Emoji), media (ResponsiveImage, ImagePreview) |
| **Utility (3)** | ContinuousScroll, Link, Card | data-table (ContinuousScroll), foundations (Link, Card) |

### Shared Components (appear in multiple skills)

Some components are **primary** in one skill but **supporting** in others:

| Component | Primary Skill | Also Used In |
|-----------|--------------|-------------|
| Select | forms | search-filter, data-table (filter context) |
| MultiSelect | forms | search-filter |
| SearchableSelect | forms | search-filter |
| SearchBar | forms | search-filter |
| Button | foundations | dialogs, drawers, feedback, forms |
| IconButton | foundations | action-menus, data-table |
| Badge | status-indicators | data-table (cells), media (card badge) |
| ContainedLabel | status-indicators | data-table (cells) |
| Card | foundations | media (card grid) |
| FileInput | forms | media (upload context) |

**Recommendation**: Each skill should include full reference for its **primary** components and brief cross-references (with skill pointer) for supporting components from other skills.

---

## Section 5: Skill Dependency Graph

```
picnic-foundations (base — no dependencies)
├── picnic-page-layout (depends on: foundations)
├── picnic-forms (depends on: foundations)
│   └── picnic-search-filter (depends on: foundations, forms)
├── picnic-data-table (depends on: foundations)
│   └── (commonly composes with: search-filter, status-indicators, action-menus)
├── picnic-dialogs (depends on: foundations)
├── picnic-drawers (depends on: foundations)
├── picnic-feedback (depends on: foundations)
├── picnic-status-indicators (depends on: foundations)
├── picnic-tabs-navigation (depends on: foundations)
├── picnic-contextual-help (depends on: foundations)
├── picnic-action-menus (depends on: foundations)
├── picnic-accordion (depends on: foundations)
├── picnic-wizards (depends on: foundations)
├── picnic-progress (depends on: foundations)
└── picnic-media (depends on: foundations)
```

---

## Section 6: Summary Statistics

| Metric | Count |
|--------|-------|
| Total use cases identified | 25 |
| Composition patterns | 6 |
| Proposed skills | 16 (1 foundation + 15 problem-oriented) |
| Daily use skills | 7 |
| Weekly use skills | 7 |
| Occasional use skills | 11 (mostly folded into daily/weekly skills) |
| Complex skills (6+ components) | 3 (foundations, data-table, forms) |
| Medium skills (3-5 components) | 7 |
| Simple skills (1-2 components) | 6 |
| Components with shared ownership | 10 |
| Total components covered | 57/57 (100%) |

---

## Open Questions for Team Discussion

1. **Should `picnic-search-filter` be standalone or merged into `picnic-forms`?** The components overlap significantly (Select, MultiSelect, SearchBar). However, the developer mental model is different: "building a form" vs. "filtering a list."

2. **Should `picnic-dialogs` and `picnic-drawers` be merged into one `picnic-overlays` skill?** They share the Radix Dialog primitive and similar compound patterns. However, developers typically think of them differently.

3. **Should `picnic-progress` and `picnic-wizards` be merged?** StepTracker and ProgressBar are both about tracking progress, but the composition patterns are very different.

4. **How should the `picnic-foundations` skill handle component density?** It covers 21 components. Should it be split further (e.g., `picnic-layout`, `picnic-typography`, `picnic-actions`, `picnic-icons`)?

5. **Should composition patterns (CP-01 through CP-06) become their own skills?** They represent the most realistic developer workflows but would create very large skills that overlap with multiple standalone skills.
