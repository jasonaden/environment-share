# 2. Style Guide — Compact Format Specification

This section defines the authoritative format for all Picnic skill and reference files. Every file in the picnic-components skill tree MUST conform to these rules.

---

## 2.1 Design Principles

| # | Principle | Implication |
|---|-----------|-------------|
| 1 | **Names are documentation** | If the component/token/prop name describes itself, don't add prose. `$bgActionPrimary` needs no "Purpose" column. |
| 2 | **Claude knows the underlying libraries** | Never explain Stitches, Radix, Formik, Yup, CSS, or React. Document only what Picnic adds on top. |
| 3 | **One canonical home per concept** | Every piece of knowledge lives in exactly one file. Cross-reference with inline pointers, never duplication. |
| 4 | **Skills teach; references look up** | Skills contain rules, patterns, decision guides, anti-patterns. References contain lookup tables (props, tokens, variant values). |
| 5 | **Compact > verbose** | Inline notation over tables, tables over prose, prose only for non-obvious behavior. |

---

## 2.2 Component Entry Format

Used in all reference files. Each component is a self-contained block:

```
## ComponentName
Primitive: X
Sub: .A .B .C
props: propName(value1|value2*|value3) anotherProp(type)
SubName: propName(!type) anotherProp(value1|value2)
notes: Only non-obvious behavior or gotchas
deprecated: oldValue → newValue
```

### Notation Rules

| Symbol | Meaning | Example |
|--------|---------|---------|
| `*` after value | Default value | `variant(primary*\|secondary)` — `primary` is default |
| `!` before prop | Required prop | `!onChange` — must be provided |
| `(type)` | Type annotation | `(boolean)`, `(number)`, `(string)`, `(fn)`, `(ReactNode)`, `(IconName)` |
| `(val1\|val2*)` | Enum with default | `size(small\|medium*\|large)` — `medium` is default |
| `.` prefix | Sub-component | `Sub: .Header .Body .Footer` |

### Structural Rules

- One blank line between component entries
- Sub-components listed with `.` prefix in a flat list on the `Sub:` line
- Sub-component props documented only when non-obvious — wrapper subs that just take `children` get zero docs
- `props:` line documents root component props; `SubName:` lines document sub-component props
- Self-documenting subs (`.Header`, `.Body`, `.Content`, `.Trigger`) need zero additional documentation

### Example: Compact vs Verbose

**Before (verbose — DO NOT do this):**
```markdown
## Button

Button is a clickable action element.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | "primary" \| "secondary" \| "basic" | "primary" | The visual style |
| size | "small" \| "normal" \| "large" | "normal" | The size of the button |
| loading | boolean | false | Shows a spinner |
| disabled | boolean | false | Disables the button |
| css | PicnicCss | — | Stitches CSS overrides |
| children | ReactNode | — | Button content |

### Related Components
See IconButton for icon-only buttons.
```

**After (compact — correct):**
```
## Button
props: variant(primary*|secondary|basic) size(small|normal*|large) loading(boolean)
```

That's it. 1 line replaces 15. `disabled`, `css`, `children`, and "Related Components" are all omitted per global rules.

---

## 2.3 "Never Document" Props

These props appear on all/most components and are universally understood. Omit from all entries unless they have non-standard behavior in a specific component.

**Universal (omit always):**
- `css: PicnicCss`
- `children`
- `ref`
- `className` (forbidden in Picnic)
- `style` (forbidden in Picnic)

**Standard HTML (omit unless non-standard):**
- `disabled`, `placeholder`, `value`, `onChange`, `onSubmit`, `onClick`, `id`, `name`, `type`, `aria-label`

**Picnic universal (omit unless non-obvious default):**
- `as` (polymorphic) — only document when the component has a meaningful default element
- `loading` — only document for Button/IconButton

Instead, add a single header note to each reference file:

```
> All components: `import { X } from '@attentive/picnic'`. All accept `css: PicnicCss`.
```

---

## 2.4 Token Table Format

Used in the design-tokens reference file (`token-tables.md`).

### Basic Format

```
### $prefix — Category
$tokenName #hex →dark #darkHex
$tokenName2 #hex
```

