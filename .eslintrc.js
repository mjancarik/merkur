module.exports = {
    'extends': ['eslint:recommended', 'prettier'],
    'rules': {
        'prettier/prettier': [
            'error', {
                singleQuote: true,
                jsxBracketSameLine: true
            }
        ],

        'no-console': ['error', {
            allow: ['warn', 'error']
        }]

    },
    'plugins': [
        'prettier',
        'jest'
    ],
    'settings': {
        'ecmascript': 2020
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
