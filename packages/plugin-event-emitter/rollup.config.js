import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';

const config = {
  input: 'src/index.js',
  treeshake: {
    pureExternalModules: true,
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
  ],
};

export default config;
