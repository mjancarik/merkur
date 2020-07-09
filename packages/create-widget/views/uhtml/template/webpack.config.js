const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
} = require('@merkur/tools/webpack.js');

createLiveReloadServer();

module.exports = [
  createWebConfig(),
  applyES5Transformation(createWebConfig()),
  createNodeConfig(),
];
