import {
  Widget,
  WidgetDefintition,
  CreateFunction,
  WidgetFunction,
} from './types';

import {
  setDefaultValueForUndefined,
  bindWidgetToFunctions,
  isFunction,
} from './utils';

async function callPluginMethod(
  widget: Partial<Widget>,
  method: string,
  args: unknown[]
): Promise<Widget> {
  for (const plugin of widget.$plugins || []) {
    if (isFunction(plugin[method])) {
      widget = await (plugin[method] as WidgetFunction)(widget, ...args);
    }
  }

  return widget as Widget;
}

export async function createMerkurWidget(
  widgetDefinition: Partial<WidgetDefintition> = {}
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

  const { setup, create } = widgetDefinition as {
    setup: WidgetFunction;
    create: CreateFunction;
  };

  let widget: Partial<Widget> & {
    setup: WidgetFunction;
    create: CreateFunction;
  } = {
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
  widget.name = widgetDefinition.name;
  widget.version = widgetDefinition.version;
  widget.$dependencies = widgetDefinition.$dependencies;
  widget.$external = widgetDefinition.$external;
  widget.$in = {
    widgets: [],
    widgetFactory: {},
  };

  delete widgetDefinition.name;
  delete widgetDefinition.version;
  delete widgetDefinition.$dependencies;
  delete widgetDefinition.$external;
  delete widgetDefinition.$plugins;

  delete widgetDefinition.setup;
  delete widgetDefinition.create;

  widget = await widget.setup(widget, widgetDefinition);
  widget = await widget.create(widget as Widget, widgetDefinition);

  bindWidgetToFunctions(widget as Widget);
  Object.seal(widget);

  return widget as Widget;
}
