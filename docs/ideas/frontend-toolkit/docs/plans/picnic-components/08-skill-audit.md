# 08 — Skill Content Audit: Source-Extractable vs Human-Curated

## Purpose

Classify every piece of content in the 14 implemented skill files by origin:
- **A (Source Extractable)** — a script can pull this directly from TypeScript AST, Stitches config, or theme files
- **B (Derivable with Heuristics)** — a script plus naming/structural rules can infer this
- **C (Human Knowledge Required)** — must be manually curated; cannot be derived from code

## Summary Table

| # | File | Lines | A (extract) | B (derive) | C (human) | A+B % |
|---|------|------:|:-----------:|:----------:|:---------:|:-----:|
| 1 | SKILL.md (router) | 93 | 10 | 5 | 78 | **16%** |
| 2 | foundation/design-tokens/SKILL.md | 91 | 25 | 8 | 58 | **36%** |
| 3 | foundation/stitches-patterns/SKILL.md | 128 | 25 | 18 | 85 | **34%** |
| 4 | foundation/layout-primitives/SKILL.md | 108 | 25 | 10 | 73 | **32%** |
| 5 | problem/data-table/SKILL.md | 115 | 25 | 5 | 85 | **26%** |
| 6 | problem/form-builder/SKILL.md | 159 | 40 | 5 | 114 | **28%** |
| 7 | problem/dialog-drawer/SKILL.md | 137 | 35 | 5 | 97 | **29%** |
| 8 | problem/navigation/SKILL.md | 84 | 20 | 3 | 61 | **27%** |
| 9 | problem/feedback-notifications/SKILL.md | 117 | 30 | 3 | 84 | **28%** |
| 10 | references/actions-ref.md | 38 | 27 | 4 | 7 | **82%** |
| 11 | references/typography-ref.md | 23 | 15 | 1 | 7 | **70%** |
| 12 | references/data-display-ref.md | 33 | 23 | 2 | 8 | **76%** |
| 13 | references/media-ref.md | 42 | 35 | 2 | 5 | **88%** |
| 14 | validator/SKILL.md | 238 | 80 | 20 | 138 | **42%** |
| | **TOTAL** | **1406** | **415** | **91** | **900** | **36%** |

**Key finding**: 36% of all skill content (506 lines) is automatable. The remaining 64% (900 lines) is irreplaceable human knowledge. The ratio varies dramatically by file type — reference files are 70-88% automatable while problem skills are only 26-29%.

---

## Per-File Detailed Breakdown

### 1. SKILL.md — Router (93 lines, 16% automatable)

The router is almost entirely human-architected. A script can supply the raw ingredient list (component names, sub-component counts) but cannot construct the routing logic, progressive loading strategy, or composition rules.

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| YAML frontmatter | 11 | 0 | 0 | 11 | Trigger phrases are human-curated |
| Title + import note | 3 | 2 | 0 | 1 | Import path + "all accept css" from barrel export |
| Routing Table | 19 | 5 | 0 | 14 | Component names (A); intent keywords + route decisions (C) |
| Progressive Loading Strategy | 11 | 0 | 0 | 11 | Pure architecture decisions |
| Multi-Skill Composition | 13 | 0 | 0 | 13 | Composition order + examples |
| Available Skills | 22 | 7 | 5 | 10 | Component names (A); categories/counts (B); descriptions (C) |
| Fallback Behavior | 8 | 0 | 0 | 8 | Decision logic |

**What a script could generate**: A list of all exported components with sub-component counts, grouped by source directory. Everything else — the routing table, composition order, loading strategy, fallback logic — is architectural knowledge.

---

### 2. foundation/design-tokens/SKILL.md (91 lines, 36% automatable)

