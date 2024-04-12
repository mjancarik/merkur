---
layout: docs
title: Router plugin - Merkur
---

# Router plugin

The Merkur router plugin is integration of [universal-router](https://www.npmjs.com/package/universal-router) to Merkur ecosystem and extend `@merkur/plugin-component` for activation only part of widget functionality (controller) for defined path. The plugin adds `router` property to your widget with a `link`, `redirect` and `getCurrentRoute` methods.

## Installation

At first we must install `@merkur/plugin-router` as dependency.

```bash
npm i @merkur/plugin-router --save
```

Then we add import of `routerPlugin` and register it to `$plugins` property of the widget.

```javascript
// ./src/widget.js
import { routerPlugin } from '@merkur/plugin-router';


export default defineWidget({
  name: pkg.name,
  version: pkg.version,
  viewFactory: createViewFactory((widget) => ({
    View,
    slotFactories: [
      createSlotFactory((widget) => ({
        name: 'headline',
        View: HeadlineSlot,
      })),
    ],
  })),
  $plugins: [componentPlugin, eventEmitterPlugin, routerPlugin, errorPlugin],
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
  onClick(widget) {
    widget.setState({ counter: widget.state.counter + 1 });
  },
  onReset(widget) {
    widget.setState({ counter: 0 });
  },
  load(widget) {
    // We don't want to set environment into app state
    const { environment, ...restProps } = widget.props;

    return {
      counter: 0,
      ...restProps,
    };
  },
});

```

We have a `router.{link|redirect|getCurrentRoute}` methods available on the widget now.

After that we must initialize universal router with own routes and options in setup phase of creation widget where structure for `routes` and `options` are defined from [universal-router](https://github.com/kriasoft/universal-router/blob/main/docs/api.md) and returns type from `route.action` method is defined by Merkur router plugin. It is a object with `PageView` as main rendered component for defined path and controller life cycle methods **(init, load, activate, deactivate, destroy)** which extend `load`, `mount`, `unmount` methods from `@merkur/plugin-component` and other controller custom methods with logic for defined path. 
The `mount` method use under the hood `widget.viewFactory` method to resolving component for render. So we must set View in createViewFactory as route PageView. If you don't have slots you can set `slotFactories` as empty array or set as route slots. 

```javascript
// ./src/widget.js
import { createRouter } from '@merkur/plugin-router';

export default defineWidget({
  name: pkg.name,
  version: pkg.version,
  viewFactory: createViewFactory((widget) => ({
    View: widget.router.getCurrentRoute().PageView,
    slotFactories: [],
  })),
  $plugins: [componentPlugin, eventEmitterPlugin, routerPlugin, errorPlugin],
  setup(widget) {
    const routes = [
      {
        name: 'home',
        path: '/',
        action: ({ params, widget, route }) => {
          return {
            PageView: View,
            load() {
              return {
                counter: 5,
              };
            },
          };
        },
      },
      {
        name: 'detail',
        path: '/detail',
        action: ({ params, widget, route }) => {
          return {
            PageView: View,
            load() {
              return {
                counter: 0,
              };
            },
          };
        },
      },
    ];

    const options = {
      baseUrl: ``,
    };

    createRouter(widget, routes, options);

    return widget;
  },
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
  onClick(widget) {
    widget.setState({ counter: widget.state.counter + 1 });
  },
  onReset(widget) {
    widget.setState({ counter: 0 });
  },
  load(widget) {
    const { environment, ...restProps } = widget.props;

    return {
      counter: 0,
      ...restProps,
    };
  },
});
```

Merkur resolve current route from pathname in `widget.props`. So we must set it in `./server/routes/widget/widgetAPI.js`. Logic for defined `pathname` is on your use case.

```javascript
router.get(
  '/widget',
  asyncMiddleware(async (req, res) => {
    const merkurModule = requireUncached(`${buildFolder}/widget.cjs`);
    const widget = await merkurModule.createWidget({
      props: {
        name: req.query.name,
        environment: widgetEnvironment,
        pathname: '/',
      },
    });

    const { html, slot = {} } = await widget.mount();
```

Now you have install router plugin to your widget.

## Methods

### getCurrentRoute
Returned object from `route.action` method for current route. 

### link
 - name - route defined name
 - data - route arguments

Returns url for route name with filling route pattern with data.

### redirect
 - url - redirecting url
 - data - object with other data 

Emit `RouterEvents.Redirect` event through @merkur/plugin-event-emitter for which must listen skeleton app. 

## Controller life cycle methods

### init
The `init` method is calling as constructor for you controller. It is for creating some other instances which controller use in other methods.

### load
The `load` method is **mandatory** and returns current state of the widget. The load method is called before mounting the widget and after changing props.
The widget state is merge of object from `widget.load` method and `controller.load` method.

### activate
The `activate` method is called after mounting the widget and only in browser environment.

### deactivate
The `deactivate` method is opposite method for `activate` method and only call in browser environment.

### destroy
The `destroy` method is opposite method for `init` method. 
