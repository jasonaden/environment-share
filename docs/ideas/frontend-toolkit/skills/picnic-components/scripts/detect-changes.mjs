#!/usr/bin/env node

/**
 * detect-changes.mjs — Picnic skill generation change detector
 *
 * Compares current Picnic source against stored generation state to
 * identify which components changed and which skill files need updating.
 *
 * Usage:
 *   node scripts/detect-changes.mjs --source "$(git rev-parse --show-toplevel)" --state .picnic-gen-state.json
 *   node scripts/detect-changes.mjs --source . --init
 *   node scripts/detect-changes.mjs --source . --json
 */

import { execSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { parseArgs } from 'node:util';

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const { values: args } = parseArgs({
  options: {
    source:  { type: 'string',  short: 's', default: '' },
    state:   { type: 'string',  default: '.picnic-gen-state.json' },
    init:    { type: 'boolean', default: false },
    json:    { type: 'boolean', default: false },
    branch:  { type: 'string',  short: 'b', default: 'main' },
    help:    { type: 'boolean', short: 'h', default: false },
  },
  strict: true,
  allowPositionals: false,
});

if (args.help) {
  console.log(`
Usage: node detect-changes.mjs [options]

Options:
  -s, --source <path>   Path to frontend-code repo (required)
  --state <path>        Path to state file (default: .picnic-gen-state.json)
  --init                Create initial state from current source
  --json                Output machine-readable JSON instead of pretty-print
  -b, --branch <name>   Compare against this branch (default: main)
  -h, --help            Show this help
`);
  process.exit(0);
}

if (!args.source) {
  console.error('Error: --source is required. Point it at your frontend-code repo.');
  process.exit(1);
}

const SOURCE_ROOT   = resolve(args.source);
const PICNIC_SRC    = join(SOURCE_ROOT, 'libs/picnic/src');
const COMPONENTS    = join(PICNIC_SRC, 'components');
const THEMES_DIR    = join(PICNIC_SRC, 'themes');
const UTILS_DIR     = join(PICNIC_SRC, 'utils');
const BARREL_FILE   = join(COMPONENTS, 'index.ts');
const STATE_PATH    = resolve(args.state);
const BRANCH        = args.branch;

// ---------------------------------------------------------------------------
// Source-to-Skill mapping table
// ---------------------------------------------------------------------------

/**
 * Each key is a component directory name under libs/picnic/src/components/.
 * The value is the skill file path (relative to the picnic-components root).
 */
const COMPONENT_TO_SKILL = {
  // Problem skills
  Table:                      'problem/data-table',
  ContinuousScroll:           'problem/data-table',

  Form:                       'problem/form-builder',
  TextInput:                  'problem/form-builder',
  TextArea:                   'problem/form-builder',
  Select:                     'problem/form-builder',
  SearchBar:                  'problem/form-builder',
  TagSelector:                'problem/form-builder',
  Checkbox:                   'problem/form-builder',
  RadioGroup:                 'problem/form-builder',
  Switch:                     'problem/form-builder',
  DatePicker:                 'problem/form-builder',
  TimePicker:                 'problem/form-builder',
  FormField:                  'problem/form-builder',
  FileInput:                  'problem/form-builder',
  InputGroup:                 'problem/form-builder',

  Dialog:                     'problem/dialog-drawer',
  Drawer:                     'problem/dialog-drawer',
  Popover:                    'problem/dialog-drawer',
  DropdownMenu:               'problem/dialog-drawer',

  Breadcrumbs:                'problem/navigation',
  TabGroup:                   'problem/navigation',
  Paginator:                  'problem/navigation',
  StepTracker:                'problem/navigation',

  Banner:                     'problem/feedback-notifications',
  Accordion:                  'problem/feedback-notifications',
  Tooltip:                    'problem/feedback-notifications',
  IconPopover:                'problem/feedback-notifications',
  LoadingIndicator:           'problem/feedback-notifications',
  LoadingPlaceholder:         'problem/feedback-notifications',

  // Reference files
  Button:                     'references/actions-ref',
  ButtonBar:                  'references/actions-ref',
  ButtonGroup:                'references/actions-ref',
  PickerButton:               'references/actions-ref',

  Heading:                    'references/typography-ref',
  Text:                       'references/typography-ref',
  TextWithOverflowTooltip:    'references/typography-ref',
  Link:                       'references/typography-ref',

  Badge:                      'references/data-display-ref',
  Tag:                        'references/data-display-ref',
  ContainedLabel:             'references/data-display-ref',
  ProgressBar:                'references/data-display-ref',
  List:                       'references/data-display-ref',
  Card:                       'references/data-display-ref',

  Icon:                       'references/media-ref',
  IconCircle:                 'references/media-ref',
  ResponsiveImage:            'references/media-ref',
  ImagePreview:               'references/media-ref',
  Logomark:                   'references/media-ref',
  Wordmark:                   'references/media-ref',
  Emoji:                      'references/media-ref',

  // Foundation / layout
  Box:                        'foundation/layout-primitives',
  Stack:                      'foundation/layout-primitives',
  Grid:                       'foundation/layout-primitives',
  PageLayout:                 'foundation/layout-primitives',
  FooterLayout:               'foundation/layout-primitives',
  Separator:                  'foundation/layout-primitives',
};

/**
 * Infrastructure path patterns → affected skill files.
 * Each entry is [regex on the relative path, array of affected skills].
 */
const INFRA_MAPPINGS = [
  [/^src\/themes\//, ['foundation/design-tokens']],
  [/^src\/media\.ts$/, ['foundation/design-tokens', 'foundation/stitches-patterns']],
  [/^src\/stitches\.config\.ts$/, ['foundation/stitches-patterns']],
  [/^src\/utils\//, ['foundation/stitches-patterns']],
  [/^src\/components\/Icon\/icon-set\/icons\//, ['references/media-ref']],
  [/^src\/components\/Icon\/icon-set\/third-party-icons\//, ['references/media-ref']],
  [/^src\/components\/index\.ts$/, ['SKILL.md']],
  [/^src\/index\.ts$/, ['SKILL.md']],
];

// ---------------------------------------------------------------------------
// Hashing
// ---------------------------------------------------------------------------

/** SHA-256 of a single file's content. */
function hashFile(filePath) {
  const data = readFileSync(filePath);
  return createHash('sha256').update(data).digest('hex');
}

/** Recursively collect all file paths under `dir`. */
function walkDir(dir) {
  const results = [];
  if (!existsSync(dir)) return results;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(full));
    } else {
      results.push(full);
    }
  }
  return results.sort();
}

/**
 * Content-hash a directory: sort all files, concatenate their SHA-256s,
 * then hash that string. Returns '' if directory doesn't exist.
 */
function hashDirectory(dir) {
  const files = walkDir(dir);
  if (files.length === 0) return '';
  const h = createHash('sha256');
  for (const f of files) {
    h.update(hashFile(f));
  }
  return h.digest('hex');
}

/** Hash a single component's directory. */
function hashComponent(name) {
  return hashDirectory(join(COMPONENTS, name));
}

// ---------------------------------------------------------------------------
// Barrel export parsing
// ---------------------------------------------------------------------------

/** Return the set of component names exported from the barrel index.ts. */
function parseBarrelExports() {
  if (!existsSync(BARREL_FILE)) {
    console.error(`Barrel file not found: ${BARREL_FILE}`);
    process.exit(1);
  }
  const content = readFileSync(BARREL_FILE, 'utf-8');
  const names = new Set();
  for (const line of content.split('\n')) {
    const m = line.match(/export\s+\*\s+from\s+['"]\.\/([\w-]+)['"]/);
    if (m) names.add(m[1]);
  }
  return names;
}

// ---------------------------------------------------------------------------
// Git helpers
// ---------------------------------------------------------------------------

function git(gitArgs, { allowFailure = false } = {}) {
  try {
    return execSync(`git -C "${SOURCE_ROOT}" ${gitArgs}`, {
      encoding: 'utf-8',
      timeout: 30_000,
    }).trim();
  } catch (err) {
    if (allowFailure) return null;
    throw err;
  }
}

function getCurrentCommit() {
  return git(`rev-parse ${BRANCH}`);
}

/** Check if a commit SHA is reachable. */
function isCommitReachable(sha) {
  return git(`cat-file -t ${sha}`, { allowFailure: true }) === 'commit';
}

/**
 * Get the list of changed files (relative to libs/picnic/src/) between two SHAs.
 * Returns an array of paths like "src/components/Badge/Badge.tsx".
 */
function getChangedFiles(fromSha, toSha) {
  const raw = git(
    `diff --name-only ${fromSha}..${toSha} -- libs/picnic/src/`
  );
  if (!raw) return [];
  // Strip the "libs/picnic/" prefix so paths start with "src/"
  return raw
    .split('\n')
    .filter(Boolean)
    .map(p => p.replace(/^libs\/picnic\//, ''));
}

/** Get number of commits between two SHAs in libs/picnic/. */
function getCommitCount(fromSha, toSha) {
  const raw = git(
    `rev-list --count ${fromSha}..${toSha} -- libs/picnic/src/`,
    { allowFailure: true }
  );
  return raw ? parseInt(raw, 10) : null;
}

// ---------------------------------------------------------------------------
// State file management
// ---------------------------------------------------------------------------

function readState() {
  if (!existsSync(STATE_PATH)) return null;
  try {
    const raw = readFileSync(STATE_PATH, 'utf-8');
    const state = JSON.parse(raw);
    if (!state.version || !state.lastGeneration) {
      console.error('Warning: state file has unexpected structure, treating as corrupt.');
      return null;
    }
    return state;
  } catch {
    console.error('Warning: could not parse state file, treating as missing.');
    return null;
  }
}

function writeState(state) {
  writeFileSync(STATE_PATH, JSON.stringify(state, null, 2) + '\n', 'utf-8');
}

function initState(sourceCommit) {
  console.log('Initializing state file from current source...');
  const exported = parseBarrelExports();
  const componentHashes = {};
  for (const name of [...exported].sort()) {
    const h = hashComponent(name);
    if (h) componentHashes[name] = h;
  }

  const state = {
    version: 1,
    lastGeneration: {
      timestamp: new Date().toISOString(),
      sourceCommit,
      sourceBranch: BRANCH,
      sourceRepo: '.',
    },
    componentHashes,
    themeHash: hashDirectory(THEMES_DIR),
    mediaHash: hashDirectory(join(COMPONENTS, 'Icon', 'icon-set')),
    utilsHash: hashDirectory(UTILS_DIR),
  };

  writeState(state);
  console.log(`State file written to ${STATE_PATH}`);
  console.log(`  Source commit: ${sourceCommit}`);
  console.log(`  Components tracked: ${Object.keys(componentHashes).length}`);
  return state;
}

// ---------------------------------------------------------------------------
// Change detection
// ---------------------------------------------------------------------------

/**
 * Given a list of changed file paths (relative to libs/picnic/),
 * return a mapping of { componentName → [changedFiles] }.
 */
function groupByComponent(changedFiles) {
  const groups = {};
  for (const file of changedFiles) {
    const m = file.match(/^src\/components\/(\w+)\//);
    if (m) {
      const name = m[1];
      if (!groups[name]) groups[name] = [];
      groups[name].push(file);
    }
  }
  return groups;
}

/**
 * Identify infrastructure changes (theme, utils, media, barrel, stitches).
 * Returns array of { path, category, affectedSkills }.
 */
function detectInfraChanges(changedFiles) {
  const infra = [];
  for (const file of changedFiles) {
    for (const [pattern, skills] of INFRA_MAPPINGS) {
      if (pattern.test(file)) {
        infra.push({ path: file, affectedSkills: skills });
        break; // A file matches at most one infra pattern
      }
    }
  }
  return infra;
}

/**
 * Map all changed files to the set of affected skill paths.
 */
function mapChangesToSkills(changedFiles) {
  const affected = new Set();

  for (const file of changedFiles) {
    // Component files
    const componentMatch = file.match(/^src\/components\/(\w+)\//);
    if (componentMatch) {
      const name = componentMatch[1];
      const skill = COMPONENT_TO_SKILL[name];
      if (skill) {
        affected.add(skill);
      }
      // All component changes potentially affect the validator
      affected.add('validator/SKILL.md');
    }

    // Infrastructure files
    for (const [pattern, skills] of INFRA_MAPPINGS) {
      if (pattern.test(file)) {
        for (const s of skills) affected.add(s);
      }
    }
  }

  return affected;
}

/**
 * Detect new and removed components by comparing barrel exports against state.
 */
function detectNewAndRemoved(state) {
  const currentExports = parseBarrelExports();
  const stateComponents = new Set(Object.keys(state.componentHashes));

  const newComponents = [];
  for (const name of currentExports) {
    if (!stateComponents.has(name)) {
      // Suggest a category based on the mapping table
      const suggestedSkill = COMPONENT_TO_SKILL[name] || null;
      newComponents.push({ name, suggestedSkill });
    }
  }

  const removedComponents = [];
  for (const name of stateComponents) {
    if (state.componentHashes[name] === 'REMOVED') continue;
    if (!currentExports.has(name)) {
      const wasInSkill = COMPONENT_TO_SKILL[name] || 'unknown';
      removedComponents.push({ name, wasInSkill });
    }
  }

  return { newComponents, removedComponents };
}

/**
 * Detect components whose content hash changed even if git diff missed them
 * (e.g., after a rebase). Used as fallback when the stored SHA is unreachable.
 */
function detectHashChanges(state) {
  const changed = [];
  for (const [name, storedHash] of Object.entries(state.componentHashes)) {
    if (storedHash === 'REMOVED') continue;
    const currentHash = hashComponent(name);
    if (currentHash && currentHash !== storedHash) {
      changed.push(name);
    }
  }

  // Also check infra hashes
  const infraChanged = [];
  const currentThemeHash = hashDirectory(THEMES_DIR);
  if (state.themeHash && currentThemeHash !== state.themeHash) {
    infraChanged.push({ category: 'themes', affectedSkills: ['foundation/design-tokens'] });
  }
  const currentMediaHash = hashDirectory(join(COMPONENTS, 'Icon', 'icon-set'));
  if (state.mediaHash && currentMediaHash !== state.mediaHash) {
    infraChanged.push({ category: 'icons', affectedSkills: ['references/media-ref'] });
  }
  const currentUtilsHash = hashDirectory(UTILS_DIR);
  if (state.utilsHash && currentUtilsHash !== state.utilsHash) {
    infraChanged.push({ category: 'utils', affectedSkills: ['foundation/stitches-patterns'] });
  }

  return { changed, infraChanged };
}

// ---------------------------------------------------------------------------
// Output formatting
// ---------------------------------------------------------------------------

function prettyPrint(result) {
  const { fromSha, toSha, commitCount, componentChanges, infraChanges,
          newComponents, removedComponents, affectedSkills, hashFallback } = result;

  const shortFrom = fromSha.slice(0, 7);
  const shortTo   = toSha.slice(0, 7);
  const commitStr = commitCount != null ? ` (${commitCount} commits)` : '';

  console.log('');
  console.log('=== Picnic Changes Since Last Generation ===');
  console.log(`Source: ${shortFrom} → ${shortTo}${commitStr}`);
  if (hashFallback) {
    console.log('WARNING: Stored commit not reachable (rebased?). Using content-hash comparison.');
  }
  console.log('');

  // Changed components
  const changedNames = Object.keys(componentChanges);
  if (changedNames.length > 0) {
    console.log(`CHANGED COMPONENTS (${changedNames.length}):`);
    for (const name of changedNames.sort()) {
      const files = componentChanges[name];
      const detail = files.length === 1
        ? files[0]
        : `${files.length} files changed`;
      console.log(`  ~ ${name}: ${detail}`);
    }
    console.log('');
  }

  // New components
  if (newComponents.length > 0) {
    console.log(`NEW COMPONENTS (${newComponents.length}):`);
    for (const { name, suggestedSkill } of newComponents) {
      const suggestion = suggestedSkill
        ? ` → suggested: ${suggestedSkill}`
        : ' → ACTION REQUIRED: assign to a skill';
      console.log(`  + ${name}${suggestion}`);
    }
    console.log('');
  }

  // Removed components
  if (removedComponents.length > 0) {
    console.log(`REMOVED COMPONENTS (${removedComponents.length}):`);
    for (const { name, wasInSkill } of removedComponents) {
      console.log(`  - ${name} (was in: ${wasInSkill})`);
    }
    console.log('');
  }

  // Infrastructure changes
  if (infraChanges.length > 0) {
    console.log('INFRASTRUCTURE:');
    for (const item of infraChanges) {
      if (item.path) {
        console.log(`  ~ ${item.path}`);
      } else {
        console.log(`  ~ ${item.category} (hash changed)`);
      }
    }
    console.log('');
  }

  // Affected skills
  if (affectedSkills.size > 0) {
    console.log(`AFFECTED SKILLS (${affectedSkills.size}):`);
    for (const skill of [...affectedSkills].sort()) {
      // Find which components map to this skill
      const components = [];
      for (const name of changedNames) {
        if (COMPONENT_TO_SKILL[name] === skill) components.push(name);
      }
      for (const { name } of newComponents) {
        if (COMPONENT_TO_SKILL[name] === skill) components.push(`${name} (NEW)`);
      }
      const infraHits = infraChanges
        .filter(i => i.affectedSkills?.includes(skill))
        .map(i => i.path || i.category);

      const reasons = [...components, ...infraHits];
      const reasonStr = reasons.length > 0 ? ` (${reasons.join(', ')})` : '';
      console.log(`  - ${skill}${reasonStr}`);
    }
    console.log('');
  }

  // No changes
  if (changedNames.length === 0 && newComponents.length === 0 &&
      removedComponents.length === 0 && infraChanges.length === 0) {
    console.log('No changes detected. Skills are up to date.');
    console.log('');
  }
}

function jsonOutput(result) {
  console.log(JSON.stringify(result, (_key, value) => {
    // Convert Sets to arrays for JSON serialization
    if (value instanceof Set) return [...value];
    return value;
  }, 2));
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  // Verify source repo
  if (!existsSync(join(SOURCE_ROOT, '.git'))) {
    console.error(`Error: ${SOURCE_ROOT} is not a git repository.`);
    process.exit(1);
  }
  if (!existsSync(COMPONENTS)) {
    console.error(`Error: Component directory not found at ${COMPONENTS}`);
    process.exit(1);
  }

  const currentCommit = getCurrentCommit();

  // --init: create initial state and exit
  if (args.init) {
    initState(currentCommit);
    return;
  }

  // Read existing state
  const state = readState();
  if (!state) {
    console.error('State file not found or invalid. Run with --init to create one.');
    console.error(`  node detect-changes.mjs --source ${args.source} --init`);
    process.exit(1);
  }

  const storedSha = state.lastGeneration.sourceCommit;

  // Check if stored commit is reachable
  let changedFiles = [];
  let hashFallback = false;
  let commitCount = null;

  if (storedSha === currentCommit) {
    // Check for new/removed even when SHAs match (barrel export could change
    // within the same commit during development)
    const { newComponents, removedComponents } = detectNewAndRemoved(state);

    const result = {
      fromSha: storedSha,
      toSha: currentCommit,
      commitCount: 0,
      componentChanges: {},
      infraChanges: [],
      newComponents,
      removedComponents,
      affectedSkills: new Set(),
      hashFallback: false,
    };

    if (newComponents.length > 0 || removedComponents.length > 0) {
      result.affectedSkills.add('SKILL.md');
    }

    if (args.json) {
      jsonOutput(result);
    } else {
      prettyPrint(result);
    }
    return;
  }

  if (isCommitReachable(storedSha)) {
    changedFiles = getChangedFiles(storedSha, currentCommit);
    commitCount = getCommitCount(storedSha, currentCommit);
  } else {
    // Fallback: compare content hashes
    console.error(`Warning: stored commit ${storedSha.slice(0, 7)} is not reachable.`);
    console.error('Falling back to content-hash comparison.');
    hashFallback = true;

    const { changed, infraChanged } = detectHashChanges(state);
    // Synthesize changedFiles from hash changes so the rest of the pipeline works
    for (const name of changed) {
      changedFiles.push(`src/components/${name}/`);
    }
    // Add infra pseudo-paths
    for (const item of infraChanged) {
      if (item.category === 'themes') changedFiles.push('src/themes/');
      if (item.category === 'utils') changedFiles.push('src/utils/');
      if (item.category === 'icons') changedFiles.push('src/components/Icon/icon-set/icons/');
    }
  }

  // Group component changes
  const componentChanges = groupByComponent(changedFiles);

  // Infrastructure changes
  const infraChanges = hashFallback
    ? detectHashChanges(state).infraChanged
    : detectInfraChanges(changedFiles);

  // New / removed components
  const { newComponents, removedComponents } = detectNewAndRemoved(state);

  // Map everything to affected skills
  const affectedSkills = mapChangesToSkills(changedFiles);

  // New/removed components always affect the router
  if (newComponents.length > 0 || removedComponents.length > 0) {
    affectedSkills.add('SKILL.md');
  }

  // New components that are in the mapping table affect their target skill
  for (const nc of newComponents) {
    if (nc.suggestedSkill) affectedSkills.add(nc.suggestedSkill);
  }

  const result = {
    fromSha: storedSha,
    toSha: currentCommit,
    commitCount,
    componentChanges,
    infraChanges,
    newComponents,
    removedComponents,
    affectedSkills,
    hashFallback,
  };

  if (args.json) {
    jsonOutput(result);
  } else {
    prettyPrint(result);
  }
}

main();
