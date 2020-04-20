---
layout: docs
---

# Merkur widget API

Merkur widget contains four predefined properties `$in`, `$external`, `$dependencies` and `$plugins`. The property `$in` is for internals usage of merkur widget plugins or merkur itself. 

Other properties are for your own usage. The property `$external` is for storing variables. The property `$dependencies` is for defined widget dependencies and specific features of environment where widget works. The last one property `$plugins` is for defined specific widget plugin.

The widget also contains two methods for plugins `seutp` and `create`. For more details continue to [plugins]({{ '/docs/plugins' | relative_url }}) section.

The widget instance is sealed after creating so you can't add properties or functions to widget directly. But for rare use case you can use property `$external`. The Merkur automaticaly bind widget functions to recieve widget as a frist argument. You can see it in easy counter example widget.

```javascript
import { createMerkurWidget, createMerkur } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';
import { render } from 'preact';
import View from './component/View';
import { name, version } from '../package.json';

export const widgetProperties = {
  // base merkur widget structure
  name,
  version,
  $dependencies: {
    render, // specific render method for client side and server side
  },
  $plugins: [componentPlugin, eventEmitterPlugin]

  // properties and methods which adding componentplugin
  assets: [
    {
      type: 'script',
      source: 'http://localhost:4444/static/widget-client.js',
    },
    {
      type: 'stylesheet',
      source: 'http://localhost:4444/static/widget-client.css',
    },
  ],
  load(widget) {
    return {
      counter: 0,
      ...widget.props,
    };
  },
  mount(widget) {
    const View = widget.View();
    const container = document.getElementById(widget.container);

    return widget.$dependencies.render(View, container);
  },
  update(widget) {
    const View = widget.View();
    const container = document.getElementById(widget.container);

    return widget.$dependencies.render(View, container);
  },

  // your own defined properties and methods
  container: 'container',
  View,
  onClick(widget) {
    widget.setState({ counter: widget.state.counter + 1 });
  },
  onReset(widget) {
    widget.setState({ counter: 0 });
  },
};

// factory function
// widgetParams are params from API call for widget, 
// we will explain in next section
function createWidget(widgetParams) {
  return createMerkurWidget({
    ...widgetParams,
    ...widgetProperties,
  });
}

// we will explain in next section
const merkur = createMerkur();
merkur.register({
  ...widgetProperties,
  createWidget,
});

```

