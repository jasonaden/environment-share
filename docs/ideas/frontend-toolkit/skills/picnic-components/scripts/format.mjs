#!/usr/bin/env node

/**
 * format.mjs — Stage 3 of the Picnic generation pipeline.
 *
 * Transforms a picnic-database.json into compact skill notation and
 * merges generated content into existing skill files (preserving
 * hand-curated sections).
 *
 * Usage:
 *   node scripts/format.mjs --database picnic-database.json --output-dir .
 *   node scripts/format.mjs --database picnic-database.json --skills references/actions-ref.md
 *   node scripts/format.mjs --database picnic-database.json --dry-run
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { resolve, dirname, relative, join } from "node:path";
import { parseArgs } from "node:util";

// ---------------------------------------------------------------------------
// CLI
// ---------------------------------------------------------------------------

const { values: args } = parseArgs({
  options: {
    database: { type: "string", short: "d" },
    "output-dir": { type: "string", short: "o" },
    skills: { type: "string", short: "s" },
    "dry-run": { type: "boolean", default: false },
    curation: { type: "string", short: "c" },
    help: { type: "boolean", short: "h", default: false },
  },
  strict: true,
});

if (args.help) {
  console.log(`
Usage: node scripts/format.mjs [options]

Options:
  -d, --database <path>     Path to picnic-database.json (required)
  -o, --output-dir <path>   Root output directory for skill files (default: cwd)
  -s, --skills <path,...>   Comma-separated list of specific skill files to update
  -c, --curation <path>     Path to curation directory (component-notes.yaml, etc.)
      --dry-run             Preview changes without writing files
  -h, --help                Show this help message
`);
  process.exit(0);
}

if (!args.database) {
  console.error("Error: --database is required. Run with --help for usage.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Load database
// ---------------------------------------------------------------------------

const dbPath = resolve(args.database);
if (!existsSync(dbPath)) {
  console.error(`Error: database file not found: ${dbPath}`);
  process.exit(1);
}

const db = JSON.parse(readFileSync(dbPath, "utf-8"));
const outputDir = resolve(args["output-dir"] || ".");

// Load curation files if available
const curation = loadCuration(args.curation);

// ---------------------------------------------------------------------------
// Component → Skill file mapping
// ---------------------------------------------------------------------------

/** Maps component names to their owning skill file (relative to output-dir). */
function getComponentMapping(database) {
  const mapping = {};

  // The mapping comes from the database itself if it has a `skillMapping` field,
  // otherwise we derive it from each component's `category` or `skillFile` field.
  for (const [name, comp] of Object.entries(database.components || {})) {
    if (comp.skillFile) {
      mapping[name] = comp.skillFile;
    } else if (comp.category) {
      // Map category names to reference file paths
      const categoryMap = {
        actions: "references/actions-ref.md",
        "data-display": "references/data-display-ref.md",
        typography: "references/typography-ref.md",
        media: "references/media-ref.md",
      };
      mapping[name] = categoryMap[comp.category] || null;
    }
  }

  return mapping;
}

// ---------------------------------------------------------------------------
// 1. Compact Props Formatter
// ---------------------------------------------------------------------------

/**
 * Transform a single prop definition into compact notation.
 *
 * Input variants shape:
 *   { "variant": { "values": ["primary","secondary"], "default": "primary" } }
 *
 * Input additionalProps shape:
 *   { "iconName": { "type": "IconName", "required": true } }
 *
 * @param {string} propName
 * @param {object} propDef — either a variant def or an additionalProp def
 * @returns {string} — e.g. "variant(primary*|secondary)" or "!iconName(IconName)"
 */
function formatProp(propName, propDef) {
  const required = propDef.required ? "!" : "";

  // Enum (variant) prop
  if (propDef.values && Array.isArray(propDef.values)) {
    const vals = propDef.values.map((v) => {
      const isDefault = propDef.default != null && String(v) === String(propDef.default);
      return isDefault ? `${v}*` : v;
    });
    return `${required}${propName}(${vals.join("|")})`;
  }

  // Typed prop
  if (propDef.type) {
    // Boolean with self-evident name (disabled, loading on non-Button, etc.)
    // are handled at a higher level — this function just formats what it gets.
    const typeStr = normalizeType(propDef.type);
    return `${required}${propName}(${typeStr})`;
  }

  // Boolean shorthand
  if (propDef === "boolean" || propDef.type === "boolean") {
    return `${required}${propName}(boolean)`;
  }

  return `${required}${propName}`;
}

