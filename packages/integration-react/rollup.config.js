import { terser } from 'rollup-plugin-terser';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';

const config = {
  input: 'src/index.js',
  treeshake: {
    moduleSideEffects: 'no-external',
  },
  plugins: [
    peerDepsExternal(),
    resolve({
      extensions: ['.mjs', '.js', '.jsx', '.json'],
    }),
    babel({
      configFile: false,
      presets: ['@babel/preset-react'],
    }),
  ],
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
