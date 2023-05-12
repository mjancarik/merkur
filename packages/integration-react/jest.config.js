const defaultConfig = require('../../jest.config.js');

defaultConfig.setupFilesAfterEnv = ['./jest.setup.js'];
defaultConfig.testEnvironment = 'jsdom';
defaultConfig.testEnvironmentOptions = {
  html: '<html lang="zh-cmn-Hant"></html>',
  url: 'https://jestjs.io/',
  userAgent: 'Agent/007',
};

module.exports = { ...defaultConfig };
