# Change Log

## 1.0.3

### Patch Changes

- c49d82e: Re-release after process fixes

## 1.0.2

### Patch Changes

- f87e120: Re-release: fix of release jobs

## 1.0.1

### Patch Changes

- 60c8489: Re-release after infrastructure fix

## 1.0.0

### Major Changes

- 54606aa: Improve TypeScript type definitions in `plugin-component`, `plugin-event-emitter`, and `plugin-http-client`.
  - **What** `setState` and `setProps` in `plugin-component` now accept updater functions and return `Promise<void>`; event callbacks in `plugin-event-emitter` now include the `widget` argument; `plugin-http-client` adds proper `HttpRequest`, `HttpTransformer`, and `HttpResult` interfaces and switches from the removed `HttpClientWidget` class to module augmentation.
  - **Why** The previous types were inaccurate or incomplete, causing TypeScript errors when passing updater functions to `setState`/`setProps`, missing the `widget` parameter in event callbacks, and lacking proper interfaces for HTTP client operations.
  - **How** Nothing.

### Patch Changes

- 97aec26: Migrate monorepo build and publish tooling from Lerna to NX and Changesets.
  - **What** The internal monorepo toolchain for versioning and publishing all `@merkur/*` packages has been replaced. Lerna is removed; NX is used for task orchestration and Changesets is used for versioning and changelog generation.
  - **Why** Lerna's versioning model was difficult to maintain for independent package releases and offered limited caching. NX provides better incremental build support and task pipelines, while Changesets gives contributors a structured, PR-friendly workflow for describing and grouping version bumps.
  - **How** No changes required for consumers of `@merkur/*` packages — the published API is unaffected. Internal contributors should use `npm run changeset` to record changes and `npm run release` to publish new versions. See the CONTRIBUTING.md for detailed instructions on the new workflow.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.47.2](https://github.com/mjancarik/merkur/compare/v0.47.1...v0.47.2) (2026-03-19)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.47.1](https://github.com/mjancarik/merkur/compare/v0.47.0...v0.47.1) (2026-03-19)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.47.0](https://github.com/mjancarik/merkur/compare/v0.46.2...v0.47.0) (2026-03-19)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.46.0](https://github.com/mjancarik/merkur/compare/v0.45.2...v0.46.0) (2026-03-04)

### Bug Fixes

- 🐛 Better type Widget lifecycle changes ([029faf3](https://github.com/mjancarik/merkur/commit/029faf3bf63721e6e00c0bdba41c6ab9b66514dd))
- 🐛 Update Widget/WidgetPartial types ([a71f6ff](https://github.com/mjancarik/merkur/commit/a71f6ff345ede7d58a498e95ef17f812dbf893a6))

### BREAKING CHANGES

- 🧨 `Widget` and `WidgetDefinition` interfaces drastically changed; new
  `WidgetPartial` interface added and used in loading methods. Move
  interface extensions to either `WidgetDescription` or `WidgetPartial`,
  and then you can remove method overloads for bound widget functions (the
  typing now does it automatically). See types.d.ts for specifics.

## [0.45.1](https://github.com/mjancarik/merkur/compare/v0.45.0...v0.45.1) (2026-03-03)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.45.0](https://github.com/mjancarik/merkur/compare/v0.44.1...v0.45.0) (2026-02-01)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.44.0](https://github.com/mjancarik/merkur/compare/v0.43.1...v0.44.0) (2025-12-17)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.43.0](https://github.com/mjancarik/merkur/compare/v0.42.0...v0.43.0) (2025-12-05)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.42.0](https://github.com/mjancarik/merkur/compare/v0.41.1...v0.42.0) (2025-11-28)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.41.0](https://github.com/mjancarik/merkur/compare/v0.40.0...v0.41.0) (2025-11-04)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.40.0](https://github.com/mjancarik/merkur/compare/v0.39.0...v0.40.0) (2025-10-27)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.39.0](https://github.com/mjancarik/merkur/compare/v0.38.2...v0.39.0) (2025-10-27)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.38.0](https://github.com/mjancarik/merkur/compare/v0.37.12...v0.38.0) (2025-07-12)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.37.0](https://github.com/mjancarik/merkur/compare/v0.36.5...v0.37.0) (2024-11-12)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.36.0](https://github.com/mjancarik/merkur/compare/v0.35.13...v0.36.0) (2024-05-21)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.35.0](https://github.com/mjancarik/merkur/compare/v0.34.6...v0.35.0) (2024-04-09)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.34.0](https://github.com/mjancarik/merkur/compare/v0.33.0...v0.34.0) (2023-10-11)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.33.0](https://github.com/mjancarik/merkur/compare/v0.32.1...v0.33.0) (2023-08-10)

### Bug Fixes

- 🐛 Fix assigning to widget object ([6a89efa](https://github.com/mjancarik/merkur/commit/6a89efadaf18a7640c8db732fc8f27b849c6ff1c))

# [0.32.0](https://github.com/mjancarik/merkur/compare/v0.31.1...v0.32.0) (2023-07-14)

### Features

- 🎸 remove ES5 Javascript ([cc782ad](https://github.com/mjancarik/merkur/commit/cc782adcdf8e19ddf79cba9e134dec6f96ec6893))

### BREAKING CHANGES

- 🧨 Remove supports for old browsers(IE11, etc.). Minimal supported browsers
  use ES9.

# [0.31.0](https://github.com/mjancarik/merkur/compare/v0.30.1...v0.31.0) (2023-04-25)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.30.0](https://github.com/mjancarik/merkur/compare/v0.29.5...v0.30.0) (2022-11-28)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.29.3](https://github.com/mjancarik/merkur/compare/v0.29.2...v0.29.3) (2022-09-13)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.29.1](https://github.com/mjancarik/merkur/compare/v0.29.0...v0.29.1) (2022-09-06)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.29.0](https://github.com/mjancarik/merkur/compare/v0.28.2...v0.29.0) (2022-08-08)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.28.0](https://github.com/mjancarik/merkur/compare/v0.27.6...v0.28.0) (2022-04-20)

### Bug Fixes

- 🐛 peer dependencies warning and error ([228537c](https://github.com/mjancarik/merkur/commit/228537c7927a5a7ae987bb7551d35437cb4f8025))

## [0.27.1](https://github.com/mjancarik/merkur/compare/v0.27.0...v0.27.1) (2021-09-30)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.27.0](https://github.com/mjancarik/merkur/compare/v0.26.1...v0.27.0) (2021-09-29)

**Note:** Version bump only for package @merkur/plugin-event-emitter

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

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.24.0](https://github.com/mjancarik/merkur/compare/v0.23.12...v0.24.0) (2021-05-28)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.23.12](https://github.com/mjancarik/merkur/compare/v0.23.11...v0.23.12) (2021-04-16)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.23.9](https://github.com/mjancarik/merkur/compare/v0.23.8...v0.23.9) (2021-04-12)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.23.6](https://github.com/mjancarik/merkur/compare/v0.23.5...v0.23.6) (2021-02-17)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.23.5](https://github.com/mjancarik/merkur/compare/v0.23.4...v0.23.5) (2021-02-17)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.23.4](https://github.com/mjancarik/merkur/compare/v0.23.3...v0.23.4) (2021-02-04)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.23.2](https://github.com/mjancarik/merkur/compare/v0.23.1...v0.23.2) (2021-02-01)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.23.1](https://github.com/mjancarik/merkur/compare/v0.23.0...v0.23.1) (2021-02-01)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.23.0](https://github.com/mjancarik/merkur/compare/v0.22.0...v0.23.0) (2021-02-01)

- Storybook (#60) ([640e3e8](https://github.com/mjancarik/merkur/commit/640e3e8490317497eea9c28f669b406608cbfcdc)), closes [#60](https://github.com/mjancarik/merkur/issues/60)

### chore

- 🤖 added index.js file for fixing CRA ([#51](https://github.com/mjancarik/merkur/issues/51)) ([bcfb131](https://github.com/mjancarik/merkur/commit/bcfb131abe8a5c02504dd573f8c198ed3dbca648))
- 🤖 update dependencies ([#59](https://github.com/mjancarik/merkur/issues/59)) ([06ba5d5](https://github.com/mjancarik/merkur/commit/06ba5d578b8b1058d71b3d56d1da11a737b495a9))

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

- 🧨 Update peer dependencies, dev dependencies and dependencies.
- 🧨 The values of main and module properties were change without file
  extension in package.json.

# [0.22.0](https://github.com/mjancarik/merkur/compare/v0.21.3...v0.22.0) (2020-10-15)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.21.0](https://github.com/mjancarik/merkur/compare/v0.20.0...v0.21.0) (2020-09-30)

**Note:** Version bump only for package @merkur/plugin-event-emitter

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

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.16.1](https://github.com/mjancarik/merkur/compare/v0.16.0...v0.16.1) (2020-08-14)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.16.0](https://github.com/mjancarik/merkur/compare/v0.15.2...v0.16.0) (2020-08-14)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.15.0](https://github.com/mjancarik/merkur/compare/v0.14.1...v0.15.0) (2020-08-06)

### chore

- 🤖 update dependencies ([9d5f3eb](https://github.com/mjancarik/merkur/commit/9d5f3eb1b0b1e6845fa2ae5e2714cefd53e6782e))

### Features

- 🎸 allow tree shaking for merkur ([731371e](https://github.com/mjancarik/merkur/commit/731371ec09bfd1a7765caa55c9cc52124d7a42ed))

### BREAKING CHANGES

- 🧨 yes

# [0.14.0](https://github.com/mjancarik/merkur/compare/v0.13.1...v0.14.0) (2020-07-28)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.13.0](https://github.com/mjancarik/merkur/compare/v0.12.0...v0.13.0) (2020-07-09)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.12.0](https://github.com/mjancarik/merkur/compare/v0.11.3...v0.12.0) (2020-06-28)

### Features

- 🎸 added es5 version of lib files for older browsers ([5fbf920](https://github.com/mjancarik/merkur/commit/5fbf9205e60b735d2711f3f98c06ee7a734d26ba))

# [0.11.0](https://github.com/mjancarik/merkur/compare/v0.10.0...v0.11.0) (2020-06-19)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.10.0](https://github.com/mjancarik/merkur/compare/v0.9.4...v0.10.0) (2020-06-17)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.9.4](https://github.com/mjancarik/merkur/compare/v0.9.3...v0.9.4) (2020-06-08)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.9.2](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.2) (2020-06-04)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.9.1](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.1) (2020-06-04)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.9.0](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.0) (2020-06-04)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.8.0](https://github.com/mjancarik/merkur/compare/v0.7.1...v0.8.0) (2020-05-15)

**Note:** Version bump only for package @merkur/plugin-event-emitter

## [0.7.1](https://github.com/mjancarik/merkur/compare/v0.7.0...v0.7.1) (2020-05-14)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.7.0](https://github.com/mjancarik/merkur/compare/v0.6.2...v0.7.0) (2020-05-14)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.6.0](https://github.com/mjancarik/merkur/compare/v0.5.7...v0.6.0) (2020-05-04)

### Bug Fixes

- 🐛 setDefaultValueForUndefined not modified original object ([3b14160](https://github.com/mjancarik/merkur/commit/3b141601bc3ba00f0aaeb79e312f45797ca6497d))

### BREAKING CHANGES

- 🧨 yes

# [0.5.0](https://github.com/mjancarik/merkur/compare/v0.4.2...v0.5.0) (2020-04-25)

**Note:** Version bump only for package @merkur/plugin-event-emitter

# [0.4.0](https://github.com/mjancarik/merkur/compare/v0.3.1...v0.4.0) (2020-04-20)

### Code Refactoring

- 💡 move plugins to alone modules ([8c56557](https://github.com/mjancarik/merkur/commit/8c56557ae92eaa713d083419d3ac293c9d483969))

### BREAKING CHANGES

- 🧨 yes
