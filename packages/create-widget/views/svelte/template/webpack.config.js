const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  applyES9Transformation,
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
    pipe(createWebConfig, applySvelteWeb)(),
    pipe(createWebConfig, applySvelteWeb, applyES5Transformation)(),
    pipe(createWebConfig, applySvelteWeb, applyES9Transformation)(),
    pipe(createNodeConfig, applySvelteNode)(),
  ])
);
