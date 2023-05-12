import {
  createRollupESConfig,
  createRollupES5Config,
  createRollupES9Config,
  createRollupUMDConfig,
} from '../../createRollupConfig.mjs';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();
let es9Config = createRollupES9Config();
let umdConfig = createRollupUMDConfig();

export default [esConfig, es5Config, es9Config, umdConfig];
