#!/usr/bin/env node

/**
 * Context Assembly Script for AI Curation Pipeline
 *
 * Gathers all relevant source context for a component or skill and outputs
 * a single markdown file that becomes input to the AI curation prompts.
 *
 * Usage:
 *   node scripts/assemble-context.mjs --source libs/picnic --component Table --output context/Table.md
 *   node scripts/assemble-context.mjs --skill data-table --output context/data-table.md
 *   node scripts/assemble-context.mjs --component Table --format json --output context/Table.json
 */

import { readdir, readFile, stat, mkdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { join, dirname, relative } from 'node:path';
import { parseArgs } from 'node:util';

// ---------------------------------------------------------------------------
// CLI argument parsing
// ---------------------------------------------------------------------------

const { values: args } = parseArgs({
  options: {
    source:    { type: 'string', short: 's' },
    component: { type: 'string', short: 'c' },
    skill:     { type: 'string', short: 'k' },
    output:    { type: 'string', short: 'o' },
    database:  { type: 'string', short: 'd' },
    format:    { type: 'string', short: 'f', default: 'markdown' },
    help:      { type: 'boolean', short: 'h', default: false },
  },
  strict: true,
});

if (args.help || (!args.component && !args.skill)) {
  console.log(`
Context Assembly Script — Gathers source context for AI curation prompts.

Usage:
  node assemble-context.mjs --source <picnic-root> --component <Name> [--output <file>]
  node assemble-context.mjs --source <picnic-root> --skill <skill-name> [--output <file>]

Options:
  --source, -s     Path to Picnic library root (contains src/components/)
  --component, -c  Single component name (PascalCase, e.g., Table)
  --skill, -k      Skill name (e.g., data-table) — gathers context for all components in skill
  --output, -o     Output file path (default: stdout)
  --database, -d   Path to picnic-database.json (for extracted JSON entries)
  --format, -f     Output format: markdown (default) or json
  --help, -h       Show this help
  `);
  process.exit(0);
}

import { execSync } from 'node:child_process';

function findRepoRoot() {
  try {
    return execSync('git rev-parse --show-toplevel', { encoding: 'utf-8' }).trim();
  } catch {
    return process.cwd();
  }
}

const PICNIC_ROOT = args.source || join(findRepoRoot(), 'libs', 'picnic');
const COMPONENTS_DIR = join(PICNIC_ROOT, 'src/components');
const DATABASE_PATH = args.database || null;

// ---------------------------------------------------------------------------
// Skill → component mapping
// ---------------------------------------------------------------------------

const SKILL_COMPONENT_MAP = {
  'data-table':           ['Table', 'SearchBar', 'ContinuousScroll', 'Paginator'],
  'form-builder':         ['Form', 'TextInput', 'TextArea', 'Select', 'MultiSelect',
                           'SearchableSelect', 'Checkbox', 'RadioGroup', 'Switch',
                           'DatePicker', 'DateRangePicker', 'TimePicker', 'FileInput',
                           'InputGroup', 'TagSelector'],
  'dialog-drawer':        ['Dialog', 'StandardDialog', 'Drawer', 'StandardDrawer'],
  'feedback-notifications': ['Banner', 'Toast', 'ProgressBar', 'LoadingIndicator',
                           'LoadingPlaceholder', 'StepTracker'],
  'layout-primitives':    ['Box', 'Stack', 'Grid', 'PageLayout', 'FooterLayout', 'Separator'],
  'navigation':           ['TabGroup', 'Breadcrumbs', 'Link', 'Paginator'],
  'overlay-menus':        ['Popover', 'Tooltip', 'DropdownMenu'],
};

// ---------------------------------------------------------------------------
// File discovery helpers
// ---------------------------------------------------------------------------

/** Check if a path exists */
async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/** Read a file, returning null if it doesn't exist */
async function safeReadFile(path) {
  try {
    return await readFile(path, 'utf-8');
  } catch {
    return null;
  }
}

/** List files in a directory matching a pattern, returning [] if dir doesn't exist */
async function listFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries.filter(e => e.isFile()).map(e => e.name);
  } catch {
    return [];
  }
}

/** Extract comments matching NOTE/FIXME/XXX/TODO/HACK from source text */
function extractMarkedComments(source, filePath) {
  const lines = source.split('\n');
  const comments = [];
  const pattern = /\/\/\s*(NOTE|FIXME|XXX|TODO|HACK)\s*:?\s*(.*)/i;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(pattern);
    if (match) {
      comments.push({
        type: match[1].toUpperCase(),
        text: match[2].trim(),
        file: filePath,
        line: i + 1,
      });
    }
  }
  return comments;
}

