const path = require('path');
const fs = require('fs');

const got = require('got');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const ejs = require('ejs');
const config = require('config');

const merkurModule = require('../build/widget-server.cjs');

const indexTemplate = ejs.compile(
  fs.readFileSync(path.join(__dirname, '/view/index.ejs'), 'utf8')
);

const asyncMiddleware = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const app = express();

app.set('view engine', 'ejs');

app
  .use(helmet())
  .use(compression())
  .use(cors())
  .use('/static', express.static(path.join(__dirname, 'static')))
  .use('/static', express.static(path.join(__dirname, '../build/static')))
  .use(
    '/@merkur/tools/static/',
    express.static(path.join(__dirname, '../node_modules/@merkur/tools/static'))
  )
  .get(
    '/widget',
    asyncMiddleware(async (req, res) => {
      const widget = await merkurModule.createWidget({
        props: {
          name: req.query.name,
          containerSelector: req.query.containerSelector,
        },
      });

      const html = await widget.mount();
      const info = await widget.info();

      res.json({ ...info, html });
    })
  )
  .get(
    '/',
    asyncMiddleware(async (req, res) => {
      const container = 'container';
      const response = await got(
        `http://localhost:${
          config.server.port
        }/widget?name=merkur&counter=0&containerSelector=${encodeURIComponent(
          `.${container}`
        )}`
      );
      const widgetProperties = JSON.parse(response.body);
      const { html } = widgetProperties;

      delete widgetProperties.html;

      res
        .status(200)
        .send(indexTemplate({ widgetProperties, html, container, config }));
    })
  )
  .use((req, res) => {
    res.status(404).json({ error: `The endpoint ${req.path} doesn't exist.` });
  })
  .use((error, req, res) => {
    res.status(500).json({ error: error.message });
  });

module.exports = {
  app,
};
