import {
  Widget,
  WidgetDefintition,
  WidgetFunction,
  CreateFunction,
} from './types';

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
  for (const plugin of widget.$plugins) {
    if (isFunction(plugin[method])) {
      widget = await (plugin[method] as WidgetFunction)(widget, ...args);
    }
  }

  return widget;
}

export async function createMerkurWidget(
  widgetDefinition: Partial<WidgetDefintition>
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

  const partialWidget: Partial<Widget> = {
    async setup(widget, ...rest) {
      widget = await callPluginMethod(widget, 'setup', rest);

      return setup(widget, ...rest);
    },
    async create(widget, ...rest) {
      widget = await callPluginMethod(widget, 'create', rest);

      return create(widget, ...rest);
    },
    $plugins: (widgetDefinition.$plugins || []).map((pluginFactory) =>
      pluginFactory()
    ),
  };

  // TODO refactoring
  partialWidget.name = widgetDefinition.name;
  partialWidget.version = widgetDefinition.version;
  partialWidget.$dependencies = widgetDefinition.$dependencies;
  partialWidget.$external = widgetDefinition.$external;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  partialWidget.$in = {};

  delete widgetDefinition.name;
  delete widgetDefinition.version;
  delete widgetDefinition.$dependencies;
  delete widgetDefinition.$external;
  delete widgetDefinition.$plugins;

  delete widgetDefinition.setup;
  delete widgetDefinition.create;

  let widget = partialWidget as Widget;

  widget = await widget.setup(widget, widgetDefinition);
  widget = await widget.create(widget, widgetDefinition);

  bindWidgetToFunctions(widget);
  Object.seal(widget);

  return widget;
}
