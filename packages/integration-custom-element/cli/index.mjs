import { createAssets } from '@merkur/integration/server';

export default function ({ emitter, EMITTER_EVENTS }) {
  emitter.on(
    EMITTER_EVENTS.MERKUR_CONFIG,
    function removeWidgetHandler({ merkurConfig, cliConfig }) {
      const { staticFolder, protocol, host, staticPath } =
        merkurConfig.widgetServer;

      merkurConfig.playground.widgetHandler = async () => {
        const assets = await createAssets({
          assets: [
            {
              name: 'widget.js',
              type: 'script',
            },
            {
              name: 'widget.css',
              type: 'stylesheet',
            },
          ],
          staticFolder,
          staticBaseUrl: `${protocol}//${host}${staticPath}`,
          merkurConfig,
          cliConfig,
        });

        return {
          assets,
        };
      };

      return merkurConfig;
    },
  );

  emitter.on(EMITTER_EVENTS.CLI_CONFIG, function removeNodeTask({ cliConfig }) {
    cliConfig.runTask = cliConfig.runTask.filter((task) => task !== 'node');
    return cliConfig;
  });

  emitter.on(
    EMITTER_EVENTS.CLI_CONFIG,
    function turnOffWidgetServer({ cliConfig }) {
      cliConfig.hasRunWidgetServer = false;

      return cliConfig;
    },
  );
}
