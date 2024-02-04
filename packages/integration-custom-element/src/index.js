import { getMerkur, createMerkurWidget } from '@merkur/core';
import { loadAssets } from '@merkur/integration';

async function createSPAWidget(widgetDefinition) {
  const definition = {
    ...widgetDefinition,
    createWidget: widgetDefinition.createWidget || createMerkurWidget,
  };

  getMerkur().register(definition);

  await afterDOMLoad();
  await loadAssets(definition.assets, definition.container);

  return await getMerkur().create(definition);
}

function afterDOMLoad() {
  return new Promise((resolve) => {
    if (typeof document !== 'undefined') {
      if (document.readyState !== 'loading') {
        resolve();
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          resolve();
        });
      }
    } else {
      resolve();
    }
  });
}

function registerCustomElement({ widgetDefinition }) {
  class WidgetElement extends HTMLElement {
    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'open' });

      (async () => {
        try {
          widgetDefinition.container = widgetDefinition.container || shadow;
          const widget = await createSPAWidget(widgetDefinition);
          await widget.mount();
        } catch (error) {
          console.error(error);
        }
      })();
    }
  }

  if (customElements.get(widgetDefinition.name) === undefined) {
    customElements.define(widgetDefinition.name, WidgetElement);
  }
}

export { registerCustomElement };
