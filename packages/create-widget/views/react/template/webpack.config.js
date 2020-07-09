const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
} = require('@merkur/tools/webpack.js');

createLiveReloadServer();

function applyBabelLoader(config) {
  config.module.rules.push({
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: ['@babel/preset-react'],
      },
    },
  });

  return config;
}

module.exports = [
  applyBabelLoader(createWebConfig()),
  applyES5Transformation(applyBabelLoader(createWebConfig())),
  applyBabelLoader(createNodeConfig()),
];
