function asyncMiddleware(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function getServerUrl(req) {
  return (req.secure ? 'https' : 'http') + '://' + req.headers.host;
}

module.exports = {
  asyncMiddleware,
  getServerUrl,
};
