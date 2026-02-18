#!/usr/bin/env node

/**
 * Picnic Component Extraction Script
 *
 * Parses the Picnic design system source code using @babel/parser and @babel/traverse
 * to produce a JSON database of component metadata, design tokens, and icon lists.
 *
 * Usage:
 *   node scripts/extract.mjs --source libs/picnic --output picnic-database.json
 *   node scripts/extract.mjs --source "$(git rev-parse --show-toplevel)/libs/picnic" --components Badge,Table
 *
 * Dependencies: @babel/parser, @babel/traverse (installed in frontend-code)
 */

import { readFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { resolve, join, basename } from 'path';
import { execSync } from 'child_process';
import { parseArgs } from 'util';

// ---------------------------------------------------------------------------
// 0. CLI Argument Parsing
// ---------------------------------------------------------------------------

const { values: args } = parseArgs({
  options: {
    source: { type: 'string', short: 's' },
    output: { type: 'string', short: 'o', default: 'picnic-database.json' },
    components: { type: 'string', short: 'c' },
    help: { type: 'boolean', short: 'h', default: false },
  },
});

if (args.help || !args.source) {
  console.log(`
Picnic Component Extractor

Usage:
  node extract.mjs --source <path-to-picnic-lib> [--output <file>] [--components Badge,Table]

Options:
  --source, -s     Path to libs/picnic in frontend-code (required)
  --output, -o     Output JSON file (default: picnic-database.json)
  --components, -c Comma-separated list of components to extract (default: all)
  --help, -h       Show this help
`);
  process.exit(args.help ? 0 : 1);
}

const PICNIC_ROOT = resolve(args.source);
const SRC_ROOT = join(PICNIC_ROOT, 'src');
const COMPONENTS_DIR = join(SRC_ROOT, 'components');
const THEMES_DIR = join(SRC_ROOT, 'themes');

if (!existsSync(COMPONENTS_DIR)) {
  console.error(`Error: Components directory not found at ${COMPONENTS_DIR}`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 1. Dynamic import of @babel/parser and @babel/traverse
//    These are available in the frontend-code monorepo
// ---------------------------------------------------------------------------

let parse, traverse;

try {
  // Try loading from the picnic project's node_modules first
  const parserPath = resolve(PICNIC_ROOT, '../../node_modules/@babel/parser/lib/index.js');
  const traversePath = resolve(PICNIC_ROOT, '../../node_modules/@babel/traverse/lib/index.js');

  if (existsSync(parserPath)) {
    const parserMod = await import(parserPath);
    parse = parserMod.parse || parserMod.default?.parse;
    const traverseMod = await import(traversePath);
    traverse = traverseMod.default?.default || traverseMod.default || traverseMod;
  }

  if (!parse) {
    // Fallback: try global or local install
    const { parse: p } = await import('@babel/parser');
    parse = p;
    const t = await import('@babel/traverse');
    traverse = t.default?.default || t.default || t;
  }
} catch (err) {
  console.error('Error: Could not load @babel/parser or @babel/traverse.');
  console.error('Install them: npm install @babel/parser @babel/traverse');
  console.error('Detail:', err.message);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// 2. Helpers
// ---------------------------------------------------------------------------

/** Props that should never appear in skill documentation */
const NEVER_DOCUMENT_PROPS = new Set([
  'css', 'children', 'ref', 'className', 'style', 'as', 'key',
]);

/** Standard HTML props to exclude unless the component gives them special meaning */
const STANDARD_HTML_PROPS = new Set([
  'disabled', 'placeholder', 'value', 'onChange', 'onClick', 'onSubmit',
  'id', 'name', 'type', 'aria-label', 'aria-labelledby', 'aria-describedby',
  'tabIndex', 'role', 'title',
]);

/** Stitches utility shorthand props to exclude */
const STITCHES_UTILS = new Set([
  'p', 'pt', 'pr', 'pb', 'pl', 'px', 'py',
  'm', 'mt', 'mr', 'mb', 'ml', 'mx', 'my',
]);

/** Internal-only props that should not be documented */
const INTERNAL_PROPS = new Set([
  'disabledVisually', // Button internal variant
]);

function shouldExcludeProp(name) {
  return NEVER_DOCUMENT_PROPS.has(name) ||
         STITCHES_UTILS.has(name) ||
         INTERNAL_PROPS.has(name);
}

function readFile(filePath) {
  try {
    return readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

function parseFile(filePath) {
  const code = readFile(filePath);
  if (!code) return null;
  try {
    return parse(code, {
      sourceType: 'module',
      plugins: ['typescript', 'jsx', 'decorators-legacy', 'classProperties'],
    });
  } catch (err) {
    console.warn(`  Warning: Failed to parse ${filePath}: ${err.message}`);
    return null;
  }
}

function getSourceCommit() {
  try {
    return execSync('git rev-parse HEAD', { cwd: PICNIC_ROOT, encoding: 'utf-8' }).trim();
  } catch {
    return 'unknown';
  }
}

// ---------------------------------------------------------------------------
// 3. Component Discovery (from barrel export)
// ---------------------------------------------------------------------------

function discoverComponents() {
  const indexPath = join(COMPONENTS_DIR, 'index.ts');
  const code = readFile(indexPath);
  if (!code) {
    console.error(`Error: Could not read ${indexPath}`);
    process.exit(1);
  }

  // Parse `export * from './ComponentName'` lines
  const components = [];
  const re = /export\s+\*\s+from\s+['"]\.\/([\w-]+)['"]/g;
  let m;
  while ((m = re.exec(code)) !== null) {
    components.push(m[1]);
  }
  return components;
}

// ---------------------------------------------------------------------------
// 4. Variant Extraction from styled() calls
//
// Handles the actual Picnic patterns:
//   const X = styled('element', { variants: { ... }, defaultVariants: { ... } })
//   const X = styled(Component, { variants: { ... } })
//
// Variants in Picnic are ALWAYS inline literal objects — no dynamic keys,
// no spreads from imports, no computed values. This makes AST extraction reliable.
// ---------------------------------------------------------------------------

/**
 * Extract all styled() call definitions from an AST.
 * Returns a map of variableName -> { baseElement, variants, defaultVariants, compoundVariants }
 */
function extractStyledCalls(ast) {
  const styledComponents = {};

  traverse(ast, {
    VariableDeclarator(path) {
      const init = path.node.init;
      if (!init || init.type !== 'CallExpression') return;

      // Match: styled('element', { ... }) or styled(Component, { ... })
      const callee = init.callee;
      const isStyled =
        (callee.type === 'Identifier' && callee.name === 'styled') ||
        (callee.type === 'MemberExpression' &&
          callee.object?.name === 'styled');

      if (!isStyled) return;
      if (init.arguments.length < 2) return;

      const name = path.node.id?.name;
      if (!name) return;

      // Extract base element
      const firstArg = init.arguments[0];
      let baseElement = null;
      if (firstArg.type === 'StringLiteral') {
        baseElement = firstArg.value;
      } else if (firstArg.type === 'Identifier') {
        baseElement = firstArg.name;
      } else if (firstArg.type === 'MemberExpression') {
        baseElement = `${firstArg.object?.name}.${firstArg.property?.name}`;
      }

      // Second argument is the config object
      const configArg = init.arguments[1];
      if (configArg.type !== 'ObjectExpression') {
        // Sometimes it's a spread: styled('button', { ...ButtonStyles, variants: {} })
        // The ObjectExpression should still work for these
        return;
      }

      const variants = {};
      const defaultVariants = {};
      const compoundVariants = [];

      for (const prop of configArg.properties) {
        if (prop.type === 'SpreadElement') continue;
        if (!prop.key) continue;

        const key = prop.key.name || prop.key.value;

        if (key === 'variants' && prop.value.type === 'ObjectExpression') {
          // Extract each variant and its possible values
          for (const variantProp of prop.value.properties) {
            if (variantProp.type === 'SpreadElement') continue;
            const variantName = variantProp.key?.name || variantProp.key?.value;
            if (!variantName) continue;

            if (variantProp.value.type === 'ObjectExpression') {
              const values = [];
              for (const valueProp of variantProp.value.properties) {
                if (valueProp.type === 'SpreadElement') continue;
                const val = valueProp.key?.name ?? valueProp.key?.value;
                if (val !== undefined) values.push(String(val));
              }
              variants[variantName] = values;
            } else if (variantProp.value.type === 'Identifier') {
              // Reference to a variable (e.g., `color: iconColorsVariants`)
              variants[variantName] = [`<ref:${variantProp.value.name}>`];
            }
          }
        }

        if (key === 'defaultVariants' && prop.value.type === 'ObjectExpression') {
          for (const dvProp of prop.value.properties) {
            if (dvProp.type === 'SpreadElement') continue;
            const dvName = dvProp.key?.name || dvProp.key?.value;
            if (!dvName) continue;
            const dvValue = extractLiteralValue(dvProp.value);
            if (dvValue !== undefined) defaultVariants[dvName] = dvValue;
          }
        }

        if (key === 'compoundVariants' && prop.value.type === 'ArrayExpression') {
          for (const elem of prop.value.elements) {
            if (!elem || elem.type !== 'ObjectExpression') continue;
            const cv = {};
            for (const cvProp of elem.properties) {
              if (cvProp.type === 'SpreadElement') continue;
              const cvKey = cvProp.key?.name || cvProp.key?.value;
              if (cvKey === 'css') continue; // skip the css block
              const cvVal = extractLiteralValue(cvProp.value);
              if (cvVal !== undefined) cv[cvKey] = cvVal;
            }
            if (Object.keys(cv).length > 0) compoundVariants.push(cv);
          }
        }
      }

      styledComponents[name] = { baseElement, variants, defaultVariants, compoundVariants };
    },
  });

  return styledComponents;
}

/** Extract a literal value from an AST node */
function extractLiteralValue(node) {
  if (!node) return undefined;
  if (node.type === 'StringLiteral') return node.value;
  if (node.type === 'NumericLiteral') return node.value;
  if (node.type === 'BooleanLiteral') return node.value;
  if (node.type === 'TemplateLiteral' && node.quasis.length === 1) {
    return node.quasis[0].value.cooked;
  }
  return undefined;
}

/**
 * Extract plain object variable definitions from an AST.
 * Used to resolve variant references like `align: cellAlignVariants` where
 * the variants are defined in a separate variable.
 *
 * Returns a map of varName -> [key1, key2, ...]
 */
function extractObjectVariables(ast) {
  const vars = {};

  traverse(ast, {
    VariableDeclarator(path) {
      const name = path.node.id?.name;
      if (!name) return;

      const init = path.node.init;
      if (!init || init.type !== 'ObjectExpression') return;

      const keys = [];
      for (const prop of init.properties) {
        if (prop.type === 'SpreadElement') continue;
        const key = prop.key?.name || prop.key?.value;
        if (key) keys.push(String(key));
      }

      if (keys.length > 0) vars[name] = keys;
    },
  });

  return vars;
}

/**
 * Resolve variant references. If a variant's values contain `<ref:varName>`,
 * replace them with the keys from the referenced object variable.
 */
function resolveVariantRefs(variants, objectVars) {
  const resolved = {};
  for (const [name, values] of Object.entries(variants)) {
    const newValues = [];
    for (const val of values) {
      const refMatch = val.match(/^<ref:(.+)>$/);
      if (refMatch && objectVars[refMatch[1]]) {
        newValues.push(...objectVars[refMatch[1]]);
      } else {
        newValues.push(val);
      }
    }
    resolved[name] = newValues;
  }
  return resolved;
}

// ---------------------------------------------------------------------------
// 5. Interface / Props Extraction
//
// Extracts TypeScript interface declarations and their properties.
// Handles:
//   interface XProps { prop?: Type; required: Type }
//   interface XProps extends Omit<OtherProps, 'excluded'> { ... }
// ---------------------------------------------------------------------------

function extractInterfaces(ast) {
  const interfaces = {};

  traverse(ast, {
    TSInterfaceDeclaration(path) {
      const name = path.node.id?.name;
      if (!name) return;

      const props = {};
      const extendsInfo = [];

      // Check extends clauses
      if (path.node.extends) {
        for (const ext of path.node.extends) {
          const extName = ext.expression?.name ||
            (ext.expression?.type === 'Identifier' ? ext.expression.name : null);
          extendsInfo.push(extName || 'unknown');
        }
      }

      // Extract property signatures from the interface body
      for (const member of path.node.body?.body || []) {
        if (member.type === 'TSPropertySignature') {
          const propName = member.key?.name || member.key?.value;
          if (!propName) continue;

          const required = !member.optional;
          const typeStr = extractTypeAnnotation(member.typeAnnotation);

          props[propName] = {
            type: typeStr,
            required,
          };
        }
      }

      interfaces[name] = { props, extends: extendsInfo };
    },

    // Also handle type aliases: type XProps = React.ComponentProps<typeof X>
    TSTypeAliasDeclaration(path) {
      const name = path.node.id?.name;
      if (!name || !name.endsWith('Props')) return;

      // Check if it's a ComponentProps extraction
      const typeAnnotation = path.node.typeAnnotation;
      if (typeAnnotation?.type === 'TSTypeReference') {
        const typeName = typeAnnotation.typeName;
        if (typeName?.type === 'TSQualifiedName') {
          const qualName = `${typeName.left?.name}.${typeName.right?.name}`;
          interfaces[name] = {
            props: {},
            extends: [qualName],
            derivedFrom: 'ComponentProps',
          };
        }
      }
    },
  });

  return interfaces;
}

/** Convert a TS type annotation AST node to a readable string */
function extractTypeAnnotation(annotation) {
  if (!annotation) return 'unknown';

  const typeNode = annotation.typeAnnotation || annotation;

  switch (typeNode.type) {
    case 'TSStringKeyword': return 'string';
    case 'TSNumberKeyword': return 'number';
    case 'TSBooleanKeyword': return 'boolean';
    case 'TSVoidKeyword': return 'void';
    case 'TSAnyKeyword': return 'any';
    case 'TSNullKeyword': return 'null';
    case 'TSUndefinedKeyword': return 'undefined';
    case 'TSNeverKeyword': return 'never';

    case 'TSTypeAnnotation':
      return extractTypeAnnotation(typeNode.typeAnnotation);

    case 'TSTypeReference': {
      const name = typeNode.typeName?.name ||
        (typeNode.typeName?.type === 'TSQualifiedName'
          ? `${typeNode.typeName.left?.name}.${typeNode.typeName.right?.name}`
          : 'unknown');
      if (typeNode.typeParameters?.params?.length) {
        const params = typeNode.typeParameters.params
          .map(p => extractTypeAnnotation(p)).join(', ');
        return `${name}<${params}>`;
      }
      return name;
    }

    case 'TSUnionType':
      return typeNode.types.map(t => extractTypeAnnotation(t)).join(' | ');

    case 'TSLiteralType': {
      if (typeNode.literal.type === 'StringLiteral') return `'${typeNode.literal.value}'`;
      if (typeNode.literal.type === 'NumericLiteral') return String(typeNode.literal.value);
      if (typeNode.literal.type === 'BooleanLiteral') return String(typeNode.literal.value);
      return 'literal';
    }

    case 'TSArrayType':
      return `${extractTypeAnnotation(typeNode.elementType)}[]`;

    case 'TSFunctionType':
    case 'TSConstructorType':
      return 'Function';

    case 'TSIntersectionType':
      return typeNode.types.map(t => extractTypeAnnotation(t)).join(' & ');

    case 'TSParenthesizedType':
      return `(${extractTypeAnnotation(typeNode.typeAnnotation)})`;

    case 'TSIndexedAccessType': {
      const obj = extractTypeAnnotation(typeNode.objectType);
      const idx = extractTypeAnnotation(typeNode.indexType);
      return `${obj}[${idx}]`;
    }

    default:
      return 'unknown';
  }
}

// ---------------------------------------------------------------------------
// 6. Compound Component Detection
//
// Detects the pattern:
//   const X = Primitive as CompositeComponent;
//   X.Sub = SubComponent;
//   X.Sub.displayName = 'X.Sub';
//
// The CompositeComponent interface lists all sub-components and is the
// authoritative source. We also detect direct assignments as a fallback.
// ---------------------------------------------------------------------------

function extractCompoundAssignments(ast) {
  const assignments = [];

  traverse(ast, {
    ExpressionStatement(path) {
      const expr = path.node.expression;
      if (expr.type !== 'AssignmentExpression') return;

      const left = expr.left;
      // Match: X.Sub = SubComponent (but not X.displayName = ...)
      if (left.type === 'MemberExpression' &&
          left.object?.type === 'Identifier' &&
          left.property?.type === 'Identifier' &&
          left.property.name !== 'displayName') {

        const parentName = left.object.name;
        const subName = left.property.name;
        const assignedTo = expr.right?.name || expr.right?.type || 'unknown';

        assignments.push({ parentName, subName, assignedTo });
      }
    },
  });

  return assignments;
}

/**
 * Extract sub-component list from CompositeComponent interface declarations.
 *
 * Pattern:
 *   interface CompositeComponent extends ComponentType {
 *     Header: typeof Header & DisplayNamed;
 *     Content: typeof Content & DisplayNamed;
 *   }
 */
function extractCompositeInterface(ast) {
  const composites = {};

  traverse(ast, {
    TSInterfaceDeclaration(path) {
      const name = path.node.id?.name;
      if (!name || !name.includes('Composite')) return;

      const subs = [];
      for (const member of path.node.body?.body || []) {
        if (member.type === 'TSPropertySignature') {
          const subName = member.key?.name || member.key?.value;
          if (subName) subs.push(subName);
        }
      }

      if (subs.length > 0) {
        composites[name] = subs;
      }
    },
  });

  return composites;
}

// ---------------------------------------------------------------------------
// 7. Deprecation Detection
//
// Scans for deprecation comments. Picnic uses inline comments rather than
// JSDoc @deprecated tags.
// ---------------------------------------------------------------------------

function extractDeprecations(code) {
  const deprecations = {};
  const lines = code.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const deprecMatch = line.match(/(?:deprecated|DEPRECATED)\s*(?:in favor of|:)?\s*['"`]?(\w+)['"`]?/i);
    if (deprecMatch) {
      // Try to find what's being deprecated from context
      const context = lines.slice(Math.max(0, i - 3), i + 1).join('\n');
      const variantMatch = context.match(/['"`](\w+)['"`]\s*(?:variant|prop)?.*deprecated/i) ||
                           context.match(/(?:The\s+)?['"`](\w+)['"`]\s+(?:variant\s+)?(?:is\s+)?deprecated/i);
      if (variantMatch) {
        deprecations[variantMatch[1]] = {
          replacement: deprecMatch[1],
          line: i + 1,
        };
      }
    }
  }

  return deprecations;
}

// ---------------------------------------------------------------------------
// 8. Per-Component Extraction Pipeline
//
// For each component directory:
// 1. Find the main component file(s)
// 2. Extract styled() variants
// 3. Extract TypeScript interfaces
// 4. Detect compound sub-components
// 5. Apply filter pipeline
// ---------------------------------------------------------------------------

function findComponentFiles(componentDir) {
  const files = [];
  try {
    const entries = readdirSync(componentDir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.tsx') && !entry.name.includes('.stories.') && !entry.name.includes('.test.')) {
        files.push(join(componentDir, entry.name));
      }
      if (entry.isFile() && entry.name === 'types.ts') {
        files.push(join(componentDir, entry.name));
      }
    }
  } catch {
    // Directory doesn't exist
  }
  return files;
}

function extractComponent(componentName) {
  const componentDir = join(COMPONENTS_DIR, componentName);
  if (!existsSync(componentDir)) {
    console.warn(`  Warning: Component directory not found: ${componentDir}`);
    return null;
  }

  const files = findComponentFiles(componentDir);
  if (files.length === 0) {
    console.warn(`  Warning: No .tsx files found in ${componentDir}`);
    return null;
  }

  const result = {
    sourceFile: null,
    primitive: null,
    compound: false,
    subComponents: [],
    props: {},
    deprecated: {},
    styledComponents: {},
  };

  // Track all styled components and interfaces across all files in the directory
  const allStyledComponents = {};
  const allInterfaces = {};
  const allCompoundAssignments = [];
  const allCompositeInterfaces = {};
  const allObjectVars = {};

  for (const file of files) {
    const ast = parseFile(file);
    if (!ast) continue;

    const relPath = file.replace(PICNIC_ROOT + '/', '');

    // Check if this is the main component file
    const fileName = basename(file, '.tsx');
    if (fileName === componentName || fileName === `${componentName}Primitive`) {
      result.sourceFile = relPath;
    }

    const code = readFile(file);

    // Extract all data from this file
    const styled = extractStyledCalls(ast);
    const interfaces = extractInterfaces(ast);
    const compounds = extractCompoundAssignments(ast);
    const composites = extractCompositeInterface(ast);
    const deprecations = code ? extractDeprecations(code) : {};
    const objVars = extractObjectVariables(ast);

    Object.assign(allStyledComponents, styled);
    Object.assign(allObjectVars, objVars);
    Object.assign(allInterfaces, interfaces);
    allCompoundAssignments.push(...compounds);
    Object.assign(allCompositeInterfaces, composites);
    Object.assign(result.deprecated, deprecations);
  }

  // If no main source file was identified, use the first .tsx file
  if (!result.sourceFile && files.length > 0) {
    result.sourceFile = files[0].replace(PICNIC_ROOT + '/', '');
  }

  // Resolve variant references (e.g., `align: cellAlignVariants`)
  // using object variable definitions found in the same file
  for (const [scName, sc] of Object.entries(allStyledComponents)) {
    sc.variants = resolveVariantRefs(sc.variants, allObjectVars);
  }

  result.styledComponents = allStyledComponents;

  // Determine if this is a compound component
  const compositeKeys = Object.keys(allCompositeInterfaces);
  if (compositeKeys.length > 0) {
    result.compound = true;
    // Use the CompositeComponent interface as the authoritative source
    result.subComponents = allCompositeInterfaces[compositeKeys[0]];
  } else if (allCompoundAssignments.length > 0) {
    // Fallback: use direct assignments
    const parentName = allCompoundAssignments[0]?.parentName;
    const subs = allCompoundAssignments
      .filter(a => a.parentName === parentName)
      .map(a => a.subName);
    if (subs.length > 0) {
      result.compound = true;
      result.subComponents = subs;
    }
  }

  // Build props from the primary styled component (Pattern A: pure styled)
  // Look for the main component's styled call. Pass compound flag so that
  // compound components (Table, Dialog, etc.) don't accidentally pick up
  // sub-component primitives as the "main" styled component.
  const mainStyledName = findMainStyledComponent(componentName, allStyledComponents, result.compound);
  if (mainStyledName) {
    const sc = allStyledComponents[mainStyledName];
    result.primitive = sc.baseElement;

    // Convert Stitches variants to props
    for (const [variantName, values] of Object.entries(sc.variants)) {
      if (shouldExcludeProp(variantName)) continue;

      const isBooleanVariant = values.length === 2 &&
        values.includes('true') && values.includes('false');

      if (isBooleanVariant) {
        result.props[variantName] = {
          type: 'boolean',
          default: sc.defaultVariants[variantName] !== undefined
            ? String(sc.defaultVariants[variantName]) : undefined,
          required: false,
          source: 'stitches-variant',
        };
      } else {
        result.props[variantName] = {
          type: 'enum',
          values: values.filter(v => !v.startsWith('<ref:')),
          default: sc.defaultVariants[variantName] !== undefined
            ? String(sc.defaultVariants[variantName]) : undefined,
          required: false,
          source: 'stitches-variant',
        };
      }
    }
  }

  // Merge props from explicit interfaces (Pattern B/C/D)
  const propsInterface = findPropsInterface(componentName, allInterfaces);
  if (propsInterface) {
    for (const [propName, propInfo] of Object.entries(propsInterface.props)) {
      if (shouldExcludeProp(propName)) continue;
      if (STANDARD_HTML_PROPS.has(propName)) continue;

      // Don't overwrite variant-derived props with interface props
      if (!result.props[propName]) {
        result.props[propName] = {
          type: simplifyType(propInfo.type),
          required: propInfo.required,
          source: 'interface',
        };
      }
    }
  }

  // Extract sub-component props for compound components
  const subComponentProps = {};
  if (result.compound && result.subComponents.length > 0) {
    for (const subName of result.subComponents) {
      // Check for a corresponding interface
      const subInterfaceName = `${subName}Props` || `${componentName}${subName}Props`;
      for (const [ifaceName, iface] of Object.entries(allInterfaces)) {
        if (ifaceName === subInterfaceName ||
            ifaceName === `${componentName}${subName}Props` ||
            ifaceName.includes(subName)) {
          const filteredProps = {};
          for (const [pName, pInfo] of Object.entries(iface.props)) {
            if (shouldExcludeProp(pName)) continue;
            if (STANDARD_HTML_PROPS.has(pName) && !isSpecialProp(pName, componentName)) continue;
            filteredProps[pName] = {
              type: simplifyType(pInfo.type),
              required: pInfo.required,
              source: 'interface',
            };
          }
          if (Object.keys(filteredProps).length > 0) {
            subComponentProps[subName] = filteredProps;
          }
          break;
        }
      }

      // Also check for styled variants on sub-component primitives
      for (const [scName, sc] of Object.entries(allStyledComponents)) {
        if (scName.includes(subName) && scName !== mainStyledName) {
          for (const [vName, values] of Object.entries(sc.variants)) {
            if (shouldExcludeProp(vName)) continue;

            if (!subComponentProps[subName]) subComponentProps[subName] = {};

            const isBool = values.length === 2 &&
              values.includes('true') && values.includes('false');

            subComponentProps[subName][vName] = {
              type: isBool ? 'boolean' : 'enum',
              values: isBool ? undefined : values,
              default: sc.defaultVariants[vName] !== undefined
                ? String(sc.defaultVariants[vName]) : undefined,
              required: false,
              source: 'stitches-variant',
            };
          }
        }
      }
    }
  }

  if (Object.keys(subComponentProps).length > 0) {
    result.subComponentProps = subComponentProps;
  }

  return result;
}

/**
 * Find the main styled component for a given component name.
 *
 * For compound components (Table, Dialog, etc.) the main component is often
 * a React.forwardRef or React.FC — NOT a styled() call. In those cases,
 * we return null so that props come only from the TypeScript interface,
 * not from a sub-component's styled() variants.
 */
function findMainStyledComponent(componentName, styledComponents, isCompound) {
  // Priority order for matching:
  // 1. Exact name: Badge, Heading, etc.
  // 2. Primitive name: ButtonPrimitive, TextInputPrimitive
  const candidates = [
    componentName,
    `${componentName}Primitive`,
    `${componentName}Component`,
  ];

  for (const candidate of candidates) {
    if (styledComponents[candidate]) return candidate;
  }

  // For compound components, don't fall through to sub-component primitives.
  // The main component's props come from its TypeScript interface, not from
  // any styled() call (which would be a sub-component's primitive).
  if (isCompound) return null;

  // For non-compound components, try fallback heuristics
  const keys = Object.keys(styledComponents);
  if (keys.length === 1) return keys[0];

  // Check for a styled component that uses a base HTML element
  for (const [name, sc] of Object.entries(styledComponents)) {
    const htmlElements = ['div', 'button', 'input', 'textarea', 'span', 'a', 'em', 'h1', 'h2', 'h3', 'svg', 'form', 'select', 'label'];
    if (htmlElements.includes(sc.baseElement)) return name;
  }

  return keys[0] || null;
}

/**
 * Find and merge all matching props interfaces for a component.
 *
 * For example, Table has both TableProps (textVariant) and TablePrimitiveProps
 * (columns, columnSizes). We merge them to capture all documented props.
 */
function findPropsInterface(componentName, interfaces) {
  const candidates = [
    `${componentName}Props`,
    `${componentName}PrimitiveProps`,
    `${componentName}ComponentProps`,
  ];

  const merged = { props: {}, extends: [] };
  let found = false;

  for (const candidate of candidates) {
    if (interfaces[candidate]) {
      found = true;
      Object.assign(merged.props, interfaces[candidate].props);
      merged.extends.push(...(interfaces[candidate].extends || []));
    }
  }

  return found ? merged : null;
}

/** Check if a standard HTML prop is given special meaning by a specific component */
function isSpecialProp(propName, componentName) {
  // Some props are standard HTML but have Picnic-specific handling
  const specialCases = {
    'disabled': ['Button', 'IconButton', 'TextInput', 'TextArea', 'Select'],
    'placeholder': ['TextInput', 'TextArea', 'Select', 'SearchBar'],
    'value': ['Select', 'MultiSelect', 'RadioGroup', 'Checkbox'],
  };
  return specialCases[propName]?.includes(componentName) || false;
}

/** Simplify a TypeScript type string for documentation */
function simplifyType(typeStr) {
  if (!typeStr || typeStr === 'unknown') return 'unknown';

  // If it's already an object (e.g., { enum: [...] }), return as-is
  if (typeof typeStr === 'object') return typeStr;

  // Extract<..., 'a' | 'b'> → enum of the literal types
  const extractMatch = typeStr.match(/^Extract<[^,]+,\s*(.+)>$/);
  if (extractMatch) {
    const inner = extractMatch[1];
    const literals = inner.split('|')
      .map(s => s.trim().replace(/^'|'$/g, ''))
      .filter(s => s && !s.includes('<') && !s.includes('>'));
    if (literals.length > 0) return { enum: literals };
    return 'enum';
  }

  // Union of string literals → enum
  if (typeStr.includes("'") && typeStr.includes(' | ')) {
    const literals = typeStr.split(' | ')
      .map(s => s.trim().replace(/^'|'$/g, ''))
      .filter(s => s && !s.includes('<') && !s.includes('>'));
    if (literals.length > 0) return { enum: literals };
  }

  // Common React types
  if (typeStr.includes('ReactNode')) return 'ReactNode';
  if (typeStr.includes('ReactElement')) return 'ReactElement';
  if (typeStr.includes('MouseEvent')) return 'Function';
  if (typeStr.includes('=>')) return 'Function';

  return typeStr;
}

// ---------------------------------------------------------------------------
// 9. Theme Token Extraction
//
// Parses src/themes/theme-2021.ts to extract all design token scales.
// The theme file exports a single plain object `theme2021` with string literal values.
// ---------------------------------------------------------------------------

function extractTokens() {
  const themeFile = join(THEMES_DIR, 'theme-2021.ts');
  const darkThemeFile = join(THEMES_DIR, 'theme-dark.ts');
  const mediaFile = join(SRC_ROOT, 'media.ts');

  const tokens = {};

  // Parse theme-2021.ts
  const themeAst = parseFile(themeFile);
  if (themeAst) {
    traverse(themeAst, {
      VariableDeclarator(path) {
        if (path.node.id?.name !== 'theme2021') return;
        const init = path.node.init;
        if (!init || init.type !== 'ObjectExpression') return;

        for (const prop of init.properties) {
          if (prop.type === 'SpreadElement') continue;
          const scaleName = prop.key?.name || prop.key?.value;
          if (!scaleName) continue;

          if (prop.value.type === 'ObjectExpression') {
            tokens[scaleName] = extractObjectLiteral(prop.value);
          }
        }
      },
    });
  }

  // Parse dark theme overrides
  const darkTokens = {};
  const darkAst = parseFile(darkThemeFile);
  if (darkAst) {
    traverse(darkAst, {
      VariableDeclarator(path) {
        if (path.node.id?.name !== 'themeDark') return;
        const init = path.node.init;
        if (!init || init.type !== 'ObjectExpression') return;

        for (const prop of init.properties) {
          if (prop.type === 'SpreadElement') continue;
          const scaleName = prop.key?.name || prop.key?.value;
          if (!scaleName) continue;

          if (prop.value.type === 'ObjectExpression') {
            // Only capture non-spread properties (overrides)
            const overrides = {};
            for (const innerProp of prop.value.properties) {
              if (innerProp.type === 'SpreadElement') continue;
              const key = innerProp.key?.name || innerProp.key?.value;
              const val = extractLiteralValue(innerProp.value);
              if (key && val !== undefined) overrides[key] = val;
            }
            if (Object.keys(overrides).length > 0) {
              darkTokens[scaleName] = overrides;
            }
          }
        }
      },
    });
  }

  // Parse breakpoints from media.ts
  const breakpoints = {};
  const mediaAst = parseFile(mediaFile);
  if (mediaAst) {
    traverse(mediaAst, {
      VariableDeclarator(path) {
        if (path.node.id?.name !== 'bpWidths') return;
        const init = path.node.init;
        if (!init || init.type !== 'ObjectExpression') return;
        Object.assign(breakpoints, extractObjectLiteral(init));
      },
    });
  }

  return {
    scales: tokens,
    darkOverrides: darkTokens,
    breakpoints,
  };
}

/** Extract a plain object literal from an AST ObjectExpression node */
function extractObjectLiteral(node) {
  const result = {};
  if (!node || node.type !== 'ObjectExpression') return result;

  for (const prop of node.properties) {
    if (prop.type === 'SpreadElement') continue;
    const key = prop.key?.name || prop.key?.value;
    if (!key) continue;

    const val = extractLiteralValue(prop.value);
    if (val !== undefined) {
      result[key] = val;
    } else if (prop.value.type === 'ObjectExpression') {
      result[key] = extractObjectLiteral(prop.value);
    }
  }

  return result;
}

// ---------------------------------------------------------------------------
// 10. Icon Extraction
//
// Lists all icon names from the icon-set directories.
// Icon names are derived from file names in src/components/Icon/icon-set/icons/
// ---------------------------------------------------------------------------

function extractIcons() {
  const iconsDir = join(COMPONENTS_DIR, 'Icon', 'icon-set', 'icons');
  const thirdPartyDir = join(COMPONENTS_DIR, 'Icon', 'icon-set', 'third-party-icons');

  const icons = [];
  const thirdPartyIcons = [];

  if (existsSync(iconsDir)) {
    for (const entry of readdirSync(iconsDir)) {
      if (entry.endsWith('.tsx') && entry !== 'index.ts') {
        icons.push(basename(entry, '.tsx'));
      }
    }
  }

  if (existsSync(thirdPartyDir)) {
    for (const entry of readdirSync(thirdPartyDir)) {
      if (entry.endsWith('.tsx') && entry !== 'index.ts') {
        thirdPartyIcons.push(basename(entry, '.tsx'));
      }
    }
  }

  // Also extract icon colors and sizes from StyledIconComponents.tsx
  const styledIconFile = join(COMPONENTS_DIR, 'Icon', 'StyledIconComponents.tsx');
  const iconVariants = { colors: [], sizes: [] };

  const ast = parseFile(styledIconFile);
  if (ast) {
    const styledCalls = extractStyledCalls(ast);
    const iconComponent = styledCalls['IconComponent'];
    if (iconComponent) {
      iconVariants.sizes = iconComponent.variants.size || [];
      // Colors come from the referenced variable, extract them from the object
      traverse(ast, {
        VariableDeclarator(path) {
          if (path.node.id?.name === 'iconColorsVariants') {
            const init = path.node.init;
            if (init?.type === 'ObjectExpression') {
              iconVariants.colors = init.properties
                .filter(p => p.type !== 'SpreadElement')
                .map(p => p.key?.name || p.key?.value)
                .filter(Boolean);
            }
          }
        },
      });
    }
  }

  return {
    builtIn: icons.sort(),
    thirdParty: thirdPartyIcons.sort(),
    colors: iconVariants.colors,
    sizes: iconVariants.sizes,
    count: { builtIn: icons.length, thirdParty: thirdPartyIcons.length },
  };
}

// ---------------------------------------------------------------------------
// 11. Component Categorization
//
// Assigns components to categories based on their patterns and characteristics.
// This is a heuristic — human curation overrides these assignments.
// ---------------------------------------------------------------------------

const CATEGORY_HINTS = {
  // Data display
  'Badge': 'data-display', 'Tag': 'data-display', 'Text': 'data-display',
  'Heading': 'data-display', 'List': 'data-display', 'Emoji': 'data-display',
  'TextWithOverflowTooltip': 'data-display', 'ProgressBar': 'data-display',
  'StepTracker': 'data-display',

  // Actions
  'Button': 'actions', 'IconButton': 'actions', 'ButtonBar': 'actions',
  'ButtonGroup': 'actions', 'Link': 'actions', 'PickerButton': 'actions',

  // Form inputs
  'TextInput': 'form-input', 'TextArea': 'form-input', 'Select': 'form-input',
  'MultiSelect': 'form-input', 'SearchableSelect': 'form-input',
  'Checkbox': 'form-input', 'RadioGroup': 'form-input', 'Switch': 'form-input',
  'FileInput': 'form-input', 'DatePicker': 'form-input', 'TimePicker': 'form-input',
  'SearchBar': 'form-input', 'TagSelector': 'form-input',
  'Form': 'form-input', 'FormField': 'form-input', 'InputGroup': 'form-input',

  // Layout
  'Box': 'layout', 'Stack': 'layout', 'Grid': 'layout', 'Card': 'layout',
  'Separator': 'layout', 'PageLayout': 'layout', 'FooterLayout': 'layout',
  'Breadcrumbs': 'layout', 'ContainedLabel': 'layout',

  // Overlays
  'Dialog': 'overlay', 'StandardDialog': 'overlay', 'Drawer': 'overlay',
  'Popover': 'overlay', 'Tooltip': 'overlay', 'DropdownMenu': 'overlay',
  'IconPopover': 'overlay',

  // Navigation
  'TabGroup': 'navigation', 'Paginator': 'navigation', 'Accordion': 'navigation',

  // Media
  'Icon': 'media', 'IconCircle': 'media', 'ImagePreview': 'media',
  'ResponsiveImage': 'media', 'Logomark': 'media', 'Wordmark': 'media',

  // Feedback
  'Banner': 'feedback', 'LoadingIndicator': 'feedback',
  'LoadingPlaceholder': 'feedback',

  // Data table
  'Table': 'data-table',

  // Scroll
  'ContinuousScroll': 'scroll',
};

function categorizeComponent(componentName) {
  return CATEGORY_HINTS[componentName] || 'uncategorized';
}

// ---------------------------------------------------------------------------
// 12. Main Extraction Pipeline
// ---------------------------------------------------------------------------

async function main() {
  console.log('Picnic Component Extractor');
  console.log(`Source: ${PICNIC_ROOT}`);
  console.log('');

  // Discover components
  const allComponents = discoverComponents();
  console.log(`Discovered ${allComponents.length} components from barrel export`);

  // Filter to requested components if --components flag was used
  const targetComponents = args.components
    ? args.components.split(',').map(c => c.trim())
    : allComponents;

  const unknownComponents = targetComponents.filter(c => !allComponents.includes(c));
  if (unknownComponents.length > 0) {
    console.warn(`Warning: Unknown components (not in barrel export): ${unknownComponents.join(', ')}`);
  }

  const validComponents = targetComponents.filter(c => allComponents.includes(c));
  console.log(`Extracting ${validComponents.length} components...`);
  console.log('');

  // Extract components
  const components = {};
  let successCount = 0;
  let failCount = 0;

  for (const name of validComponents) {
    process.stdout.write(`  Extracting ${name}...`);
    try {
      const data = extractComponent(name);
      if (data) {
        components[name] = {
          category: categorizeComponent(name),
          sourceFile: data.sourceFile,
          primitive: data.primitive,
          compound: data.compound,
          subComponents: data.subComponents,
          props: data.props,
          deprecated: data.deprecated,
          ...(data.subComponentProps ? { subComponentProps: data.subComponentProps } : {}),
        };
        successCount++;
        console.log(' OK');
      } else {
        failCount++;
        console.log(' SKIP (no data)');
      }
    } catch (err) {
      failCount++;
      console.log(` ERROR: ${err.message}`);
    }
  }

  console.log('');
  console.log(`Components: ${successCount} extracted, ${failCount} failed`);

  // Extract tokens
  console.log('Extracting design tokens...');
  const tokens = extractTokens();
  const tokenScaleCount = Object.keys(tokens.scales).length;
  const totalTokens = Object.values(tokens.scales).reduce(
    (sum, scale) => sum + Object.keys(scale).length, 0
  );
  console.log(`  ${tokenScaleCount} scales, ${totalTokens} tokens total`);

  // Extract icons
  console.log('Extracting icons...');
  const icons = extractIcons();
  console.log(`  ${icons.count.builtIn} built-in, ${icons.count.thirdParty} third-party`);

  // Build output
  const output = {
    extractedAt: new Date().toISOString(),
    sourceCommit: getSourceCommit(),
    sourcePath: 'libs/picnic',
    componentCount: Object.keys(components).length,
    components,
    tokens,
    icons,
  };

  // Write output
  const outputPath = resolve(args.output);
  writeFileSync(outputPath, JSON.stringify(output, null, 2));
  console.log('');
  console.log(`Output written to: ${outputPath}`);

  // Summary statistics
  const compoundCount = Object.values(components).filter(c => c.compound).length;
  const totalProps = Object.values(components).reduce(
    (sum, c) => sum + Object.keys(c.props).length, 0
  );
  const totalSubs = Object.values(components).reduce(
    (sum, c) => sum + c.subComponents.length, 0
  );

  console.log('');
  console.log('Summary:');
  console.log(`  Components:     ${Object.keys(components).length}`);
  console.log(`  Compound:       ${compoundCount} (${totalSubs} sub-components total)`);
  console.log(`  Props extracted: ${totalProps}`);
  console.log(`  Token scales:   ${tokenScaleCount} (${totalTokens} tokens)`);
  console.log(`  Icons:          ${icons.count.builtIn} + ${icons.count.thirdParty} third-party`);
  console.log(`  Breakpoints:    ${Object.keys(tokens.breakpoints).length}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
