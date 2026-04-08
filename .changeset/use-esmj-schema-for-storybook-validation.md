---
"@merkur/tool-storybook": patch
"@merkur/core": patch
---

Use `@esmj/schema` for input validation in `createWidgetLoader` and `createPreviewConfig`

- **What** Replaced manual `if`/`throw` validation guards in `createWidgetLoader` and `createPreviewConfig` (in `packages/tool-storybook/src/index.js`) with declarative `@esmj/schema` schemas. Added `@esmj/schema` as a runtime dependency in `packages/tool-storybook/package.json`. Updated affected test expectations in `indexSpec.js` to match the new schema-generated error messages. Exported the existing `isRegistered` function from `packages/core/src/merkur.js` via `packages/core/src/index.js` so `tool-storybook` can use it directly instead of duplicating the registration-key logic.
- **Why** Manual type checks were verbose and inconsistent. Using `@esmj/schema` centralises validation in named schemas (`createWidgetLoaderOptionsSchema`, `createPreviewConfigOptionsSchema`, `widgetPropertiesSchema`), making the rules easier to read, extend, and keep consistent across both functions.
- **How** Nothing.
