/**
 * logUnhandledPromises logging function.
 *
 * @callback unhandledPromiseLogger
 * @param {string} err
 * @param {Promise} promise
 */

function defaultUnhandledPromiseError(err, promise) {
  console.error(`WARNING: Unhandled promise rejection`);
  console.error('------------------------------------');
  console.error(err);
  console.error(promise);
}

/**
 * Respond to unhandled promise rejection errors with a custom logger/handler.
 *
 * @param   {unhandledPromiseLogger}  logError
 */
function logUnhandledPromises(logError = defaultUnhandledPromiseError) {
  const event = 'unhandledRejection';

  process.on(event, (err, promise) => {
    logError(err, promise);
  });
}

/**
 * Simple Express middleware to return widget-like JSON on error that couldn't be handled by plugin-error.
 */
function apiErrorMiddleware() {
  //eslint-disable-next-line no-unused-vars
  return (error, req, res, next) => {
    // error handling for widget API
    const errorStatus = error.status || 500;

    res.status(errorStatus).json({
      error: {
        status: errorStatus,
        message: error.message || 'Unknown error',
      },
    });
  };
}

function defaultPlaygroundError(message) {
  return process.env.NODE_ENV === 'dev' ? message : '';
}

/**
 * Express middleware that attempts to render a widget that has been returned with a non-OK HTTP status.
 */
function playgroundErrorMiddleware(
  renderPlayground,
  props = {},
  renderError = defaultPlaygroundError
) {
  //eslint-disable-next-line no-unused-vars
  return (error, req, res, next) => {
    // error handling for playground page
    let output = '';
    let errorStatus = error.status || 500;

    const widgetProperties = error.response.body;
    if (widgetProperties) {
      errorStatus = widgetProperties.error.status;
    }

    const { html } = widgetProperties;
    if (typeof html !== 'undefined') {
      try {
        delete widgetProperties.html;

        output = renderPlayground({ widgetProperties, html, ...props });
      } catch (e) {
        output = renderError(
          `Failed to handle error: "${e.message}". Original error: "${error.message}".`
        );
      }
    } else {
      output = renderError(`ERROR: ${widgetProperties.error.message}`);
    }

    res.status(errorStatus).send(output);
  };
}

module.exports = {
  apiErrorMiddleware,
  logUnhandledPromises,
  playgroundErrorMiddleware,
};
