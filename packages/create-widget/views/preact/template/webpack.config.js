const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');
const nodeExternals = require('webpack-node-externals');
const WebpackModules = require('webpack-modules');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const nodePlugins = [new WebpackModules()];
const DEVELOPMENT = 'development';

const environment = process.env.NODE_ENV ? process.env.NODE_ENV : DEVELOPMENT;

if (environment === DEVELOPMENT) {
  nodePlugins.push(
    new WebpackShellPlugin({
      onBuildEnd: ['npm run dev:server'],
    })
  );
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
      merkur: ['./src/client.jsx'],
    },
    output: {
      path: path.resolve(__dirname, './server/static'),
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
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-react', { pragma: 'h' }]],
            },
          },
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
      merkur: ['./src/server.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: [['@babel/preset-react', { pragma: 'h' }]],
            },
          },
        },
      ],
    },
    output: {
      libraryTarget: 'commonjs2',
      path: path.resolve(__dirname, './lib'),
      filename: 'widget-server.cjs',
    },
  },
];
