const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES9Transformation,
  applyStyleLoaders,
  pipe,
} = require('@merkur/tool-webpack');

module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(createWebConfig, applyStyleLoaders)(),
    pipe(createWebConfig, applyStyleLoaders, applyES9Transformation)(),
    pipe(createNodeConfig, applyStyleLoaders)(),
  ])
);
