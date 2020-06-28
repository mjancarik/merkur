import createRollupConfig from '../../rollup';

let config = createRollupConfig();

config.external = ['universal-router', 'universal-router/generateUrls'];

export default config;
