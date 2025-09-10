module.exports = {
  plugins: ['@babel/plugin-transform-modules-commonjs'],
  presets: [
    [
      '@babel/preset-react',
      {
        runtime: 'automatic',
        importSource: 'preact',
      },
    ],
    {
      test: /\.mjs$/,
      presets: [['@babel/preset-env', { targets: { node: 'current' } }]],
    },
  ],
};
