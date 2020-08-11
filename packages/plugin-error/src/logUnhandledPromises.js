function defaultLogError(err, promise) {
  console.error(`WARNING: Unhandled promise rejection`);
  console.error('------------------------------------');
  console.error(err);
  console.error(promise);
}

function logUnhandledPromises(logError = defaultLogError) {
  const event = 'unhandledRejection';

  process.on(event, (err, promise) => {
    logError(err, promise);
  });
}

module.exports = { logUnhandledPromises };
