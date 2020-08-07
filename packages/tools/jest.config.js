const testGroupRegexes = {
  unit: '(/__tests__/).*(Spec|test)\\.jsx?$',
  integration: '(/__integration__/).*(Spec|test)\\.jsx?$',
  all: '(/__integration__/)|(/__tests__/).*(Spec|test)\\.jsx?$',
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
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  watchPlugins: [
    require.resolve('jest-watch-typeahead/filename'),
    require.resolve('jest-watch-typeahead/testname'),
  ],
};
