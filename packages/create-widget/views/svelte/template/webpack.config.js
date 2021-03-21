const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  pipe,
  webpackMode,
} = require('@merkur/tools/webpack.cjs');

createLiveReloadServer();

function applySvelteWeb(config) {
  config.module.rules.push({
    test: /\.(svelte|html)$/,
    use: {
      loader: 'svelte-loader',
      options: {
        compilerOptions: {
          dev: webpackMode,
          generate: 'dom',
          hydratable: true,
        },
        emitCss: true,
        hotReload: false,
      },
    },
  });

  return config;
}

function applySvelteNode(config) {
  config.module.rules.push({
    test: /\.(svelte|html)$/,
    use: {
      loader: 'svelte-loader',
      options: {
        compilerOptions: {
          css: false,
          generate: 'ssr',
          dev: webpackMode,
          hydratable: true,
        },
      },
    },
  });

  return config;
}

module.exports = Promise.all([
  pipe(createWebConfig, applySvelteWeb)(),
  pipe(createWebConfig, applySvelteWeb, applyES5Transformation)(),
  pipe(createNodeConfig, applySvelteNode)(),
]);
