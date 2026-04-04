---
"@merkur/tool-storybook": patch
---

Use `hookMethod` to intercept `widget.update` instead of patching internal lifecycle.

- **What** `mountNewWidget` in `packages/tool-storybook/src/index.js` now uses `hookMethod(widget, 'update', ...)` from `@merkur/core` to intercept `widget.update`, replacing the previous approach of directly mutating `widget.$in.component.lifeCycle.update`.
- **Why** The previous approach reached into internal implementation details (`$in.component.lifeCycle`) which was fragile and could break silently if the internal structure changed. Using the public `hookMethod` API is more robust, correctly preserves and returns the original call's result, and follows the established pattern for extending widget behaviour.
- **How** Nothing.
