import {
  createRollupESConfig,
  createRollupES9Config,
} from '../../createRollupConfig.mjs';

let esConfig = createRollupESConfig();
let es9Config = createRollupES9Config();

let routerEventsConfig = {
  input: 'src/RouterEvents.js',
};

let routerEventsEsConfig = { ...esConfig, ...routerEventsConfig };
let routerEventsEs9Config = { ...es9Config, ...routerEventsConfig };

let extendedExternal = ['universal-router', 'universal-router/generateUrls'];

esConfig.external = [...esConfig.external, ...extendedExternal];
es9Config.external = [...es9Config.external, ...extendedExternal];

export default [
  esConfig,
  es9Config,
  routerEventsEsConfig,
  routerEventsEs9Config,
];
