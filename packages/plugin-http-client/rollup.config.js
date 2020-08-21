import {
  createRollupConfig,
  createRollupUMDConfig,
} from '../../createRollupConfig';

let config = createRollupConfig();
config.external = ['node-fetch'];

export default [config, createRollupUMDConfig()];
