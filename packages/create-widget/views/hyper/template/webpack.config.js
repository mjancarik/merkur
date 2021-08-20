const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  applyES9Transformation,
  pipe,
} = require('@merkur/tools/webpack.cjs');

createLiveReloadServer();

module.exports = Promise.all([
  pipe(createWebConfig)(),
  pipe(createWebConfig, applyES5Transformation)(),
  pipe(createWebConfig, applyES9Transformation)(),
  pipe(createNodeConfig)(),
]);
