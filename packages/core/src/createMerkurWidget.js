import {
  setDefaultValueForUndefined,
  bindWidgetToFunctions,
  isFunction,
} from './utils';

export async function callPluginMethod(widget, method, args) {
  for (const plugin of widget.$plugins) {
    if (isFunction(plugin[method])) {
      widget = await plugin[method](widget, ...args);
    }
  }

  return widget;
}

/**
 * Typed helper to make it easier to define widget properties.
 *
 * @type import('@merkur/core').defineWidget
 */
export function defineWidget(widgetDefinition) {
  return widgetDefinition;
}

export function setDefinitionDefaults(widgetDefinition) {
  return {
    ...widgetDefinition,
    ...setDefaultValueForUndefined(
      widgetDefinition,
      ['containerSelector'],
      null,
    ),
    ...setDefaultValueForUndefined(widgetDefinition, [
      'slot',
      '$dependencies',
      '$external',
    ]),
    ...setDefaultValueForUndefined(
      widgetDefinition,
      ['setup', 'create'],
      (widget) => widget,
    ),
  };
}

/**
 * @type import('@merkur/core').createMerkurWidget
 */
export async function createMerkurWidget(widgetDefinition = {}) {
  const definition = setDefinitionDefaults(widgetDefinition);
  const { setup, create } = definition;

  let widget = {
    async setup(widget, ...rest) {
      widget = await callPluginMethod(widget, 'setup', rest);

      return setup(widget, ...rest);
    },
    async create(widget, ...rest) {
      widget = await callPluginMethod(widget, 'create', rest);

      return create(widget, ...rest);
    },
    $plugins: (definition.$plugins || []).map((pluginFactory) =>
      pluginFactory(),
    ),
  };

  // TODO refactoring
  widget.name = definition.name;
  widget.version = definition.version;
  widget.$dependencies = definition.$dependencies;
  widget.$external = definition.$external;
  widget.$in = {};

  delete definition.name;
  delete definition.version;
  delete definition.$dependencies;
  delete definition.$external;
  delete definition.$plugins;

  delete definition.setup;
  delete definition.create;

  widget = await widget.setup(widget, definition);
  widget = await widget.create(widget, definition);

  bindWidgetToFunctions(widget);
  Object.seal(widget);

  return widget;
}
