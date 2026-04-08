const defaultConfig = require('../../jest.config.js');

module.exports = {
  ...defaultConfig,
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    'storybook/preview-api': '<rootDir>/src/__mocks__/storybook-preview-api.js',
    'storybook/internal/core-events':
      '<rootDir>/src/__mocks__/storybook-core-events.js',
  },
};
