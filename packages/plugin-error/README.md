# @merkur/plugin-error

A plugin for [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices.


@merkur/plugin-error adds semi-automatic error handling to your Merkur widget: 

  * Return a custom HTTP status based on thrown error
  * Render valid JSON with error code and message
  * Render an error page
  * Run arbitrary code on error (e.g. to log/report the error)
  * Catch unhandled promise errors


## Installation

**src/widget.js**

Install plugin and define `errorHandler` and `ErrorView`:

```javascript
  import { errorPlugin } from '@merkur/plugin-error';

//...

widgetProperties = {
  name,
  version,
  $plugins: [
    //...
    errorPlugin,
  ],
  View,
  ErrorView: , // OPTIONAL
  errorHandler: (widget, thrownError) => {  // OPTIONAL
    console.log('do something here');
  },
  //...

```
**server/app.js**

Install the unhandled promises listener:

```javascript
const {
  logUnhandledPromises,
} = require('@merkur/plugin-error/logUnhandledPromises.js');
logUnhandledPromises();
```

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

To allow widget playground to display the widget in error state, replace the default error-handling middleware with this:

```javascript
//...
//eslint-disable-next-line no-unused-vars
  .use((error, req, res, next) => {
    const container = 'container';

    if (typeof error.response?.body?.html === 'undefined') {
      res.status(500).json({
        error: {
          status: 500,
          message: error.message,
        },
      });
    }

    const widgetProperties = error.response.body;
    const errorStatus = widgetProperties.error.status;
    const { html } = widgetProperties;
    delete widgetProperties.html;

    res
      .status(errorStatus)
      .send(indexTemplate({ widgetProperties, html, container }));
  });
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
* runs the `errorHandler` function (if defined)
* switches `View` for `ErrorView` and re-runs the function (if defined)

The error object is available everywhere in the widget, as well as to the host application.

### errorHandler

If defined, the `errorHandler` is called with `widget` and the original thrown `Error`. 

### ErrorView

If `ErrorView` is defined on the `widget` object, the plugin will automatically swap it for default `View` and call the `mount()` function again to render it.

If you do not use `View` for rendering widget HTML, you can either not define `ErrorView`(no substitution and re-render will be done), or set it to an arbitrary value - in which case you must assure that it avoids the error somehow (you can use the `widget.error` object).


## Limitations

The plugin can't handle errors ocurring outside of lifecycle functions. 

