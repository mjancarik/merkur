---
layout: docs
title: HTTP client plugin - Merkur
---

# HTTP client plugin

The HTTP client plugin adds `http` property to your widget with `request` method. Under the hood this plugin uses browser native [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API and for server side [node-fetch](https://www.npmjs.com/package/node-fetch) polyfill.

## Installation

We must add import for `httpClientPlugin` and register it to `$plugins` property of the widget.

```javascript
// ./src/widget.js
import { httpClientPlugin } from '@merkur/plugin-http-client';

export const widgetProperties = {
  name,
  version,
  $plugins: [httpClientPlugin],
  // ... other properties
};

```

After that we have `http.request` method available on the widget.

We can override default request config with `setDefaultConfig` method from `@merkur/plugin-http-client`. We can set all [fetch options](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options), `baseUrl` and `transformers`.

```javascript
// ./src/widget.js
import { setDefaultConfig, transformBody, transformQuery } from '@merkur/plugin-http-client';

// own debug transform
function transformDebug() {
  return {
    async transformResponse(request, response) {
      console.log(response);
      return [request, response];
    },
    async transformRequest(request) {
      console.log(request);

      return [request];
    },
  };
}


export const widgetProperties = {
  name,
  version,
  bootstrap() {
    setDefaultConfig({
      baseUrl: 'http://www.example.com',
      transformers: [transformBody(), transformQuery(), transformDebug()],
    });
  }
};
```

## Methods

### request

- requestConfig - object - same as default config

The `request` method makes API call to your service throught native browser fetch.

```javascript
const { response } = await widget.http.request({ path: '/detail/1' });

console.log(response.status); // 200
console.log(response.body); // { data: 'value' }
```
