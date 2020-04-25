let config = require('@merkur/tools/babel.config.js');

config.presets.push(['@babel/preset-react', { pragma: 'h' }]);

module.exports = {
  ...config,
};
