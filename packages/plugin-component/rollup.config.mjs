import {
  createRollupESConfig,
  createRollupES9Config,
  createRollupUMDConfig,
  createRollupTypescriptES9Config,
  createRollupTypescriptConfig,
} from '../../createRollupConfig.mjs';

let esConfig = createRollupESConfig();
let es9Config = createRollupES9Config();
let umdConfig = createRollupUMDConfig();

export default [
  esConfig,
  es9Config,
  umdConfig,
  createRollupTypescriptConfig({
    input: './src/helpers.ts',
  }),
  createRollupTypescriptES9Config({
    input: './src/helpers.ts',
  }),
];
