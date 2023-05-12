import {
  createRollupESConfig,
  createRollupES5Config,
  createRollupES9Config,
} from '../../createRollupConfig.mjs';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();
let es9Config = createRollupES9Config();

export default [esConfig, es9Config, es5Config];
