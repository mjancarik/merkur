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
        modules: false,
      },
    ],
  ],
};

function getGlobalName(name) {
  return `__${name.replace(/[@\-/]/g, '')}__`;
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
      {
        file: `./lib/index.umd.js`,
        format: 'umd',
        name: getGlobalName(name),
        plugins: [getBabelOutputPlugin(babelUMDConfig), terser()],
        globals: {
          '@merkur/core': getGlobalName('@merkur/core'),
          '@merkur/plugin-component': getGlobalName('@merkur/plugin-component'),
          '@merkur/plugin-event': getGlobalName('@merkur/plugin-event'),
          '@merkur/plugin-http-client': getGlobalName(
            '@merkur/plugin-http-client'
          ),
          'node-fetch': 'fetch',
        },
      },
    ],
  };

  return config;
}

export default createRollupConfig;
