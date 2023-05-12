import {
  createRollupESConfig,
  createRollupES5Config,
  createRollupES9Config,
} from '../../createRollupConfig.mjs';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();
let es9Config = createRollupES9Config();

let extendedPlugins = [
  commonjs({
    include: /node_modules/,
    requireReturnsDefault: 'auto', // <---- this solves default issue
  }),
  replace({
    preventAssignment: false,
    values: {
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  }),
  resolve({
    extensions: ['.mjs', '.js', '.jsx', '.json'],
  }),
  babel({
    configFile: false,
    babelHelpers: 'inline',
    presets: ['@babel/preset-react'],
  }),
];

esConfig.plugins.push(...extendedPlugins);
es5Config.plugins.push(...extendedPlugins);
es9Config.plugins.push(...extendedPlugins);

export default [esConfig, es9Config, es5Config];
