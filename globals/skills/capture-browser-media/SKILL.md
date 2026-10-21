---
name: capture-browser-media
description: Capture screenshots and videos. Use whenever taking web screenshots or recording browser flows, including media for pull requests.
---

Use standalone headless Playwright for PR screenshots and videos, with explicit viewports such as 1440×900 for desktop and 390×844 for phones. Wait for page content, fonts, and images to finish loading. Save PNG screenshots with `deviceScaleFactor: 2` and `scale: 'device'`. For videos, explicitly set `recordVideo.size` to match the viewport, since Playwright otherwise shrinks recordings to fit 800×800, and await `context.close()` before using the video file.
