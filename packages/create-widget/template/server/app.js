const compression = require('compression');
const cors = require('cors');
const express = require('express');
const expressStaticGzip = require('express-static-gzip');
const helmet = require('helmet');
const morgan = require('morgan');

const { resolveConfig } = require('@merkur/cli/server');

const {
  merkurConfig: { widgetServer },
} = resolveConfig();

const {
  apiErrorMiddleware,
  logErrorMiddleware,
} = require('@merkur/plugin-error/server');

const errorRouteFactory = require('./routes/error');
const widgetAPIRouteFactory = require('./routes/widgetAPI');

const error = errorRouteFactory();
const widgetAPI = widgetAPIRouteFactory();

const expressStaticConfig = {
  enableBrotli: true,
  index: false,
  orderPreference: ['br'],
  maxAge: '14d',
};

const app = express();

app
  .use(morgan('dev'))
  .use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false,
    }),
  )
  .use(cors(widgetServer.cors.options))
  .use(compression())
  .use(
    widgetServer.staticPath,
    expressStaticGzip(widgetServer.staticFolder, expressStaticConfig),
  )
  .use(widgetAPI.router)
  .use(error.router)
  .use(logErrorMiddleware())
  .use(apiErrorMiddleware());

module.exports = {
  app,
};
