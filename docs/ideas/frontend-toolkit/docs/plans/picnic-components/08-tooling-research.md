# 08 — Tooling Research: Extraction Approaches for Picnic Skill Generation

## 1. Picnic Tech Stack Summary

| Aspect | Details |
|---|---|
| **TypeScript** | 5.4 |
| **React** | 18.1.0 |
| **Stitches** | @stitches/react 1.2.8, @stitches/core 1.2.8 |
| **Primitives** | Radix UI (accordion, checkbox, dialog, dropdown-menu, label, popover, progress, radio-group, separator, slot, switch, tabs, tooltip, visually-hidden) |
| **Downshift** | 6.1.0 (Select, MultiSelect, SearchableSelect) |
| **Polymorphic** | react-polymorphic-box 3.0.3 (Button, IconButton, Link) |
| **Build** | NX monorepo, Vite, vitest |
| **Docs** | Storybook 9.1.17 (with MDX guidance files) |
| **Icons** | 160 SVG icons via @svgr codegen |
| **Existing codegen** | `figma:icons` script only — no component docs extraction exists |
| **react-docgen** | **Not installed** |

## 2. Component Pattern Taxonomy

From examining 15+ components, the codebase uses exactly **4 patterns**:

### Pattern A: Pure Styled Component (simplest)
```
const X = styled('element', { variants: { ... }, defaultVariants: { ... } });
```
**Examples:** Heading, Text, Badge, Card, Box, Separator, ProgressBar
**Extraction:** Trivial — variants are literal objects in `styled()` call.

### Pattern B: Styled + Wrapper FC
```
const XPrimitive = styled('element', { variants: { ... } });
const X: FC<XProps> = (props) => <XPrimitive ... />;
```
**Examples:** Button, IconButton, PickerButton, LoadingIndicator
**Extraction:** Need to follow from FC props interface → styled primitive variants. The FC may add/remove/rename props (e.g., Button adds `loading`, removes `disabledVisually`).

### Pattern C: Compound Component (composite with sub-components)
```
const XComponent: FC<XProps> = ({ children }) => { ... };
const X = XComponent as CompositeComponent;
X.Header = ...; X.Content = ...; // etc.
```
**Examples:** Dialog (5 subs), Select (5 subs), Banner (4 subs), FormField (4 subs), Table (11 subs), Accordion, DropdownMenu, Drawer, Popover, Breadcrumbs
**Extraction:** Complex — need to identify sub-component assignments (`X.Sub = ...`), each sub-component may itself be Pattern A or B. The composite interface declaration lists all subs.

### Pattern D: Pure FC (no styled primitive, props-only)
```
const X: FC<XProps> = ({ spacing, direction, children }) => { ... };
```
**Examples:** Stack, Grid, ContinuousScroll
**Extraction:** Props come from TypeScript interfaces only — no Stitches variants to extract. Must parse interface declarations.

## 3. Theme Token Structure

Tokens are defined in `src/themes/theme-2021.ts` as a **single plain object export** (`export const theme2021 = { ... }`):

| Token Scale | Count | Example Keys |
|---|---|---|
| borderWidths | 4 | borderWidth0–borderWidth3 |
| colors | ~100 perceptual + ~100 functional | grayscale0–1000, bgDefault, textDefault, etc. |
| fonts | 2 | display (Ginto Nord), body (Ginto Normal) |
| fontSizes | 7 | fontSize1–fontSize7 (0.75rem–2rem) |
| fontWeights | 2 | regular (400), bold (500) |
| letterSpacings | 3 | letterSpacing0–letterSpacing2 |
| lineHeights | 7 | lineHeight1–lineHeight7 |
| radii | 4 | radius1–radius3, radiusMax |
| shadows | 6 | focus, inputFocus, drastic, shadow1–shadow4 |
| sizes | 17 + breakpoints | size0–size16 + bp1–bp4 |
| space | 17 | space0–space16 |
| zIndices | 6 | layer0–layer4, layerMax |

