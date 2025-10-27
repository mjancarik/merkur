# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.39.0](https://github.com/mjancarik/merkur/compare/v0.38.2...v0.39.0) (2025-10-27)

### Bug Fixes

- 🐛 Fix HMR when the task's build.write is true ([b0907a2](https://github.com/mjancarik/merkur/commit/b0907a2dab04d0fc1018ecbb9283f726c5a0e396))

### Features

- 🎸 Added support for loading 'module' assets ([6e985ce](https://github.com/mjancarik/merkur/commit/6e985ce86f148be12ee96ba41cc2115600ebc207))
- 🎸 allow HMR in integratied application ([6465454](https://github.com/mjancarik/merkur/commit/64654541c4708f9c239a1b5575d1df685cd3a3b6))

### BREAKING CHANGES

- 🧨 REMOVE @merkur/tools dependencies from @merkur/cli. All assets
  integrated by merkur have always `data-merkur-asset-name` attribute.

## [0.38.1](https://github.com/mjancarik/merkur/compare/v0.38.0...v0.38.1) (2025-07-24)

### Bug Fixes

- 🐛 Force es build NOT TO shorthand css rules into inset rul ([9f4cbbe](https://github.com/mjancarik/merkur/commit/9f4cbbe3ed592aadbbc2db8f1b4657bb9f3d9db3))

# [0.38.0](https://github.com/mjancarik/merkur/compare/v0.37.12...v0.38.0) (2025-07-12)

### chore

- 🤖 update dependencies ([eb593bc](https://github.com/mjancarik/merkur/commit/eb593bc2975bc6502c866bb6ddddb0d6edef812c))

### BREAKING CHANGES

- 🧨 Update production dependencies

## [0.37.12](https://github.com/mjancarik/merkur/compare/v0.37.11...v0.37.12) (2025-05-14)

### Bug Fixes

- 🐛 error only URLs with a scheme in: file and data for esm ([1ba3ac1](https://github.com/mjancarik/merkur/commit/1ba3ac17fbc777eb8f8c476c8818c01a6ef0a5f7))

### Features

- 🎸 custom commands definition in cli ([#217](https://github.com/mjancarik/merkur/issues/217)) ([f784813](https://github.com/mjancarik/merkur/commit/f784813b6fbf17e2ccf4ad55cfd920d6f06bcc9b)), closes [#cnsqa-1767](https://github.com/mjancarik/merkur/issues/cnsqa-1767) [#cnsqa-1767](https://github.com/mjancarik/merkur/issues/cnsqa-1767) [#cnsqa-1767](https://github.com/mjancarik/merkur/issues/cnsqa-1767) [#cnsqa-1767](https://github.com/mjancarik/merkur/issues/cnsqa-1767) [#cnsqa-1767](https://github.com/mjancarik/merkur/issues/cnsqa-1767) [#cnsqa-1767](https://github.com/mjancarik/merkur/issues/cnsqa-1767) [#cnsqa-1767](https://github.com/mjancarik/merkur/issues/cnsqa-1767)

## [0.37.10](https://github.com/mjancarik/merkur/compare/v0.37.9...v0.37.10) (2025-04-27)

### Features

- 🎸 start command is configurable by cli config for servers ([469980b](https://github.com/mjancarik/merkur/commit/469980ba198cafd57dc338fc79b24555a45af488))

## [0.37.8](https://github.com/mjancarik/merkur/compare/v0.37.7...v0.37.8) (2025-04-23)

### Bug Fixes

- 🐛 widgetHandler use final merkurConfig ([#224](https://github.com/mjancarik/merkur/issues/224)) ([6136dd8](https://github.com/mjancarik/merkur/commit/6136dd8bb4503b2637a84f3814a22704d6b3ce1c))

### Features

- 🎸 Added new `templateFolders` for ejs template dirs ([ade306d](https://github.com/mjancarik/merkur/commit/ade306d7882f25082c632221e4eb44592965759d))

## [0.37.6](https://github.com/mjancarik/merkur/compare/v0.37.5...v0.37.6) (2025-03-14)

### Bug Fixes

- 🐛 devServer propagete status code from error ([71ef8d6](https://github.com/mjancarik/merkur/commit/71ef8d6b7e0bf162ab42729ae00e908589c2a508))

## [0.37.5](https://github.com/mjancarik/merkur/compare/v0.37.4...v0.37.5) (2025-03-03)

### Features

- 🎸 added gzip meta information to build command ([3e470e2](https://github.com/mjancarik/merkur/commit/3e470e2b8499ad7344f299d47144403e5c0f807a))

## [0.37.4](https://github.com/mjancarik/merkur/compare/v0.37.3...v0.37.4) (2025-01-24)

### Features

- 🎸 added possibility for presets return extending hooks ([94215d7](https://github.com/mjancarik/merkur/commit/94215d7f68b22ac6068e5b5d3c47aa6cc470ab36))

## [0.37.3](https://github.com/mjancarik/merkur/compare/v0.37.2...v0.37.3) (2024-11-18)

### Bug Fixes

- 🐛 exclude only js files (keep \*.less and others) ([efa24c4](https://github.com/mjancarik/merkur/commit/efa24c4fcbed90ba865412c00bf7b9410c10d164))

## [0.37.1](https://github.com/mjancarik/merkur/compare/v0.37.0...v0.37.1) (2024-11-14)

### Bug Fixes

- 🐛 add better error message for undefined Merkur ([a2095c3](https://github.com/mjancarik/merkur/commit/a2095c3613d63904c43af48fbe06160d6c82c1e9))
- 🐛 add better error message for undefined Merkur ([48407e0](https://github.com/mjancarik/merkur/commit/48407e0f1c838c6b70b376011b8abfb9ddf28720))
- 🐛 attach devClientHook only if entry point exists ([0152316](https://github.com/mjancarik/merkur/commit/0152316a614ee9feec3c33c53b3f187bfa386da3))
- 🐛 definition of custom tasks ([de74901](https://github.com/mjancarik/merkur/commit/de74901fa9140c14b9d86043e8ed49489038484b))

# [0.37.0](https://github.com/mjancarik/merkur/compare/v0.36.5...v0.37.0) (2024-11-12)

### Bug Fixes

- 🐛 create folder structure for copied file ([a345b06](https://github.com/mjancarik/merkur/commit/a345b065cfc9c81a6b1bf317930afa4995b2dac2))
- 🐛 HMR works only for memory mode ([d8baf8e](https://github.com/mjancarik/merkur/commit/d8baf8ea118260f5248c9333cc4ec883225e5b5a))
- 🐛 Merkur CLI show options for --help argument ([ec156f1](https://github.com/mjancarik/merkur/commit/ec156f1c60ffabda31add7daf421808d479fa99b))
- 🐛 playground template for defined containerSelector ([60427ac](https://github.com/mjancarik/merkur/commit/60427acbdf3758a028bdbf64231e458032954987))
- 🐛 resolve path for projectFoler and cliFolder ([bf61497](https://github.com/mjancarik/merkur/commit/bf6149709df01bd77ee3d4dd5415cfed25eed338))

### Code Refactoring

- 💡 cli option runTask is replaced with runTasks ([f2b872d](https://github.com/mjancarik/merkur/commit/f2b872da700876bcc0df92a667e735a0f8509b05))

### Features

- 🎸 add @/_ alias for ./src/_ ([98fae2b](https://github.com/mjancarik/merkur/commit/98fae2bfe83fb0a08743b0f7b4417fe8c770faf8))
- 🎸 add cors options to widgetServer configuration ([70e4d4a](https://github.com/mjancarik/merkur/commit/70e4d4a88238bbb33d8aac36110455011ca9b73c))
- 🎸 add new --analyze CLI flags for build task ([16e9ec4](https://github.com/mjancarik/merkur/commit/16e9ec48ad373e422c84ccf72edac246ee12c8bc))
- 🎸 add new custom command for extendability ([a8990d4](https://github.com/mjancarik/merkur/commit/a8990d4f59d84025024b3c407cff8581f535d404))
- 🎸 allow define containerSelector for slot from widget API ([dfeb3b0](https://github.com/mjancarik/merkur/commit/dfeb3b09da3cbbfe88e8ee1448f4f932304134ca))
- 🎸 dev servers listen on ipv4 and ipv6 ([6408c24](https://github.com/mjancarik/merkur/commit/6408c246ebaf679e37352d55847d6db3b0dc684a))
- 🎸 sourcemap exclude vendors and auto turn on only for dev ([f0e8cd1](https://github.com/mjancarik/merkur/commit/f0e8cd1c81dd1cc8d6a11c11240911354f908639))
- 🎸 support for other tasks with different entries ([ef462f8](https://github.com/mjancarik/merkur/commit/ef462f868eaf845174d03b3d41cd466d9e09a77f))
- 🎸 support for other tasks with different entries ([6aabcf8](https://github.com/mjancarik/merkur/commit/6aabcf8ad90738878981c3ed36022cf564df437c))
- 🎸 update body.ejs and footer.ejs template ([acca4ef](https://github.com/mjancarik/merkur/commit/acca4efd2c1a1b72dfc325bbecf09ba348c3e94f))

### BREAKING CHANGES

- 🧨 The JS part of playground was moved from body.ejs to footer.ejs
  template.
- 🧨 CLI option runTask is replaced with runTasks.

## [0.36.4](https://github.com/mjancarik/merkur/compare/v0.36.3...v0.36.4) (2024-07-26)

### Bug Fixes

- 🐛 security improvements ([42212a5](https://github.com/mjancarik/merkur/commit/42212a5dccda7d55ae7c8cff827817d0173a08f3))

## [0.36.3](https://github.com/mjancarik/merkur/compare/v0.36.2...v0.36.3) (2024-06-02)

### Features

- 🎸 add css bundle support to custom element ([753915d](https://github.com/mjancarik/merkur/commit/753915dc90006326dd4d585bcc9e76097fa3ded3))

## [0.36.2](https://github.com/mjancarik/merkur/compare/v0.36.1...v0.36.2) (2024-05-28)

### Bug Fixes

- 🐛 creating merkur widget in playground ([6b639ed](https://github.com/mjancarik/merkur/commit/6b639ed15ab2eac04a7acbbc9c893896845c5244))

# [0.36.0](https://github.com/mjancarik/merkur/compare/v0.35.13...v0.36.0) (2024-05-21)

### Bug Fixes

- 🐛 devPlugin is only supported for dev command ([1f058ae](https://github.com/mjancarik/merkur/commit/1f058ae9f9c6fc1821e9d93168561de9aa4304bc))

## [0.35.9](https://github.com/mjancarik/merkur/compare/v0.35.8...v0.35.9) (2024-05-08)

### Features

- 🎸 clear build folder before dev and build commands ([6add7e3](https://github.com/mjancarik/merkur/commit/6add7e35350d135e81000780157ffba38673599b))

## [0.35.8](https://github.com/mjancarik/merkur/compare/v0.35.7...v0.35.8) (2024-05-03)

### Bug Fixes

- 🐛 allow easy override part playground templates ([cb08339](https://github.com/mjancarik/merkur/commit/cb08339904a3895439a4a316f891f9b0ac31f01c))

## [0.35.7](https://github.com/mjancarik/merkur/compare/v0.35.6...v0.35.7) (2024-05-02)

### Bug Fixes

- 🐛 emit CLI_CONFIG event after loaded merkur.config.mjs ([107f317](https://github.com/mjancarik/merkur/commit/107f3177849a5c7af48313a75abb5b4ac1085840))

### Features

- 🎸 allow override body part in playground template ([2375d4d](https://github.com/mjancarik/merkur/commit/2375d4deb68c5a0b394da9e7159fc2e1a3e9db05))

## [0.35.6](https://github.com/mjancarik/merkur/compare/v0.35.5...v0.35.6) (2024-04-29)

### Bug Fixes

- 🐛 remove node_modules path ([d4dc7d4](https://github.com/mjancarik/merkur/commit/d4dc7d4453fb3f7e490fa1cbf011f95627d9f963))

## [0.35.5](https://github.com/mjancarik/merkur/compare/v0.35.4...v0.35.5) (2024-04-28)

### Bug Fixes

- 🐛 keep types file in published module ([4288098](https://github.com/mjancarik/merkur/commit/4288098344729cecb3052fb5bd45dbfaaf39910b))
- 🐛 support for inlineScript, inline source with writeToDisk ([0141f6e](https://github.com/mjancarik/merkur/commit/0141f6e8dac53aa73f98a5da770f66f2dae81a81))

### Features

- 🎸 add support test command for monorepo ([415a941](https://github.com/mjancarik/merkur/commit/415a94110b35260cba43f01804d13c3b6873e069))

## [0.35.4](https://github.com/mjancarik/merkur/compare/v0.35.3...v0.35.4) (2024-04-23)

### Features

- 🎸 add playgroud.widgetParams function to merkur ([a0a0e9c](https://github.com/mjancarik/merkur/commit/a0a0e9cb3b5439d8162635c3855eb033568d433e))

## [0.35.3](https://github.com/mjancarik/merkur/compare/v0.35.2...v0.35.3) (2024-04-14)

### Bug Fixes

- 🐛 template for inlineStyle assets ([f0fa8d6](https://github.com/mjancarik/merkur/commit/f0fa8d6ac2396d2468ae704eb3f101af1e4e05cc))

### Features

- 🎸 add base cli types ([6ab6983](https://github.com/mjancarik/merkur/commit/6ab6983c96254ed0d36244e62246863a986e1e5e))
- 🎸 playground template allow empty slots ([3863f69](https://github.com/mjancarik/merkur/commit/3863f696f867978cc34f40e43eefb7e74c827eb5))

## [0.35.2](https://github.com/mjancarik/merkur/compare/v0.35.1...v0.35.2) (2024-04-10)

### Bug Fixes

- 🐛 template for empty slots ([71e03ca](https://github.com/mjancarik/merkur/commit/71e03caba7938825293b3aa685fc209ff8e3ed31))

## [0.35.1](https://github.com/mjancarik/merkur/compare/v0.35.0...v0.35.1) (2024-04-09)

### Bug Fixes

- 🐛 dependencies ([4d989db](https://github.com/mjancarik/merkur/commit/4d989db148f5e6897a5ee268f4d2013c288658dc))

# [0.35.0](https://github.com/mjancarik/merkur/compare/v0.34.6...v0.35.0) (2024-04-09)

### Bug Fixes

- 🐛 build in CI ([5f26ec1](https://github.com/mjancarik/merkur/commit/5f26ec1c7ebf7596e57d815f466bb33d614bac40))
- 🐛 empty merkur config extends field ([02fd41a](https://github.com/mjancarik/merkur/commit/02fd41adb12ac76051ebf2ff6b3642c5e34a2de9))
- 🐛 remove watch mode ([b63c145](https://github.com/mjancarik/merkur/commit/b63c145f5c194f4b8bee8b2420e69510ef40821e))
- 🐛 require module ([865f6bc](https://github.com/mjancarik/merkur/commit/865f6bcbf24a09a1e89f436592c69d2233fd27fa))

### Features

- 🎸 change exports to @merkur/cli/server ([ae7b9e5](https://github.com/mjancarik/merkur/commit/ae7b9e54110e62a6ae595543ff56d844ef9722c3))
- 🎸 initial commit @merkur/cli ([12e54dc](https://github.com/mjancarik/merkur/commit/12e54dcc440bc83746e58a438ad10ef1ce925f69))
- 🎸 test command return corrrect exit code ([b3cf4c7](https://github.com/mjancarik/merkur/commit/b3cf4c7c60307d096322c5830d4a5d9493b5495f))
