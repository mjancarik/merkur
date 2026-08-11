---
"@merkur/plugin-http-client": major
---

**Breaking changes in `@merkur/plugin-http-client`**

### `request.headers` is now always a `Headers` instance

A new built-in `transformHeaders` transformer has been added as the first step in the default transformer pipeline. It normalizes `request.headers` to a [`Headers`](https://developer.mozilla.org/en-US/docs/Web/API/Headers) instance for every request.

**Migration:** Custom transformers that read or write `request.headers` using plain object access (e.g. `request.headers['Content-Type']` or `{ ...request.headers, ... }`) must be updated to use the `Headers` API:

```js
// Before
async transformRequest(widget, request, response) {
  return [{ ...request, headers: { ...request.headers, Authorization: `Bearer ${token}` } }, response];
}

// After
async transformRequest(widget, request, response) {
  const headers = new Headers(request.headers);
  headers.set('Authorization', `Bearer ${token}`);
  return [{ ...request, headers }, response];
}
```

### `getDefaultTransformers` now returns four transformers

`transformHeaders` is now the first entry in the array returned by `getDefaultTransformers()`. Code that relied on the exact length or index positions of the default transformer array must be updated.

If you supply a custom `transformers` array via `setDefaultConfig` **without** spreading `getDefaultTransformers()`, you must add `transformHeaders()` manually as the first transformer to ensure `request.headers` is always a `Headers` instance:

```js
import { setDefaultConfig, transformHeaders, transformBody, transformQuery, transformTimeout } from '@merkur/plugin-http-client';

// Before — custom pipeline without getDefaultTransformers
setDefaultConfig(widget, {
  transformers: [transformBody(), transformQuery(), transformTimeout(), myTransformer()],
});

// After — add transformHeaders as the first entry
setDefaultConfig(widget, {
  transformers: [transformHeaders(), transformBody(), transformQuery(), transformTimeout(), myTransformer()],
});
```

### Default `Content-Type: application/json` for body requests

`transformBody` now automatically sets `Content-Type: application/json` on requests that carry a `body` and use a method other than `GET` or `HEAD`, when no `Content-Type` header is already present. Previously, the header had to be set explicitly.

**Migration:** If you were sending a body with a non-JSON content type and relying on the absence of a default `Content-Type`, you must now explicitly set your desired `Content-Type` header:

```js
// Explicitly set a non-JSON content type to override the default
await widget.http.request({
  method: 'POST',
  path: '/upload',
  headers: { 'Content-Type': 'multipart/form-data' },
  body: formData,
});
```

### Polyfill required for build targets below ES2017 (ES8)

The `Headers` global (part of the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Headers)) is used at runtime by `transformHeaders`. Widgets built with a bundler target below ES2017 (e.g. `target: 'es5'` or `target: 'es6'` in webpack/Rollup) that run in environments without a native `Headers` implementation must add a polyfill such as [`whatwg-fetch`](https://github.com/github/fetch) or [`cross-fetch`](https://github.com/lquixada/cross-fetch).
