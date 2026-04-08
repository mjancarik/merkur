# Change Log

## 1.0.2

### Patch Changes

- f87e120: Re-release: fix of release jobs

## 1.0.1

### Patch Changes

- 60c8489: Re-release after infrastructure fix

## 1.0.0

### Minor Changes

- 19c2bf2: Add vanilla JS widget support and preview configuration helpers to Storybook tooling.
  - **What** New `createPreviewConfig(options)` helper provides a simplified Storybook `preview.mjs` setup with automatic widget name/version validation via `@esmj/schema` and HMR-safe registration (skips `getMerkur().register` if the widget is already registered). New `createVanillaRenderer()` (no arguments) creates a `render`/`update` pair for vanilla JavaScript widgets; stories supply the view via `args.component` as a function returning an HTML string; before each re-render the renderer calls `widget.unbindEventListeners?.(container)`, sets `container.innerHTML`, and then calls `widget.bindEventListeners?.(container)` to rebind events. A per-widget `WeakMap` stores the container and view function, keeping state isolated across concurrent stories without touching the sealed widget object. `createWidgetLoader` reuses the existing widget instance when the story args are deeply equal (snapshot comparison), and unmounts and remounts only when args differ or the story changes. `state` and `props` are applied after `widget.mount()` so the `load()` lifecycle cannot silently discard story-provided values. All exported functions are documented with JSDoc.
  - **Why** Previously only Preact-based widgets had first-class Storybook support. Vanilla JS widgets had no renderer, forcing teams to wire up lifecycle management by hand. The missing `createPreviewConfig` abstraction caused boilerplate duplication across projects, and the lifecycle bugs in `createWidgetLoader` led to stale widget instances between story navigations.
  - **How** Import the helpers from `@merkur/tool-storybook`. Call `createVanillaRenderer()` in `.storybook/preview.mjs` and spread `createPreviewConfig({ widgetProperties, createWidget, render })` into your preview object; pass `component: MyViewFn` in story `args`, where `MyViewFn` is a function that receives the widget and returns an HTML string. Define `bindEventListeners(widget, container)` (and optionally `unbindEventListeners(widget, container)`) directly on the widget inside its `createWidget` factory for automatic event binding and cleanup between renders — `widget` is auto-injected as the first argument by Merkur's `bindWidgetToFunctions`, so the renderer calls `widget.bindEventListeners(container)` and the underlying function receives `(widget, container)`. Requires Storybook >= 10: this package imports `storybook/preview-api` and `storybook/internal/core-events` at runtime; using it with Storybook < 10 will cause a module-not-found error at load time.

### Patch Changes

- 97aec26: Migrate monorepo build and publish tooling from Lerna to NX and Changesets.
  - **What** The internal monorepo toolchain for versioning and publishing all `@merkur/*` packages has been replaced. Lerna is removed; NX is used for task orchestration and Changesets is used for versioning and changelog generation.
  - **Why** Lerna's versioning model was difficult to maintain for independent package releases and offered limited caching. NX provides better incremental build support and task pipelines, while Changesets gives contributors a structured, PR-friendly workflow for describing and grouping version bumps.
  - **How** No changes required for consumers of `@merkur/*` packages — the published API is unaffected. Internal contributors should use `npm run changeset` to record changes and `npm run release` to publish new versions. See the CONTRIBUTING.md for detailed instructions on the new workflow.

- 7c52a11: Use `@esmj/schema` for input validation in `createWidgetLoader` and `createPreviewConfig`
  - **What** Replaced manual `if`/`throw` validation guards in `createWidgetLoader` and `createPreviewConfig` (in `packages/tool-storybook/src/index.js`) with declarative `@esmj/schema` schemas. Added `@esmj/schema` as a runtime dependency in `packages/tool-storybook/package.json`. Updated affected test expectations in `indexSpec.js` to match the new schema-generated error messages. Exported the existing `isRegistered` function from `packages/core/src/merkur.js` via `packages/core/src/index.js` so `tool-storybook` can use it directly instead of duplicating the registration-key logic.
  - **Why** Manual type checks were verbose and inconsistent. Using `@esmj/schema` centralises validation in named schemas (`createWidgetLoaderOptionsSchema`, `createPreviewConfigOptionsSchema`, `widgetPropertiesSchema`), making the rules easier to read, extend, and keep consistent across both functions.
  - **How** Nothing.

