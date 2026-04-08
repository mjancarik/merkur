# Change Log

## 1.0.1

### Patch Changes

- 60c8489: Re-release after infrastructure fix

## 1.0.0

### Patch Changes

- 97aec26: Migrate monorepo build and publish tooling from Lerna to NX and Changesets.
  - **What** The internal monorepo toolchain for versioning and publishing all `@merkur/*` packages has been replaced. Lerna is removed; NX is used for task orchestration and Changesets is used for versioning and changelog generation.
  - **Why** Lerna's versioning model was difficult to maintain for independent package releases and offered limited caching. NX provides better incremental build support and task pipelines, while Changesets gives contributors a structured, PR-friendly workflow for describing and grouping version bumps.
  - **How** No changes required for consumers of `@merkur/*` packages — the published API is unaffected. Internal contributors should use `npm run changeset` to record changes and `npm run release` to publish new versions. See the CONTRIBUTING.md for detailed instructions on the new workflow.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.47.2](https://github.com/mjancarik/merkur/compare/v0.47.1...v0.47.2) (2026-03-19)

**Note:** Version bump only for package @merkur/plugin-router

## [0.47.1](https://github.com/mjancarik/merkur/compare/v0.47.0...v0.47.1) (2026-03-19)

**Note:** Version bump only for package @merkur/plugin-router

# [0.47.0](https://github.com/mjancarik/merkur/compare/v0.46.2...v0.47.0) (2026-03-19)

### Features

- 🎸 Race condition between load and setState ([03b62ff](https://github.com/mjancarik/merkur/commit/03b62ff3da78db35d7102a052511f44b3620ff46))

## [0.46.2](https://github.com/mjancarik/merkur/compare/v0.46.1...v0.46.2) (2026-03-05)

### Bug Fixes

- 🐛 Update plugin API method types for Widget ([820112f](https://github.com/mjancarik/merkur/commit/820112f661121349df47b70ce8e46b569c263f40))

# [0.46.0](https://github.com/mjancarik/merkur/compare/v0.45.2...v0.46.0) (2026-03-04)

### Bug Fixes

- 🐛 Better type Widget lifecycle changes ([029faf3](https://github.com/mjancarik/merkur/commit/029faf3bf63721e6e00c0bdba41c6ab9b66514dd))
- 🐛 Update Widget/WidgetPartial types ([a71f6ff](https://github.com/mjancarik/merkur/commit/a71f6ff345ede7d58a498e95ef17f812dbf893a6))

### Features

- 🎸 Add basic types to plugin-router ([8a29ad3](https://github.com/mjancarik/merkur/commit/8a29ad3541471788ec87a8afde7f1a6067b510da))

### BREAKING CHANGES

- 🧨 `Widget` and `WidgetDefinition` interfaces drastically changed; new
  `WidgetPartial` interface added and used in loading methods. Move
  interface extensions to either `WidgetDescription` or `WidgetPartial`,
  and then you can remove method overloads for bound widget functions (the
  typing now does it automatically). See types.d.ts for specifics.

## [0.45.1](https://github.com/mjancarik/merkur/compare/v0.45.0...v0.45.1) (2026-03-03)

**Note:** Version bump only for package @merkur/plugin-router

# [0.45.0](https://github.com/mjancarik/merkur/compare/v0.44.1...v0.45.0) (2026-02-01)

**Note:** Version bump only for package @merkur/plugin-router

# [0.44.0](https://github.com/mjancarik/merkur/compare/v0.43.1...v0.44.0) (2025-12-17)

**Note:** Version bump only for package @merkur/plugin-router

# [0.43.0](https://github.com/mjancarik/merkur/compare/v0.42.0...v0.43.0) (2025-12-05)

**Note:** Version bump only for package @merkur/plugin-router

# [0.42.0](https://github.com/mjancarik/merkur/compare/v0.41.1...v0.42.0) (2025-11-28)

**Note:** Version bump only for package @merkur/plugin-router

# [0.41.0](https://github.com/mjancarik/merkur/compare/v0.40.0...v0.41.0) (2025-11-04)

**Note:** Version bump only for package @merkur/plugin-router

# [0.40.0](https://github.com/mjancarik/merkur/compare/v0.39.0...v0.40.0) (2025-10-27)

**Note:** Version bump only for package @merkur/plugin-router

# [0.39.0](https://github.com/mjancarik/merkur/compare/v0.38.2...v0.39.0) (2025-10-27)

**Note:** Version bump only for package @merkur/plugin-router

# [0.38.0](https://github.com/mjancarik/merkur/compare/v0.37.12...v0.38.0) (2025-07-12)

**Note:** Version bump only for package @merkur/plugin-router

## [0.37.9](https://github.com/mjancarik/merkur/compare/v0.37.8...v0.37.9) (2025-04-25)

**Note:** Version bump only for package @merkur/plugin-router

# [0.37.0](https://github.com/mjancarik/merkur/compare/v0.36.5...v0.37.0) (2024-11-12)

### Features

- 🎸 add new getCurrentContext method ([bcc94c1](https://github.com/mjancarik/merkur/commit/bcc94c15874e9a31d6f06c955ad24d4af89702f2))

## [0.36.5](https://github.com/mjancarik/merkur/compare/v0.36.4...v0.36.5) (2024-07-30)

### Features

- 🎸 add possibility to generate absolute url address ([b2c01dd](https://github.com/mjancarik/merkur/commit/b2c01dd49dbc19ae62d66df9a37631bc0bcedd78))

# [0.36.0](https://github.com/mjancarik/merkur/compare/v0.35.13...v0.36.0) (2024-05-21)

**Note:** Version bump only for package @merkur/plugin-router

# [0.35.0](https://github.com/mjancarik/merkur/compare/v0.34.6...v0.35.0) (2024-04-09)

**Note:** Version bump only for package @merkur/plugin-router

## [0.34.2](https://github.com/mjancarik/merkur/compare/v0.34.1...v0.34.2) (2023-10-18)

**Note:** Version bump only for package @merkur/plugin-router

# [0.34.0](https://github.com/mjancarik/merkur/compare/v0.33.0...v0.34.0) (2023-10-11)

**Note:** Version bump only for package @merkur/plugin-router

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

**Note:** Version bump only for package @merkur/plugin-router

# [0.30.0](https://github.com/mjancarik/merkur/compare/v0.29.5...v0.30.0) (2022-11-28)

**Note:** Version bump only for package @merkur/plugin-router

## [0.29.3](https://github.com/mjancarik/merkur/compare/v0.29.2...v0.29.3) (2022-09-13)

**Note:** Version bump only for package @merkur/plugin-router

## [0.29.1](https://github.com/mjancarik/merkur/compare/v0.29.0...v0.29.1) (2022-09-06)

**Note:** Version bump only for package @merkur/plugin-router

# [0.29.0](https://github.com/mjancarik/merkur/compare/v0.28.2...v0.29.0) (2022-08-08)

**Note:** Version bump only for package @merkur/plugin-router

# [0.28.0](https://github.com/mjancarik/merkur/compare/v0.27.6...v0.28.0) (2022-04-20)

### Bug Fixes

- 🐛 peer dependencies warning and error ([228537c](https://github.com/mjancarik/merkur/commit/228537c7927a5a7ae987bb7551d35437cb4f8025))

## [0.27.1](https://github.com/mjancarik/merkur/compare/v0.27.0...v0.27.1) (2021-09-30)

**Note:** Version bump only for package @merkur/plugin-router

# [0.27.0](https://github.com/mjancarik/merkur/compare/v0.26.1...v0.27.0) (2021-09-29)

### Features

- 🎸 Added direct entry points for RouterEvents export ([#107](https://github.com/mjancarik/merkur/issues/107)) ([9d10d46](https://github.com/mjancarik/merkur/commit/9d10d463c40d00a62dc25cb182aa3dc874be05df))

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

**Note:** Version bump only for package @merkur/plugin-router

# [0.24.0](https://github.com/mjancarik/merkur/compare/v0.23.12...v0.24.0) (2021-05-28)

**Note:** Version bump only for package @merkur/plugin-router

## [0.23.12](https://github.com/mjancarik/merkur/compare/v0.23.11...v0.23.12) (2021-04-16)

**Note:** Version bump only for package @merkur/plugin-router

## [0.23.9](https://github.com/mjancarik/merkur/compare/v0.23.8...v0.23.9) (2021-04-12)

**Note:** Version bump only for package @merkur/plugin-router

## [0.23.6](https://github.com/mjancarik/merkur/compare/v0.23.5...v0.23.6) (2021-02-17)

**Note:** Version bump only for package @merkur/plugin-router

## [0.23.5](https://github.com/mjancarik/merkur/compare/v0.23.4...v0.23.5) (2021-02-17)

**Note:** Version bump only for package @merkur/plugin-router

## [0.23.4](https://github.com/mjancarik/merkur/compare/v0.23.3...v0.23.4) (2021-02-04)

**Note:** Version bump only for package @merkur/plugin-router

## [0.23.2](https://github.com/mjancarik/merkur/compare/v0.23.1...v0.23.2) (2021-02-01)

**Note:** Version bump only for package @merkur/plugin-router

## [0.23.1](https://github.com/mjancarik/merkur/compare/v0.23.0...v0.23.1) (2021-02-01)

**Note:** Version bump only for package @merkur/plugin-router

# [0.23.0](https://github.com/mjancarik/merkur/compare/v0.22.0...v0.23.0) (2021-02-01)

- Storybook (#60) ([640e3e8](https://github.com/mjancarik/merkur/commit/640e3e8490317497eea9c28f669b406608cbfcdc)), closes [#60](https://github.com/mjancarik/merkur/issues/60)

### chore

- 🤖 added index.js file for fixing CRA ([#51](https://github.com/mjancarik/merkur/issues/51)) ([bcfb131](https://github.com/mjancarik/merkur/commit/bcfb131abe8a5c02504dd573f8c198ed3dbca648))
- 🤖 update dependencies ([#59](https://github.com/mjancarik/merkur/issues/59)) ([06ba5d5](https://github.com/mjancarik/merkur/commit/06ba5d578b8b1058d71b3d56d1da11a737b495a9))

### Features

- 🎸 widget load method is called for every route ([#52](https://github.com/mjancarik/merkur/issues/52)) ([b628e83](https://github.com/mjancarik/merkur/commit/b628e83c6d5f967286f4bc27707d6f11606921be)), closes [#21](https://github.com/mjancarik/merkur/issues/21)

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
- 🧨 Widget load method is called for every route.
- 🧨 The values of main and module properties were change without file
  extension in package.json.

# [0.22.0](https://github.com/mjancarik/merkur/compare/v0.21.3...v0.22.0) (2020-10-15)

**Note:** Version bump only for package @merkur/plugin-router

## [0.21.1](https://github.com/mjancarik/merkur/compare/v0.21.0...v0.21.1) (2020-09-30)

### Features

- Option to open links in newTab in router.redirect ([#41](https://github.com/mjancarik/merkur/issues/41)) ([2719173](https://github.com/mjancarik/merkur/commit/2719173671823c1ebbd667f6eb3f0f999b24e81f))

# [0.21.0](https://github.com/mjancarik/merkur/compare/v0.20.0...v0.21.0) (2020-09-30)

**Note:** Version bump only for package @merkur/plugin-router

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

- 🐛 keep controller after changing props with same pathname ([27266c7](https://github.com/mjancarik/merkur/commit/27266c7ddbdb311175cc04048e9b29e0a6bb2249))
- 🐛 run bootstrap life cycle method before resolving route ([c3172c2](https://github.com/mjancarik/merkur/commit/c3172c21ad68eabc3846d32c0e3c1747a3d06824))
- 🐛 update dependencies ([5ca444a](https://github.com/mjancarik/merkur/commit/5ca444a70dd9a2a7bb94a592241ccea63c788430))

# [0.17.0](https://github.com/mjancarik/merkur/compare/v0.16.2...v0.17.0) (2020-08-27)

**Note:** Version bump only for package @merkur/plugin-router

## [0.16.1](https://github.com/mjancarik/merkur/compare/v0.16.0...v0.16.1) (2020-08-14)

**Note:** Version bump only for package @merkur/plugin-router

# [0.16.0](https://github.com/mjancarik/merkur/compare/v0.15.2...v0.16.0) (2020-08-14)

### Bug Fixes

- 🐛 typo ([cfee48f](https://github.com/mjancarik/merkur/commit/cfee48f38bcd3d8437cbf823f9887c62376baad1))

### Features

- 🎸 using hookMethod and isFunction in plugin ([b1b08e5](https://github.com/mjancarik/merkur/commit/b1b08e56b087bb30ea3dbda7e70e64729c83287e))

# [0.15.0](https://github.com/mjancarik/merkur/compare/v0.14.1...v0.15.0) (2020-08-06)

### chore

- 🤖 update dependencies ([9d5f3eb](https://github.com/mjancarik/merkur/commit/9d5f3eb1b0b1e6845fa2ae5e2714cefd53e6782e))

### Features

- 🎸 allow tree shaking for merkur ([731371e](https://github.com/mjancarik/merkur/commit/731371ec09bfd1a7765caa55c9cc52124d7a42ed))

### BREAKING CHANGES

- 🧨 yes

# [0.14.0](https://github.com/mjancarik/merkur/compare/v0.13.1...v0.14.0) (2020-07-28)

**Note:** Version bump only for package @merkur/plugin-router

# [0.13.0](https://github.com/mjancarik/merkur/compare/v0.12.0...v0.13.0) (2020-07-09)

**Note:** Version bump only for package @merkur/plugin-router

# [0.12.0](https://github.com/mjancarik/merkur/compare/v0.11.3...v0.12.0) (2020-06-28)

### Features

- 🎸 added es5 version of lib files for older browsers ([5fbf920](https://github.com/mjancarik/merkur/commit/5fbf9205e60b735d2711f3f98c06ee7a734d26ba))

## [0.11.3](https://github.com/mjancarik/merkur/compare/v0.11.2...v0.11.3) (2020-06-23)

### Bug Fixes

- 🐛 Fixed duplicate call to init and unintentional destroy ([b3bf3d9](https://github.com/mjancarik/merkur/commit/b3bf3d93ecb570ca14d69dbe32f8071d445e441a))
- 🐛 Fixed query transformer, route is resolved before mount ([c5d5109](https://github.com/mjancarik/merkur/commit/c5d510947db9c42e4dee602028ec77eabf287d91))

## [0.11.1](https://github.com/mjancarik/merkur/compare/v0.11.0...v0.11.1) (2020-06-21)

**Note:** Version bump only for package @merkur/plugin-router

# [0.11.0](https://github.com/mjancarik/merkur/compare/v0.10.0...v0.11.0) (2020-06-19)

**Note:** Version bump only for package @merkur/plugin-router

# [0.10.0](https://github.com/mjancarik/merkur/compare/v0.9.4...v0.10.0) (2020-06-17)

### Features

- 🎸 Added getCurrentRoute method to plugin-router ([73007b3](https://github.com/mjancarik/merkur/commit/73007b32ac678581a45abfef6641d1a40ad00936))

## [0.9.4](https://github.com/mjancarik/merkur/compare/v0.9.3...v0.9.4) (2020-06-08)

**Note:** Version bump only for package @merkur/plugin-router

## [0.9.2](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.2) (2020-06-04)

### Features

- 🎸 added plugin-router ([323d36f](https://github.com/mjancarik/merkur/commit/323d36ff1aefa8c6e86bc3e70e9ea29e5828fcb1))

## [0.9.1](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.1) (2020-06-04)

### Features

- 🎸 added plugin-router ([323d36f](https://github.com/mjancarik/merkur/commit/323d36ff1aefa8c6e86bc3e70e9ea29e5828fcb1))

# [0.9.0](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.0) (2020-06-04)

### Features

- 🎸 added plugin-router ([323d36f](https://github.com/mjancarik/merkur/commit/323d36ff1aefa8c6e86bc3e70e9ea29e5828fcb1))

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
