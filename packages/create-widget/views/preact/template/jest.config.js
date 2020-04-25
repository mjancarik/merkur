const config = require('@merkur/tools/jest.config.js');

config.setupFilesAfterEnv = ['./jest.setup.js'];
config.snapshotSerializers = ['enzyme-to-json/serializer'];

module.exports = {
  ...config,
};
