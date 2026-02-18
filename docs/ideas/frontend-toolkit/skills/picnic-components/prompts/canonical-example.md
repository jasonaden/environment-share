# Canonical Example Generator

Prompt template for generating one canonical code example per skill, demonstrating all key patterns in a single realistic scenario.

## System Prompt

```
You are generating a single canonical code example for a Picnic component skill. The example must demonstrate the key features of ALL components in the skill within one realistic scenario.

BASELINE: You already know React, Stitches, Radix UI, Formik, CSS, and accessibility. Do NOT include imports, do NOT explain hooks/state/context, do NOT add comments explaining React patterns. The ONLY comment allowed is line 1: list state variables and note "managed externally".

RULES:
- One example per skill combining all key patterns (G9 compression rule)
- Use realistic business domain data (campaigns, users, settings — not "foo/bar")
- Show state management pattern: external state variables, event handlers
- Use Picnic tokens for spacing ($space4, etc.) — never raw values
- Include cross-component composition when relevant (e.g., DropdownMenu inside Table.BodyCell)
- Keep under 50 lines of JSX
- Do NOT explain React, Stitches, Radix, Formik, or CSS
```

## User Prompt

```
Generate a canonical code example for this Picnic skill.

SKILL: {{SKILL_NAME}}

COMPONENTS (with full API):
{{#each COMPONENTS}}
## {{name}}
Props: {{compact_notation}}
Sub-components: {{hierarchy_tree}}
Required props: {{required_list}}
Variants: {{variant_values}}
{{/each}}

CROSS-REFERENCES (components from other skills used here):
{{CROSS_REFS}}

LAYOUT COMPONENTS TYPICALLY WRAPPING THIS:
{{LAYOUT_REFS}}

STORIES (key patterns from Storybook):
{{STORY_PATTERNS}}

GUIDANCE.MDX EXAMPLES:
{{GUIDANCE_EXAMPLES}}

EXISTING EXAMPLE IN SKILL (if upgrading):
{{EXISTING_EXAMPLE}}

KEY FEATURES TO DEMONSTRATE:
{{FEATURE_LIST}}

INSTRUCTIONS:
1. Choose a realistic business scenario that naturally requires all key features:
   - Data tables: campaign list with sorting, selection, row actions, status badges
   - Forms: user creation with text, select, toggle, validation, error states
   - Dialogs: confirmation flow with form inside dialog, controlled open state
   - Layout: page with header, grid of cards, footer actions
2. Compose ALL key components from the skill in one connected example.
3. Show the most common prop configurations — not every variant.
4. Line 1 comment: list state variables with types, note "managed externally".
5. Include cross-skill references where natural (e.g., DropdownMenu in Table cells).
6. Prioritize demonstrating Picnic-specific patterns over generic React patterns.
7. Use compound sub-component syntax (Table.Header, not just Header).

CONFIDENCE SCORING:
- [HIGH]: Structural correctness guaranteed by prop types and sub-component hierarchy
- [MEDIUM]: Composition pattern follows stories but is a novel combination of features
- [LOW]: Business logic assumptions (which features to combine, domain naming)

OUTPUT FORMAT:
```tsx
// State: {var}({type}), {var}({type}) — managed externally
<ComponentCode />
```

Overall confidence: [HIGH|MEDIUM|LOW]
Features demonstrated: {comma-separated list}
```

## Example Output

```tsx
// State: query(string), selected(Set<string>), sortField(string), sortAsc(boolean) — managed externally
<SearchBar value={query} onChange={e => setQuery(e.target.value)} onClear={() => setQuery('')} />
<Table columnSizes={['40px', '1fr', '1fr', '120px', '80px']}>
  <Table.Header>
    <Table.HeaderRow>
      <Table.HeaderSelectorCell onChange={handleSelectAll} />
      <Table.SortableHeaderCell
        isSortActive={sortField === 'name'} ascending={sortAsc}
        onChange={() => handleSort('name')}
      >
        Name
      </Table.SortableHeaderCell>
      <Table.HeaderCell>Status</Table.HeaderCell>
      <Table.HeaderCell>Email</Table.HeaderCell>
      <Table.HeaderCell align="right">Actions</Table.HeaderCell>
    </Table.HeaderRow>
  </Table.Header>
  <Table.Body>
    {items.map(item => (
      <Table.BodyFocusableRow key={item.id} onClick={() => navigate(`/item/${item.id}`)}>
        <Table.RowSelectorCell
          checked={selected.has(item.id)} onChange={() => toggle(item.id)} value={item.id}
        />
        <Table.BodyCell>{item.name}</Table.BodyCell>
        <Table.BodyCell><ContainedLabel variant="success">Active</ContainedLabel></Table.BodyCell>
        <Table.BodyCell>{item.email}</Table.BodyCell>
        <Table.BodyCell align="right">
          <Table.FocusWrapper>
            <DropdownMenu>
              <DropdownMenu.Trigger>
                <IconButton iconName="MoreHorizontal" description="Actions" />
              </DropdownMenu.Trigger>
              <DropdownMenu.Content>
                <DropdownMenu.TextItem onClick={() => edit(item.id)}>Edit</DropdownMenu.TextItem>
                <DropdownMenu.TextItem onClick={() => remove(item.id)}>Delete</DropdownMenu.TextItem>
              </DropdownMenu.Content>
            </DropdownMenu>
          </Table.FocusWrapper>
        </Table.BodyCell>
      </Table.BodyFocusableRow>
    ))}
  </Table.Body>
</Table>
<Paginator totalItems={total} maxItemsPerPage={25} offset={page} onOffsetChange={setPage} />
```

## Context Requirements

| Source | Priority | Notes |
|--------|----------|-------|
| Extracted JSON (compound hierarchy, all props) | **Critical** | Structural correctness |
| Stories (realistic compositions) | **Critical** | Reference for feature combinations |
| guidance.mdx examples | Helpful | Documented patterns |
| Other components in same skill | **Critical** | Cross-component composition |
| Cross-referenced skills | Helpful | e.g., DropdownMenu in Table, Stack wrapping Form |
| Existing example in skill | Required | Upgrade, don't regress |
