const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  applyES9Transformation,
  applyStyleLoaders,
  createCacheKey,
  pipe,
} = require('@merkur/tool-webpack');

function applyBabelLoader(config, { isProduction, environment, cache }) {
  config.module.rules.push({
    test: /\.(js|ts|tsx|mjs|jsx)$/,
    exclude: /node_modules|node_modules\/abort-controller/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [
          [
            '@babel/preset-react',
            {
              runtime: 'automatic',
              development: !isProduction,
            },
          ],
        ],
        cacheIdentifier: createCacheKey(
          environment,
          config?.name,
          ...cache?.versionDependencies
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
      applyES5Transformation
    )(),
    pipe(
      createWebConfig,
      applyStyleLoaders,
      applyBabelLoader,
      applyES9Transformation
    )(),
    pipe(createNodeConfig, applyStyleLoaders, applyBabelLoader)(),
  ])
);
