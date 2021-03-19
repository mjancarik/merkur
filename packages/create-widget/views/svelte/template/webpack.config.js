const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  pipe,
} = require('@merkur/tools/webpack.cjs');

createLiveReloadServer();

function applySvelteWeb(config) {
  config.module.rules.push({
    test: /\.(svelte|html)$/,
    use: {
      loader: 'svelte-loader',
      options: {
        compilerOptions: {
          dev: true,
          generate: 'dom',
          hydratable: true,
          emitCss: true,
        },
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
          dev: true,
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
