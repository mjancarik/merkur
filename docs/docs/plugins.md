---
layout: docs
---

# Plugins

Merkur is tiny and extensible library how we said and allow you define custom widget plugins as well. Widget plugin has got two lifecycle methods `setup` and `create`. Both methods are called during creating widget. The order is `setup` and then `create`. Both methods receive `widget` and `widgetProperties` and must return extended widget.

The `setup` method is for creating new widget interface and base widget properties in `widget.$in` property. The `create` method is for connection more plugins or reusing some plugin methods from another plugin. 

We are creating custom debug plugin.

```javascript
import { createMerkurWidget } from '@merkur/core';
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
      Object.keyes(widget).forEach((key) => {
        if (typeof widget[key] !== 'function') {
          return;
        }

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

We created `debugPlugin` which add `debug` method in `setup` lifecycle method and add tracking calling all widget methods in `create` lifecycle method. We defined using plugins in `$plugins` property.

Merkur has got only two plugins `componentPlugin` and `eventEmitterPlugin`.