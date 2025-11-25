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
Override default request config with `setDefaultConfig` method from `@merkur/plugin-http-client`. Add `cacheInTransformer` and `cacheOutTransformer` after default transformers(`getDefaultTransformers`).

Cached is used by default, we can also override this behaviour and set `useCache` to false. If we want to re-use server cache on client, we can set the `transferServerCache` option accordingly. And of course we can set time to to live(`ttl`) for cached entries.  

```javascript
// ./src/widget.js
import { setDefaultConfig, getDefaultTransformers} from '@merkur/plugin-http-client';

export const widgetProperties = {
  name,
  version,
  bootstrap(widget) {
    setDefaultConfig(widget,
    {
      transformers: [...getDefaultTransformers(widget), cacheInTransformer(), cacheOutTransformer()],
      useCache: true, // true by default
      transferServerCache: true, // false by default
      ttl: 60000, //60000(60s) by default
      .....

    });
  }
};
```
After that we have cache available.
We can also set instructions for using cache for each request in request option.

```javascript
const { response, request } = await widget.http.request({ path: '/detail/1', useCache: true });
```

And we can revalidate cache for specific request in request option.

```javascript
const { response, request } = await widget.http.request({ path: '/detail/1', useCache: true, revalidateCache: true });
```
