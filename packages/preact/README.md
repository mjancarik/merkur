# @merkur/preact

[![Build Status](https://github.com/mjancarik/merkur/workflows/CI/badge.svg)](https://github.com/mjancarik/merkur/actions/workflows/ci.yml)
[![NPM package version](https://img.shields.io/npm/v/@merkur/preact/latest.svg)](https://www.npmjs.com/package/@merkur/preact)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@merkur/preact/latest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

Preact integration helpers for [Merkur](https://merkur.js.org/) widgets. Provides client and server entry points, rendering helpers, and CLI scaffolding support for Preact-based Merkur widgets.

## Installation

```bash
npm install @merkur/preact
```

Peer dependencies required:

```bash
npm install @merkur/core @merkur/plugin-component
```

## Exports

| Export | Description |
|--------|-------------|
| `@merkur/preact/client` | Client-side Preact rendering helpers |
| `@merkur/preact/server` | Server-side rendering helpers (uses `preact-render-to-string`) |
| `@merkur/preact/entries/client.js` | Preact client widget entry point |
| `@merkur/preact/entries/server.js` | Preact server widget entry point |
| `@merkur/preact/cli` | CLI helpers for widget scaffolding |

## Documentation

Full documentation and setup guide at [merkur.js.org](https://merkur.js.org/docs/getting-started).

## Breaking Changes

### v0.47.0

The `@merkur/preact/webpack` export (`applyBabelLoader`, `applyPreactConfig`) has been **removed**, along with the `@babel/preset-react`, `@merkur/tool-webpack`, and `babel-loader` peer dependencies.

If your webpack config used these helpers, configure the Preact Babel preset manually:

```javascript
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx|jsx|mjs)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-react',
                { runtime: 'automatic', importSource: 'preact' },
              ],
            ],
          },
        },
      },
    ],
  },
};
```

Alternatively, migrate to the Vite-based Storybook setup described in the [Storybook integration guide](https://merkur.js.org/docs/storybook-integration-into-merkur), which no longer requires webpack or Babel configuration.

## Contribution

Contribute via [Pull-Requests](https://github.com/mjancarik/merkur/pulls).

We use [Changesets](https://github.com/changesets/changesets) for versioning. Run `npm run changeset` from the monorepo root to add a changeset for your changes.
