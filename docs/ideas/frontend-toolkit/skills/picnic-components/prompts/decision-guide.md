# Decision Guide Generator

Prompt template for generating "when to use X vs Y" decision guides for related Picnic components within a skill.

## System Prompt

```
You are generating a decision guide for a Picnic component skill. A decision guide helps developers choose between related components that serve overlapping purposes.

BASELINE: You already know React, Stitches, Radix UI, Formik, CSS, and accessibility. Do NOT explain any of these. Only document what is specific to Picnic's implementation — its component names, prop signatures, unique behaviors, and deviations from the underlying libraries.

FORMAT: Markdown table with columns: Need | Component | (brief reason)
Follow the compact style guide — no prose explanations above or below the table.
Order rows from most common need to least common.
```

## User Prompt

```
Generate a decision guide for the following Picnic components.

SKILL: {{SKILL_NAME}}

COMPONENTS IN THIS SKILL:
{{#each COMPONENTS}}
## {{name}}
Purpose: {{guidance_summary}}
Sub-components: {{sub_list}}
Key props (unique to this component): {{unique_props}}
Radix primitive: {{radix_primitive}}
Variants: {{variant_values}}
{{/each}}

PROP OVERLAP ANALYSIS:
- Shared props across all: {{shared_props}}
{{#each COMPONENTS}}
- Unique to {{name}}: {{unique_to_this}}
{{/each}}

SOURCE CODE EXCERPTS (implementation differences):
{{SOURCE_SNIPPETS}}

GUIDANCE.MDX CONTENT:
{{#each COMPONENTS}}
### {{name}} guidance.mdx
{{guidance_content}}
{{/each}}

STORYBOOK PATTERNS:
{{STORY_PATTERNS}}

INSTRUCTIONS:
1. Create a decision guide table where each row represents a user NEED (what they're trying to accomplish), not a component feature.
2. Phrase needs from the developer's perspective:
   "Structured modal (header/body/footer)" NOT "Has sub-component slots"
   "Single value from searchable list" NOT "Has onInputValueChange"
3. Order from most common need to least common.
4. If two components could serve the same need, explain the distinguishing factor in parentheses after the component name.
5. Keep the reason column to under 10 words.

CONFIDENCE SCORING:
Tag each row with confidence:
- [HIGH]: Distinction is clearly visible in API differences (sub-components, prop types, TypeScript constraints)
- [MEDIUM]: Distinction requires understanding UX intent (naming conventions, guidance.mdx descriptions)
- [LOW]: Distinction is based on naming/convention only or general design system knowledge

OUTPUT FORMAT:
| Need | Component | Confidence |
|------|-----------|------------|
| {developer need} | {ComponentName} ({brief reason}) | [HIGH] |
```

## Example Output

```markdown
| Need | Component | Confidence |
|------|-----------|------------|
| Structured modal (header/body/footer) | StandardDialog (has .Header/.Body/.Footer slots) | [HIGH] |
| Custom modal layout | Dialog (has styling(default\|unstyled) escape hatch) | [HIGH] |
| Structured side panel | StandardDrawer (same slot pattern as StandardDialog) | [HIGH] |
| Custom side panel | Drawer (low-level, no slots) | [HIGH] |
| Floating info/guidance | Popover (anchored to trigger, has guidance variant) | [MEDIUM] |
| Quick action menu | DropdownMenu (has .Item .TextItem .Label menu subs) | [HIGH] |
```

## Context Requirements

| Source | Priority | Notes |
|--------|----------|-------|
| Extracted JSON (props, variants, subs) | **Required** | Core structural comparison |
| guidance.mdx per component | **Critical** | Purpose statements confirm structural analysis |
| Source code snippets | Helpful | Shows implementation differences |
| Stories | Helpful | Shows usage scenarios |
| Other components in same skill | **Critical** | Need full set for comparison |
