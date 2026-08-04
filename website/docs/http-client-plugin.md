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
    // Network/timeout error – the fetch never received a response.
    // The error is enriched with the original request for diagnostics:
    console.log(error.message);          // e.g. "Failed to fetch"
    console.log(error.request.url);      // http://www.example.com/detail/1
    console.log(error.response);         // null
    console.log(error.cause.request);    // same as error.request
    console.log(error.cause.response);   // null
  }
}
```

#### POST request with JSON body, custom headers, and cookies

Cookies are sent automatically for same-origin requests. For cross-origin requests set `credentials` to `'include'`. Custom headers such as `Authorization` or `X-Request-ID` can be passed via the `headers` option:

```javascript
const { response } = await widget.http.request({
  method: 'POST',
  path: '/items',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Bearer my-access-token',
    'X-Request-ID': 'abc-123',
  },
  body: { name: 'New item', value: 42 },
  credentials: 'include', // forward cookies cross-origin
});

console.log(response.status); // 201
console.log(response.body);   // { id: 123, name: 'New item', value: 42 }
```

#### Sending query parameters

```javascript
const { response } = await widget.http.request({
  path: '/items',
  query: { page: 2, limit: 10, sort: 'name' },
});

console.log(request.url); // http://www.example.com/items?page=2&limit=10&sort=name
```

#### Overriding the base URL for a single request

```javascript
const { response } = await widget.http.request({
  baseUrl: 'https://api.other-service.com',
  path: '/data',
});

console.log(request.url); // https://api.other-service.com/data
```

### setDefaultConfig

```javascript
setDefaultConfig(widget, newDefaultConfig)
```

Merges `newDefaultConfig` shallowly into the widget's existing default request config. Call this inside `bootstrap(widget)` to establish widget-wide defaults before any request is made.

| Key | Type | Default | Description |
|---|---|---|---|
| `method` | `string` | `'GET'` | HTTP method |
| `baseUrl` | `string` | `''` | Base URL prepended to `path` |
| `path` | `string` | `'/'` | Path appended to `baseUrl` |
| `url` | `string` | — | Full URL; if set, `baseUrl` and `path` are ignored |
| `headers` | `object` | `{}` | Request headers |
| `query` | `object` | `{}` | Key/value pairs encoded as query string |
| `body` | `any` | — | Request body; serialized to JSON when `Content-Type: application/json` |
| `timeout` | `number` | `15000` | Abort timeout in milliseconds |
| `transformers` | `Array` | built-ins | Transformer pipeline (see [Built-in transformers](#built-in-transformers)) |
| *(fetch options)* | | | Any option accepted by the native [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch#Supplying_request_options) (e.g. `credentials`, `mode`, `cache`) |

```javascript
import { setDefaultConfig, getDefaultTransformers } from '@merkur/plugin-http-client';

export const widgetProperties = {
  name,
  version,
  $plugins: [httpClientPlugin],
  bootstrap(widget) {
    setDefaultConfig(widget, {
      baseUrl: 'https://api.example.com',
      timeout: 5000,
      headers: { 'X-App-Version': version },
      transformers: getDefaultTransformers(widget),
    });
  },
};
```

### getDefaultTransformers

```javascript
getDefaultTransformers(widget) // returns Array<HttpTransformer>
```

Returns the three built-in transformer instances in their default execution order:

1. `transformBody` — serializes the request body and deserializes the response body
2. `transformQuery` — builds the request URL from `baseUrl` + `path` and appends `query` parameters
3. `transformTimeout` — sets up an `AbortController`-based request timeout

Spread the result into a custom `transformers` array to preserve default behaviour while adding your own transformers:

```javascript
import { setDefaultConfig, getDefaultTransformers } from '@merkur/plugin-http-client';

