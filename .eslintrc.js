module.exports = {
  root: true,
  extends: ['eslint:recommended', 'plugin:react/recommended', 'prettier'],
  rules: {
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        jsxSingleQuote: true,
        bracketSameLine: false,
      },
    ],

    'no-console': [
      'error',
      {
        allow: ['warn', 'error'],
      },
    ],

    'react/react-in-jsx-scope': 0,
    'react/prop-types': 0,
    'react/wrap-multilines': 0,
    'react/no-deprecated': 0,
  },
  plugins: ['prettier', 'jest', 'react', 'jasmine'],
  settings: {
    ecmascript: 2020,
    jsx: true,
    react: {
      version: '16',
    },
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
    jasmine: true,
  },
  globals: {
    globalThis: false,
  },
};
