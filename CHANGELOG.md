# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.29.4](https://github.com/mjancarik/merkur/compare/v0.29.3...v0.29.4) (2022-09-13)


### Bug Fixes

* 🐛 resolving merkur integration for node@18 ([67a344d](https://github.com/mjancarik/merkur/commit/67a344d1197674f1fa9a4f263d43b8961f1b26aa)), closes [#133](https://github.com/mjancarik/merkur/issues/133)





## [0.29.3](https://github.com/mjancarik/merkur/compare/v0.29.2...v0.29.3) (2022-09-13)

**Note:** Version bump only for package merkur-monorepo





## [0.29.2](https://github.com/mjancarik/merkur/compare/v0.29.1...v0.29.2) (2022-09-07)

**Note:** Version bump only for package merkur-monorepo





## [0.29.1](https://github.com/mjancarik/merkur/compare/v0.29.0...v0.29.1) (2022-09-06)

**Note:** Version bump only for package merkur-monorepo





# [0.29.0](https://github.com/mjancarik/merkur/compare/v0.28.2...v0.29.0) (2022-08-08)


### Bug Fixes

* 🐛 check http client presence ([dd105cb](https://github.com/mjancarik/merkur/commit/dd105cbb78b538debfbc5bf487ce4afd5f213931))


### Features

* 🎸 graphql client ([2535543](https://github.com/mjancarik/merkur/commit/253554353ac506a8ab91a27ffb0f5b9ceddc00ff))
* 🎸 upgrade merkur dependencies ([20f3bbc](https://github.com/mjancarik/merkur/commit/20f3bbc5f74b8774b8c1e4ec0bd93acb01dab5de))





## [0.28.2](https://github.com/mjancarik/merkur/compare/v0.28.1...v0.28.2) (2022-04-23)


### Bug Fixes

* 🐛 CSP for resource integrating to host app ([f88a8cc](https://github.com/mjancarik/merkur/commit/f88a8cceab50aa78405a1e1040016bb95da5c394))





## [0.28.1](https://github.com/mjancarik/merkur/compare/v0.28.0...v0.28.1) (2022-04-21)


### Bug Fixes

* 🐛 donwgrade node-fetch to 2.6.7 ([fb4deb2](https://github.com/mjancarik/merkur/commit/fb4deb2e55f6c845bd394e7315e1b2a0eb5882b0))





# [0.28.0](https://github.com/mjancarik/merkur/compare/v0.27.6...v0.28.0) (2022-04-20)


### Bug Fixes

* 🐛 keep assets property immutable ([2d99c83](https://github.com/mjancarik/merkur/commit/2d99c8367ef1aa7bf6b9d2d66089bcbb5322f240))
* 🐛 peer dependencies warning and error ([228537c](https://github.com/mjancarik/merkur/commit/228537c7927a5a7ae987bb7551d35437cb4f8025))


### Code Refactoring

* 💡 move liveReloadServer to merkur/tools ([f81e0e8](https://github.com/mjancarik/merkur/commit/f81e0e89eff4a72985c89d23079be6a9344a3b2e))


### Features

* 🎸 Optional script assets ([a301b80](https://github.com/mjancarik/merkur/commit/a301b80bab640f1edc31c40882495d6a966abe53))


### BREAKING CHANGES

* 🧨 The liveReloadServer.cjs file is moved to @merkur/tools. The
@merkur/tool-webpack re-export createLiveReloadServer for keeping
backward compatability.





## [0.27.6](https://github.com/mjancarik/merkur/compare/v0.27.5...v0.27.6) (2021-11-22)


### Bug Fixes

* 🐛 correct binding of widget to methods ([#116](https://github.com/mjancarik/merkur/issues/116)) ([2adc6a6](https://github.com/mjancarik/merkur/commit/2adc6a61d1b41552da255586514976a662ee1d3b))
* 🐛 storybook integration for react and preact ([757ff64](https://github.com/mjancarik/merkur/commit/757ff64385687f4d73a3ee793549eeb785486e86))


### Features

* 🎸 basic implementation of GenericError ([fb43403](https://github.com/mjancarik/merkur/commit/fb43403206cfe4aa58f1b95525bdde81d1400e3e))
* 🎸 close server properly ([5e40a09](https://github.com/mjancarik/merkur/commit/5e40a09392468db640b5e734d2e1de489af57a34))





## [0.27.5](https://github.com/mjancarik/merkur/compare/v0.27.4...v0.27.5) (2021-10-14)


### Bug Fixes

* 🐛 exclude assets without source ([#115](https://github.com/mjancarik/merkur/issues/115)) ([1b6ba0e](https://github.com/mjancarik/merkur/commit/1b6ba0e4e0916c94c0d9295a1a3a75fa2574b7b0))


### Features

* 🎸 allow set Content-Type header as lowercase ([98a62b6](https://github.com/mjancarik/merkur/commit/98a62b6d3347eafa19f51f1ce5a413c803e966d5))





## [0.27.4](https://github.com/mjancarik/merkur/compare/v0.27.3...v0.27.4) (2021-10-06)


### Features

* 🎸 Allow CssMinimizerPlugin options override ([#114](https://github.com/mjancarik/merkur/issues/114)) ([c02dd0b](https://github.com/mjancarik/merkur/commit/c02dd0bf06a44bbf45880c9b1932a33e287f35ce))





## [0.27.3](https://github.com/mjancarik/merkur/compare/v0.27.2...v0.27.3) (2021-10-04)


### Bug Fixes

* 🐛 Windows babel es5 build issue with exclude pattern ([#113](https://github.com/mjancarik/merkur/issues/113)) ([26387ea](https://github.com/mjancarik/merkur/commit/26387ea01d840d5d6f55d4748d34c87c7f3f5f10))
* build widget before running tests ([5de74c7](https://github.com/mjancarik/merkur/commit/5de74c77bb333bfc6cbf41c92502590402b7fd17))





## [0.27.2](https://github.com/mjancarik/merkur/compare/v0.27.1...v0.27.2) (2021-09-30)


### Bug Fixes

* 🐛 ES5 Polyfill definition fix ([#110](https://github.com/mjancarik/merkur/issues/110)) ([485e3f7](https://github.com/mjancarik/merkur/commit/485e3f7fe1f969b727912577d7c538a43136f860))





## [0.27.1](https://github.com/mjancarik/merkur/compare/v0.27.0...v0.27.1) (2021-09-30)


### Bug Fixes

* 🐛 Removed unused @merkur/tools pkg dependencies ([#109](https://github.com/mjancarik/merkur/issues/109)) ([c1a28b0](https://github.com/mjancarik/merkur/commit/c1a28b00f1b9510eeab897ab0232f59a0f6a3c0f))





# [0.27.0](https://github.com/mjancarik/merkur/compare/v0.26.1...v0.27.0) (2021-09-29)


### Features

* 🎸 Added default support for asset image resources ([bd94f8d](https://github.com/mjancarik/merkur/commit/bd94f8d1a536335363a0f3381f85e57448078ac3))
* 🎸 Added direct entry points for RouterEvents export ([#107](https://github.com/mjancarik/merkur/issues/107)) ([9d10d46](https://github.com/mjancarik/merkur/commit/9d10d463c40d00a62dc25cb182aa3dc874be05df))
* 🎸 Added eslint plugin import and eslint react-hooks plugi ([#108](https://github.com/mjancarik/merkur/issues/108)) ([db8ca75](https://github.com/mjancarik/merkur/commit/db8ca75e701f1e9d57dc55c3a3a5e1fb7cfc4787))
* 🎸 Automatically generate free port for livereload server ([#101](https://github.com/mjancarik/merkur/issues/101)) ([a083a1b](https://github.com/mjancarik/merkur/commit/a083a1b31edc818a2d94e000a78cbb03cc8dc022))


### BREAKING CHANGES

* 🧨 createLiveReloadServer() function must be promise chained in
webpack.config.js before returning any config array.





## [0.26.1](https://github.com/mjancarik/merkur/compare/v0.26.0...v0.26.1) (2021-08-30)


### Bug Fixes

* 🐛 Fixed condition when loading scripts ([#102](https://github.com/mjancarik/merkur/issues/102)) ([f5664f5](https://github.com/mjancarik/merkur/commit/f5664f550b375d50f85d410e02551484cee3c4ea))





# [0.26.0](https://github.com/mjancarik/merkur/compare/v0.25.0...v0.26.0) (2021-08-27)


### Bug Fixes

* 🐛 Fixed fallback to lower ES versions when loading scripts ([#97](https://github.com/mjancarik/merkur/issues/97)) ([d52da56](https://github.com/mjancarik/merkur/commit/d52da567aaac453911f4376e04ed3f71c8e9a293))
* 🐛 use es11 source for playground page ([9256133](https://github.com/mjancarik/merkur/commit/9256133cb09a81cbea580d03531d4890a398e99c))
* link ([069615b](https://github.com/mjancarik/merkur/commit/069615b206f7360582bda7efe5a0a006ba5ce780))


* Slot (#96) ([ec4d528](https://github.com/mjancarik/merkur/commit/ec4d528b8bb92392bdd002c092ac38352851e2a5)), closes [#96](https://github.com/mjancarik/merkur/issues/96)


### Features

* 🎸 add cjs file for es9 ([#98](https://github.com/mjancarik/merkur/issues/98)) ([6b0a4a1](https://github.com/mjancarik/merkur/commit/6b0a4a130b632de014839ab1cef2730db7f32335))
* 🎸 Added callback functions to setState and setProps ([#100](https://github.com/mjancarik/merkur/issues/100)) ([2bbee18](https://github.com/mjancarik/merkur/commit/2bbee189511cd33654f1d2deddad6e702f295852))
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

* 🎸 integration fn can load assets to shadow root ([#95](https://github.com/mjancarik/merkur/issues/95)) ([9381315](https://github.com/mjancarik/merkur/commit/9381315472615c540301e5ecfa5ccb7668c2cd44))
* 🎸 set es11 as default for esm modules ([#94](https://github.com/mjancarik/merkur/issues/94)) ([e841b89](https://github.com/mjancarik/merkur/commit/e841b89a601e139b803e585749991b992af8e70f))
* 🎸 transformer can intercept request ([7fb1ecc](https://github.com/mjancarik/merkur/commit/7fb1ecc7441ae31baec0fb532e90b816763576c1))


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
* 🧨 Request and response transformers accept and return request and
response. Request promise is rejected for status code greater than 299.
* 🧨 Jest@27 https://github.com/facebook/jest/blob/master/CHANGELOG.md#2700





## [0.24.4](https://github.com/mjancarik/merkur/compare/v0.24.3...v0.24.4) (2021-06-11)


### Bug Fixes

* 🐛 Fixed issue, where Components might receive empty object in widgetProperties ([#87](https://github.com/mjancarik/merkur/issues/87)) ([5d9b8c5](https://github.com/mjancarik/merkur/commit/5d9b8c5db4407b1078cf39cfc9a15ca4a5d66989))





## [0.24.3](https://github.com/mjancarik/merkur/compare/v0.24.2...v0.24.3) (2021-06-10)

**Note:** Version bump only for package merkur-monorepo





## [0.24.2](https://github.com/mjancarik/merkur/compare/v0.24.1...v0.24.2) (2021-06-07)

**Note:** Version bump only for package merkur-monorepo





## [0.24.1](https://github.com/mjancarik/merkur/compare/v0.24.0...v0.24.1) (2021-06-06)


### Features

* 🎸 css scramble plugin ([#85](https://github.com/mjancarik/merkur/issues/85)) ([bfeff1e](https://github.com/mjancarik/merkur/commit/bfeff1ef15009ff9cf7dc81564af573526042a7a))





# [0.24.0](https://github.com/mjancarik/merkur/compare/v0.23.12...v0.24.0) (2021-05-28)


### Bug Fixes

* 🐛 Fixed svelte template ([d7356f1](https://github.com/mjancarik/merkur/commit/d7356f1e578e90c8d662a9e885504f8bc065fde4))
* 🐛 Merkur template fixes ([cd6f85d](https://github.com/mjancarik/merkur/commit/cd6f85d3d2f7be475102db597ab4816fe987b44c))


### Features

* 🎸 Added MerkurSlot component to integration-react ([6f1b05f](https://github.com/mjancarik/merkur/commit/6f1b05f1dffc523540a7340bef38ececb520207d))
* 🎸 Added support for slots ([19d5451](https://github.com/mjancarik/merkur/commit/19d5451850b5264c3649bfb5536c62f2d4149706))





## [0.23.12](https://github.com/mjancarik/merkur/compare/v0.23.11...v0.23.12) (2021-04-16)

**Note:** Version bump only for package merkur-monorepo





## [0.23.11](https://github.com/mjancarik/merkur/compare/v0.23.10...v0.23.11) (2021-04-14)


### Bug Fixes

* 🐛 prevent errors for fully specified files ([#73](https://github.com/mjancarik/merkur/issues/73)) ([4d890f4](https://github.com/mjancarik/merkur/commit/4d890f4645174c3c84276ac1a285ad0b28804a44))





## [0.23.10](https://github.com/mjancarik/merkur/compare/v0.23.9...v0.23.10) (2021-04-12)


### Bug Fixes

* 🐛 eslint config to reflect chosen view ([#71](https://github.com/mjancarik/merkur/issues/71)) ([c1bfb4a](https://github.com/mjancarik/merkur/commit/c1bfb4a1a1589d623d7a228cf874ac801d0dcee0)), closes [#69](https://github.com/mjancarik/merkur/issues/69)


### Features

* 🎸 add brotli and gzip compression to webpack build ([#70](https://github.com/mjancarik/merkur/issues/70)) ([3a454fd](https://github.com/mjancarik/merkur/commit/3a454fd45b11e43d84d87ba8fa47cca1441de00b))





## [0.23.9](https://github.com/mjancarik/merkur/compare/v0.23.8...v0.23.9) (2021-04-12)


### Bug Fixes

* 🐛 es5 webpack build ([#68](https://github.com/mjancarik/merkur/issues/68)) ([68dd594](https://github.com/mjancarik/merkur/commit/68dd59494130fa6288411a749bed7862f6950b50))





## [0.23.8](https://github.com/mjancarik/merkur/compare/v0.23.7...v0.23.8) (2021-03-21)


### Bug Fixes

* 🐛 reloading page after build ([01d4c61](https://github.com/mjancarik/merkur/commit/01d4c613053e1522312468bf411c6784add5eb28))
* 🐛 restarting nodemone after build ([52166d5](https://github.com/mjancarik/merkur/commit/52166d527638e39f4327014f66d10df0950c5616))


### Features

* 🎸 added svelte view ([#65](https://github.com/mjancarik/merkur/issues/65)) ([b3f9e24](https://github.com/mjancarik/merkur/commit/b3f9e24a683477d53153121750a00627f5b176b7))





## [0.23.7](https://github.com/mjancarik/merkur/compare/v0.23.6...v0.23.7) (2021-02-25)


### Bug Fixes

* 🐛 check presence of inlineStyles just in head ([#64](https://github.com/mjancarik/merkur/issues/64)) ([4042311](https://github.com/mjancarik/merkur/commit/4042311247f14881508bf05c9f3079625ca73aa9))





## [0.23.6](https://github.com/mjancarik/merkur/compare/v0.23.5...v0.23.6) (2021-02-17)

**Note:** Version bump only for package merkur-monorepo





## [0.23.5](https://github.com/mjancarik/merkur/compare/v0.23.4...v0.23.5) (2021-02-17)


### Bug Fixes

* 🐛 ignore build folder for linter ([63d2cd3](https://github.com/mjancarik/merkur/commit/63d2cd3839fb1c21a3c9e6564de888caa92c68a6))





## [0.23.4](https://github.com/mjancarik/merkur/compare/v0.23.3...v0.23.4) (2021-02-04)

**Note:** Version bump only for package merkur-monorepo





## [0.23.3](https://github.com/mjancarik/merkur/compare/v0.23.2...v0.23.3) (2021-02-04)


### Bug Fixes

* 🐛 default value 'auto' in publicPath for manifest.json ([08f5fef](https://github.com/mjancarik/merkur/commit/08f5fefdf80cacac745fea8fc25622f562c05a12))
* 🐛 npm run dev command start dev:server ([45fa9ac](https://github.com/mjancarik/merkur/commit/45fa9acb46b0efb660b2838b8b4957c1dc5e419b))





## [0.23.2](https://github.com/mjancarik/merkur/compare/v0.23.1...v0.23.2) (2021-02-01)

**Note:** Version bump only for package merkur-monorepo





## [0.23.1](https://github.com/mjancarik/merkur/compare/v0.23.0...v0.23.1) (2021-02-01)

**Note:** Version bump only for package merkur-monorepo





# [0.23.0](https://github.com/mjancarik/merkur/compare/v0.22.0...v0.23.0) (2021-02-01)


* Storybook (#60) ([640e3e8](https://github.com/mjancarik/merkur/commit/640e3e8490317497eea9c28f669b406608cbfcdc)), closes [#60](https://github.com/mjancarik/merkur/issues/60)


### Bug Fixes

* 🐛 error with not declared variables ([67d07a6](https://github.com/mjancarik/merkur/commit/67d07a6971fd3d21bee34ddafd22252299411006))
* 🐛 express default error handler ([327a018](https://github.com/mjancarik/merkur/commit/327a018995a19adfb7b2c4f4835d31bffc1d7cbf))
* 🐛 typo ([e9dca16](https://github.com/mjancarik/merkur/commit/e9dca16797593891f4f11e876bd6382b8f98d6d2))
* missing ES source ([#33](https://github.com/mjancarik/merkur/issues/33)) ([3e08b76](https://github.com/mjancarik/merkur/commit/3e08b7649973cd3d5a5211ce34d4a235e1752c60))


### chore

* 🤖 added index.js file for fixing CRA ([#51](https://github.com/mjancarik/merkur/issues/51)) ([bcfb131](https://github.com/mjancarik/merkur/commit/bcfb131abe8a5c02504dd573f8c198ed3dbca648))
* 🤖 update dependencies ([#59](https://github.com/mjancarik/merkur/issues/59)) ([06ba5d5](https://github.com/mjancarik/merkur/commit/06ba5d578b8b1058d71b3d56d1da11a737b495a9))


### Code Refactoring

* 💡 error event is emitted with error property ([cee7d4a](https://github.com/mjancarik/merkur/commit/cee7d4ac202bf9d1ed1a7297c9f8f81b89cc72f5))
* 💡 replace webpack-shell-plugin ([ea89a9f](https://github.com/mjancarik/merkur/commit/ea89a9f7b253af4a8a723bfd0dca17b1828e0d39))


### Features

* 🎸 added @merkur/plugin-error to widget template ([c778c3f](https://github.com/mjancarik/merkur/commit/c778c3fcf5ee6d4bde4248a78250a21127c0507e))
* 🎸 exported new error express middleware ([bde836a](https://github.com/mjancarik/merkur/commit/bde836ab070b65db448734d2f67f9275abbaf244))
* 🎸 widget load method is called for every route ([#52](https://github.com/mjancarik/merkur/issues/52)) ([b628e83](https://github.com/mjancarik/merkur/commit/b628e83c6d5f967286f4bc27707d6f11606921be)), closes [#21](https://github.com/mjancarik/merkur/issues/21)


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
* 🧨   We replace webpack-shell-plugin for webpack-shell-plugin-next which is
maintained and support webpack5.
* 🧨 The logUnhandledPromises method was removed from module.
* 🧨 Error event is emitted with error property instead of thrownError
property.
* 🧨 Widget load method is called for every route.
* 🧨 The values of main and module properties were change without file
extension in package.json.





# [0.22.0](https://github.com/mjancarik/merkur/compare/v0.21.3...v0.22.0) (2020-10-15)


### Bug Fixes

* 🐛 es version tests ([86d3604](https://github.com/mjancarik/merkur/commit/86d36049ae2b2da66152fe4af541124eb5af6e9f))
* 🐛 fixed state resetting while unmounting and changing widg ([#49](https://github.com/mjancarik/merkur/issues/49)) ([9bef7f8](https://github.com/mjancarik/merkur/commit/9bef7f822a44cd7e690863ef76b3c6d6164cd1bd))


### Features

* 🎸 export umd file in integration module ([3a75802](https://github.com/mjancarik/merkur/commit/3a758020c59ee6671edade27482de64fa427405d))





## [0.21.3](https://github.com/mjancarik/merkur/compare/v0.21.2...v0.21.3) (2020-10-01)


### Bug Fixes

* 🐛 Fixed unintentional render of placeholder after SSR ([#43](https://github.com/mjancarik/merkur/issues/43)) ([64ec121](https://github.com/mjancarik/merkur/commit/64ec121dca6a458c818b3c6a291cc19b81b29e74))





## [0.21.2](https://github.com/mjancarik/merkur/compare/v0.21.1...v0.21.2) (2020-10-01)


### Bug Fixes

* 🐛 Fixed SSR in MerkurComponent (was rendering placeholder) ([#42](https://github.com/mjancarik/merkur/issues/42)) ([7e76e13](https://github.com/mjancarik/merkur/commit/7e76e13ff723049687d8b1ae45629d938f3f8df0))





## [0.21.1](https://github.com/mjancarik/merkur/compare/v0.21.0...v0.21.1) (2020-09-30)


### Features

* Option to open links in newTab in router.redirect ([#41](https://github.com/mjancarik/merkur/issues/41)) ([2719173](https://github.com/mjancarik/merkur/commit/2719173671823c1ebbd667f6eb3f0f999b24e81f))





# [0.21.0](https://github.com/mjancarik/merkur/compare/v0.20.0...v0.21.0) (2020-09-30)


### Bug Fixes

* 🐛 Fixed babel-loader config to re-enable tree-shaking ([e125818](https://github.com/mjancarik/merkur/commit/e12581838273571be2c88d03c5061ed33857b0a2))
* 🐛 Fixed FOUC and unnecessary component re-renderings ([#39](https://github.com/mjancarik/merkur/issues/39)) ([0b8d90f](https://github.com/mjancarik/merkur/commit/0b8d90fffec1136df1a3787ff505fd9c528f848f))
* Calling update on unmounted widget ([#40](https://github.com/mjancarik/merkur/issues/40)) ([6ce9c65](https://github.com/mjancarik/merkur/commit/6ce9c65264c58235a732dc27d4ea2cd45d95ce92))


### Features

* 🎸 preact use hydrate for aliving widget ([354ddb0](https://github.com/mjancarik/merkur/commit/354ddb0ede71aa9ed7500a5fa4a560f2a00424a3))





# [0.20.0](https://github.com/mjancarik/merkur/compare/v0.19.3...v0.20.0) (2020-09-11)


### Bug Fixes

* 🐛 added browser field to package.json ([85cf4a1](https://github.com/mjancarik/merkur/commit/85cf4a1e73b883125d4482c36892aa5de410653f))


### BREAKING CHANGES

* 🧨 new browser field in pakckage.json





## [0.19.3](https://github.com/mjancarik/merkur/compare/v0.19.2...v0.19.3) (2020-09-10)

**Note:** Version bump only for package merkur-monorepo





## [0.19.2](https://github.com/mjancarik/merkur/compare/v0.19.1...v0.19.2) (2020-09-09)


### Bug Fixes

* 🐛 jest integration tests for widget with server.cjs file ([4e213cd](https://github.com/mjancarik/merkur/commit/4e213cd42ad27502667deb35f025f8b79ed2533a))





## [0.19.1](https://github.com/mjancarik/merkur/compare/v0.19.0...v0.19.1) (2020-09-07)


### Bug Fixes

* 🐛 name of umd version for @merkur/plugin-event-emitter ([3c0709a](https://github.com/mjancarik/merkur/commit/3c0709aced4411137f18b55043ba8c57c7808354))
* 🐛 package exports for server ([a36a5e2](https://github.com/mjancarik/merkur/commit/a36a5e2d357feec0ca955326af79a1ccff3859d5))
* 🐛 set webpack to handle .mjs files for both envs ([131b06d](https://github.com/mjancarik/merkur/commit/131b06de9ea766ce4ea8c39405232ed103dc7eb6))





# [0.19.0](https://github.com/mjancarik/merkur/compare/v0.18.1...v0.19.0) (2020-09-07)


### Code Refactoring

* 💡 remove default export ([92301e3](https://github.com/mjancarik/merkur/commit/92301e3b48eb1b210b1240f70a6eb4286f9b1c0a))


### Features

* 🎸 add file extension in package.json ([7b8f8b3](https://github.com/mjancarik/merkur/commit/7b8f8b31b4d45f6f6bc59b5ad81c25ab067de091))
* 🎸 bundle analyzer show tree shakeable version for dev env ([29c5bcd](https://github.com/mjancarik/merkur/commit/29c5bcdb5c8b3dc815169c14a116bc6c591ff81e))


### BREAKING CHANGES

* 🧨 removed default export from @merkur/integration and keep only named
exports in all @merkur modules
* 🧨 remove useless files from lib folder and defined exports in package.json





## [0.18.1](https://github.com/mjancarik/merkur/compare/v0.18.0...v0.18.1) (2020-09-04)


### Bug Fixes

* escaping CSS styles ([#26](https://github.com/mjancarik/merkur/issues/26)) ([71051cc](https://github.com/mjancarik/merkur/commit/71051ccd8e1d51a3917f86238fd4764578c3b37b))
* updated snapshot ([334d38c](https://github.com/mjancarik/merkur/commit/334d38c5f72117b23799d75e26ede8b0048e3844))





# [0.18.0](https://github.com/mjancarik/merkur/compare/v0.17.0...v0.18.0) (2020-09-03)


### Bug Fixes

* 🐛 added check for object destructuring in ES9 supported fn ([952cd8c](https://github.com/mjancarik/merkur/commit/952cd8c3551192ba4c78f30c55f4506a547924cb))
* 🐛 keep controller after changing props with same pathname ([27266c7](https://github.com/mjancarik/merkur/commit/27266c7ddbdb311175cc04048e9b29e0a6bb2249))
* 🐛 optional event-emitter ([5f0edd1](https://github.com/mjancarik/merkur/commit/5f0edd191e99d6fef66a8c29530b73dba956d874))
* 🐛 run bootstrap life cycle method before resolving route ([c3172c2](https://github.com/mjancarik/merkur/commit/c3172c21ad68eabc3846d32c0e3c1747a3d06824))
* 🐛 skip loading missing script asset in playground ([127f39b](https://github.com/mjancarik/merkur/commit/127f39bd0759884c601f8e8c416442c02d3d0076))
* 🐛 umd version of module ([e90b6b1](https://github.com/mjancarik/merkur/commit/e90b6b16c512607db423ae2e2724cd6da6afb118))
* Double slash in assets path ([#25](https://github.com/mjancarik/merkur/issues/25)) ([bebb81e](https://github.com/mjancarik/merkur/commit/bebb81ee98d7d13d2054368939f70f290c0905df))


### Code Refactoring

* 💡 rename ecmaversions option to folders ([54d62aa](https://github.com/mjancarik/merkur/commit/54d62aa11bf294e6c561bd93ac6719a89cb21cca))


### Features

* 🎸 added polyfill file ([b2b2a99](https://github.com/mjancarik/merkur/commit/b2b2a99380ea741d8a36fa95a94ded3414fc8a9f))
* 🎸 added terser for minification umd version of modules ([192c9b2](https://github.com/mjancarik/merkur/commit/192c9b206656da6fb870134b9725bf12ed098ab7))
* 🎸 added timeout transformer ([9ff3dc7](https://github.com/mjancarik/merkur/commit/9ff3dc7f73dec79f39b552700c73dcc8427c0cce))
* 🎸 handling client side error ([96c736f](https://github.com/mjancarik/merkur/commit/96c736f18bcd1f41287f71c8526c2fb9288bbcd7))
* 🎸 pipe allow async function ([97f6aa5](https://github.com/mjancarik/merkur/commit/97f6aa53159cb988ab6dd6e02d422ecdeb6c0064))
* 🎸 polyfill is downloaded only for falsy result from test ([b65b4c8](https://github.com/mjancarik/merkur/commit/b65b4c8fbbe131dc2ef66486077b9666745aac22))
* 🎸 removed containerSelector from API call ([e54303d](https://github.com/mjancarik/merkur/commit/e54303df23264980f888fc3bf3d50b6c3892728c))


### BREAKING CHANGES

* 🧨 yes
* 🧨 yes
* 🧨 yes
* 🧨 yes
* 🧨 yes
* 🧨 yes





# [0.17.0](https://github.com/mjancarik/merkur/compare/v0.16.2...v0.17.0) (2020-08-27)


### Features

* 🎸 base integration package ([8320b22](https://github.com/mjancarik/merkur/commit/8320b22a4d46cf99678f372defe8d84f4488aaa9))
* 🎸 integration-react using base integration pkg ([a3aef85](https://github.com/mjancarik/merkur/commit/a3aef859a80ff0a884d32fc5c98f77843b55f5f0))





## [0.16.2](https://github.com/mjancarik/merkur/compare/v0.16.1...v0.16.2) (2020-08-25)

**Note:** Version bump only for package merkur-monorepo





## [0.16.1](https://github.com/mjancarik/merkur/compare/v0.16.0...v0.16.1) (2020-08-14)

**Note:** Version bump only for package merkur-monorepo





# [0.16.0](https://github.com/mjancarik/merkur/compare/v0.15.2...v0.16.0) (2020-08-14)


### Bug Fixes

* 🐛 typo ([cfee48f](https://github.com/mjancarik/merkur/commit/cfee48f38bcd3d8437cbf823f9887c62376baad1))


### Features

* 🎸 added hook method to module base ([66d122c](https://github.com/mjancarik/merkur/commit/66d122c0a1679a4a77a86407b59ddd225d8fc682))
* 🎸 using hookMethod and isFunction in plugin ([b1b08e5](https://github.com/mjancarik/merkur/commit/b1b08e56b087bb30ea3dbda7e70e64729c83287e))





## [0.15.2](https://github.com/mjancarik/merkur/compare/v0.15.1...v0.15.2) (2020-08-07)


### Bug Fixes

* 🐛 test:all command ([3529e1d](https://github.com/mjancarik/merkur/commit/3529e1dc403723e7afc2f27053deaa74851dc9d2))





## [0.15.1](https://github.com/mjancarik/merkur/compare/v0.15.0...v0.15.1) (2020-08-06)


### Bug Fixes

* 🐛 resolving @merkur/* modules to es5 version ([802a952](https://github.com/mjancarik/merkur/commit/802a952995499f18d803414b26c0ac4356d7d881))





# [0.15.0](https://github.com/mjancarik/merkur/compare/v0.14.1...v0.15.0) (2020-08-06)


### Bug Fixes

* 🐛 running integration tests ([c2cfb3c](https://github.com/mjancarik/merkur/commit/c2cfb3cf5b8ae05d7ec91d04e9af29790f73a711))
* 🐛 Support for ES5/ES9 scripts ([#15](https://github.com/mjancarik/merkur/issues/15)) ([0334cda](https://github.com/mjancarik/merkur/commit/0334cdac2c1f62ae4fb8895bf077a4ebebc99e4c))


### chore

* 🤖 update dependencies ([9d5f3eb](https://github.com/mjancarik/merkur/commit/9d5f3eb1b0b1e6845fa2ae5e2714cefd53e6782e))


### Features

* 🎸 Ability to override node_modules dir in ES5 transformer ([#14](https://github.com/mjancarik/merkur/issues/14)) ([253a443](https://github.com/mjancarik/merkur/commit/253a44346e324d98ed4408775ddbb9e3e769d9c7))
* 🎸 added jest-watch-typeahead plugin ([f0de4e7](https://github.com/mjancarik/merkur/commit/f0de4e726e41239676cce956e7374a7ca64dcd64))
* 🎸 allow tree shaking for merkur ([731371e](https://github.com/mjancarik/merkur/commit/731371ec09bfd1a7765caa55c9cc52124d7a42ed))


### BREAKING CHANGES

* 🧨 yes





## [0.14.1](https://github.com/mjancarik/merkur/compare/v0.14.0...v0.14.1) (2020-07-28)


### Bug Fixes

* 🐛 added missing clean-webpack-plugin dependency ([1cb754d](https://github.com/mjancarik/merkur/commit/1cb754d70ada2d98eb813d4d8d7c6012bfd1f135))
* 🐛 fixed typo in template for playground page ([5ff6493](https://github.com/mjancarik/merkur/commit/5ff6493743f23e325db3261d565a475ed30bd110))





# [0.14.0](https://github.com/mjancarik/merkur/compare/v0.13.1...v0.14.0) (2020-07-28)


### Features

* 🎸 added new base integration module ([6b4328a](https://github.com/mjancarik/merkur/commit/6b4328a213e5796c362438060c900f7ce40c0f27))
* 🎸 added support for new assets structure ([dfbce3f](https://github.com/mjancarik/merkur/commit/dfbce3f5a26dc3fa42eb805ae637ae619a65346b))
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


### Bug Fixes

* 🐛 Fixed duplicate call to init and unintentional destroy ([b3bf3d9](https://github.com/mjancarik/merkur/commit/b3bf3d93ecb570ca14d69dbe32f8071d445e441a))
* 🐛 Fixed query transformer, route is resolved before mount ([c5d5109](https://github.com/mjancarik/merkur/commit/c5d510947db9c42e4dee602028ec77eabf287d91))





## [0.11.2](https://github.com/mjancarik/merkur/compare/v0.11.1...v0.11.2) (2020-06-21)


### Features

* 🎸 added µhtml template engine ([5d5cd9a](https://github.com/mjancarik/merkur/commit/5d5cd9a7be8629843e701a965a03162432b2521a))





## [0.11.1](https://github.com/mjancarik/merkur/compare/v0.11.0...v0.11.1) (2020-06-21)


### Bug Fixes

* 🐛 load method must to be always called for mounted widget ([820a993](https://github.com/mjancarik/merkur/commit/820a99386c261238e53ec6cfc034341dd70f1584))





# [0.11.0](https://github.com/mjancarik/merkur/compare/v0.10.0...v0.11.0) (2020-06-19)


### Bug Fixes

* 🐛 removed content-type header from default config ([8570964](https://github.com/mjancarik/merkur/commit/8570964ddc004d90a8ac01093b07f8cd69ed37db))
* 🐛 removed trailing ? and & from request url ([8b60298](https://github.com/mjancarik/merkur/commit/8b602982841cfbe2b00a105a6eea0cb4282bbd0a))


### Features

* 🎸 allow define setup, create methods in widgetProperties ([5a1b918](https://github.com/mjancarik/merkur/commit/5a1b9181ea59e2592dedb45004bc7e58fa2f091e))


### BREAKING CHANGES

* 🧨 yes
* 🧨 yes





# [0.10.0](https://github.com/mjancarik/merkur/compare/v0.9.4...v0.10.0) (2020-06-17)


### Bug Fixes

* 🐛 Removed duplicate setting of widgetEnvironment ([bc87bc6](https://github.com/mjancarik/merkur/commit/bc87bc60dce1c34fbe30d7dba97e12836765dd7a))


### Features

* 🎸 Added getCurrentRoute method to plugin-router ([73007b3](https://github.com/mjancarik/merkur/commit/73007b32ac678581a45abfef6641d1a40ad00936))
* 🎸 export default http client transformers ([1f1f4d3](https://github.com/mjancarik/merkur/commit/1f1f4d374215fc31e71e2015572d106811f1b5d7))





## [0.9.4](https://github.com/mjancarik/merkur/compare/v0.9.3...v0.9.4) (2020-06-08)

**Note:** Version bump only for package merkur-monorepor





## [0.9.3](https://github.com/mjancarik/merkur/compare/v0.9.2...v0.9.3) (2020-06-08)


### Bug Fixes

* 🐛 preact template ([b59294b](https://github.com/mjancarik/merkur/commit/b59294b6936d2f085e92f568e4812f45dbd17e93))
* 🐛 Skeleton template fixes, added widget environment ([d64f35d](https://github.com/mjancarik/merkur/commit/d64f35ddeb3fb855bff1a3281673c53687d1765b))





## [0.9.2](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.2) (2020-06-04)


### Code Refactoring

* 💡 request method is in widget.http ([2619120](https://github.com/mjancarik/merkur/commit/26191201ea66c7bdf6c19d1e395c66625bd48be9))


### Features

* 🎸 added plugin-router ([323d36f](https://github.com/mjancarik/merkur/commit/323d36ff1aefa8c6e86bc3e70e9ea29e5828fcb1))
* 🎸 allow mount method to be async ([1056090](https://github.com/mjancarik/merkur/commit/105609091dbf6519b02c47e90f1937f73370d27b))
* 🎸 export bindWidgetToFunctions from module for plugins ([1b5425f](https://github.com/mjancarik/merkur/commit/1b5425f8c04edc75c50d10b735ee8269e9239023))


### BREAKING CHANGES

* 🧨 yes





## [0.9.1](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.1) (2020-06-04)


### Code Refactoring

* 💡 request method is in widget.http ([2619120](https://github.com/mjancarik/merkur/commit/26191201ea66c7bdf6c19d1e395c66625bd48be9))


### Features

* 🎸 added plugin-router ([323d36f](https://github.com/mjancarik/merkur/commit/323d36ff1aefa8c6e86bc3e70e9ea29e5828fcb1))
* 🎸 allow mount method to be async ([1056090](https://github.com/mjancarik/merkur/commit/105609091dbf6519b02c47e90f1937f73370d27b))
* 🎸 export bindWidgetToFunctions from module for plugins ([1b5425f](https://github.com/mjancarik/merkur/commit/1b5425f8c04edc75c50d10b735ee8269e9239023))


### BREAKING CHANGES

* 🧨 yes





# [0.9.0](https://github.com/mjancarik/merkur/compare/v0.8.1...v0.9.0) (2020-06-04)


### Code Refactoring

* 💡 request method is in widget.http ([2619120](https://github.com/mjancarik/merkur/commit/26191201ea66c7bdf6c19d1e395c66625bd48be9))


### Features

* 🎸 added plugin-router ([323d36f](https://github.com/mjancarik/merkur/commit/323d36ff1aefa8c6e86bc3e70e9ea29e5828fcb1))
* 🎸 allow mount method to be async ([1056090](https://github.com/mjancarik/merkur/commit/105609091dbf6519b02c47e90f1937f73370d27b))
* 🎸 export bindWidgetToFunctions from module for plugins ([1b5425f](https://github.com/mjancarik/merkur/commit/1b5425f8c04edc75c50d10b735ee8269e9239023))


### BREAKING CHANGES

* 🧨 yes





## [0.8.1](https://github.com/mjancarik/merkur/compare/v0.8.0...v0.8.1) (2020-05-20)


### Features

* 🎸 added query and body transformers ([4aaad6c](https://github.com/mjancarik/merkur/commit/4aaad6cda3635457e974b7a301267b43391bec79))





# [0.8.0](https://github.com/mjancarik/merkur/compare/v0.7.1...v0.8.0) (2020-05-15)


### Features

* 🎸 added containerSelector and widgetClassName properties ([d2b9ad2](https://github.com/mjancarik/merkur/commit/d2b9ad23c0dae5cb6eec33ea7dbb505f4f94ecda))


### BREAKING CHANGES

* 🧨 yes





## [0.7.1](https://github.com/mjancarik/merkur/compare/v0.7.0...v0.7.1) (2020-05-14)

**Note:** Version bump only for package merkur-monorepor





# [0.7.0](https://github.com/mjancarik/merkur/compare/v0.6.2...v0.7.0) (2020-05-14)


### Bug Fixes

* 🐛 restart server after changing json, jsx and mjs files ([6f0fb06](https://github.com/mjancarik/merkur/commit/6f0fb06419be184db68e07c792dd0106ea025a80))


### Features

* 🎸 added config module for environment configuration ([2ecacee](https://github.com/mjancarik/merkur/commit/2ecacee5accc59463cf75d218b248603f602db30))
* 🎸 added new http client plugin ([66dbb2e](https://github.com/mjancarik/merkur/commit/66dbb2e7a99ea66143d5713e6bbd0e63cffc83fa))
* 🎸 assign properties name,version,container to merkur ([699ccb2](https://github.com/mjancarik/merkur/commit/699ccb2c94e02d7e997dd793288e764ed2d3bf4c))


### BREAKING CHANGES

* 🧨 yes





## [0.6.2](https://github.com/mjancarik/merkur/compare/v0.6.1...v0.6.2) (2020-05-10)


### Features

* 🎸 added cors middleware ([6d18601](https://github.com/mjancarik/merkur/commit/6d186010274f18bd154649fa78b3ae5dfc8cfe72))
* 🎸 added enzyme testing to react template ([f8c3f84](https://github.com/mjancarik/merkur/commit/f8c3f8411b5b3f384754f1fdcf53a3f80441ca05))
* 🎸 added new module for integration with react ([8455f28](https://github.com/mjancarik/merkur/commit/8455f2826486132c9a5b16cd22f9f0ed94f399ab))
* 🎸 select container through querySelector ([8c6f322](https://github.com/mjancarik/merkur/commit/8c6f322ba59ff61c3ba277cc373c8e330a7917d4))





## [0.6.1](https://github.com/mjancarik/merkur/compare/v0.6.0...v0.6.1) (2020-05-04)


### Bug Fixes

* 🐛 missing babel.config.js file in module for preact ([82bcf54](https://github.com/mjancarik/merkur/commit/82bcf547826aa501f9e156bc138dd11556ca4f51))





# [0.6.0](https://github.com/mjancarik/merkur/compare/v0.5.7...v0.6.0) (2020-05-04)


### Bug Fixes

* 🐛 setDefaultValueForUndefined not modified original object ([3b14160](https://github.com/mjancarik/merkur/commit/3b141601bc3ba00f0aaeb79e312f45797ca6497d))


### Features

* 🎸 liveroload without modifing app.js file ([5c51173](https://github.com/mjancarik/merkur/commit/5c511739efa3edab3981f0fdee17303a311df7db))


### BREAKING CHANGES

* 🧨 yes
* 🧨 yes





## [0.5.7](https://github.com/mjancarik/merkur/compare/v0.5.6...v0.5.7) (2020-05-04)


### Bug Fixes

* 🐛 running integration tests ([50662d6](https://github.com/mjancarik/merkur/commit/50662d649fa1c301ecbdb29ba596cc04662ccbca))





## [0.5.6](https://github.com/mjancarik/merkur/compare/v0.5.5...v0.5.6) (2020-05-02)

**Note:** Version bump only for package merkur-monorepor





## [0.5.5](https://github.com/mjancarik/merkur/compare/v0.5.4...v0.5.5) (2020-05-02)

**Note:** Version bump only for package merkur-monorepor





## [0.5.4](https://github.com/mjancarik/merkur/compare/v0.5.3...v0.5.4) (2020-05-01)

**Note:** Version bump only for package merkur-monorepor





## [0.5.3](https://github.com/mjancarik/merkur/compare/v0.5.2...v0.5.3) (2020-05-01)


### Features

* 🎸 added livereloading for dev ([fde5d8c](https://github.com/mjancarik/merkur/commit/fde5d8c2cae2145a1d0af4efd5177c88b16d4f1d))





## [0.5.2](https://github.com/mjancarik/merkur/compare/v0.5.1...v0.5.2) (2020-04-25)

**Note:** Version bump only for package merkur-monorepor





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

* 🎸 added new @mekur/tools module ([e8ba8ba](https://github.com/mjancarik/merkur/commit/e8ba8baec41366c56456b958cb57afec1bafeb0e))
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


### chore

* 🤖 rename createCustomWidget to createMerkurWidget ([d076f70](https://github.com/mjancarik/merkur/commit/d076f70a8b6abb5010fc7c852e84a31d404109cd))


### Code Refactoring

* 💡 move plugins to alone modules ([8c56557](https://github.com/mjancarik/merkur/commit/8c56557ae92eaa713d083419d3ac293c9d483969))


### Features

* 🎸 change arguments for createMerkur method ([e255c7f](https://github.com/mjancarik/merkur/commit/e255c7f3e5be8adb2869686bc98c4c26209aa5be))
* 🎸 setProps method call load life cycle method ([b349c5d](https://github.com/mjancarik/merkur/commit/b349c5d7eba10e255c7d65fb3dfbde828d053cda))


### BREAKING CHANGES

* 🧨 yes
* 🧨 yes
* 🧨 yes
* 🧨 yes





## [0.3.1](https://github.com/mjancarik/merkur/compare/v0.3.0...v0.3.1) (2020-04-07)


### Bug Fixes

* 🐛 creating widget on client side ([7470462](https://github.com/mjancarik/merkur/commit/7470462d72eb2ce4d1ee77b6c49ea588350bed11))





# [0.3.0](https://github.com/mjancarik/merkur/compare/v0.2.2...v0.3.0) (2020-04-03)


### Features

* 🎸 simplify merkur interface ([e681679](https://github.com/mjancarik/merkur/commit/e6816796e552c6014ca5177879eaa8c28d8cb8ca))





## [0.2.2](https://github.com/mjancarik/merkur/compare/v0.2.1...v0.2.2) (2020-04-02)

**Note:** Version bump only for package merkur-monorepor





## [0.2.1](https://github.com/mjancarik/merkur/compare/v0.2.0...v0.2.1) (2020-03-29)

**Note:** Version bump only for package merkur-monorepor





# [0.2.0](https://github.com/mjancarik/merkur/compare/v0.1.2...v0.2.0) (2020-03-29)


### Features

* 🎸 added eslint and jest configuration ([b7123fa](https://github.com/mjancarik/merkur/commit/b7123fa1b7d5d94a97b3574318769c4937f89c39))





## [0.1.2](https://github.com/mjancarik/merkur/compare/v0.1.1...v0.1.2) (2020-03-27)

**Note:** Version bump only for package merkur-monorepor





## [0.1.1](https://github.com/mjancarik/merkur/compare/v0.1.0...v0.1.1) (2020-03-26)

**Note:** Version bump only for package merkur-monorepor





# 0.1.0 (2020-03-26)


### Bug Fixes

* 🐛 rename create-merkur-app to create-widget ([3c5791d](https://github.com/mjancarik/merkur/commit/3c5791d41e5c25708d8047f52e6f65f457843374))
* 🐛 renamed merkur core module ([b055fef](https://github.com/mjancarik/merkur/commit/b055fef9dc4bcbad5157d6dff1ff01a572d35b7d))


### Features

* 🎸 renamed package and added create-widget ([bde4759](https://github.com/mjancarik/merkur/commit/bde47593457f1ef0b12ce8ce45a4f2347f47aa04))
* **merkur:** added base merkur interface ([7d7f5d8](https://github.com/mjancarik/merkur/commit/7d7f5d8a92baf586ec7ade5a6bc8fc6d96df5e21))



## 0.0.1 (2020-03-03)


### Features

* init commit ([a4247fd](https://github.com/mjancarik/merkur/commit/a4247fdd32a787e167f3dbb79c229478266091d4))
