# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.39.0](https://github.com/mjancarik/merkur/compare/v0.38.2...v0.39.0) (2025-10-27)

**Note:** Version bump only for package @merkur/integration-custom-element

# [0.38.0](https://github.com/mjancarik/merkur/compare/v0.37.12...v0.38.0) (2025-07-12)

### Bug Fixes

- 🐛 don't mutate original object for props ([2b08271](https://github.com/mjancarik/merkur/commit/2b08271b67e6dee2b8a1847d6ababc61357eadc1))
- allow dynamic key in props ([6b321d6](https://github.com/mjancarik/merkur/commit/6b321d640fd676e60248eeed58f8eb35da2a780e))

### Features

- 🎸 auto convert attribute name to camelCase and add parser ([aff53c1](https://github.com/mjancarik/merkur/commit/aff53c121965ab9af7df4c2ffabf786d9b9677b9))
- 🎸 custom element attributes are propagated as widget prop ([01ee0b3](https://github.com/mjancarik/merkur/commit/01ee0b3ae661daba5ffc2f77db0879eee59fc21b))
- 🎸 plugin-component is optional for custom-element ([741d421](https://github.com/mjancarik/merkur/commit/741d421527b96545acfb4015f26bbf8ada9646f4))

### BREAKING CHANGES

- 🧨 We changing default behaviour which current do nothing but was possible
  implemented it with callbacks. We repeated code with propagating custom
  element attributes to widget.props in several widgets. So propagating is
  now default and it looks that is usefull.

## [0.37.11](https://github.com/mjancarik/merkur/compare/v0.37.10...v0.37.11) (2025-04-29)

**Note:** Version bump only for package @merkur/integration-custom-element

## [0.37.2](https://github.com/mjancarik/merkur/compare/v0.37.1...v0.37.2) (2024-11-15)

### Bug Fixes

- 🐛 lifecycle callbacks are called after creating widget ([45b4c21](https://github.com/mjancarik/merkur/commit/45b4c211591bf393c90e67b873a4eeed23e47d91))

# [0.37.0](https://github.com/mjancarik/merkur/compare/v0.36.5...v0.37.0) (2024-11-12)

### Bug Fixes

- 🐛 custom element caveats ([2c06691](https://github.com/mjancarik/merkur/commit/2c0669151fc6fe0a809e8f3af4606cb0c689114c))

### Code Refactoring

- 💡 cli option runTask is replaced with runTasks ([f2b872d](https://github.com/mjancarik/merkur/commit/f2b872da700876bcc0df92a667e735a0f8509b05))

### BREAKING CHANGES

- 🧨 CLI option runTask is replaced with runTasks.

## [0.36.4](https://github.com/mjancarik/merkur/compare/v0.36.3...v0.36.4) (2024-07-26)

### Bug Fixes

- 🐛 security improvements ([42212a5](https://github.com/mjancarik/merkur/commit/42212a5dccda7d55ae7c8cff827817d0173a08f3))

## [0.36.3](https://github.com/mjancarik/merkur/compare/v0.36.2...v0.36.3) (2024-06-02)

### Features

- 🎸 add css bundle support to custom element ([753915d](https://github.com/mjancarik/merkur/commit/753915dc90006326dd4d585bcc9e76097fa3ded3))

## [0.36.2](https://github.com/mjancarik/merkur/compare/v0.36.1...v0.36.2) (2024-05-28)

### Features

- 🎸 turn off HMR for custom element ([5340b95](https://github.com/mjancarik/merkur/commit/5340b958792bb392205d3909385aa9da1cbcfe32))

## [0.36.1](https://github.com/mjancarik/merkur/compare/v0.36.0...v0.36.1) (2024-05-23)

### Bug Fixes

- 🐛 auto appendChild works only for not defined remount ([a4a761a](https://github.com/mjancarik/merkur/commit/a4a761a3f8a53b9a52a73c1d103923ddc26e0fac))

# [0.36.0](https://github.com/mjancarik/merkur/compare/v0.35.13...v0.36.0) (2024-05-21)

### Features

- 🎸 better support for new @merkur/{framework} ([e197b95](https://github.com/mjancarik/merkur/commit/e197b95129345315b7823b0aa94830b5100c0c06))

## [0.35.13](https://github.com/mjancarik/merkur/compare/v0.35.12...v0.35.13) (2024-05-10)

### Features

- 🎸 allow async getSingleton function ([9f5401a](https://github.com/mjancarik/merkur/commit/9f5401a5b0e79b18a1a8d335b085c03382cdd5de))

## [0.35.12](https://github.com/mjancarik/merkur/compare/v0.35.11...v0.35.12) (2024-05-08)

### Bug Fixes

- 🐛 all callbacks are optional ([52e7b99](https://github.com/mjancarik/merkur/commit/52e7b99d46974632a716c8897fd425a06893022d))

## [0.35.11](https://github.com/mjancarik/merkur/compare/v0.35.10...v0.35.11) (2024-05-08)

### Features

- 🎸 add getSingleton method to callbacks ([3b33e89](https://github.com/mjancarik/merkur/commit/3b33e898cdb542fdc7c11e5062c5ec2131110b16))

## [0.35.10](https://github.com/mjancarik/merkur/compare/v0.35.9...v0.35.10) (2024-05-08)

### Bug Fixes

- 🐛 clone registerCustomElement options ([c8c30cb](https://github.com/mjancarik/merkur/commit/c8c30cb7e5e1bcd206fb9011bb117239404cc72a))

## [0.35.9](https://github.com/mjancarik/merkur/compare/v0.35.8...v0.35.9) (2024-05-08)

### Features

- 🎸 clear build folder before dev and build commands ([6add7e3](https://github.com/mjancarik/merkur/commit/6add7e35350d135e81000780157ffba38673599b))

## [0.35.7](https://github.com/mjancarik/merkur/compare/v0.35.6...v0.35.7) (2024-05-02)

### Bug Fixes

- 🐛 filter only node task ([82a9b3b](https://github.com/mjancarik/merkur/commit/82a9b3b0c5fedf9c1e053c3ebd2ed136578068ea))

## [0.35.4](https://github.com/mjancarik/merkur/compare/v0.35.3...v0.35.4) (2024-04-23)

### Features

- 🎸 add playgroud.widgetParams function to merkur ([a0a0e9c](https://github.com/mjancarik/merkur/commit/a0a0e9cb3b5439d8162635c3855eb033568d433e))

## [0.35.3](https://github.com/mjancarik/merkur/compare/v0.35.2...v0.35.3) (2024-04-14)

**Note:** Version bump only for package @merkur/integration-custom-element

# [0.35.0](https://github.com/mjancarik/merkur/compare/v0.34.6...v0.35.0) (2024-04-09)

**Note:** Version bump only for package @merkur/integration-custom-element

## [0.34.6](https://github.com/mjancarik/merkur/compare/v0.34.5...v0.34.6) (2024-02-16)

### Features

- 🎸 add support for client config and assets ([66f3a23](https://github.com/mjancarik/merkur/commit/66f3a2337b530a6f60a59814e908fecc364099b2))

## [0.34.5](https://github.com/mjancarik/merkur/compare/v0.34.4...v0.34.5) (2024-02-04)

### Features

- 🎸 new integration-custom-element ([209dc88](https://github.com/mjancarik/merkur/commit/209dc882e88b92bfd029df3f74282bbc15b3bd65))
