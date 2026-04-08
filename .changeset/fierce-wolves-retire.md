---
"@merkur/preact": major
---

Remove the `@merkur/preact/webpack` export and its associated peer dependencies.

- **What** The `@merkur/preact/webpack` subpath export and its two helpers, `applyBabelLoader` and `applyPreactConfig`, have been deleted. The peer dependencies `@merkur/tool-webpack`, `babel-loader`, and `@babel/preset-react` are no longer declared or required by this package.
- **Why** Webpack-based tooling was superseded by the Vite/esbuild pipeline. Maintaining a parallel Webpack integration added complexity and prevented simplifying the package's dependency surface. Removing it reduces install size and eliminates the need to keep Babel peer deps in sync.
- **How** Remove any import of `applyBabelLoader` or `applyPreactConfig` from `@merkur/preact/webpack`. If you still need webpack, configure the Preact Babel preset manually in your `webpack.config.js` using `babel-loader` with `@babel/preset-react` set to `runtime: 'automatic'` and `importSource: 'preact'`. Alternatively, migrate to the Vite-based Storybook setup provided by `@merkur/tool-storybook`, which requires no webpack or Babel configuration. Remove `@merkur/tool-webpack`, `babel-loader`, and `@babel/preset-react` from your project's dependencies if they were pulled in solely for this integration.