Token names and values come straight from `theme-2021.ts`. But the interpretation layer — which token to use when, anti-patterns, the color decision guide — is human knowledge.

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| YAML frontmatter | 8 | 0 | 0 | 8 | |
| Title + intro | 3 | 2 | 0 | 1 | Import path, $token syntax |
| Golden Rule | 6 | 0 | 0 | 6 | "NEVER raw CSS" is policy |
| Two-Tier Color System | 10 | 3 | 3 | 4 | Token counts (A); prefix groupings (B); tier concept + "never in components" (C) |
| Color Decision Guide | 8 | 0 | 0 | 8 | Every entry is non-obvious human guidance |
| Semantic Color Sets table | 11 | 5 | 2 | 4 | Token names (A); grouping (B); "never mix" rule (C) |
| Spacing & Sizing | 7 | 4 | 0 | 3 | Token names/values (A); usage associations ($space1=icon gaps) (C) |
| Typography | 7 | 5 | 0 | 2 | All token names/values (A); "ONLY these two weights" emphasis (C) |
| Shadows, Radii, Z-Index | 5 | 5 | 0 | 0 | Pure token enumeration |
| Cross-Scale References | 6 | 0 | 3 | 3 | Syntax pattern (B); practical examples (C) |
| Anti-Patterns | 9 | 0 | 0 | 9 | Every anti-pattern is human curation |
| Reference link | 1 | 0 | 0 | 1 | |

**What a script could generate**: Complete token tables — every token name, value, and scale. The `theme-2021.ts` file is a structured object with `colors`, `space`, `fontSizes`, `radii`, `shadows`, `zIndices` keys, all directly parseable. Heuristics could group tokens by prefix ($bg*, $text*, $icon*, $border*) and count them.

**What requires human knowledge**: The golden rule, the decision guide ("Card bg: $bgAccent not $bgDefault"), anti-patterns, semantic grouping rules ("never mix status sets"), and cross-scale reference patterns.

---

### 3. foundation/stitches-patterns/SKILL.md (128 lines, 34% automatable)

The Stitches utility configuration is extractable from the `stitches.config.ts` utils object. But usage patterns, gotchas, and constraints require human knowledge.

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| YAML frontmatter | 8 | 0 | 0 | 8 | |
| Title + imports | 3 | 3 | 0 | 0 | Import names + Stitches version from package.json |
| Custom Utilities (7 subsections) | 45 | 14 | 9 | 22 | Utility names + config (A); CSS output (B); code examples + "never override timing" (C) |
| Responsive Design | 17 | 5 | 4 | 8 | Breakpoint values + hooks (A); min-width = mobile-first (B); "prefer CSS over JS" (C) |
| Variants | 16 | 5 | 3 | 8 | Stitches syntax (A); pattern (B); illustrative code (C) |
| css Prop Composition | 17 | 2 | 3 | 12 | "Spread css LAST" gotcha (C); cross-scale syntax (B); cast requirement (C) |
| Theming | 5 | 3 | 0 | 2 | usePicnicStyles, theme names (A); createTheme (A) |
| Constraints | 10 | 0 | 2 | 8 | Focus token count (B); all constraints are human knowledge |

**What a script could generate**: The complete utils config (spacing shorthands, focusVisible, defaultTransition, maxLines, grid utils, safariOnly, listStyleOverride) including their input/output types. Breakpoint names and values. Theme names and their override counts.

**What requires human knowledge**: "Stack gap silently stripped", "never override timing", "spread css LAST", the `as unknown as PicnicCss` cast requirement, "Stitches only — never Tailwind", and all code examples.

---

### 4. foundation/layout-primitives/SKILL.md (108 lines, 32% automatable)

Props and sub-component names are extractable; layout guidance and gotchas are human knowledge.

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| YAML frontmatter | 7 | 0 | 0 | 7 | |
| Title + imports | 3 | 3 | 0 | 0 | Component names + import |
| Decision Guide | 8 | 0 | 0 | 8 | "Stack > Grid > Box" hierarchy |
| Box | 9 | 2 | 2 | 5 | `as` prop (A); polymorphic (B); use case guidance (C) |
| Stack | 13 | 4 | 0 | 9 | Props + defaults (A); "CRITICAL: uses margin NOT gap" (C) |
| Grid | 14 | 6 | 3 | 5 | Props + Cell sub (A); responsive mapping (B); examples (C) |
| PageLayout | 18 | 9 | 0 | 9 | Full sub-component hierarchy (A); code example (C) |
| FooterLayout | 3 | 1 | 0 | 2 | Existence (A); "fixed footer" purpose (C) |
| Separator | 8 | 3 | 2 | 3 | Props (A); Radix-based (B); semantic guidance (C) |
| Common Patterns | 7 | 0 | 0 | 7 | All composition patterns |
| Constraints | 8 | 1 | 1 | 6 | Default value (A); array mapping (B); all gotchas (C) |

