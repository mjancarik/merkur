const fs = require('fs');
const path = require('path');

const { createCacheKey } = require('../webpack/cache.cjs');

function findLoaders(rules = [], loader) {
  let foundLoaders = [];
  let foundRules = [];

  for (let rule of rules) {
    if (!Array.isArray(rule.use)) {
      if (rule?.use?.loader?.includes(loader)) {
        foundRules.push(rule);
        foundLoaders.push(rule.use);
      }
    } else {
      rule.use.forEach((use) => {
        if (use?.loader?.includes(loader)) {
          foundRules.push(rule);
          foundLoaders.push(use);
        }
      });
    }
  }

  return {
    rules: foundRules,
    loaders: foundLoaders,
  };
}

function createESTransformation(
  config,
  { cwd, isProduction, nodeModulesDir, environment, cache },
  esVersion,
) {
  const esPolyfillFilePath = `./src/polyfill.${esVersion}.js`;

  config = {
    ...config,
    name: `web-${esVersion}`,
    entry: {
      ...config.entry,
      ...(fs.existsSync(path.resolve(cwd, esPolyfillFilePath))
        ? { polyfill: esPolyfillFilePath }
        : undefined),
    },
    resolve: {
      ...config.resolve,
      alias: {
        '@merkur/core': path.join(
          nodeModulesDir,
          `@merkur/core/lib/index.${esVersion}.mjs`,
        ),
        '@merkur/plugin-component/helpers': path.join(
          nodeModulesDir,
          `@merkur/plugin-component/lib/helpers.${esVersion}.mjs`,
        ),
        '@merkur/plugin-component': path.join(
          nodeModulesDir,
          `@merkur/plugin-component/lib/index.${esVersion}.mjs`,
        ),
        '@merkur/plugin-event-emitter': path.join(
          nodeModulesDir,
          `@merkur/plugin-event-emitter/lib/index.mjs`,
        ),
        '@merkur/plugin-http-client': path.join(
          nodeModulesDir,
          `@merkur/plugin-http-client/lib/index.mjs`,
        ),
        '@merkur/plugin-error': path.join(
          nodeModulesDir,
          `@merkur/plugin-error/lib/index.mjs`,
        ),
        '@merkur/plugin-router': path.join(
          nodeModulesDir,
          `@merkur/plugin-router/lib/index.mjs`,
        ),
        '@merkur/plugin-css-scrambler': path.join(
          nodeModulesDir,
          `@merkur/plugin-router/lib/index.mjs`,
        ),
        ...config.resolve.alias,
      },
    },
    output: {
      ...config.output,
      path: path.join(config.output.path, `../${esVersion}/`),
    },
  };

  console.log(config.resolve.alias);

  const { loaders: babelLoaders } = findLoaders(
    config.module.rules,
    'babel-loader',
  );

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
      exclude: (modulePath) =>
        /node_modules/.test(modulePath) &&
        !/node_modules\/(abort-controller|event-target-shim)/.test(modulePath),
      use: {
        loader: require.resolve('babel-loader'),
        options: {
          presets: [babelPresetEnv],
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
  } else {
    babelLoaders.forEach((use) => {
      use.options.presets = [...(use?.options?.presets ?? []), babelPresetEnv];
    });
  }

  return config;
}

function applyES9Transformation(config, context) {
  config = createESTransformation(config, context, 'es9');
  config.output.environment = {
    bigIntLiteral: false,
    dynamicImport: false,
    ...config.output?.environment,
  };

  return config;
}

module.exports = {
  findLoaders,
  applyES9Transformation,
};
