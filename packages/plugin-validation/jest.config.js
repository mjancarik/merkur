const defaultConfig = require('../../jest.config.js');

module.exports = {
  ...defaultConfig,
  coverageThreshold: {
    global: {
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
