const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');
const nodeExternals = require('webpack-node-externals');
const WebpackModules = require('webpack-modules');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const WebSocket = require('@merkur/tools/websocket.js');

const sharedPlugins = [];

const webPlugins = [
  new MiniCssExtractPlugin({
    filename: 'widget-client.css',
  }),
  ...sharedPlugins,
];
const nodePlugins = [new WebpackModules(), ...sharedPlugins];
const DEVELOPMENT = 'development';

const environment = process.env.NODE_ENV ? process.env.NODE_ENV : DEVELOPMENT;

if (environment === DEVELOPMENT) {
  nodePlugins.push(
    new WebpackShellPlugin({
      onBuildEnd: ['npm run dev:server'],
    })
  );

  WebSocket.createServer();
}

module.exports = [
  {
    target: 'web',
    mode: environment,
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.json'],
      alias: {},
    },
    entry: {
      merkur: ['./src/client.js'],
    },
    output: {
      path: path.resolve(__dirname, './build/static'),
      filename: 'widget-client.js',
    },
    plugins: webPlugins,
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader,
            },
            'css-loader',
          ],
        },
      ],
    },
  },
  {
    target: 'node',
    externals: [nodeExternals()],
    plugins: nodePlugins,
    mode: environment,
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.json'],
      alias: {},
    },
    entry: {
      merkur: ['./src/server.js'],
    },
    output: {
      libraryTarget: 'commonjs2',
      path: path.resolve(__dirname, './build'),
      filename: 'widget-server.cjs',
    },
  },
];
