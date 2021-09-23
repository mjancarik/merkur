const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const WebpackShellPlugin = require('webpack-shell-plugin-next');
const nodeExternals = require('webpack-node-externals');
const WebpackModules = require('webpack-modules');
const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const WebSocket = require('@merkur/tools/websocket.cjs');

const DIR = process.cwd();
const DEVELOPMENT = 'development';
const PRODUCTION = 'production';
const environment = process.env.NODE_ENV ? process.env.NODE_ENV : DEVELOPMENT;
const webpackMode = environment === PRODUCTION ? PRODUCTION : DEVELOPMENT;

const resolve = {
  extensions: ['.mjs', '.js', '.jsx', '.json'],
  alias: {},
  modules: [path.resolve(DIR, 'node_modules')],
};

function createCacheKey(...args) {
  return createHash('md4')
    .update(args.map((value) => JSON.stringify(value)).join(''))
    .digest('hex');
}

function createCache(name) {
  return {
    type: 'filesystem',
    name,
    version: createCacheKey(process.env.NODE_ENV),
    buildDependencies: {
      defaultWebpack: ['webpack/lib/'],
      config: [path.resolve(process.cwd(), 'webpack.config.js')].filter(
        fs.existsSync
      ),
    },
  };
}

function getPlugins(options = {}) {
  const sharedPlugins = [new WebpackModules(options.webpackModules)];

  const webPlugins = [
    new CleanWebpackPlugin(options.cleanWebpackPlugin),
    new MiniCssExtractPlugin({
      filename: 'widget.[contenthash].css',
      ...options.miniCSSExtractPlugin,
    }),
    new WebpackManifestPlugin({ publicPath: '', ...options.manifestPlugin }),
    ...sharedPlugins,
  ];
  const nodePlugins = [...sharedPlugins];

  if (environment === PRODUCTION) {
    webPlugins.push(
      new CompressionPlugin({
        ...{
          filename: '[path][base].gz',
          algorithm: 'gzip',
          test: /\.(js|css|)$/,
          compressionOptions: {
            level: 9,
          },
          threshold: 0,
          minRatio: 0.95,
        },
        ...options.compressionPluginGzip,
      })
    );
    webPlugins.push(
      new CompressionPlugin({
        ...{
          filename: '[path][base].br',
          algorithm: 'brotliCompress',
          test: /\.(js|css)$/,
          compressionOptions: {
            params: {
              [zlib.constants.BROTLI_PARAM_QUALITY]: 11,
            },
          },
          threshold: 0,
          minRatio: 0.95,
        },
        ...options.compressionPluginBrotli,
      })
    );
  }

  if (environment === DEVELOPMENT) {
    nodePlugins.push(
      new WebpackShellPlugin({
        onBuildEnd: {
          scripts: ['npm run dev:server'],
          blocking: false,
          parallel: true,
        },
        ...options.webpackShellPlugin,
      })
    );
  }

  return { webPlugins, nodePlugins };
}

function createLiveReloadServer() {
  if (environment === DEVELOPMENT) {
    WebSocket.createServer();
  }
}

function createWebConfig(options = {}) {
  return {
    target: 'web',
    cache: createCache('web'),
    bail: environment === PRODUCTION,
    mode: webpackMode,
    devtool: environment === PRODUCTION ? false : 'source-map',
    resolve: {
      ...resolve,
      ...{
        mainFields: ['browser', 'module', 'main'],
      },
    },
    entry: {
      widget: './src/client.js',
    },
    output: {
      path: path.resolve(DIR, './build/static/es11/'),
      filename: '[name].[contenthash].js',
    },
    plugins: getPlugins(options.plugins).webPlugins,
    module: {
      rules: [
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            {
              loader: 'css-loader',
              options: {
                sourceMap: true,
              },
            },
          ],
        },
      ],
    },
  };
}

function createNodeConfig(options = {}) {
  return {
    target: 'node',
    cache: createCache('server'),
    bail: environment === PRODUCTION,
    externals: [nodeExternals()],
    externalsPresets: { node: true },
    mode: webpackMode,
    devtool: environment === PRODUCTION ? false : 'eval-source-map',
    resolve: { ...resolve, ...{ mainFields: ['module', 'main'] } },
    entry: {
      widget: './src/server.js',
    },
    output: {
      libraryTarget: 'commonjs2',
      path: path.resolve(DIR, './build'),
      filename: '[name].cjs',
    },
    plugins: getPlugins(options.plugins).nodePlugins,
    module: {
      rules: [],
    },
  };
}

function findLoaders(rules = [], loader) {
  let babelLoaders = [];

  for (let rule of rules) {
    if (!Array.isArray(rule.use)) {
      if (rule?.use?.loader === loader) {
        babelLoaders.push(rule.use);
      }
    } else {
      rule.use.forEach((use) => {
        if (use?.loader === loader) {
          babelLoaders.push(use);
        }
      });
    }
  }

  return babelLoaders;
}

