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

const playgroundRouteFactory = require('./routes/playground');
const playground = playgroundRouteFactory();

const errorRouteFactory = require('./routes/error');
const error = errorRouteFactory();

const widgetAPIRouteFactory = require('./routes/widgetAPI');
const widgetAPI = widgetAPIRouteFactory();

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
