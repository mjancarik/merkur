import {
  createRollupESConfig,
  createRollupES9Config,
  createRollupUMDConfig,
} from '../../createRollupConfig.mjs';

let esConfig = createRollupESConfig();
let es9Config = createRollupES9Config();
let umdConfig = createRollupUMDConfig();

let helpersConfig = createRollupESConfig();
let helpersES9Config = createRollupES9Config();
let umdHelpersConfig = createRollupUMDConfig();
helpersConfig.input = './src/helpers.js';
helpersES9Config.input = './src/helpers.js';
umdHelpersConfig.input = './src/helpers.js';

export default [
  esConfig,
  es9Config,
  umdConfig,
  helpersConfig,
  helpersES9Config,
  umdHelpersConfig,
];
