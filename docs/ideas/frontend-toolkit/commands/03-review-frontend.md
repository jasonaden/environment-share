# /review-frontend Command - Planning Document

## Overview

The `/review-frontend` command provides automated code review for frontend code using specialized reviewer agents. It analyzes TypeScript, React, Relay, accessibility, and team conventions, producing a severity-ranked report with actionable fix suggestions.

**Target audience**: Frontend engineers working with React + Relay + TypeScript + Storybook + Picnic/Yogi

**Design goals**:
- Catch common frontend issues before code review
- Enforce team conventions automatically
- Provide actionable feedback with file:line references
- Scale from single files to entire directories
- Parallel review for large changesets
- Integrate with git workflow (review git diff)

---

## Command Metadata

### Frontmatter

```yaml
---
description: Automated frontend code review for React, TypeScript, Relay, accessibility, and team conventions
argument-hint: [file-path | "git diff" | directory] [--severity error|warning|info]
---
```

### Command Invocation

```bash
# Review single file
/review-frontend src/components/UserCard.tsx

# Review git diff (staged and unstaged changes)
/review-frontend "git diff"

# Review entire directory
/review-frontend src/components/cards

# Review only errors and warnings (skip info)
/review-frontend src/components --severity error,warning

# Review specific concern areas
/review-frontend src/components/UserCard.tsx --focus accessibility,performance
```

### Argument Parsing

- **$ARGUMENTS**: User input after command name
- Parse flags: `--severity`, `--focus`, `--format`, `--fix`
- Target: First positional argument (file path, "git diff", or directory)

---

## Command .md Content Outline

### Header Section

```markdown
# Frontend Code Review

This command performs automated code review for frontend code, analyzing:

- **TypeScript**: Type safety, strict mode compliance, type definitions
- **React**: Component patterns, hooks usage, performance anti-patterns
- **Relay**: Fragment conventions, query optimization, cache usage
- **Accessibility**: ARIA attributes, semantic HTML, keyboard navigation
- **Patterns**: Team conventions, naming, file structure
- **Performance**: Bundle size, lazy loading, memoization opportunities
- **Testing**: Test coverage, test quality, missing test cases

The review produces a severity-ranked report with file:line references and fix suggestions.

## Usage

```bash
/review-frontend <target> [options]
```

### Target

- **File path**: Review a single file
  - Example: `src/components/UserCard.tsx`

- **"git diff"**: Review all changes in git working tree
  - Includes staged and unstaged changes
  - Excludes untracked files
  - Example: `"git diff"`

- **Directory**: Review all files in directory recursively
  - Example: `src/components/cards`
  - Large directories may trigger parallel review

### Options

- `--severity <levels>`: Only show findings at specified severity levels
  - Levels: `error`, `warning`, `info`
  - Example: `--severity error,warning` (skip info)
  - Default: all levels

- `--focus <concerns>`: Focus on specific concern areas
  - Concerns: `types`, `patterns`, `accessibility`, `relay`, `performance`, `tests`
  - Example: `--focus accessibility,performance`
  - Default: all concerns

- `--format <format>`: Output format
  - Formats: `interactive` (default), `json`, `markdown`, `github-check`
  - Example: `--format markdown > review.md`

- `--fix`: Automatically fix auto-fixable issues
  - Only applies simple fixes (formatting, imports, etc.)
  - Creates git commit with fixes
  - Example: `--fix`

### Examples

```bash
# Review changes before committing
/review-frontend "git diff"

# Review component with focus on accessibility
/review-frontend src/components/Modal.tsx --focus accessibility

# Review directory, only show errors
/review-frontend src/features/profile --severity error

# Review and auto-fix issues
/review-frontend src/components/Button.tsx --fix

