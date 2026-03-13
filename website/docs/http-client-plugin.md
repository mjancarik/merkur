---
sidebar_position: 12
title: HTTP Client Plugin
description: Learn about the HTTP Client plugin for making API requests in Merkur
---

# HTTP client plugin

The HTTP client plugin adds `http` property to your widget with a `request` method. Under the hood this plugin uses native browser and Node.js [fetch](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) API.

## Installation

We must add import of `httpClientPlugin` and register it to `$plugins` property of the widget.

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

After that we have an `http.request` method available on the widget.

We can override default request config with `setDefaultConfig` method from `@merkur/plugin-http-client`. We can set all [fetch options](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options), `baseUrl`, `timeout` and `transformers`.

```javascript
// ./src/widget.js
import { setDefaultConfig, getDefaultTransformers} from '@merkur/plugin-http-client';

// own debug transform
function transformDebug() {
  return {
    async transformResponse(widget, request, response) {
      console.log(response);
      return [request, response];
    },
    async transformRequest(widget, request, response) {
      console.log(request);

      return [request, response];
    },
  };
}


export const widgetProperties = {
  name,
  version,
  bootstrap(widget) {
    setDefaultConfig(widget,
    {
      transformers: [...getDefaultTransformers(widget), transformDebug()],
      baseUrl: 'http://www.example.com',
      timeout: 5000, // 5s
    });
  }
};
```

## Methods

### request

- `requestConfig` - object - same as default config

The `request` method makes API call to your service throught native browser fetch.

```javascript
try {
  const { response, request } = await widget.http.request({ path: '/detail/1' });

  console.log(request.url); // http://www.example.com/detail/1
  console.log(response.status); // 200
  console.log(response.body); // { data: 'value' }
} catch(error) {
   if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.log(error.request.url); // http://www.example.com/detail/1
      console.log(error.response.status); // 500
      console.log(error.response.body); // { data: 'error message' }
    } else {
      // Something happened in the request
      console.log('Error', error.message);
    }
}
```

## Transformers

Transformers are middleware functions that can intercept and modify requests and responses. Each transformer is an object that can implement up to three methods.

### transformRequest

Called before the fetch is made. Receives `(widget, request, response)` and must return `[request, response]`. If `response` is returned non-null, the fetch is skipped entirely.

### transformResponse

Called after a successful fetch. Receives `(widget, request, response)` and must return `[request, response]`.

### transformError

Called when the fetch itself throws (network error, timeout, abort). Receives `(widget, request, error)` and must return `[request, error]`. The error is always re-thrown after all `transformError` handlers run — this hook is intended for side-effects such as cleanup, logging, or notifying other parts of the system. It is **not** called for non-2xx HTTP responses (those go through `transformResponse` and are rejected afterwards).

```javascript
function transformErrorLogger() {
  return {
    async transformError(widget, request, error) {
      console.error(`Fetch failed for ${request.url}:`, error.message);
      return [request, error];
    },
  };
}

setDefaultConfig(widget, {
  transformers: [...getDefaultTransformers(widget), transformErrorLogger()],
});
```

