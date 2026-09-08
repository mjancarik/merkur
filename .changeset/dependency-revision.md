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

- **What** Bound internal `@merkur/*` peers to their supported majors and align the linked packages on version 3; `@merkur/plugin-graphql-client` and `@merkur/plugin-http-cache` accept `@merkur/plugin-http-client` `^2.0.0 || ^3.0.0`, and `@merkur/integration` moves from a dependency to a peer of `@merkur/integration-react`. Consumer-owned runtimes are now explicit peers with local development copies: `preact` 10 for `@merkur/preact` and `@merkur/plugin-select-preact`, Svelte 3 for `@merkur/svelte`, GraphQL 16 for `@merkur/plugin-graphql-client`, React 16 to 19 for `@merkur/integration-react`, `webpack` `^5.75.0` plus `@merkur/tools` for `@merkur/tool-webpack`, and `eslint` 8 plus `jest` 29 for `@merkur/tools`. Optional CLI, PostCSS, and webpack integrations are marked as optional peers, while required peers are mirrored in `devDependencies` for isolated package builds. Add direct declarations for `identity-obj-proxy` in `@merkur/tools`, `@types/express` in `@merkur/cli`, and the framework, lint, and test packages used by generated widgets. Keep webpack dependencies out of the default esbuild-based Svelte and uhtml scaffolds. Preserve Reselect 4, the existing selector declarations and test command, and the supported major versions of the webpack compression and CSS-minification plugins. Remove unused dependencies and peers including `@babel/eslint-parser`, `eslint-config-last`, `to-mock`, and `coveralls`, centralize shared Rollup dependencies, relax reusable tooling pins, refresh compatible versions and lockfiles, and synchronize the website's Docusaurus packages while activating `@docusaurus/faster` through the existing `future.v4: true` setting. Upgrade Nx to `22.7.8` and add a scoped `nx > brace-expansion` override to `5.0.9`. `@merkur/uhtml` retains `ucontent` for server rendering.
- **Why** Unbounded peer ranges accepted incompatible majors, package-owned framework copies could create duplicate singleton instances, and several published tools and generated-project commands resolved undeclared packages only through workspace hoisting. Caret ranges are used for internal peers because Changesets rewrites non-peer ranges by keeping only the leading operator, so a range such as `>=2 <4` would silently lose its upper bound at release time. Explicit ownership makes package and generated-widget installs reproducible without changing runtime implementations. Nx `22.7.8` pins vulnerable `brace-expansion@5.0.8`; the scoped override selects patched `5.0.9` without changing unrelated dependency trees. Two advisories remain unresolved on purpose because no compatible fix exists upstream: the Svelte 3 line carries known SSR cross-site scripting issues that are only fixed in Svelte 5, and `ucontent` pulls in `html-minifier` with an unpatched ReDoS.
- **How** Upgrade the complete `@merkur/*` package set together to version 3. Consumers of `@merkur/preact` or `@merkur/plugin-select-preact` must install Preact 10, consumers of `@merkur/svelte` must install Svelte `^3.59.2`, consumers of `@merkur/plugin-graphql-client` must install GraphQL 16, consumers of `@merkur/integration-react` must install React 16 to 19 and `@merkur/integration`, consumers of `@merkur/tool-webpack` must install `webpack` `^5.75.0` and `@merkur/tools`, and consumers of `@merkur/tools` must install `eslint` 8 and `jest` 29. Install `@merkur/cli`, `@merkur/tool-webpack`, PostCSS, or `postcss-loader` only when using the corresponding optional integration; newly generated widgets already declare their required dependencies. To opt into a legacy webpack configuration in a generated widget, install `@merkur/tool-webpack` and `webpack` as development dependencies; default build and development commands continue to use esbuild. The Nx override is internal build tooling and requires no consumer action; remove it after a stable Nx release depends on `brace-expansion@5.0.9` or newer.
