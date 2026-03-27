---
"@merkur/tool-storybook": patch
---

Fix `createVanillaRenderer` to store the DOM container in a `WeakMap` instead of on the widget.

- **What** In `createVanillaRenderer` (`packages/tool-storybook/src/index.js`), the renderer-created DOM container is now stored in a dedicated `widgetContainerMap` WeakMap instead of being assigned directly as `widget.container`. The `update` function retrieves the container from this map rather than from `widget.container`.
- **Why** `createMerkurWidget` calls `Object.seal(widget)` after construction, which prevents adding new properties to the widget object. Attempting to assign `widget.container` after sealing threw `TypeError: Cannot add property container, object is not extensible`, causing vanilla widget stories to fail to render in Storybook.
- **How** Nothing.
