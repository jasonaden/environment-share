# 1. Architecture Overview

## 1.1 Executive Summary

The current monolithic `picnic-components` skill loads ~264KB (SKILL.md + 3 reference files covering 66 React components) on every invocation regardless of task scope. A developer asking "what color token for warnings?" pays the same context cost as one building a multi-component form inside a dialog.

The decomposed architecture replaces the monolith with **10 skills + 4 reference files** organized in a 3-tier progressive loading system. Each invocation loads only the skills relevant to the task.

**Result**: 85% total size reduction (264KB → 39KB). Per-invocation reductions of 94-97% for typical tasks.

## 1.2 Architecture

### 3-Tier Progressive Loading

```
User prompt
    │
    ▼
┌─────────────────────┐
│   Tier 1: Router    │  ~3KB — always loaded
│   Intent detection   │  Routes to the right skill
│   Component lookup   │
└──────────┬──────────┘
           │ delegates to one or more of:
     ┌─────┼──────────────┐
     ▼     ▼              ▼
┌─────────┐ ┌──────────┐ ┌────────────┐
│Foundation│ │ Problem  │ │ References │  Tier 2: Domain layer
│ Skills  │ │  Skills  │ │ (standalone)│  ~1–3KB each
└────┬────┘ └────┬─────┘ └────────────┘
     │           │
     │      loads deps
     │     ┌─────┘
     ▼     ▼
┌─────────────────────┐
│  Tier 3: Validator  │  ~5.9KB — runs post-generation
│  125 rules, 8 cats  │
└─────────────────────┘
```

### Hybrid Skill Model

The architecture uses three complementary skill types:

| Type | Purpose | Count | Loaded When |
|------|---------|-------|-------------|
| **Foundation** | Cross-cutting knowledge (tokens, Stitches, layout) | 3 skills | As dependencies of problem skills |
| **Problem** | Multi-component compositions with decision trees | 5 skills | When task matches a composition pattern |
| **Reference** | Standalone component lookup tables | 4 files | When task targets a simple standalone component |

**Foundation skills** (design-tokens, stitches-patterns, layout-primitives) teach concepts and rules. **Problem skills** (form-builder, data-table, dialog-drawer, navigation, feedback-notifications) guide multi-component composition. **References** (actions, typography, data-display, media) are pure lookup tables for standalone components.

### Progressive Disclosure

The router loads first (~3KB), identifies user intent, and delegates to the specific skill needed. That skill loads its foundation dependencies only if the task requires them. Reference files for detailed API lookups load only on demand. The validator runs post-generation — no skill depends on it for code generation.

This means ~80% of tasks complete at Tier 1 + one Tier 2 skill, never touching the full architecture.

## 1.3 Directory Structure

```
skills/
└── picnic-components/
    ├── SKILL.md                          # Router ~3KB
    │
    ├── foundation/
    │   ├── design-tokens/
    │   │   ├── SKILL.md                  # ~2.2KB
    │   │   └── references/
    │   │       └── token-tables.md       # ~6.5KB
    │   │
    │   ├── stitches-patterns/
    │   │   ├── SKILL.md                  # ~1.8KB
    │   │   └── references/
    │   │       └── utils-reference.md    # ~3KB
    │   │
    │   └── layout-primitives/
    │       └── SKILL.md                  # ~1.5KB
    │
    ├── problem/
    │   ├── data-table/
    │   │   └── SKILL.md                  # ~2.5KB
    │   ├── form-builder/
    │   │   └── SKILL.md                  # ~3.2KB
    │   ├── dialog-drawer/
    │   │   └── SKILL.md                  # ~2.3KB
    │   ├── navigation/
    │   │   └── SKILL.md                  # ~1.5KB
    │   └── feedback-notifications/
    │       └── SKILL.md                  # ~1.7KB
    │
    ├── references/
    │   ├── actions-ref.md                # ~1.2KB
    │   ├── typography-ref.md             # ~0.8KB
    │   ├── data-display-ref.md           # ~0.9KB
    │   └── media-ref.md                  # ~1.1KB
    │
    └── validator/
        └── SKILL.md                      # ~5.9KB

14 files, ~39KB total
```

