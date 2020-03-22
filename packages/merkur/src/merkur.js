function register(name, version, factory) {
  const merkur = getMerkur();

  merkur.$in.widgetFactory[name + version] = factory;
}

function create(name, version, props = {}) {
  const merkur = getMerkur();
  const factory = merkur.$in.widgetFactory[name + version];

  if (typeof factory !== 'function') {
    throw new Error(
      `The widget with defined name and version "${
        name + version
      }" is not defined.`
    );
  }

  return factory(props);
}

function connect(widget) {
  const merkur = getMerkur();

  merkur.$in.widgets.push(widget);
}

function disconnect(widget) {
  const merkur = getMerkur();
  const widgetIndex = merkur.$in.widgets.indexOf(widget);

  if (widgetIndex !== -1) {
    merkur.$in.widgets.splice(widgetIndex, 1);
  }
}

export function createMerkur(plugins = []) {
  const merkur = getMerkur();

  plugins.forEach((plugin) => {
    if (plugin && typeof plugin.setup === 'function') {
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
      connect,
      disconnect,
    };
  }

  return globalContext.__merkur__;
}

function getGlobalContext() {
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
