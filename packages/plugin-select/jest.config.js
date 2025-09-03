const defaultConfig = require('../../jest.config.js');

module.exports = {
  ...defaultConfig,
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.[jt]sx?$': 'babel-jest',
    '^.+\\.mjs$': 'babel-jest',
  },
  transformIgnorePatterns: [],
};
