---
name: pr-assets
description: Upload screenshots and videos to get permanent public URLs for GitHub PRs. Use when adding images, recordings, or other media to a PR description or comment.
---

Upload the file:

```sh
~/.claude/skills/pr-assets/upload.sh <file>
```

It prints two lines: the public URL, then a markdown snippet. Images get an inline image; anything else, video included, gets a link. Paste the snippet into the PR with `gh pr edit` or `gh pr comment`.

URLs are permanent and public. GitHub plays inline video only for its own `user-attachments` uploads; when the PR needs an inline player, tell the user to drag the video into the PR in the browser.

The script needs `PR_ASSETS_KEY` in the environment. If it is missing, ask the user for it.
