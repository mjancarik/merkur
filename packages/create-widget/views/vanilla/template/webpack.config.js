const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  pipe,
} = require('@merkur/tools/webpack.cjs');

createLiveReloadServer();

module.exports = [
  pipe(createWebConfig)(),
  pipe(createWebConfig, applyES5Transformation)(),
  pipe(createNodeConfig)(),
];
