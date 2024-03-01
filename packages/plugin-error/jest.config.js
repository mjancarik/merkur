const defaultConfig = require('../../jest.config.js');

module.exports = {
  ...defaultConfig,
  coverageThreshold: {
    global: {
      functions: 40,
      lines: 40,
      statements: 40,
    },
  },
};