### Rules

- Token name + hex on one line
- `→dark` suffix only for tokens that change in dark theme
- No "Purpose" column — the name IS the purpose
- Exception: add brief parenthetical for genuinely ambiguous tokens, e.g. `$bgSurface1 #FFFFFF (card backgrounds)`
- Group by prefix

### State Progressions

Use inline arrow notation for interactive state sequences:

```
Primary action: $bgActionPrimary #FFF382 → Hover #FFE600 → Pressed #F9D100 → Disabled rgba(...)
```

---

## 2.5 Skill File Template

Every `SKILL.md` follows this structure:

```markdown
---
name: skill-name
description: >
  When to invoke (specific trigger phrases, components covered)
---

# Skill Title

## Picnic Context (2-3 lines)
Import path, components covered, which library wrapper if relevant.

## [Domain-Specific Sections] (bulk of skill)
Component APIs, compound hierarchies, decision guides, prop tables.
ONLY Picnic-specific content. Never explain the underlying library.

## Constraints & Anti-Patterns (compact)
BAD → GOOD, one line each. Only real pitfalls.

## Common Mistakes Checklist
Per-skill validation items (3-5 rules).
```

### Section Guidelines

| Section | Content | Format |
|---------|---------|--------|
| Picnic Context | Import path, components list, library wrapper | 2-3 lines of prose |
| Domain sections | Component APIs, decision guides, patterns | Compact props notation, code blocks for non-obvious patterns only |
| Constraints | Real pitfalls only | `BAD → GOOD` one-liners |
| Common Mistakes | Validation checklist | 3-5 bullet rules |

### What Does NOT Belong in a Skill

- Generic explanations of underlying libraries
- Import statements per component (single import at top)
- Variant styling tables (internal token mappings)
- "Related Components" sections
- Multiple isolated trivial examples

---

## 2.6 Global Compression Rules (G1–G9)

These rules apply across ALL skills and references. They eliminate the largest cross-cutting waste categories.

| Rule | Description | Est. Savings |
|------|-------------|:------------:|
| **G1** | `css: PicnicCss` stated once per file header, never per-component | ~80 lines |
| **G2** | Never document `disabled: boolean` — universally understood | ~40 lines |
| **G3** | No "Related Components" sections — handled by router and skill structure | ~60 lines |
| **G4** | Radix controlled pattern (`open`, `defaultOpen`, `onOpenChange`) stated ONCE: "All overlay components follow the Radix controlled pattern" | ~36 lines |
| **G5** | All `Form.*` sub-components auto-connect to Formik via `name` prop — stated ONCE, not per-component | ~30 lines |
| **G6** | Never explain Stitches `styled()`, `css` prop, variants, responsive `@bp` — Claude knows these | ~100+ lines |
| **G7** | Never explain Radix primitives (Dialog, Tooltip, Accordion, Popover, DropdownMenu, Tabs, etc.) — Claude knows their APIs | ~100+ lines |
| **G8** | Never explain Formik/Yup concepts — Claude knows `initialValues`, `onSubmit`, `validationSchema`, etc. | ~80 lines |
| **G9** | One canonical example per skill, not multiple isolated examples | ~200 lines |

### Applying the Rules

- **G1–G3**: Enforced by the "Never Document" props list and reference file header
- **G4–G5**: Add a single statement in the relevant skill, never repeat per-component
- **G6–G8**: Delete all explanatory content about these libraries; document only Picnic's deviations
- **G9**: Combine key patterns into one realistic example per skill; remove all trivial standalone snippets

---

## 2.7 Format Grammar (BNF)

Formal grammar for the component entry format:

```bnf
entry       := header primitive? sub? props* notes? deprecated?
header      := "## " ComponentName
primitive   := "Primitive: " description
sub         := "Sub: " ("." SubName)+
props       := (context ": ")? propDef (" " propDef)*
propDef     := "!"? propName "(" values ")" | "!"? propName "(" type ")"
values      := value ("|" value)*
value       := literal "*"?          (* marks default *)
context     := "props" | SubName      (* "props" = root component *)
notes       := "notes: " text
deprecated  := "deprecated: " old " → " new
```