Dark theme (`theme-dark.ts`) extends theme2021, only overriding ~15 color tokens.
Breakpoints defined in `src/media.ts`: bp1(640px) bp2(768px) bp3(1024px) bp4(1280px).
Stitches utils in `src/utils/`: space shorthands (p/m/px/py/etc.), focusVisible, defaultTransition, grid, list, maxLines, browser.

## 4. Extraction Approach Evaluation

### A. TypeScript Compiler API (ts-morph)

**What it extracts:** Interfaces, type aliases, exported symbols, JSDoc comments, re-exports, union types, intersection types.

**Reliability for Picnic:**
- **Interfaces (Pattern B, C, D):** High — can resolve `interface ButtonProps extends Omit<...>` and compute effective prop types.
- **Stitches VariantProps:** Medium — `VariantProps<typeof X>` requires evaluating the `styled()` return type, which is a complex generic. The TS compiler CAN resolve this, but it's slow and requires full project compilation.
- **Composite sub-components:** High — can find `X.Sub = ...` assignments and trace types.
- **Default values:** Medium — can parse default function params and `defaultVariants` objects.

**Complexity:** High. Requires initializing a full TypeScript project with all dependencies resolved. The Stitches type system is deeply generic.

**Maintenance:** Medium. Changes to component patterns don't break extraction, but TS compiler API version changes do.

**Verdict:** Overkill for the actual patterns in this codebase.

### B. react-docgen / react-docgen-typescript

**What it extracts:** Component prop tables with types, defaults, descriptions. Auto-detects React components.

**Reliability for Picnic:**
- **Pattern A (pure styled):** Low — react-docgen struggles with Stitches `styled()` components. It expects standard React.FC or class components.
- **Pattern B (styled + FC):** Medium — can extract the FC's props interface, but misses variant details.
- **Pattern C (compound):** Low — doesn't understand `X.Sub = ...` compound patterns.
- **Pattern D (pure FC):** High — standard React component, works well.

**Complexity:** Low to install, but would require significant post-processing to handle Stitches-specific patterns.

**Maintenance:** Medium. Library updates may change extraction behavior.

**Verdict:** Poor fit. The majority of Picnic components use Stitches patterns that react-docgen doesn't handle well.

### C. Stitches-Specific AST Extraction (RECOMMENDED)

**What it extracts:** Variant definitions, defaultVariants, compoundVariants from `styled()` calls.

**Reliability for Picnic:**
- **Pattern A:** Very High — `styled('element', { variants: { ... } })` is always a plain object literal. The variants object can be extracted with simple AST parsing or even regex.
- **Pattern B:** High — extract variants from the `styled()` call, then extract additional props from the FC interface.
- **Pattern C:** High — combine sub-component detection with per-sub extraction.
- **Pattern D:** N/A — no styled call, fall through to interface parsing.

**Key observation:** In the Picnic codebase, Stitches variants are **always inline literal objects** in `styled()` calls. They never use variables, computed values, or dynamic expressions for variant keys/values. This makes AST extraction trivially reliable.

**What the AST needs to capture from `styled()` calls:**
```
1. Base element: styled('button', ...) or styled(RadixComponent, ...)
2. variants: { variantName: { value1: {...}, value2: {...} } }
3. defaultVariants: { variantName: 'value1' }
4. compoundVariants (for documentation of combined behaviors)
```

**Complexity:** Medium. Use `@babel/parser` to parse TSX, then walk the AST for `styled()` calls and extract the config object. ~200-300 lines of script.

**Maintenance:** Low. Stitches `styled()` API is stable (project is archived/complete). Component patterns are consistent across the codebase.

**Verdict:** Best fit for the actual codebase. Exploits the fact that variant definitions are always literal objects.

### D. Theme/Token Extraction

**What it extracts:** All design tokens from `theme2021` object.

**Reliability:** Very High — `theme-2021.ts` exports a single plain object with string literal values. No computed values, no function calls, no imports (except `bpWidths` which is also a plain object).

