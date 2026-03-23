---
"@merkur/preact": major
---

Remove the `./webpack` subpath export and its associated peer dependencies.

- **What** The `@merkur/preact/webpack` subpath export has been deleted. The peer dependencies `@merkur/tool-webpack`, `babel-loader`, and `@babel/preset-react` are no longer declared or required by this package.
- **Why** Webpack-based tooling was superseded by the Vite/esbuild pipeline. Maintaining a parallel Webpack integration added complexity and prevented simplifying the package's dependency surface. Removing it reduces install size and eliminates the need to keep Babel peer deps in sync.
- **How** Replace any import from `@merkur/preact/webpack` with the Vite/Storybook-based equivalent provided by `@merkur/tool-storybook`. Remove `@merkur/tool-webpack`, `babel-loader`, and `@babel/preset-react` from your project's dependencies if they were pulled in solely for Merkur's Webpack integration.
