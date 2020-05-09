let config = require('@merkur/tools/babel.config.js');

config.presets.push('@babel/preset-react');

module.exports = {
  ...config,
};
