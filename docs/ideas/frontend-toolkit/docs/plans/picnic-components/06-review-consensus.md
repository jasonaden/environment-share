# Proposal 06: Review & Consensus Report

> **Author**: Reviewer/Critic Agent
> **Task**: #6 — Review all proposals for consistency and iterate to consensus
> **Date**: 2026-02-18
> **Status**: Final Review

---

## 1. Coverage Matrix

### Component Count Discrepancy

The monolithic SKILL.md claims "57 components across 10 categories." However, the component catalog (`references/component-catalog.md`) contains **66 individual component entries** (counted via `#### ` headers). The discrepancy comes from:

- Forms index says "(16)" but lists 17 items (includes SearchableSelect not in SKILL.md's list)
- Utility index says "(2)" but has 3 entries (ContinuousScroll, Link, Card)
- Media & Branding has 9 entries (SKILL.md says "7+")
- Feedback has 6 entries (SKILL.md says "5+")

P02 claims "57/57 (100%)" coverage. P04 identifies 60 unique components but its own matrix lists 66 entries (57 numbered + 9 with dashes). **Recommendation**: Adopt 66 as the canonical count and stop referencing "57."

### Full Coverage Matrix (66 Components)

| # | Component | P01 Location | P04 Location | P02 Primary Skill | Consensus Location |
|---|-----------|-------------|-------------|-------------------|-------------------|
| 1 | Box | layout-primitives | layout foundation | picnic-foundations | **layout-primitives** (foundation) |
| 2 | Stack | layout-primitives | layout foundation | picnic-foundations | **layout-primitives** (foundation) |
| 3 | Grid | layout-primitives | layout foundation | picnic-foundations | **layout-primitives** (foundation) |
| 4 | PageLayout | layout-primitives | utility-ref.md | picnic-page-layout | **layout-primitives** (foundation)^1 |
| 5 | FooterLayout | layout-primitives | utility-ref.md | picnic-page-layout | **layout-primitives** (foundation)^1 |
| 6 | Separator | layout-primitives | utility-ref.md | picnic-foundations | **layout-primitives** (foundation)^1 |
| 7 | Heading | typography-ref.md | typography-ref.md | picnic-foundations | **typography-ref.md** |
| 8 | Text | typography-ref.md | typography-ref.md | picnic-foundations | **typography-ref.md** |
| 9 | TextWithOverflowTooltip | typography-ref.md | typography-ref.md | picnic-contextual-help | **typography-ref.md** |
| 10 | Link | typography-ref.md | typography-ref.md | picnic-foundations | **typography-ref.md** |
| 11 | Button | actions-ref.md | actions-ref.md | picnic-foundations | **actions-ref.md** |
| 12 | IconButton | actions-ref.md | actions-ref.md | picnic-foundations | **actions-ref.md** |
| 13 | ButtonBar | actions-ref.md | actions-ref.md | picnic-foundations | **actions-ref.md** |
| 14 | ButtonGroup | actions-ref.md | actions-ref.md | picnic-foundations | **actions-ref.md** |
| 15 | ButtonGroupNext | actions-ref.md | actions-ref.md | picnic-foundations | **actions-ref.md** |
| 16 | PickerButton | actions-ref.md | actions-ref.md | picnic-foundations | **actions-ref.md** |
| 17 | Form | form-builder | form-builder | picnic-forms | **form-builder** (skill) |
| 18 | FormField | form-builder | form-builder | picnic-forms | **form-builder** (skill) |
| 19 | TextInput | forms-standalone-ref / form-builder | form-builder | picnic-forms | **form-builder** (skill) |
| 20 | TextArea | forms-standalone-ref / form-builder | form-builder | picnic-forms | **form-builder** (skill) |
| 21 | Select | select-system | form-builder | picnic-forms | **form-builder** (skill)^2 |
| 22 | MultiSelect | select-system | form-builder | picnic-forms | **form-builder** (skill)^2 |
| 23 | SearchableSelect | select-system | form-builder | picnic-forms | **form-builder** (skill)^2 |
| 24 | Checkbox | forms-standalone-ref / form-builder | form-builder | picnic-forms | **form-builder** (skill) |
| 25 | RadioGroup | forms-standalone-ref / form-builder | form-builder | picnic-forms | **form-builder** (skill) |
| 26 | Switch | forms-standalone-ref / form-builder | form-builder | picnic-forms | **form-builder** (skill) |
| 27 | SearchBar | forms-standalone-ref | data-table | picnic-forms / picnic-search-filter | **form-builder** (skill)^3 |
| 28 | FileInput | forms-standalone-ref | form-builder | picnic-forms | **form-builder** (skill) |
| 29 | InputGroup | forms-standalone-ref | form-builder | picnic-forms | **form-builder** (skill) |
| 30 | TagSelector | select-system | form-builder | picnic-forms | **form-builder** (skill) |
| 31 | DatePicker | date-time-ref / form-builder | form-builder | picnic-forms | **form-builder** (skill) |
| 32 | DateRangePicker | date-time-ref | form-builder | picnic-forms | **form-builder** (skill) |
| 33 | TimePicker | date-time-ref | form-builder | picnic-forms | **form-builder** (skill) |
| 34 | Table | data-table | data-table | picnic-data-table | **data-table** (skill) |
| 35 | Badge | data-display-ref.md | data-display-ref.md | picnic-status-indicators | **data-display-ref.md** |
| 36 | Tag | data-display-ref.md | data-display-ref.md | picnic-status-indicators | **data-display-ref.md** |
| 37 | ContainedLabel | data-display-ref.md | data-display-ref.md | picnic-status-indicators | **data-display-ref.md** |
| 38 | ProgressBar | data-display-ref.md | data-display-ref.md | picnic-progress | **data-display-ref.md** |
| 39 | StepTracker | data-display-ref.md | navigation | picnic-wizards | **navigation** (skill)^4 |
| 40 | List | data-display-ref.md | data-display-ref.md | picnic-foundations | **data-display-ref.md** |
| 41 | Breadcrumbs | navigation-ref.md | navigation | picnic-page-layout | **navigation** (skill) |
| 42 | TabGroup | navigation-ref.md | navigation | picnic-tabs-navigation | **navigation** (skill) |
| 43 | Paginator | navigation-ref.md / data-table | navigation | picnic-data-table | **navigation** (skill)^5 |
| 44 | Dialog | dialog-drawer | dialog-drawer | picnic-dialogs | **dialog-drawer** (skill) |
| 45 | StandardDialog | dialog-drawer | dialog-drawer | picnic-dialogs | **dialog-drawer** (skill) |
| 46 | Drawer | dialog-drawer | dialog-drawer | picnic-drawers | **dialog-drawer** (skill) |
| 47 | StandardDrawer | dialog-drawer | dialog-drawer | picnic-drawers | **dialog-drawer** (skill) |
| 48 | Popover | dropdown-popover | dialog-drawer | picnic-contextual-help | **dialog-drawer** (skill)^6 |
| 49 | DropdownMenu | dropdown-popover | dialog-drawer | picnic-action-menus | **dialog-drawer** (skill)^6 |
| 50 | Banner | feedback-ref.md | feedback-notifications | picnic-feedback | **feedback-notifications** (skill) |
| 51 | Accordion | feedback-ref.md | feedback-notifications | picnic-accordion | **feedback-notifications** (skill) |
| 52 | Tooltip | dropdown-popover | feedback-notifications | picnic-contextual-help | **feedback-notifications** (skill)^7 |
| 53 | IconPopover | dropdown-popover | feedback-notifications | picnic-contextual-help | **feedback-notifications** (skill) |
| 54 | LoadingIndicator | feedback-ref.md | feedback-notifications | picnic-feedback | **feedback-notifications** (skill) |
| 55 | LoadingPlaceholder | feedback-ref.md | feedback-notifications | picnic-feedback | **feedback-notifications** (skill) |
| 56 | Icon | media-branding-ref.md | media-ref.md | picnic-foundations | **media-ref.md** |
| 57 | ThirdPartyIcon | media-branding-ref.md | media-ref.md | picnic-foundations | **media-ref.md** |
| 58 | IconCircle | media-branding-ref.md | media-ref.md | picnic-foundations | **media-ref.md** |
| 59 | ThirdPartyIconCircle | media-branding-ref.md | media-ref.md | picnic-foundations | **media-ref.md** |
| 60 | ResponsiveImage | media-branding-ref.md | media-ref.md | picnic-media | **media-ref.md** |
| 61 | ImagePreview | media-branding-ref.md | media-ref.md | picnic-media | **media-ref.md** |
| 62 | Logomark | media-branding-ref.md | media-ref.md | picnic-foundations | **media-ref.md** |
| 63 | Wordmark | media-branding-ref.md | media-ref.md | picnic-foundations | **media-ref.md** |
| 64 | Emoji | media-branding-ref.md | media-ref.md | picnic-foundations | **media-ref.md** |
| 65 | ContinuousScroll | data-table | utility-ref.md | picnic-data-table | **data-table** (skill, secondary in utility-ref)^8 |
| 66 | Card | actions-ref.md | utility-ref.md | picnic-foundations | **utility-ref.md**^9 |

**Footnotes:**
1. P04 moves PageLayout/FooterLayout/Separator to utility-ref, but P03's layout-primitives design already covers all 6 layout components at only ~2KB. Keeping them in layout-primitives is cleaner and avoids a "utility-ref" grab bag.
2. P01's separate `select-system` skill is excessive. Select/MultiSelect/SearchableSelect are almost always used within Form context. A decision tree within form-builder is sufficient.
3. SearchBar is primarily an input component, not a table component. Its most common standalone use is as a filter control, but it's architecturally a form input.
4. StepTracker is navigational in nature (multi-step wizard progress), not data display. P04's reasoning is stronger.
5. Paginator's primary location in navigation skill, with cross-reference in data-table for the Table + Paginator integration pattern.
6. P04's merge of Popover and DropdownMenu into dialog-drawer is correct — they share Radix overlay primitives with Dialog/Drawer.
7. P04's placement of Tooltip in feedback-notifications is correct — Tooltip provides contextual feedback, not interactive overlay behavior.
8. ContinuousScroll's only practical use is as a Table pagination alternative; primary location in data-table makes sense.
9. Card belongs in utility-ref, not actions-ref. It's a general-purpose container, not an action element.

---

## 2. Consistency Check Results

### Cross-Proposal Check Matrix

| Check | Result | Details |
|-------|--------|---------|
| **Skill count agreement** | FAIL | P01: 9 skills + 8 refs. P02: 16 skills. P04: 8 skills + 5 refs. No consensus. |
| **Foundation skills agreement** | PASS | P01, P03, P04 all agree on 3 foundations: design-tokens, stitches-patterns, layout-primitives. |
| **Foundation content agreement** | FAIL | P03's layout-primitives covers 6 components; P04 only puts 3 in foundation and moves 3 to utility-ref. |
| **Problem skill names agreement** | FAIL | P01 has dropdown-popover + select-system. P04 has navigation + feedback-notifications. No overlap on 4 of 5. |
| **Reference file names agreement** | FAIL | P01: 8 files. P04: 5 files. Different naming (media-branding-ref vs media-ref). |
| **Naming convention agreement** | FAIL | P02 uses "picnic-" prefix; P01/P03/P04 use unprefixed names. |
| **Component count agreement** | FAIL | Claims range from 57 to 66. |
| **Size budgets agreement** | FAIL | P01: stitches-patterns ~8KB+40KB ref. P03: ~3KB+10KB ref. 4x disagreement. |
| **Dependency graph agreement** | PASS | All agree: design-tokens → stitches-patterns → layout-primitives → problem skills. |
| **Validator design agreement** | PASS | P01 and P05 agree on centralized validator + per-skill checklists. |
| **Progressive disclosure pattern** | PASS | P01, P03 agree on 3-level approach (skill core → reference → foundations). |
| **Router skill concept** | PASS | P01 defines router. P02's use cases provide the routing logic. Compatible. |
| **Validation rule completeness** | PASS | P05's 125 rules across 8 categories comprehensively cover all catalog constraints. |

### Score: 6 PASS / 7 FAIL

---

## 3. Composition Scenario Walkthroughs

### Scenario 1: "Build a Dialog with a Form inside that has a Table of selectable items"

Using the **consensus architecture** (P04's skill set + P03's foundations):

| Step | Skill Loaded | Content | Est. Context |
|------|-------------|---------|-------------|
| 1 | Router | Identifies: dialog + form + table composition | ~4KB |
| 2 | dialog-drawer | Dialog/StandardDialog patterns, StandardDialog.Body as form container | ~6KB |
| 3 | form-builder | Form + Formik + Form.* sub-components for the inner form | ~8KB |
| 4 | data-table | Table + selection pattern (HeaderSelectorCell + RowSelectorCell) | ~7KB |
| 5 | design-tokens (dep) | Token references for all three skills | ~3KB |
| 6 | stitches-patterns (dep) | css prop patterns | ~3KB |
| 7 | layout-primitives (dep) | Box/Stack for layout within dialog | ~2KB |
| **Total** | 3 problem + 3 foundation + router | | **~33KB** |

**Verdict**: Works. Each skill handles its domain. The composition point (Form inside StandardDialog.Body) is documented in dialog-drawer's "Composition patterns" section. Table inside Form is a less common pattern but both skills are independently usable.

**Gap identified**: None of the proposals explicitly document the "Table with row selection inside a Form inside a Dialog" three-level nesting pattern. This should be added as a composition example.

### Scenario 2: "Create a page with Breadcrumbs, a data Table with pagination, and a Banner for errors"

| Step | Skill Loaded | Content | Est. Context |
|------|-------------|---------|-------------|
| 1 | Router | Identifies: page layout + table + navigation + feedback | ~4KB |
| 2 | layout-primitives | PageLayout for page structure | ~2KB |
| 3 | navigation | Breadcrumbs + Paginator patterns | ~4KB |
| 4 | data-table | Table component + Paginator integration cross-reference | ~7KB |
| 5 | feedback-notifications | Banner for error display | ~5KB |
| 6 | design-tokens (dep) | Token lookups | ~3KB |
| 7 | stitches-patterns (dep) | css prop patterns | ~3KB |
| **Total** | 3 problem + 3 foundation + router | | **~28KB** |

**Verdict**: Works. Paginator is covered in navigation (primary) with data-table cross-referencing the Table + Paginator integration. Banner is covered in feedback-notifications.

**Redundancy noted**: Paginator appears in both navigation (primary) and data-table (cross-reference). The cross-reference in data-table should be brief (2-3 lines pointing to navigation skill) rather than duplicating the full Paginator API.

### Scenario 3: "Build a settings page with Tabs, each containing Forms with different field types"

| Step | Skill Loaded | Content | Est. Context |
|------|-------------|---------|-------------|
| 1 | Router | Identifies: page layout + tabs + forms | ~4KB |
| 2 | layout-primitives | PageLayout for page structure | ~2KB |
| 3 | navigation | TabGroup (List, Tab, Panel) for tab structure | ~4KB |
| 4 | form-builder | Form + various Form.* inputs per tab panel | ~8KB |
| 5 | design-tokens (dep) | Token lookups | ~3KB |
| 6 | stitches-patterns (dep) | css prop patterns | ~3KB |
| **Total** | 2 problem + 3 foundation + router | | **~24KB** |

**Verdict**: Works. TabGroup is well-covered in navigation. Each tab panel contains a Form, well-covered in form-builder. The composition is natural: `<TabGroup.Panel>` wraps a `<Form>`.

**No gaps.** This is the cleanest scenario.

---

## 4. Issues Found

### Critical Issues

| # | Severity | Proposals Affected | Issue | Fix |
|---|----------|-------------------|-------|-----|
| C1 | **CRITICAL** | P01, P02, P04 | **Skill count and structure are incompatible.** P01 proposes 5 problem skills (including dropdown-popover, select-system). P02 proposes 15 problem skills. P04 proposes 5 different problem skills (navigation, feedback-notifications). No two proposals agree on the problem skill set. | Adopt P04's 5 problem skills as the consensus: data-table, form-builder, dialog-drawer, navigation, feedback-notifications. P04's groupings are the most principled (overlay components together, navigation together, feedback together). |
| C2 | **CRITICAL** | P01, P03, P04 | **PageLayout/FooterLayout/Separator location conflict.** P01 and P03 place them in layout-primitives. P04 moves them to utility-ref.md. | Keep in layout-primitives per P03's design. At ~2KB total, layout-primitives can handle all 6 layout components without bloat. Eliminates the need for a "utility-ref" grab bag. |
| C3 | **CRITICAL** | P01, P02, P04 | **Reference file count/structure disagrees.** P01: 8 references. P04: 5 references. Many components that P01 puts in reference files, P04 absorbs into skills. | Adopt P04's approach with modifications: 4 reference files (actions-ref, typography-ref, media-ref, data-display-ref). Drop utility-ref (PageLayout/FooterLayout/Separator → layout-primitives; Card → actions-ref or data-display-ref; ContinuousScroll → data-table). Drop P01's separate forms-standalone-ref, navigation-ref, feedback-ref, date-time-ref (components absorbed into skills). |
| C4 | **CRITICAL** | All | **Component count claim "57" is wrong.** The catalog contains 66 unique component entries. | Update all documentation to reference 66 components. Audit the catalog index headers to match actual counts per category. |

### Major Issues

| # | Severity | Proposals Affected | Issue | Fix |
|---|----------|-------------------|-------|-----|
| M1 | **MAJOR** | P01, P02 | **P01's separate `select-system` skill is redundant.** Select, MultiSelect, SearchableSelect, and TagSelector are almost always used within Form context. P04 correctly absorbs them into form-builder with a decision tree subsection. | Drop select-system. Add a "Select Component Decision Tree" section within form-builder (Select vs MultiSelect vs SearchableSelect vs TagSelector). |
| M2 | **MAJOR** | P01, P04 | **P01's separate `dropdown-popover` skill splits overlay components unnaturally.** Dialog/Drawer/Popover/DropdownMenu all share Radix overlay primitives, portal rendering, and controlled/uncontrolled patterns. | Merge into dialog-drawer per P04. The skill becomes "Overlays, Modals, Drawers, and Floating Content" covering all 6 overlay-type components. |
| M3 | **MAJOR** | P02 | **P02 proposes 15 problem-oriented skills — too many.** Skills like picnic-progress (just ProgressBar), picnic-accordion (just Accordion), picnic-wizards (just StepTracker) are trivially small. Loading 15+ skills creates discovery overhead. | Consolidate to P04's 5 problem skills. Simple standalone components (ProgressBar, Accordion, etc.) belong in reference files or consolidated skills, not as individual skills. |
| M4 | **MAJOR** | P02 | **P02 uses "picnic-" prefix on all skill names; other proposals don't.** Inconsistent naming convention. | Drop the "picnic-" prefix. Skills already live under the `picnic-components/` directory, making the prefix redundant. Use P01/P04's unprefixed names: data-table, form-builder, dialog-drawer, navigation, feedback-notifications. |
| M5 | **MAJOR** | P01, P03 | **Size budget disagreement for stitches-patterns.** P01 estimates ~8KB skill + ~40KB reference. P03 estimates ~3KB skill + ~10KB reference. That's a 4x difference on reference size. | Adopt P03's target. The current 52KB stitches-patterns reference contains ~30KB of redundant prose and duplicated examples. A curated ~10KB reference retaining key patterns and examples is sufficient. |
| M6 | **MAJOR** | P04 | **P04's internal component count is inconsistent.** Summary says "60 components" but the coverage matrix lists 66 entries. | Fix the summary to say 66. Ensure all numbered entries in the matrix are sequential 1-66. |
| M7 | **MAJOR** | P01, P04 | **Tooltip placement conflict.** P01 puts Tooltip in dropdown-popover (overlay grouping). P04 puts it in feedback-notifications (feedback grouping). | Adopt P04's placement. Tooltip's purpose is contextual feedback (hover help text), not interactive overlay behavior. It groups naturally with Banner, Accordion, IconPopover as information-display mechanisms. |
| M8 | **MAJOR** | P04, P05 | **P04's feedback-notifications skill doesn't appear in P05's per-skill checklists.** P05 has checklists for "feedback-notifications" but P04's skill name is identical, so this is technically consistent. However, P05's checklist references "Accordion variant is one of: error, info, neutral, warning, decorative3" — P05 should verify this against the catalog. | Verify: the catalog lists Accordion variants as `error | info | neutral | warning | decorative3`. P05's V04 is correct. No fix needed for the values, but the mapping should be double-checked in implementation. |

### Minor Issues

| # | Severity | Proposals Affected | Issue | Fix |
|---|----------|-------------------|-------|-----|
| m1 | **MINOR** | P01 | **Card placed in actions-ref.md.** Card is a general container, not an action element. | Move Card to data-display-ref.md (alongside Badge, Tag, ContainedLabel — all are display containers). |
| m2 | **MINOR** | P03 | **Open question about hex values in design-tokens reference.** P03 asks whether to include hex values. | Include them. Hex values are the primary lookup reason for the token reference. ~3KB is worth the utility. |
| m3 | **MINOR** | P03 | **Responsive design ownership split.** Breakpoint values in design-tokens, usage patterns in stitches-patterns. | This split is clean and correct. No change needed. design-tokens owns the "what" (values), stitches-patterns owns the "how" (usage). |
| m4 | **MINOR** | P01, P04 | **SearchBar primary location differs.** P01: forms-standalone-ref. P04: data-table. | Place in form-builder. SearchBar is architecturally an input component (styled `<input>`). Its common use above tables is a composition pattern, not a reason to change its primary home. data-table can cross-reference it. |
| m5 | **MINOR** | P05 | **V14 lists Banner variants as "error, info, warning, success, neutral, guidance" but calls "default" and "primary" and "critical" invalid.** Need to verify Banner has no "default" variant. | Verified against catalog: Banner uses `error | info | warning | success | neutral | guidance`. "default", "primary", "critical" are indeed invalid. P05 is correct. |
| m6 | **MINOR** | P01 | **P01 puts Link in typography-ref.md** but the catalog categorizes it under "Utility." | P01's placement is better. Link is semantically styled text. Keeping it with Heading/Text/TextWithOverflowTooltip is more intuitive. |

---

## 5. Consensus Architecture

Based on the review, the recommended final architecture is:

### Directory Tree

```
skills/
└── picnic-components/
    ├── SKILL.md                          # Router skill (P01)
    │
    ├── foundation/
    │   ├── design-tokens/
    │   │   ├── SKILL.md                  # ~3KB (P03 design)
    │   │   └── references/
    │   │       └── token-tables.md       # ~15KB (P03 target)
    │   │
    │   ├── stitches-patterns/
    │   │   ├── SKILL.md                  # ~3KB (P03 design)
    │   │   └── references/
    │   │       └── utils-reference.md    # ~10KB (P03 target)
    │   │
    │   └── layout-primitives/
    │       └── SKILL.md                  # ~2KB, all 6 layout components (P03)
    │
    ├── problem/
    │   ├── data-table/
    │   │   └── SKILL.md                  # Table + sorting + selection + Paginator xref + ContinuousScroll
    │   │
    │   ├── form-builder/
    │   │   └── SKILL.md                  # Form + Formik + all inputs + Select decision tree
    │   │
    │   ├── dialog-drawer/
    │   │   └── SKILL.md                  # Dialog, Drawer, Popover, DropdownMenu (all overlays)
    │   │
    │   ├── navigation/
    │   │   └── SKILL.md                  # Breadcrumbs, TabGroup, Paginator, StepTracker
    │   │
    │   └── feedback-notifications/
    │       └── SKILL.md                  # Banner, Accordion, Tooltip, IconPopover, Loading*
    │
    ├── references/
    │   ├── actions-ref.md                # Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, PickerButton
    │   ├── typography-ref.md             # Heading, Text, TextWithOverflowTooltip, Link
    │   ├── data-display-ref.md           # Badge, Tag, ContainedLabel, ProgressBar, List, Card
    │   └── media-ref.md                  # Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark, Emoji
    │
    └── validator/
        └── SKILL.md                      # Post-generation validation (125 rules)
```

### Skill Count Summary

| Type | Count | Skills |
|------|-------|--------|
| Router | 1 | picnic-components |
| Foundation | 3 | design-tokens, stitches-patterns, layout-primitives |
| Problem | 5 | data-table, form-builder, dialog-drawer, navigation, feedback-notifications |
| Validator | 1 | picnic-validator |
| **Reference files** | **4** | actions-ref, typography-ref, data-display-ref, media-ref |
| **Total** | **10 skills + 4 references** | |

### Component Allocation Summary

| Location | Count | Components |
|----------|-------|-----------|
| layout-primitives (foundation) | 6 | Box, Stack, Grid, PageLayout, FooterLayout, Separator |
| form-builder (skill) | 17 | Form, FormField, TextInput, TextArea, Select, MultiSelect, SearchableSelect, Checkbox, RadioGroup, Switch, SearchBar, FileInput, InputGroup, TagSelector, DatePicker, DateRangePicker, TimePicker |
| data-table (skill) | 2 | Table, ContinuousScroll |
| dialog-drawer (skill) | 6 | Dialog, StandardDialog, Drawer, StandardDrawer, Popover, DropdownMenu |
| navigation (skill) | 4 | Breadcrumbs, TabGroup, Paginator, StepTracker |
| feedback-notifications (skill) | 6 | Banner, Accordion, Tooltip, IconPopover, LoadingIndicator, LoadingPlaceholder |
| actions-ref (reference) | 6 | Button, IconButton, ButtonBar, ButtonGroup, ButtonGroupNext, PickerButton |
| typography-ref (reference) | 4 | Heading, Text, TextWithOverflowTooltip, Link |
| data-display-ref (reference) | 6 | Badge, Tag, ContainedLabel, ProgressBar, List, Card |
| media-ref (reference) | 9 | Icon, ThirdPartyIcon, IconCircle, ThirdPartyIconCircle, ResponsiveImage, ImagePreview, Logomark, Wordmark, Emoji |
| **Total** | **66** | All components accounted for |

### Key Decisions

1. **P04's 5 problem skills** adopted over P01's 5 (which had dropout-popover/select-system) and P02's 15 (too many).
2. **P03's foundation skills** adopted in full (layout-primitives keeps all 6 layout components).
3. **P03's size targets** adopted for foundation references (~15KB tokens, ~10KB stitches).
4. **4 reference files** (reduced from P01's 8). Complex components absorbed into skills; only simple standalone components remain in references.
5. **P05's validation system** adopted fully — 125 rules, 8 categories, two-layer architecture.
6. **Unprefixed naming** — no "picnic-" prefix on skill names (redundant within picnic-components/ directory).

---

## 6. Final Recommendation

**The design is ready for implementation with the fixes above.** The consensus architecture resolves all critical and major conflicts between proposals. The 5 proposals together provide excellent coverage:

- **P01** provides the overall architecture framework, router concept, dependency graph, and progressive disclosure strategy. Its directory tree needs updating to match the consensus.
- **P02** provides the use case analysis and composition patterns that validate the skill boundaries. Its 16-skill proposal should be archived but its use cases and composition patterns remain valuable as routing logic for the router skill.
- **P03** provides the most detailed and size-conscious foundation skill designs. Adopt as-is.
- **P04** provides the best problem skill decomposition and component allocation. Its 5 problem skills + reference structure should be the template, with the modifications noted above.
- **P05** provides a thorough validation system. Adopt as-is; per-skill checklists align with P04's 5 problem skills.

### Required Changes Before Implementation

1. Update the canonical component count to 66 everywhere
2. Adopt P04's 5 problem skills, dropping P01's dropdown-popover and select-system
3. Keep all 6 layout components in layout-primitives (don't split to utility-ref)
4. Reduce to 4 reference files (drop forms-standalone-ref, navigation-ref, feedback-ref, date-time-ref, utility-ref)
5. Move Card to data-display-ref
6. Use P03's size budgets for foundation references
7. Drop "picnic-" prefix from all skill names
8. Add Select decision tree section to form-builder skill
9. Add composition scenario examples to router skill (from P02's Section 3)
