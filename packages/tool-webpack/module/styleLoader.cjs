const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function getStyleLoaders({ isServer, isProduction }, useLess) {
  let importLoaders = isServer ? 0 : 1;

  if (useLess) {
    importLoaders += 1;
  }

  return [
    !isServer && {
      loader: MiniCssExtractPlugin.loader,
    },
    {
      loader: require.resolve('css-loader'),
      options: {
        importLoaders,
        modules: {
          auto: true,
          exportOnlyLocals: isServer,
          localIdentName: isProduction
            ? '[hash:base64]'
            : '[path][name]__[local]--[hash:base64:5]',
        },
        sourceMap: !isProduction,
      },
    },
    !isServer && {
      loader: require.resolve('postcss-loader'),
      options: {
        implementation: require('postcss'),
        postcssOptions: {
          plugins: [
            'postcss-flexbugs-fixes',
            [
              'postcss-preset-env',
              {
                autoprefixer: {
                  flexbox: 'no-2009',
                },
                stage: 3,
                features: {
                  'custom-properties': false,
                },
              },
            ],
          ],
        },
        sourceMap: !isProduction,
      },
    },
    useLess && {
      loader: require.resolve('less-loader'),
      options: {
        sourceMap: !isProduction,
      },
    },
  ].filter(Boolean);
}

function applyStyleLoaders(config, context) {
  const { plugins, useLessLoader } = context;

  config.module.rules.push(
    ...[
      useLessLoader && {
        test: /\.less$/,
        sideEffects: true,
        exclude: /node_modules/,
        use: getStyleLoaders(context, true),
      },
      {
        test: /\.css$/,
        sideEffects: true,
        exclude: /node_modules/,
        use: getStyleLoaders(context),
      },
    ].filter(Boolean)
  );

  config.optimization = {
    ...config.optimization,
    minimizer: ['...', new CssMinimizerPlugin()],
  };

  config.plugins.push(
    new MiniCssExtractPlugin({
      filename: 'widget.[contenthash].css',
      ...plugins.MiniCssExtractPlugin,
    })
  );

  return config;
}

module.exports = { applyStyleLoaders };
