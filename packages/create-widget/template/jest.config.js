const config = require('@merkur/tools/jest.config.js');

config.transform = {
  '^.+\\.[t|j]sx?$': 'es-jest',
};

module.exports = {
  ...config,
};