/** Normalize type strings into compact notation. */
function normalizeType(type) {
  if (!type) return "string";
  const map = {
    function: "fn",
    Function: "fn",
    "() => void": "fn",
    "(...args: any[]) => any": "fn",
    ReactNode: "ReactNode",
    "React.ReactNode": "ReactNode",
    IconName: "IconName",
    ThirdPartyIconName: "ThirdPartyIconName",
  };
  return map[type] || type;
}

/**
 * "Never document" props — omit from all entries unless flagged as non-standard.
 */
const NEVER_DOCUMENT = new Set([
  "css",
  "children",
  "ref",
  "className",
  "style",
  "key",
]);

/**
 * Standard HTML props — omit unless non-standard behavior in specific component.
 */
const STANDARD_HTML = new Set([
  "disabled",
  "placeholder",
  "value",
  "onChange",
  "onSubmit",
  "onClick",
  "id",
  "name",
  "type",
  "aria-label",
  "ariaLabel",
]);

/** Stitches internal / utility props. */
const INTERNAL_PROPS = new Set([
  "disabledVisually",
  "p",
  "m",
  "px",
  "py",
  "mx",
  "my",
  "pt",
  "pr",
  "pb",
  "pl",
  "mt",
  "mr",
  "mb",
  "ml",
]);

/**
 * Should this prop be included in output?
 *
 * @param {string} propName
 * @param {object} propDef
 * @param {string} componentName — needed for context-specific rules
 * @param {boolean} isSub — is this a sub-component prop?
 */
function shouldIncludeProp(propName, propDef, componentName, isSub = false) {
  if (NEVER_DOCUMENT.has(propName)) return false;
  if (INTERNAL_PROPS.has(propName)) return false;
  if (propName.startsWith("_")) return false;

  // Standard HTML props only included if explicitly marked as non-standard
  // or if they are required (indicating the component gives them special meaning)
  if (STANDARD_HTML.has(propName)) {
    // In sub-components, onChange etc. are often required and meaningful
    if (isSub && propDef.required) return true;
    if (propDef.nonStandard) return true;
    return false;
  }

  // loading only documented for Button/IconButton
  if (propName === "loading") {
    return componentName === "Button" || componentName === "IconButton";
  }

  // as (polymorphic) only when there's a meaningful default or enum
  if (propName === "as") {
    return propDef.values && propDef.values.length > 0;
  }

  return true;
}

/**
 * Format all props for a component/sub-component into a single compact line.
 *
 * @param {object} variants — { propName: { values, default } }
 * @param {object} additionalProps — { propName: { type, required } }
 * @param {string} componentName
 * @param {boolean} isSub
 * @returns {string} — "variant(a*|b) size(x|y*) !icon(IconName)"
 */
