import { Widget, WidgetDefintition, WidgetFunction } from './types';

import {
  setDefaultValueForUndefined,
  bindWidgetToFunctions,
  isFunction,
} from './utils';

async function callPluginMethod(
  widget: Widget,
  method: string,
  args: unknown[]
): Promise<Widget> {
  for (const plugin of widget.$plugins || []) {
    if (isFunction(plugin[method])) {
      widget = await (plugin[method] as WidgetFunction)(widget, ...args);
    }
  }

  return widget;
}

export async function createMerkurWidget(
  widgetDefinition: WidgetDefintition
): Promise<Widget> {
  widgetDefinition = setDefaultValueForUndefined(widgetDefinition, [
    '$dependencies',
    '$external',
  ]);
  widgetDefinition = setDefaultValueForUndefined(
    widgetDefinition,
    ['setup', 'create'],
    (widget) => widget
  );

  const { setup, create } = widgetDefinition;

  let widget: Widget = {
    name: widgetDefinition.name,
    version: widgetDefinition.version,
    $dependencies: widgetDefinition.$dependencies,
    $external: widgetDefinition.$external,
    $in: {
      widgets: [],
      widgetFactory: {},
    },
    async setup(widget, ...rest) {
      widget = await callPluginMethod(widget, 'setup', rest);

      return setup(widget, ...rest);
    },
    async create(widget, ...rest) {
      widget = await callPluginMethod(widget, 'create', rest);

      return create(widget, ...rest);
    },
    $plugins: (widgetDefinition.$plugins || []).map((pluginFactory) =>
      // kdyby se tu davaly primo provolane pluginy, tak by byl type match na "Widget"
      pluginFactory()
    ),
  };

  // TODO refactoring
  // widget.name = widgetDefinition.name;
  // widget.version = widgetDefinition.version;
  // widget.$dependencies = widgetDefinition.$dependencies;
  // widget.$external = widgetDefinition.$external;
  // widget.$in = {
  //   widgets: [],
  //   widgetFactory: {},
  // };

  // vse by muselo byt optional
  // delete widgetDefinition.name;
  // delete widgetDefinition.version;
  // delete widgetDefinition.$dependencies;
  // delete widgetDefinition.$external;
  // delete widgetDefinition.$plugins;

  // delete widgetDefinition.setup;
  // delete widgetDefinition.create;

  widget = await widget.setup(widget, widgetDefinition);
  widget = await widget.create(widget, widgetDefinition);

  bindWidgetToFunctions(widget);
  Object.seal(widget);

  return widget;
}
