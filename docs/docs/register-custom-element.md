---
layout: docs
title: Register Merkur widget as custom element
---

# Register Merkur widget as custom element

Merkur widget can be registered as custom element. It is helpful for use case where SSR is not important for Merkur widget. We predict that you serve your widget as single JavaScript file with defined assets.

## Installation

For easy registration Merkur widget as custom element we created the `@merkur/integration-custom-element` module. The module is designed for only client-side.

```bash
npm i @merkur/integration-custom-element --save
```

## How to change default Merkur template

The default Merkur template is prepared for SSR so we will remove in below sections useless parts and files to reconfigure default template to only client template. At first create new Merkur widget.

### Server part

After created new Merkur widget you change your playground template for creating `/server/playground/templates/body.ejs` file to:

```javascript
<{package.name}></{package-name}> // something like <merkur-widget></merkur-widget>
```

We changed logic for reviveling widget in playground and added only custom element with name from `package.json` to the body part of html. The custom element auto revive Merkur widget. Now you can remove other files in `/server/*` folder. 

### CLI config

You can change `merkur.config.mjs` file to add `@merkur/integration-custom-element/cli` to extends field.

```javascript
/**
 * @type import('@merkur/cli').defineConfig
 */
export default function () {
  return {
    extends: ['@merkur/preact/cli' ,'@merkur/integration-custom-element/cli'],
  };
}
```

The `@merkur/integration-custom-element/cli` modify default `@merkur/cli` configuration (chang playground widgetHandler to skip `/widget` request, turn off widget server because custom element works only in browser, turn off HMR and use hot reload instead, filter node platform tasks, force generated files to be saved to filesystem as writeToDisk = true, register css bundle plugin for including bundled css file to js).

### Widget part

The default Merkur template use `config` npm module for resolving application environment. But `config` module doesn't work in browser so we must add support for application environment to our client solution with custom element.

Create new `config` folder in `/src/` and then there create new file `/src/config/index.js` where copy paste code below which add support for two environments `development` and `production`. The `development` environment extends `production` environment. So you don't need copy all options. The webpack tree shaking logic helps removed `development` environment in `production` build.

```javascript
import { deepMerge } from '@merkur/integration-custom-element';

import production from './production';
import development from './development';

let environment = null;
if (process.env.NODE_ENV === 'production') {
  environment = production;
} else {
  environment = deepMerge(production, development);
}

export { environment };
```

Now you can create your own `production` and `development` environments in `/src/config/production.js` and `/src/config/development.js` files. For example `/src/config/production.js` file:

```javascript
export default {
  environment: 'production',
  cdn: 'http://localhost:4444',
  widget: {
    apiUrl: 'https://api.github.com/',
  },
};
```

We add our resolved environment to widget `props.environment` property in `/src/widget.js`. Same as it works in default Merkur template. The custom element don't support Merkur slots. So we set `slotFactories` to empty array. Then you can remove `src/components/slots` folder.

```javascript
/* eslint-disable no-unused-vars */
import { defineWidget } from '@merkur/core';
import {
  componentPlugin,
  createViewFactory,
  createSlotFactory,
} from '@merkur/plugin-component';
import { errorPlugin } from '@merkur/plugin-error';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';
import { registerCustomElement } from '@merkur/integration-custom-element';

import { environment } from './config';
import View from './views/View';

import { name, version } from '../package.json';

import './style.css';

import cssBundle from '@merkur/integration-custom-element/cssBundle';

const widgetDefinition = defineWidget({
  name,
  version,
  viewFactory: createViewFactory((widget) => ({
    View,
    slotFactories: [],
  })),
  props: {
    environment,
  },
  $plugins: [componentPlugin, eventEmitterPlugin, errorPlugin],
  assets: [
    {
      name: 'widget.css',
      type: 'inlineStyle',
      source: cssBundle,
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

export default widgetDefinition;

registerCustomElement({ widgetDefinition });
```