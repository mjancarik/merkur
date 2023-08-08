const {
  applyBabelLoader,
  applyPreactConfig,
} = require('@merkur/preact/webpack');
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
    pipe(
      createWebConfig,
      applyPreactConfig,
      applyStyleLoaders,
      applyBabelLoader,
    )(),
    pipe(
      createWebConfig,
      applyPreactConfig,
      applyStyleLoaders,
      applyBabelLoader,
      applyES9Transformation,
    )(),
    pipe(
      createNodeConfig,
      applyPreactConfig,
      applyStyleLoaders,
      applyBabelLoader,
    )(),
  ]),
);

module.exports.applyBabelLoader = applyBabelLoader;
