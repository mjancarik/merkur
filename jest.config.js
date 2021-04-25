exports = {
  bail: false,
  verbose: true,
  testEnvironment: 'node',
  coverageThreshold: {
    global: {
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  modulePaths: ['<rootDir>/'],
  transform: {
    '.(ts|tsx)$': require.resolve('ts-jest/dist'),
    '.(js|jsx)$': require.resolve('babel-jest'),
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testRegex: '(/__tests__/).*Spec\\.(ts|tsx|js|jsx)$',
  globals: {
    'ts-jest': {
      diagnostics: true,
    },
  },
};
