---
layout: docs
title: Widget API - Merkur
---

# Merkur widget API

A Merkur widget, whether within the application or when returned as JSON by the API endpoint, contains six predefined properties: `name`, `version`, `$in`, `$external`, `$dependencies`, and `$plugins`. The property `$in` is intended for internal usage by merkur widget plugins or merkur itself.

Other properties are for your own needs. The property `$external` is for storing variables. The property `$dependencies` is for defining widget dependencies and specific features of the environment where the widget operates. The last property, `$plugins`, is for defining specific widget plugins.

The widget also contains two methods for plugins; `setup` and `create`. For more details continue to the [plugins]({{ '/docs/plugins' | relative_url }}) section. You can use these methods also in `widgetProperties`.

The widget instance is sealed after creation so you cannot add properties or functions to the widget directly. But for rare use cases you can use the `$external` property. Merkur automatically binds widget functions to receive the widget as a first argument. You can see it in the example widget.

Sometimes you might not be sure whether to store data in widget state or the `$external` property. The best way to decide is to ask if you need to react to the change of the variable. If you do, store it in state; if you don't, or specifically want to avoid that, `$external` might be the right choice.

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
  $plugins: [componentPlugin, eventEmitterPlugin],
  setup(widget, widgetDefinition) {
    console.log(widgetDefinition); // argument from createMerkurWidget

    return widget;
  },

  // properties and methods which adding componentplugin
  assets: [
    {
      name: 'polyfill.js',
      type: 'script',
    },
    {
      name: 'widget.js',
      type: 'script',
    },
    {
      name: 'widget.css',
      type: 'stylesheet',
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
    const container = document.getElementById(widget.props.containerSelector);

    return widget.$dependencies.render(View, container);
  },
  update(widget) {
    const View = widget.View();
    const container = document.getElementById(widget.props.containerSelector);

    return widget.$dependencies.render(View, container);
  },

  // your own defined properties and methods
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
// widgetParams.props = { containerSelector: '.container' };
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

