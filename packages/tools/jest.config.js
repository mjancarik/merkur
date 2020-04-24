module.exports = {
  bail: false,
  verbose: true,
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/'],
  testRegex: '(/__tests__/).*(Spec|test)\\.jsx?$',
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
};
