import { getMerkur } from '@merkur/core';
import { loadAssets } from '@merkur/integration';

async function createSPAWidget(widgetDefinition, root) {
  const definition = {
    ...widgetDefinition,
    createWidget: widgetDefinition.createWidget,
  };

  const merkur = getMerkur();
  if (!merkur.isRegistered(definition.name + definition.version)) {
    getMerkur().register(definition);
  }

  await afterDOMLoad();
  await loadAssets(definition.assets, root);

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

function registerCustomElement(options) {
  const { widgetDefinition, callbacks, observedAttributes } = deepMerge({}, options);
  class HTMLCustomElement extends HTMLElement {
    static observedAttributes = observedAttributes;
    constructor(...$) {
      const _ = super(...$);
      _._init();
      return _;
    }
    _init() {}
  }

  class WidgetElement extends HTMLCustomElement {
    _init() {
      try {
        super._init();
        const customWidgetDefinition = deepMerge({}, widgetDefinition);

        (async () => {
          this._shadow = this.attachShadow({ mode: 'open' });

          try {
            const widget = await callbacks?.getInstance?.();

            if (widget && widget.name && widget.version) {
              this._widget = widget;

              await afterDOMLoad();
              await loadAssets(widget.assets, this._shadow);

              await callbacks?.reconstructor?.(this._widget, {
                shadow: this._shadow,
                customElement: this,
              });

              if (typeof callbacks?.remount === 'function') {
                await callbacks?.remount?.(this._widget, {
                  shadow: this._shadow,
                  customElement: this,
                });
              } else {
                widget.root = this._shadow;
                widget.customElement = this;
                this._shadow.appendChild(widget.container);
              }

              return;
            }
          } catch (error) {
            console.error(error);

            return;
          }

          try {
            customWidgetDefinition.root = this._shadow;
            customWidgetDefinition.customElement = this;

            if (!customWidgetDefinition.container) {
              customWidgetDefinition.container = document.createElement('div');
              customWidgetDefinition.container.setAttribute(
                'id',
                'merkur-container',
              );
            }

            this._shadow.appendChild(customWidgetDefinition.container);

            this._widget = await createSPAWidget(
              customWidgetDefinition,
              this._shadow,
            );

            await callbacks?.constructor?.(this._widget, {
              shadow: this._shadow,
              customElement: this,
            });

            (await callbacks?.mount?.(this._widget, {
              shadow: this._shadow,
              customElement: this,
            })) ?? (await this._widget.mount());
          } catch (error) {
            console.error(error);
          }
        })();
      } catch (error) {
        console.error(error);
      }
    }

    connectedCallback() {
      this._widget?.connectedCallback?.({
        shadow: this._shadow,
        customElement: this,
      });

      callbacks?.connectedCallback?.(this._widget, {
        shadow: this._shadow,
        customElement: this,
      });
    }

    disconnectedCallback() {
      this._widget?.disconnectedCallback?.({
        shadow: this._shadow,
        customElement: this,
      });

      callbacks?.disconnectedCallback?.(this._widget, {
        shadow: this._shadow,
        customElement: this,
      });
    }

    adoptedCallback() {
      this._widget?.adoptedCallback?.({
        shadow: this._shadow,
        customElement: this,
      });

      callbacks?.adoptedCallback?.(this._widget, {
        shadow: this._shadow,
        customElement: this,
      });
    }

    attributeChangedCallback(name, oldValue, newValue) {
      this._widget?.attributeChangedCallback?.(
        this._widget,
        name,
        oldValue,
        newValue,
        {
          shadow: this._shadow,
          customElement: this,
        },
      );

      callbacks?.attributeChangedCallback?.(
        this._widget,
        name,
        oldValue,
        newValue,
        {
          shadow: this._shadow,
          customElement: this,
        },
      );
    }
  }

  if (customElements.get(widgetDefinition.name) === undefined) {
    customElements.define(widgetDefinition.name, WidgetElement);
  }
}

const PROTECTED_FIELDS = ['__proto__', 'prototype', 'constructor'];
function deepMerge(target, source) {
  const isObject = (obj) => !!obj && obj.constructor === Object;

  if (!isObject(target) || !isObject(source)) {
    return source;
  }

  Object.keys(source).forEach((key) => {
    if (PROTECTED_FIELDS.includes(key)) {
      return;
    }

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
