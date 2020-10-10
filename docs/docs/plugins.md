---
layout: docs
title: Merkur plugins
---

# Plugins

Like we said, Merkur is tiny and **extensible** library and allows you to define custom widget plugins as well. Widget plugin has two lifecycle methods, `setup` and `create`. Both methods are called during the creation of a widget; first `setup`, then `create`. Both methods receive `widget` and `widgetProperties` and must return an extended widget object.

The `setup` method is for creating a new widget interface and a base widget properties in `widget.$in` property. The `create` method is for connecting more plugins or reusing some plugin methods from another plugin.

We are creating custom debug plugin.

```javascript
import { createMerkurWidget, hookMethod, isFunction } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';

export function debugPlugin() {
  return {
    async setup(widget, widgetProperties) {
      widget = {
        {
          debug(widget) {
            console.info('State', widget.state);
            console.info('Props', widget.props);
          },
        },
        ...widget,
      };

      return widget;
    },
    async create(widget, widgetProperties) {
      Object.keys(widget).forEach((methodName) => {
        if (!isFunction(widget, methodName) {
          return;
        }

        hookMethod(widget, methodName, (widget, originalMethod, ...args) => {
           console.info(`call ${key} method with `, ...args);

           // originalMethod has auto bind widget to first parameter
           return originalMethod(...args);
        });

        originalMethod = widget[key];
        widget[key] = (widget, ...args) => {
          console.info(`call ${key} method with `, ...args);

          return originalMethod(widget, ...args);
        };
      });

      return widget;
    }
  };
}

export const widgetProperties = {
  name,
  version,
  $plugins: [componentPlugin, eventEmitterPlugin, debugPlugin],
  // ... other properties
};

const widget = createMerkurWidget(widgetProperties);
```

We created `debugPlugin` which adds `debug` method in the `setup` lifecycle method and adds tracking to all widget methods in the `create` lifecycle method. We used our new plugin in the `$plugins` property of a specific widget.

Merkur has only three predefined plugins [componentPlugin]({{ '/docs/component-plugin' | relative_url }}),  [eventEmitterPlugin]({{ '/docs/event-emitter-plugin' | relative_url }}) and [httpClientPlugin]({{ '/docs/http-client-plugin' | relative_url }}).