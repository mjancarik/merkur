const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES9Transformation,
  applyStyleLoaders,
  createCacheKey,
  pipe,
} = require('@merkur/tool-webpack');

function applyBabelLoader(config, { isProduction, environment, cache }) {
  config.module.rules.push({
    test: /\.(js|ts|tsx|mjs|jsx)$/,
    exclude: (modulePath) =>
      /node_modules/.test(modulePath) &&
      !/node_modules\/(abort-controller|event-target-shim)/.test(modulePath),
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          [
            '@babel/preset-react',
            {
              runtime: 'automatic',
              importSource: 'preact',
              development: !isProduction,
            },
          ],
        ],
        cacheIdentifier: createCacheKey(
          environment,
          config?.name,
          ...(cache?.versionDependencies ?? [])
        ),
        cacheDirectory: true,
        cacheCompression: false,
        compact: isProduction,
        sourceMaps: !isProduction,
        inputSourceMap: !isProduction,
      },
    },
  });

  return config;
}

module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(createWebConfig, applyStyleLoaders, applyBabelLoader)(),
    pipe(
      createWebConfig,
      applyStyleLoaders,
      applyBabelLoader,
      applyES9Transformation
    )(),
    pipe(createNodeConfig, applyStyleLoaders, applyBabelLoader)(),
  ])
);

module.exports.applyBabelLoader = applyBabelLoader;
