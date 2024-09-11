const testGroupRegexes = {
  unit: '(/__tests__/).*(Spec|test)\\.[jt]sx?$',
  integration: '(/__integration__/).*(Spec|test)\\.[jt]sx?$',
  all: '((/__integration__/)|(/__tests__/)).*(Spec|test)\\.[jt]sx?$',
};

const testGroup =
  process.env.TEST_GROUP &&
  Object.keys(testGroupRegexes).includes(process.env.TEST_GROUP)
    ? process.env.TEST_GROUP
    : 'all';

module.exports = {
  bail: false,
  verbose: true,
  testEnvironment: 'node',
  modulePaths: ['<rootDir>/'],
  testRegex: testGroupRegexes[testGroup],
  testPathIgnorePatterns: ['/node_modules/', '/__snapshots__/'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  watchPlugins: [
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
  // https://github.com/preactjs/preact/pull/3634
  testEnvironmentOptions: {
    customExportConditions: ['node', 'node-addons'],
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$':
      '<rootDir>/__mocks__/fileMock.js',
    '\\.(css|less)$': 'identity-obj-proxy',
  },
};
