---
"@merkur/cli": minor
---

Added the ability to statically deploy a playground for a Merkur widget with a server

- **What** Added `apiRoute` into `merkurConfig.widgetServer` to centralize the widget API endpoint name. Added `relativeUrlDefault` and `widgetParamsDefault` into `merkurConfig.playground`. `relativeUrlDefault` is used as a fallback playground path and shown in the dev server log, `widgetParamsDefault` is used to build the widget server URL for static playground and shown in the widget server log. The `@merkur/integration` UMD build is now inlined directly into the `head.ejs` template. Refactored `head.ejs` template to use `Merkur.Integration.loadAssets()` for loading widget assets instead of manually rendering asset. In `footer.ejs`, added `onWidgetMounted` callback support after widget mount.
- **Why** To simplify and unify asset loading in the playground, allow flexible widget API endpoint configuration, and make the static playground setup for Merkur widget.
- **How** Nothing.
