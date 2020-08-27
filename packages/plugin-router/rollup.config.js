import {
  createRollupESConfig,
  createRollupES5Config,
} from '../../createRollupConfig';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();

let extendedExternal = ['universal-router', 'universal-router/generateUrls'];

esConfig.external = [...esConfig.external, ...extendedExternal];
es5Config.external = [...es5Config.external, ...extendedExternal];

export default [esConfig, es5Config];
