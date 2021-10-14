# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.27.5](https://github.com/mjancarik/merkur/compare/v0.27.4...v0.27.5) (2021-10-14)

**Note:** Version bump only for package @merkur/create-widget





## [0.27.4](https://github.com/mjancarik/merkur/compare/v0.27.3...v0.27.4) (2021-10-06)

**Note:** Version bump only for package @merkur/create-widget





## [0.27.3](https://github.com/mjancarik/merkur/compare/v0.27.2...v0.27.3) (2021-10-04)


### Bug Fixes

* 🐛 Windows babel es5 build issue with exclude pattern ([#113](https://github.com/mjancarik/merkur/issues/113)) ([26387ea](https://github.com/mjancarik/merkur/commit/26387ea01d840d5d6f55d4748d34c87c7f3f5f10))
* build widget before running tests ([5de74c7](https://github.com/mjancarik/merkur/commit/5de74c77bb333bfc6cbf41c92502590402b7fd17))





## [0.27.2](https://github.com/mjancarik/merkur/compare/v0.27.1...v0.27.2) (2021-09-30)


### Bug Fixes

* 🐛 ES5 Polyfill definition fix ([#110](https://github.com/mjancarik/merkur/issues/110)) ([485e3f7](https://github.com/mjancarik/merkur/commit/485e3f7fe1f969b727912577d7c538a43136f860))





## [0.27.1](https://github.com/mjancarik/merkur/compare/v0.27.0...v0.27.1) (2021-09-30)

**Note:** Version bump only for package @merkur/create-widget





# [0.27.0](https://github.com/mjancarik/merkur/compare/v0.26.1...v0.27.0) (2021-09-29)


### Features

* 🎸 Added eslint plugin import and eslint react-hooks plugi ([#108](https://github.com/mjancarik/merkur/issues/108)) ([db8ca75](https://github.com/mjancarik/merkur/commit/db8ca75e701f1e9d57dc55c3a3a5e1fb7cfc4787))
* 🎸 Automatically generate free port for livereload server ([#101](https://github.com/mjancarik/merkur/issues/101)) ([a083a1b](https://github.com/mjancarik/merkur/commit/a083a1b31edc818a2d94e000a78cbb03cc8dc022))


### BREAKING CHANGES

* 🧨 createLiveReloadServer() function must be promise chained in
webpack.config.js before returning any config array.





## [0.26.1](https://github.com/mjancarik/merkur/compare/v0.26.0...v0.26.1) (2021-08-30)

**Note:** Version bump only for package @merkur/create-widget





# [0.26.0](https://github.com/mjancarik/merkur/compare/v0.25.0...v0.26.0) (2021-08-27)


### Bug Fixes

* 🐛 use es11 source for playground page ([9256133](https://github.com/mjancarik/merkur/commit/9256133cb09a81cbea580d03531d4890a398e99c))


* Slot (#96) ([ec4d528](https://github.com/mjancarik/merkur/commit/ec4d528b8bb92392bdd002c092ac38352851e2a5)), closes [#96](https://github.com/mjancarik/merkur/issues/96)


### Features

* 🎸 create new module tool-webpack ([#99](https://github.com/mjancarik/merkur/issues/99)) ([111fda7](https://github.com/mjancarik/merkur/commit/111fda7a6854528472b8539ec12fffe7a1d7efae))


### BREAKING CHANGES

* 🧨 Extract webpack to alone module merkur/tool-webpack from merkur/tools
module

* ci: 🎡 add lock file for new module

* feat: 🎸 add new module merkur/tool-webpack to dev dependencies
* 🧨 The property slots from widget structure is renamed to slot

* fix: 🐛 import paths





# [0.25.0](https://github.com/mjancarik/merkur/compare/v0.24.4...v0.25.0) (2021-08-20)


### chore

* 🤖 update dependencies ([#89](https://github.com/mjancarik/merkur/issues/89)) ([ab1e063](https://github.com/mjancarik/merkur/commit/ab1e063fd72441f8e81d576d0a2a57122129f08d))


### Features

* 🎸 set es11 as default for esm modules ([#94](https://github.com/mjancarik/merkur/issues/94)) ([e841b89](https://github.com/mjancarik/merkur/commit/e841b89a601e139b803e585749991b992af8e70f))


### BREAKING CHANGES

* 🧨 Change default for ems modules from es9 to es11.

* feat: 🎸 add polyfill for es9 version

* feat: 🎸 add isES11Supported method to testScript

* docs: ✏️ add es11 build to widget endpoint

* chore: 🤖 remove useless dependencies

* fix: 🐛 add webpack alias for plugin-css-scrambler to es5,es9

* feat: 🎸 add lib/index.es9.mjs to exports

* feat: 🎸 add missing modules for umd config

* chore: 🤖 update dependencies
* 🧨 Jest@27 https://github.com/facebook/jest/blob/master/CHANGELOG.md#2700





## [0.24.4](https://github.com/mjancarik/merkur/compare/v0.24.3...v0.24.4) (2021-06-11)

**Note:** Version bump only for package @merkur/create-widget





## [0.24.3](https://github.com/mjancarik/merkur/compare/v0.24.2...v0.24.3) (2021-06-10)

**Note:** Version bump only for package @merkur/create-widget





## [0.24.2](https://github.com/mjancarik/merkur/compare/v0.24.1...v0.24.2) (2021-06-07)

**Note:** Version bump only for package @merkur/create-widget





## [0.24.1](https://github.com/mjancarik/merkur/compare/v0.24.0...v0.24.1) (2021-06-06)

**Note:** Version bump only for package @merkur/create-widget





# [0.24.0](https://github.com/mjancarik/merkur/compare/v0.23.12...v0.24.0) (2021-05-28)


### Bug Fixes

* 🐛 Fixed svelte template ([d7356f1](https://github.com/mjancarik/merkur/commit/d7356f1e578e90c8d662a9e885504f8bc065fde4))
* 🐛 Merkur template fixes ([cd6f85d](https://github.com/mjancarik/merkur/commit/cd6f85d3d2f7be475102db597ab4816fe987b44c))


### Features

* 🎸 Added support for slots ([19d5451](https://github.com/mjancarik/merkur/commit/19d5451850b5264c3649bfb5536c62f2d4149706))





## [0.23.12](https://github.com/mjancarik/merkur/compare/v0.23.11...v0.23.12) (2021-04-16)

**Note:** Version bump only for package @merkur/create-widget





## [0.23.11](https://github.com/mjancarik/merkur/compare/v0.23.10...v0.23.11) (2021-04-14)

**Note:** Version bump only for package @merkur/create-widget





## [0.23.10](https://github.com/mjancarik/merkur/compare/v0.23.9...v0.23.10) (2021-04-12)


### Bug Fixes

* 🐛 eslint config to reflect chosen view ([#71](https://github.com/mjancarik/merkur/issues/71)) ([c1bfb4a](https://github.com/mjancarik/merkur/commit/c1bfb4a1a1589d623d7a228cf874ac801d0dcee0)), closes [#69](https://github.com/mjancarik/merkur/issues/69)


### Features

* 🎸 add brotli and gzip compression to webpack build ([#70](https://github.com/mjancarik/merkur/issues/70)) ([3a454fd](https://github.com/mjancarik/merkur/commit/3a454fd45b11e43d84d87ba8fa47cca1441de00b))





## [0.23.9](https://github.com/mjancarik/merkur/compare/v0.23.8...v0.23.9) (2021-04-12)

**Note:** Version bump only for package @merkur/create-widget





## [0.23.8](https://github.com/mjancarik/merkur/compare/v0.23.7...v0.23.8) (2021-03-21)


### Bug Fixes

* 🐛 reloading page after build ([01d4c61](https://github.com/mjancarik/merkur/commit/01d4c613053e1522312468bf411c6784add5eb28))


### Features

* 🎸 added svelte view ([#65](https://github.com/mjancarik/merkur/issues/65)) ([b3f9e24](https://github.com/mjancarik/merkur/commit/b3f9e24a683477d53153121750a00627f5b176b7))





## [0.23.7](https://github.com/mjancarik/merkur/compare/v0.23.6...v0.23.7) (2021-02-25)

**Note:** Version bump only for package @merkur/create-widget





## [0.23.6](https://github.com/mjancarik/merkur/compare/v0.23.5...v0.23.6) (2021-02-17)

**Note:** Version bump only for package @merkur/create-widget





## [0.23.5](https://github.com/mjancarik/merkur/compare/v0.23.4...v0.23.5) (2021-02-17)


### Bug Fixes

* 🐛 ignore build folder for linter ([63d2cd3](https://github.com/mjancarik/merkur/commit/63d2cd3839fb1c21a3c9e6564de888caa92c68a6))





## [0.23.4](https://github.com/mjancarik/merkur/compare/v0.23.3...v0.23.4) (2021-02-04)

**Note:** Version bump only for package @merkur/create-widget





## [0.23.3](https://github.com/mjancarik/merkur/compare/v0.23.2...v0.23.3) (2021-02-04)

**Note:** Version bump only for package @merkur/create-widget





## [0.23.2](https://github.com/mjancarik/merkur/compare/v0.23.1...v0.23.2) (2021-02-01)

**Note:** Version bump only for package @merkur/create-widget





## [0.23.1](https://github.com/mjancarik/merkur/compare/v0.23.0...v0.23.1) (2021-02-01)

**Note:** Version bump only for package @merkur/create-widget





# [0.23.0](https://github.com/mjancarik/merkur/compare/v0.22.0...v0.23.0) (2021-02-01)


* Storybook (#60) ([640e3e8](https://github.com/mjancarik/merkur/commit/640e3e8490317497eea9c28f669b406608cbfcdc)), closes [#60](https://github.com/mjancarik/merkur/issues/60)


### Bug Fixes

* 🐛 express default error handler ([327a018](https://github.com/mjancarik/merkur/commit/327a018995a19adfb7b2c4f4835d31bffc1d7cbf))


### chore

* 🤖 update dependencies ([#59](https://github.com/mjancarik/merkur/issues/59)) ([06ba5d5](https://github.com/mjancarik/merkur/commit/06ba5d578b8b1058d71b3d56d1da11a737b495a9))


### Features

* 🎸 added @merkur/plugin-error to widget template ([c778c3f](https://github.com/mjancarik/merkur/commit/c778c3fcf5ee6d4bde4248a78250a21127c0507e))


### BREAKING CHANGES

* 🧨 Update peer dependencies, dev dependencies and dependencies.

* feat: 🎸 added storybook integration module

* test: 💍 fix es-check test

* docs: ✏️ added documentation for merkur integrtion to Storybook

* ci: 🎡 added check for all supported templates

* fix: 🐛 removed using named exports from JSON modules

* fix: 🐛 typo in filename

* Update docs/docs/tool-storybook.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

* Update docs/docs/tool-storybook.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

* Update docs/docs/tool-storybook.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

* Update packages/tool-storybook/README.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

* Update docs/docs/tool-storybook.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

* Update docs/docs/tool-storybook.md

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

* Update packages/tool-storybook/src/__tests__/indexSpec.js

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>

Co-authored-by: Anna Frankova <corvidism@users.noreply.github.com>
* 🧨 Update peer dependencies, dev dependencies and dependencies.





# [0.22.0](https://github.com/mjancarik/merkur/compare/v0.21.3...v0.22.0) (2020-10-15)

**Note:** Version bump only for package @merkur/create-widget





## [0.21.3](https://github.com/mjancarik/merkur/compare/v0.21.2...v0.21.3) (2020-10-01)

**Note:** Version bump only for package @merkur/create-widget





## [0.21.2](https://github.com/mjancarik/merkur/compare/v0.21.1...v0.21.2) (2020-10-01)

**Note:** Version bump only for package @merkur/create-widget





## [0.21.1](https://github.com/mjancarik/merkur/compare/v0.21.0...v0.21.1) (2020-09-30)

**Note:** Version bump only for package @merkur/create-widget





# [0.21.0](https://github.com/mjancarik/merkur/compare/v0.20.0...v0.21.0) (2020-09-30)


### Features

* 🎸 preact use hydrate for aliving widget ([354ddb0](https://github.com/mjancarik/merkur/commit/354ddb0ede71aa9ed7500a5fa4a560f2a00424a3))





# [0.20.0](https://github.com/mjancarik/merkur/compare/v0.19.3...v0.20.0) (2020-09-11)

**Note:** Version bump only for package @merkur/create-widget





## [0.19.3](https://github.com/mjancarik/merkur/compare/v0.19.2...v0.19.3) (2020-09-10)

**Note:** Version bump only for package @merkur/create-widget





## [0.19.2](https://github.com/mjancarik/merkur/compare/v0.19.1...v0.19.2) (2020-09-09)


### Bug Fixes

* 🐛 jest integration tests for widget with server.cjs file ([4e213cd](https://github.com/mjancarik/merkur/commit/4e213cd42ad27502667deb35f025f8b79ed2533a))





## [0.19.1](https://github.com/mjancarik/merkur/compare/v0.19.0...v0.19.1) (2020-09-07)

**Note:** Version bump only for package @merkur/create-widget





# [0.19.0](https://github.com/mjancarik/merkur/compare/v0.18.1...v0.19.0) (2020-09-07)

**Note:** Version bump only for package @merkur/create-widget





## [0.18.1](https://github.com/mjancarik/merkur/compare/v0.18.0...v0.18.1) (2020-09-04)

**Note:** Version bump only for package @merkur/create-widget





# [0.18.0](https://github.com/mjancarik/merkur/compare/v0.17.0...v0.18.0) (2020-09-03)


### Bug Fixes

* 🐛 skip loading missing script asset in playground ([127f39b](https://github.com/mjancarik/merkur/commit/127f39bd0759884c601f8e8c416442c02d3d0076))
* 🐛 update dependencies ([5ca444a](https://github.com/mjancarik/merkur/commit/5ca444a70dd9a2a7bb94a592241ccea63c788430))


### Features

* 🎸 added polyfill file ([b2b2a99](https://github.com/mjancarik/merkur/commit/b2b2a99380ea741d8a36fa95a94ded3414fc8a9f))
* 🎸 pipe allow async function ([97f6aa5](https://github.com/mjancarik/merkur/commit/97f6aa53159cb988ab6dd6e02d422ecdeb6c0064))
* 🎸 removed containerSelector from API call ([e54303d](https://github.com/mjancarik/merkur/commit/e54303df23264980f888fc3bf3d50b6c3892728c))


### BREAKING CHANGES

* 🧨 yes
* 🧨 yes
* 🧨 yes





# [0.17.0](https://github.com/mjancarik/merkur/compare/v0.16.2...v0.17.0) (2020-08-27)

**Note:** Version bump only for package @merkur/create-widget





## [0.16.2](https://github.com/mjancarik/merkur/compare/v0.16.1...v0.16.2) (2020-08-25)

**Note:** Version bump only for package @merkur/create-widget





## [0.16.1](https://github.com/mjancarik/merkur/compare/v0.16.0...v0.16.1) (2020-08-14)

**Note:** Version bump only for package @merkur/create-widget





# [0.16.0](https://github.com/mjancarik/merkur/compare/v0.15.2...v0.16.0) (2020-08-14)

**Note:** Version bump only for package @merkur/create-widget





## [0.15.2](https://github.com/mjancarik/merkur/compare/v0.15.1...v0.15.2) (2020-08-07)


### Bug Fixes

* 🐛 test:all command ([3529e1d](https://github.com/mjancarik/merkur/commit/3529e1dc403723e7afc2f27053deaa74851dc9d2))





## [0.15.1](https://github.com/mjancarik/merkur/compare/v0.15.0...v0.15.1) (2020-08-06)

**Note:** Version bump only for package @merkur/create-widget





# [0.15.0](https://github.com/mjancarik/merkur/compare/v0.14.1...v0.15.0) (2020-08-06)


### Bug Fixes

* 🐛 running integration tests ([c2cfb3c](https://github.com/mjancarik/merkur/commit/c2cfb3cf5b8ae05d7ec91d04e9af29790f73a711))


### chore

* 🤖 update dependencies ([9d5f3eb](https://github.com/mjancarik/merkur/commit/9d5f3eb1b0b1e6845fa2ae5e2714cefd53e6782e))


### BREAKING CHANGES

* 🧨 yes





## [0.14.1](https://github.com/mjancarik/merkur/compare/v0.14.0...v0.14.1) (2020-07-28)


### Bug Fixes

* 🐛 fixed typo in template for playground page ([5ff6493](https://github.com/mjancarik/merkur/commit/5ff6493743f23e325db3261d565a475ed30bd110))





# [0.14.0](https://github.com/mjancarik/merkur/compare/v0.13.1...v0.14.0) (2020-07-28)


### Features

* 🎸 new assets structure for es5 and es9 scripts ([54d7dce](https://github.com/mjancarik/merkur/commit/54d7dceb9d01630dbcfb7a18615360c0ceae3ab9))


### BREAKING CHANGES

* 🧨 yes





## [0.13.1](https://github.com/mjancarik/merkur/compare/v0.13.0...v0.13.1) (2020-07-13)


### Bug Fixes

* 🐛 vanilla template ([8e1387b](https://github.com/mjancarik/merkur/commit/8e1387be4a1a0e783ba2156df7cf195b6ad91c97))





# [0.13.0](https://github.com/mjancarik/merkur/compare/v0.12.0...v0.13.0) (2020-07-09)


### Features

* 🎸 added vanilla template ([7ae2676](https://github.com/mjancarik/merkur/commit/7ae2676275bf7791680c170619c8a98d10991987))





# [0.12.0](https://github.com/mjancarik/merkur/compare/v0.11.3...v0.12.0) (2020-06-28)


### Features

* 🎸 added es5 version of lib files for older browsers ([5fbf920](https://github.com/mjancarik/merkur/commit/5fbf9205e60b735d2711f3f98c06ee7a734d26ba))





## [0.11.3](https://github.com/mjancarik/merkur/compare/v0.11.2...v0.11.3) (2020-06-23)

**Note:** Version bump only for package @merkur/create-widget





## [0.11.2](https://github.com/mjancarik/merkur/compare/v0.11.1...v0.11.2) (2020-06-21)


### Features

* 🎸 added µhtml template engine ([5d5cd9a](https://github.com/mjancarik/merkur/commit/5d5cd9a7be8629843e701a965a03162432b2521a))





## [0.11.1](https://github.com/mjancarik/merkur/compare/v0.11.0...v0.11.1) (2020-06-21)

**Note:** Version bump only for package @merkur/create-widget





# [0.11.0](https://github.com/mjancarik/merkur/compare/v0.10.0...v0.11.0) (2020-06-19)

**Note:** Version bump only for package @merkur/create-widget





# [0.10.0](https://github.com/mjancarik/merkur/compare/v0.9.4...v0.10.0) (2020-06-17)


### Bug Fixes

* 🐛 Removed duplicate setting of widgetEnvironment ([bc87bc6](https://github.com/mjancarik/merkur/commit/bc87bc60dce1c34fbe30d7dba97e12836765dd7a))





## [0.9.4](https://github.com/mjancarik/merkur/compare/v0.9.3...v0.9.4) (2020-06-08)

**Note:** Version bump only for package @merkur/create-widget





## [0.9.3](https://github.com/mjancarik/merkur/compare/v0.9.2...v0.9.3) (2020-06-08)


### Bug Fixes

* 🐛 preact template ([b59294b](https://github.com/mjancarik/merkur/commit/b59294b6936d2f085e92f568e4812f45dbd17e93))
* 🐛 Skeleton template fixes, added widget environment ([d64f35d](https://github.com/mjancarik/merkur/commit/d64f35ddeb3fb855bff1a3281673c53687d1765b))





## [0.9.2](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.2) (2020-06-04)

**Note:** Version bump only for package @merkur/create-widget





## [0.9.1](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.1) (2020-06-04)

**Note:** Version bump only for package @merkur/create-widget





# [0.9.0](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.0) (2020-06-04)

**Note:** Version bump only for package @merkur/create-widget





## [0.8.1](https://github.com/mjancarik/merkur/compare/v0.8.0...v0.8.1) (2020-05-20)

**Note:** Version bump only for package @merkur/create-widget





# [0.8.0](https://github.com/mjancarik/merkur/compare/v0.7.1...v0.8.0) (2020-05-15)


### Features

* 🎸 added containerSelector and widgetClassName properties ([d2b9ad2](https://github.com/mjancarik/merkur/commit/d2b9ad23c0dae5cb6eec33ea7dbb505f4f94ecda))


### BREAKING CHANGES

* 🧨 yes





## [0.7.1](https://github.com/mjancarik/merkur/compare/v0.7.0...v0.7.1) (2020-05-14)

**Note:** Version bump only for package @merkur/create-widget





# [0.7.0](https://github.com/mjancarik/merkur/compare/v0.6.2...v0.7.0) (2020-05-14)


### Bug Fixes

* 🐛 restart server after changing json, jsx and mjs files ([6f0fb06](https://github.com/mjancarik/merkur/commit/6f0fb06419be184db68e07c792dd0106ea025a80))


### Features

* 🎸 added config module for environment configuration ([2ecacee](https://github.com/mjancarik/merkur/commit/2ecacee5accc59463cf75d218b248603f602db30))





## [0.6.2](https://github.com/mjancarik/merkur/compare/v0.6.1...v0.6.2) (2020-05-10)


### Features

* 🎸 added cors middleware ([6d18601](https://github.com/mjancarik/merkur/commit/6d186010274f18bd154649fa78b3ae5dfc8cfe72))
* 🎸 added enzyme testing to react template ([f8c3f84](https://github.com/mjancarik/merkur/commit/f8c3f8411b5b3f384754f1fdcf53a3f80441ca05))
* 🎸 select container through querySelector ([8c6f322](https://github.com/mjancarik/merkur/commit/8c6f322ba59ff61c3ba277cc373c8e330a7917d4))





## [0.6.1](https://github.com/mjancarik/merkur/compare/v0.6.0...v0.6.1) (2020-05-04)


### Bug Fixes

* 🐛 missing babel.config.js file in module for preact ([82bcf54](https://github.com/mjancarik/merkur/commit/82bcf547826aa501f9e156bc138dd11556ca4f51))





# [0.6.0](https://github.com/mjancarik/merkur/compare/v0.5.7...v0.6.0) (2020-05-04)


### Features

* 🎸 liveroload without modifing app.js file ([5c51173](https://github.com/mjancarik/merkur/commit/5c511739efa3edab3981f0fdee17303a311df7db))


### BREAKING CHANGES

* 🧨 yes





## [0.5.7](https://github.com/mjancarik/merkur/compare/v0.5.6...v0.5.7) (2020-05-04)

**Note:** Version bump only for package @merkur/create-widget





## [0.5.6](https://github.com/mjancarik/merkur/compare/v0.5.5...v0.5.6) (2020-05-02)

**Note:** Version bump only for package @merkur/create-widget





## [0.5.5](https://github.com/mjancarik/merkur/compare/v0.5.4...v0.5.5) (2020-05-02)

**Note:** Version bump only for package @merkur/create-widget





## [0.5.3](https://github.com/mjancarik/merkur/compare/v0.5.2...v0.5.3) (2020-05-01)


### Features

* 🎸 added livereloading for dev ([fde5d8c](https://github.com/mjancarik/merkur/commit/fde5d8c2cae2145a1d0af4efd5177c88b16d4f1d))





## [0.5.1](https://github.com/mjancarik/merkur/compare/v0.5.0...v0.5.1) (2020-04-25)


### Bug Fixes

* 🐛 @merkur/tools version ([34940d1](https://github.com/mjancarik/merkur/commit/34940d1151c4af1dcba8d219d513be2fbfeae4d6))
* 🐛 ignoring linting generated files ([0a96443](https://github.com/mjancarik/merkur/commit/0a9644334a9a6d384a76ae321a99b161407b6abf))
* 🐛 serving static files ([45a519e](https://github.com/mjancarik/merkur/commit/45a519e6d20e63e58219af32a41850bfd25e3045))
* 🐛 typo ([d86e7d1](https://github.com/mjancarik/merkur/commit/d86e7d1679f024e79ec1c44d7c391ee4c378abb9))
* 🐛 typo ([18839ad](https://github.com/mjancarik/merkur/commit/18839ad2c33c5c5523bf1eec11911ff22fd4df2b))





# [0.5.0](https://github.com/mjancarik/merkur/compare/v0.4.2...v0.5.0) (2020-04-25)


### Bug Fixes

* 🐛 added missing dev dependencies ([c4edb26](https://github.com/mjancarik/merkur/commit/c4edb2609858805dfcf2cff35f4cd390abc03241))


### Features

* 🎸 change folders structure ([22425e0](https://github.com/mjancarik/merkur/commit/22425e0b4e61984d5d303186299ade4bba1cf5fb))


### BREAKING CHANGES

* 🧨 yes





## [0.4.2](https://github.com/mjancarik/merkur/compare/v0.4.1...v0.4.2) (2020-04-22)


### Bug Fixes

* 🐛 all template and views files must be in module ([a737891](https://github.com/mjancarik/merkur/commit/a7378910c38f0d5862b4a1c6c254b68c8a4f68e2))





## [0.4.1](https://github.com/mjancarik/merkur/compare/v0.4.0...v0.4.1) (2020-04-22)


### Bug Fixes

* 🐛 files from template folder must be in module ([8899bd3](https://github.com/mjancarik/merkur/commit/8899bd36c95920c2fe7d344eed5d2281085b1673))





# [0.4.0](https://github.com/mjancarik/merkur/compare/v0.3.1...v0.4.0) (2020-04-20)

**Note:** Version bump only for package @merkur/create-widget





## [0.3.1](https://github.com/mjancarik/merkur/compare/v0.3.0...v0.3.1) (2020-04-07)


### Bug Fixes

* 🐛 creating widget on client side ([7470462](https://github.com/mjancarik/merkur/commit/7470462d72eb2ce4d1ee77b6c49ea588350bed11))





# [0.3.0](https://github.com/mjancarik/merkur/compare/v0.2.2...v0.3.0) (2020-04-03)


### Features

* 🎸 simplify merkur interface ([e681679](https://github.com/mjancarik/merkur/commit/e6816796e552c6014ca5177879eaa8c28d8cb8ca))





## [0.2.2](https://github.com/mjancarik/merkur/compare/v0.2.1...v0.2.2) (2020-04-02)

**Note:** Version bump only for package @merkur/create-widget





## [0.2.1](https://github.com/mjancarik/merkur/compare/v0.2.0...v0.2.1) (2020-03-29)

**Note:** Version bump only for package @merkur/create-widget





# [0.2.0](https://github.com/mjancarik/merkur/compare/v0.1.2...v0.2.0) (2020-03-29)


### Features

* 🎸 added eslint and jest configuration ([b7123fa](https://github.com/mjancarik/merkur/commit/b7123fa1b7d5d94a97b3574318769c4937f89c39))





## [0.1.2](https://github.com/mjancarik/merkur/compare/v0.1.1...v0.1.2) (2020-03-27)

**Note:** Version bump only for package @merkur/create-widget





## [0.1.1](https://github.com/mjancarik/merkur/compare/v0.1.0...v0.1.1) (2020-03-26)

**Note:** Version bump only for package @merkur/create-widget





# 0.1.0 (2020-03-26)


### Bug Fixes

* 🐛 renamed merkur core module ([b055fef](https://github.com/mjancarik/merkur/commit/b055fef9dc4bcbad5157d6dff1ff01a572d35b7d))


### Features

* 🎸 renamed package and added create-widget ([bde4759](https://github.com/mjancarik/merkur/commit/bde47593457f1ef0b12ce8ce45a4f2347f47aa04))
