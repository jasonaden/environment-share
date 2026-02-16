# Quality Gates - Hook Planning Document

## Overview

This document specifies three quality gate hooks for the `frontend-toolkit` plugin. These hooks provide real-time validation and feedback during code generation, ensuring TypeScript type safety, Relay fragment conventions, and component completeness.

**Target audience**: 50+ frontend engineers working with React + Relay + TypeScript (strict) + Storybook + Picnic + Yogi + MFEs

**Design principles**:
- Fail fast: catch issues immediately after tool use, not in CI
- Non-blocking: hooks warn agents but don't halt execution
- Contextual: only run when relevant file types are modified
- Performance: validate only changed files, not entire codebase

---

## Hook 1: typescript-validate

### Purpose
Runs TypeScript compiler checks immediately after Write or Edit operations on TypeScript files. Surfaces type errors, strict mode violations, and compiler warnings in real-time.

### Event Configuration
- **Event**: `PostToolUse`
- **Trigger**: After `Write` or `Edit` tool completes
- **Matcher**: `\.tsx?$` (matches .ts and .tsx file extensions)
- **Async**: `false` (blocking - agent should see results immediately)

### hooks.json Configuration
```json
{
  "typescript-validate": [
    {
      "matcher": "Write|Edit",
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/validate-typescript.sh",
          "async": false,
          "description": "Validate TypeScript type safety after file modifications"
        }
      ]
    }
  ]
}
```

### Script Specification: validate-typescript.sh

```bash
#!/usr/bin/env bash
set -euo pipefail

# validate-typescript.sh
# Runs tsc --noEmit on modified TypeScript files to catch type errors immediately
# Exit code: 0 = pass, non-zero = validation failed (shown as warning to agent)

# Expected environment variables from Claude Code:
# - TOOL_NAME: "Write" or "Edit"
# - TOOL_ARGS: JSON containing file_path parameter
# - CLAUDE_PROJECT_ROOT: absolute path to project root

# Parse file path from tool arguments
FILE_PATH=$(echo "$TOOL_ARGS" | jq -r '.file_path // empty')

if [[ -z "$FILE_PATH" ]]; then
  echo "⚠️  No file_path found in tool arguments, skipping TypeScript validation"
  exit 0
fi

# Check if file is a TypeScript file
if [[ ! "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  # Not a TypeScript file, skip validation
  exit 0
fi

# Verify file exists
if [[ ! -f "$FILE_PATH" ]]; then
  echo "⚠️  File not found: $FILE_PATH"
  exit 1
fi

# Find project root with tsconfig.json
PROJECT_ROOT="$CLAUDE_PROJECT_ROOT"
TSCONFIG_PATH="$PROJECT_ROOT/tsconfig.json"

if [[ ! -f "$TSCONFIG_PATH" ]]; then
  echo "⚠️  No tsconfig.json found in project root: $PROJECT_ROOT"
  echo "    TypeScript validation requires a tsconfig.json file"
  exit 1
fi

echo "🔍 Running TypeScript validation on: $(basename "$FILE_PATH")"

# Run tsc --noEmit on the specific file
# Use --pretty for better error formatting
# Capture output for parsing
TSC_OUTPUT=$(npx tsc --noEmit --pretty false "$FILE_PATH" 2>&1) || TSC_EXIT=$?

if [[ ${TSC_EXIT:-0} -eq 0 ]]; then
  echo "✅ TypeScript validation passed"
  exit 0
fi

# Parse and format TypeScript errors
echo ""
echo "❌ TypeScript validation failed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Format output: extract file:line:col and error messages
echo "$TSC_OUTPUT" | while IFS= read -r line; do
  if [[ "$line" =~ ^(.+)\(([0-9]+),([0-9]+)\):\ error\ TS([0-9]+):\ (.+)$ ]]; then
    FILE="${BASH_REMATCH[1]}"
    LINE="${BASH_REMATCH[2]}"
    COL="${BASH_REMATCH[3]}"
    CODE="${BASH_REMATCH[4]}"
    MSG="${BASH_REMATCH[5]}"
    echo "  Line $LINE:$COL - TS$CODE"
    echo "  $MSG"
    echo ""
  elif [[ -n "$line" ]]; then
    # Pass through other lines (code context, etc.)
    echo "  $line"
  fi
done

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "💡 Tip: Run 'npx tsc --noEmit' to see full error details"
echo ""

exit 1
```

### Validation Criteria

