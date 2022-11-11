import {
  createRollupESConfig,
  createRollupES9Config,
  createRollupUMDConfig,
} from '../../createRollupConfig';

let esConfig = createRollupESConfig();
let es9Config = createRollupES9Config();
let umdConfig = createRollupUMDConfig();

export default [esConfig, es9Config, umdConfig];
