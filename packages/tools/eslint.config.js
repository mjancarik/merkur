module.exports = {
  root: true,
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/recommended',
    'prettier',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        jsxSingleQuote: true,
      },
    ],
    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],
    'react/prop-types': 0,
    'react/wrap-multilines': 0,
    'react/no-deprecated': 0,
    'import/first': ['error'],
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        mjs: 'never',
        jsx: 'never',
        json: 'never',
      },
    ],
    'import/no-unresolved': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: '{preact|react|svelte}{/**,**}',
            group: 'external',
            position: 'before',
          },
          {
            pattern: '@merkur{/**,**}',
            group: 'external',
            position: 'after',
          },
          {
            pattern: '#/**',
            group: 'internal',
            position: 'after',
          },
          {
            pattern: '*.{less,json}',
            group: 'object',
            patternOptions: { matchBase: true },
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['#/', '@merkur'],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
  },
  plugins: ['prettier', 'jest', 'react', 'jasmine'],
  settings: {
    ecmascript: 2020,
    jsx: true,
    react: {
      version: '16',
    },
    'import/ignore': [
      'node_modules',
      '\\.(coffee|scss|css|less|hbs|svg|json)$',
    ],
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 11,
  },
  env: {
    browser: true,
    node: true,
    es6: true,
    jest: true,
  },
  globals: {},
};
