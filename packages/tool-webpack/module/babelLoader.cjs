const path = require('path');

const { createCacheKey } = require('../webpack/cache.cjs');

function findLoaders(rules = [], loader) {
  let loaders = [];

  for (let rule of rules) {
    if (!Array.isArray(rule.use)) {
      if (rule?.use?.loader === loader) {
        loaders.push(rule.use);
      }
    } else {
      rule.use.forEach((use) => {
        if (use?.loader === loader) {
          loaders.push(use);
        }
      });
    }
  }

  return loaders;
}

function createESTransformation(
  config,
  { babel, isProduction, nodeModulesDir, environment },
  esVersion
) {
  config = {
    ...config,
    name: `web-${esVersion}`,
    entry: {
      ...config.entry,
      polyfill: `./src/polyfill.${esVersion}.js`,
    },
    resolve: {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        ...{
          '@merkur/core': path.join(
            nodeModulesDir,
            `@merkur/core/lib/index.${esVersion}.mjs`
          ),
          '@merkur/plugin-component': path.join(
            nodeModulesDir,
            `@merkur/plugin-component/lib/index.${esVersion}.mjs`
          ),
          '@merkur/plugin-event-emitter': path.join(
            nodeModulesDir,
            `@merkur/plugin-event-emitter/lib/index.${esVersion}.mjs`
          ),
          '@merkur/plugin-http-client': path.join(
            nodeModulesDir,
            `@merkur/plugin-http-client/lib/index.${esVersion}.mjs`
          ),
          '@merkur/plugin-error': path.join(
            nodeModulesDir,
            `@merkur/plugin-error/lib/index.${esVersion}.mjs`
          ),
          '@merkur/plugin-router': path.join(
            nodeModulesDir,
            `@merkur/plugin-router/lib/index.${esVersion}.mjs`
          ),
          '@merkur/plugin-css-scrambler': path.join(
            nodeModulesDir,
            `@merkur/plugin-router/lib/index.${esVersion}.mjs`
          ),
        },
      },
    },
    output: {
      ...config.output,
      path: path.join(config.output.path, `../${esVersion}/`),
    },
  };

  const babelLoaders = findLoaders(config.module.rules, 'babel-loader');
  const babelPresetEnv = [
    '@babel/preset-env',
    {
      ...(esVersion === 'es9'
        ? {
            targets: {
              node: '12',
            },
          }
        : {}),
      modules: 'auto',
      useBuiltIns: 'usage',
      corejs: { version: 3, proposals: false },
    },
  ];

  if (babelLoaders.length === 0) {
    config.module.rules.push({
      test: /\.(js|ts|tsx|mjs|jsx)$/,
      exclude: /node_modules/,
      use: {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [...(babel?.presets ?? []), babelPresetEnv],
          plugins: [...(babel?.plugins ?? [])],
          cacheIdentifier: createCacheKey(environment),
          cacheDirectory: true,
          cacheCompression: false,
          compact: isProduction,
          sourceMaps: !isProduction,
          inputSourceMap: !isProduction,
          ...(babel?.options ?? {}),
        },
      },
    });
  } else {
    babelLoaders.forEach((use) => {
      use.options.presets = [...(use?.options?.presets ?? []), babelPresetEnv];
    });
  }
}

function applyES9Transformation(config, context) {
  config = createESTransformation(config, context, 'es9');
  config.output.environment = {
    bigIntLiteral: false,
    dynamicImport: false,
    ...config.output.environment,
  };

  return config;
}

function applyES5Transformation(config, context) {
  config = createESTransformation(config, context, 'es5');
  config.output.environment = {
    arrowFunction: false,
    bigIntLiteral: false,
    const: false,
    destructuring: false,
    dynamicImport: false,
    forOf: false,
    module: false,
    ...config.output.environment,
  };

  return config;
}

module.exports = {
  applyES9Transformation,
  applyES5Transformation,
};
