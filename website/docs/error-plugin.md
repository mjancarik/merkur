---
sidebar_position: 13
title: Error Plugin
description: Learn about the Error plugin for error handling in Merkur
---

# Error plugin

A plugin for [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices.


@merkur/plugin-error adds semi-automatic error handling to your Merkur widget:

  * Return a custom HTTP status based on thrown error
  * Render valid JSON with error code and message
  * Render an error page
  * Run arbitrary code on error (e.g. to log/report the error)
  * Catch unhandled promise errors
  * Provide error class to extend


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

When an error is thrown, the plugin does the following:

* saves the error status and message on the widget object:
  ```javascript
    widget.error = {
      status: error.status || 500,
      message: error.message
    }
  ```
* [emit](/docs/event-emitter-plugin#emit) `ERROR` event with thrown error
* Re-runs the function (if defined)

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
- `error` - Error object with `status` and `message` properties

```javascript
import { setErrorInfo } from '@merkur/plugin-error';

const customError = new Error('Custom error message');
customError.status = 503;

setErrorInfo(widget, customError);

console.log(widget.error);
// {
//   status: 503,
//   message: 'Custom error message',
//   url: undefined
// }
```

In development mode (`NODE_ENV=development`), the error stack trace is also included:

```javascript
// In development
console.log(widget.error);
// {
//   status: 503,
//   message: 'Custom error message',
//   url: undefined,
//   stack: '...' // Full stack trace
// }
```

## Limitations

The plugin can't handle errors occurring outside of lifecycle functions.

## Custom errors

You can throw custom errors by instantiating `GenericError` class or create custom error classes that extend `GenericError`.

`GenericError` class carries `status` param among with other params. This way error plugin can respond with adequate HTTP status and also include data for encountered error.

```javascript
import { GenericError } from '@merkur/plugin-error';

throw new GenericError('Operation failed.', {
  status: 500,
  reason: 'api_error'
})
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
