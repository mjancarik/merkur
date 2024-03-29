import { getMerkur, createMerkurWidget } from '@merkur/core';
import { loadAssets } from '@merkur/integration';

async function createSPAWidget(widgetDefinition) {
  const definition = {
    ...widgetDefinition,
    createWidget: widgetDefinition.createWidget || createMerkurWidget,
  };

  getMerkur().register(definition);

  await afterDOMLoad();
  await loadAssets(definition.assets, definition.root);

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

function registerCustomElement({ widgetDefinition, callbacks }) {
  class WidgetElement extends HTMLElement {
    constructor() {
      super();

      const shadow = this.attachShadow({ mode: 'open' });

      (async () => {
        try {
          widgetDefinition.root = shadow;
          widgetDefinition.customElement = this;

          if (!widgetDefinition.container) {
            widgetDefinition.container = document.createElement('div');
            widgetDefinition.container.setAttribute('id', 'merkur-container');
          }

          widgetDefinition.root.appendChild(widgetDefinition.container);

          this._widget = await createSPAWidget(widgetDefinition);
          this._widget.mount();

          callbacks?.constructor(this._widget);
        } catch (error) {
          console.error(error);
        }
      })();
    }

    connectedCallback() {
      callbacks?.connectedCallback(this._widget);
    }

    disconnectedCallback() {
      callbacks?.disconnectedCallback(this._widget);
    }

    adoptedCallback() {
      callbacks?.adoptedCallback(this._widget);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      callbacks?.attributeChangedCallback(
        this._widget,
        name,
        oldValue,
        newValue,
      );
    }
  }

  if (customElements.get(widgetDefinition.name) === undefined) {
    customElements.define(widgetDefinition.name, WidgetElement);
  }
}

function deepMerge(target, source) {
  const isObject = (obj) => !!obj && obj.constructor === Object;

  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach((key) => {
    const targetValue = target[key];
    const sourceValue = source[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      target[key] = targetValue.concat(sourceValue);
    } else if (isObject(targetValue) && isObject(sourceValue)) {
      target[key] = deepMerge(Object.assign({}, targetValue), sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
}

export { registerCustomElement, deepMerge };