**What a script could generate**: Complete prop interfaces for all 6 components, sub-component hierarchies (via `.displayName` or export assignments), default variant values.

**What requires human knowledge**: The decision guide hierarchy, "Stack uses margin NOT CSS gap" gotcha, all common patterns, and the "gap silently stripped" constraint.

---

### 5. problem/data-table/SKILL.md (115 lines, 26% automatable)

The compound hierarchy is extractable; sorting/selection patterns and the canonical example are human knowledge.

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| YAML frontmatter | 12 | 0 | 0 | 12 | |
| Title + imports | 2 | 2 | 0 | 0 | |
| Compound Hierarchy | 17 | 12 | 0 | 5 | Sub-names + props (A); "display: contents" note (C) |
| Column Sizing | 5 | 2 | 1 | 2 | Props (A); syntax (B); "mutually exclusive" (C) |
| Sorting | 3 | 1 | 0 | 2 | Props (A); state management guidance (C) |
| Selection | 3 | 1 | 0 | 2 | Component names (A); Set<id> pattern (C) |
| Cell Content | 3 | 0 | 1 | 2 | Embeddable components (B); cross-ref (C) |
| ContinuousScroll | 3 | 1 | 0 | 2 | Props (A); cross-ref to Paginator (C) |
| Canonical Example | 50 | 3 | 0 | 47 | Component names embedded (A); all code (C) |
| Common Mistakes | 8 | 0 | 0 | 8 | All gotchas |

**What a script could generate**: Table's complete sub-component tree with all prop interfaces, column/columnSizes/textVariant types, ContinuousScroll props.

**What requires human knowledge**: The canonical example, sorting/selection state management patterns, "display: contents means you cannot style rows", FocusWrapper usage, column count matching rule.

---

### 6. problem/form-builder/SKILL.md (159 lines, 28% automatable)

The Form namespace with all sub-components and their props is extractable. Decision guides, Formik auto-connection explanation, validation patterns, and the canonical example are human knowledge.

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| YAML frontmatter | 12 | 0 | 0 | 12 | |
| Title + imports | 2 | 2 | 0 | 0 | |
| When to Use | 4 | 0 | 0 | 4 | |
| Formik Auto-Connection Rule | 4 | 0 | 0 | 4 | Behavioral knowledge |
| Form Setup | 4 | 3 | 0 | 1 | Props + useForm hook (A) |
| Form Compound Hierarchy | 14 | 8 | 0 | 6 | Sub names + props (A); behavioral notes (C) |
| Input Type Decision Guide | 18 | 7 | 0 | 11 | Component names + props (A); "Need→Component" mapping (C) |
| Select Variants | 13 | 7 | 0 | 6 | Subs + props (A); behavioral notes (C) |
| FormField Layout | 15 | 6 | 0 | 9 | Subs + props (A); "Non-obvious" notes (C) |
| Validation Patterns | 5 | 1 | 0 | 4 | Yup reference (A); usage patterns (C) |
| Canonical Example | 46 | 2 | 0 | 44 | Component names (A); all code (C) |
| Standalone Usage | 5 | 0 | 0 | 5 | |
| Common Mistakes | 6 | 0 | 0 | 6 | |

**What a script could generate**: The Form namespace's complete sub-component list, all input component props, Select/MultiSelect/SearchableSelect sub-components, FormField layout props.

**What requires human knowledge**: The Formik auto-connection explanation, input type decision guide ("Need→Component"), validation patterns, standalone vs Form.* guidance, all code examples, and common mistakes.

---

### 7. problem/dialog-drawer/SKILL.md (137 lines, 29% automatable)