**Catches**:
- Type errors (missing properties, wrong types, invalid assignments)
- Strict mode violations (implicit any, strictNullChecks, etc.)
- Import/export resolution errors
- Generic type constraint violations
- Unused variables/parameters (if enabled in tsconfig)

**Passes**:
- Syntactically valid TypeScript with correct types
- Proper interface/type usage
- Valid React component prop types
- Correct Relay fragment type usage

**Limitations**:
- Does not catch runtime errors or logic bugs
- Only validates the specific file, not cross-file type consistency
- Assumes project has valid tsconfig.json

### Integration Notes

1. **Performance**: Runs tsc on single file only. For large files (>1000 lines), validation may take 1-3 seconds.

2. **False positives**: If file depends on types from files the agent hasn't generated yet, validation may fail. Hook warns but doesn't block.

3. **tsconfig.json location**: Assumes tsconfig.json is in `$CLAUDE_PROJECT_ROOT`. For monorepos with multiple tsconfigs, may need enhancement to find nearest tsconfig.

4. **npx vs global tsc**: Uses `npx tsc` to respect project's TypeScript version. Requires node_modules to be installed.

5. **Agent feedback**: Exit code non-zero shows output as warning. Agent can choose to fix issues or proceed if false positive.

---

## Hook 2: check-relay-fragments

### Purpose
Validates Relay GraphQL fragment naming conventions and co-location patterns immediately after Write operations. Ensures fragments follow `ComponentName_propName` naming pattern and are co-located with their components.

### Event Configuration
- **Event**: `PostToolUse`
- **Trigger**: After `Write` tool completes
- **Matcher**: `\.tsx?$` (only check TypeScript files)
- **Async**: `false` (blocking - agent should see results immediately)

### hooks.json Configuration
```json
{
  "check-relay-fragments": [
    {
      "matcher": "Write",
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/check-relay-fragments.sh",
          "async": false,
          "description": "Validate Relay fragment naming and co-location conventions"
        }
      ]
    }
  ]
}
```

### Script Specification: check-relay-fragments.sh

