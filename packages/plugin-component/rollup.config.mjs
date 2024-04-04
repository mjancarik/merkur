import {
  createRollupESConfig,
  createRollupES9Config,
  createRollupUMDConfig,
  createRollupTypescriptConfig,
} from '../../createRollupConfig.mjs';

let esConfig = createRollupESConfig();
let es9Config = createRollupES9Config();
let umdConfig = createRollupUMDConfig();

export default [
  esConfig,
  es9Config,
  umdConfig,
  {
    ...createRollupTypescriptConfig({
      input: './src/helpers.ts',
      dir: './lib',
    }),
  },
];