Sub-component hierarchies and prop types are extractable. Radix controlled pattern recognition, decision guide, and composition examples are human knowledge.

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| YAML frontmatter | 13 | 0 | 0 | 13 | |
| Title + imports | 2 | 2 | 0 | 0 | |
| Radix Controlled Pattern | 4 | 1 | 2 | 1 | Component list (A); Radix pattern (B); description (C) |
| Decision Guide | 10 | 0 | 0 | 10 | |
| StandardDialog | 14 | 7 | 0 | 7 | Subs + props (A); "Non-obvious" notes (C) |
| Dialog | 7 | 4 | 0 | 3 | Subs + props (A); behavioral notes (C) |
| StandardDrawer | 11 | 5 | 0 | 6 | Subs + props (A); notes (C) |
| Drawer | 4 | 2 | 0 | 2 | Props (A); "300ms close animation" (C) |
| Popover | 14 | 6 | 0 | 8 | Subs + props (A); variant descriptions (C) |
| DropdownMenu | 11 | 5 | 0 | 6 | Subs (A); notes (C) |
| Canonical Example | 29 | 1 | 0 | 28 | |
| Common Mistakes | 7 | 0 | 0 | 7 | |

---

### 8. problem/navigation/SKILL.md (84 lines, 27% automatable)

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| YAML frontmatter | 12 | 0 | 0 | 12 | |
| Title + imports | 2 | 2 | 0 | 0 | |
| Decision Guide | 9 | 0 | 0 | 9 | |
| Breadcrumbs | 13 | 3 | 0 | 10 | Subs + "extends LinkProps" (A); auto-styling + example (C) |
| TabGroup | 15 | 5 | 3 | 7 | Subs + props (A); Radix Tabs (B); example (C) |
| Paginator | 11 | 6 | 0 | 5 | Props + subs (A); "offset is page index NOT item offset" (C) |
| StepTracker | 9 | 3 | 0 | 6 | Props (A); step state derivation logic (C) |
| Common Mistakes | 6 | 0 | 0 | 6 | |

---

### 9. problem/feedback-notifications/SKILL.md (117 lines, 28% automatable)

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| YAML frontmatter | 13 | 0 | 0 | 13 | |
| Title + imports | 2 | 2 | 0 | 0 | |
| Decision Guide | 11 | 0 | 0 | 11 | |
| Banner | 22 | 10 | 2 | 10 | Props + variants (A); default icon mapping (B); notes (C) |
| Accordion | 11 | 4 | 0 | 7 | Props + subs (A); "variant required (unusual)" (C) |
| Tooltip | 13 | 4 | 0 | 9 | Subs + props (A); "CRITICAL: Provider at root" (C) |
| IconPopover | 5 | 3 | 0 | 2 | Props + defaults (A); "Convenience wrapper" (C) |
| Loading States | 13 | 3 | 0 | 10 | Props (A); "built-in screen reader text" + examples (C) |
| Canonical Example | 11 | 1 | 0 | 10 | |
| Common Mistakes | 7 | 0 | 0 | 7 | |

---

### 10. references/actions-ref.md (38 lines, 82% automatable)

The most automatable file type. Nearly pure component API documentation.

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| Header + import | 2 | 2 | 0 | 0 | |
| Button | 6 | 4 | 1 | 1 | Props + deprecation (A); polymorphic (B); "as prop" note (C) |
| IconButton | 3 | 3 | 0 | 0 | Pure props |
| ButtonBar | 3 | 2 | 1 | 0 | Props (A); primitive detection (B) |
| ButtonGroup | 6 | 6 | 0 | 0 | Props + subs |
| ButtonGroupNext | 6 | 4 | 0 | 2 | Props (A); "Updated API replacing ButtonGroup" (C) |
| PickerButton | 5 | 3 | 0 | 2 | Props (A); "Trigger for date pickers" (C) |

**What a script could generate**: 82% of this file — all prop names, types, variant enums, sub-component names, required props, and deprecation markers from JSDoc.

**What requires human knowledge**: The "basic→secondary" migration note, "Updated API replacing ButtonGroup" context, and "Shows chevron indicator" behavioral note.

---

### 11. references/typography-ref.md (23 lines, 70% automatable)

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| Header | 2 | 2 | 0 | 0 | |
| Heading | 5 | 4 | 0 | 1 | Props (A); "variant controls visual size; as controls semantic level" (C) |
| Text | 3 | 3 | 0 | 0 | Pure props |
| TextWithOverflowTooltip | 4 | 2 | 0 | 2 | Subs (A); "Shows tooltip when text overflows" (C) |
| Link | 4 | 2 | 0 | 2 | Props (A); "Supports as prop for routing libraries" (C) |

