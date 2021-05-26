import {
  createRollupESConfig,
  createRollupES5Config,
} from '../../createRollupConfig';
import resolve from '@rollup/plugin-node-resolve';
import babel from '@rollup/plugin-babel';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();

let extendedPlugins = [
  resolve({
    extensions: ['.mjs', '.js', '.jsx', '.json'],
  }),
  babel({
    configFile: false,
    presets: ['@babel/preset-react'],
    plugins: ['@babel/plugin-proposal-optional-chaining'],
  }),
];

esConfig.plugins.push(...extendedPlugins);
es5Config.plugins.push(...extendedPlugins);

export default [esConfig, es5Config];
