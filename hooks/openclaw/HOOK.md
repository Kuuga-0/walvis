---
name: walvis-message-handler
description: WALVIS hook that intercepts incoming messages and auto-routes bookmark saves without explicit @mention
events: ["message:received"]
metadata.openclaw: {"events":["message:received"],"always":false}
---

# WALVIS Message Hook

This hook runs on every received message and checks if it looks like a bookmark being shared (a bare URL or forwarded content) without an explicit @mention command.

## Behavior

When a message is received that:
- Contains only a URL (no other text)
- Is a forwarded message with a URL

And the user has previously set "auto-save" mode via `@walvis -auto on`

Then automatically trigger the save pipeline as if they had typed `@walvis <url>`.

This hook should be lightweight — if the message doesn't match, do nothing.
