const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  pipe,
} = require('@merkur/tools/webpack.cjs');

createLiveReloadServer();

function applyBabelLoader(config) {
  config.module.rules.push({
    test: /\.(js|jsx)$/,
    exclude: /node_modules/,
    use: {
      loader: 'babel-loader',
      options: {
        presets: [['@babel/preset-react', { pragma: 'h' }]],
      },
    },
  });

  return config;
}

module.exports = Promise.all([
  pipe(createWebConfig, applyBabelLoader)(),
  pipe(createWebConfig, applyBabelLoader, applyES5Transformation)(),
  pipe(createNodeConfig, applyBabelLoader)(),
]);
