# Change Log

## 1.0.0

### Patch Changes

- 97aec26: Migrate monorepo build and publish tooling from Lerna to NX and Changesets.
  - **What** The internal monorepo toolchain for versioning and publishing all `@merkur/*` packages has been replaced. Lerna is removed; NX is used for task orchestration and Changesets is used for versioning and changelog generation.
  - **Why** Lerna's versioning model was difficult to maintain for independent package releases and offered limited caching. NX provides better incremental build support and task pipelines, while Changesets gives contributors a structured, PR-friendly workflow for describing and grouping version bumps.
  - **How** No changes required for consumers of `@merkur/*` packages — the published API is unaffected. Internal contributors should use `npm run changeset` to record changes and `npm run release` to publish new versions. See the CONTRIBUTING.md for detailed instructions on the new workflow.

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.47.2](https://github.com/mjancarik/merkur/compare/v0.47.1...v0.47.2) (2026-03-19)

**Note:** Version bump only for package @merkur/plugin-validation

## [0.47.1](https://github.com/mjancarik/merkur/compare/v0.47.0...v0.47.1) (2026-03-19)

**Note:** Version bump only for package @merkur/plugin-validation

# [0.47.0](https://github.com/mjancarik/merkur/compare/v0.46.2...v0.47.0) (2026-03-19)

### Bug Fixes

- 🐛 CR comments ([ffbd85f](https://github.com/mjancarik/merkur/commit/ffbd85f1a8f8820d3c35fe2c47e5aa8fddb148f4))
- 🐛 CR comments ([b0b2bca](https://github.com/mjancarik/merkur/commit/b0b2bca0a28980296ebe85bf76e43fca9eb42f62))

### Features

- 🎸 add validation plugin for props schema validation ([095dd2d](https://github.com/mjancarik/merkur/commit/095dd2d79fe59d8925f960c832ec482be466aa6b))