# Generate markdown report
/review-frontend src/ --format markdown > review-report.md
```

## Review Criteria

### TypeScript (types)
- No `any` types (strict mode)
- Proper type annotations on functions
- Interface vs type usage
- Generic type constraints
- Discriminated unions
- Type narrowing

### React Patterns (patterns)
- Proper hooks usage (rules of hooks)
- Component composition over inheritance
- Props interface naming convention
- Avoid inline functions in JSX (performance)
- Key prop in lists
- Controlled vs uncontrolled components
- Prop drilling detection

### Relay (relay)
- Fragment naming: `ComponentName_propName`
- Co-located fragments (not imported)
- Fragment spreading in parent queries
- useFragment hook usage
- Query optimization (pagination, refetch)
- Relay store updates

### Accessibility (accessibility)
- Semantic HTML elements
- ARIA attributes (role, aria-label, aria-describedby)
- Keyboard navigation (tabIndex, onKeyDown)
- Focus management
- Color contrast (if detectable)
- Alt text on images
- Form labels

### Performance (performance)
- React.memo usage
- useMemo/useCallback for expensive operations
- Lazy loading of routes/components
- Bundle size concerns (large imports)
- Expensive renders
- Unnecessary re-renders

### Testing (tests)
- Test coverage (80%+ goal)
- Test quality (avoid testing implementation details)
- Missing edge cases
- Accessibility tests
- Relay mock usage
```

---

### Phase 1: Scope Detection

```markdown
## Phase 1: Scope Detection

**Goal**: Determine what code to review and how to organize the review.

### 1.1 Parse Target and Options

Extract target and flags from arguments:

```bash
# Parse first positional argument as target
TARGET="${ARGUMENTS%% --*}"

# Parse flags
SEVERITY_FLAG=$(echo "$ARGUMENTS" | grep -oP '(?<=--severity )[^\s]+' || echo "")
FOCUS_FLAG=$(echo "$ARGUMENTS" | grep -oP '(?<=--focus )[^\s]+' || echo "")
FORMAT_FLAG=$(echo "$ARGUMENTS" | grep -oP '(?<=--format )[^\s]+' || echo "interactive")
FIX_FLAG=$(echo "$ARGUMENTS" | grep -q -- '--fix' && echo "true" || echo "false")

# Default severity: all levels
SEVERITY_LEVELS=${SEVERITY_FLAG:-"error,warning,info"}

# Default focus: all concerns
FOCUS_CONCERNS=${FOCUS_FLAG:-"types,patterns,accessibility,relay,performance,tests"}
```

If no target provided:

**Prompt**:
```
What would you like to review?

1. Git diff (staged and unstaged changes)
2. Specific file
3. Directory

Choose option (1/2/3):
```

Based on choice, prompt for specifics:
- Option 1: Use git diff
- Option 2: Ask for file path
- Option 3: Ask for directory path

### 1.2 Resolve Target to File List

**If target is "git diff"**:
```bash
# Get list of modified files (staged + unstaged)
FILES=$(git diff --name-only HEAD)
FILES+=$(git diff --cached --name-only)

# Filter to TypeScript/TSX files only
FILES=$(echo "$FILES" | grep -E '\.(ts|tsx)$')

# Remove duplicates
FILES=$(echo "$FILES" | sort -u)

FILE_COUNT=$(echo "$FILES" | wc -l)
```

**If target is a file**:
```bash
# Check file exists
if [[ ! -f "$TARGET" ]]; then
  echo "Error: File not found: $TARGET"
  exit 1
fi

# Check file extension
if [[ ! "$TARGET" =~ \.(ts|tsx)$ ]]; then
  echo "Error: Not a TypeScript file: $TARGET"
  exit 1
fi

