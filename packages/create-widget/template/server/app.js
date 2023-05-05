const path = require('path');

const compression = require('compression');
const cors = require('cors');
const express = require('express');
const expressStaticGzip = require('express-static-gzip');
const helmet = require('helmet');
const morgan = require('morgan');

const {
  apiErrorMiddleware,
  logErrorMiddleware,
} = require('@merkur/plugin-error/server');

const errorRouteFactory = require('./routes/error');
const playgroundRouteFactory = require('./routes/playground');
const widgetAPIRouteFactory = require('./routes/widgetAPI');

const error = errorRouteFactory();
const playground = playgroundRouteFactory();
const widgetAPI = widgetAPIRouteFactory();

const expressStaticConfig = {
  enableBrotli: true,
  index: false,
  orderPreference: ['br'],
  maxAge: '14d',
};

const app = express();
app.set('view engine', 'ejs');
app.set('trust proxy', true);

app
  .use(morgan('dev'))
  .use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: false,
      crossOriginEmbedderPolicy: false,
    })
  )
  .use(cors())
  .use(compression())
  .use(
    '/static',
    expressStaticGzip(path.join(__dirname, 'static'), expressStaticConfig)
  )
  .use(
    '/static',
    expressStaticGzip(
      path.join(__dirname, '../build/static'),
      expressStaticConfig
    )
  )
  .use(
    '/@merkur/tools/static/',
    express.static(path.join(__dirname, '../node_modules/@merkur/tools/static'))
  )
  .use(widgetAPI.router)
  .use(playground.router)
  .use(error.router)
  .use(logErrorMiddleware())
  .use(apiErrorMiddleware());

module.exports = {
  app,
};
