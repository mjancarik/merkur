function applyGraphqlLoader(config) {
  config.module.rules.push({
    test: /\.(graphql|gql)$/,
    exclude: /node_modules/,
    loader: 'graphql-tag/loader',
  });

  return config;
}

module.exports = {
  applyGraphqlLoader,
};
