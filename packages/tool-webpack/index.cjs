const webpack = require('webpack');
const path = require('path');
const zlib = require('zlib');
const WebpackShellPlugin = require('webpack-shell-plugin-next');
const nodeExternals = require('webpack-node-externals');
const WebpackModules = require('webpack-modules');
const { WebpackManifestPlugin } = require('webpack-manifest-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');

const { createCache, createCacheKey } = require('./webpack/cache.cjs');
const { createLiveReloadServer } = require('./webpack/liveReloadServer.cjs');
const { applyBundleAnalyzer } = require('./module/bundleAnalyzer.cjs');
const {
  findLoaders,
  applyES9Transformation,
  applyES5Transformation,
} = require('./module/babelLoader.cjs');
const { applyStyleLoaders } = require('./module/styleLoader.cjs');

function getPlugins({ plugins, isProduction }) {
  const sharedPlugins = [
    new WebpackModules(),
    ...(!isProduction
      ? [
          new webpack.SourceMapDevToolPlugin({
            test: /\.(le|c)ss$/,
          }),
          new webpack.EvalSourceMapDevToolPlugin({
            test: /\.[jt]sx?$/,
          }),
        ]
      : []),
  ].filter(Boolean);

  return {
    webPlugins: [
      new CleanWebpackPlugin(plugins?.CleanWebpackPlugin),
      new WebpackManifestPlugin({
        publicPath: '',
        ...plugins?.WebpackManifestPlugin,
      }),
      ...(isProduction
        ? [
            new CompressionPlugin({
              filename: '[path][base].gz',
              algorithm: 'gzip',
              test: /\.(js|css)$/,
              compressionOptions: {
                level: 9,
              },
              threshold: 0,
              minRatio: 0.95,
              ...plugins?.CompressionPluginGzip,
            }),
            new CompressionPlugin({
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
              ...plugins?.CompressionPluginBrotli,
            }),
          ]
        : []),
      ...sharedPlugins,
    ].filter(Boolean),
    nodePlugins: [
      ...(!isProduction
        ? [
            new WebpackShellPlugin({
              onBuildEnd: {
                scripts: ['npm run dev:server'],
                blocking: false,
                parallel: true,
              },
              ...plugins?.WebpackShellPlugin,
            }),
          ]
        : []),
      ...sharedPlugins,
    ].filter(Boolean),
  };
}

function createConfig(config, context) {
  const { isServer, isProduction, nodeModulesDir, publicPath } = context;

  return {
    name: isServer ? 'node' : 'web',
    target: isServer ? 'node' : 'web',
    cache: createCache(context),
    stats: 'minimal',
    bail: isProduction,
    mode: isProduction ? 'production' : 'development',
    devtool: false,
    resolve: {
      alias: {},
      extensions: ['.mjs', '.js', '.jsx', '.json'],
      modules: [nodeModulesDir],
      ...config?.resolve,
    },
    output: {
      publicPath,
    },
    module: {
      rules: [
        {
          test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/, /\.webp$/],
          oneOf: [
            {
              resourceQuery: /inline/, // foo.png?inline
              type: 'asset/inline',
            },
            {
              resourceQuery: /external/, // foo.png?external
              type: 'asset/resource',
            },
            {
              type: 'asset',
              parser: {
                dataUrlCondition: {
                  maxSize: 8192,
                },
              },
            },
          ],
        },
        !isProduction && {
          enforce: 'pre',
          test: /\.(js|mjs|jsx|ts|tsx|cjs|css)$/,
          use: require.resolve('source-map-loader'),
        },
        ...(config?.module?.rules ?? []),
      ].filter(Boolean),
      ...config?.module,
    },
    ...config,
  };
}

function createWebConfig(config, context) {
  context.isServer = false;
  const baseConfig = createConfig(config, context);
  const { cwd } = context;

  return {
    ...baseConfig,
    resolve: {
      ...baseConfig.resolve,
      mainFields: ['browser', 'module', 'main'],
    },
    entry: {
      widget: './src/client.js',
    },
    output: {
      ...baseConfig?.output,
      path: path.join(cwd, './build/static/es11/'),
      filename: '[name].[contenthash].js',
      assetModuleFilename: '../media/[name].[hash][ext]',
    },
    plugins: getPlugins(context).webPlugins,
    module: {
      ...baseConfig?.module,
      rules: [
        ...(baseConfig?.module?.rules ?? []),
        {
          test: /\.m?js/,
          resolve: {
            fullySpecified: false,
          },
        },
      ].filter(Boolean),
    },
  };
}

function createNodeConfig(config, context) {
  context.isServer = true;
  const baseConfig = createConfig(config, context);
  const { cwd, nodeModulesDir } = context;

  return {
    ...baseConfig,
    externals: [
      nodeExternals({
        modulesDir: nodeModulesDir,
      }),
    ],
    externalsPresets: { node: true },
    resolve: {
      ...baseConfig.resolve,
      mainFields: ['module', 'main'],
    },
    entry: {
      widget: './src/server.js',
    },
    output: {
      ...baseConfig?.output,
      libraryTarget: 'commonjs2',
      path: path.join(cwd, './build'),
      assetModuleFilename: './static/media/[name].[hash][ext]',
      filename: '[name].cjs',
    },
    plugins: getPlugins(context).nodePlugins,
  };
}

function pipe(...ops) {
  return async (context = {}) => {
    const { plugins, ...restContext } = context;

    const cwd = process.cwd();
    const contextWithDefaults = {
      cwd,
      environment: process.env.NODE_ENV,
      isProduction: process.env.NODE_ENV === 'production',
      nodeModulesDir: path.join(cwd, 'node_modules'),
      useLessLoader: false,
      publicPath: '',
      ...restContext,
      cache: {
        versionDependencies: [],
        ...restContext?.cache,
      },
      plugins: {
        ...plugins,
      },
    };

    let accumulator = {};
    for (const operation of ops) {
      accumulator = await operation(accumulator, contextWithDefaults);
    }

    return accumulator;
  };
}

module.exports = {
  createWebConfig,
  createNodeConfig,
  pipe,
  findLoaders,
  createCacheKey,
  createLiveReloadServer,
  applyBundleAnalyzer,
  applyES9Transformation,
  applyES5Transformation,
  applyStyleLoaders,
};
