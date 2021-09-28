const {
  createLiveReloadServer,
  createWebConfig,
  createNodeConfig,
  applyES5Transformation,
  applyES9Transformation,
  pipe,
} = require('@merkur/tool-webpack');

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

module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(createWebConfig, applyBabelLoader)(),
    pipe(createWebConfig, applyBabelLoader, applyES5Transformation)(),
    pipe(createWebConfig, applyBabelLoader, applyES9Transformation)(),
    pipe(createNodeConfig, applyBabelLoader)(),
  ])
);
