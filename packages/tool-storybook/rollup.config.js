import {
  createRollupESConfig,
  createRollupES5Config,
} from '../../createRollupConfig';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();

export default [esConfig, es5Config];
