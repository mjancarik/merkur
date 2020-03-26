const path = require('path');
const fs = require('fs');

const got = require('got');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const ejs = require('ejs');

const merkurModule = require('./lib/widget-server.cjs');

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
  .use('/static', express.static(path.join(__dirname, 'static')))
  .get(
    '/widget',
    asyncMiddleware(async (req, res) => {
      const widget = await merkurModule.createWidget({
        props: {
          name: req.query.name,
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
      const response = await got('http://localhost:4444/widget?name=hyper');
      const widgetProperties = JSON.parse(response.body);
      const { html } = widgetProperties;

      delete widgetProperties.html;

      res.status(200).send(indexTemplate({ widgetProperties, html }));
    })
  )
  .use((error, req, res) => {
    console.error(error);
    res.status(500).json({ error: error.message });
  });

app.listen(4444, () => {
  console.log('listen on localhost:4444'); // eslint-disable-line no-console
});
