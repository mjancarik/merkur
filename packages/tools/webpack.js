const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');
const nodeExternals = require('webpack-node-externals');
const WebpackModules = require('webpack-modules');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const WebSocket = require('./websocket.js');

const sharedPlugins = [];

const webPlugins = [
  new MiniCssExtractPlugin({
    filename: 'widget-client.css',
  }),
  ...sharedPlugins,
];
const nodePlugins = [new WebpackModules(), ...sharedPlugins];

const DIR = process.cwd();

const DEVELOPMENT = 'development';
const PRODUCTION = 'production';
const environment = process.env.NODE_ENV ? process.env.NODE_ENV : DEVELOPMENT;
const webpackMode = environment === PRODUCTION ? PRODUCTION : DEVELOPMENT;

if (environment === DEVELOPMENT) {
  nodePlugins.push(
    new WebpackShellPlugin({
      onBuildEnd: ['npm run dev:server'],
    })
  );
}

const resolve = {
  extensions: ['.mjs', '.js', '.jsx', '.json'],
  alias: {},
  modules: [path.resolve(DIR, 'node_modules')],
};

function createLiveReloadServer() {
  if (environment === DEVELOPMENT) {
    WebSocket.createServer();
  }
}

function createWebConfig() {
  return {
    target: 'web',
    mode: webpackMode,
    devtool: environment === PRODUCTION ? false : 'source-map',
    resolve: { ...resolve },
    entry: {
      widget: './src/client.js',
    },
    output: {
      path: path.resolve(DIR, './build/static'),
      filename: 'widget-client.js',
    },
    plugins: [...webPlugins],
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

function createNodeConfig() {
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
      filename: 'widget-server.cjs',
    },
    plugins: [...nodePlugins],
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

function applyES5Transformation(config, options = {}) {
  config.resolve.alias = {
    ...config.resolve.alias,
    ...{
      '@merkur/core': path.resolve(
        DIR,
        'node_modules/@merkur/core/lib/index.es5'
      ),
      '@merkur/plugin-component': path.resolve(
        DIR,
        'node_modules/@merkur/plugin-component/lib/index.es5'
      ),
      '@merkur/plugin-event-emitter': path.resolve(
        DIR,
        'node_modules/@merkur/plugin-event-emitter/lib/index.es5'
      ),
      '@merkur/plugin-http-client': path.resolve(
        DIR,
        'node_modules/@merkur/plugin-http-client/lib/index.es5'
      ),
      '@merkur/plugin-router': path.resolve(
        DIR,
        'node_modules/@merkur/plugin-router/lib/index.es5'
      ),
    },
  };

  const loader = 'babel-loader';
  let babelLoaders = findLoaders(config.module.rules, loader);

  if (babelLoaders.length === 0) {
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: /node_modules/,
      use: {
        loader: loader,
        options: options?.babel?.options ?? {
          presets: [...(options?.babel?.presets ?? []), '@babel/preset-env'],
          plugins: [...(options?.babel?.plugins ?? [])],
        },
      },
    });
  } else {
    babelLoaders.forEach((use) => {
      use.options.presets = [
        ...(use?.options?.presets ?? []),
        '@babel/preset-env',
      ];
    });
  }

  // TODO add es5 to existing name
  config.output.filename = 'widget-client.es5.js';

  return config;
}

module.exports = {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  findLoaders,
};
