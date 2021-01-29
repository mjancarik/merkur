import {
  createRollupESConfig,
  createRollupES5Config,
} from '../../createRollupConfig';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();

const babelConfig = {
  babelrc: false,
  plugins: [
    '@babel/plugin-proposal-nullish-coalescing-operator',
    '@babel/plugin-proposal-optional-chaining',
  ],
};

esConfig.plugins.push(getBabelOutputPlugin(babelConfig));

export default [esConfig, es5Config];
