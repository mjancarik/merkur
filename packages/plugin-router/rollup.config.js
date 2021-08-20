import {
  createRollupESConfig,
  createRollupES5Config,
  createRollupES9Config,
} from '../../createRollupConfig';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();
let es9Config = createRollupES9Config();

let extendedExternal = ['universal-router', 'universal-router/generateUrls'];

esConfig.external = [...esConfig.external, ...extendedExternal];
es5Config.external = [...es5Config.external, ...extendedExternal];
es9Config.external = [...es9Config.external, ...extendedExternal];

export default [esConfig, es5Config, es9Config];
