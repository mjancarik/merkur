<p align="center">
  <a href="https://merkur.js.org/docs/getting-started" title="Getting started">
    <img src="https://raw.githubusercontent.com/mjancarik/merkur/master/images/merkur-illustration.png" width="100px" height="100px" alt="Merkur illustration"/>
  </a>
</p>

# @merkur/preact

Collection of helpers to aid with preact integration to @merkur. It includes:
 - additional webpack config for easier setup of preact for babel and webpack.
 - default entry points for client and server that should fit needs of most of the widgets (custom entry points can still be used as well).
 - factory functions for easier definition and setup of entry points.

While you can use merkur with preact without this package, we strongly suggest to use it, since it removes some abstractions and makes the codebase more approachable for begginners. It also provides some additional features that are not available without it while also making sure the integration is always up to date and working as expected.

You can still customize the webpack config and entry points as you wish, even when using this package.

## Getting started

This package has peer dependencies on `@merkur/core`, `preact` and `@merkur/plugin-component`. Make sure you have them installed in your project.

```bash

```bash
npm i -S @merkur/preact
```

## Usage

### Webpack config

Add following overrides to your webpack config (delete any existing overrides for `babel-loader`):

```js
const {
  applyBabelLoader,
  applyPreactConfig,
} = require('@merkur/preact/webpack');

// ...

module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(
      createWebConfig,
      applyPreactConfig, // <<<<
      applyStyleLoaders,
      applyBabelLoader,  // <<<<
    )(),
    pipe(
      createWebConfig,
      applyPreactConfig, // <<<<
      applyStyleLoaders,
      applyBabelLoader,  // <<<<
      applyES9Transformation,
    )(),
    pipe(
      createNodeConfig,
      applyPreactConfig, // <<<<
      applyStyleLoaders,
      applyBabelLoader,  // <<<<
    )(),
  ]),
);
```

### Default client.js and server.js entry points

Delete your existing `client.js` and `server.js` files, `applyPreactConfig` will use default ones from `@merkur/preact` package.

## Documentation

To check out [live demo](https://merkur.js.org/demo) and [docs](https://merkur.js.org/docs), visit [https://merkur.js.org](https://merkur.js.org).

## Contribution

Contribute to this project via [Pull-Requests](https://github.com/mjancarik/merkur/pulls).

We are following [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/#summary). To simplify the commit process, you can use `npm run commit` command. It opens an interactive interface, which should help you with commit message composition.

Thank you to all the people who already contributed to Merkur!

<a href="https://github.com/mjancarik/merkur/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mjancarik/merkur" />
</a>
