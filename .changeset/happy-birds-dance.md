---
"@merkur/tool-storybook": minor
---

Add vanilla JS widget support and preview configuration helpers to Storybook tooling.

- **What** New `createPreviewConfig` helper provides a simplified Storybook `preview.js` setup with automatic widget name/version validation. New `createVanillaRenderer` enables rendering vanilla JavaScript widgets inside Storybook stories; a per-widget WeakMap ensures isolated state across concurrent stories. `createWidgetLoader` now correctly unmounts the previous widget before mounting a new one when switching stories, preserves `state`/`props` keys not present in story args, and supports both `setProps` and `setState` widget APIs. All exported functions are documented with comprehensive JSDoc. Fixed ES11 module format issues that prevented the package from being consumed in certain build pipelines.
- **Why** Previously only Preact-based widgets had first-class Storybook support. Vanilla JS widgets had no renderer, forcing teams to wire up lifecycle management by hand. The missing `createPreviewConfig` abstraction caused boilerplate duplication across projects, and the lifecycle bugs in `createWidgetLoader` led to stale widget instances between story navigations.
- **How** No breaking changes. Opt in to the new helpers by importing them from `@merkur/tool-storybook`. Use `createPreviewConfig({ name, version })` in `.storybook/preview.js` and `createVanillaRenderer()` as the story renderer for vanilla widgets.
