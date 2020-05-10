const defaultConfig = require('../../jest.config.js');

defaultConfig.setupFilesAfterEnv = ['./jest.setup.js'];

module.exports = { ...defaultConfig };
