import { isFunction } from './utils';

function register({ name, version, createWidget }) {
  const merkur = getMerkur();

  merkur.$in.widgetFactory[name + version] = createWidget;
}

function create(widgetProperties = {}) {
  const merkur = getMerkur();
  const { name, version } = widgetProperties;
  const factory = merkur.$in.widgetFactory[name + version];

  if (!isFunction(factory)) {
    throw new Error(
      `The widget with defined name and version "${
        name + version
      }" is not defined.`
    );
  }

  return factory(widgetProperties);
}

export function createMerkur({ $plugins = [] } = {}) {
  const merkur = getMerkur();

  $plugins.forEach((plugin) => {
    if (plugin && isFunction(plugin.setup)) {
      plugin.setup(merkur);
    }
  });

  return merkur;
}

export function removeMerkur() {
  const globalContext = getGlobalContext();

  delete globalContext.__merkur__;
}

export function getMerkur() {
  const globalContext = getGlobalContext();

  if (!globalContext.__merkur__) {
    globalContext.__merkur__ = {
      $in: {
        widgets: [],
        widgetFactory: {},
      },
      $external: {},
      $dependencies: {},
      register,
      create,
    };
  }

  return globalContext.__merkur__;
}

function getGlobalContext() {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  if (typeof self !== 'undefined') {
    return self;
  }
  if (typeof window !== 'undefined') {
    return window;
  }
  if (typeof global !== 'undefined') {
    return global;
  }

  return {};
}
