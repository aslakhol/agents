---
name: pr-assets
description: Upload screenshots and videos to get permanent public URLs for GitHub PRs. Use when adding images, recordings, or other media to a PR description or comment.
---

Upload the file:

```sh
~/.claude/skills/pr-assets/upload.sh <file>
```

It prints two lines: the public URL, then a markdown snippet. Embed every image in PR descriptions and comments with an inline preview using an inline image; anything else, video included, gets a link. Paste the snippet into the PR with `gh pr edit` or `gh pr comment`.

URLs are permanent and public.

The script reads `PR_ASSETS_KEY` from `.env` next to it (gitignored). If the key is missing, the script prints a setup command and exits. Stop and give the user that command to run themselves. Never ask for the key in chat or write the file for them.
