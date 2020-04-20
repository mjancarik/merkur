import { setDefaultValueForUndefined } from './utils';

function bindWidgetToFunctions(widget) {
  Object.keys(widget).forEach((key) => {
    if (typeof widget[key] === 'function') {
      let originalFunction = widget[key];

      widget[key] = (...rest) => {
        return originalFunction(widget, ...rest);
      };
    }
  });
}

async function callPluginMethod(widget, method, args) {
  for (const plugin of widget.$plugins) {
    if (typeof plugin[method] === 'function') {
      widget = await plugin[method](widget, ...args);
    }
  }

  return widget;
}

export async function createMerkurWidget(widgetDefinition = {}) {
  setDefaultValueForUndefined(widgetDefinition, ['$dependencies', '$external']);

  let widget = {
    async setup(widget, ...rest) {
      return callPluginMethod(widget, 'setup', rest);
    },
    async create(widget, ...rest) {
      return callPluginMethod(widget, 'create', rest);
    },
    $plugins: (widgetDefinition.$plugins || []).map((pluginFactory) =>
      pluginFactory()
    ),
  };

  // TODO refactoring
  widget.$dependencies = widgetDefinition.$dependencies;
  widget.$external = widgetDefinition.$external;
  widget.$in = {};

  delete widgetDefinition.$dependencies;
  delete widgetDefinition.$external;
  delete widgetDefinition.$plugins;

  widget = await widget.setup(widget, widgetDefinition);
  widget = await widget.create(widget, widgetDefinition);

  bindWidgetToFunctions(widget);
  Object.seal(widget);

  return widget;
}
