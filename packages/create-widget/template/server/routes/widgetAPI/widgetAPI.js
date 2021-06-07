const express = require('express');
const config = require('config');

const { createAssets, memo } = require('@merkur/integration/server/');
const memoCreateAssets = memo(createAssets);

const widgetEnvironment = config.get('widget');
const merkurModule = require('../../../build/widget.cjs');

const { asyncMiddleware, getServerUrl } = require('../utils');

const router = express.Router();
router.get(
  '/widget',
  asyncMiddleware(async (req, res) => {
    const widget = await merkurModule.createWidget({
      props: {
        name: req.query.name,
        environment: widgetEnvironment,
      },
    });

    const { html, slots = {} } = await widget.mount();
    const info = await widget.info();

    const staticFolder = `${__dirname}/../../../build/static`;
    const staticBaseUrl = `${getServerUrl(req)}/static`;

    info.assets = await memoCreateAssets({
      assets: info.assets,
      staticFolder,
      staticBaseUrl,
      folders: ['es9', 'es5'],
    });

    const status = info?.error?.status ?? 200;

    res.status(status).json({
      ...info,
      html,
      slots,
    });
  })
);

module.exports = () => ({ router });
