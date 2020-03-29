module.exports = {
    'extends': ['eslint:recommended', 'plugin:react/recommended', 'prettier', 'prettier/react'],
    'rules': {
        'prettier/prettier': [
            'error', {
                singleQuote: true,
                jsxBracketSameLine: true
            }
        ],

        'no-console': ['error', {
            allow: ['warn', 'error']
        }],

        'react/prop-types': 0,
        'react/wrap-multilines': 0,
        'react/no-deprecated': 0
    },
    'plugins': [
        'prettier',
        'jest',
        'react',
        'jasmine'
    ],
    'settings': {
        'ecmascript': 2020,
        'jsx': true,
        'react': {
            'version': '16'
        }
    },
    'parserOptions': {
        'sourceType': 'module',
        'ecmaVersion': 11,
    },
    'env': {
        'browser': true,
        'node': true,
        'es6': true,
        'jest': true
    },
    'globals': {}
};
