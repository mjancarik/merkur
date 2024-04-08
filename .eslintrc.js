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

    'react/react-in-jsx-scope': 'off',
    'react/prop-types': 'off',
    'react/wrap-multilines': 'off',
    'react/no-deprecated': 'off',
  },
  plugins: ['prettier', 'jest', 'react', 'jasmine'],
  settings: {
    ecmascript: 2022,
    jsx: true,
    react: {
      version: '18',
    },
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 13,
  },
  env: {
    [`es2022`]: true,
    browser: true,
    node: true,
    es6: true,
    jest: true,
    jasmine: true,
  },
  globals: {
    globalThis: false,
  },
  overrides: [
    // Typescript support
    {
      files: ['**/*.{ts,tsx}'],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        tsconfigRootDir: __dirname,
        project: ['./tsconfig.json', './packages/*/tsconfig.json'],
      },
      extends: [
        'plugin:@typescript-eslint/recommended',
        // 'plugin:@typescript-eslint/recommended-requiring-type-checking', // TODO
      ],
      plugins: ['@typescript-eslint'],
      rules: {
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/ban-ts-comment': [
          'error',
          { 'ts-expect-error': false },
        ],
        '@typescript-eslint/no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            destructuredArrayIgnorePattern: '^_',
            ignoreRestSiblings: true,
            args: 'none',
          },
        ],
        '@typescript-eslint/no-namespace': [
          'error',
          { allowDeclarations: true },
        ],
      },
    },
  ],
};
