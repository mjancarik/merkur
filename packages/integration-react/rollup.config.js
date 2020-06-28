import createRollupConfig from '../../createRollupConfig';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

let config = createRollupConfig();

config.plugins.push(
  ...[
    resolve({
      extensions: ['.mjs', '.js', '.jsx', '.json'],
    }),
    babel({
      configFile: false,
      presets: ['@babel/preset-react'],
    }),
  ]
);

export default config;
