import {
  setDefaultValueForUndefined,
  bindWidgetToFunctions,
  isFunction,
} from './utils';

async function callPluginMethod(widget, method, args) {
  for (const plugin of widget.$plugins) {
    if (isFunction(plugin[method])) {
      widget = await plugin[method](widget, ...args);
    }
  }

  return widget;
}

export async function createMerkurWidget(widgetDefinition = {}) {
  widgetDefinition = setDefaultValueForUndefined(widgetDefinition, [
    '$dependencies',
    '$external',
  ]);
  widgetDefinition = setDefaultValueForUndefined(
    widgetDefinition,
    ['setup', 'create'],
    (widget) => widget,
  );

  const { setup, create } = widgetDefinition;

  let widget = {
    async setup(widget, ...rest) {
      widget = await callPluginMethod(widget, 'setup', rest);

      return setup(widget, ...rest);
    },
    async create(widget, ...rest) {
      widget = await callPluginMethod(widget, 'create', rest);

      return create(widget, ...rest);
    },
    $plugins: (widgetDefinition.$plugins || []).map((pluginFactory) =>
      pluginFactory(),
    ),
  };

  // TODO refactoring
  widget.name = widgetDefinition.name;
  widget.version = widgetDefinition.version;
  widget.$dependencies = widgetDefinition.$dependencies;
  widget.$external = widgetDefinition.$external;
  widget.$in = {};

  delete widgetDefinition.name;
  delete widgetDefinition.version;
  delete widgetDefinition.$dependencies;
  delete widgetDefinition.$external;
  delete widgetDefinition.$plugins;

  delete widgetDefinition.setup;
  delete widgetDefinition.create;

  widget = await widget.setup(widget, widgetDefinition);
  widget = await widget.create(widget, widgetDefinition);

  bindWidgetToFunctions(widget);
  Object.seal(widget);

  return widget;
}
