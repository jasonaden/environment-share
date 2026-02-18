# Anti-Pattern Generator

Prompt template for generating BAD → GOOD anti-pattern rules for Picnic components.

## System Prompt

```
You are generating anti-pattern rules for a Picnic component. Anti-patterns are BAD → GOOD one-liners showing what NOT to do and the correct alternative.

BASELINE: You already know React, Stitches, Radix UI, Formik, CSS, and accessibility. Do NOT generate anti-patterns for general React/CSS mistakes. Only generate patterns specific to Picnic's implementation — its type restrictions, CSS filtering, deprecated values, and composition requirements.

Only include patterns that a developer might actually try. Don't generate anti-patterns for things nobody would do.
```

## User Prompt

```
Generate anti-pattern rules for this Picnic component.

COMPONENT: {{COMPONENT_NAME}}
SKILL: {{SKILL_NAME}}

TYPESCRIPT INTERFACE (props accepted):
{{TYPE_INTERFACE}}

PROPS EXCLUDED FROM TYPE (forbidden):
{{EXCLUDED_PROPS}}

STITCHES CSS FILTERING:
- Properties removed or overridden: {{CSS_FILTERING}}
- Shorthand utils available: {{SHORTHAND_UTILS}}

DEPRECATED MARKERS:
{{#each DEPRECATED}}
- {{prop_or_value}}: @deprecated {{message}} → use {{replacement}}
{{/each}}

GUIDANCE.MDX "DON'T" SECTIONS:
{{NEGATIVE_GUIDANCE}}

VALIDATOR RULES (relevant to this component):
{{VALIDATOR_RULES}}

EXISTING ANTI-PATTERNS IN SKILL (avoid duplicating):
{{EXISTING_ANTI_PATTERNS}}

INSTRUCTIONS:
1. Generate BAD → GOOD pairs for these categories (in priority order):
   a. Props excluded from TypeScript types (className, style → css prop)
   b. CSS properties silently stripped (gap in Stack → spacing prop)
   c. Deprecated values with migration targets (variant="basic" → variant="secondary")
   d. Composition violations (standalone input inside Form → Form.* sub-component)
   e. Styling violations (raw hex → token, raw px → token, Tailwind → Stitches)
   f. Accessibility violations (missing required ARIA, wrong role)
2. Format: `BAD: <code>` → `GOOD: <code>` — one line each, with inline code backticks
3. Each pair must be self-contained — a developer should understand the fix from the one-liner alone.
4. Do NOT duplicate anti-patterns that already exist in the skill.
5. Do NOT generate anti-patterns for universally understood React mistakes (missing keys, etc.).

CONFIDENCE SCORING:
- [HIGH]: TypeScript enforces this (code won't compile) or Stitches silently strips the prop (verified in source)
- [MEDIUM]: Code works but produces wrong/unexpected behavior (deprecated value renders differently, composition breaks context)
- [LOW]: Convention-based with no enforcement (naming preference, style consistency)

OUTPUT FORMAT:
BAD: `{code}` → GOOD: `{code}` [CONFIDENCE]
```

## Example Output

```
BAD: `<Stack css={{ gap: '$space4' }}>` → GOOD: `<Stack spacing="$space4">` [HIGH]
BAD: `<Button className="primary-btn">` → GOOD: `<Button css={{ ... }}>` [HIGH]
BAD: `<Button variant="basic">` → GOOD: `<Button variant="secondary">` [HIGH]
BAD: `<TextInput>` inside `<Form>` → GOOD: `<Form.TextInput name="field">` [MEDIUM]
BAD: `style={{ color: 'red' }}` → GOOD: `css={{ color: '$textCritical' }}` [HIGH]
BAD: `<Badge variant="secondary">` → GOOD: `<Badge variant="standard">` [HIGH]
BAD: `css={{ padding: '16px' }}` → GOOD: `css={{ p: '$space4' }}` [MEDIUM]
```

## Context Requirements

| Source | Priority | Notes |
|--------|----------|-------|
| TypeScript interface (excluded props) | **Critical** | Highest confidence: type system enforces |
| Stitches CSS filtering | **Critical** | Silent failures from stripped properties |
| @deprecated JSDoc markers | **Critical** | Clear migration targets |
| Validator rules | **Critical** | Cross-reference with existing rule IDs (V01-V20, S01-S15, etc.) |
| guidance.mdx "don't" sections | Helpful | Design intent constraints |
| Existing skill anti-patterns | Required | Avoid duplication |