### Terminal Definitions

| Terminal | Definition |
|----------|-----------|
| `ComponentName` | PascalCase identifier (e.g., `Button`, `DataTable`) |
| `SubName` | PascalCase identifier for sub-component (e.g., `Header`, `SortableHeaderCell`) |
| `propName` | camelCase identifier (e.g., `variant`, `onChange`, `colSpan`) |
| `literal` | Unquoted string value (e.g., `primary`, `small`, `horizontal`) |
| `type` | One of: `boolean`, `number`, `string`, `fn`, `ReactNode`, `IconName`, or a domain type |
| `description` | Free-form text to end of line |
| `text` | Free-form text to end of line |

---

## 2.8 Claude Knowledge Baseline

Content in these domains MUST NEVER appear in any skill or reference file. Claude already knows this material at high confidence.

| Domain | Confidence | What to Never Explain |
|--------|:----------:|----------------------|
| **React** | Very High | Hooks, context, compound components, portals, `React.Children`, JSX, lifecycle |
| **TypeScript** | Very High | Generics, discriminated unions, `VariantProps` type extraction, utility types |
| **Stitches** | High | `styled()`, `css` prop, variants, `$tokens`, responsive `@bp` breakpoints |
| **Radix UI** | High | Dialog, Tooltip, Accordion, Popover, DropdownMenu, Tabs, Checkbox, RadioGroup, Switch — controlled/uncontrolled, `asChild`, focus trapping, keyboard nav |
| **Formik** | High | `Form`, `useFormik`, `initialValues`, `onSubmit`, validation, `Field`, `ErrorMessage` |
| **Yup** | High | `object()`, `string()`, `required()`, `email()`, conditional validation |
| **CSS** | Very High | Flexbox, grid, media queries, pseudo-classes, box-shadow, positioning |
| **Accessibility** | Very High | ARIA roles/attributes, keyboard navigation, screen reader behavior |
| **Design Systems** | High | Token concept, semantic colors, spacing scales, typography scales |

### The Test

Before writing any line, ask: "Would a senior React developer already know this?" If yes, omit it. Only document what is **specific to Picnic's implementation** — its component names, prop signatures, unique behaviors, gotchas, and deviations from the underlying libraries.

---

## 2.9 Writing Checklists

### For Reference Files

- [ ] Single header: `> All components: import { X } from '@attentive/picnic'. All accept css: PicnicCss.`
- [ ] Each component uses compact entry format (`## Name`, `Primitive`, `Sub`, `props`, `notes`)
- [ ] No import statements per component
- [ ] No usage examples
- [ ] No variant style tables (internal token mappings)
- [ ] No "Related Components" sections
- [ ] No `css`, `children`, `ref`, `disabled`, `placeholder` in props
- [ ] `*` marks defaults, `!` marks required

### For Skill Files

- [ ] No explanations of underlying libraries (Stitches, Radix, Formik, CSS)
- [ ] G1–G9 rules applied
- [ ] One canonical example combining all key patterns
- [ ] Compact props notation inline
- [ ] Only non-obvious behavior documented
- [ ] Sub-component descriptions only when name doesn't self-document
- [ ] Common Mistakes Checklist at end (3–5 rules)

### For Token Reference (`token-tables.md`)

- [ ] Compact inline format: `$token #hex →dark #darkHex`
- [ ] No "Purpose" column (except brief parenthetical for ambiguous tokens)
- [ ] No "Light Theme Value" column showing raw palette references
- [ ] State progressions as inline arrows
- [ ] Semantic color sets as compact table
- [ ] Raw palette as inline one-line-per-family format
- [ ] Zero code examples, zero anti-patterns (those live in the skill)
- [ ] Zero Stitches documentation (canonical home: `stitches-patterns`)

### Quality Gate (All Files)

Before shipping any file, verify:

1. **Every line contains Picnic-specific knowledge** Claude cannot infer from general React/Stitches/Radix knowledge
2. **No concept is documented in more than one file** across the entire skill tree
3. **File stays within its optimized target size** ±10%
4. **Compact notation is used consistently** per this style guide
