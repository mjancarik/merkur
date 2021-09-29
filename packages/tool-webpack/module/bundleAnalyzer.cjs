const BundleAnalyzerPlugin =
  require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

function applyBundleAnalyzer(config, { isProduction, plugins }) {
  config.plugins.push(new BundleAnalyzerPlugin(plugins.BundleAnalyzerPlugin));

  if (!isProduction) {
    config.optimization = {
      usedExports: true,
      minimize: true,
      sideEffects: false,
      ...config.optimization,
    };
  }

  return config;
}

module.exports = { applyBundleAnalyzer };