- efb49df: Fix `createVanillaRenderer` to store the DOM container in a `WeakMap` instead of on the widget.
  - **What** In `createVanillaRenderer` (`packages/tool-storybook/src/index.js`), the renderer-created DOM container is now stored in a dedicated `widgetContainerMap` WeakMap instead of being assigned directly as `widget.container`. The `update` function retrieves the container from this map rather than from `widget.container`.
  - **Why** `createMerkurWidget` calls `Object.seal(widget)` after construction, which prevents adding new properties to the widget object. Attempting to assign `widget.container` after sealing threw `TypeError: Cannot add property container, object is not extensible`, causing vanilla widget stories to fail to render in Storybook.
  - **How** Nothing.

- d657698: Use `hookMethod` to intercept `widget.update` instead of patching internal lifecycle.
  - **What** `mountNewWidget` in `packages/tool-storybook/src/index.js` now uses `hookMethod(widget, 'update', ...)` from `@merkur/core` to intercept `widget.update`, replacing the previous approach of directly mutating `widget.$in.component.lifeCycle.update`.
  - **Why** The previous approach reached into internal implementation details (`$in.component.lifeCycle`) which was fragile and could break silently if the internal structure changed. Using the public `hookMethod` API is more robust, correctly preserves and returns the original call's result, and follows the established pattern for extending widget behaviour.
  - **How** Nothing.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.47.2](https://github.com/mjancarik/merkur/compare/v0.47.1...v0.47.2) (2026-03-19)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.47.1](https://github.com/mjancarik/merkur/compare/v0.47.0...v0.47.1) (2026-03-19)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.47.0](https://github.com/mjancarik/merkur/compare/v0.46.2...v0.47.0) (2026-03-19)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.46.0](https://github.com/mjancarik/merkur/compare/v0.45.2...v0.46.0) (2026-03-04)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.45.1](https://github.com/mjancarik/merkur/compare/v0.45.0...v0.45.1) (2026-03-03)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.45.0](https://github.com/mjancarik/merkur/compare/v0.44.1...v0.45.0) (2026-02-01)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.44.0](https://github.com/mjancarik/merkur/compare/v0.43.1...v0.44.0) (2025-12-17)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.43.0](https://github.com/mjancarik/merkur/compare/v0.42.0...v0.43.0) (2025-12-05)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.42.0](https://github.com/mjancarik/merkur/compare/v0.41.1...v0.42.0) (2025-11-28)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.41.0](https://github.com/mjancarik/merkur/compare/v0.40.0...v0.41.0) (2025-11-04)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.40.0](https://github.com/mjancarik/merkur/compare/v0.39.0...v0.40.0) (2025-10-27)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.39.0](https://github.com/mjancarik/merkur/compare/v0.38.2...v0.39.0) (2025-10-27)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.38.0](https://github.com/mjancarik/merkur/compare/v0.37.12...v0.38.0) (2025-07-12)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.37.9](https://github.com/mjancarik/merkur/compare/v0.37.8...v0.37.9) (2025-04-25)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.37.0](https://github.com/mjancarik/merkur/compare/v0.36.5...v0.37.0) (2024-11-12)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.36.0](https://github.com/mjancarik/merkur/compare/v0.35.13...v0.36.0) (2024-05-21)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.35.0](https://github.com/mjancarik/merkur/compare/v0.34.6...v0.35.0) (2024-04-09)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.34.0](https://github.com/mjancarik/merkur/compare/v0.33.0...v0.34.0) (2023-10-11)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.33.0](https://github.com/mjancarik/merkur/compare/v0.32.1...v0.33.0) (2023-08-10)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.32.0](https://github.com/mjancarik/merkur/compare/v0.31.1...v0.32.0) (2023-07-14)

### Features

- 🎸 remove ES5 Javascript ([cc782ad](https://github.com/mjancarik/merkur/commit/cc782adcdf8e19ddf79cba9e134dec6f96ec6893))

### BREAKING CHANGES

- 🧨 Remove supports for old browsers(IE11, etc.). Minimal supported browsers
  use ES9.

# [0.31.0](https://github.com/mjancarik/merkur/compare/v0.30.1...v0.31.0) (2023-04-25)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.30.0](https://github.com/mjancarik/merkur/compare/v0.29.5...v0.30.0) (2022-11-28)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.29.3](https://github.com/mjancarik/merkur/compare/v0.29.2...v0.29.3) (2022-09-13)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.29.1](https://github.com/mjancarik/merkur/compare/v0.29.0...v0.29.1) (2022-09-06)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.29.0](https://github.com/mjancarik/merkur/compare/v0.28.2...v0.29.0) (2022-08-08)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.28.0](https://github.com/mjancarik/merkur/compare/v0.27.6...v0.28.0) (2022-04-20)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.27.1](https://github.com/mjancarik/merkur/compare/v0.27.0...v0.27.1) (2021-09-30)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.27.0](https://github.com/mjancarik/merkur/compare/v0.26.1...v0.27.0) (2021-09-29)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.26.0](https://github.com/mjancarik/merkur/compare/v0.25.0...v0.26.0) (2021-08-27)

### Bug Fixes

- link ([069615b](https://github.com/mjancarik/merkur/commit/069615b206f7360582bda7efe5a0a006ba5ce780))

### Features

- 🎸 add cjs file for es9 ([#98](https://github.com/mjancarik/merkur/issues/98)) ([6b0a4a1](https://github.com/mjancarik/merkur/commit/6b0a4a130b632de014839ab1cef2730db7f32335))

# [0.25.0](https://github.com/mjancarik/merkur/compare/v0.24.4...v0.25.0) (2021-08-20)

### chore

- 🤖 update dependencies ([#89](https://github.com/mjancarik/merkur/issues/89)) ([ab1e063](https://github.com/mjancarik/merkur/commit/ab1e063fd72441f8e81d576d0a2a57122129f08d))

### Features

- 🎸 set es11 as default for esm modules ([#94](https://github.com/mjancarik/merkur/issues/94)) ([e841b89](https://github.com/mjancarik/merkur/commit/e841b89a601e139b803e585749991b992af8e70f))

### BREAKING CHANGES

- 🧨 Change default for ems modules from es9 to es11.

- feat: 🎸 add polyfill for es9 version

- feat: 🎸 add isES11Supported method to testScript

- docs: ✏️ add es11 build to widget endpoint

- chore: 🤖 remove useless dependencies

- fix: 🐛 add webpack alias for plugin-css-scrambler to es5,es9

- feat: 🎸 add lib/index.es9.mjs to exports

- feat: 🎸 add missing modules for umd config

- chore: 🤖 update dependencies
- 🧨 Jest@27 https://github.com/facebook/jest/blob/master/CHANGELOG.md#2700

## [0.24.1](https://github.com/mjancarik/merkur/compare/v0.24.0...v0.24.1) (2021-06-06)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.24.0](https://github.com/mjancarik/merkur/compare/v0.23.12...v0.24.0) (2021-05-28)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.23.12](https://github.com/mjancarik/merkur/compare/v0.23.11...v0.23.12) (2021-04-16)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.23.9](https://github.com/mjancarik/merkur/compare/v0.23.8...v0.23.9) (2021-04-12)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.23.6](https://github.com/mjancarik/merkur/compare/v0.23.5...v0.23.6) (2021-02-17)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.23.5](https://github.com/mjancarik/merkur/compare/v0.23.4...v0.23.5) (2021-02-17)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.23.4](https://github.com/mjancarik/merkur/compare/v0.23.3...v0.23.4) (2021-02-04)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.23.2](https://github.com/mjancarik/merkur/compare/v0.23.1...v0.23.2) (2021-02-01)

**Note:** Version bump only for package @merkur/tool-storybook

## [0.23.1](https://github.com/mjancarik/merkur/compare/v0.23.0...v0.23.1) (2021-02-01)

**Note:** Version bump only for package @merkur/tool-storybook

# [0.23.0](https://github.com/mjancarik/merkur/compare/v0.22.0...v0.23.0) (2021-02-01)

- Storybook (#60) ([640e3e8](https://github.com/mjancarik/merkur/commit/640e3e8490317497eea9c28f669b406608cbfcdc)), closes [#60](https://github.com/mjancarik/merkur/issues/60)

### BREAKING CHANGES

- 🧨 Update peer dependencies, dev dependencies and dependencies.

- feat: 🎸 added storybook integration module

- test: 💍 fix es-check test

- docs: ✏️ added documentation for merkur integrtion to Storybook

- ci: 🎡 added check for all supported templates

- fix: 🐛 removed using named exports from JSON modules

- fix: 🐛 typo in filename

- Update docs/docs/tool-storybook.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

- Update docs/docs/tool-storybook.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

- Update docs/docs/tool-storybook.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

- Update packages/tool-storybook/README.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

- Update docs/docs/tool-storybook.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

- Update docs/docs/tool-storybook.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

- Update packages/tool-storybook/src/**tests**/indexSpec.js

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>
