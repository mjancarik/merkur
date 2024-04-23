---
layout: docs
title: Widget API - Merkur
---

# Merkur widget API

A Merkur widget, whether within the application or when returned as JSON by the API endpoint, contains six predefined properties: `name`, `version`, `containerSelector`, `container`, `$in`, `$external`, `$dependencies`, and `$plugins`. The property `$in` is intended for internal usage by merkur widget plugins or merkur itself.

Other properties are for your own needs. The `containerSelector` is used to store CSS selector, identifying merkur component root in DOM tree or you set root element with `container` property. The property `$external` is for storing variables. The property `$dependencies` is for defining widget dependencies and specific features of the environment where the widget operates. The last property, `$plugins`, is for defining specific widget plugins.

The widget also contains two methods for plugins; `setup` and `create`. For more details continue to the [plugins]({{ '/docs/plugins' | relative_url }}) section. You can use these methods also in `widgetProperties`.

The widget instance is sealed after creation so you cannot add properties or functions to the widget directly. But for rare use cases you can use the `$external` property. Merkur automatically binds widget functions to receive the widget as a first argument. You can see it in the example widget.

Sometimes you might not be sure whether to store data in widget state or the `$external` property. The best way to decide is to ask if you need to react to the change of the variable. If you do, store it in state; if you don't, or specifically want to avoid that, `$external` might be the right choice.

```javascript
import { defineWidget } from '@merkur/core';
import {
  componentPlugin,
  createViewFactory,
  createSlotFactory,
} from '@merkur/plugin-component';
import { errorPlugin } from '@merkur/plugin-error';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';

import HeadlineSlot from './slots/HeadlineSlot';
import View from './views/View';

import pkg from '../package.json';

import './style.css';

export default defineWidget({
  // base merkur widget structure
  name: pkg.name,
  version: pkg.version,
  containerSelector: '.container', // Can be omitted, usually filled right after widget creation.
  $plugins: [componentPlugin, eventEmitterPlugin, errorPlugin],

  // properties and methods which are added by componentPlugin
  viewFactory: createViewFactory((widget) => ({
    View,
    slotFactories: [
      createSlotFactory((widget) => ({
        name: 'headline',
        containerSelector: '.container-headline',
        View: HeadlineSlot,
      })),
    ],
  })),
  assets: [
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
    // We don't want to set environment into app state
    // eslint-disable-next-line no-unused-vars
    const { environment, ...restProps } = widget.props;

    return {
      counter: 0,
      ...restProps,
    };
  },

  // your own defined properties and methods
  onClick(widget) {
    widget.setState({ counter: widget.state.counter + 1 });
  },
  onReset(widget) {
    widget.setState({ counter: 0 });
  },
});

```

## Slots

Slots allow you to define custom views, which are rendered into different DOM containers placed anywhere else in the DOM tree and share the same widget instance (e.g. state, props, ...) as the main widget.

This enables the ability to render the same data (state) in multiple views in different iterations, or simply manage multiple copies of the same widget (slots uses the same view) on multiple places on the page without much hassle.


<a href="{{ '/assets/images/slots.png?v=' | append: site.github.build_revision | relative_url }}" target="_blank" title="Merkur widget slots">
  <img class="responsive" src="{{ '/assets/images/slots.png?v=' | append: site.github.build_revision | relative_url }}" alt="Merkur widget slots" />
</a>

The usage of slots is completely optional and can be omitted from the main widget structure. They're also very much dependent on the actual framework used on the frontend and require slight customization. However they are automatically defined in all default templates, when using `@merkur/create-widget` utility, so feel free to take a look at the implementation and adapt it to your needs.

The main difference in using slots is the definition of `createSlotFactory` function:

```javascript
  viewFactory: createViewFactory((widget) => ({
    View,
    slotFactories: [
      createSlotFactory((widget) => ({
        name: 'headline',
        containerSelector: '.container-headline',
        View: HeadlineSlot,
      })),
    ],
  })),

```

which is used to generate following structure:

```json
{
  "view": "<main_view_function>",
  "containerSelector": ".merkur-view", // optional
  "slot": {
    "headline": {
      "name": "headline",
      "view": "<slot_view_function>",
      "containerSelector": ".container-headline", // optional
    }
  },
}
```

This factory function is then used in lifecycle methods in `client.js` and `server.js` entry files to properly render widget instance into the main view and all it's slots. You can override framework specific entry files if you defined `./src/entries/client.js` and `./src/entries/server.js` files in your project.