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

**Note:** Version bump only for package @merkur/svelte

## [0.47.1](https://github.com/mjancarik/merkur/compare/v0.47.0...v0.47.1) (2026-03-19)

**Note:** Version bump only for package @merkur/svelte

# [0.47.0](https://github.com/mjancarik/merkur/compare/v0.46.2...v0.47.0) (2026-03-19)

**Note:** Version bump only for package @merkur/svelte

# [0.46.0](https://github.com/mjancarik/merkur/compare/v0.45.2...v0.46.0) (2026-03-04)

**Note:** Version bump only for package @merkur/svelte

# [0.45.0](https://github.com/mjancarik/merkur/compare/v0.44.1...v0.45.0) (2026-02-01)

**Note:** Version bump only for package @merkur/svelte

# [0.44.0](https://github.com/mjancarik/merkur/compare/v0.43.1...v0.44.0) (2025-12-17)

**Note:** Version bump only for package @merkur/svelte

# [0.43.0](https://github.com/mjancarik/merkur/compare/v0.42.0...v0.43.0) (2025-12-05)

**Note:** Version bump only for package @merkur/svelte

# [0.42.0](https://github.com/mjancarik/merkur/compare/v0.41.1...v0.42.0) (2025-11-28)

**Note:** Version bump only for package @merkur/svelte

# [0.41.0](https://github.com/mjancarik/merkur/compare/v0.40.0...v0.41.0) (2025-11-04)

**Note:** Version bump only for package @merkur/svelte

# [0.40.0](https://github.com/mjancarik/merkur/compare/v0.39.0...v0.40.0) (2025-10-27)

**Note:** Version bump only for package @merkur/svelte

# [0.39.0](https://github.com/mjancarik/merkur/compare/v0.38.2...v0.39.0) (2025-10-27)

**Note:** Version bump only for package @merkur/svelte

# [0.38.0](https://github.com/mjancarik/merkur/compare/v0.37.12...v0.38.0) (2025-07-12)

**Note:** Version bump only for package @merkur/svelte

# [0.37.0](https://github.com/mjancarik/merkur/compare/v0.36.5...v0.37.0) (2024-11-12)

### Features

- 🎸 allow define containerSelector for slot from widget API ([dfeb3b0](https://github.com/mjancarik/merkur/commit/dfeb3b09da3cbbfe88e8ee1448f4f932304134ca))

# [0.36.0](https://github.com/mjancarik/merkur/compare/v0.35.13...v0.36.0) (2024-05-21)

**Note:** Version bump only for package @merkur/svelte

# [0.35.0](https://github.com/mjancarik/merkur/compare/v0.34.6...v0.35.0) (2024-04-09)

### Bug Fixes

- 🐛 Type fxies ([848c468](https://github.com/mjancarik/merkur/commit/848c46806b3260a10f9f31385793184a75c6c772))

### Features

- 🎸 add svelte esbuild configuration ([6706746](https://github.com/mjancarik/merkur/commit/6706746c12ec5d8652def6c9735e8132bbcead5d))
- 🎸 Added svelte package ([f55463f](https://github.com/mjancarik/merkur/commit/f55463fdc7e8cec173e358d056f7d35c78d65d5c))
