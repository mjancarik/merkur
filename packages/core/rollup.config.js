import {
  // createRollupESConfig,
  // createRollupES5Config,
  // createRollupUMDConfig,
  createRollupTypescriptConfig,
} from '../../createRollupConfig';

let typescriptConfig = createRollupTypescriptConfig({ watchMode: true });

export default [typescriptConfig];

// let esConfig = createRollupESConfig();
// let es5Config = createRollupES5Config();
// let umdConfig = createRollupUMDConfig();

// export default [esConfig, es5Config, umdConfig];
