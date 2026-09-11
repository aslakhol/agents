---
name: pr
description: Create a pull request following team conventions
argument-hint: [base-branch]
disable-model-invocation: true
allowed-tools: Bash(git *), Bash(gh *)
---

Create a pull request for the current branch.

## Steps

1. Get the base branch from arguments, default to `main`
2. Run these commands to understand the changes:
   - `git log <base>..HEAD --oneline` to see all commits
   - `git diff <base>..HEAD --stat` to see changed files
3. Analyze ALL commits (not just the latest) to understand the full scope
4. Create the PR using `gh pr create --draft` with:
   - **Title**: "Feature Area: Short description" (under 70 characters)
   - **Body**: Follow the format below

## PR Body Format

```
<1-2 sentence paragraph explaining the goal>

## What's done

- <Major accomplishment 1>
- <Major accomplishment 2>
- <etc - focus on outcomes, not implementation details>

Resolves #<issue> (if applicable, use "Resolves" not "Closes")

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

If the PR changes UI (components, views, styles), add this section at the bottom:

```
#### Updates UI

| Before | After |
| ------ | ----- |
|  img   |  img  |
```

## Guidelines

- Keep the title short and use "Feature Area:" prefix
- The goal paragraph should explain WHY, not WHAT
- "What's done" lists accomplishments, not implementation details
- Use "Resolves #issue" syntax (not "Closes")
- Only include the UI table if the PR changes UI
- Push to remote with `-u` flag if needed before creating PR
