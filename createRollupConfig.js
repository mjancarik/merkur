import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

const babelConfig = {
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
        plugins: [getBabelOutputPlugin(babelConfig)],
      },
      {
        file: `./lib/index.es5.min.js`,
        format: 'cjs',
        exports: 'named',
        plugins: [getBabelOutputPlugin(babelConfig), terser()],
      },
      {
        file: `./lib/index.es5.mjs`,
        format: 'esm',
        exports: 'named',
        plugins: [getBabelOutputPlugin(babelConfig)],
      },
      {
        file: `./lib/index.es5.min.mjs`,
        format: 'esm',
        exports: 'named',
        plugins: [getBabelOutputPlugin(babelConfig), terser()],
      },
    ],
  };

  return config;
}

export default createRollupConfig;