function formatPropsLine(variants, additionalProps, componentName, isSub = false) {
  const parts = [];

  // Ordering: required additional props → variant → size → other variants → optional additional props
  // This matches the hand-written convention where required props signal what's mandatory first.

  // 1. Required additional props (alphabetical)
  const addKeys = Object.keys(additionalProps || {});
  const required = addKeys.filter((k) => additionalProps[k].required).sort();
  const optional = addKeys.filter((k) => !additionalProps[k].required).sort();

  for (const k of required) {
    if (shouldIncludeProp(k, additionalProps[k], componentName, isSub)) {
      parts.push(formatProp(k, additionalProps[k]));
    }
  }

  // 2. Variant props: variant first, size second, then alphabetical
  const variantKeys = Object.keys(variants || {});
  const orderedVariants = [];

  if (variantKeys.includes("variant")) orderedVariants.push("variant");
  if (variantKeys.includes("size")) orderedVariants.push("size");
  for (const k of variantKeys.sort()) {
    if (k !== "variant" && k !== "size") orderedVariants.push(k);
  }

  for (const k of orderedVariants) {
    if (shouldIncludeProp(k, variants[k], componentName, isSub)) {
      parts.push(formatProp(k, variants[k]));
    }
  }

  // 3. Optional additional props (alphabetical)
  for (const k of optional) {
    if (shouldIncludeProp(k, additionalProps[k], componentName, isSub)) {
      parts.push(formatProp(k, additionalProps[k]));
    }
  }

  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// 2. Component Entry Generator
// ---------------------------------------------------------------------------

/**
 * Generate a full compact entry block for a single component.
 *
 * @param {string} name — PascalCase component name
 * @param {object} comp — database component entry
 * @param {object} notes — curation notes (optional)
 * @returns {string} — multiline string
 */
function generateComponentEntry(name, comp, notes) {
  const lines = [];

  lines.push(`## ${name}`);

  // Primitive line
  if (comp.primitive) {
    lines.push(`Primitive: ${comp.primitive}`);
  }

  // Sub-components line
  if (comp.subComponents && comp.subComponents.length > 0) {
    const subs = comp.subComponents.map((s) => `.${typeof s === "string" ? s : s.name}`);
    lines.push(`Sub: ${subs.join(" ")}`);
  }

  // Root props line
  const propsLine = formatPropsLine(
    comp.variants || {},
    comp.additionalProps || {},
    name
  );
  if (propsLine) {
    lines.push(`props: ${propsLine}`);
  }

  // Sub-component props (only for non-obvious / non-self-documenting subs)
  if (comp.subComponents) {
    for (const sub of comp.subComponents) {
      if (typeof sub === "string") continue;
      if (sub.selfDocumenting) continue;

      const subProps = formatPropsLine(
        sub.variants || {},
        sub.additionalProps || {},
        name,
        true
      );
      if (subProps) {
        lines.push(`${sub.name}: ${subProps}`);
      }
    }
  }

  // Notes line (from curation files or database)
  const noteText = notes?.notes || (comp.notes && comp.notes.length > 0 ? comp.notes.join(" ") : null);
  if (noteText) {
    lines.push(`notes: ${noteText}`);
  }

  // Deprecation line
  if (comp.deprecated) {
    if (typeof comp.deprecated === "string") {
      lines.push(`deprecated: ${comp.deprecated}`);
    } else if (comp.deprecated.old && comp.deprecated.new) {
      lines.push(`deprecated: ${comp.deprecated.old} \u2192 ${comp.deprecated.new}`);
    }
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// 3. Token Table Formatter
// ---------------------------------------------------------------------------

/**
 * Format tokens into compact notation grouped by prefix.
 *
 * @param {object} tokens — { scaleName: { tokenName: value } }
 * @param {object} darkOverrides — { scaleName: { tokenName: value } }
 * @returns {string}
 */
function formatTokenTables(tokens, darkOverrides) {
  if (!tokens) return "";

  const sections = [];

  for (const [scale, scaleTokens] of Object.entries(tokens)) {
    if (!scaleTokens || typeof scaleTokens !== "object") continue;

    const lines = [];
    lines.push(`### ${scale}`);

    for (const [tokenName, value] of Object.entries(scaleTokens)) {
      const dark = darkOverrides?.[scale]?.[tokenName];
      const darkStr = dark ? ` \u2192dark ${dark}` : "";
      lines.push(`$${tokenName} ${value}${darkStr}`);
    }

    sections.push(lines.join("\n"));
  }

  return sections.join("\n\n");
}

/**
 * Format state progressions as inline arrows.
 *
 * @param {object} progressions — { name: [{ state, token, value }] }
 * @returns {string}
 */
function formatStateProgressions(progressions) {
  if (!progressions) return "";

  const lines = [];
  for (const [name, states] of Object.entries(progressions)) {
    const parts = states.map(
      (s) => `${s.state ? s.state + " " : ""}${s.value}`
    );
    lines.push(`${name}: ${parts.join(" \u2192 ")}`);
  }
  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// 4. Sub-Component List Formatter
// ---------------------------------------------------------------------------

/**
 * Generate the Sub: line for a component.
 *
 * @param {Array} subComponents — array of { name, selfDocumenting, ... } or string
 * @returns {string} — "Sub: .Header .HeaderRow .HeaderCell ..."
 */
function formatSubComponentList(subComponents) {
  if (!subComponents || subComponents.length === 0) return "";
  const names = subComponents.map((s) => `.${typeof s === "string" ? s : s.name}`);
  return `Sub: ${names.join(" ")}`;
}

// ---------------------------------------------------------------------------
// 5. Section-Level Merge
// ---------------------------------------------------------------------------

const MARKER_BEGIN = /^<!--\s*BEGIN\s+GENERATED:\s*(\S+)\s*-->\s*$/;
const MARKER_END = /^<!--\s*END\s+GENERATED:\s*(\S+)\s*-->\s*$/;

/**
 * Parse a skill file into an array of sections.
 * Each section is either { type: "curated", content } or
 * { type: "generated", id, content }.
 *
 * @param {string} text
 * @returns {Array<{type: string, id?: string, content: string}>}
 */
function parseSections(text) {
  const lines = text.split("\n");
  const sections = [];
  let currentCurated = [];
  let inGenerated = false;
  let generatedId = null;
  let generatedLines = [];

  for (const line of lines) {
    const beginMatch = line.match(MARKER_BEGIN);
    const endMatch = line.match(MARKER_END);

    if (beginMatch && !inGenerated) {
      // Flush curated
      if (currentCurated.length > 0) {
        sections.push({ type: "curated", content: currentCurated.join("\n") });
        currentCurated = [];
      }
      inGenerated = true;
      generatedId = beginMatch[1];
      generatedLines = [line]; // Include the marker itself
    } else if (endMatch && inGenerated && endMatch[1] === generatedId) {
      generatedLines.push(line); // Include end marker
      sections.push({
        type: "generated",
        id: generatedId,
        content: generatedLines.join("\n"),
      });
      inGenerated = false;
      generatedId = null;
      generatedLines = [];
    } else if (inGenerated) {
      generatedLines.push(line);
    } else {
      currentCurated.push(line);
    }
  }

  // Flush remaining
  if (inGenerated) {
    // Unclosed marker — treat as curated to be safe
    currentCurated.push(...generatedLines);
  }
  if (currentCurated.length > 0) {
    sections.push({ type: "curated", content: currentCurated.join("\n") });
  }

  return sections;
}

/**
 * Merge new generated content into an existing skill file.
 *
 * @param {string} existingContent — current file content
 * @param {Object<string, string>} generatedBlocks — { blockId: newContent }
 * @returns {string} — merged content
 */
function mergeSkillFile(existingContent, generatedBlocks) {
  const sections = parseSections(existingContent);
  const usedBlocks = new Set();

  const merged = sections.map((section) => {
    if (section.type === "generated" && generatedBlocks[section.id]) {
      usedBlocks.add(section.id);
      return wrapGenerated(section.id, generatedBlocks[section.id]);
    }
    return section.content;
  });

  // Append any generated blocks that didn't exist yet
  for (const [id, content] of Object.entries(generatedBlocks)) {
    if (!usedBlocks.has(id)) {
      merged.push("");
      merged.push(wrapGenerated(id, content));
    }
  }

  return merged.join("\n");
}

/**
 * Wrap content in generated section markers.
 *
 * @param {string} id
 * @param {string} content
 * @returns {string}
 */
function wrapGenerated(id, content) {
  return `<!-- BEGIN GENERATED: ${id} -->\n${content}\n<!-- END GENERATED: ${id} -->`;
}

// ---------------------------------------------------------------------------
// 6. Reference File Full Regeneration
// ---------------------------------------------------------------------------

/**
 * Generate a complete reference file from the database.
 *
 * @param {string} title — file title (e.g. "Actions Reference")
 * @param {string[]} componentNames — ordered list of component names for this file
 * @param {object} database — the full database
 * @param {object} curationNotes — component-notes curation data
 * @returns {string}
 */
function generateReferenceFile(title, componentNames, database, curationNotes) {
  const lines = [];

  lines.push(`# ${title}`);
  lines.push("");
  lines.push("> All components: `import { X } from '@attentive/picnic'`. All accept `css: PicnicCss`.");

  for (const name of componentNames) {
    const comp = database.components[name];
    if (!comp) continue;

    lines.push("");
    lines.push(generateComponentEntry(name, comp, curationNotes?.[name]));
  }

  return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// 7. Curation File Loading
// ---------------------------------------------------------------------------

/**
 * Load curation files (YAML-like) from a directory.
 * We parse the simple `Key:\n  field: "value"` format without a YAML dependency.
 *
 * @param {string|undefined} curationDir
 * @returns {object}
 */
function loadCuration(curationDir) {
  const result = { componentNotes: {}, deprecations: {}, primitives: {}, subComponentNotes: {} };
  if (!curationDir) return result;

  const dir = resolve(curationDir);

  // component-notes.yaml
  const notesPath = join(dir, "component-notes.yaml");
  if (existsSync(notesPath)) {
    result.componentNotes = parseSimpleYaml(readFileSync(notesPath, "utf-8"));
  }

  // deprecations.yaml
  const depPath = join(dir, "deprecations.yaml");
  if (existsSync(depPath)) {
    result.deprecations = parseSimpleYaml(readFileSync(depPath, "utf-8"));
  }

  // primitives.yaml
  const primPath = join(dir, "primitives.yaml");
  if (existsSync(primPath)) {
    result.primitives = parseSimpleYaml(readFileSync(primPath, "utf-8"));
  }

  // sub-component-notes.yaml
  const subPath = join(dir, "sub-component-notes.yaml");
  if (existsSync(subPath)) {
    result.subComponentNotes = parseSimpleYaml(readFileSync(subPath, "utf-8"));
  }

  return result;
}

/**
 * Minimal YAML-like parser for curation files.
 * Handles:
 *   ComponentName:
 *     key: "value"
 *     key: value
 *
 * @param {string} text
 * @returns {object}
 */
function parseSimpleYaml(text) {
  const result = {};
  let currentKey = null;

  for (const line of text.split("\n")) {
    // Skip comments and blanks
    if (line.trim().startsWith("#") || line.trim() === "") continue;

    // Top-level key (no leading whitespace)
    const topMatch = line.match(/^(\w[\w.]*):$/);
    if (topMatch) {
      currentKey = topMatch[1];
      result[currentKey] = {};
      continue;
    }

    // Nested key-value (with leading whitespace)
    const nestedMatch = line.match(/^\s+(\w+):\s*"?([^"]*)"?\s*$/);
    if (nestedMatch && currentKey) {
      result[currentKey][nestedMatch[1]] = nestedMatch[2].trim();
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 8. Reference file definitions — which components belong to which ref file
// ---------------------------------------------------------------------------

/**
 * Get the reference file configuration.
 * If the database contains `referenceFiles`, use that. Otherwise, use
 * the component mapping to group components by their target skill file.
 */
function getReferenceFileConfig(database) {
  // If the database explicitly lists reference files, use that
  if (database.referenceFiles) {
    return database.referenceFiles;
  }

  // Otherwise, group components by their skillFile / category
  const groups = {};
  for (const [name, comp] of Object.entries(database.components || {})) {
    const file = comp.skillFile || categoryToFile(comp.category);
    if (!file) continue;

    // Only reference files are fully regenerated
    if (!file.startsWith("references/")) continue;

    if (!groups[file]) {
      groups[file] = { title: titleFromPath(file), components: [] };
    }
    groups[file].components.push(name);
  }

  return groups;
}

function categoryToFile(category) {
  const map = {
    actions: "references/actions-ref.md",
    "data-display": "references/data-display-ref.md",
    typography: "references/typography-ref.md",
    media: "references/media-ref.md",
  };
  return map[category] || null;
}

function titleFromPath(filePath) {
  const map = {
    "references/actions-ref.md": "Actions Reference",
    "references/data-display-ref.md": "Data Display Reference",
    "references/typography-ref.md": "Typography Reference",
    "references/media-ref.md": "Media & Branding Reference",
  };
  return map[filePath] || filePath.replace(/.*\//, "").replace(/\.md$/, "");
}

// ---------------------------------------------------------------------------
// 9. Problem skill generated blocks
// ---------------------------------------------------------------------------

/**
 * Generate the generated blocks for a problem/foundation skill file.
 *
 * The database may include a `skillBlocks` map:
 *   { "problem/data-table/SKILL.md": { "component-api": ["Table"], "compound-hierarchy": ["Table"] } }
 *
 * @param {string} skillFile — relative path
 * @param {object} database
 * @param {object} curationNotes
 * @returns {Object<string, string>} — { blockId: content }
 */
function generateSkillBlocks(skillFile, database, curationNotes) {
  const blocks = {};

  const blockConfig = database.skillBlocks?.[skillFile];
  if (!blockConfig) return blocks;

  for (const [blockId, componentNames] of Object.entries(blockConfig)) {
    const lines = [];

    for (const name of componentNames) {
      const comp = database.components[name];
      if (!comp) continue;

      if (blockId === "component-api" || blockId === "component-apis") {
        lines.push(generateComponentEntry(name, comp, curationNotes?.[name]));
        lines.push("");
      } else if (blockId === "compound-hierarchy") {
        // Generate the hierarchy tree format used in problem skills
        lines.push(generateCompoundHierarchy(name, comp));
        lines.push("");
      } else if (blockId === "sub-component-props") {
        if (comp.subComponents) {
          for (const sub of comp.subComponents) {
            if (typeof sub === "string" || sub.selfDocumenting) continue;
            const subProps = formatPropsLine(
              sub.variants || {},
              sub.additionalProps || {},
              name,
              true
            );
            if (subProps) {
              lines.push(`${sub.name}: ${subProps}`);
            }
          }
        }
      }
    }

    if (lines.length > 0) {
      blocks[blockId] = lines.join("\n").trim();
    }
  }

  return blocks;
}

/**
 * Generate a compound hierarchy tree (used in problem skills like data-table).
 *
 * @param {string} name
 * @param {object} comp
 * @returns {string}
 */
function generateCompoundHierarchy(name, comp) {
  const lines = [];
  const rootProps = formatPropsLine(comp.variants || {}, comp.additionalProps || {}, name);
  lines.push(`${name} ${rootProps}`.trim());

  if (comp.subComponents) {
    for (const sub of comp.subComponents) {
      const subName = typeof sub === "string" ? sub : sub.name;
      if (typeof sub === "string") {
        lines.push(`  .${subName}`);
      } else {
        const subProps = formatPropsLine(
          sub.variants || {},
          sub.additionalProps || {},
          name,
          true
        );
        const annotation = subProps ? ` ${subProps}` : "";
        const note = sub.note ? `  (${sub.note})` : "";
        lines.push(`  .${subName}${annotation}${note}`);
      }
    }
  }

  return "```\n" + lines.join("\n") + "\n```";
}

// ---------------------------------------------------------------------------
// 10. Token reference file generation
// ---------------------------------------------------------------------------

/**
 * Generate the token-tables.md reference file.
 *
 * @param {object} database
 * @returns {string}
 */
function generateTokenReference(database) {
  if (!database.tokens) return "";

  const lines = [];
  lines.push("# Design Token Reference");
  lines.push("");
  lines.push("> Tokens: `theme.colors.tokenName` in Stitches. All prefixed with `$` in CSS.");

  const tokenContent = formatTokenTables(database.tokens, database.darkOverrides);
  if (tokenContent) {
    lines.push("");
    lines.push(tokenContent);
  }

  // State progressions (if present)
  if (database.stateProgressions) {
    lines.push("");
    lines.push("### State Progressions");
    lines.push(formatStateProgressions(database.stateProgressions));
  }

  // Breakpoints
  if (database.breakpoints) {
    lines.push("");
    lines.push("### Breakpoints");
    for (const [name, value] of Object.entries(database.breakpoints)) {
      lines.push(`$${name} ${value}`);
    }
  }

  return lines.join("\n") + "\n";
}

// ---------------------------------------------------------------------------
// 11. Icon list generation
// ---------------------------------------------------------------------------

/**
 * Generate icon list content for the media reference file.
 *
 * @param {object} icons — { builtin: [...], thirdParty: [...] }
 * @returns {string}
 */
function formatIconList(icons) {
  if (!icons) return "";

  const lines = [];

  if (icons.builtin && icons.builtin.length > 0) {
    lines.push(`### Built-in Icons (${icons.builtin.length})`);
    // Group alphabetically, 8 per line for compact display
    const sorted = [...icons.builtin].sort();
    for (let i = 0; i < sorted.length; i += 8) {
      lines.push(sorted.slice(i, i + 8).join(", "));
    }
  }

  if (icons.thirdParty && icons.thirdParty.length > 0) {
    lines.push("");
    lines.push(`### Third-Party Icons (${icons.thirdParty.length})`);
    lines.push(icons.thirdParty.sort().join(", "));
  }

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Main: orchestrate formatting + merge
// ---------------------------------------------------------------------------

function main() {
  const isDryRun = args["dry-run"];
  const scopedSkills = args.skills ? args.skills.split(",").map((s) => s.trim()) : null;

  const changes = [];

  // --- Reference files (fully regenerated) ---
  const refConfig = getReferenceFileConfig(db);

  for (const [filePath, config] of Object.entries(refConfig)) {
    if (scopedSkills && !scopedSkills.includes(filePath)) continue;

    const title = typeof config === "string" ? config : config.title;
    const components = Array.isArray(config) ? config : config.components;

    if (!components || components.length === 0) continue;

    const content = generateReferenceFile(title, components, db, curation.componentNotes);
    const absPath = resolve(outputDir, filePath);

    changes.push({ path: filePath, absPath, content, mode: "overwrite" });
  }

  // --- Token reference (fully regenerated) ---
  if (db.tokens) {
    const tokenPath = "foundation/design-tokens/references/token-tables.md";
    if (!scopedSkills || scopedSkills.includes(tokenPath)) {
      const content = generateTokenReference(db);
      const absPath = resolve(outputDir, tokenPath);
      changes.push({ path: tokenPath, absPath, content, mode: "overwrite" });
    }
  }

  // --- Problem/foundation skills (section-level merge) ---
  if (db.skillBlocks) {
    for (const skillFile of Object.keys(db.skillBlocks)) {
      if (scopedSkills && !scopedSkills.includes(skillFile)) continue;

      const absPath = resolve(outputDir, skillFile);
      if (!existsSync(absPath)) {
        console.warn(`  SKIP: ${skillFile} (file not found — create it first)`);
        continue;
      }

      const existing = readFileSync(absPath, "utf-8");
      const blocks = generateSkillBlocks(skillFile, db, curation.componentNotes);

      if (Object.keys(blocks).length === 0) continue;

      const merged = mergeSkillFile(existing, blocks);

      if (merged !== existing) {
        changes.push({ path: skillFile, absPath, content: merged, mode: "merge" });
      }
    }
  }

  // --- Apply changes ---
  console.log(`\n=== Picnic Format ${isDryRun ? "(DRY RUN)" : ""} ===`);
  console.log(`Database: ${relative(process.cwd(), dbPath)}`);
  console.log(`Output:   ${relative(process.cwd(), outputDir)}`);
  console.log(`Components: ${Object.keys(db.components || {}).length}`);
  console.log("");

  if (changes.length === 0) {
    console.log("No changes to apply.");
    return;
  }

  for (const change of changes) {
    const label = change.mode === "overwrite" ? "REGEN" : "MERGE";
    console.log(`  ${label}: ${change.path}`);

    if (!isDryRun) {
      const dir = dirname(change.absPath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(change.absPath, change.content, "utf-8");
    }
  }

  console.log(`\n${changes.length} file(s) ${isDryRun ? "would be" : ""} updated.`);
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------

main();
