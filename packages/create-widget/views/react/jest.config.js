const config = require('@merkur/tools/jest.config.js');

config.setupFilesAfterEnv = ['./jest.setup.js'];

module.exports = {
  ...config,
};
