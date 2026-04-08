# Change Log

## 1.0.2

### Patch Changes

- f87e120: Re-release: fix of release jobs

## 1.0.1

### Patch Changes

- 60c8489: Re-release after infrastructure fix

## 1.0.0

### Patch Changes

- 97aec26: Migrate monorepo build and publish tooling from Lerna to NX and Changesets.
  - **What** The internal monorepo toolchain for versioning and publishing all `@merkur/*` packages has been replaced. Lerna is removed; NX is used for task orchestration and Changesets is used for versioning and changelog generation.
  - **Why** Lerna's versioning model was difficult to maintain for independent package releases and offered limited caching. NX provides better incremental build support and task pipelines, while Changesets gives contributors a structured, PR-friendly workflow for describing and grouping version bumps.
  - **How** No changes required for consumers of `@merkur/*` packages — the published API is unaffected. Internal contributors should use `npm run changeset` to record changes and `npm run release` to publish new versions. See the CONTRIBUTING.md for detailed instructions on the new workflow.

- b71808a: Fix the `widget` parameter type in `bindWidgetToFunctions` from `Widget` to `WidgetPartial`.
  - **What** The `widget` parameter of `bindWidgetToFunctions()` in `@merkur/core` is now typed as `WidgetPartial` instead of `Widget`.
  - **Why** `bindWidgetToFunctions` is called during plugin `setup()` and `create()` methods, which receive a `WidgetPartial` — the fully resolved `Widget` type is the result of the binding operation, not the input. The previous typing caused TypeScript errors when calling the function from those contexts.
  - **How** Nothing.

