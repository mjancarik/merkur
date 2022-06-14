import { bindWidgetToFunctions, isFunction } from './utils';

import { Widget, WidgetDefinition } from './types';

async function callPluginMethod(widget, method, args) {
  for (const plugin of widget.$plugins) {
    if (isFunction(plugin[method])) {
      widget = await plugin[method](widget, ...args);
    }
  }

  return widget;
}

export async function createMerkurWidget(widgetDefinition: WidgetDefinition) {
  let widget = {
    name: widgetDefinition.name,
    version: widgetDefinition.version,
    $dependencies: widgetDefinition.$dependencies ?? {},
    $external: widgetDefinition.$external ?? {},
    $in: {},
    $plugins: (widgetDefinition.$plugins || []).map((pluginFactory) =>
      pluginFactory()
    ),
  } as Partial<Widget>;

  const { setup, create } = widgetDefinition;

  widget = await callPluginMethod(widget, 'setup', [widgetDefinition]);
  widget = setup ? await setup(widget, widgetDefinition) : widget;
  widget = await callPluginMethod(widget, 'create', [widgetDefinition]);
  widget = create ? await create(widget, widgetDefinition) : widget;

  bindWidgetToFunctions(widget);
  Object.seal(widget);

  return widget as Widget;
}
