const { createHash } = require('crypto');
const fs = require('fs');
const path = require('path');

function createCacheKey(...args) {
  let hash;

  try {
    hash = createHash('sha256');
  } catch (err) {
    hash = createHash('md5');
  }

  return hash
    .update(
      args
        .filter(Boolean)
        .map((value) => JSON.stringify(value))
        .join(''),
    )
    .digest('hex');
}

function createCache({ cwd, cache, environment }) {
  return {
    type: 'filesystem',
    version: createCacheKey(environment, ...(cache?.versionDependencies ?? [])),
    buildDependencies: {
      defaultWebpack: ['webpack/lib/'],
      config: [path.resolve(cwd, 'webpack.config.js')].filter(fs.existsSync),
    },
  };
}

module.exports = {
  createCacheKey,
  createCache,
};
