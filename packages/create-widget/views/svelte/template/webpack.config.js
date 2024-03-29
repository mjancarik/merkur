const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES9Transformation,
  applyStyleLoaders,
  pipe,
  webpackMode,
} = require('@merkur/tool-webpack');

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

module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(createWebConfig, applyStyleLoaders, applySvelteWeb)(),
    pipe(
      createWebConfig,
      applyStyleLoaders,
      applySvelteWeb,
      applyES9Transformation,
    )(),
    pipe(createNodeConfig, applyStyleLoaders, applySvelteNode)(),
  ]),
);
