import { terser } from 'rollup-plugin-terser';

const config = {
  input: 'src/index.js',
  treeshake: {
    pureExternalModules: true
  },
  output: [
    {
      file: `./lib/merkur.js`,
      format: 'cjs',
      exports: 'named'
    },
    {
      file: `./lib/merkur.min.js`,
      format: 'cjs',
      exports: 'named',
      plugins: [terser()]
    },
    {
      file: `./lib/merkur.mjs`,
      format: 'esm',
      exports: 'named'
    },
    {
      file: `./lib/merkur.min.mjs`,
      format: 'esm',
      exports: 'named',
      plugins: [terser()]
    }
  ]
};

export default config;
