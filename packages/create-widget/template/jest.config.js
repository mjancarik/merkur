const config = require('@merkur/tools/jest.config.js');

config.transform = {
  '^.+\\.[t|j]sx?$': 'esbuild-jest2',
};

module.exports = {
  ...config,
};
