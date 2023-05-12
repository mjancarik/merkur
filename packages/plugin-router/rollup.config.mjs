import {
  createRollupESConfig,
  createRollupES5Config,
  createRollupES9Config,
} from '../../createRollupConfig.mjs';

let esConfig = createRollupESConfig();
let es5Config = createRollupES5Config();
let es9Config = createRollupES9Config();

let routerEventsConfig = {
  input: 'src/RouterEvents.js',
};

let routerEventsEsConfig = { ...esConfig, ...routerEventsConfig };
let routerEventsEs5Config = { ...es5Config, ...routerEventsConfig };
let routerEventsEs9Config = { ...es9Config, ...routerEventsConfig };

let extendedExternal = ['universal-router', 'universal-router/generateUrls'];

esConfig.external = [...esConfig.external, ...extendedExternal];
es5Config.external = [...es5Config.external, ...extendedExternal];
es9Config.external = [...es9Config.external, ...extendedExternal];

export default [
  esConfig,
  es5Config,
  es9Config,
  routerEventsEsConfig,
  routerEventsEs5Config,
  routerEventsEs9Config,
];