- 7c52a11: Use `@esmj/schema` for input validation in `createWidgetLoader` and `createPreviewConfig`
  - **What** Replaced manual `if`/`throw` validation guards in `createWidgetLoader` and `createPreviewConfig` (in `packages/tool-storybook/src/index.js`) with declarative `@esmj/schema` schemas. Added `@esmj/schema` as a runtime dependency in `packages/tool-storybook/package.json`. Updated affected test expectations in `indexSpec.js` to match the new schema-generated error messages. Exported the existing `isRegistered` function from `packages/core/src/merkur.js` via `packages/core/src/index.js` so `tool-storybook` can use it directly instead of duplicating the registration-key logic.
  - **Why** Manual type checks were verbose and inconsistent. Using `@esmj/schema` centralises validation in named schemas (`createWidgetLoaderOptionsSchema`, `createPreviewConfigOptionsSchema`, `widgetPropertiesSchema`), making the rules easier to read, extend, and keep consistent across both functions.
  - **How** Nothing.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.47.2](https://github.com/mjancarik/merkur/compare/v0.47.1...v0.47.2) (2026-03-19)

**Note:** Version bump only for package @merkur/core

## [0.47.1](https://github.com/mjancarik/merkur/compare/v0.47.0...v0.47.1) (2026-03-19)

**Note:** Version bump only for package @merkur/core

# [0.47.0](https://github.com/mjancarik/merkur/compare/v0.46.2...v0.47.0) (2026-03-19)

**Note:** Version bump only for package @merkur/core

# [0.46.0](https://github.com/mjancarik/merkur/compare/v0.45.2...v0.46.0) (2026-03-04)

### Bug Fixes

- 🐛 Better type Widget lifecycle changes ([029faf3](https://github.com/mjancarik/merkur/commit/029faf3bf63721e6e00c0bdba41c6ab9b66514dd))
- 🐛 Invent a way to turn any WidgetDefinition keys required ([d20e95b](https://github.com/mjancarik/merkur/commit/d20e95ba5ebdc0fb7f9177151d059e1fb316853d))
- 🐛 Update Widget/WidgetPartial types ([a71f6ff](https://github.com/mjancarik/merkur/commit/a71f6ff345ede7d58a498e95ef17f812dbf893a6))

### BREAKING CHANGES

- 🧨 `Widget` and `WidgetDefinition` interfaces drastically changed; new
  `WidgetPartial` interface added and used in loading methods. Move
  interface extensions to either `WidgetDescription` or `WidgetPartial`,
  and then you can remove method overloads for bound widget functions (the
  typing now does it automatically). See types.d.ts for specifics.

## [0.45.1](https://github.com/mjancarik/merkur/compare/v0.45.0...v0.45.1) (2026-03-03)

**Note:** Version bump only for package @merkur/core

# [0.45.0](https://github.com/mjancarik/merkur/compare/v0.44.1...v0.45.0) (2026-02-01)

**Note:** Version bump only for package @merkur/core

# [0.44.0](https://github.com/mjancarik/merkur/compare/v0.43.1...v0.44.0) (2025-12-17)

**Note:** Version bump only for package @merkur/core

# [0.43.0](https://github.com/mjancarik/merkur/compare/v0.42.0...v0.43.0) (2025-12-05)

**Note:** Version bump only for package @merkur/core

# [0.42.0](https://github.com/mjancarik/merkur/compare/v0.41.1...v0.42.0) (2025-11-28)

**Note:** Version bump only for package @merkur/core

# [0.41.0](https://github.com/mjancarik/merkur/compare/v0.40.0...v0.41.0) (2025-11-04)

**Note:** Version bump only for package @merkur/core

# [0.40.0](https://github.com/mjancarik/merkur/compare/v0.39.0...v0.40.0) (2025-10-27)

**Note:** Version bump only for package @merkur/core

# [0.39.0](https://github.com/mjancarik/merkur/compare/v0.38.2...v0.39.0) (2025-10-27)

### Features

- 🎸 Added support for loading 'module' assets ([6e985ce](https://github.com/mjancarik/merkur/commit/6e985ce86f148be12ee96ba41cc2115600ebc207))

# [0.38.0](https://github.com/mjancarik/merkur/compare/v0.37.12...v0.38.0) (2025-07-12)

**Note:** Version bump only for package @merkur/core

# [0.37.0](https://github.com/mjancarik/merkur/compare/v0.36.5...v0.37.0) (2024-11-12)

### Bug Fixes

- 🐛 setDefaultValueForUndefined clone defined value ([1387e99](https://github.com/mjancarik/merkur/commit/1387e99e4952bfc7f396a793b27a9bfa65eb189c))

# [0.36.0](https://github.com/mjancarik/merkur/compare/v0.35.13...v0.36.0) (2024-05-21)

**Note:** Version bump only for package @merkur/core

# [0.35.0](https://github.com/mjancarik/merkur/compare/v0.34.6...v0.35.0) (2024-04-09)

### Bug Fixes

- 🐛 Fixed optional slotFactories prop in createWidgetFactory ([a818e18](https://github.com/mjancarik/merkur/commit/a818e189ab4843ec7853dc2ab4716551d415cb79))
- 🐛 Type fxies ([848c468](https://github.com/mjancarik/merkur/commit/848c46806b3260a10f9f31385793184a75c6c772))

### Features

- 🎸 Added svelte package ([f55463f](https://github.com/mjancarik/merkur/commit/f55463fdc7e8cec173e358d056f7d35c78d65d5c))

# [0.34.0](https://github.com/mjancarik/merkur/compare/v0.33.0...v0.34.0) (2023-10-11)

**Note:** Version bump only for package @merkur/core

# [0.33.0](https://github.com/mjancarik/merkur/compare/v0.32.1...v0.33.0) (2023-08-10)

### Features

- 🎸 Add assignMissingKeys function ([2960ff2](https://github.com/mjancarik/merkur/commit/2960ff2453338f1255f39bd9ddfe44c56077cd4b))

# [0.32.0](https://github.com/mjancarik/merkur/compare/v0.31.1...v0.32.0) (2023-07-14)

### Features

- 🎸 remove ES5 Javascript ([cc782ad](https://github.com/mjancarik/merkur/commit/cc782adcdf8e19ddf79cba9e134dec6f96ec6893))

### BREAKING CHANGES

- 🧨 Remove supports for old browsers(IE11, etc.). Minimal supported browsers
  use ES9.

# [0.31.0](https://github.com/mjancarik/merkur/compare/v0.30.1...v0.31.0) (2023-04-25)

**Note:** Version bump only for package @merkur/core

# [0.30.0](https://github.com/mjancarik/merkur/compare/v0.29.5...v0.30.0) (2022-11-28)

**Note:** Version bump only for package @merkur/core

## [0.29.3](https://github.com/mjancarik/merkur/compare/v0.29.2...v0.29.3) (2022-09-13)

**Note:** Version bump only for package @merkur/core

## [0.29.1](https://github.com/mjancarik/merkur/compare/v0.29.0...v0.29.1) (2022-09-06)

**Note:** Version bump only for package @merkur/core

# [0.29.0](https://github.com/mjancarik/merkur/compare/v0.28.2...v0.29.0) (2022-08-08)

**Note:** Version bump only for package @merkur/core

# [0.28.0](https://github.com/mjancarik/merkur/compare/v0.27.6...v0.28.0) (2022-04-20)

**Note:** Version bump only for package @merkur/core

## [0.27.1](https://github.com/mjancarik/merkur/compare/v0.27.0...v0.27.1) (2021-09-30)

**Note:** Version bump only for package @merkur/core

# [0.27.0](https://github.com/mjancarik/merkur/compare/v0.26.1...v0.27.0) (2021-09-29)

**Note:** Version bump only for package @merkur/core

# [0.26.0](https://github.com/mjancarik/merkur/compare/v0.25.0...v0.26.0) (2021-08-27)

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

**Note:** Version bump only for package @merkur/core

# [0.24.0](https://github.com/mjancarik/merkur/compare/v0.23.12...v0.24.0) (2021-05-28)

**Note:** Version bump only for package @merkur/core

## [0.23.12](https://github.com/mjancarik/merkur/compare/v0.23.11...v0.23.12) (2021-04-16)

**Note:** Version bump only for package @merkur/core

## [0.23.9](https://github.com/mjancarik/merkur/compare/v0.23.8...v0.23.9) (2021-04-12)

**Note:** Version bump only for package @merkur/core

## [0.23.6](https://github.com/mjancarik/merkur/compare/v0.23.5...v0.23.6) (2021-02-17)

**Note:** Version bump only for package @merkur/core

## [0.23.4](https://github.com/mjancarik/merkur/compare/v0.23.3...v0.23.4) (2021-02-04)

**Note:** Version bump only for package @merkur/core

## [0.23.2](https://github.com/mjancarik/merkur/compare/v0.23.1...v0.23.2) (2021-02-01)

**Note:** Version bump only for package @merkur/core

## [0.23.1](https://github.com/mjancarik/merkur/compare/v0.23.0...v0.23.1) (2021-02-01)

**Note:** Version bump only for package @merkur/core

# [0.23.0](https://github.com/mjancarik/merkur/compare/v0.22.0...v0.23.0) (2021-02-01)

### Bug Fixes

- 🐛 error with not declared variables ([67d07a6](https://github.com/mjancarik/merkur/commit/67d07a6971fd3d21bee34ddafd22252299411006))

### chore

- 🤖 added index.js file for fixing CRA ([#51](https://github.com/mjancarik/merkur/issues/51)) ([bcfb131](https://github.com/mjancarik/merkur/commit/bcfb131abe8a5c02504dd573f8c198ed3dbca648))
- 🤖 update dependencies ([#59](https://github.com/mjancarik/merkur/issues/59)) ([06ba5d5](https://github.com/mjancarik/merkur/commit/06ba5d578b8b1058d71b3d56d1da11a737b495a9))

### BREAKING CHANGES

- 🧨 Update peer dependencies, dev dependencies and dependencies.
- 🧨 The values of main and module properties were change without file
  extension in package.json.

# [0.22.0](https://github.com/mjancarik/merkur/compare/v0.21.3...v0.22.0) (2020-10-15)

**Note:** Version bump only for package @merkur/core

# [0.21.0](https://github.com/mjancarik/merkur/compare/v0.20.0...v0.21.0) (2020-09-30)

**Note:** Version bump only for package @merkur/core

# [0.20.0](https://github.com/mjancarik/merkur/compare/v0.19.3...v0.20.0) (2020-09-11)

### Bug Fixes

- 🐛 added browser field to package.json ([85cf4a1](https://github.com/mjancarik/merkur/commit/85cf4a1e73b883125d4482c36892aa5de410653f))

### BREAKING CHANGES

- 🧨 new browser field in pakckage.json

# [0.19.0](https://github.com/mjancarik/merkur/compare/v0.18.1...v0.19.0) (2020-09-07)

### Features

- 🎸 add file extension in package.json ([7b8f8b3](https://github.com/mjancarik/merkur/commit/7b8f8b31b4d45f6f6bc59b5ad81c25ab067de091))

### BREAKING CHANGES

- 🧨 remove useless files from lib folder and defined exports in package.json

# [0.18.0](https://github.com/mjancarik/merkur/compare/v0.17.0...v0.18.0) (2020-09-03)

### Bug Fixes

- 🐛 umd version of module ([e90b6b1](https://github.com/mjancarik/merkur/commit/e90b6b16c512607db423ae2e2724cd6da6afb118))
- 🐛 update dependencies ([5ca444a](https://github.com/mjancarik/merkur/commit/5ca444a70dd9a2a7bb94a592241ccea63c788430))

### BREAKING CHANGES

- 🧨 yes

# [0.17.0](https://github.com/mjancarik/merkur/compare/v0.16.2...v0.17.0) (2020-08-27)

**Note:** Version bump only for package @merkur/core

## [0.16.1](https://github.com/mjancarik/merkur/compare/v0.16.0...v0.16.1) (2020-08-14)

**Note:** Version bump only for package @merkur/core

# [0.16.0](https://github.com/mjancarik/merkur/compare/v0.15.2...v0.16.0) (2020-08-14)

### Features

- 🎸 added hook method to module base ([66d122c](https://github.com/mjancarik/merkur/commit/66d122c0a1679a4a77a86407b59ddd225d8fc682))
- 🎸 using hookMethod and isFunction in plugin ([b1b08e5](https://github.com/mjancarik/merkur/commit/b1b08e56b087bb30ea3dbda7e70e64729c83287e))

# [0.15.0](https://github.com/mjancarik/merkur/compare/v0.14.1...v0.15.0) (2020-08-06)

### chore

- 🤖 update dependencies ([9d5f3eb](https://github.com/mjancarik/merkur/commit/9d5f3eb1b0b1e6845fa2ae5e2714cefd53e6782e))

### Features

- 🎸 allow tree shaking for merkur ([731371e](https://github.com/mjancarik/merkur/commit/731371ec09bfd1a7765caa55c9cc52124d7a42ed))

### BREAKING CHANGES

- 🧨 yes

# [0.14.0](https://github.com/mjancarik/merkur/compare/v0.13.1...v0.14.0) (2020-07-28)

**Note:** Version bump only for package @merkur/core

# [0.13.0](https://github.com/mjancarik/merkur/compare/v0.12.0...v0.13.0) (2020-07-09)

**Note:** Version bump only for package @merkur/core

# [0.12.0](https://github.com/mjancarik/merkur/compare/v0.11.3...v0.12.0) (2020-06-28)

### Features

- 🎸 added es5 version of lib files for older browsers ([5fbf920](https://github.com/mjancarik/merkur/commit/5fbf9205e60b735d2711f3f98c06ee7a734d26ba))

# [0.11.0](https://github.com/mjancarik/merkur/compare/v0.10.0...v0.11.0) (2020-06-19)

### Features

- 🎸 allow define setup, create methods in widgetProperties ([5a1b918](https://github.com/mjancarik/merkur/commit/5a1b9181ea59e2592dedb45004bc7e58fa2f091e))

### BREAKING CHANGES

- 🧨 yes

# [0.10.0](https://github.com/mjancarik/merkur/compare/v0.9.4...v0.10.0) (2020-06-17)

**Note:** Version bump only for package @merkur/core

## [0.9.4](https://github.com/mjancarik/merkur/compare/v0.9.3...v0.9.4) (2020-06-08)

**Note:** Version bump only for package @merkur/core

## [0.9.2](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.2) (2020-06-04)

### Features

- 🎸 export bindWidgetToFunctions from module for plugins ([1b5425f](https://github.com/mjancarik/merkur/commit/1b5425f8c04edc75c50d10b735ee8269e9239023))

## [0.9.1](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.1) (2020-06-04)

### Features

- 🎸 export bindWidgetToFunctions from module for plugins ([1b5425f](https://github.com/mjancarik/merkur/commit/1b5425f8c04edc75c50d10b735ee8269e9239023))

# [0.9.0](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.0) (2020-06-04)

### Features

- 🎸 export bindWidgetToFunctions from module for plugins ([1b5425f](https://github.com/mjancarik/merkur/commit/1b5425f8c04edc75c50d10b735ee8269e9239023))

# [0.8.0](https://github.com/mjancarik/merkur/compare/v0.7.1...v0.8.0) (2020-05-15)

**Note:** Version bump only for package @merkur/core

## [0.7.1](https://github.com/mjancarik/merkur/compare/v0.7.0...v0.7.1) (2020-05-14)

**Note:** Version bump only for package @merkur/core

# [0.7.0](https://github.com/mjancarik/merkur/compare/v0.6.2...v0.7.0) (2020-05-14)

### Features

- 🎸 assign properties name,version,container to merkur ([699ccb2](https://github.com/mjancarik/merkur/commit/699ccb2c94e02d7e997dd793288e764ed2d3bf4c))

### BREAKING CHANGES

- 🧨 yes

# [0.6.0](https://github.com/mjancarik/merkur/compare/v0.5.7...v0.6.0) (2020-05-04)

### Bug Fixes

- 🐛 setDefaultValueForUndefined not modified original object ([3b14160](https://github.com/mjancarik/merkur/commit/3b141601bc3ba00f0aaeb79e312f45797ca6497d))

### BREAKING CHANGES

- 🧨 yes

# [0.5.0](https://github.com/mjancarik/merkur/compare/v0.4.2...v0.5.0) (2020-04-25)

**Note:** Version bump only for package @merkur/core

# [0.4.0](https://github.com/mjancarik/merkur/compare/v0.3.1...v0.4.0) (2020-04-20)

### chore

- 🤖 rename createCustomWidget to createMerkurWidget ([d076f70](https://github.com/mjancarik/merkur/commit/d076f70a8b6abb5010fc7c852e84a31d404109cd))

### Code Refactoring

- 💡 move plugins to alone modules ([8c56557](https://github.com/mjancarik/merkur/commit/8c56557ae92eaa713d083419d3ac293c9d483969))

### Features

- 🎸 change arguments for createMerkur method ([e255c7f](https://github.com/mjancarik/merkur/commit/e255c7f3e5be8adb2869686bc98c4c26209aa5be))
- 🎸 setProps method call load life cycle method ([b349c5d](https://github.com/mjancarik/merkur/commit/b349c5d7eba10e255c7d65fb3dfbde828d053cda))

### BREAKING CHANGES

- 🧨 yes
- 🧨 yes
- 🧨 yes
- 🧨 yes

# [0.3.0](https://github.com/mjancarik/merkur/compare/v0.2.2...v0.3.0) (2020-04-03)

### Features

- 🎸 simplify merkur interface ([e681679](https://github.com/mjancarik/merkur/commit/e6816796e552c6014ca5177879eaa8c28d8cb8ca))

# [0.2.0](https://github.com/mjancarik/merkur/compare/v0.1.2...v0.2.0) (2020-03-29)

### Features

- 🎸 added eslint and jest configuration ([b7123fa](https://github.com/mjancarik/merkur/commit/b7123fa1b7d5d94a97b3574318769c4937f89c39))

## [0.1.1](https://github.com/mjancarik/merkur/compare/v0.1.0...v0.1.1) (2020-03-26)

**Note:** Version bump only for package @merkur/core

# 0.1.0 (2020-03-26)

### Features

- 🎸 renamed package and added create-widget ([bde4759](https://github.com/mjancarik/merkur/commit/bde47593457f1ef0b12ce8ce45a4f2347f47aa04))

<a name="0.0.1"></a>

## 0.0.1 (2020-03-03)

### Features

- init commit ([a4247fd](https://github.com/mjancarik/merkur/commit/a4247fd))
