---
sidebar_position: 15
title: HTTP Cache Plugin
description: Learn about the HTTP Cache plugin for caching HTTP requests in Merkur
---

# HTTP cache plugin

The HTTP cache plugin provides transformers for the [http-client plugin](https://www.npmjs.com/package/@merkur/plugin-http-client) and synchronises its cache state to the client where it can be re-used.

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

Import transformers from `@merkur/plugin-http-cache`.

```javascript
// ./src/widget.js
import {
  httpCachePlugin,
  cacheInTransformer,
  cacheOutTransformer,
  internalCacheTransformer,
} from '@merkur/plugin-http-cache';
```

Override default request config with `setDefaultConfig` method from `@merkur/plugin-http-client`. The recommended transformer order is:

1. `cacheOutTransformer` – serves already-resolved cached responses (skips fetch)
2. `internalCacheTransformer` – deduplicates in-flight requests (see below)
3. `cacheInTransformer` – stores the fetched response into cache

```javascript
// ./src/widget.js
import { setDefaultConfig, getDefaultTransformers } from '@merkur/plugin-http-client';

export const widgetProperties = {
  name,
  version,
  bootstrap(widget) {
    setDefaultConfig(widget, {
      transformers: [
        ...getDefaultTransformers(widget),
        cacheOutTransformer(widget),
        internalCacheTransformer(widget),
        cacheInTransformer(widget),
      ],
      useCache: true,            // true by default
      transferServerCache: true, // false by default
      ttl: 60000,                // 60 000 ms (60 s) by default
    });
  },
};
```

## Transformers

### cacheOutTransformer

Checks the resolved cache before the fetch. If a non-expired entry exists for the request key, it is returned immediately and the fetch is skipped entirely.

### cacheInTransformer

Stores the fetch response in the cache after a successful request.

### internalCacheTransformer

Deduplicates concurrent in-flight requests to the same endpoint. If a second (or subsequent) request arrives for the same key while the first has not yet resolved, the later requests wait for the first and share its response — no extra fetch is made.

When the first request fails with a network error, all waiting requests are rejected with the same error via the `transformError` hook. The `transformError` signature follows the shared convention: `(widget, error, request)` returning `[error, request]`.

```javascript
// Example: two parallel requests – fetch is called only once
const [r1, r2] = await Promise.all([
  widget.http.request({ path: '/api/data' }),
  widget.http.request({ path: '/api/data' }),
]);
// r1.response and r2.response contain the same data
// r2.response.cached === true
```

To bypass the deduplication (and the resolved cache) for a specific request, use `revalidateCache: true`.

## Per-request options

```javascript
// serve from cache if available
const { response } = await widget.http.request({ path: '/detail/1', useCache: true });

// force a fresh fetch, skip both resolved cache and in-flight deduplication
const { response } = await widget.http.request({ path: '/detail/1', useCache: true, revalidateCache: true });
```

## Methods

### httpCache.serialize / httpCache.deserialize

Used when `transferServerCache: true` to pass the server-side cache snapshot to the client via the `info` endpoint.

```javascript
// server – serialized automatically when transferServerCache is true
const info = await widget.info(); // includes $httpCache

// client – deserialized automatically on bootstrap when $httpCache is present
```

