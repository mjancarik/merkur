import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { addServerConfig } from './utils.mjs';

import { EMITTER_EVENTS, emitter, RESULT_KEY } from './emitter.mjs';
import { updateCLIConfig } from './CLIConfig.mjs';
import { createLogger } from './logger.mjs';
import { devPlugin } from './plugins/devPlugin.mjs';
import { deepMerge } from './utils.mjs';
import { COMMAND_NAME } from './commands/constant.mjs';

const MERKUR_CONFIG_FILE = 'merkur.config.mjs';

export async function createMerkurConfig({ cliConfig, context, args } = {}) {
  const logger = createLogger('merkurConfig', cliConfig);
  const { projectFolder } = cliConfig;
  let merkurConfig;

  try {
    logger.debug(
      `Load merkur config on path ${path.resolve(`${projectFolder}/${MERKUR_CONFIG_FILE}`)}`,
    );

    const file = await import(
      pathToFileURL(path.resolve(`${projectFolder}/${MERKUR_CONFIG_FILE}`))
    );
    merkurConfig = await file.default({
      cliConfig,
      context,
      emitter,
      EMITTER_EVENTS,
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }

  cliConfig = { ...cliConfig, ...(merkurConfig?.cliConfig ?? {}), ...args };

  await loadExtender({ merkurConfig, cliConfig, logger, context });

  registerHooks({ merkurConfig });

  cliConfig = await updateCLIConfig({ args, cliConfig, context });

  let event = {
    merkurConfig: {
      ...merkurConfig,
    },
    cliConfig,
    context,
    [RESULT_KEY]: 'merkurConfig',
  };

  event = await emitter.emit(EMITTER_EVENTS.MERKUR_CONFIG, event);

  return event;
}

async function loadExtender({ merkurConfig, cliConfig, logger, context }) {
  await Promise.all(
    merkurConfig?.extends?.map(async (modulePath) => {
      try {
        const file = await import(`${modulePath}`);
        const hooks = await file.default({
          cliConfig,
          merkurConfig,
          context,
          emitter,
          EMITTER_EVENTS,
          logger,
        });

        registerHooks({ merkurConfig: hooks ?? {} });
      } catch (error) {
        logger.error(error);
      }
    }) ?? [],
  );
}

function registerHooks({ merkurConfig }) {
  Object.values(EMITTER_EVENTS)
    .filter((eventName) => eventName in merkurConfig)
    .forEach((eventName) => {
      emitter.on(eventName, function autoRegister(event) {
        return merkurConfig[eventName](event);
      });
    });
}

emitter.on(
  EMITTER_EVENTS.MERKUR_CONFIG,
  function defaultTask({ merkurConfig, cliConfig }) {
    const { staticFolder } = cliConfig;

    merkurConfig.task = merkurConfig.task ?? {};

    const defaultTaskDefinition = {
      node: {
        name: 'node',
        build: {
          platform: 'node',
          write: true,
          metafile: false,
        },
      },
      es15: {
        name: 'es15',
        folder: 'es15',
        build: {
          platform: 'browser',
          outdir: path.resolve(`${staticFolder}/es15`),
          plugins: [devPlugin],
        },
      },
      es13: {
        name: 'es13',
        folder: 'es13',
        build: {
          platform: 'browser',
          outdir: path.resolve(`${staticFolder}/es13`),
          target: 'es2022',
        },
      },
      es9: {
        name: 'es9',
        folder: 'es9',
        build: {
          platform: 'browser',
          target: 'es2018',
          outdir: path.resolve(`${staticFolder}/es9`),
        },
      },
    };

    const tasks = [
      ...new Set([
        ...Object.keys(merkurConfig.task ?? {}),
        ...Object.keys(defaultTaskDefinition),
      ]),
    ];

    tasks.forEach((key) => {
      merkurConfig.task[key] = deepMerge(
        defaultTaskDefinition[key] ?? {},
        merkurConfig.task[key] ?? {},
      );
    });

    return merkurConfig;
  },
);

emitter.on(
  EMITTER_EVENTS.MERKUR_CONFIG,
  function devServer({ merkurConfig, cliConfig }) {
    merkurConfig.devServer = {
      ...addServerConfig(
        {},
        {
          protocol: 'http:',
          hostname: 'localhost',
          port: 4445,
        },
      ),
      staticPath: cliConfig.staticPath,
      staticFolder: path.resolve(
        cliConfig.projectFolder,
        cliConfig.staticFolder,
      ),
      ...merkurConfig.devServer,
    };

    return merkurConfig;
  },
);

emitter.on(
  EMITTER_EVENTS.MERKUR_CONFIG,
  function defaultEntries({ merkurConfig, cliConfig }) {
    merkurConfig.defaultEntries = {
      client: [
        path.resolve(`${cliConfig.projectFolder}/src/entries/client.js`),
      ],
      server: [
        path.resolve(`${cliConfig.projectFolder}/src/entries/server.js`),
      ],
      ...merkurConfig.defaultEntries,
    };

    return merkurConfig;
  },
);

emitter.on(
  EMITTER_EVENTS.MERKUR_CONFIG,
  function playground({ merkurConfig, cliConfig }) {
    merkurConfig.playground = {
      template: path.resolve(`${cliConfig.cliFolder}/templates/playground.ejs`),
      // @deprecated Use templateFolders instead.
      templateFolder: path.resolve(`${cliConfig.cliFolder}/templates`),
      // @deprecated Use templateFolders instead.
      serverTemplateFolder: path.resolve(
        `${cliConfig.projectFolder}/server/playground/templates`,
      ),
      /**
       * This new variable will replace the old templateFolders. So we already
       * include all of the default folders in here.
       */
      templateFolders: [
        path.resolve(`${cliConfig.cliFolder}/templates`),
        path.resolve(`${cliConfig.projectFolder}/server/playground/templates`),
      ],
      path: '/',
      widgetHandler: async (req, res, { merkurConfig }) => {
        const { protocol, host } = merkurConfig.widgetServer;
        let widgetProperties = null;
        const params = merkurConfig.playground.widgetParams(req);

        const response = await fetch(
          `${protocol}//${host}/widget${params?.size > 0 ? `?${params}` : ``}`,
        );

        widgetProperties = await response.json();
        if (!response.ok) {
          const error = new Error(widgetProperties?.error?.message);
          error.stack = widgetProperties?.error?.stack;
          error.status = response.status ?? 500;
          throw error;
        }

        return widgetProperties;
      },
      widgetParams: (req) => {
        return new URLSearchParams(req.query);
      },
      ...merkurConfig.playground,
    };

    return merkurConfig;
  },
);

emitter.on(
  EMITTER_EVENTS.MERKUR_CONFIG,
  function socketServer({ merkurConfig }) {
    merkurConfig.socketServer = {
      ...addServerConfig(
        {},
        {
          protocol: 'ws:',
          hostname: 'localhost',
          port: 4321,
        },
      ),
      ...merkurConfig.socketServer,
    };

    return merkurConfig;
  },
);

emitter.on(
  EMITTER_EVENTS.MERKUR_CONFIG,
  function widgetServer({ merkurConfig, cliConfig }) {
    merkurConfig.widgetServer = {
      ...addServerConfig(
        {},
        {
          protocol: 'http:',
          hostname: 'localhost',
          port: 4444,
        },
      ),
      staticPath: cliConfig.staticPath,
      staticFolder: path.resolve(
        cliConfig.projectFolder,
        cliConfig.staticFolder,
      ),
      buildFolder: path.resolve(cliConfig.projectFolder, cliConfig.buildFolder),
      clusters: cliConfig.command === COMMAND_NAME.DEV ? 0 : 3,
      ...merkurConfig.widgetServer,
      cors: {
        options: {
          origin: [
            new RegExp('^https?://localhost(:[0-9]+)?$'),
            new RegExp('^https?://127\\.0\\.0\\.1(:[0-9]+)?$'),
          ],
          methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
          optionsSuccessStatus: 200,
          ...merkurConfig.widgetServer?.cors?.options,
        },
      },
    };

    return merkurConfig;
  },
);

emitter.on(EMITTER_EVENTS.MERKUR_CONFIG, function hmr({ merkurConfig }) {
  merkurConfig.HMR = merkurConfig.HMR ?? true;

  return merkurConfig;
});

emitter.on(EMITTER_EVENTS.MERKUR_CONFIG, function constant({ merkurConfig }) {
  merkurConfig.constant = {
    ...{
      HOST: 'localhost',
    },
    ...merkurConfig.constant,
  };

  return merkurConfig;
});
