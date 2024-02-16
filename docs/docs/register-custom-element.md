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

After created new Merkur widget you change your playground route in `/server/routes/playground/playground.js` to:

```javascript
const fs = require('fs');
const path = require('path');

const ejs = require('ejs');
const express = require('express');

const { createAssets, memo } = require('@merkur/integration/server');
const memoCreateAssets = memo(createAssets);
const { playgroundErrorMiddleware } = require('@merkur/plugin-error/server');

const { asyncMiddleware, getServerUrl } = require('../utils');

const playgroundTemplate = ejs.compile(
  fs.readFileSync(path.join(__dirname, '/playground.ejs'), 'utf8'),
);

const router = express.Router();

router
  .get(
    '/',
    asyncMiddleware(async (req, res) => {
      const staticFolder = `${__dirname}/../../../build/static`;
      const staticBaseUrl = `${getServerUrl(req)}/static`;

      const assets = await memoCreateAssets({
        assets: [
          {
            name: 'widget.js',
            type: 'script',
          }
        ],
        staticFolder,
        staticBaseUrl,
        folders: ['es11'],
      });


      res.status(200).send(
        playgroundTemplate({
          assets,
        }),
      );
    }),
  )
  .use(
    playgroundErrorMiddleware({
      renderPlayground: playgroundTemplate,
    }),
  );

module.exports = () => ({ router });
```

In the example above we removed logic from fetching widgetProperties through `/widget` end point to only resolving path to our `widget.js` file. The resolved file path we use in the `/server/routes/playground/playground.ejs` file.

```ejs
<!doctype html>
<html lang="en">

<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script>
    window.__merkur_dev__ = window.__merkur_dev__ || {};
    window.__merkur_dev__.webSocketOptions = {
      url: `ws://localhost:${<%- process.env.MERKUR_PLAYGROUND_LIVERELOAD_PORT %>}`
    };
  </script>
  <script src="/@merkur/tools/static/livereload.js"></script>
  <% assets.forEach((asset) => { %>
    <%if (asset.type === 'stylesheet') { %>
      <link rel='stylesheet' href='<%= asset.source %>' />
    <% } %>
    <%if (asset.type === 'script') { %>
      <%if (typeof asset.source === 'string') { %>
        <script src='<%= asset.source %>' defer='true'></script>
      <% } %>
      <%if (typeof asset.source === 'object') { %>
        <script src='<%= asset.source.es11 %>' defer='true'></script>
      <% } %>
    <% } %>
  <% }); %>
  <title>MERKUR - widget</title>
</head>

<body>
  <merkur-custom></merkur-custom>
</body>
</html>
```

We removed logic for reviveling widget in playground and added only custom element with name from `package.json` to the body part of html. The custom element auto revive Merkur widget.

Now you can remove `/server/routes/widgetAPI` folder and remove their usage `widgetAPI` route in `/server/app.js`.

### Webpack config

Because you only need serve one JavaScript file as a loader for other assets. You can change `webpack.config.js` file to bundle only one client JavaScript file. Other tasks for bundling more JS versions or node version you can remove.

```javascript
module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(createWebConfig, applyStyleLoaders, applyBabelLoader)(),
  ])
);
```
If you remove node bundle then you will need add `webpack-shell-plugin` to client bundle for running dev server with watch mode.

```javascript
const WebpackShellPlugin = require('webpack-shell-plugin-next');

function applyShellPlugin(config, { isProduction }) {
  if (!isProduction) {
    config.plugins.push(new WebpackShellPlugin({
      onBuildEnd: {
        scripts: ['npm run dev:server'],
        blocking: false,
        parallel: true,
      },
    }));
  }

  return config;
}

module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(createWebConfig, applyStyleLoaders, applyBabelLoader, applyShellPlugin)(),
  ])
);
```

If you want to use style files and then serving widget's style as Merkur assets. You should add configuration for `MiniCssExtractPlugin` to your webpack config. It helps you to resolve file path without server. We describe it later in `Widget part` section.

```javascript
module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(createWebConfig, applyStyleLoaders, applyBabelLoader, applyShellPlugin)({ plugins: { MiniCssExtractPlugin: { filename: 'widget.css' } } }),
  ])
);
```

### Widget part

You can remove useless `/src/server.js`, `/src/polyfill.es5.js` and `/src/polyfill.es9.js` files. The default Merkur template use `config` npm module for resolving application environment. But `config` module doesn't work in browser so we must add support for application environment to our client solution with custom element.

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

Now you can create you own `production` and `development` environments in `/src/config/production.js` and `/src/config/development.js` files. For example `/src/config/production.js` file:

```javascript
export default {
  environment: 'production',
  cdn: 'http://localhost:4444',
  widget: {
    apiUrl: 'https://api.github.com/',
  },
};
```

Because you don't need share logic between server and client bundle. You can merge `/src/widget.js` and `/src/client.js` files to `/src/client.js`. We add our resolved environment to widget `props.environment` property. Same as it works in default Merkur template. We define `widget.css` asset for downloading css file before creating new merkur widget. 

```javascript
import { render, hydrate } from 'preact';
import { unmountComponentAtNode } from 'preact/compat';

import { componentPlugin } from '@merkur/plugin-component';
import { errorPlugin } from '@merkur/plugin-error';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';
import { registerCustomElement } from '@merkur/integration-custom-element';

import { environment } from './config';
import { mapViews } from './lib/utils';
import { viewFactory } from './views/View.jsx';

import pkg from '../package.json';

import './style.css';

const widgetDefinition = {
  name: pkg.name,
  version: pkg.version,
  $plugins: [componentPlugin, eventEmitterPlugin, errorPlugin],
  props: {
    environment,
  },
  assets: [
    {
      name: 'widget.css',
      source: `${
        environment.cdn
      }/static/es11/widget.css?version=${Math.random()}`,
      type: 'stylesheet',
    },
  ],
  slot: {},
  onClick(widget) {
    widget.setState({ counter: widget.state.counter + 1 });
  },
  onReset(widget) {
    widget.setState({ counter: 0 });
  },
  load() {
    return {
      counter: 0,
    };
  },
  ...{
    $dependencies: {
      render,
      hydrate,
      unmountComponentAtNode,
    },
    async mount(widget) {
      return mapViews(widget, viewFactory, ({ View, container, isSlot }) => {
        if (!container) {
          return null;
        }
        return (
          container?.children?.length && !isSlot
            ? widget.$dependencies.hydrate
            : widget.$dependencies.render
        )(View(widget), container);
      });
    },
    async unmount(widget) {
      mapViews(widget, viewFactory, ({ container }) => {
        if (container) {
          widget.$dependencies.unmountComponentAtNode(container);
        }
      });
    },
    async update(widget) {
      return mapViews(
        widget,
        viewFactory,
        ({ View, container }) =>
          container && widget.$dependencies.render(View(widget), container),
      );
    },
  }
};

registerCustomElement({ widgetDefinition });

```

The custom element don't support Merkur slots. Then you can remove `src/slots` folder and update `src/views/View.jsx` file where change `viewFactory` function to example below.

```javascript
async function viewFactory(widget) {
  return {
    View,
    slot: [],
  };
}
```