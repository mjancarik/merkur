---
layout: docs
title: HTTP client plugin - Merkur
---

# HTTP client plugin

The HTTP client plugin adds `http` property to your widget with `request` method. The plugin use under the hood browser native [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API and for server side [node-fetch](https://www.npmjs.com/package/node-fetch) polyfill.

## Installation

We must add imported `httpClientPlugin` to widget property `$plugins`.

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

After that we have got available `http.request`methodon widget.

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

The `request` method makes API call to your service throught native browser fetch.

```javascript
const { response } = await widget.http.request({ path: '/detail/1' });

console.log(response.status); // 200
console.log(response.body); // { data: 'value' }
```
