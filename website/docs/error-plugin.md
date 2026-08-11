---
sidebar_position: 13
title: Error Plugin
description: Learn about the Error plugin for error handling in Merkur
---

# Error plugin

The error plugin adds semi-automatic error handling to your Merkur widget. It hooks into the widget lifecycle (`load`, `mount`, `update`) to catch thrown errors, saves the error state on the widget, and emits an event so the rest of the application can react.

- Returns a custom HTTP status based on the thrown error
- Renders valid JSON with the error code and message via the `info` lifecycle
- Renders an error page (re-runs `mount`/`update` after capturing the error)
- Runs arbitrary code on error via the `ERROR_EVENTS.ERROR` event (e.g. logging)
- Exposes `GenericError` and `ExtensibleError` base classes for custom errors


## Installation

**src/widget.js**

Install plugin:

```javascript
  import { errorPlugin } from '@merkur/plugin-error';

//...

widgetProperties = {
  name,
  version,
  $plugins: [
    //...
    errorPlugin, // keep error plugin as last plugin in array
  ],
  View,
  //...

```

**src/router/widgetAPI/widgetAPI.js**

Set HTTP status in widget API response:

```javascript
//...
.get(
    '/widget',
    //...

      // optional chaining & nullish coalescing operator
      const status = info?.error?.status ?? 200;

      res.status(status).json({ ...info, html });

```

## Operation

The plugin hooks four lifecycle methods: `load`, `mount`, `update`, and `info`.

**`load` hook** — If `widget.error.status` is already set, `load` is skipped entirely and returns `{}`. Otherwise the original `load` is called; if it throws, the error is captured via `setErrorInfo` and an empty result is returned.

**`mount` / `update` hooks** — Delegate to `renderContent`:
- If `widget.error.status` is already set when the hook runs, the original method is attempted once more (giving the view a chance to render its error state). If that also throws, an empty string is returned.
- If no error is set and the original method throws, the error is captured and the hook immediately retries — this time the error state is set so the view can render accordingly.

**`info` hook** — Merges `widget.error` into the info object returned to the host application:

```javascript
// info() output always includes the error field:
{
  error: { status: null, message: null }, // or { status: 500, message: '...' }
  // ...other info fields
}
```

When an error is captured, the plugin:
1. Sets `widget.error.status`, `widget.error.message`, and `widget.error.url` (from `error.params?.url`)
2. In development mode also sets `widget.error.stack`
3. Emits `ERROR_EVENTS.ERROR` with the error object

The error object is available everywhere in the widget, as well as to the host application.

## API

### `ERROR_EVENTS`

A constant object containing event names used by the error plugin.

```javascript
import { ERROR_EVENTS } from '@merkur/plugin-error';

// Listen for error events
widget.on(ERROR_EVENTS.ERROR, ({ error }) => {
  console.error('Widget error occurred:', error);
  // Send error to monitoring service, etc.
});
```

**Available events:**
- `ERROR_EVENTS.ERROR` - Event name: `@merkur/plugin-error.error` - Emitted when an error is caught by the plugin

### `setErrorInfo(widget, error)`

Manually set error information on the widget. This function is used internally by the error plugin but can also be called directly if you need to manually set an error state.

**Note:** This function automatically emits the `ERROR_EVENTS.ERROR` event after setting the error information.

**Parameters:**
- `widget` - The widget instance
- `error` - Error object. Recognized properties:
  - `error.status` — HTTP status code (defaults to `500` if not set)
  - `error.message` — error message string
  - `error.params.url` — optional URL associated with the error, stored as `widget.error.url`

```javascript
import { setErrorInfo } from '@merkur/plugin-error';

const customError = new Error('Custom error message');
customError.status = 503;
customError.params = { url: '/api/data' };

setErrorInfo(widget, customError);

console.log(widget.error);
// {
//   status: 503,
//   message: 'Custom error message',
//   url: '/api/data'
// }
```

In development mode (`NODE_ENV=development`), the error stack trace is also included:

```javascript
// In development
console.log(widget.error);
// {
//   status: 503,
//   message: 'Custom error message',
//   url: '/api/data',
//   stack: '...' // Full stack trace
// }
```

### `renderContent(widget, method, properties)`

The core rendering helper used internally by the `mount` and `update` hooks. It can also be used directly when you need the same error-resilient render logic in a custom lifecycle method.

