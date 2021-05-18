const path = require('path');

const express = require('express');
const compression = require('compression');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const expressStaticGzip = require('express-static-gzip');

const {
  apiErrorMiddleware,
  logErrorMiddleware,
} = require('@merkur/plugin-error/server');

const expressStaticConfig = {
  enableBrotli: true,
  index: false,
  orderPreference: ['br'],
  maxAge: '14d',
};

const app = express();
app.set('view engine', 'ejs');

const playgroundRouterFactory = require('./router/playground');
const playground = playgroundRouterFactory();

const errorRouterFactory = require('./router/error');
const error = errorRouterFactory();

const widgetAPIRouterFactory = require('./router/widgetAPI');
const widgetAPI = widgetAPIRouterFactory();

app
  .use(morgan('dev'))
  .use(
    helmet({
      contentSecurityPolicy: false,
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
