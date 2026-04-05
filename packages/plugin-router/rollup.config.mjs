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

const esBaseExternal = esConfig.external;
esConfig.external = (id) =>
  esBaseExternal(id) ||
  extendedExternal.some((dep) => id === dep || id.startsWith(dep + '/'));
const es9BaseExternal = es9Config.external;
es9Config.external = (id) =>
  es9BaseExternal(id) ||
  extendedExternal.some((dep) => id === dep || id.startsWith(dep + '/'));

export default [
  esConfig,
  es9Config,
  routerEventsEsConfig,
  routerEventsEs9Config,
];
