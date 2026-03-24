---
"@merkur/integration-custom-element": patch
"@merkur/plugin-session-storage": patch
"@merkur/plugin-graphql-client": patch
"@merkur/plugin-css-scrambler": patch
"@merkur/plugin-event-emitter": patch
"@merkur/plugin-select-preact": patch
"@merkur/plugin-http-client": patch
"@merkur/integration-react": patch
"@merkur/plugin-http-cache": patch
"@merkur/plugin-component": patch
"@merkur/tool-storybook": patch
"@merkur/create-widget": patch
"@merkur/plugin-router": patch
"@merkur/plugin-validation": patch
"@merkur/plugin-error": patch
"@merkur/tool-webpack": patch
"@merkur/integration": patch
"@merkur/preact": patch
"@merkur/svelte": patch
"@merkur/tools": patch
"@merkur/uhtml": patch
"@merkur/core": patch
"@merkur/cli": patch
---

Migrate monorepo build and publish tooling from Lerna to NX and Changesets.

- **What** The internal monorepo toolchain for versioning and publishing all `@merkur/*` packages has been replaced. Lerna is removed; NX is used for task orchestration and Changesets is used for versioning and changelog generation.
- **Why** Lerna's versioning model was difficult to maintain for independent package releases and offered limited caching. NX provides better incremental build support and task pipelines, while Changesets gives contributors a structured, PR-friendly workflow for describing and grouping version bumps.
- **How** No changes required for consumers of `@merkur/*` packages — the published API is unaffected. Internal contributors should use `npm run changeset` to record changes and `npm run release` to publish new versions. See the CONTRIBUTING.md for detailed instructions on the new workflow.