setDefaultConfig(widget, {
  transformers: [
    ...getDefaultTransformers(widget),
    myAuthTransformer(),
    myLoggingTransformer(),
  ],
});
```

Omitting `getDefaultTransformers` (i.e. providing a `transformers` array that does not include them) means URL building, body serialization, and timeouts no longer happen automatically.

## Key behaviors

### Non-2xx response rejects the promise

When the server replies with a status outside the 2xx range, `http.request()` rejects with an `Error` containing:

- `error.message` — `"Received <status> status code when requesting <url>"`
- `error.request` — the fully-transformed request object
- `error.response` — the response with a parsed `body` (JSON or text, depending on `Content-Type`)
- `error.cause` — `{ request, response }` following the standard [Error cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) pattern

```javascript
try {
  await widget.http.request({ path: '/resource' });
} catch (error) {
  console.log(error.response.status); // e.g. 404
  console.log(error.response.body);   // parsed response body
  console.log(error.request.url);     // https://api.example.com/resource
}
```

### Network and timeout errors reject the promise

When `fetch` itself throws (DNS failure, connection refused, request aborted due to timeout, etc.), `http.request()` rejects after running all `transformError` handlers. The thrown error is enriched with:

- `error.request` — the fully-transformed request object
- `error.response` — `null`
- `error.cause` — `{ request, response: null }`

```javascript
try {
  await widget.http.request({ path: '/resource', timeout: 3000 });
} catch (error) {
  console.log(error.message);        // e.g. "The operation was aborted"
  console.log(error.response);       // null
  console.log(error.request.url);    // https://api.example.com/resource
}
```

### Skipping fetch from a transformer

If any `transformRequest` hook returns a non-null `response`, the `fetch()` call is bypassed entirely and the pipeline continues directly with `transformResponse`. This is useful for caching, mocking, or returning synthetic responses:

```javascript
function transformCache(cache) {
  return {
    async transformRequest(widget, request, response) {
      const cached = cache.get(request.url);
      if (cached) {
        return [request, cached]; // fetch is skipped
      }
      return [request, response];
    },
    async transformResponse(widget, request, response) {
      cache.set(request.url, response);
      return [request, response];
    },
  };
}
```

## Built-in transformers

### transformBody

Handles serialization of the request body and deserialization of the response body.

**`transformRequest`** — When `body` is set and `Content-Type: application/json` is present in the request headers and the method is not `GET` or `HEAD`, the body is serialized with `JSON.stringify`.

**`transformResponse`** — After a successful fetch, reads the response stream:
- `application/json` content-type → parsed with `response.json()`
- any other content-type → read with `response.text()`
- HTTP 204 No Content → response is passed through unchanged (no body reading)

```javascript
// Sending and receiving JSON:
const { response } = await widget.http.request({
  method: 'POST',
  path: '/items',
  headers: { 'Content-Type': 'application/json' },
  body: { name: 'widget', count: 3 }, // automatically serialized
});
console.log(response.body); // { id: 7, name: 'widget', count: 3 } — automatically parsed
```

### transformQuery

Builds the final request URL and appends query parameters.

**`transformRequest`** — Constructs `request.url` from `baseUrl` + `path` (handling trailing and leading slashes). If `request.url` is already set it is used as-is. Values from the `query` object are then `encodeURIComponent`-encoded and appended as a query string. Existing query strings in the URL are preserved.

```javascript
// URL is built automatically:
const { request } = await widget.http.request({
  path: '/search',
  query: { q: 'hello world', page: 1 },
});
console.log(request.url); // https://api.example.com/search?q=hello%20world&page=1

// Bypass URL building by providing a full URL:
const { request: r } = await widget.http.request({
  url: 'https://cdn.example.com/asset.json',
});
console.log(r.url); // https://cdn.example.com/asset.json
```

### transformTimeout

Enforces a request timeout using the [AbortController API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).

**`transformRequest`** — When `timeout` is present in the request config, creates an `AbortController`, attaches `controller.signal` to the request, and starts a `setTimeout` that calls `controller.abort()` after `timeout` milliseconds.

**`transformResponse`** — Clears the timeout timer so it does not fire after a successful response.

```javascript
// Per-request timeout override:
try {
  await widget.http.request({ path: '/slow-endpoint', timeout: 2000 });
} catch (error) {
  // AbortError — request was aborted after 2 s
  console.log(error.message); // "The operation was aborted"
}

// Disable timeout for a single request:
const { response } = await widget.http.request({
  path: '/download',
  timeout: undefined,
});
```

## Custom transformers

Transformers are middleware objects that can intercept and modify requests, responses, and errors. Each transformer can implement up to three methods.

### transformRequest

Called before the fetch is made. Receives `(widget, request, response)` and must return `[request, response]`. If `response` is returned non-null, the fetch is skipped entirely (see [Skipping fetch from a transformer](#skipping-fetch-from-a-transformer)).

```javascript
// Inject an Authorization header into every request:
function transformAuth(getToken) {
  return {
    async transformRequest(widget, request, response) {
      return [
        {
          ...request,
          headers: { ...request.headers, Authorization: `Bearer ${getToken()}` },
        },
        response,
      ];
    },
  };
}

setDefaultConfig(widget, {
  transformers: [...getDefaultTransformers(widget), transformAuth(() => widget.token)],
});
```

### transformResponse

Called after a successful fetch (and after `transformBody` has parsed the body). Receives `(widget, request, response)` and must return `[request, response]`.

```javascript
// Log every response and unwrap a common API envelope:
function transformApiEnvelope() {
  return {
    async transformResponse(widget, request, response) {
      console.log(`[${response.status}] ${request.url}`);
      // Unwrap { data: ..., meta: ... } envelope
      return [request, { ...response, body: response.body?.data ?? response.body }];
    },
  };
}

setDefaultConfig(widget, {
  transformers: [...getDefaultTransformers(widget), transformApiEnvelope()],
});
```

### transformError

Called when the fetch itself throws (network error, timeout, abort). Receives `(widget, error, request)` and must return `[error, request]`. The error is always re-thrown after all `transformError` handlers run — this hook is intended for side-effects such as cleanup, logging, or notifying other parts of the system. It is **not** called for non-2xx HTTP responses (those go through `transformResponse` and are rejected afterwards).

After all `transformError` handlers run, the thrown error is enriched with:
- `error.cause` — `{ request, response: null }` following the standard [Error cause](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) pattern
- `error.request` — the fully-transformed request object (backward compatibility)
- `error.response` — `null` (backward compatibility, mirrors the shape of HTTP-status errors)

```javascript
function transformErrorLogger() {
  return {
    async transformError(widget, error, request) {
      console.error(`Fetch failed for ${request.url}:`, error.message);
      return [error, request];
    },
  };
}

setDefaultConfig(widget, {
  transformers: [...getDefaultTransformers(widget), transformErrorLogger()],
});
```

