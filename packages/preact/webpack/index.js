const { createCacheKey } = require('@merkur/tool-webpack');
const path = require('path');
const fs = require('fs');

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
          ...(cache?.versionDependencies ?? []),
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

function applyPreactConfig(config, { cwd, isServer }) {
  // Check for existence of widget entry points
  if (
    config.entry.widget &&
    fs.existsSync(path.join(cwd, config.entry.widget))
  ) {
    return config;
  }

  // TODO should probably be moved to root config, when all frameworks are supported
  // Set custom aliases to widget entry point
  config.resolve = {
    ...config.resolve,
    alias: {
      '@widget': path.join(cwd, './src/widget.js'),
      ...config.resolve.alias,
    },
  };

  // Add default client/server entries if there are no custom ones
  config.entry.widget = require.resolve(
    `@merkur/preact/entries/${isServer ? 'server' : 'client'}.js`,
  );

  return config;
}

module.exports = {
  applyBabelLoader,
  applyPreactConfig,
};
