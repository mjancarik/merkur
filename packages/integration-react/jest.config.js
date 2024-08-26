const defaultConfig = require('../../jest.config.js');

defaultConfig.setupFilesAfterEnv = ['./jest.setup.js'];
defaultConfig.testEnvironment = 'jsdom';
defaultConfig.testEnvironmentOptions = {
  html: '<html lang="zh-cmn-Hant"></html>',
  url: 'https://jestjs.io/',
  userAgent: 'Agent/007',
};
defaultConfig.transform = {
  '^.+\\.[t|j]sx?$': 'babel-jest',
};
defaultConfig.transformIgnorePatterns = [];
defaultConfig.moduleNameMapper = {
  'cheerio/lib/utils': '<rootDir>/node_modules/cheerio/lib/utils.js',
};

module.exports = { ...defaultConfig };
