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

module.exports = {
  logErrorMiddleware,
  apiErrorMiddleware,
};
