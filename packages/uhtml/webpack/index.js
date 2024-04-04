const path = require('path');
const fs = require('fs');

function applyUHtmlConfig(config, { cwd, isServer }) {
  // Check for existence of widget entry points
  if (
    config.entry.widget &&
    fs.existsSync(path.join(cwd, config.entry.widget))
  ) {
    return config;
  }

  // TODO should probably be moved to root config, when all frameworks are supported (this will be removed with webpack deprecation)
  // Set custom aliases to widget entry point
  config.resolve = {
    ...config.resolve,
    alias: {
      '@widget': path.join(cwd, './src/widget.js'),
      ...config.resolve.alias,
    },
  };

  // Add default client/server entries if there are no custom ones
  config.entry.widget = require.resolve(
    `@merkur/uhtml/entries/${isServer ? 'server' : 'client'}.js`,
  );

  return config;
}

module.exports = {
  applyUHtmlConfig,
};