## 1.4 Dependency Graph

### Dependency Rules

1. **Every problem skill** depends on `design-tokens` and `stitches-patterns` (always).
2. **Some problem skills** also depend on `layout-primitives` (form-builder, data-table).
3. **Foundation skills** form a chain: `design-tokens` → `stitches-patterns` → `layout-primitives`.
4. **References** are loaded on demand by the router or by problem skills as supplementary lookups.
5. **Validator** runs independently post-generation. Nothing depends on it for code generation.

### Skill-Level Dependency Map

| Skill | Foundation Dependencies | Reference Lookups |
|-------|------------------------|-------------------|
| design-tokens | (none — leaf) | token-tables.md |
| stitches-patterns | design-tokens | utils-reference.md |
| layout-primitives | design-tokens, stitches-patterns | (none) |
| form-builder | design-tokens, stitches-patterns, layout-primitives | (none — inputs are inline) |
| data-table | design-tokens, stitches-patterns, layout-primitives | data-display-ref (Badge in cells) |
| dialog-drawer | design-tokens, stitches-patterns | actions-ref (Button in footers) |
| navigation | design-tokens, stitches-patterns | (none) |
| feedback-notifications | design-tokens, stitches-patterns | (none) |
| validator | (none — runs independently) | (none) |

### When References Load vs Skills

| Content Type | Loaded By | Trigger |
|-------------|-----------|---------|
| Foundation SKILL.md | Problem skill `depends_on` declaration | Problem skill is invoked |
| Foundation reference | Foundation skill, on demand | Specific token/util lookup needed |
| Category reference | Router, directly | Simple standalone component question |
| Problem SKILL.md | Router | Composition task detected |

## 1.5 Token Budget Summary

### Per-Layer Totals

| Layer | File Count | Optimized Size | Original Size | Reduction |
|-------|-----------|----------------|---------------|-----------|
| Router | 1 | ~3KB | ~18KB (monolith SKILL.md) | 83% |
| Foundation skills + refs | 5 | ~15KB | ~32.8KB (P06 consensus) | 54% |
| Problem skills | 5 | ~11.3KB | ~34KB (P06 consensus) | 67% |
| Reference files | 4 | ~4KB | ~30KB (P06 consensus) | 87% |
| Validator | 1 | ~5.9KB | ~6.5KB (P06 consensus) | 10% |
| **Total** | **16** | **~39KB** | **~264KB (current monolith)** | **85%** |

### Per-Invocation Estimates

| Scenario | What Loads | Size | vs Monolith (264KB) | Reduction |
|----------|-----------|------|---------------------|-----------|
| Simple component lookup | Router + 1 reference | ~4KB | ~125KB loaded today | **97%** |
| Foundation question | Router + 1 foundation + 1 ref | ~10KB | ~105KB loaded today | **90%** |
| Typical composition | Router + 1 problem + 2 foundations | ~9.2KB | ~157KB loaded today | **94%** |
| Complex composition | Router + 2 problems + 3 foundations + 1 ref | ~14KB | ~264KB loaded today | **95%** |
| Hard ceiling (everything) | All 14 files | ~39KB | ~264KB loaded today | **85%** |

### Token Count Comparison

| Scenario | Monolith Tokens | Optimized Tokens | Saved |
|----------|----------------|-----------------|-------|
| Simple lookup | ~31,250 | ~1,000 | **97%** |
| Foundation question | ~26,250 | ~2,500 | **90%** |
| Typical composition | ~39,250 | ~2,300 | **94%** |
| Complex composition | ~66,000 | ~3,500 | **95%** |
| Hard ceiling | ~66,000 | ~9,750 | **85%** |

The single largest optimization is architectural — loading only the relevant sub-skills instead of the entire monolith accounts for 63% of total savings. Content-level compression (compact notation, removing "Claude-known" explanations, eliminating duplication) provides the remaining 37%.