**Parameters:**
- `widget` - The widget instance
- `method` - An async function to call (e.g. the original `mount`/`update`)
- `properties` - Array of arguments to pass to `method`

**Behaviour:**
- If `widget.error.status` is already set: calls `method` once and returns its result, or returns `''` if it throws (without overwriting the existing error).
- If `widget.error.status` is not set: calls `method`; if it throws, captures the error with `setErrorInfo` and recursively retries (now with error state set).

```javascript
import { renderContent } from '@merkur/plugin-error';

// In a custom lifecycle hook:
async function customRender(widget, originalRender, ...args) {
  return renderContent(widget, originalRender, args);
}
```

## Limitations

The plugin can't handle errors occurring outside of lifecycle functions.

## Custom errors

### `GenericError`

`GenericError` extends `ExtensibleError` and is the recommended way to throw errors with a specific HTTP status code and additional parameters.

**Constructor:** `new GenericError(message, params)`
- `message` — error message string
- `params` — object with any extra data; `params.status` sets the HTTP status (defaults to `500`) and is removed from `params` itself

**`params` getter** — returns the extra parameters (excluding `status`):

```javascript
import { GenericError } from '@merkur/plugin-error';

const error = new GenericError('Operation failed.', {
  status: 503,
  reason: 'api_error',
  url: '/api/data',
});

console.log(error.status);        // 503
console.log(error.message);       // 'Operation failed.'
console.log(error.params);        // { reason: 'api_error', url: '/api/data' }
console.log(error.params.url);    // '/api/data' — stored as widget.error.url by setErrorInfo
```

### `ExtensibleError`

`ExtensibleError` is the abstract base class that fixes Babel-related issues with extending the native `Error` class. Use it when you need a custom error hierarchy beyond `GenericError`:

```javascript
import { GenericError } from '@merkur/plugin-error';
// GenericError already extends ExtensibleError — extend it for custom errors:

class NotFoundError extends GenericError {
  constructor(url) {
    super(`Not found: ${url}`, { status: 404, url });
  }
}

throw new NotFoundError('/missing-page');
```

## Server-side Express Middleware

The `@merkur/plugin-error/server` module provides Express middleware functions for handling errors in server-side rendering scenarios.

### `logErrorMiddleware()`

Simple Express middleware to log errors to console. This middleware logs the error and passes it to the next error handler in the chain.

**Usage:**

```javascript
const { logErrorMiddleware } = require('@merkur/plugin-error/server');

// Add as error handling middleware
app.use(logErrorMiddleware());

// Or in your router
router.use(logErrorMiddleware());
```

**Example with complete error handling chain:**

```javascript
const express = require('express');
const { logErrorMiddleware, apiErrorMiddleware } = require('@merkur/plugin-error/server');

const app = express();

// Your routes
app.get('/widget', widgetHandler);

// Error handling middleware (order matters!)
app.use(logErrorMiddleware());  // First: log the error
app.use(apiErrorMiddleware());  // Then: send error response
```

### `apiErrorMiddleware()`

Express middleware that returns widget-like JSON on errors that couldn't be handled by the error plugin. This is useful for widget API endpoints.

**Response format:**

```javascript
{
  error: {
    status: 500,
    message: 'Error message'
  }
}
```

In development mode (`NODE_ENV=development`), the response also includes the error stack trace:

```javascript
{
  error: {
    status: 500,
    message: 'Error message',
    stack: '...' // Full stack trace in development only
  }
}
```

**Usage:**

```javascript
const { apiErrorMiddleware } = require('@merkur/plugin-error/server');

// Add as the last error handling middleware
app.use('/api/widget', widgetAPIHandler);
app.use(apiErrorMiddleware());
```

**Complete example:**

```javascript
const express = require('express');
const { logErrorMiddleware, apiErrorMiddleware } = require('@merkur/plugin-error/server');

const app = express();

// Widget API endpoint
app.get('/api/widget', async (req, res) => {
  // If an error occurs here, it will be caught by the middleware
  const widget = await createWidget();
  res.json(widget);
});

// Error handling middleware chain
app.use(logErrorMiddleware());  // Log errors to console
app.use(apiErrorMiddleware());  // Return error JSON to client

app.listen(3000);
```
