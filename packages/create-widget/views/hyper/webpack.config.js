const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');
const nodeExternals = require('webpack-node-externals');
const WebpackModules = require('webpack-modules');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const nodePlugins = [
  new WebpackShellPlugin({
    onBuildEnd: ['npm run dev:server'],
  }),
  new WebpackModules(),
];

const environment = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

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
      path: path.resolve(__dirname, './static'),
      filename: 'widget-client.js',
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'widget-client.css',
      }),
    ],
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
      path: path.resolve(__dirname, './lib'),
      filename: 'widget-server.cjs',
    },
  },
];
