---
"@merkur/tool-storybook": patch
---

Wrap `widget.update` directly instead of hooking into internal lifecycle

- **What** Changed `mountNewWidget` in `packages/tool-storybook/src/index.js` to wrap `widget.update` directly rather than patching `widget.$in.component.lifeCycle.update`.
- **Why** The previous approach reached into internal implementation details (`$in.component.lifeCycle`) which was fragile and could break silently if the internal structure changed. Wrapping the public `widget.update` method is more robust and correctly returns the result of the original call.
- **How** Nothing.
