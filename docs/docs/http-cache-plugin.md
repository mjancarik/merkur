---
layout: docs
title: HTTP cache plugin - Merkur
---

# HTTP cache plugin

The HTTP cache plugin provides transformes for http-client plugin(https://www.npmjs.com/package/@merkur/plugin-http-client) and sychronizes/sends it's cache state to client where it can be re-used.

## Installation

First we must setup plugin @merkur/plugin-http-client before @merkur/plugin-http-cache. Then add import of `httpCachePlugin` and register it to `$plugins` property of the widget.

```javascript
// ./src/widget.js
import { httpClientPlugin } from '@merkur/plugin-http-client';
import {
  httpCachePlugin,
} from '@merkur/plugin-http-cache';

export const widgetProperties = {
  name,
  version,
  $plugins: [httpClientPlugin, httpCachePlugin],
  // ... other properties
};

```
Import transformers `cacheInTransformer` and `cacheOutTransformers` methods from `@merkur/plugin-http-cache`.

```javascript
// ./src/widget.js
import {
  httpCachePlugin,
  cacheInTransformer,
  cacheOutTransformer,
} from '@merkur/plugin-http-cache';
```
Override default request config with `setDefaultConfig` method from `@merkur/plugin-http-client` and add transformers.
Cached is used by default, we can also override this behaviour and set `useCache` to false.

```javascript
// ./src/widget.js
import { setDefaultConfig, getDefaultTransformers} from '@merkur/plugin-http-client';

export const widgetProperties = {
  name,
  version,
  bootstrap(widget) {
    setDefaultConfig(widget,
    {
      transformers: [cacheInTransformer(),...getDefaultTransformers(widget), cacheOutTransformer()],
      useCache: false,
      .....

    });
  }
};
```
After that we have cache available.
We can also set instructions for using cache for each request in request option.

```javascript
const { response, request } = await widget.http.request({ path: '/detail/1' }, { useCache: true });
```
