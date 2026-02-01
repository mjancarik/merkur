# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.45.0](https://github.com/mjancarik/merkur/compare/v0.44.1...v0.45.0) (2026-02-01)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.44.0](https://github.com/mjancarik/merkur/compare/v0.43.1...v0.44.0) (2025-12-17)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.43.0](https://github.com/mjancarik/merkur/compare/v0.42.0...v0.43.0) (2025-12-05)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.42.0](https://github.com/mjancarik/merkur/compare/v0.41.1...v0.42.0) (2025-11-28)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.41.0](https://github.com/mjancarik/merkur/compare/v0.40.0...v0.41.0) (2025-11-04)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.40.0](https://github.com/mjancarik/merkur/compare/v0.39.0...v0.40.0) (2025-10-27)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.39.0](https://github.com/mjancarik/merkur/compare/v0.38.2...v0.39.0) (2025-10-27)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.38.0](https://github.com/mjancarik/merkur/compare/v0.37.12...v0.38.0) (2025-07-12)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.37.0](https://github.com/mjancarik/merkur/compare/v0.36.5...v0.37.0) (2024-11-12)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.36.0](https://github.com/mjancarik/merkur/compare/v0.35.13...v0.36.0) (2024-05-21)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.35.0](https://github.com/mjancarik/merkur/compare/v0.34.6...v0.35.0) (2024-04-09)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.34.0](https://github.com/mjancarik/merkur/compare/v0.33.0...v0.34.0) (2023-10-11)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.33.0](https://github.com/mjancarik/merkur/compare/v0.32.1...v0.33.0) (2023-08-10)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.32.0](https://github.com/mjancarik/merkur/compare/v0.31.1...v0.32.0) (2023-07-14)

### Features

- 🎸 remove ES5 Javascript ([cc782ad](https://github.com/mjancarik/merkur/commit/cc782adcdf8e19ddf79cba9e134dec6f96ec6893))

### BREAKING CHANGES

- 🧨 Remove supports for old browsers(IE11, etc.). Minimal supported browsers
  use ES9.

# [0.31.0](https://github.com/mjancarik/merkur/compare/v0.30.1...v0.31.0) (2023-04-25)

### Features

- 🎸 Add support of OpenSSL 3 in Node.js >= 17 ([a8f3385](https://github.com/mjancarik/merkur/commit/a8f33853e0eaea8482611f99bed6f02228048d05))

# [0.30.0](https://github.com/mjancarik/merkur/compare/v0.29.5...v0.30.0) (2022-11-28)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.29.0](https://github.com/mjancarik/merkur/compare/v0.28.2...v0.29.0) (2022-08-08)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.28.0](https://github.com/mjancarik/merkur/compare/v0.27.6...v0.28.0) (2022-04-20)

### Code Refactoring

- 💡 move liveReloadServer to merkur/tools ([f81e0e8](https://github.com/mjancarik/merkur/commit/f81e0e89eff4a72985c89d23079be6a9344a3b2e))

### BREAKING CHANGES

- 🧨 The liveReloadServer.cjs file is moved to @merkur/tools. The
  @merkur/tool-webpack re-export createLiveReloadServer for keeping
  backward compatability.

## [0.27.4](https://github.com/mjancarik/merkur/compare/v0.27.3...v0.27.4) (2021-10-06)

### Features

- 🎸 Allow CssMinimizerPlugin options override ([#114](https://github.com/mjancarik/merkur/issues/114)) ([c02dd0b](https://github.com/mjancarik/merkur/commit/c02dd0bf06a44bbf45880c9b1932a33e287f35ce))

## [0.27.3](https://github.com/mjancarik/merkur/compare/v0.27.2...v0.27.3) (2021-10-04)

### Bug Fixes

- 🐛 Windows babel es5 build issue with exclude pattern ([#113](https://github.com/mjancarik/merkur/issues/113)) ([26387ea](https://github.com/mjancarik/merkur/commit/26387ea01d840d5d6f55d4748d34c87c7f3f5f10))

## [0.27.1](https://github.com/mjancarik/merkur/compare/v0.27.0...v0.27.1) (2021-09-30)

**Note:** Version bump only for package @merkur/tool-webpack

# [0.27.0](https://github.com/mjancarik/merkur/compare/v0.26.1...v0.27.0) (2021-09-29)

### Features

- 🎸 Added default support for asset image resources ([bd94f8d](https://github.com/mjancarik/merkur/commit/bd94f8d1a536335363a0f3381f85e57448078ac3))
- 🎸 Automatically generate free port for livereload server ([#101](https://github.com/mjancarik/merkur/issues/101)) ([a083a1b](https://github.com/mjancarik/merkur/commit/a083a1b31edc818a2d94e000a78cbb03cc8dc022))

### BREAKING CHANGES

- 🧨 createLiveReloadServer() function must be promise chained in
  webpack.config.js before returning any config array.

# [0.26.0](https://github.com/mjancarik/merkur/compare/v0.25.0...v0.26.0) (2021-08-27)

### Features

- 🎸 create new module tool-webpack ([#99](https://github.com/mjancarik/merkur/issues/99)) ([111fda7](https://github.com/mjancarik/merkur/commit/111fda7a6854528472b8539ec12fffe7a1d7efae))

### BREAKING CHANGES

- 🧨 Extract webpack to alone module merkur/tool-webpack from merkur/tools
  module

- ci: 🎡 add lock file for new module

- feat: 🎸 add new module merkur/tool-webpack to dev dependencies
