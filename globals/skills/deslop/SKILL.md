---
name: deslop
description: Remove AI-generated code slop from the current branch
argument-hint: [base-branch]
disable-model-invocation: true
---

Remove AI-generated slop from changes in this branch.

## Steps

1. Get the base branch from arguments, default to `main`
2. Run `git diff <base>..HEAD -- '*.ts' '*.tsx'` to see code changes
3. For each changed file, identify and remove slop:
   - **Redundant comments**: JSDoc that just restates the function name, obvious inline comments like `// Search filter`, section headers that don't add value
   - **Excessive defensive checks**: Try/catch blocks or null checks that are abnormal for that area of the codebase
   - **Type workarounds**: Casts to `any` to get around type issues
   - **Style inconsistencies**: Patterns that don't match the rest of the file
4. Read surrounding code in each file to understand what commenting/style patterns are normal
5. Only remove what's clearly slop - when in doubt, leave it
6. Report a 1-3 sentence summary of what was changed

## What IS slop

- `/** * Filters files based on options */` before `filterFiles()` - the name says it all
- `// Search filter` before a block that obviously searches
- Comments that just label code sections: `// Date filter`, `// Owner filter`
- `try { } catch (e) { }` around code that can't throw
- `as any` to silence type errors

## What is NOT slop

- Defensive checks at system boundaries (user input, external APIs)
- Type assertions that are genuinely needed
