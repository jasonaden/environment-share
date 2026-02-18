# Picnic Skill Generation Scripts

Pipeline scripts that extract component metadata from `@attentive/picnic` source code and generate/update skill reference files.

## Prerequisites

- Node.js >= 18
- `@babel/parser` and `@babel/traverse` — available in the frontend-code monorepo's `node_modules/`, or install locally with `npm install` in this directory
- Run from within the `frontend-code` repo (scripts auto-discover the repo root via `git rev-parse --show-toplevel`)

## Scripts

### extract.mjs

Parses Picnic source code using Babel AST to produce a JSON database of component metadata (props, variants, sub-components, tokens, icons).

```bash
# Extract all components
node scripts/extract.mjs --source libs/picnic --output picnic-database.json

# Extract specific components only
node scripts/extract.mjs --source libs/picnic --components Badge,Table --output picnic-database.json
```

**Input**: Picnic library source directory (`libs/picnic/`)
**Output**: `picnic-database.json` — intermediate JSON database

### format.mjs

Transforms the extracted JSON database into compact skill notation and merges generated content into existing skill files. Preserves hand-curated sections outside `<!-- BEGIN GENERATED -->` / `<!-- END GENERATED -->` markers.

```bash
# Regenerate all skill files
node scripts/format.mjs --database picnic-database.json --output-dir .

# Update specific skill files only
node scripts/format.mjs --database picnic-database.json --skills references/actions-ref.md,problem/form-builder/SKILL.md

# Preview changes without writing
node scripts/format.mjs --database picnic-database.json --dry-run
```

**Input**: `picnic-database.json`
**Output**: Updated skill `.md` files

### detect-changes.mjs

Compares current Picnic source against a stored state file to identify which components changed and which skill files need updating. Maps all 57 component directories to their owning skill files.

```bash
# Check for changes since last generation
node scripts/detect-changes.mjs --source . --state .picnic-gen-state.json

# Machine-readable output
node scripts/detect-changes.mjs --source . --state .picnic-gen-state.json --json

# Create/reset initial state from current source
node scripts/detect-changes.mjs --source . --state .picnic-gen-state.json --init
```

**Input**: frontend-code repo + `.picnic-gen-state.json`
**Output**: Change report (stdout) or updated state file (with `--init`)

### assemble-context.mjs

Gathers all relevant source context for a component or skill — source code, types, test assertions, Storybook stories, guidance.mdx, and database entries — into a single document for AI curation prompts.

```bash
# Assemble context for a single component
node scripts/assemble-context.mjs --source libs/picnic --component Table --output context.md

# Assemble context for all components in a skill
node scripts/assemble-context.mjs --source libs/picnic --skill data-table --output context.md

# JSON format for structured processing
node scripts/assemble-context.mjs --source libs/picnic --component Table --format json --output context.json
```

**Input**: Picnic source + optional `picnic-database.json`
**Output**: Markdown or JSON context document

## Running the Full Pipeline

Use the `/picnic-update` skill to run the complete pipeline interactively:

```
/picnic-update          # Detect changes, extract, format, AI curate, review
/picnic-update --full   # Full extraction (ignore state, first run or recovery)
/picnic-update --no-ai  # Skip AI curation step
/picnic-update --dry-run # Preview changes without writing
```

### Manual Pipeline Steps

To run the pipeline manually:

```bash
# 1. Detect changes
node scripts/detect-changes.mjs --source . --state .picnic-gen-state.json

# 2. Extract updated components (use --components for incremental)
node scripts/extract.mjs --source libs/picnic --components Badge,Table --output picnic-database.json

# 3. Format and merge into skill files
node scripts/format.mjs --database picnic-database.json --output-dir .

# 4. (Optional) Assemble context for AI curation
node scripts/assemble-context.mjs --source libs/picnic --skill data-table --output context.md

# 5. Update state file
node scripts/detect-changes.mjs --source . --state .picnic-gen-state.json --init
```

## Key Files

| File | Purpose |
|------|---------|
| `picnic-database.json` | Intermediate JSON database from extraction |
| `.picnic-gen-state.json` | Tracks last generation commit and component hashes |
| `prompts/*.md` | AI curation prompt templates (decision guides, gotchas, anti-patterns, examples, common mistakes) |
| `package.json` | Dependencies and npm script shortcuts |
