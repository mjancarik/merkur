const path = require('path');
const WebpackShellPlugin = require('webpack-shell-plugin');
const nodeExternals = require('webpack-node-externals');
const WebpackModules = require('webpack-modules');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const nodePlugins = [
  new WebpackShellPlugin({
    onBuildEnd: ['npm run dev']
  }),
  new WebpackModules()
];

module.exports = [
  {
    target: 'web',
    mode: 'production',
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.json'],
      alias: {}
    },
    entry: {
      hyper: ['./src/client.js']
    },
    output: {
      path: path.resolve(__dirname, './static'),
      filename: 'widget-client.js'
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: 'widget-client.css'
      })
    ],
    module: {
      rules: [
        {
          test: /\.css$/,
          use: [
            {
              loader: MiniCssExtractPlugin.loader
            },
            'css-loader'
          ]
        }
      ]
    }
  },
  {
    target: 'node',
    externals: [nodeExternals()],
    plugins: nodePlugins,
    mode: 'production',
    resolve: {
      extensions: ['.mjs', '.js', '.jsx', '.json'],
      alias: {}
    },
    entry: {
      hyper: ['./src/server.js']
    },
    output: {
      libraryTarget: 'commonjs2',
      path: path.resolve(__dirname, './lib'),
      filename: 'widget-server.cjs'
    }
  }
];