---

### 12. references/data-display-ref.md (33 lines, 76% automatable)

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| Header | 2 | 2 | 0 | 0 | |
| Badge | 5 | 3 | 0 | 2 | Props (A); "NO secondary variant" + usage note (C) |
| Tag | 3 | 3 | 0 | 0 | Pure props |
| ContainedLabel | 6 | 6 | 0 | 0 | Props + subs |
| ProgressBar | 3 | 3 | 0 | 0 | Pure props |
| List | 4 | 4 | 0 | 0 | Props + subs |
| Card | 4 | 2 | 0 | 2 | Props (A); "interactive enables hover lift" (C) |

---

### 13. references/media-ref.md (42 lines, 88% automatable)

The most automatable file. Almost entirely prop/type documentation.

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| Header | 2 | 2 | 0 | 0 | |
| Icon | 5 | 4 | 1 | 0 | Props (A); discriminated union (B) |
| ThirdPartyIcon | 3 | 3 | 0 | 0 | |
| IconCircle | 4 | 4 | 0 | 0 | |
| ThirdPartyIconCircle | 3 | 3 | 0 | 0 | |
| ResponsiveImage | 3 | 3 | 0 | 0 | |
| ImagePreview | 3 | 3 | 0 | 0 | |
| Logomark | 3 | 3 | 0 | 0 | |
| Wordmark | 3 | 3 | 0 | 0 | |
| Emoji | 4 | 3 | 0 | 1 | Props (A); "Renders role=img" (C) |

---

### 14. validator/SKILL.md (238 lines, 42% automatable)

The largest file. Valid enum values and required prop lists are extractable; the rules themselves (what constitutes a violation, what the fix should be) are human knowledge.

| Section | Lines | A | B | C | Notes |
|---------|------:|:-:|:-:|:-:|-------|
| YAML frontmatter | 9 | 0 | 0 | 9 | |
| Intro + severity | 7 | 0 | 0 | 7 | |
| V: Variant Restrictions (20) | 36 | 18 | 0 | 18 | Valid enum lists (A); "→ fix" mappings (C) |
| R: Required Props (20) | 28 | 14 | 0 | 14 | Required prop detection (A); consequence descriptions (C) |
| D: Deprecated Patterns (10) | 18 | 5 | 6 | 7 | @deprecated markers (A); Form.* pattern (B); migration guidance (C) |
| T: Type Discriminations (10) | 18 | 9 | 0 | 9 | TS discriminated types (A); behavioral notes (C) |
| S: Styling Rules (15) | 23 | 7 | 5 | 11 | Token names (A); mapping rules (B); policy decisions (C) |
| C: Composition Rules (25) | 33 | 23 | 0 | 10 | Parent-child structure (A); specificity notes (C) |
| A: Accessibility Rules (12) | 20 | 6 | 0 | 14 | Required props (A); ARIA behavioral notes (C) |
| K: Token Rules (13) | 21 | 8 | 0 | 13 | Token lists (A); "must use" policy (C) |
| Rule Summary table | 16 | 0 | 5 | 11 | Counts (B); severity classification (C) |

---

## Classification Definitions (with Source Evidence)

### A — Source Extractable

These data points live in the code as structured, parseable artifacts:

| Data Point | Source Location | Extraction Method |
|-----------|----------------|-------------------|
| Component names | `src/index.ts` barrel exports | AST: `export * from './X'` |
| Prop names + types | Component `.tsx` interface declarations | AST: interface members |
| Variant enum values | `styled()` → `variants` object keys | AST: object literal keys in `variants` |
| Sub-component names | `Component.Sub = SubComponent` assignments | AST: member expression assignments |
| Token names + values | `src/themes/theme-2021.ts` object | AST: object literal |
| Default variant values | `styled()` → `defaultVariants` object | AST: object literal |
| Required props | Non-optional TypeScript interface members | AST: `?` absence on interface member |
| Deprecated markers | JSDoc `@deprecated` annotations | AST: JSDoc tags |
| Radix imports | `import ... from '@radix-ui/*'` | AST: import declarations |
| Formik connections | Form namespace `compositeComponent()` call | AST: function call arguments |
| Dark theme overrides | `src/themes/theme-dark.ts` | AST: object literal |

