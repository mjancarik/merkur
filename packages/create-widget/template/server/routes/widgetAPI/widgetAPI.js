const config = require('config');
const express = require('express');

const { resolveConfig } = require('@merkur/cli/server');
const {
  asyncMiddleware,
  createAssets,
  memo,
  requireUncached,
} = require('@merkur/integration/server');
const memoCreateAssets = memo(createAssets);

const { merkurConfig, cliConfig } = resolveConfig();
const { staticFolder, buildFolder, protocol, host, staticPath } =
  merkurConfig.widgetServer;

const widgetEnvironment = config.get('widget');

const router = express.Router();
router.get(
  '/widget',
  asyncMiddleware(async (req, res) => {
    const merkurModule = requireUncached(`${buildFolder}/widget.cjs`);
    const widget = await merkurModule.createWidget({
      props: {
        name: req.query.name,
        environment: widgetEnvironment,
      },
    });

    const { html, slot = {} } = await widget.mount();
    const info = await widget.info();

    info.assets = await memoCreateAssets({
      assets: info.assets,
      staticFolder,
      staticBaseUrl: `${protocol}//${host}${staticPath}`,
      merkurConfig,
      cliConfig,
    });

    const status = info?.error?.status ?? 200;

    res.status(status).json({
      ...info,
      html,
      slot,
    });
  }),
);

module.exports = () => ({ router });
