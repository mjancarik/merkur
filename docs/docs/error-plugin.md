---
layout: docs
title: Error plugin - Merkur
---

# Error plugin

A plugin for [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices.


@merkur/plugin-error adds semi-automatic error handling to your Merkur widget:

  * Return a custom HTTP status based on thrown error
  * Render valid JSON with error code and message
  * Render an error page
  * Run arbitrary code on error (e.g. to log/report the error)
  * Catch unhandled promise errors


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

**src/router/playground/playground.js**

To allow widget playground to display the widget in error state, add playground error-handling middleware after playground route.

```javascript
//...
const { playgroundErrorMiddleware } = require('@merkur/plugin-error/server');

// ...

const router = express.Router();
const containerSelector = '.container';

router
  .get(
    '/',
    asyncMiddleware(async (req, res) => {
      // ....
      res
        .status(200)
        .send(playgroundTemplate({ widgetProperties, html, containerSelector }));
    })
  )
  .use(playgroundErrorMiddleware({ renderPlayground: playgroundTemplate, containerSelector }))
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
* [emit]({{ 'docs/event-emitter-plugin#emit' | relative_url }}) `ERROR` event with thrown error
* Re-runs the function (if defined)

The error object is available everywhere in the widget, as well as to the host application.

## Limitations

The plugin can't handle errors occurring outside of lifecycle functions.
