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

`transformBody` now automatically sets `Content-Type: application/json` and calls `JSON.stringify` on requests where:
- the body is a **plain object or array** (instances of `FormData`, `Blob`, `string`, `ArrayBuffer`, etc. are **not** affected), and
- the method is not `GET` or `HEAD`, and
- no `Content-Type` header is already present.

Previously, the header had to be set explicitly, and `JSON.stringify` was called for any body type whenever `Content-Type: application/json` was present (which caused double-serialization of pre-serialized strings).

**Migration:** `FormData`, `Blob`, `string`, and other non-plain-object bodies no longer need an explicit `Content-Type` override — they are passed through untouched. If you were relying on the old behaviour of explicitly setting `Content-Type: application/json` for a non-object body and having it serialized, you must now serialize the body yourself before passing it to `request`.

```js
// FormData — no Content-Type needed; fetch sets it with the correct boundary automatically
await widget.http.request({
  method: 'POST',
  path: '/upload',
  body: formData, // passed through as-is
});

// Pre-serialized string — not double-stringified even with explicit Content-Type
await widget.http.request({
  method: 'POST',
  path: '/raw',
  headers: { 'Content-Type': 'application/json' },
  body: '{"already":"serialized"}', // passed through as-is
});
```

### Polyfill required for build targets below ES2017 (ES8)

The `Headers` global (part of the [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Headers)) is used at runtime by `transformHeaders`. Widgets built with a bundler target below ES2017 (e.g. `target: 'es5'` or `target: 'es6'` in webpack/Rollup) that run in environments without a native `Headers` implementation must add a polyfill such as [`whatwg-fetch`](https://github.com/github/fetch) or [`cross-fetch`](https://github.com/lquixada/cross-fetch).
