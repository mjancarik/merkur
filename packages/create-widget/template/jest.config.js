const config = require('@merkur/tools/jest.config.js');

config.transform = {
  '^.+\\.[t|j]sx?$': 'esbuild-jest',
};

module.exports = {
  ...config,
};