/** Extract test assertions (expect/assert calls) from test source */
function extractTestAssertions(source, filePath) {
  const lines = source.split('\n');
  const assertions = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Match expect(...) and assert patterns
    if (/expect\(/.test(line) || /assert[A-Z]/.test(line) || /getByRole\(/.test(line)) {
      // Grab up to 3 lines of context for multi-line assertions
      const contextLines = lines.slice(i, Math.min(i + 3, lines.length))
        .map(l => l.trim())
        .join(' ')
        .substring(0, 200);
      assertions.push({
        text: contextLines,
        file: filePath,
        line: i + 1,
      });
    }
  }
  return assertions;
}

// ---------------------------------------------------------------------------
// Component context gathering
// ---------------------------------------------------------------------------

async function gatherComponentContext(componentName) {
  const componentDir = join(COMPONENTS_DIR, componentName);

  if (!(await exists(componentDir))) {
    console.error(`Warning: Component directory not found: ${componentDir}`);
    return null;
  }

  const files = await listFiles(componentDir);
  const context = {
    name: componentName,
    dir: componentDir,
    sourceFiles: [],
    typeFiles: [],
    testFiles: [],
    storyFiles: [],
    guidanceMdx: null,
    comments: [],
    testAssertions: [],
    databaseEntry: null,
  };

  // Categorize and read files
  for (const file of files) {
    const filePath = join(componentDir, file);
    const content = await safeReadFile(filePath);
    if (!content) continue;

    const relPath = `${componentName}/${file}`;

    if (file === 'guidance.mdx') {
      context.guidanceMdx = { path: relPath, content };
    } else if (file.endsWith('.test.tsx') || file.endsWith('.test.ts') ||
               file.endsWith('.spec.tsx') || file.endsWith('.spec.ts')) {
      context.testFiles.push({ path: relPath, content });
      context.testAssertions.push(...extractTestAssertions(content, relPath));
    } else if (file.endsWith('.stories.tsx') || file.endsWith('.stories.ts')) {
      context.storyFiles.push({ path: relPath, content });
    } else if (file === 'types.ts' || file === 'Types.ts' || file === 'interfaces.ts') {
      context.typeFiles.push({ path: relPath, content });
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      // Skip index.ts barrel exports
      if (file === 'index.ts' || file === 'index.tsx') continue;
      context.sourceFiles.push({ path: relPath, content });
      context.comments.push(...extractMarkedComments(content, relPath));
    }
  }

  // Look up database entry if database path provided
  if (DATABASE_PATH) {
    const db = JSON.parse(await safeReadFile(DATABASE_PATH) || '{}');
    if (db.components && db.components[componentName]) {
      context.databaseEntry = db.components[componentName];
    }
  }

  return context;
}

// ---------------------------------------------------------------------------
// Output formatting — Markdown
// ---------------------------------------------------------------------------

function formatComponentMarkdown(ctx) {
  const sections = [];

  sections.push(`# ${ctx.name}\n`);
  sections.push(`Component directory: \`${relative(PICNIC_ROOT, ctx.dir)}\`\n`);

  // Database entry (extracted JSON)
  if (ctx.databaseEntry) {
    sections.push(`## Extracted Data (from picnic-database.json)\n`);
    sections.push('```json');
    sections.push(JSON.stringify(ctx.databaseEntry, null, 2));
    sections.push('```\n');
  }

  // Source code
  if (ctx.sourceFiles.length > 0) {
    sections.push(`## Source Code\n`);
    for (const file of ctx.sourceFiles) {
      sections.push(`### ${file.path}\n`);
      sections.push('```tsx');
      sections.push(file.content);
      sections.push('```\n');
    }
  }

  // Type definitions
  if (ctx.typeFiles.length > 0) {
    sections.push(`## TypeScript Interfaces\n`);
    for (const file of ctx.typeFiles) {
      sections.push(`### ${file.path}\n`);
      sections.push('```typescript');
      sections.push(file.content);
      sections.push('```\n');
    }
  }

  // Marked comments (NOTE/FIXME/XXX/TODO/HACK)
  if (ctx.comments.length > 0) {
    sections.push(`## Source Comments (NOTE/FIXME/XXX/TODO/HACK)\n`);
    for (const comment of ctx.comments) {
      sections.push(`- **${comment.type}** (${comment.file}:${comment.line}): ${comment.text}`);
    }
    sections.push('');
  }

  // Guidance.mdx
  if (ctx.guidanceMdx) {
    sections.push(`## guidance.mdx\n`);
    sections.push(ctx.guidanceMdx.content);
    sections.push('');
  }

  // Test files
  if (ctx.testFiles.length > 0) {
    sections.push(`## Test Files\n`);
    for (const file of ctx.testFiles) {
      sections.push(`### ${file.path}\n`);
      sections.push('```tsx');
      sections.push(file.content);
      sections.push('```\n');
    }
  }

  // Test assertions (extracted)
  if (ctx.testAssertions.length > 0) {
    sections.push(`## Test Assertions (Extracted)\n`);
    for (const assertion of ctx.testAssertions) {
      sections.push(`- (${assertion.file}:${assertion.line}) \`${assertion.text}\``);
    }
    sections.push('');
  }

  // Story files
  if (ctx.storyFiles.length > 0) {
    sections.push(`## Storybook Stories\n`);
    for (const file of ctx.storyFiles) {
      sections.push(`### ${file.path}\n`);
      sections.push('```tsx');
      sections.push(file.content);
      sections.push('```\n');
    }
  }

  return sections.join('\n');
}

// ---------------------------------------------------------------------------
// Output formatting — JSON
// ---------------------------------------------------------------------------

function formatComponentJson(ctx) {
  return {
    name: ctx.name,
    databaseEntry: ctx.databaseEntry,
    sourceFiles: ctx.sourceFiles.map(f => ({ path: f.path, content: f.content })),
    typeFiles: ctx.typeFiles.map(f => ({ path: f.path, content: f.content })),
    comments: ctx.comments,
    guidanceMdx: ctx.guidanceMdx ? ctx.guidanceMdx.content : null,
    testFiles: ctx.testFiles.map(f => ({ path: f.path, content: f.content })),
    testAssertions: ctx.testAssertions,
    storyFiles: ctx.storyFiles.map(f => ({ path: f.path, content: f.content })),
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  let componentNames = [];

  if (args.skill) {
    const skillKey = args.skill.toLowerCase();
    if (!SKILL_COMPONENT_MAP[skillKey]) {
      console.error(`Unknown skill: ${args.skill}`);
      console.error(`Known skills: ${Object.keys(SKILL_COMPONENT_MAP).join(', ')}`);
      process.exit(1);
    }
    componentNames = SKILL_COMPONENT_MAP[skillKey];
    console.error(`Skill "${args.skill}" → gathering context for: ${componentNames.join(', ')}`);
  } else {
    componentNames = [args.component];
    console.error(`Gathering context for component: ${args.component}`);
  }

  // Gather context for all components
  const contexts = [];
  for (const name of componentNames) {
    const ctx = await gatherComponentContext(name);
    if (ctx) {
      contexts.push(ctx);
      const fileCounts = [
        `${ctx.sourceFiles.length} source`,
        `${ctx.typeFiles.length} types`,
        `${ctx.testFiles.length} tests`,
        `${ctx.storyFiles.length} stories`,
        ctx.guidanceMdx ? '1 guidance.mdx' : '0 guidance.mdx',
        `${ctx.comments.length} marked comments`,
        `${ctx.testAssertions.length} test assertions`,
      ].join(', ');
      console.error(`  ${name}: ${fileCounts}`);
    }
  }

  if (contexts.length === 0) {
    console.error('No component context found. Check component names and source path.');
    process.exit(1);
  }

  // Format output
  let output;

  if (args.format === 'json') {
    const result = args.skill
      ? { skill: args.skill, components: contexts.map(formatComponentJson) }
      : formatComponentJson(contexts[0]);
    output = JSON.stringify(result, null, 2);
  } else {
    // Markdown format
    const parts = [];

    if (args.skill) {
      parts.push(`# Context Assembly: ${args.skill}\n`);
      parts.push(`Components: ${componentNames.join(', ')}\n`);
      parts.push(`Source: \`${PICNIC_ROOT}\`\n`);
      parts.push('---\n');
    }

    for (const ctx of contexts) {
      parts.push(formatComponentMarkdown(ctx));
      parts.push('\n---\n');
    }

    // Summary
    const totalSource = contexts.reduce((n, c) => n + c.sourceFiles.length, 0);
    const totalTests = contexts.reduce((n, c) => n + c.testFiles.length, 0);
    const totalStories = contexts.reduce((n, c) => n + c.storyFiles.length, 0);
    const totalGuidance = contexts.filter(c => c.guidanceMdx).length;
    const totalComments = contexts.reduce((n, c) => n + c.comments.length, 0);
    const totalAssertions = contexts.reduce((n, c) => n + c.testAssertions.length, 0);

    parts.push(`\n## Assembly Summary\n`);
    parts.push(`| Metric | Count |`);
    parts.push(`|--------|------:|`);
    parts.push(`| Components | ${contexts.length} |`);
    parts.push(`| Source files | ${totalSource} |`);
    parts.push(`| Test files | ${totalTests} |`);
    parts.push(`| Story files | ${totalStories} |`);
    parts.push(`| guidance.mdx files | ${totalGuidance} |`);
    parts.push(`| Marked comments | ${totalComments} |`);
    parts.push(`| Test assertions | ${totalAssertions} |`);

    output = parts.join('\n');
  }

  // Write or print output
  if (args.output) {
    const outDir = dirname(args.output);
    await mkdir(outDir, { recursive: true });
    await writeFile(args.output, output, 'utf-8');
    console.error(`\nWritten to: ${args.output}`);
  } else {
    process.stdout.write(output);
  }
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
