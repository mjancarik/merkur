---
layout: docs
title: Widget API - Merkur
---

# Merkur widget API

A Merkur widget, whether within the application or when returned as JSON by the API endpoint, contains six predefined properties: `name`, `version`, `containerSelector`, `$in`, `$external`, `$dependencies`, and `$plugins`. The property `$in` is intended for internal usage by merkur widget plugins or merkur itself.

Other properties are for your own needs. The `containerSelector` is used to store CSS selector, identifying merkur component root in DOM tree. The property `$external` is for storing variables. The property `$dependencies` is for defining widget dependencies and specific features of the environment where the widget operates. The last property, `$plugins`, is for defining specific widget plugins.

The widget also contains two methods for plugins; `setup` and `create`. For more details continue to the [plugins]({{ '/docs/plugins' | relative_url }}) section. You can use these methods also in `widgetProperties`.

The widget instance is sealed after creation so you cannot add properties or functions to the widget directly. But for rare use cases you can use the `$external` property. Merkur automatically binds widget functions to receive the widget as a first argument. You can see it in the example widget.

Sometimes you might not be sure whether to store data in widget state or the `$external` property. The best way to decide is to ask if you need to react to the change of the variable. If you do, store it in state; if you don't, or specifically want to avoid that, `$external` might be the right choice.

```javascript
import { createMerkurWidget, createMerkur } from '@merkur/core';
import { componentPlugin } from '@merkur/plugin-component';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';
import { render } from 'preact';
import { viewFactory } from './views/View.jsx';
import { mapViews } from './lib/utils';
import { name, version } from '../package.json';

export const widgetProperties = {
  // base merkur widget structure
  name,
  version,
  containerSelector: '.container', // Can be omitted, usually filled right after widget creation.
  $dependencies: {
    render, // specific render method for client side and server side
  },
  $plugins: [componentPlugin, eventEmitterPlugin],
  setup(widget, widgetDefinition) {
    console.log(widgetDefinition); // argument from createMerkurWidget

    return widget;
  },

  // properties and methods which are added by componentPlugin
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
  async mount(widget) {
    /**
     * - mapViews utility function is used to iterate through all defined views and slots
     * - viewFactory returns View component a optional slot views (more on slots further in the documentation)
     */
    return mapViews(widget, viewFactory, ({ View, container, isSlot }) => {
      if (!container) {
        return null;
      }

      return (container?.children?.length && !isSlot
        ? widget.$dependencies.hydrate
        : widget.$dependencies.render)(View(widget), container);
    });
  },
  async update(widget) {
    return mapViews(
      widget,
      viewFactory,
      ({ View, container }) =>
        container && widget.$dependencies.render(View(widget), container)
    );
  },

  // your own defined properties and methods
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

## Slots

Slots allow you to define custom views, which are rendered into different DOM containers placed anywhere else in the DOM tree and share the same widget instance (e.g. state, props, ...) as the main widget.

This enables the ability to render the same data (state) in multiple views in different iterations, or simply manage multiple copies of the same widget (slots uses the same view) on multiple places on the page without much hassle.


<a href="{{ '/assets/images/slots.png?v=' | append: site.github.build_revision | relative_url }}" target="_blank" title="Merkur widget slots">
  <img class="responsive" src="{{ '/assets/images/slots.png?v=' | append: site.github.build_revision | relative_url }}" alt="Merkur widget slots" />
</a>

The usage of slots is completely optional and can be omitted from the main widget structure. They're also very much dependent on the actual framework used on the frontend and require slight customization. However they are automatically defined in all default templates, when using `@merkur/create-widget` utility, so feel free to take a look at the implementation and adapt it to your needs.

The main difference in using slots is the definition of `viewFactory` function:

```javascript
async function headlineSlotFactory() {
  return {
    name: 'headline',
    containerSelector: '.headline-view', // optional, usually is redefined on client anyway
    View: HeadlineSlot, // Headline slot view component
  };
}

async function viewFactory(widget) {
  const slots = (await Promise.all([headlineSlotFactory(widget)])).reduce(
    (acc, cur) => {
      acc[cur.name] = cur;

      return acc;
    },
    {}
  );

  return {
    containerSelector: '.merkur-view', // optional, usually is redefined on client anyway
    View: View, // Main widget view component
    slots,
  };
}

```

which is used to generate following structure:

```json
{
  "view": "<main_view_function>",
  "containerSelector": ".merkur-view", // optional
  "slots": {
    "headline": {
      "name": "headline",
      "view": "<slot_view_function>",
      "containerSelector": ".headline-view", // optional
    }
  },
}
```

this factory function is then used in lifecycle methods in `client.js` and `server.js` to properly render widget instance into the main view and all it's slots. Below you can see examples for `mount` methods from preact integration for `client.js` and `server.js`:

```javascript
// server.js
{
  // ...
  async mount(widget) {
    const { View, slots = {} } = await viewFactory(widget);

    return {
      html: widget.$dependencies.render(View(widget)),
      slots: Object.keys(slots).reduce((acc, cur) => {
        acc[cur] = {
          name: slots[cur].name,
          html: widget.$dependencies.render(slots[cur].View(widget)),
        };

        return acc;
      }, {}),
    };
  },
  // ...
}
```

```javascript
// client.js
{
  // ...
  async mount(widget) {
    return mapViews(widget, viewFactory, ({ View, container, isSlot }) => {
      if (!container) {
        return null;
      }

      return (container?.children?.length && !isSlot
        ? widget.$dependencies.hydrate
        : widget.$dependencies.render)(View(widget), container);
    });
  },
  // ...
}
```

(`mapViews` is helper function used to iterate through main and slots views more easily, it's definition can be seen in `lib/utils.js` on any new widget.)

As you can see, we're not doing anything special. We're basically extracting view and container selector from `widgetProperties` into our own helper factory function, which is used in `client.js` and `server.js` directly, instead of extracting `View` from widget instance passed into each lifecycle method. Then we only need to make sure to not only render/mount the main view, but also the each slot in it's own container and view with the same widget instance and that's basically it.
