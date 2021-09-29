const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  applyES9Transformation,
  applyStyleLoaders,
  pipe,
} = require('@merkur/tool-webpack');

module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(createWebConfig, applyStyleLoaders)(),
    pipe(createWebConfig, applyStyleLoaders, applyES5Transformation)(),
    pipe(createWebConfig, applyStyleLoaders, applyES9Transformation)(),
    pipe(createNodeConfig, applyStyleLoaders)(),
  ])
);
