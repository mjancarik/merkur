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
  const { widgetDefinition, callbacks, observedAttributes, attributesParser } =
    deepMerge({}, options);
  class HTMLCustomElement extends HTMLElement {
    static get observedAttributes() {
      return observedAttributes ?? [];
    }
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

        this._widgetPromise = (async () => {
          this._shadow = this.attachShadow({ mode: 'open' });

          try {
            const widget = await callbacks?.getInstance?.();

            if (widget && widget.name && widget.version) {
              this._widget = widget;

              await afterDOMLoad();
              await loadAssets(widget.assets, this._shadow);

              this._setDefaultProps();

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

            this._setDefaultProps();

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

    async connectedCallback() {
      await this._widgetPromise;

      this._widget?.connectedCallback?.({
        shadow: this._shadow,
        customElement: this,
      });

      callbacks?.connectedCallback?.(this._widget, {
        shadow: this._shadow,
        customElement: this,
      });
    }

    async disconnectedCallback() {
      await this._widgetPromise;

      this._widget?.disconnectedCallback?.({
        shadow: this._shadow,
        customElement: this,
      });

      callbacks?.disconnectedCallback?.(this._widget, {
        shadow: this._shadow,
        customElement: this,
      });
    }

    async adoptedCallback() {
      await this._widgetPromise;

      this._widget?.adoptedCallback?.({
        shadow: this._shadow,
        customElement: this,
      });

      callbacks?.adoptedCallback?.(this._widget, {
        shadow: this._shadow,
        customElement: this,
      });
    }

    async attributeChangedCallback(name, oldValue, newValue) {
      await this._widgetPromise;

      const camelCaseKey = name.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
      const parser = attributesParser?.[name] ?? ((value) => value);

      this._widget?.setProps?.({ [camelCaseKey]: parser(newValue) });

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

    _setDefaultProps() {
      const attributes = this.constructor.observedAttributes;
      if (
        Array.isArray(attributes) &&
        typeof this._widget.setProps === 'function'
      ) {
        this._widget.props = { ...this._widget.props };
        attributes.forEach((key) => {
          if (this.hasAttribute(key)) {
            const camelCaseKey = key.replace(/-([a-z])/g, (g) =>
              g[1].toUpperCase(),
            );
            const parser = attributesParser?.[key] ?? ((value) => value);

            this._widget.props[camelCaseKey] = parser(
              this.getAttribute(key) ?? this._widget.props[key],
            );
          }
        });
      }
    }
  }

  if (customElements.get(widgetDefinition.name) === undefined) {
    customElements.define(widgetDefinition.name, WidgetElement);
  }

  return WidgetElement;
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
