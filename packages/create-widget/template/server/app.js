const path = require('path');

const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');

const {
  apiErrorMiddleware,
  logErrorMiddleware,
} = require('@merkur/plugin-error/server');

const app = express();
app.set('view engine', 'ejs');

const playgroundRouterFactory = require('./router/playground');
const playground = playgroundRouterFactory();

const errorRouterFactory = require('./router/error');
const error = errorRouterFactory();

const widgetAPIRouterFactory = require('./router/widgetAPI');
const widgetAPI = widgetAPIRouterFactory();

app
  .use(
    helmet({
      contentSecurityPolicy: false,
    })
  )
  .use(compression())
  .use(cors())
  .use('/static', express.static(path.join(__dirname, 'static')))
  .use('/static', express.static(path.join(__dirname, '../build/static')))
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
