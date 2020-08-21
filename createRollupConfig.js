import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

const { name } = require(__dirname + '/package.json');

const babelBaseConfig = {
  babelrc: false,
  presets: [
    [
      '@babel/env',
      {
        modules: false,
        useBuiltIns: 'usage',
        corejs: { version: 3, proposals: false },
      },
    ],
  ],
};

const babelUMDConfig = {
  babelrc: false,
  allowAllFormats: true,
  presets: [
    [
      '@babel/env',
      {
        modules: 'umd',
        useBuiltIns: 'entry',
        corejs: { version: 3, proposals: false },
        exclude: ['@babel/plugin-transform-regenerator'],
      },
    ],
  ],
  plugins: [
    [
      '@babel/plugin-transform-modules-umd',
      {
        globals: {
          '@merkur/core': getGlobalName('@merkur/core'),
          '@merkur/plugin-component': getGlobalName('@merkur/plugin-component'),
          '@merkur/plugin-event': getGlobalName('@merkur/plugin-event'),
          '@merkur/plugin-http-client': getGlobalName(
            '@merkur/plugin-http-client'
          ),
          'node-fetch': 'fetch',
        },
        exactGlobals: true,
      },
    ],
  ],
  moduleId: name,
};

function getGlobalName(name) {
  return `Merkur.${name
    .replace(/(@merkur\/)/g, '')
    .replace(/(plugin-)/g, 'Plugin.')
    .replace(/[-]/g, '')
    .replace(
      /([^.]*)$/,
      (merkurPackage) =>
        merkurPackage[0].toUpperCase() +
        merkurPackage.slice(1, merkurPackage.length)
    )}`;
}

function createRollupConfig() {
  const config = {
    input: 'src/index.js',
    treeshake: {
      moduleSideEffects: 'no-external',
    },
    plugins: [peerDepsExternal()],
    output: [
      {
        file: `./lib/index.js`,
        format: 'cjs',
        exports: 'named',
      },
      {
        file: `./lib/index.min.js`,
        format: 'cjs',
        exports: 'named',
        plugins: [terser()],
      },
      {
        file: `./lib/index.mjs`,
        format: 'esm',
        exports: 'named',
      },
      {
        file: `./lib/index.min.mjs`,
        format: 'esm',
        exports: 'named',
        plugins: [terser()],
      },
      {
        file: `./lib/index.es5.js`,
        format: 'cjs',
        exports: 'named',
        plugins: [getBabelOutputPlugin(babelBaseConfig)],
      },
      {
        file: `./lib/index.es5.min.js`,
        format: 'cjs',
        exports: 'named',
        plugins: [getBabelOutputPlugin(babelBaseConfig), terser()],
      },
      {
        file: `./lib/index.es5.mjs`,
        format: 'esm',
        exports: 'named',
        plugins: [getBabelOutputPlugin(babelBaseConfig)],
      },
      {
        file: `./lib/index.es5.min.mjs`,
        format: 'esm',
        exports: 'named',
        plugins: [getBabelOutputPlugin(babelBaseConfig), terser()],
      },
    ],
  };

  return config;
}

function createRollupUMDConfig() {
  let config = createRollupConfig();

  config.output = [
    {
      file: `./lib/index.umd.js`,
      format: 'esm',
      plugins: [],
    },
  ];

  config.plugins.push(getBabelOutputPlugin(babelUMDConfig));

  return config;
}

export default createRollupConfig;

export { createRollupConfig, createRollupUMDConfig };
