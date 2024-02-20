const defaultConfig = require('../../jest.config.js');

module.exports = {
  ...defaultConfig,
  testEnvironment: 'jsdom',
  testEnvironmentOptions: {
    html: '<html lang="zh-cmn-Hant"></html>',
    url: 'https://jestjs.io/',
    userAgent: 'Agent/007',
  },
  coverageThreshold: {},
};
