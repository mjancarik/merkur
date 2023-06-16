import {
  createRollupESConfig,
  createRollupES9Config,
} from '../../createRollupConfig.mjs';

let esConfig = createRollupESConfig();
let es9Config = createRollupES9Config();

export default [esConfig, es9Config];
