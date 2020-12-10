const path = require('path');
const fs = require('fs');

const got = require('got');
const express = require('express');
const ejs = require('ejs');

const { playgroundErrorMiddleware } = require('@merkur/plugin-error/server');

const { asyncMiddleware, getServerUrl } = require('../utils');

const playgroundTemplate = ejs.compile(
  fs.readFileSync(path.join(__dirname, '/playground.ejs'), 'utf8')
);

const router = express.Router();
const container = 'container';

router
  .get(
    '/',
    asyncMiddleware(async (req, res) => {
      const widgetProperties = await got(`${getServerUrl(req)}/widget`, {
        retry: 0,
        responseType: 'json',
        searchParams: {
          name: 'merkur',
          counter: 0,
        },
      }).json();

      const { html } = widgetProperties;
      widgetProperties.props.containerSelector = `.${container}`;

      delete widgetProperties.html;

      res
        .status(200)
        .send(playgroundTemplate({ widgetProperties, html, container }));
    })
  )
  .use(
    playgroundErrorMiddleware({
      renderPlayground: playgroundTemplate,
      container,
    })
  );

module.exports = () => ({ router });
