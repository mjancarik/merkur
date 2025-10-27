import fs from 'node:fs';

import { createLogger } from '@merkur/cli';
import { createAssets } from '@merkur/integration/server';

export function merkurCustomElementCssBundlePlugin({ cliConfig, config }) {
  const { projectFolder } = cliConfig;
  const { writeToDisk } = config;
  const logger = createLogger('merkurCustomElementCssBundlePlugin', cliConfig);

  return {
    name: 'merkurCustomElementCssBundlePlugin',
    setup(build) {
      build.onResolve(
        { filter: /@merkur\/integration-custom-element\/cssBundle/ },
        (args) => {
          return {
            path: args.path,
            namespace: 'merkur-custom-element-css-bundle',
          };
        },
      );

      build.onLoad(
        {
          filter: /@merkur\/integration-custom-element\/cssBundle/,
          namespace: 'merkur-custom-element-css-bundle',
        },
        async () => {
          return {
            contents: 'var STYLE={__bundle__:""}; export default STYLE;',
          };
        },
      );

      build.onEnd((result) => {
        if (!writeToDisk) {
          logger.debug('merkurCustomElementCssBundlePlugin is disabled');
        }

        Object.keys(result?.metafile?.outputs ?? {}).map((key) => {
          const value = result.metafile.outputs[key];

          if ('cssBundle' in value) {
            try {
              let css = fs.readFileSync(`${projectFolder}/${value.cssBundle}`, {
                encoding: 'utf8',
                flag: 'r',
              });
              css = JSON.stringify(css.replace(/\n/g, ' '));

              let js = fs.readFileSync(`${projectFolder}/${key}`, {
                encoding: 'utf8',
                flag: 'r',
              });

              js = js.replace('{__bundle__:""}', `${css}`);
              js = js.replace('{ __bundle__: "" };', `${css}`);

              fs.writeFileSync(`${projectFolder}/${key}`, js);
            } catch (error) {
              logger.error(error);
            }
          }
        });
      });
    },
  };
}

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

  emitter.on(
    EMITTER_EVENTS.MERKUR_CONFIG,
    function turnOffHMR({ merkurConfig }) {
      merkurConfig.HMR = false;

      return merkurConfig;
    },
  );

  emitter.on(EMITTER_EVENTS.CLI_CONFIG, function removeNodeTask({ cliConfig }) {
    if (cliConfig.runTasks.length === 0) {
      cliConfig.runTasks = ['es15', 'es9'];
    }

    cliConfig.runTasks = cliConfig.runTasks.filter((task) => task !== 'node');
    return cliConfig;
  });

  emitter.on(
    EMITTER_EVENTS.CLI_CONFIG,
    function turnOffWidgetServer({ cliConfig }) {
      cliConfig.hasRunWidgetServer = false;

      return cliConfig;
    },
  );

  emitter.on(
    EMITTER_EVENTS.CLI_CONFIG,
    function forceWriteToDisk({ cliConfig }) {
      cliConfig.writeToDisk = true;

      return cliConfig;
    },
  );

  emitter.on(
    EMITTER_EVENTS.TASK_BUILD,
    function registerCustomElementPlugin(event) {
      const { build } = event;
      build.plugins.push(merkurCustomElementCssBundlePlugin(event));

      return build;
    },
  );
}
