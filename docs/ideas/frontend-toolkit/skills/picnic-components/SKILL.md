---
name: picnic-components
description: >
  Attentive's Picnic design system. Use for ANY question about Picnic components,
  tokens, Stitches patterns, layout, forms, tables, dialogs, drawers, navigation,
  feedback, icons, typography, buttons, or UI built with @attentive/picnic.
  Triggers: "picnic", "design system", "component", "styled", "css prop", "$token",
  "Box", "Stack", "Grid", "Table", "Form", "Dialog", "Drawer", "Banner", "Button",
  "Heading", "Text", "Icon", "Badge", "Tab", "Breadcrumb", "Paginator", "Accordion",
  "Tooltip", "Popover", "DropdownMenu", "Select", "Modal", "Loading".
---

# Picnic Components Router

All components: `import { X } from '@attentive/picnic'`. All accept `css: PicnicCss`.

## Routing Table

Match user intent to a skill. Load ONE primary skill unless the request explicitly spans multiple.

| Intent / Keywords | Route |
|---|---|
| table, data grid, sortable columns, row selection, infinite scroll | `problem/data-table` |
| form, input, validation, text field, select, checkbox, radio, switch, date picker, file upload, tag selector | `problem/form-builder` |
| modal, dialog, drawer, popover, dropdown menu, side panel, overlay, confirmation | `problem/dialog-drawer` |
| tabs, breadcrumbs, pagination, paginator, step tracker, wizard, multi-step | `problem/navigation` |
| banner, tooltip, accordion, loading, skeleton, notification, alert, collapsible | `problem/feedback-notifications` |
| tokens, colors, spacing, radii, shadows, font sizes, breakpoints, semantic colors | `foundation/design-tokens` |
| styled, css prop, variants, responsive, @bp, theme, dark mode, stitches | `foundation/stitches-patterns` |
| layout, Box, Stack, Grid, page structure, PageLayout, FooterLayout, Separator | `foundation/layout-primitives` |
| Button, IconButton, ButtonBar, ButtonGroup, PickerButton | `references/actions-ref` |
| Heading, Text, Link, TextWithOverflowTooltip, typography | `references/typography-ref` |
| Badge, Tag, ContainedLabel, ProgressBar, List, Card, status indicator | `references/data-display-ref` |
| Icon, ThirdPartyIcon, image, ResponsiveImage, Logomark, Wordmark, Emoji | `references/media-ref` |
| validate, check my code, review picnic usage, audit | `validator` |

## Progressive Loading Strategy

1. **Router always loads** (~3KB) — identifies intent, routes to skill
2. **One primary skill loads** — contains patterns, decision guides, constraints
3. **Skills load their own references** — foundation refs loaded as dependencies when needed
4. **Validator invoked last** — as a final pass on generated code, not during authoring

Dependency chain: `design-tokens → stitches-patterns → layout-primitives → problem skills`

Problem skills declare their foundation dependencies inline. When a problem skill is loaded, its required foundations load automatically.

## Multi-Skill Composition

When a request spans multiple skills, load them in this order:

1. **Outer container first**: dialog-drawer → layout-primitives → inner content skills
2. **Then inner content**: form-builder, data-table, navigation, feedback-notifications

Examples:
- "Form in a dialog" → `dialog-drawer` + `form-builder`
- "Table with tabs and pagination" → `navigation` + `data-table`
- "Wizard with forms in a drawer" → `dialog-drawer` + `navigation` + `form-builder`
- "Dashboard with cards and progress bars" → `layout-primitives` + `references/data-display-ref`

Load at most 3 problem skills per request. If more are needed, handle the outer container first, then address inner content in follow-up.

## Available Skills

### Foundation (3)
- **design-tokens** — Semantic color tokens, spacing scale, radii, shadows, typography tokens, breakpoints
- **stitches-patterns** — css prop, styled(), variants, responsive breakpoints, theme utilities
- **layout-primitives** — Box, Stack, Grid, PageLayout, FooterLayout, Separator

### Problem (5)
- **data-table** — Table (11 subs), sorting, selection, ContinuousScroll. Cross-refs Paginator from navigation
- **form-builder** — Form + Formik, 17 input components, Select decision tree, Yup validation
- **dialog-drawer** — Dialog, Drawer, Popover, DropdownMenu. All overlay/floating components
- **navigation** — Breadcrumbs, TabGroup, Paginator, StepTracker
- **feedback-notifications** — Banner, Accordion, Tooltip, IconPopover, LoadingIndicator, LoadingPlaceholder

### References (4)
- **actions-ref** — Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, PickerButton
- **typography-ref** — Heading, Text, TextWithOverflowTooltip, Link
- **data-display-ref** — Badge, Tag, ContainedLabel, ProgressBar, List, Card
- **media-ref** — Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark, Emoji

### Validator (1)
- **validator** — Post-generation validation: 125 rules across 8 categories. Run after code is written.

## Fallback Behavior

If intent is ambiguous:
1. **Component name mentioned** → check the routing table; component names are unique across skills
2. **General "Picnic" or "design system" question** → load `foundation/design-tokens` as the default entry point
3. **"How do I build X" without component names** → match the UI pattern (e.g., "list of items" → data-table, "popup" → dialog-drawer)
4. **Multiple matches with equal weight** → ask the user to clarify before loading skills
