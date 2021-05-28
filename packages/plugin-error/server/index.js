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

//**** ****//

const DEV = 'development';
const ENV =
  typeof process !== 'undefined' && process && process.env
    ? process.env.NODE_ENV
    : DEV;

/**
 * Simple Express middleware to return widget-like JSON on error that couldn't be handled by plugin-error.
 *
 * @returns {function}
 */
// eslint-disable-next-line no-unused-vars
function apiErrorMiddleware() {
  //eslint-disable-next-line no-unused-vars
  return (error, req, res, next) => {
    // error handling for widget API
    const errorStatus = error.status || 500;

    let errorJSON = {
      error: {
        status: errorStatus,
        message: error.message || 'Unknown error',
      },
    };

    if (ENV === DEV) {
      errorJSON.error.stack = error.stack;
    }

    res.status(errorStatus).json(errorJSON);
  };
}

/**
 * Simple Express middleware to log error to console.
 *
 * @returns {function}
 */
// eslint-disable-next-line no-unused-vars
function logErrorMiddleware() {
  //eslint-disable-next-line no-unused-vars
  return (error, req, res, next) => {
    console.error(error);
    next(error);
  };
}

/**
 * Express middleware that attempts to render a widget that has been returned with a non-OK HTTP status.
 *
 * @param {object} config
 * @param {playgroundRenderer} config.renderPlayground
 * @param {string} config.containerSelector
 * @returns {function}
 */
// eslint-disable-next-line no-unused-vars
function playgroundErrorMiddleware({
  renderPlayground,
  containerSelector,
} = {}) {
  //eslint-disable-next-line no-unused-vars
  return (error, req, res, next) => {
    // error handling for playground page
    let output = '';
    let errorStatus = error.status || 500;

    const widgetProperties = error?.response?.body;

    if (!widgetProperties) {
      next(error);
      return;
    }

    errorStatus = widgetProperties?.error?.status || 500;
    const { html } = widgetProperties;
    if (typeof html === 'undefined') {
      next(error);
      return;
    }

    try {
      delete widgetProperties.html;
      widgetProperties.containerSelector = `.${containerSelector}`;

      output = renderPlayground({ widgetProperties, html, containerSelector });
      res.status(errorStatus).send(output);
    } catch (e) {
      console.error(e);
      next(widgetProperties.error ?? e);
    }
  };
}

module.exports = {
  logErrorMiddleware,
  apiErrorMiddleware,
  playgroundErrorMiddleware,
};