```bash
#!/usr/bin/env bash
set -euo pipefail

# check-relay-fragments.sh
# Validates Relay GraphQL fragment naming conventions
# Convention: Fragment names must match ComponentName_propName pattern
# Fragments must be co-located with their component (same directory)

# Expected environment variables:
# - TOOL_ARGS: JSON containing file_path
# - CLAUDE_PROJECT_ROOT: project root

FILE_PATH=$(echo "$TOOL_ARGS" | jq -r '.file_path // empty')

if [[ -z "$FILE_PATH" || ! -f "$FILE_PATH" ]]; then
  exit 0
fi

# Only check .ts and .tsx files
if [[ ! "$FILE_PATH" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

echo "🔍 Checking Relay fragment conventions in: $(basename "$FILE_PATH")"

# Extract component name from file path
# Assume component files are named ComponentName.tsx or ComponentName/index.tsx
COMPONENT_DIR=$(dirname "$FILE_PATH")
COMPONENT_FILE=$(basename "$FILE_PATH")

# Determine component name
if [[ "$COMPONENT_FILE" == "index.tsx" ]]; then
  # Component is in directory: MyComponent/index.tsx -> MyComponent
  COMPONENT_NAME=$(basename "$COMPONENT_DIR")
elif [[ "$COMPONENT_FILE" =~ ^([A-Z][A-Za-z0-9]+)\.tsx$ ]]; then
  # Component file: MyComponent.tsx -> MyComponent
  COMPONENT_NAME="${BASH_REMATCH[1]}"
else
  # Not a component file pattern, skip validation
  exit 0
fi

# Search for graphql`` tagged templates in the file
# Look for fragment definitions: fragment ComponentName_propName on Type
FRAGMENTS=$(grep -Eo 'graphql`[^`]+`' "$FILE_PATH" | \
            grep -Eo 'fragment [A-Za-z0-9_]+ on [A-Za-z0-9]+' | \
            sed 's/fragment //;s/ on .*//' || true)

if [[ -z "$FRAGMENTS" ]]; then
  # No fragments found, validation passes
  echo "✅ No Relay fragments found (validation not applicable)"
  exit 0
fi

# Validate each fragment name
VALIDATION_FAILED=0
ERRORS=""

while IFS= read -r FRAGMENT_NAME; do
  # Check if fragment name starts with component name
  if [[ ! "$FRAGMENT_NAME" =~ ^${COMPONENT_NAME}_ ]]; then
    VALIDATION_FAILED=1
    ERRORS="${ERRORS}  ❌ Fragment '$FRAGMENT_NAME' should start with '${COMPONENT_NAME}_'\n"
    ERRORS="${ERRORS}     Expected pattern: ${COMPONENT_NAME}_propName\n"
    ERRORS="${ERRORS}\n"
  fi

  # Check if fragment name follows ComponentName_propName pattern
  if [[ ! "$FRAGMENT_NAME" =~ ^[A-Z][A-Za-z0-9]+_[a-z][A-Za-z0-9]*$ ]]; then
    VALIDATION_FAILED=1
    ERRORS="${ERRORS}  ❌ Fragment '$FRAGMENT_NAME' does not follow naming convention\n"
    ERRORS="${ERRORS}     Expected: PascalCase_camelCase (e.g., UserCard_user)\n"
    ERRORS="${ERRORS}\n"
  fi
done <<< "$FRAGMENTS"

if [[ $VALIDATION_FAILED -eq 1 ]]; then
  echo ""
  echo "❌ Relay fragment validation failed"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "Component: $COMPONENT_NAME"
  echo "File: $FILE_PATH"
  echo ""
  echo -e "$ERRORS"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "💡 Relay fragment naming convention:"
  echo "   - Fragment name must start with component name"
  echo "   - Use underscore separator: ComponentName_propName"
  echo "   - Example: UserCard_user, UserCard_profileData"
  echo ""
  echo "📖 See: https://relay.dev/docs/guides/colocation/"
  echo ""
  exit 1
fi

# Additional check: Warn if fragments are imported from other files
# Relay best practice is co-location (fragments defined in component file)
IMPORTED_FRAGMENTS=$(grep -Eo 'import \{[^}]*Fragment[^}]*\}' "$FILE_PATH" || true)

if [[ -n "$IMPORTED_FRAGMENTS" ]]; then
  echo ""
  echo "⚠️  Warning: Detected imported fragments"
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "$IMPORTED_FRAGMENTS"
  echo ""
  echo "💡 Relay best practice: Co-locate fragments with components"
  echo "   Consider defining fragments in this file instead of importing"
  echo ""
  # Don't fail on imports, just warn
fi

echo "✅ Relay fragment naming validation passed"
exit 0
```

### Validation Criteria

**Catches**:
- Fragment names that don't start with component name (e.g., `user_data` instead of `UserCard_userData`)
- Fragment names with incorrect casing (e.g., `usercard_data` instead of `UserCard_data`)
- Fragment names without underscore separator (e.g., `UserCardData` instead of `UserCard_data`)
- Missing fragments in component files (warns if fragments are imported)

**Passes**:
- Correctly named fragments: `UserCard_user`, `ProfileHeader_profile`
- Co-located fragment definitions within component files
- Files without any Relay fragments (not applicable)

**Limitations**:
- Regex-based parsing; may miss fragments in complex template literals
- Cannot validate fragment type correctness (TypeScript/Relay compiler handles that)
- Does not validate fragment spreads or useFragment hooks

### Integration Notes

1. **Relay compiler**: This hook validates naming conventions. Relay compiler validates GraphQL schema correctness. Both are needed.

2. **Co-location detection**: Hook warns if fragments are imported but doesn't fail. Teams may have legitimate reasons to share fragments.

3. **False positives**: If component name detection fails (non-standard file structure), validation may produce incorrect warnings.

4. **Performance**: Fast (regex scanning), typically <100ms per file.

5. **Documentation**: Hook output includes links to Relay docs on co-location best practices.

---

## Hook 3: component-completeness

### Purpose
Verifies that a newly created component has all required files: .tsx implementation, .test.tsx tests, .stories.tsx stories, and index.ts barrel export. Runs when the component-builder agent finishes.

### Event Configuration
- **Event**: `SubagentStop`
- **Trigger**: When subagent finishes execution
- **Matcher**: `component-builder` (agent name)
- **Async**: `false` (blocking - agent should see checklist before task completion)

### hooks.json Configuration
```json
{
  "component-completeness": [
    {
      "matcher": "component-builder",
      "hooks": [
        {
          "type": "command",
          "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/component-completeness.sh",
          "async": false,
          "description": "Verify component has all required files (implementation, tests, stories, exports)"
        }
      ]
    }
  ]
}
```

### Script Specification: component-completeness.sh

```bash
#!/usr/bin/env bash
set -euo pipefail

# component-completeness.sh
# Verifies component directory has all required files
# Required: .tsx (implementation), .test.tsx (tests), .stories.tsx (stories), index.ts (exports)
# Runs after component-builder agent completes

# Expected environment variables:
# - SUBAGENT_NAME: "component-builder"
# - SUBAGENT_RESULT: JSON containing task results
# - CLAUDE_PROJECT_ROOT: project root

echo "🔍 Checking component completeness..."

# Parse component directory from subagent result
# Assume subagent stores component path in result metadata
COMPONENT_PATH=$(echo "$SUBAGENT_RESULT" | jq -r '.metadata.component_path // empty')

if [[ -z "$COMPONENT_PATH" ]]; then
  echo "⚠️  No component_path found in subagent result"
  echo "    Attempting to detect component from recent file operations..."

  # Fallback: find most recently modified .tsx file (not .test.tsx or .stories.tsx)
  COMPONENT_FILE=$(find "$CLAUDE_PROJECT_ROOT" -name "*.tsx" \
                   ! -name "*.test.tsx" \
                   ! -name "*.stories.tsx" \
                   -type f -mmin -5 -print -quit 2>/dev/null || true)

  if [[ -z "$COMPONENT_FILE" ]]; then
    echo "❌ Could not detect component directory"
    exit 1
  fi

  COMPONENT_PATH=$(dirname "$COMPONENT_FILE")
fi

# Verify directory exists
if [[ ! -d "$COMPONENT_PATH" ]]; then
  echo "❌ Component directory not found: $COMPONENT_PATH"
  exit 1
fi

COMPONENT_NAME=$(basename "$COMPONENT_PATH")
echo "Component: $COMPONENT_NAME"
echo "Location: $COMPONENT_PATH"
echo ""

# Define required files
declare -A REQUIRED_FILES=(
  ["implementation"]="*.tsx (not test or story)"
  ["tests"]=".test.tsx"
  ["stories"]=".stories.tsx"
  ["exports"]="index.ts"
)

# Check for each required file
MISSING_FILES=()
FOUND_FILES=()

# Check implementation (.tsx, excluding .test.tsx and .stories.tsx)
IMPL_FILE=$(find "$COMPONENT_PATH" -maxdepth 1 -name "*.tsx" \
            ! -name "*.test.tsx" \
            ! -name "*.stories.tsx" \
            -type f -print -quit 2>/dev/null || true)

if [[ -n "$IMPL_FILE" ]]; then
  FOUND_FILES+=("✅ $(basename "$IMPL_FILE") (implementation)")
else
  MISSING_FILES+=("❌ *.tsx (implementation)")
fi

# Check tests (.test.tsx)
TEST_FILE=$(find "$COMPONENT_PATH" -maxdepth 1 -name "*.test.tsx" -type f -print -quit 2>/dev/null || true)

if [[ -n "$TEST_FILE" ]]; then
  FOUND_FILES+=("✅ $(basename "$TEST_FILE") (tests)")
else
  MISSING_FILES+=("❌ *.test.tsx (tests)")
fi

# Check stories (.stories.tsx)
STORY_FILE=$(find "$COMPONENT_PATH" -maxdepth 1 -name "*.stories.tsx" -type f -print -quit 2>/dev/null || true)

if [[ -n "$STORY_FILE" ]]; then
  FOUND_FILES+=("✅ $(basename "$STORY_FILE") (stories)")
else
  MISSING_FILES+=("❌ *.stories.tsx (stories)")
fi

# Check index.ts (barrel export)
INDEX_FILE="$COMPONENT_PATH/index.ts"

if [[ -f "$INDEX_FILE" ]]; then
  # Verify index.ts exports the component
  if grep -q "export.*from" "$INDEX_FILE"; then
    FOUND_FILES+=("✅ index.ts (exports)")
  else
    FOUND_FILES+=("⚠️  index.ts (exists but may be empty)")
    MISSING_FILES+=("⚠️  index.ts should export component")
  fi
else
  MISSING_FILES+=("❌ index.ts (exports)")
fi

# Print results
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Component Completeness Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ ${#FOUND_FILES[@]} -gt 0 ]]; then
  echo "Found files:"
  for FILE in "${FOUND_FILES[@]}"; do
    echo "  $FILE"
  done
  echo ""
fi

if [[ ${#MISSING_FILES[@]} -gt 0 ]]; then
  echo "Missing files:"
  for FILE in "${MISSING_FILES[@]}"; do
    echo "  $FILE"
  done
  echo ""
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo ""
  echo "❌ Component is incomplete"
  echo ""
  echo "💡 Expected structure:"
  echo "   $COMPONENT_NAME/"
  echo "   ├── $COMPONENT_NAME.tsx      # Component implementation"
  echo "   ├── $COMPONENT_NAME.test.tsx # Unit tests"
  echo "   ├── $COMPONENT_NAME.stories.tsx # Storybook stories"
  echo "   └── index.ts                  # Barrel export"
  echo ""
  exit 1
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Component is complete"
echo ""

# Bonus checks (don't fail, just inform)
echo "Additional checks:"

# Check if component is exported in parent index
PARENT_DIR=$(dirname "$COMPONENT_PATH")
PARENT_INDEX="$PARENT_DIR/index.ts"

if [[ -f "$PARENT_INDEX" ]]; then
  if grep -q "$COMPONENT_NAME" "$PARENT_INDEX"; then
    echo "  ✅ Component exported in parent index.ts"
  else
    echo "  ⚠️  Component not yet exported in parent index.ts"
    echo "     Consider adding: export { default } from './$COMPONENT_NAME';"
  fi
else
  echo "  ℹ️  No parent index.ts found (not required)"
fi

# Check if Storybook config includes this directory
STORYBOOK_CONFIG="$CLAUDE_PROJECT_ROOT/.storybook/main.js"
if [[ -f "$STORYBOOK_CONFIG" ]]; then
  echo "  ✅ Storybook configuration found"
else
  echo "  ⚠️  No .storybook/main.js found"
fi

echo ""
exit 0
```

### Validation Criteria

**Catches**:
- Missing component implementation (.tsx)
- Missing unit tests (.test.tsx)
- Missing Storybook stories (.stories.tsx)
- Missing barrel export (index.ts)
- Empty index.ts (exists but doesn't export)

**Passes**:
- Complete component directory with all 4 required files
- Valid barrel export in index.ts

**Bonus checks** (informational, don't fail):
- Component exported in parent directory's index.ts
- Storybook configuration present in project

**Limitations**:
- Assumes component files are in same directory
- Does not validate file contents (TypeScript validation handles that)
- Does not check test coverage or story completeness

### Integration Notes

1. **Subagent metadata**: Depends on component-builder agent storing `component_path` in result metadata. If not present, falls back to detecting recently modified files.

2. **Timing**: Runs after SubagentStop event. Agent sees checklist before task is marked complete.

3. **Directory structure**: Assumes flat component structure (all files in same directory). For nested components, may need enhancement.

4. **Parent exports**: Bonus check warns if component isn't exported in parent index.ts, but doesn't fail. Teams may organize exports differently.

5. **Storybook config**: Informational check only. Doesn't validate that stories will actually load in Storybook.

---

## Combined hooks.json

Complete hooks configuration for frontend-toolkit plugin:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/validate-typescript.sh",
            "async": false,
            "description": "Validate TypeScript type safety after file modifications"
          }
        ]
      },
      {
        "matcher": "Write",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/check-relay-fragments.sh",
            "async": false,
            "description": "Validate Relay fragment naming and co-location conventions"
          }
        ]
      }
    ],
    "SubagentStop": [
      {
        "matcher": "component-builder",
        "hooks": [
          {
            "type": "command",
            "command": "${CLAUDE_PLUGIN_ROOT}/hooks/scripts/component-completeness.sh",
            "async": false,
            "description": "Verify component has all required files (implementation, tests, stories, exports)"
          }
        ]
      }
    ]
  }
}
```

---

## Skills to Load When Building

When implementing these hooks, load the following skill for guidance:

```bash
/skill plugin-dev:hook-development
```

The `hook-development` skill provides:
- Hook event lifecycle documentation
- Matcher pattern examples
- Environment variable reference ($TOOL_NAME, $TOOL_ARGS, $SUBAGENT_NAME, etc.)
- Script exit code conventions
- Testing utilities

---

## Testing Strategy

### Unit Testing (Individual Hooks)

Each hook script should be testable in isolation:

```bash
# Test typescript-validate hook
export TOOL_NAME="Write"
export TOOL_ARGS='{"file_path": "/path/to/Component.tsx"}'
export CLAUDE_PROJECT_ROOT="/path/to/project"
./hooks/scripts/validate-typescript.sh
```

**Test cases**:

1. **typescript-validate**:
   - Valid TypeScript file → exit 0
   - Type error in file → exit 1, formatted error output
   - Non-TypeScript file → exit 0 (skipped)
   - Missing tsconfig.json → exit 1, warning message
   - File doesn't exist → exit 1, warning message

2. **check-relay-fragments**:
   - Valid fragment naming → exit 0
   - Invalid fragment name (wrong prefix) → exit 1, error details
   - Invalid fragment name (wrong casing) → exit 1, error details
   - No fragments in file → exit 0 (not applicable)
   - Imported fragments → exit 0, warning message
   - Non-component file → exit 0 (skipped)

3. **component-completeness**:
   - Complete component directory → exit 0, checklist
   - Missing .test.tsx → exit 1, missing file list
   - Missing .stories.tsx → exit 1, missing file list
   - Empty index.ts → exit 1, warning
   - Component exported in parent → exit 0, bonus check passed
   - Invalid component path → exit 1, error message

### Integration Testing (Hooks + Claude Code)

Test hooks in real Claude Code sessions:

1. **Setup test project**:
   ```bash
   cd /tmp/test-frontend-toolkit
   npm init -y
   npm install --save-dev typescript @types/react
   npx tsc --init --strict
   ```

2. **Test typescript-validate**:
   - Ask Claude to write a component with type error
   - Verify hook catches error and shows formatted output
   - Ask Claude to fix the error
   - Verify hook passes on corrected code

3. **Test check-relay-fragments**:
   - Ask Claude to write component with Relay fragment
   - Verify hook validates naming convention
   - Intentionally use wrong fragment name
   - Verify hook catches and explains error

4. **Test component-completeness**:
   - Run /new-component command
   - Verify hook runs after component-builder agent
   - Check that completeness report shows all files
   - Manually delete .stories.tsx
   - Re-run component-builder
   - Verify hook detects missing story file

### Performance Testing

Measure hook execution time on representative files:

```bash
# Benchmark typescript-validate
time ./hooks/scripts/validate-typescript.sh
# Target: <2s for files under 500 lines

# Benchmark check-relay-fragments
time ./hooks/scripts/check-relay-fragments.sh
# Target: <100ms per file

# Benchmark component-completeness
time ./hooks/scripts/component-completeness.sh
# Target: <50ms per component
```

### Error Handling Testing

Test hook behavior on edge cases:

1. **Missing dependencies**: Project without TypeScript installed
2. **Monorepo structure**: Multiple tsconfig.json files
3. **Symlinks**: Component directories that are symlinks
4. **Large files**: 5000+ line component files
5. **Concurrent execution**: Multiple Write operations triggering hooks simultaneously

### User Acceptance Testing

Get feedback from frontend engineers:

1. **False positive rate**: Do hooks catch real issues or produce noise?
2. **Error message clarity**: Are error messages actionable?
3. **Performance impact**: Do hooks slow down development?
4. **Coverage**: What issues slip through that hooks should catch?

---

## Implementation Checklist

- [ ] Create hooks.json with all 3 hook configurations
- [ ] Implement validate-typescript.sh with tsc integration
- [ ] Implement check-relay-fragments.sh with regex parsing
- [ ] Implement component-completeness.sh with file verification
- [ ] Write unit tests for each hook script
- [ ] Test hooks in real Claude Code session
- [ ] Measure performance on representative files
- [ ] Document hook behavior in plugin README
- [ ] Add troubleshooting guide for common hook failures
- [ ] Get feedback from 3-5 frontend engineers

---

## Maintenance Notes

### Future Enhancements

1. **typescript-validate**: Support monorepo with multiple tsconfigs (find nearest parent)
2. **check-relay-fragments**: Parse TypeScript AST instead of regex for more robust detection
3. **component-completeness**: Validate test coverage percentage, story completeness
4. **New hook**: Accessibility validation (check for aria-labels, semantic HTML)
5. **New hook**: Bundle size check (warn if component exceeds size threshold)

### Known Limitations

1. Hooks cannot modify files, only warn agents
2. Regex-based parsing may miss edge cases
3. Performance degrades on very large files (>5000 lines)
4. Requires node_modules to be installed for tsc
5. Subagent metadata dependency for component-completeness

### Debugging

Enable verbose logging in hooks:

```bash
export DEBUG=1
./hooks/scripts/validate-typescript.sh
```

Hook logs are written to:
```
~/.claude/logs/hooks-<timestamp>.log
```

Check Claude Code hook execution status:
```bash
claude config get hooks.enabled
claude logs --filter hooks
```
