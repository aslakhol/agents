---
name: you-might-not-need-an-effect
description: Find and fix useEffect anti-patterns based on React guidelines
argument-hint: "[scope] [fix=true|false]"
disable-model-invocation: true
---

Find and fix unnecessary useEffect usage based on React's official guidelines.

## Arguments

Parse from $ARGUMENTS:
- **scope**: What to analyze. Default: "diff to main". Examples:
  - "diff to main" or "diff to develop" - changes in current branch
  - "PR #123" - changes in a pull request
  - "src/components/" - specific directory
  - "whole codebase" - scan everything
- **fix**: Whether to apply fixes. Default: true. Set to "fix=false" to only propose changes.

## Steps

1. First, read https://react.dev/learn/you-might-not-need-an-effect to understand the guidelines
2. Based on the scope, find React files to analyze:
   - For "diff to X": `git diff X..HEAD --name-only -- '*.tsx' '*.jsx'`
   - For "PR #N": `gh pr diff N --name-only` filtered to React files
   - For a path: all .tsx/.jsx files in that path
   - For "whole codebase": all .tsx/.jsx files
3. Search for `useEffect` in those files
4. For each useEffect, check if it matches any anti-pattern from the docs
5. If fix=true, apply the fixes. If fix=false, list proposed changes without applying.

## Common Anti-patterns to Look For

- **Updating state based on props/state**: useEffect that sets state derived from other state/props → use computed values or useMemo
- **Resetting state on prop change**: useEffect with key-like behavior → use the `key` prop instead
- **Fetching data in useEffect without cleanup**: missing abort controller or race condition handling
- **Subscribing to external store**: useEffect + setState for external data → use useSyncExternalStore
- **Initializing state from props**: useEffect to sync prop to state → initialize state directly or lift state up
- **Notifying parent of state changes**: useEffect to call parent callback → call during the event instead
- **Chains of useEffects**: one effect triggers another → consolidate or compute during render

## Output

Report findings as:
```
## useEffect Analysis

### file.tsx:42 - [Anti-pattern name]
Current: <code snippet>
Issue: <explanation>
Fix: <proposed fix or "Applied">
```
