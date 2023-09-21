exports = {
  bail: false,
  verbose: true,
  testEnvironment: 'node',
  prettierPath: '',
  coverageThreshold: {
    global: {
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  modulePaths: ['<rootDir>/'],
  testRegex: '(/__tests__/).*Spec\\.jsx?$',
};
