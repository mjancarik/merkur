const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');
const nodeExternals = require('webpack-node-externals');
const WebpackModules = require('webpack-modules');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const ManifestPlugin = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const WebSocket = require('./websocket.cjs');

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

function getPlugins(options = {}) {
  const sharedPlugins = [new WebpackModules(options.webpackModules)];

  const webPlugins = [
    new CleanWebpackPlugin(options.cleanWebpackPlugin),
    new MiniCssExtractPlugin({
      filename: 'widget.[contenthash].css',
      ...options.miniCSSExtractPlugin,
    }),
    new ManifestPlugin(options.manifestPlugin),
    ...sharedPlugins,
  ];
  const nodePlugins = [...sharedPlugins];

  if (environment === DEVELOPMENT) {
    nodePlugins.push(
      new WebpackShellPlugin({
        onBuildEnd: ['npm run dev:server'],
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
    mode: webpackMode,
    devtool: environment === PRODUCTION ? false : 'source-map',
    resolve: { ...resolve },
    entry: {
      widget: './src/client.js',
    },
    output: {
      path: path.resolve(DIR, './build/static/es9/'),
      filename: '[name].[contenthash].js',
    },
    plugins: getPlugins(options.plugins).webPlugins,
    module: {
      rules: [
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
    externals: [nodeExternals()],
    mode: webpackMode,
    devtool: environment === PRODUCTION ? false : 'eval-source-map',
    resolve: { ...resolve },
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
      '@merkur/plugin-router': path.resolve(
        nodeModulesDir,
        '@merkur/plugin-router/lib/index.es5'
      ),
    },
  };

  const loader = 'babel-loader';
  const babelLoaders = findLoaders(config.module.rules, loader);
  const babelPresetEnv = [
    '@babel/preset-env',
    {
      modules: false,
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

  return config;
}

function _pipe(a, b) {
  return async (arg) => b(await a(arg));
}

function pipe(...ops) {
  return ops.reduce(_pipe);
}

module.exports = {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  applyBundleAnalyzer,
  findLoaders,
  pipe,
};
