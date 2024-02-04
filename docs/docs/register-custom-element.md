---
layout: docs
title: Register Merkur widget as custom element
---

# Register Merkur widget as custom element

Merkur widget can be registered as custom element. It is helpful for use case where SSR is not important for Merkur widget. We predict that you serve your widget as single JavaScript file.

## Installation

For easy registration Merkur widget as custom element we created the `@merkur/integration-custom-element` module. The module is designed for client-side.

```bash
npm i @merkur/integration-custom-element --save
```

## How to change template

At first create new Merkur widget and then change your playground route in `/server/routes/playground/playground.js` to:

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

We removed logic for reviveling widget in playground and added only custom element with name from `package.json` to the body part of html.

Now you can remove `/server/routes/widgetAPI` folder and remove their usage `widgetAPI` route in `/server/app.js`.

Because you only need serve one JavaScript file. You can change `webpack.config.js` file to bundle only one client JavaScript file. Other tasks for bundling you can remove.

```javascript
module.exports = createLiveReloadServer().then(() =>
  Promise.all([
    pipe(createWebConfig, applyStyleLoaders, applyBabelLoader)(),
  ])
);
```
If you remove node bundle then you will need add `webpack-shell-plugin` to client bundle for running dev server.

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

You can remove useless `/src/server.js`, `/src/polyfill.es5.js`, `/src/polyfill.es9.js` and `/src/style.css` files.

Because you don't need share logic between server and client bundle. You can merge `/src/widget.js` and `/src/client.js` files to `/src/client.js`. 

```javascript
import { render, hydrate } from 'preact';
import { unmountComponentAtNode } from 'preact/compat';

import { componentPlugin } from '@merkur/plugin-component';
import { errorPlugin } from '@merkur/plugin-error';
import { eventEmitterPlugin } from '@merkur/plugin-event-emitter';
import { registerCustomElement } from '@merkur/integration-custom-element';

import { mapViews } from './lib/utils';
import { viewFactory } from './views/View.jsx';

import pkg from '../package.json';

const widgetDefinition = {
  name: pkg.name,
  version: pkg.version,
  $plugins: [componentPlugin, eventEmitterPlugin, errorPlugin],
  assets: [],
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