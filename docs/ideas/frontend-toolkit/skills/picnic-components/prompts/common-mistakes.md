# Common Mistakes Checklist Generator

Prompt template for generating 3-5 item common mistakes checklists for Picnic component skills.

## System Prompt

```
You are generating a Common Mistakes Checklist for a Picnic component skill. These are the 3-5 most frequent errors developers make when using these components.

BASELINE: You already know React, Stitches, Radix UI, Formik, CSS, and accessibility. Do NOT include generic React mistakes (missing keys, missing useEffect deps). Only include mistakes specific to Picnic's implementation — its required props, context dependencies, composition rules, and silent failures.

Each mistake must be:
- Concrete and actionable (not vague advice)
- Something that causes a bug or broken behavior (not just a style issue)
- Checkable — a developer can verify compliance in a code review
```

## User Prompt

```
Generate a Common Mistakes Checklist for this Picnic skill.

SKILL: {{SKILL_NAME}}
COMPONENTS IN SKILL: {{COMPONENT_LIST}}

REQUIRED PROPS (per component):
{{#each COMPONENTS}}
### {{name}}
Required: {{required_props}}
{{/each}}

CONTEXT DEPENDENCIES:
{{#each CONTEXT_DEPS}}
- {{component}}: requires {{provider}} (calls {{hook}})
{{/each}}

TEST ASSERTIONS (behavioral expectations):
{{TEST_ASSERTIONS}}

SOURCE COMMENTS (cross-component coupling):
{{COUPLING_COMMENTS}}

COMPOSITION RULES (parent-child requirements):
{{COMPOSITION_RULES}}

VARIANT RESTRICTIONS (invalid values):
{{VARIANT_RESTRICTIONS}}

VALIDATOR RULES (relevant):
{{VALIDATOR_RULES}}

EXISTING CHECKLIST IN SKILL (avoid duplicating):
{{EXISTING_CHECKLIST}}

INSTRUCTIONS:
1. Identify the 3-5 most likely mistakes, ordered by frequency/severity.
2. Priority order for inclusion:
   a. Silent failures — code runs but produces wrong output (highest priority)
   b. Context/composition errors — component renders but breaks at runtime
   c. Required prop omissions — TypeScript catches some, but not all
   d. State management confusion — controlled vs uncontrolled, name binding
   e. Styling traps — properties that are silently ignored
3. Each item should be a single sentence rule statement.
4. Include the consequence in parentheses at the end.
5. Do NOT duplicate items from the existing checklist.
6. Do NOT include items that TypeScript catches at compile time (unless the error message is misleading).

CONFIDENCE SCORING:
- [HIGH]: Derived from required props, explicit context dependencies, or TypeScript constraints that produce confusing errors
- [MEDIUM]: Derived from test patterns, source comments about coupling, or silent behavior differences
- [LOW]: Derived from naming conventions, general patterns, or analogy to similar components

OUTPUT FORMAT:
- {Rule statement} ({consequence if violated}) [CONFIDENCE]
```

## Example Output

```
- Column count in header MUST match cell count per body row (CSS Grid breaks silently) [HIGH]
- `display: contents` on rows means you cannot style the row element itself — style cells instead [MEDIUM]
- Use `Table.FocusWrapper` around interactive elements inside cells for keyboard focus scoping [MEDIUM]
- `name` prop MUST match keys in `initialValues` — mismatches silently fail [HIGH]
- `Form.*` components MUST be inside a `<Form>` — they read Formik context [HIGH]
```

## Checklist Quality Criteria

A good checklist item:
- Starts with the component/prop/pattern name
- States the rule in imperative form ("MUST", "always", "never")
- Ends with what goes wrong (in parentheses)
- Is unique to Picnic (not generic React/CSS/a11y advice)

A bad checklist item:
- "Remember to handle errors" (vague)
- "Add aria-label to buttons" (generic a11y, not Picnic-specific)
- "Use TypeScript for type safety" (general advice)
- Duplicates a validator rule without adding context

## Context Requirements

| Source | Priority | Notes |
|--------|----------|-------|
| Required props per component | **Critical** | Silent failures from omissions |
| Context dependencies | **Critical** | Runtime errors from missing providers |
| Test assertions | **Critical** | Reveal expected-but-surprising behavior |
| Source comments (coupling) | Helpful | Cross-component dependencies |
| Composition rules | Helpful | Parent-child requirements |
| Validator rules | Required | Cross-reference, avoid duplication |
| Existing checklist | Required | Avoid duplication |
