import createRollupConfig from '../../createRollupConfig';

let config = createRollupConfig();

config.external = ['node-fetch'];

export default config;