**Approach options:**
1. **Import and serialize:** `require('./theme-2021')` and JSON.stringify. Requires TS compilation.
2. **AST parse:** Parse the file, extract the object literal. Reliable, no compilation needed.
3. **Regex:** The file is simple enough that regex on `key: 'value'` pairs works. Fragile but fast.

**Recommended:** AST parse (`@babel/parser`). Same tooling as component extraction.

**Complexity:** Low. Single file, single export, ~300 lines.

**Maintenance:** Very Low. Token files change infrequently.

### E. Full AST Parsing (ts-morph / @babel/traverse)

**What it extracts:** Everything — any pattern can be handled with enough work.

**Reliability:** Very High — limited only by implementation completeness.

**Complexity:** Very High for general purpose. Medium if scoped to the 4 known patterns.

**Maintenance:** High for general purpose. Medium if scoped.

**Verdict:** Overlaps with option C. Use @babel/parser (lighter) rather than ts-morph (heavier) since we don't need full type resolution.

### F. Storybook Metadata

**What it extracts:** `argTypes`, `args` (defaults), `component` references, MDX guidance content.

**Reliability for Picnic:**
- Stories exist for most components (confirmed: Button, Heading, Stack, Dialog, Select, Badge, Card, FormField, etc.)
- `argTypes` in stories mirror variant options (e.g., Button stories list all variants and sizes)
- MDX `guidance.mdx` files exist for ~8 components (Button, Box, Dialog, Heading, etc.)

**Limitations:**
- Not all components have `argTypes` — some stories just render showcases
- Story args may lag behind actual component definitions
- No machine-readable format — would need to parse TSX story files

**Complexity:** Medium — parse story files for argTypes objects.

**Maintenance:** Medium — stories change when components change, may drift.

**Verdict:** Useful as supplementary data (descriptions, usage guidance) but not primary source of truth for props/variants. The `guidance.mdx` files contain human-written context that's valuable.

### G. Simple grep/regex + Index Parsing

**What it extracts:** Component list from `index.ts`, `export` statements, `styled()` calls, `displayName` assignments.

**Reliability for Picnic:**
- Component list: Very High — `src/components/index.ts` re-exports everything
- Sub-component detection: High — `X.Sub = ...` and `X.Sub.displayName = 'X.Sub'` are consistent patterns
- Variant extraction via regex: Medium-High — `variants: {` blocks are formatted consistently, but nested objects make pure regex fragile
- Icon list: Very High — just list files in `icon-set/icons/`

**Complexity:** Very Low — shell scripts with grep/sed/awk.

**Maintenance:** Low — patterns are stable.

**Verdict:** Excellent for component inventory and sub-component detection. Insufficient for full variant extraction (use AST for that).

## 5. Recommended Pipeline

### Tier 1: Use Immediately (No Build Required)
| Step | Tool | Extracts |
|---|---|---|
| Component inventory | `index.ts` parsing | All 58 exported component names |
| Sub-component detection | grep for `.displayName =` | All compound sub-components |
| Icon list | `ls icon-set/icons/` | All 160 icon names |
| Token dump | Import `theme-2021.ts` | All token scales and values |
| Breakpoints | Parse `media.ts` | bp1–bp4 values |

### Tier 2: @babel/parser Script (~300 LOC)
| Step | Tool | Extracts |
|---|---|---|
| Variant extraction | AST walk of `styled()` calls | Variant names, values, defaults |
| Props extraction | AST walk of interface declarations | Non-variant props (loading, disabled, etc.) |
| Compound structure | AST walk for `X.Sub =` assignments | Sub-component tree |

### Tier 3: Supplementary (Optional)
| Step | Tool | Extracts |
|---|---|---|
| Usage guidance | Parse `guidance.mdx` files | Human-written docs for ~8 components |
| Story defaults | Parse `.stories.tsx` argTypes | Additional prop metadata |

## 6. Recommendation Matrix

