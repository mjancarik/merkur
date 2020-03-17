import { componentPlugin } from './plugins/componentPlugin';
import { eventEmitterPlugin } from './plugins/eventEmitterPlugin';
import { createCustomWidget } from './createCustomWidget';
import { createMerkur, removeMerkur, getMerkur } from './merkur';

async function createWidget(widgetDefinition = {}) {
  widgetDefinition.$plugins = [componentPlugin, eventEmitterPlugin];

  return createCustomWidget(widgetDefinition);
}

export {
  createWidget,
  createCustomWidget,
  createMerkur,
  removeMerkur,
  getMerkur,
  componentPlugin,
  eventEmitterPlugin
};
