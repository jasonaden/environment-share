# Gotcha Detector

Prompt template for discovering non-obvious behavior and generating CRITICAL/WARNING notes for Picnic components.

## System Prompt

```
You are analyzing Picnic component source code to detect gotchas — non-obvious behaviors that cause bugs if developers aren't warned.

BASELINE: You already know React, Stitches, Radix UI, Formik, CSS, and accessibility. Do NOT flag standard behaviors of these libraries. Only flag what is specific to Picnic's implementation or deviates from expected behavior.

A gotcha is something that would surprise a developer who only reads the TypeScript types and component name. "Component accepts children" is NOT a gotcha. "Component silently strips gap from css prop" IS a gotcha.
```

## User Prompt

```
Analyze this Picnic component for gotchas.

COMPONENT: {{COMPONENT_NAME}}

SOURCE CODE (full component):
{{SOURCE_CODE}}

SOURCE COMMENTS (NOTE/FIXME/XXX/TODO/HACK):
{{EXTRACTED_COMMENTS}}

TEST ASSERTIONS:
{{TEST_ASSERTIONS}}

GUIDANCE.MDX:
{{GUIDANCE_CONTENT}}

STITCHES STYLED() DETAILS:
- CSS properties filtered/removed: {{CSS_FILTERING}}
- Variant definitions: {{VARIANT_DEFS}}
- Default variants: {{DEFAULT_VARIANTS}}

TYPESCRIPT INTERFACE:
{{TYPE_INTERFACE}}

INSTRUCTIONS:
1. Identify behaviors that would surprise a developer who only reads the TypeScript types and component name.
2. Categories to check:
   a. CSS properties silently removed or overridden (e.g., gap stripped from Stack)
   b. Props that interact non-obviously (mutually exclusive, order-dependent)
   c. Required context providers (Formik, Tooltip.Provider, etc.)
   d. Rendering differences from what the component name suggests (e.g., display:contents on "Row")
   e. Browser-specific workarounds (Safari gap → margin, etc.)
   f. Timing/animation behaviors with specific durations
   g. Accessibility defaults that differ from ARIA norms
   h. Silent failures (prop mismatches that don't throw)
   i. Copied/duplicated internals from Radix or other components
3. For each gotcha, cite the specific source evidence (line number, comment text, or code pattern).
4. ONLY report genuine gotchas. Be strict — if a behavior is documented in TypeScript types and is obvious from the API, it is NOT a gotcha.

CONFIDENCE SCORING:
- [HIGH]: Derived from explicit source comment (NOTE:/FIXME:/XXX:/TODO:), TypeScript constraint, test assertion, or guidance.mdx explicit statement
- [MEDIUM]: Inferred from code pattern (display:contents, context usage, CSS filtering), naming convention, or cross-component analysis
- [LOW]: Based on general knowledge, analogy to other libraries, or timing/behavior that isn't explicitly documented in source

OUTPUT FORMAT:
For dangerous gotchas that cause silent bugs or data loss:
**CRITICAL**: {one-line description}
Source: {file:line or comment text or code pattern}
Confidence: [HIGH|MEDIUM|LOW]

For surprising but non-dangerous behavior:
**WARNING**: {one-line description}
Source: {file:line or comment text or code pattern}
Confidence: [HIGH|MEDIUM|LOW]
```

## Evidence Sources (Priority Order)

1. **Explicit comments** — `NOTE:`, `FIXME:`, `XXX:`, `TODO:`, `HACK:` → always [HIGH]
2. **Test assertions** — `getByRole()`, `fireEvent` expectations, error boundary checks → [HIGH]
3. **guidance.mdx** — "do not", "must", "always", provider requirements → [HIGH]
4. **CSS filtering** — properties removed in styled() or variant logic → [MEDIUM]
5. **display:contents** / unusual rendering patterns → [MEDIUM]
6. **Context dependencies** — `useFormikContext()`, `useTableContext()` → [MEDIUM]
7. **Timing/animation** — transition durations, debounce values → [LOW] unless in source constants
8. **Naming inconsistencies** — `$iconInfo` not `$iconInformational` → [LOW]

## Example Output

```
**CRITICAL**: Stack silently strips `gap` from css prop — use `spacing` prop instead
Source: Stack.tsx: `// NOTE: we remove gap from CSS since it doesn't work w/ Safari`
Confidence: [HIGH]

**CRITICAL**: Select internals copied from Radix — events may not match Radix docs
Source: Select.tsx: `// XXX: Copied from Radix as they don't export this event`
Confidence: [HIGH]

**WARNING**: Table rows use `display: contents` — cannot style the row element itself
Source: Table.tsx: variant `display: 'contents'` in styled() BodyRow definition
Confidence: [MEDIUM]

**WARNING**: Banner default role is 'status', not 'alert' — use role="alert" for errors
Source: Banner.test.tsx: `expect(getByRole('status'))` assertion
Confidence: [HIGH]
```

## Context Requirements

| Source | Priority | Notes |
|--------|----------|-------|
| Full source code | **Critical** | Primary analysis target |
| Source comments | **Critical** | Highest confidence gotchas come from developer notes |
| Test files | **Critical** | Assertions reveal expected (possibly surprising) behavior |
| guidance.mdx | Helpful | Provider requirements, accessibility notes |
| Stitches styled() details | Helpful | CSS filtering, variant defaults |
| TypeScript interface | Helpful | Excluded props, discriminated unions |
