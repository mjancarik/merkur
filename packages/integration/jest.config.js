const defaultConfig = require('../../jest.config.js');

defaultConfig.testEnvironment = 'jsdom';

module.exports = { ...defaultConfig };