function applyBundleAnalyzer(config, options = {}) {
  config.plugins.push(new BundleAnalyzerPlugin(options));

  if (webpackMode === DEVELOPMENT) {
    config.optimization = {
      ...{
        usedExports: true,
        minimize: true,
        sideEffects: false,
      },
      ...config.optimization,
    };
  }

  return config;
}

function applyES9Transformation(config, options = {}) {
  const nodeModulesDir = options.nodeModulesDir
    ? options.nodeModulesDir
    : path.resolve(DIR, 'node_modules');

  config.entry.polyfill = './src/polyfill.es9.js';

  config.resolve.alias = {
    ...config.resolve.alias,
    ...{
      '@merkur/core': path.resolve(
        nodeModulesDir,
        '@merkur/core/lib/index.es9.mjs'
      ),
      '@merkur/plugin-component': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-component/lib/index.es9.mjs'
      ),
      '@merkur/plugin-event-emitter': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-event-emitter/lib/index.es9.mjs'
      ),
      '@merkur/plugin-http-client': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-http-client/lib/index.es9.mjs'
      ),
      '@merkur/plugin-error': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-error/lib/index.es9.mjs'
      ),
      '@merkur/plugin-router': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-router/lib/index.es9.mjs'
      ),
      '@merkur/plugin-css-scrambler': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-router/lib/index.es9.mjs'
      ),
    },
  };

  if (config?.cache?.name) {
    config.cache.name = 'web-es9';
  }

  const loader = 'babel-loader';
  const babelLoaders = findLoaders(config.module.rules, loader);
  const babelPresetEnv = [
    '@babel/preset-env',
    {
      targets: {
        node: '12',
      },
      modules: 'auto',
      useBuiltIns: 'usage',
      corejs: { version: 3, proposals: false },
    },
  ];

  if (babelLoaders.length === 0) {
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: loader,
        options: options?.babel?.options ?? {
          presets: [...(options?.babel?.presets ?? []), babelPresetEnv],
          plugins: [...(options?.babel?.plugins ?? [])],
        },
      },
    });
  } else {
    babelLoaders.forEach((use) => {
      use.options.presets = [...(use?.options?.presets ?? []), babelPresetEnv];
    });
  }

  config.output.path = path.resolve(config.output.path, '../es9/');
  config.output.environment = {
    ...{
      bigIntLiteral: false,
      dynamicImport: false,
    },
    ...config.output.environment,
  };

  return config;
}

function applyES5Transformation(config, options = {}) {
  const nodeModulesDir = options.nodeModulesDir
    ? options.nodeModulesDir
    : path.resolve(DIR, 'node_modules');

  config.entry.polyfill = './src/polyfill.js';

  config.resolve.alias = {
    ...config.resolve.alias,
    ...{
      '@merkur/core': path.resolve(
        nodeModulesDir,
        '@merkur/core/lib/index.es5'
      ),
      '@merkur/plugin-component': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-component/lib/index.es5'
      ),
      '@merkur/plugin-event-emitter': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-event-emitter/lib/index.es5'
      ),
      '@merkur/plugin-http-client': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-http-client/lib/index.es5'
      ),
      '@merkur/plugin-error': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-error/lib/index.es5'
      ),
      '@merkur/plugin-router': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-router/lib/index.es5'
      ),
      '@merkur/plugin-css-scrambler': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-router/lib/index.es5'
      ),
    },
  };

  if (config?.cache?.name) {
    config.cache.name = 'web-es5';
  }

  const loader = 'babel-loader';
  const babelLoaders = findLoaders(config.module.rules, loader);
  const babelPresetEnv = [
    '@babel/preset-env',
    {
      modules: 'auto',
      useBuiltIns: 'usage',
      corejs: { version: 3, proposals: false },
    },
  ];

  if (babelLoaders.length === 0) {
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: loader,
        options: options?.babel?.options ?? {
          presets: [...(options?.babel?.presets ?? []), babelPresetEnv],
          plugins: [...(options?.babel?.plugins ?? [])],
        },
      },
    });
  } else {
    babelLoaders.forEach((use) => {
      use.options.presets = [...(use?.options?.presets ?? []), babelPresetEnv];
    });
  }

  config.output.path = path.resolve(config.output.path, '../es5/');
  config.output.environment = {
    ...{
      arrowFunction: false,
      bigIntLiteral: false,
      const: false,
      destructuring: false,
      dynamicImport: false,
      forOf: false,
      module: false,
    },
    ...config.output.environment,
  };

  return config;
}

function _pipe(acc, cur) {
  return async (arg) => cur(await acc(arg));
}

function pipe(...ops) {
  return ops.reduce((acc, cur) => _pipe(acc, cur));
}

module.exports = {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  applyES9Transformation,
  applyBundleAnalyzer,
  findLoaders,
  createCacheKey,
  pipe,
  environment,
  webpackMode,
};
