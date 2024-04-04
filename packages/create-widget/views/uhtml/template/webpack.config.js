const { applyUHtmlConfig } = require('@merkur/uhtml/webpack');
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
    pipe(createWebConfig, applyUHtmlConfig(), applyStyleLoaders)(),
    pipe(
      createWebConfig,
      applyUHtmlConfig(),
      applyStyleLoaders,
      applyES9Transformation,
    )(),
    pipe(createNodeConfig, applyUHtmlConfig(), applyStyleLoaders)(),
  ]),
);
