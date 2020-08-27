import {
  createRollupESConfig,
  createRollupES5Config,
  createRollupUMDConfig,
} from '../../createRollupConfig';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();
let umdConfig = createRollupUMDConfig();

export default [esConfig, es5Config, umdConfig];