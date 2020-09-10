//**** CALLBACK DEFINITIONS ****//

/**
 * playgroundErrorMiddleware error render function. This is used when rendering playground fails. It's recommended to either mute this for production, or sanitize the output thoroughly.
 *
 * @callback playgroundErrorRenderer
 * @param {string} message
 */

/**
 * Function to render the playground page normally (e.g. a compiled EJS template).
 *
 * @callback playgroundRenderer
 * @param {object} properties
 */

/**
 * logUnhandledPromises logging function.
 *
 * @callback unhandledPromiseLogger
 * @param {string} err
 * @param {Promise} promise
 */

//**** ****//

const DEV = 'development';
const ENV =
  typeof process !== 'undefined' && process && process.env
    ? process.env.NODE_ENV
    : DEV;

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
  return ENV === DEV ? message : '';
}

/**
 * Express middleware that attempts to render a widget that has been returned with a non-OK HTTP status.
 *
 * @param {playgroundRenderer} renderPlayground
 * @param {object} props Default widget prop values
 * @param {playgroundErrorRenderer} renderError
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
