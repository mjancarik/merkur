# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.34.0](https://github.com/mjancarik/merkur/compare/v0.33.0...v0.34.0) (2023-10-11)

**Note:** Version bump only for package @merkur/tools





# [0.33.0](https://github.com/mjancarik/merkur/compare/v0.32.1...v0.33.0) (2023-08-10)

**Note:** Version bump only for package @merkur/tools





# [0.32.0](https://github.com/mjancarik/merkur/compare/v0.31.1...v0.32.0) (2023-07-14)

**Note:** Version bump only for package @merkur/tools

# [0.31.0](https://github.com/mjancarik/merkur/compare/v0.30.1...v0.31.0) (2023-04-25)

**Note:** Version bump only for package @merkur/tools

# [0.30.0](https://github.com/mjancarik/merkur/compare/v0.29.5...v0.30.0) (2022-11-28)

**Note:** Version bump only for package @merkur/tools

# [0.29.0](https://github.com/mjancarik/merkur/compare/v0.28.2...v0.29.0) (2022-08-08)

**Note:** Version bump only for package @merkur/tools

# [0.28.0](https://github.com/mjancarik/merkur/compare/v0.27.6...v0.28.0) (2022-04-20)

### Code Refactoring

- 💡 move liveReloadServer to merkur/tools ([f81e0e8](https://github.com/mjancarik/merkur/commit/f81e0e89eff4a72985c89d23079be6a9344a3b2e))

### BREAKING CHANGES

- 🧨 The liveReloadServer.cjs file is moved to @merkur/tools. The
  @merkur/tool-webpack re-export createLiveReloadServer for keeping
  backward compatability.

## [0.27.1](https://github.com/mjancarik/merkur/compare/v0.27.0...v0.27.1) (2021-09-30)

### Bug Fixes

- 🐛 Removed unused @merkur/tools pkg dependencies ([#109](https://github.com/mjancarik/merkur/issues/109)) ([c1a28b0](https://github.com/mjancarik/merkur/commit/c1a28b00f1b9510eeab897ab0232f59a0f6a3c0f))

# [0.27.0](https://github.com/mjancarik/merkur/compare/v0.26.1...v0.27.0) (2021-09-29)

### Features

- 🎸 Added eslint plugin import and eslint react-hooks plugi ([#108](https://github.com/mjancarik/merkur/issues/108)) ([db8ca75](https://github.com/mjancarik/merkur/commit/db8ca75e701f1e9d57dc55c3a3a5e1fb7cfc4787))
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

**Note:** Version bump only for package @merkur/tools

# [0.24.0](https://github.com/mjancarik/merkur/compare/v0.23.12...v0.24.0) (2021-05-28)

**Note:** Version bump only for package @merkur/tools

## [0.23.12](https://github.com/mjancarik/merkur/compare/v0.23.11...v0.23.12) (2021-04-16)

**Note:** Version bump only for package @merkur/tools

## [0.23.11](https://github.com/mjancarik/merkur/compare/v0.23.10...v0.23.11) (2021-04-14)

### Bug Fixes

- 🐛 prevent errors for fully specified files ([#73](https://github.com/mjancarik/merkur/issues/73)) ([4d890f4](https://github.com/mjancarik/merkur/commit/4d890f4645174c3c84276ac1a285ad0b28804a44))

## [0.23.10](https://github.com/mjancarik/merkur/compare/v0.23.9...v0.23.10) (2021-04-12)

### Features

- 🎸 add brotli and gzip compression to webpack build ([#70](https://github.com/mjancarik/merkur/issues/70)) ([3a454fd](https://github.com/mjancarik/merkur/commit/3a454fd45b11e43d84d87ba8fa47cca1441de00b))

## [0.23.9](https://github.com/mjancarik/merkur/compare/v0.23.8...v0.23.9) (2021-04-12)

### Bug Fixes

- 🐛 es5 webpack build ([#68](https://github.com/mjancarik/merkur/issues/68)) ([68dd594](https://github.com/mjancarik/merkur/commit/68dd59494130fa6288411a749bed7862f6950b50))

## [0.23.8](https://github.com/mjancarik/merkur/compare/v0.23.7...v0.23.8) (2021-03-21)

### Bug Fixes

- 🐛 restarting nodemone after build ([52166d5](https://github.com/mjancarik/merkur/commit/52166d527638e39f4327014f66d10df0950c5616))

### Features

- 🎸 added svelte view ([#65](https://github.com/mjancarik/merkur/issues/65)) ([b3f9e24](https://github.com/mjancarik/merkur/commit/b3f9e24a683477d53153121750a00627f5b176b7))

## [0.23.6](https://github.com/mjancarik/merkur/compare/v0.23.5...v0.23.6) (2021-02-17)

**Note:** Version bump only for package @merkur/tools

## [0.23.4](https://github.com/mjancarik/merkur/compare/v0.23.3...v0.23.4) (2021-02-04)

**Note:** Version bump only for package @merkur/tools

## [0.23.3](https://github.com/mjancarik/merkur/compare/v0.23.2...v0.23.3) (2021-02-04)

### Bug Fixes

- 🐛 default value 'auto' in publicPath for manifest.json ([08f5fef](https://github.com/mjancarik/merkur/commit/08f5fefdf80cacac745fea8fc25622f562c05a12))
- 🐛 npm run dev command start dev:server ([45fa9ac](https://github.com/mjancarik/merkur/commit/45fa9acb46b0efb660b2838b8b4957c1dc5e419b))

## [0.23.2](https://github.com/mjancarik/merkur/compare/v0.23.1...v0.23.2) (2021-02-01)

**Note:** Version bump only for package @merkur/tools

## [0.23.1](https://github.com/mjancarik/merkur/compare/v0.23.0...v0.23.1) (2021-02-01)

**Note:** Version bump only for package @merkur/tools

# [0.23.0](https://github.com/mjancarik/merkur/compare/v0.22.0...v0.23.0) (2021-02-01)

### Bug Fixes

- 🐛 typo ([e9dca16](https://github.com/mjancarik/merkur/commit/e9dca16797593891f4f11e876bd6382b8f98d6d2))

### chore

- 🤖 added index.js file for fixing CRA ([#51](https://github.com/mjancarik/merkur/issues/51)) ([bcfb131](https://github.com/mjancarik/merkur/commit/bcfb131abe8a5c02504dd573f8c198ed3dbca648))
- 🤖 update dependencies ([#59](https://github.com/mjancarik/merkur/issues/59)) ([06ba5d5](https://github.com/mjancarik/merkur/commit/06ba5d578b8b1058d71b3d56d1da11a737b495a9))

### Code Refactoring

- 💡 replace webpack-shell-plugin ([ea89a9f](https://github.com/mjancarik/merkur/commit/ea89a9f7b253af4a8a723bfd0dca17b1828e0d39))

### BREAKING CHANGES

- 🧨 Update peer dependencies, dev dependencies and dependencies.
- 🧨 We replace webpack-shell-plugin for webpack-shell-plugin-next which is
  maintained and support webpack5.
- 🧨 The values of main and module properties were change without file
  extension in package.json.

# [0.22.0](https://github.com/mjancarik/merkur/compare/v0.21.3...v0.22.0) (2020-10-15)

**Note:** Version bump only for package @merkur/tools

# [0.21.0](https://github.com/mjancarik/merkur/compare/v0.20.0...v0.21.0) (2020-09-30)

### Bug Fixes

- 🐛 Fixed babel-loader config to re-enable tree-shaking ([e125818](https://github.com/mjancarik/merkur/commit/e12581838273571be2c88d03c5061ed33857b0a2))

# [0.20.0](https://github.com/mjancarik/merkur/compare/v0.19.3...v0.20.0) (2020-09-11)

**Note:** Version bump only for package @merkur/tools

## [0.19.2](https://github.com/mjancarik/merkur/compare/v0.19.1...v0.19.2) (2020-09-09)

**Note:** Version bump only for package @merkur/tools

## [0.19.1](https://github.com/mjancarik/merkur/compare/v0.19.0...v0.19.1) (2020-09-07)

### Bug Fixes

- 🐛 set webpack to handle .mjs files for both envs ([131b06d](https://github.com/mjancarik/merkur/commit/131b06de9ea766ce4ea8c39405232ed103dc7eb6))

# [0.19.0](https://github.com/mjancarik/merkur/compare/v0.18.1...v0.19.0) (2020-09-07)

### Features

- 🎸 bundle analyzer show tree shakeable version for dev env ([29c5bcd](https://github.com/mjancarik/merkur/commit/29c5bcdb5c8b3dc815169c14a116bc6c591ff81e))

## [0.18.1](https://github.com/mjancarik/merkur/compare/v0.18.0...v0.18.1) (2020-09-04)

**Note:** Version bump only for package @merkur/tools

# [0.18.0](https://github.com/mjancarik/merkur/compare/v0.17.0...v0.18.0) (2020-09-03)

### Bug Fixes

- 🐛 update dependencies ([5ca444a](https://github.com/mjancarik/merkur/commit/5ca444a70dd9a2a7bb94a592241ccea63c788430))

### Features

- 🎸 added polyfill file ([b2b2a99](https://github.com/mjancarik/merkur/commit/b2b2a99380ea741d8a36fa95a94ded3414fc8a9f))
- 🎸 pipe allow async function ([97f6aa5](https://github.com/mjancarik/merkur/commit/97f6aa53159cb988ab6dd6e02d422ecdeb6c0064))

### BREAKING CHANGES

- 🧨 yes
- 🧨 yes

# [0.17.0](https://github.com/mjancarik/merkur/compare/v0.16.2...v0.17.0) (2020-08-27)

**Note:** Version bump only for package @merkur/tools

## [0.16.1](https://github.com/mjancarik/merkur/compare/v0.16.0...v0.16.1) (2020-08-14)

**Note:** Version bump only for package @merkur/tools

# [0.16.0](https://github.com/mjancarik/merkur/compare/v0.15.2...v0.16.0) (2020-08-14)

**Note:** Version bump only for package @merkur/tools

## [0.15.1](https://github.com/mjancarik/merkur/compare/v0.15.0...v0.15.1) (2020-08-06)

### Bug Fixes

- 🐛 resolving @merkur/\* modules to es5 version ([802a952](https://github.com/mjancarik/merkur/commit/802a952995499f18d803414b26c0ac4356d7d881))

# [0.15.0](https://github.com/mjancarik/merkur/compare/v0.14.1...v0.15.0) (2020-08-06)

### chore

- 🤖 update dependencies ([9d5f3eb](https://github.com/mjancarik/merkur/commit/9d5f3eb1b0b1e6845fa2ae5e2714cefd53e6782e))

### Features

- 🎸 Ability to override node_modules dir in ES5 transformer ([#14](https://github.com/mjancarik/merkur/issues/14)) ([253a443](https://github.com/mjancarik/merkur/commit/253a44346e324d98ed4408775ddbb9e3e769d9c7))
- 🎸 added jest-watch-typeahead plugin ([f0de4e7](https://github.com/mjancarik/merkur/commit/f0de4e726e41239676cce956e7374a7ca64dcd64))

### BREAKING CHANGES

- 🧨 yes

## [0.14.1](https://github.com/mjancarik/merkur/compare/v0.14.0...v0.14.1) (2020-07-28)

### Bug Fixes

- 🐛 added missing clean-webpack-plugin dependency ([1cb754d](https://github.com/mjancarik/merkur/commit/1cb754d70ada2d98eb813d4d8d7c6012bfd1f135))

# [0.14.0](https://github.com/mjancarik/merkur/compare/v0.13.1...v0.14.0) (2020-07-28)

### Features

- 🎸 new assets structure for es5 and es9 scripts ([54d7dce](https://github.com/mjancarik/merkur/commit/54d7dceb9d01630dbcfb7a18615360c0ceae3ab9))

### BREAKING CHANGES

- 🧨 yes

# [0.13.0](https://github.com/mjancarik/merkur/compare/v0.12.0...v0.13.0) (2020-07-09)

**Note:** Version bump only for package @merkur/tools

# [0.12.0](https://github.com/mjancarik/merkur/compare/v0.11.3...v0.12.0) (2020-06-28)

### Features

- 🎸 added es5 version of lib files for older browsers ([5fbf920](https://github.com/mjancarik/merkur/commit/5fbf9205e60b735d2711f3f98c06ee7a734d26ba))

# [0.11.0](https://github.com/mjancarik/merkur/compare/v0.10.0...v0.11.0) (2020-06-19)

**Note:** Version bump only for package @merkur/tools

# [0.10.0](https://github.com/mjancarik/merkur/compare/v0.9.4...v0.10.0) (2020-06-17)

**Note:** Version bump only for package @merkur/tools

## [0.9.4](https://github.com/mjancarik/merkur/compare/v0.9.3...v0.9.4) (2020-06-08)

**Note:** Version bump only for package @merkur/tools

## [0.9.2](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.2) (2020-06-04)

**Note:** Version bump only for package @merkur/tools

## [0.9.1](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.1) (2020-06-04)

**Note:** Version bump only for package @merkur/tools

# [0.9.0](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.0) (2020-06-04)

**Note:** Version bump only for package @merkur/tools

# [0.8.0](https://github.com/mjancarik/merkur/compare/v0.7.1...v0.8.0) (2020-05-15)

**Note:** Version bump only for package @merkur/tools

## [0.7.1](https://github.com/mjancarik/merkur/compare/v0.7.0...v0.7.1) (2020-05-14)

**Note:** Version bump only for package @merkur/tools

# [0.7.0](https://github.com/mjancarik/merkur/compare/v0.6.2...v0.7.0) (2020-05-14)

**Note:** Version bump only for package @merkur/tools

# [0.6.0](https://github.com/mjancarik/merkur/compare/v0.5.7...v0.6.0) (2020-05-04)

### Features

- 🎸 liveroload without modifing app.js file ([5c51173](https://github.com/mjancarik/merkur/commit/5c511739efa3edab3981f0fdee17303a311df7db))

### BREAKING CHANGES

- 🧨 yes

## [0.5.7](https://github.com/mjancarik/merkur/compare/v0.5.6...v0.5.7) (2020-05-04)

### Bug Fixes

- 🐛 running integration tests ([50662d6](https://github.com/mjancarik/merkur/commit/50662d649fa1c301ecbdb29ba596cc04662ccbca))

## [0.5.4](https://github.com/mjancarik/merkur/compare/v0.5.3...v0.5.4) (2020-05-01)

**Note:** Version bump only for package @merkur/tools

## [0.5.3](https://github.com/mjancarik/merkur/compare/v0.5.2...v0.5.3) (2020-05-01)

### Features

- 🎸 added livereloading for dev ([fde5d8c](https://github.com/mjancarik/merkur/commit/fde5d8c2cae2145a1d0af4efd5177c88b16d4f1d))

## [0.5.2](https://github.com/mjancarik/merkur/compare/v0.5.1...v0.5.2) (2020-04-25)

**Note:** Version bump only for package @merkur/tools

## [0.5.1](https://github.com/mjancarik/merkur/compare/v0.5.0...v0.5.1) (2020-04-25)

**Note:** Version bump only for package @merkur/tools

# [0.5.0](https://github.com/mjancarik/merkur/compare/v0.4.2...v0.5.0) (2020-04-25)

### Features

- 🎸 added new @mekur/tools module ([e8ba8ba](https://github.com/mjancarik/merkur/commit/e8ba8baec41366c56456b958cb57afec1bafeb0e))
- 🎸 change folders structure ([22425e0](https://github.com/mjancarik/merkur/commit/22425e0b4e61984d5d303186299ade4bba1cf5fb))

### BREAKING CHANGES

- 🧨 yes