### B — Derivable with Heuristics

| Data Point | Heuristic Rule | Confidence |
|-----------|---------------|------------|
| Component categories | Group by `src/components/` subdirectory | High |
| Compound component hierarchy | Follow `.displayName` + export assignments | High |
| Radix-based components | Has `@radix-ui` import → "Radix-based" | High |
| Formik-connected inputs | Listed in Form's `compositeComponent()` → "auto-connects" | High |
| Token prefix groupings | `$bg*`, `$text*`, `$icon*`, `$border*` regex grouping | High |
| Mobile-first responsive | Breakpoints use `min-width` → "mobile-first" | Medium |
| Polymorphic components | Has `as` prop in types → "polymorphic" | High |
| Discriminated unions | `mode: 'presentational'` requires `description` in TS | Medium |
| Banner default icons | Default values in styled variant definitions | Medium |
| Token counts per prefix | Count tokens matching `$bg*` etc. in theme | High |

### C — Human Knowledge Required

| Content Type | Why It Can't Be Automated | % of Total |
|-------------|--------------------------|:----------:|
| Decision guides ("when to use X vs Y") | Requires understanding of UI patterns and trade-offs | 12% |
| Anti-patterns and gotchas | Discovered through use, not visible in code | 15% |
| Canonical code examples | Illustrative, opinionated, context-dependent | 18% |
| Common Mistakes Checklists | Learned from real developer errors | 8% |
| "CRITICAL" behavioral notes | Silent failures not detectable from types | 5% |
| Routing table (intent → skill) | Architecture decision | 3% |
| Composition patterns ("Dialog with Form") | Cross-component experience | 5% |
| Validation fix suggestions ("→ use X") | Requires understanding the *right* alternative | 8% |
| Progressive loading strategy | Skill architecture | 2% |
| Naming gotchas ($iconInfo not $iconInformational) | Inconsistencies only found by reading code carefully | 2% |

---

## Automation Opportunity by File Type

| File Category | Files | Avg A+B % | Automation Strategy |
|--------------|:-----:|:---------:|-------------------|
| **References** | 4 | **79%** | Highest ROI. Generate prop tables, variant lists, sub-components from AST. Add human "notes" column manually. |
| **Validator** | 1 | **42%** | Generate valid enum lists and required prop lists. Rules + fixes need human curation. |
| **Foundation** | 3 | **34%** | Generate token tables and utility configs. Decision guides, gotchas need human writing. |
| **Problem skills** | 5 | **28%** | Generate compound hierarchies + prop lists. Everything else (guides, examples, mistakes) is human. |
| **Router** | 1 | **16%** | Lowest ROI for automation. Component list is the only extractable part. |

---

## Recommendations for the Generation Pipeline

### Generate First (A+B), Curate Second (C)

1. **Reference files are the sweet spot**: A script generating `references/*.md` files from AST would produce 79% of the content automatically. The remaining 20% is "notes" — one-liner human annotations.

2. **Token tables are fully generatable**: The missing `token-tables.md` reference can be 100% generated from `theme-2021.ts` (all token names, values, prefix groups, dark theme overrides).

3. **Validator enum lists save the most maintenance effort**: When a component adds a new variant, the valid enum list in 20 V-rules must update. Generating these from source eliminates the highest-frequency maintenance burden.

4. **Problem skills need a template, not a generator**: The 72% human content in problem skills means a generator can produce the skeleton (hierarchy tree, prop table) but the decision guide, examples, and gotchas must be hand-written.

5. **The router cannot be generated**: At 84% human knowledge, the router is a pure architecture artifact. A script can only refresh the component inventory in the "Available Skills" section.

### Proposed Hybrid Workflow

```
Source code (AST) → Extract A data → Generate skeleton files
                                          ↓
                  Human author → Fill C sections (guides, examples, gotchas)
                                          ↓
                  Validator check → Ensure A data matches current source
```

This means the pipeline has two modes:
- **Initial generation**: Produce reference files and skill skeletons
- **Drift detection**: Compare A-classified content against current source and flag staleness