| Approach | What It Extracts | Reliability | Complexity | Maintenance | Recommendation |
|---|---|---|---|---|---|
| **A. TS Compiler API** | Full type info, resolved generics | High | High | Medium | Skip — overkill for literal objects |
| **B. react-docgen** | Standard React props | Low for Stitches | Low | Medium | Skip — poor Stitches support |
| **C. Stitches AST** | Variants, defaults, base elements | Very High | Medium | Low | **PRIMARY — use this** |
| **D. Token extraction** | All design tokens | Very High | Low | Very Low | **YES — straightforward** |
| **E. Full AST (ts-morph)** | Everything | Very High | Very High | High | Skip — C is sufficient |
| **F. Storybook metadata** | Descriptions, argTypes | Medium | Medium | Medium | Supplementary only |
| **G. grep/regex** | Component list, subs, icons | High | Very Low | Low | **YES — for inventory** |

### Recommended Stack

```
Primary:   @babel/parser + @babel/traverse  (component variants + props)
Secondary: grep/ls/regex                     (component inventory, icons, sub-components)
Tokens:    @babel/parser or direct import    (theme token extraction)
Format:    Custom formatter                   (output compact skill notation)
```

### Why NOT ts-morph or TypeScript Compiler API

The critical insight is that Picnic's Stitches usage is **always literal objects**. There are no:
- Computed variant keys (`[dynamic]: { ... }`)
- Spread variants from imported objects (`...externalVariants`)
- Conditional variant definitions
- Type-level-only variants (everything is runtime-visible)

This means we never need type resolution to extract variants — simple AST parsing of the object literal is sufficient and much more maintainable.

## 7. Output Format Considerations

The target skill notation is:
```
props: variant(primary*|secondary|subdued) size(small|medium*|large) loading(boolean)
```

Where:
- `*` marks the default value
- `!` prefix marks required props
- `(Type)` for non-enum props
- Values from Stitches `variants` keys become the enum options
- Values from `defaultVariants` get the `*` marker

**Props to EXCLUDE from output:**
- `css` — universal Stitches prop, documented once globally
- `as` — polymorphic prop, documented where relevant
- `children` — standard React prop
- `ref` — standard React ref
- `className` — standard HTML
- `style` — standard HTML
- Internal variants like `disabledVisually` (Button) — mapped from public props
- Stitches utility props: `p`, `m`, `px`, `py`, `mx`, `my`, `pt`, `pr`, `pb`, `pl`, `mt`, `mr`, `mb`, `ml`

**Props to TRANSFORM:**
- Boolean variants (`interactive: { true: {}, false: {} }`) → `interactive(boolean)`
- `disabled` (HTML native) → include only if component adds visual handling
- `variant` enum values should preserve order from source

## 8. Estimated Script Structure

```
extract-picnic-metadata.ts
├── parse-theme()        → tokens JSON
├── parse-media()        → breakpoints JSON
├── list-components()    → component inventory from index.ts
├── list-icons()         → icon names from icon-set/icons/
├── parse-component(file)
│   ├── extract-styled-variants()   → { variants, defaultVariants }
│   ├── extract-interface-props()   → additional FC props
│   └── extract-sub-components()    → compound children
├── format-skill-notation(metadata) → compact notation string
└── generate-skill-file(all)        → complete skill markdown
```

## 9. Key Risk: Compound Components

The hardest extraction target is compound components like Table (11 sub-components), Dialog (5), and Select (5). Each sub-component may have its own variants, and the relationship between parent and child props requires human judgment to document well.

**Mitigation:** Extract sub-component props mechanically, but the skill organization (which props to emphasize, usage notes, decision trees) must remain human-authored. The script generates a **data layer** that humans compose into **skill documents**.

## 10. Conclusion

A `@babel/parser`-based extraction script is the right tool for this codebase. It exploits the key architectural property that Stitches variant definitions are always literal objects, avoiding the need for full TypeScript type resolution. Combined with simple grep/regex for inventory data and direct parsing for tokens, this provides a reliable, low-maintenance pipeline for generating skill reference data.

The script should output structured JSON that a separate formatter converts to skill notation. This separation allows the extraction logic to remain stable while the output format evolves with the skill system.
