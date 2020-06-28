import createRollupConfig from '../../rollup';

let config = createRollupConfig();

config.external = ['node-fetch'];

export default config;
