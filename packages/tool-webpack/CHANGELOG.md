# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.27.4](https://github.com/mjancarik/merkur/compare/v0.27.3...v0.27.4) (2021-10-06)


### Features

* 🎸 Allow CssMinimizerPlugin options override ([#114](https://github.com/mjancarik/merkur/issues/114)) ([c02dd0b](https://github.com/mjancarik/merkur/commit/c02dd0bf06a44bbf45880c9b1932a33e287f35ce))





## [0.27.3](https://github.com/mjancarik/merkur/compare/v0.27.2...v0.27.3) (2021-10-04)


### Bug Fixes

* 🐛 Windows babel es5 build issue with exclude pattern ([#113](https://github.com/mjancarik/merkur/issues/113)) ([26387ea](https://github.com/mjancarik/merkur/commit/26387ea01d840d5d6f55d4748d34c87c7f3f5f10))





## [0.27.1](https://github.com/mjancarik/merkur/compare/v0.27.0...v0.27.1) (2021-09-30)

**Note:** Version bump only for package @merkur/tool-webpack





# [0.27.0](https://github.com/mjancarik/merkur/compare/v0.26.1...v0.27.0) (2021-09-29)


### Features

* 🎸 Added default support for asset image resources ([bd94f8d](https://github.com/mjancarik/merkur/commit/bd94f8d1a536335363a0f3381f85e57448078ac3))
* 🎸 Automatically generate free port for livereload server ([#101](https://github.com/mjancarik/merkur/issues/101)) ([a083a1b](https://github.com/mjancarik/merkur/commit/a083a1b31edc818a2d94e000a78cbb03cc8dc022))


### BREAKING CHANGES

* 🧨 createLiveReloadServer() function must be promise chained in
webpack.config.js before returning any config array.





# [0.26.0](https://github.com/mjancarik/merkur/compare/v0.25.0...v0.26.0) (2021-08-27)


### Features

* 🎸 create new module tool-webpack ([#99](https://github.com/mjancarik/merkur/issues/99)) ([111fda7](https://github.com/mjancarik/merkur/commit/111fda7a6854528472b8539ec12fffe7a1d7efae))


### BREAKING CHANGES

* 🧨 Extract webpack to alone module merkur/tool-webpack from merkur/tools
module

* ci: 🎡 add lock file for new module

* feat: 🎸 add new module merkur/tool-webpack to dev dependencies
