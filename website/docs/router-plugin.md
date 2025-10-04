---
sidebar_position: 16
title: Router Plugin
description: Learn about the Router plugin for client-side routing in Merkur
---

# Router plugin

The Merkur router plugin is integration of [universal-router](https://www.npmjs.com/package/universal-router) to Merkur ecosystem and extend `@merkur/plugin-component` for activation only part of widget functionality (controller) for defined path. The plugin adds `router` property to your widget with a `link`, `redirect`, `getCurrentRoute` and `getCurrentContext`(context from [universal-router](https://www.npmjs.com/package/universal-router)) methods.

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

We have a `router.{link|redirect|getCurrentRoute|getCurrentContext}` methods available on the widget now.

After that we must initialize universal router with own routes and options in setup phase of creation widget where structure for `routes` and `options` are defined from [universal-router](https://github.com/kriasoft/universal-router/blob/main/docs/api.md). The `options` are extended by Merkur with optional settings `protocol` and `host` for generating absolute url address from `link` method. Returns type from `route.action` method is defined by Merkur router plugin. It is a object with `PageView` as main rendered component for defined path and controller life cycle methods **(init, load, activate, deactivate, destroy)** which extend `load`, `mount`, `unmount` methods from `@merkur/plugin-component` and other controller custom methods with logic for defined path. 
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
      // other options from https://github.com/kriasoft/universal-router/blob/main/docs/api.md
      // merkur specific options for generating absolute url from link method
      protocol: 'https',
      host: 'www.example.com',
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

## Methods

### link

The `link` method returns full link path which is designed for creating a right href attributes for anchor elements. Link method accepts name of route defined in router and params object.

```javascript
const href = widget.router.link('home');
// or 
// const href = widget.router.link('home', {});
console.log(href); // /
```

```javascript
const href = widget.router.link('detail', { id: 1 });
console.log(href); // /detail/1

```

For generating absolute URL addresses we need set `protocol` and `host` in router options.

```javascript
const href = widget.router.link('detail', { id: 1 });
console.log(href); // https://www.example.com/detail/1
```

### redirect

- `name` - string - route name
- `params` - object -route params

The `redirect` method resolve right URL from route name and params. Then navigate to new URL.

```javascript
widget.router.redirect('detail', { id: 1 });
// same as
window.location.href = '/detail/1';
```

### getCurrentRoute

The `getCurrentRoute` method returns activated router with the configured controller (life cycle methods init, load, activate, deactivate, destroy and defined controller custom methods).

```javascript
const currentRoute = widget.router.getCurrentRoute();

// handler from route.action object
console.log(currentRoute); // { PageView: View, load: Function, ... }

```

### getCurrentContext

The `getCurrentContext` method returns context from universal router.

```javascript
const context = widget.router.getCurrentContext();

// { path, params, route, ...
console.log(context); 
```

## Controller Life Cycle Methods

### init
The `init` method is calling as constructor for your controller. It is for creating some other instances which controller use in other methods.

### load
The `load` method is **mandatory** and returns current state of the widget. The load method is called before mounting the widget and after changing props.
The widget state is merge of object from `widget.load` method and `controller.load` method.

### activate
The `activate` method is called after mounting the widget and only in browser environment.

### deactivate
The `deactivate` method is opposite method for `activate` method and only call in browser environment.

### destroy
The `destroy` method is opposite method for `init` method. 

## Server-side Integration

Merkur resolve current route from pathname in `widget.props`. So we must set it in `./server/routes/widget/widgetAPI.js`. Logic for defined `pathname` is on your use case. For example you can read it from `req.query.pathname`. The `req.query.*` or `req.body.*` are inputs to your API endpoint widget. You must validate it before you use in `widget.props`. 

```javascript
// ./server/routes/widget/widgetAPI.js
function getStringQueryParams(req) {
	return Object.entries(req.query).reduce((params, [key, value]) => {
		params[key] = Array.isArray(value) ? value.pop() : value;

		return params;
	}, {});
}

router.get(
  '/widget',
  asyncMiddleware(async (req, res) => {
    const { name, pathname } = getStringQueryParams(req);

    const merkurModule = requireUncached(`${buildFolder}/widget.cjs`);
    const widget = await merkurModule.createWidget({
      props: {
        name,
        environment: widgetEnvironment,
        pathname,
      },
    });

    const { html, slot = {} } = await widget.mount();
```

After that you must update `merkur.config.mjs` file to send `pathname` from playground page to widget API through `playground.widgetParams` method and of course change `playground.path` for extending playground page to works for more paths than default '/' path.

```javascript
// ./merkur.config.mjs

/**
 * @type import('@merkur/cli').defineConfig
 */
export default function () {
	return {
    //...
		},
		playground: {
			widgetParams: (req) => {
				return new URLSearchParams({ ...req.query, pathname: req.path });
			},
			path: new RegExp('(\/$|\/some-page\/.*)', 'g'),
		}
	};
}
```

Now you have installed router plugin to your widget.
