---
'@merkur/cli': major
'@merkur/core': major
'@merkur/create-widget': major
'@merkur/integration': major
'@merkur/integration-custom-element': major
'@merkur/integration-react': major
'@merkur/plugin-component': major
'@merkur/plugin-css-scrambler': major
'@merkur/plugin-error': major
'@merkur/plugin-event-emitter': major
'@merkur/plugin-graphql-client': major
'@merkur/plugin-http-cache': major
'@merkur/plugin-http-client': major
'@merkur/plugin-router': major
'@merkur/plugin-select-preact': major
'@merkur/plugin-session-storage': major
'@merkur/plugin-validation': major
'@merkur/preact': major
'@merkur/svelte': major
'@merkur/tool-storybook': major
'@merkur/tool-webpack': major
'@merkur/tools': major
'@merkur/uhtml': major
---

Standardize dependency ownership and compatibility across all Merkur packages.

- **What** Bound internal `@merkur/*` peers to their supported majors and align the linked packages on version 3. Consumer-owned runtimes are now explicit peers with local development copies: `preact` 10 for `@merkur/preact` and `@merkur/plugin-select-preact`, Svelte 3 for `@merkur/svelte`, and GraphQL 16 for `@merkur/plugin-graphql-client`. Optional CLI, PostCSS, and webpack integrations are marked as optional peers, while required peers are mirrored for isolated package builds. Add direct declarations for `webpack` and `@merkur/tools` in `@merkur/tool-webpack`, `identity-obj-proxy` in `@merkur/tools`, `@types/express` in `@merkur/cli`, and the framework, webpack, lint, and test packages used by generated widgets. Remove unused dependencies and peers, centralize shared Rollup dependencies, relax reusable tooling pins, refresh compatible versions and lockfiles, and synchronize the website's Docusaurus packages. Upgrade Nx to `22.7.8` and add a scoped `nx > brace-expansion` override to `5.0.9`. `@merkur/uhtml` retains `ucontent` for server rendering.
- **Why** Unbounded peer ranges accepted incompatible majors, package-owned framework copies could create duplicate singleton instances, and several published tools and generated-project commands resolved undeclared packages only through workspace hoisting. Explicit ownership makes package and generated-widget installs reproducible without changing runtime implementations. Nx `22.7.8` pins vulnerable `brace-expansion@5.0.8`; the scoped override selects patched `5.0.9` without changing unrelated dependency trees.
- **How** Upgrade the complete `@merkur/*` package set together to version 3. Consumers of `@merkur/preact` or `@merkur/plugin-select-preact` must install Preact 10, consumers of `@merkur/svelte` must install Svelte `^3.59.2`, and consumers of `@merkur/plugin-graphql-client` must install GraphQL 16. Install `@merkur/cli`, `@merkur/tool-webpack`, PostCSS, or `postcss-loader` only when using the corresponding optional integration; newly generated widgets already declare their required dependencies. The Nx override is internal build tooling and requires no consumer action; remove it after a stable Nx release depends on `brace-expansion@5.0.9` or newer.
