import {
  createRollupESConfig,
  createRollupES9Config,
  createRollupUMDConfig,
} from '../../createRollupConfig.mjs';

let esConfig = createRollupESConfig(1);
let es9Config = createRollupES9Config(1);
let umdConfig = createRollupUMDConfig(1);

export default [esConfig, es9Config, umdConfig];
