const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES9Transformation,
  applyStyleLoaders,
  pipe,
} = require('@merkur/tool-webpack');
const {
  applySvelteConfig,
  applySvelteWeb,
  applySvelteNode,
} = require('@merkur/svelte/webpack');

module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(
      createWebConfig,
      applySvelteConfig,
      applyStyleLoaders,
      applySvelteWeb,
    )(),
    pipe(
      createWebConfig,
      applySvelteConfig,
      applyStyleLoaders,
      applySvelteWeb,
      applyES9Transformation,
    )(),
    pipe(
      createNodeConfig,
      applySvelteConfig,
      applyStyleLoaders,
      applySvelteNode,
    )(),
  ]),
);