FILES="$TARGET"
FILE_COUNT=1
```

**If target is a directory**:
```bash
# Find all TypeScript files in directory
FILES=$(find "$TARGET" -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/node_modules/*" ! -path "*/dist/*")

FILE_COUNT=$(echo "$FILES" | wc -l)

# Check if directory has files
if [[ $FILE_COUNT -eq 0 ]]; then
  echo "Error: No TypeScript files found in: $TARGET"
  exit 1
fi
```

### 1.3 Determine Review Strategy

Based on file count, choose review strategy:

```bash
if [[ $FILE_COUNT -le 10 ]]; then
  REVIEW_STRATEGY="single"
  echo "Review strategy: Single reviewer agent ($FILE_COUNT files)"
elif [[ $FILE_COUNT -le 50 ]]; then
  REVIEW_STRATEGY="parallel-concern"
  echo "Review strategy: Parallel reviewers by concern ($FILE_COUNT files)"
else
  REVIEW_STRATEGY="parallel-batch"
  echo "Review strategy: Parallel reviewers by file batch ($FILE_COUNT files)"
fi
```

**Strategies**:
- **single**: One reviewer agent reviews all files (< 10 files)
- **parallel-concern**: Multiple reviewers, each focused on one concern area (10-50 files)
- **parallel-batch**: Multiple reviewers, each handling a batch of files (> 50 files)

### 1.4 Scope Summary

**Output**:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend Code Review
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target: ${TARGET}
Files: ${FILE_COUNT}
Strategy: ${REVIEW_STRATEGY}

Review focus:
${FOCUS_CONCERNS}

Severity levels:
${SEVERITY_LEVELS}

${FIX_FLAG:+Auto-fix: enabled}

Starting review...
```
```

---

### Phase 2: Review Execution

```markdown
## Phase 2: Review Execution

**Goal**: Execute code review using appropriate agent strategy.

### 2.1 Single Reviewer Strategy

Used when: FILE_COUNT <= 10

```typescript
Task({
  subagent_type: "agent",
  name: "frontend-reviewer",
  prompt: `You are a senior frontend code reviewer specializing in React, TypeScript, Relay, and accessibility.

Your task: Review the following files for code quality, best practices, and team conventions.

Files to review:
${FILES}

Review focus areas: ${FOCUS_CONCERNS}

For each file, analyze:

1. **TypeScript (types)**:
   - Strict mode compliance (no implicit any)
   - Proper type annotations on functions and variables
   - Interface vs type usage (prefer interfaces for objects)
   - Generic type constraints and variance
   - Type narrowing and discriminated unions
   - Avoid type assertions (as) unless necessary

2. **React Patterns (patterns)**:
   - Rules of Hooks (only call at top level, same order)
   - Component naming (PascalCase)
   - Props interface naming: ComponentNameProps
   - Avoid inline arrow functions in JSX (causes re-renders)
   - Key prop in mapped lists (use stable IDs, not index)
   - Controlled vs uncontrolled form inputs
   - Prop drilling (consider context or composition)
   - Avoid using useEffect for derived state

3. **Relay (relay)**:
   - Fragment naming convention: ComponentName_propName
   - Fragments co-located with components (not imported)
   - useFragment hook called with fragment reference
   - Fragment spreading in parent queries
   - Pagination patterns (usePaginationFragment)
   - Mutations and optimistic updates
   - Relay store normalization

4. **Accessibility (accessibility)**:
   - Semantic HTML (button vs div, nav, main, etc.)
   - ARIA attributes (role, aria-label, aria-describedby, aria-live)
   - Keyboard navigation (onKeyDown for Enter/Escape, tabIndex)
   - Focus management (autoFocus, focus() in effects)
   - Form labels (htmlFor attribute, or wrapped label)
   - Alt text on images
   - Interactive elements should be keyboard-accessible

5. **Performance (performance)**:
   - React.memo for expensive components
   - useMemo for expensive computations
   - useCallback for callbacks passed to children
   - Lazy loading for routes/heavy components
   - Avoid large lodash imports (import individual functions)
   - Code splitting opportunities
   - Unnecessary re-renders (useEffect dependencies)

6. **Testing (tests)**:
   - Test files exist (.test.tsx for .tsx files)
   - Test coverage (aim for 80%+ critical paths)
   - Avoid testing implementation details (internal state, private methods)
   - Use React Testing Library queries (getByRole > getByLabelText > getByTestId)
   - Test user-facing behavior (interactions, rendering)
   - Accessibility tests (keyboard navigation, ARIA)
   - Relay mocks for components with fragments

For each issue found, provide:
- **severity**: error | warning | info
- **file**: absolute file path
- **line**: line number (if applicable)
- **concern**: types | patterns | accessibility | relay | performance | tests
- **rule**: short rule identifier (e.g., "no-any", "hooks-order", "fragment-naming")
- **message**: clear description of the issue
- **suggestion**: concrete fix suggestion with code example (if applicable)

Output findings as a structured JSON array:

\`\`\`json
{
  "findings": [
    {
      "severity": "error",
      "file": "/path/to/file.tsx",
      "line": 42,
      "concern": "types",
      "rule": "no-any",
      "message": "Avoid using 'any' type. Use explicit type or 'unknown' if type is truly dynamic.",
      "suggestion": "Replace 'any' with specific type: \\n\\ninterface UserData {\\n  name: string;\\n  email: string;\\n}"
    }
  ],
  "summary": {
    "total_files": 5,
    "total_findings": 23,
    "by_severity": {
      "error": 3,
      "warning": 12,
      "info": 8
    },
    "by_concern": {
      "types": 5,
      "patterns": 8,
      "accessibility": 6,
      "relay": 2,
      "performance": 1,
      "tests": 1
    }
  }
}
\`\`\`

Store the findings JSON in task metadata as 'review_findings'.`,

  autonomous: true,
  max_turns: 20
})
```

### 2.2 Parallel Concern Strategy

Used when: 10 < FILE_COUNT <= 50

Spawn multiple reviewer agents in parallel, each focused on one concern:

```typescript
const concerns = FOCUS_CONCERNS.split(',');
const reviewTasks = [];

for (const concern of concerns) {
  const task = Task({
    subagent_type: "agent",
    name: `frontend-reviewer-${concern}`,
    prompt: `You are a frontend code reviewer specializing in ${concern}.

Your task: Review the following files focusing ONLY on ${concern} issues.

Files to review:
${FILES}

${getConcernSpecificInstructions(concern)}

Output findings as structured JSON (same format as single reviewer).
Store findings in task metadata as 'review_findings'.`,

    autonomous: true,
    max_turns: 15
  });

  reviewTasks.push(task);
}

// Wait for all review tasks to complete
await Promise.all(reviewTasks);
```

**Concern-specific instructions**:

```typescript
function getConcernSpecificInstructions(concern: string): string {
  switch (concern) {
    case 'types':
      return `Focus on TypeScript type safety:
- No any types
- Proper function signatures
- Interface vs type usage
- Generic constraints
- Type assertions`;

    case 'patterns':
      return `Focus on React patterns:
- Hooks rules
- Component composition
- Props conventions
- Performance anti-patterns
- State management`;

    case 'accessibility':
      return `Focus on accessibility:
- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Focus management
- Screen reader support`;

    case 'relay':
      return `Focus on Relay conventions:
- Fragment naming
- Co-location
- useFragment usage
- Query optimization
- Store updates`;

    case 'performance':
      return `Focus on performance:
- React.memo usage
- Memoization opportunities
- Bundle size
- Code splitting
- Unnecessary re-renders`;

    case 'tests':
      return `Focus on testing:
- Test coverage
- Test quality
- Missing edge cases
- RTL best practices
- Accessibility tests`;
  }
}
```

### 2.3 Parallel Batch Strategy

Used when: FILE_COUNT > 50

Split files into batches and review in parallel:

```typescript
const BATCH_SIZE = 20;
const fileBatches = chunkArray(FILES, BATCH_SIZE);
const reviewTasks = [];

for (let i = 0; i < fileBatches.length; i++) {
  const batch = fileBatches[i];

  const task = Task({
    subagent_type: "agent",
    name: `frontend-reviewer-batch-${i}`,
    prompt: `You are a frontend code reviewer.

Your task: Review the following ${batch.length} files.

Files:
${batch.join('\n')}

[Full review instructions as in single reviewer strategy]

Output findings as structured JSON.
Store findings in task metadata as 'review_findings'.`,

    autonomous: true,
    max_turns: 20
  });

  reviewTasks.push(task);
}

await Promise.all(reviewTasks);
```

### 2.4 Progress Reporting

While review tasks are running, show progress:

```bash
echo "⏳ Review in progress..."
echo ""

# For parallel strategies, show task status
if [[ "$REVIEW_STRATEGY" != "single" ]]; then
  for task in "${reviewTasks[@]}"; do
    TASK_NAME=$(get_task_name "$task")
    TASK_STATUS=$(get_task_status "$task")
    echo "  ${TASK_STATUS_ICON} ${TASK_NAME}: ${TASK_STATUS}"
  done
fi
```
```

---

### Phase 3: Report Consolidation

```markdown
## Phase 3: Report Consolidation

**Goal**: Merge findings from all reviewer agents, deduplicate, and rank by severity.

### 3.1 Collect Findings

Extract findings from all review task results:

```typescript
const allFindings = [];

for (const task of reviewTasks) {
  const findings = task.metadata.review_findings;

  if (findings && findings.findings) {
    allFindings.push(...findings.findings);
  }
}
```

### 3.2 Deduplicate Findings

Remove duplicate findings (same file, line, rule):

```typescript
function deduplicateFindings(findings) {
  const seen = new Set();
  const unique = [];

  for (const finding of findings) {
    const key = `${finding.file}:${finding.line}:${finding.rule}`;

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(finding);
    }
  }

  return unique;
}

const uniqueFindings = deduplicateFindings(allFindings);
```

### 3.3 Filter by Severity

Apply severity filter from command options:

```typescript
const severityFilter = SEVERITY_LEVELS.split(',');

const filteredFindings = uniqueFindings.filter(finding =>
  severityFilter.includes(finding.severity)
);
```

### 3.4 Group and Sort Findings

Group findings by file and sort by severity:

```typescript
const findingsByFile = {};

for (const finding of filteredFindings) {
  if (!findingsByFile[finding.file]) {
    findingsByFile[finding.file] = [];
  }
  findingsByFile[finding.file].push(finding);
}

// Sort findings within each file by line number
for (const file in findingsByFile) {
  findingsByFile[file].sort((a, b) => (a.line || 0) - (b.line || 0));
}

// Sort files by number of errors (descending)
const sortedFiles = Object.keys(findingsByFile).sort((a, b) => {
  const errorsA = findingsByFile[a].filter(f => f.severity === 'error').length;
  const errorsB = findingsByFile[b].filter(f => f.severity === 'error').length;
  return errorsB - errorsA;
});
```

### 3.5 Generate Summary Statistics

```typescript
const summary = {
  total_files_reviewed: FILE_COUNT,
  files_with_issues: sortedFiles.length,
  total_findings: filteredFindings.length,
  by_severity: {
    error: filteredFindings.filter(f => f.severity === 'error').length,
    warning: filteredFindings.filter(f => f.severity === 'warning').length,
    info: filteredFindings.filter(f => f.severity === 'info').length,
  },
  by_concern: {},
};

for (const concern of FOCUS_CONCERNS.split(',')) {
  summary.by_concern[concern] = filteredFindings.filter(
    f => f.concern === concern
  ).length;
}
```
```

---

### Phase 4: Presentation

```markdown
## Phase 4: Presentation

**Goal**: Present review findings in requested format.

### 4.1 Interactive Format (Default)

Present findings as formatted terminal output:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend Code Review Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files reviewed: ${summary.total_files_reviewed}
Files with issues: ${summary.files_with_issues}
Total findings: ${summary.total_findings}

By severity:
  ${summary.by_severity.error} errors
  ${summary.by_severity.warning} warnings
  ${summary.by_severity.info} info

By concern:
${Object.entries(summary.by_concern).map(([concern, count]) =>
  `  ${concern}: ${count}`
).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${renderFindingsByFile(findingsByFile, sortedFiles)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${summary.by_severity.error > 0 ? '❌ Review failed: fix errors before merging' : '✅ Review passed'}

${FIX_FLAG === 'true' ? renderAutoFixSection() : renderManualFixSection()}
```

**Render findings by file**:

```typescript
function renderFindingsByFile(findingsByFile, sortedFiles) {
  let output = '';

  for (const file of sortedFiles) {
    const findings = findingsByFile[file];
    const relPath = path.relative(process.cwd(), file);

    output += `\n📄 ${relPath}\n`;
    output += `   ${findings.length} issue${findings.length !== 1 ? 's' : ''}\n\n`;

    for (const finding of findings) {
      const icon = getSeverityIcon(finding.severity);
      const lineRef = finding.line ? `:${finding.line}` : '';

      output += `   ${icon} ${finding.severity.toUpperCase()} [${finding.rule}]\n`;
      output += `   ${relPath}${lineRef}\n`;
      output += `   ${finding.message}\n`;

      if (finding.suggestion) {
        output += `\n   💡 Suggestion:\n`;
        output += indent(finding.suggestion, 6);
        output += `\n`;
      }

      output += `\n`;
    }
  }

  return output;
}

function getSeverityIcon(severity) {
  switch (severity) {
    case 'error': return '❌';
    case 'warning': return '⚠️';
    case 'info': return 'ℹ️';
  }
}
```

### 4.2 JSON Format

Output raw JSON for programmatic consumption:

```bash
if [[ "$FORMAT_FLAG" == "json" ]]; then
  echo "$CONSOLIDATED_REPORT" | jq '.'
  exit 0
fi
```

### 4.3 Markdown Format

Generate markdown report:

```markdown
# Frontend Code Review Report

**Date**: $(date)
**Target**: ${TARGET}
**Files reviewed**: ${summary.total_files_reviewed}

## Summary

| Metric | Count |
|--------|-------|
| Total findings | ${summary.total_findings} |
| Errors | ${summary.by_severity.error} |
| Warnings | ${summary.by_severity.warning} |
| Info | ${summary.by_severity.info} |

## Findings by Concern

| Concern | Count |
|---------|-------|
${Object.entries(summary.by_concern).map(([concern, count]) =>
  `| ${concern} | ${count} |`
).join('\n')}

## Detailed Findings

${renderFindingsAsMarkdown(findingsByFile, sortedFiles)}

## Recommendations

${generateRecommendations(summary, filteredFindings)}
```

### 4.4 GitHub Check Format

Format for GitHub Actions check annotation:

```typescript
function renderGitHubCheckFormat(findings) {
  for (const finding of findings) {
    const level = finding.severity === 'error' ? 'error' : 'warning';

    console.log(
      `::${level} file=${finding.file},line=${finding.line},title=${finding.rule}::${finding.message}`
    );
  }
}
```

### 4.5 Auto-Fix Section

If `--fix` flag is set:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Auto-Fix Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Attempting to auto-fix ${AUTO_FIXABLE_COUNT} issues...

${renderAutoFixAttempts()}

Fixed: ${FIXED_COUNT}
Failed: ${FAILED_COUNT}
Manual intervention required: ${MANUAL_COUNT}

${FIXED_COUNT > 0 ? 'Creating git commit with fixes...' : ''}
```

Auto-fixable issues:
- Import sorting
- Unused imports
- Missing semicolons/trailing commas (via Prettier)
- Basic TypeScript inference improvements
- Simple ARIA attribute additions

Non-auto-fixable issues require manual intervention.
```

---

## Validation Criteria

### Successful Review Output

A complete review produces:

1. **Summary statistics**:
   - Total files reviewed
   - Files with issues
   - Total findings count
   - Breakdown by severity
   - Breakdown by concern

2. **Finding details** (for each finding):
   - Severity (error/warning/info)
   - File path (absolute or relative)
   - Line number
   - Concern category
   - Rule identifier
   - Clear message
   - Actionable suggestion with code example

3. **Pass/fail status**:
   - Pass: No errors (warnings/info OK)
   - Fail: One or more errors

4. **Actionable next steps**:
   - Manual fixes for non-auto-fixable issues
   - Auto-fix command for auto-fixable issues
   - Links to documentation for rules

### Finding Quality

Each finding should be:
- **Specific**: References exact file and line
- **Actionable**: Includes concrete fix suggestion
- **Accurate**: True positive (not false alarm)
- **Consistent**: Follows team conventions
- **Prioritized**: Correct severity level

### Performance

- Single file: < 30 seconds
- 10 files: < 1 minute
- 50 files: < 3 minutes (parallel)
- 100+ files: < 5 minutes (parallel batching)

---

## Skills to Load When Building

```bash
/skill plugin-dev:command-development
```

---

## Error Handling

### Common Failure Scenarios

1. **No files to review**:
   ```
   Error: No files found to review

   Target: ${TARGET}

   Check:
   - File/directory path is correct
   - File extension is .ts or .tsx
   - Directory contains TypeScript files
   - Git working tree has changes (for "git diff")
   ```

2. **Review agent timeout**:
   ```
   Error: Review agent exceeded max_turns

   This may indicate:
   - Too many files to review (try smaller scope)
   - Complex analysis taking too long
   - Agent getting stuck on difficult code

   Partial results saved. Review what was completed so far?
   ```

3. **Invalid target**:
   ```
   Error: Target does not exist: ${TARGET}

   Provide one of:
   - Path to file: src/components/Button.tsx
   - Path to directory: src/components
   - "git diff" to review changes
   ```

4. **Parse error in reviewed file**:
   ```
   Warning: Could not parse file: ${FILE}

   Syntax error at line ${LINE}

   Skipping this file. Fix syntax errors before review.
   ```

5. **Review strategy failure**:
   ```
   Error: Review strategy ${STRATEGY} failed

   Fallback: Using single reviewer strategy

   This may take longer...
   ```

---

## Integration Notes

### Git Integration

For teams using git hooks:

**Pre-commit hook**:
```bash
#!/bin/bash
# .git/hooks/pre-commit

/review-frontend "git diff --cached" --severity error

if [[ $? -ne 0 ]]; then
  echo "Review failed. Fix errors before committing."
  echo "Run: /review-frontend \"git diff --cached\" --fix"
  exit 1
fi
```

**Pre-push hook**:
```bash
#!/bin/bash
# .git/hooks/pre-push

/review-frontend "git diff origin/main...HEAD" --severity error,warning

if [[ $? -ne 0 ]]; then
  echo "Review failed. Fix issues before pushing."
  exit 1
fi
```

### CI/CD Integration

For GitHub Actions:

```yaml
name: Frontend Review

on: [pull_request]

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install Claude CLI
        run: npm install -g @anthropic-ai/claude-code
      - name: Run frontend review
        run: |
          /review-frontend "git diff origin/main...HEAD" \
            --format github-check \
            --severity error,warning
```

### IDE Integration

For VS Code extension:

- Run review on file save
- Show inline diagnostics
- Quick fix actions for auto-fixable issues

---

## Performance Characteristics

### Execution Time

By scope size:
- 1 file: 20-30s
- 5 files: 40-60s
- 10 files: 1-2m (single reviewer)
- 25 files: 2-3m (parallel concern)
- 50 files: 3-4m (parallel concern)
- 100 files: 4-6m (parallel batch)
- 500+ files: 10-15m (parallel batch)

By strategy:
- Single reviewer: ~5-10s per file
- Parallel concern: ~3-5s per file (amortized)
- Parallel batch: ~2-4s per file (amortized)

### Token Usage

Per file estimates:
- Simple component (50 lines): ~2k tokens
- Medium component (150 lines): ~5k tokens
- Complex component (300+ lines): ~10k tokens

Total for 50 files (mix of sizes): ~250k tokens

For large reviews, consider:
- Batch processing to stay under token limits
- Focus on changed lines only (git diff)
- Severity filtering to reduce output

---

## Future Enhancements

1. **Incremental review**: Only review changed lines, not entire files
2. **Learning mode**: Learn from accepted/rejected suggestions
3. **Custom rules**: Team-specific rules configuration file
4. **Baseline**: Compare findings to baseline (only show new issues)
5. **Trend analysis**: Track issue counts over time
6. **Integration with ESLint**: Parse ESLint config, apply same rules
7. **Visual preview**: Show before/after for auto-fixes
8. **Batch auto-fix**: Apply all auto-fixes at once
9. **Review comments**: Post findings as PR comments (GitHub/GitLab)
10. **Diff-aware review**: Smarter analysis of additions vs changes vs deletions

---

## Implementation Checklist

- [ ] Write command .md with all 4 phases
- [ ] Define frontmatter (description, argument-hint)
- [ ] Implement scope detection logic (file/directory/git diff)
- [ ] Create frontend-reviewer agent prompt
- [ ] Implement single reviewer strategy
- [ ] Implement parallel concern strategy
- [ ] Implement parallel batch strategy
- [ ] Add finding deduplication logic
- [ ] Add severity filtering
- [ ] Implement interactive format output
- [ ] Implement JSON format output
- [ ] Implement markdown format output
- [ ] Implement GitHub check format output
- [ ] Add auto-fix capability for simple issues
- [ ] Test with single file
- [ ] Test with git diff
- [ ] Test with large directory (100+ files)
- [ ] Test severity filtering
- [ ] Test focus filtering
- [ ] Verify performance (< 5m for 100 files)
- [ ] Document in plugin README
- [ ] Get feedback from 3-5 frontend engineers

---

## Appendix: Example Output

### Interactive Format Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Frontend Code Review Results
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Files reviewed: 12
Files with issues: 8
Total findings: 23

By severity:
  3 errors
  12 warnings
  8 info

By concern:
  types: 5
  patterns: 8
  accessibility: 6
  relay: 2
  performance: 1
  tests: 1

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📄 src/components/UserCard.tsx
   4 issues

   ❌ ERROR [no-any]
   src/components/UserCard.tsx:15
   Avoid using 'any' type. Use explicit type or 'unknown' if type is truly dynamic.

   💡 Suggestion:
      Replace 'any' with specific type:

      interface UserData {
        name: string;
        email: string;
        avatarUrl?: string;
      }

   ⚠️  WARNING [fragment-naming]
   src/components/UserCard.tsx:28
   Fragment name 'userData' does not follow naming convention.
   Expected: UserCard_user

   💡 Suggestion:
      Rename fragment:

      const UserCardFragment = graphql`
        fragment UserCard_user on User {
          name
          email
          avatarUrl
        }
      `;

   ⚠️  WARNING [missing-aria-label]
   src/components/UserCard.tsx:42
   Interactive element missing accessible name.
   Add aria-label or aria-labelledby.

   💡 Suggestion:
      Add aria-label:

      <button
        onClick={handleClick}
        aria-label={`View profile for ${user.name}`}
      >
        View Profile
      </button>

   ℹ️  INFO [use-memo-opportunity]
   src/components/UserCard.tsx:52
   Consider memoizing expensive computation.

   💡 Suggestion:
      Wrap in useMemo:

      const formattedDate = useMemo(
        () => formatDate(user.createdAt),
        [user.createdAt]
      );

📄 src/components/ProfileHeader.tsx
   3 issues

   [... more findings ...]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Review failed: fix errors before merging

Next steps:
1. Fix 3 errors manually (see suggestions above)
2. Run auto-fix for 8 auto-fixable issues:
   /review-frontend src/components --fix
3. Review warnings and info for code quality improvements

Documentation:
- TypeScript best practices: https://docs.company.com/frontend/typescript
- Relay conventions: https://docs.company.com/frontend/relay
- Accessibility guide: https://docs.company.com/frontend/a11y
```
