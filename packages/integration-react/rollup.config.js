import {
  createRollupESConfig,
  createRollupES5Config,
  createRollupES9Config,
} from '../../createRollupConfig';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();
let es9Config = createRollupES9Config();

let extendedPlugins = [
  resolve({
    extensions: ['.mjs', '.js', '.jsx', '.json'],
  }),
  babel({
    configFile: false,
    presets: ['@babel/preset-react'],
  }),
];

esConfig.plugins.push(...extendedPlugins);
es5Config.plugins.push(...extendedPlugins);
es9Config.plugins.push(...extendedPlugins);

export default [esConfig, es5Config, es9Config];
