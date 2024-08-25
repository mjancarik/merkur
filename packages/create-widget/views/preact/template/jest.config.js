const config = require('@merkur/tools/jest.config.js');

config.setupFilesAfterEnv = ['./jest.setup.js'];
config.transform = {
  '^.+\\.[t|j]sx?$': [
    'es-jest',
    { jsx: 'automatic', jsxImportSource: 'preact' },
  ],
};

module.exports = {
  ...config,
};
