# Design Section 07: Router Skill

> **Author**: Router-Writer Agent
> **Date**: 2026-02-18
> **Task**: #7 — Router SKILL.md specification
> **Target**: `skills/picnic-components/SKILL.md` (~3KB / ~90 lines)

---

## Overview

The router is the top-level `SKILL.md` for `picnic-components/`. It is the only file that loads on every Picnic-related query. Its job is to identify user intent and route to exactly the right sub-skill(s) — nothing more.

---

## Router SKILL.md Content

The following is the complete specification for the router skill file. When implemented, this content becomes `skills/picnic-components/SKILL.md`:

```markdown
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
```

---

## Design Rationale

### Size Budget

The router targets ~90 lines / ~3KB as specified in the token optimization synthesis (Proposal 07, Section 2.4). The spec above fits within that budget:
- Frontmatter: ~8 lines
- Routing table: ~18 lines
- Progressive loading: ~10 lines
- Multi-skill composition: ~14 lines
- Available skills listing: ~20 lines
- Fallback behavior: ~8 lines
- Total: **~88 lines**

### Routing Table Design

The routing table is organized by **user intent keywords**, not by component taxonomy. This matches how developers actually phrase requests:
- "I need a table" → not "I need the Data Display category"
- "Build a form" → not "I need Form-related components"

Keywords are drawn from the 25 use cases in Proposal 02 and the consensus architecture from Proposal 06.

### Progressive Loading Justification

The router deliberately avoids loading foundation skills eagerly. In the consensus architecture:
- A simple reference lookup (router + 1 ref) costs ~4KB vs ~264KB monolith = **97% savings**
- A typical problem skill query (router + 1 skill + foundations) costs ~9KB = **94% savings**
- Even the worst case (all skills loaded) is ~39KB = **85% savings**

### Composition Order

"Outer container first" is the natural authoring order. When building "a form inside a dialog," the developer needs to:
1. Set up the Dialog/StandardDialog structure
2. Place Form inside StandardDialog.Body
3. Add form fields

Loading dialog-drawer first gives the container context before form-builder adds the inner content.

### Fallback Design

The fallback behavior prioritizes **not loading the wrong skill** over **loading something fast**. Asking the user to clarify (option 4) is better than loading 3 skills and wasting context on the wrong ones. The design-tokens default (option 2) is the safest generic entry point since token knowledge is universally useful.
