export function bindWidgetToFunctions(widget) {
  Object.keys(widget).forEach(key => {
    if (typeof widget[key] === 'function') {
      let originalFunction = widget[key];

      widget[key] = (...rest) => {
        return originalFunction(widget, ...rest);
      };
    }
  });
}

export function setEmptyObjectForUndefined(object, keys) {
  keys.forEach(key => {
    object[key] = object[key] || {};
  });
}

export async function callPluginMethod(widget, method, args) {
  for (const plugin of widget.$plugins) {
    if (typeof plugin[method] === 'function') {
      const newWidget = await plugin[method](widget, ...args);

      if (newWidget) {
        widget = newWidget;
      }
    }
  }

  return widget;
}

export async function createCustomWidget(widgetDefinition = {}) {
  setEmptyObjectForUndefined(widgetDefinition, ['$dependencies', '$external']);

  let widget = {
    async setup(widget, ...rest) {
      return callPluginMethod(widget, 'setup', rest);
    },
    async create(widget, ...rest) {
      return callPluginMethod(widget, 'create', rest);
    },
    $plugins: (widgetDefinition.$plugins || []).map(pluginFactory =>
      pluginFactory()
    )
  };

  widget.$setEmptyObjectForUndefined = setEmptyObjectForUndefined;

  widget.$dependencies = widgetDefinition.$dependencies;
  widget.$in = {};

  delete widgetDefinition.$dependencies;
  delete widgetDefinition.$plugins;

  widget = await widget.setup(widget, widgetDefinition);
  widget = await widget.create(widget, widgetDefinition);

  bindWidgetToFunctions(widget);
  Object.seal(widget);

  return widget;
}
