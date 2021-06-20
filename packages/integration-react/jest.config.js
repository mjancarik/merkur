const defaultConfig = require('../../jest.config.js');

defaultConfig.setupFilesAfterEnv = ['./jest.setup.js'];
defaultConfig.testEnvironment = 'jsdom';

module.exports = { ...defaultConfig };
