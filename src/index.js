import componentPlugin from './plugins/component';
import eventEmitterPlugin from './plugins/eventEmitter';
import { createCustomWidget } from './createCustomWidget';

async function createWidget(widgetDefinition = {}) {
  widgetDefinition.$plugins = [componentPlugin, eventEmitterPlugin];

  return createCustomWidget(widgetDefinition);
}

export {
  createWidget,
  createCustomWidget,
  componentPlugin,
  eventEmitterPlugin
};
