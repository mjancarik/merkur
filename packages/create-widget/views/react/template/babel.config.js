let config = require('@merkur/tools/babel.config.js');

config.presets.push([
  '@babel/preset-react',
  {
    runtime: 'automatic',
  },
]);

module.exports = {
  ...config,
};
