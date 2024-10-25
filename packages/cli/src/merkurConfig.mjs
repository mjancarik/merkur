import path from 'node:path';

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
      path.resolve(`${projectFolder}/${MERKUR_CONFIG_FILE}`)
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

  await registerHooks({ merkurConfig });

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
        await file.default({
          cliConfig,
          merkurConfig,
          context,
          emitter,
          EMITTER_EVENTS,
        });
      } catch (error) {
        logger.error(error);
      }
    }) ?? [],
  );
}

async function registerHooks({ merkurConfig }) {
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
    const { staticFolder, runTasks } = cliConfig;

    merkurConfig.task = merkurConfig.task ?? {};

    const defaultTaskDefinition = {
      node: {
        name: 'node',
        build: {
          platform: 'node',
          write: true,
        },
      },
      es13: {
        name: 'es13',
        folder: 'es13',
        build: {
          platform: 'browser',
          outdir: path.resolve(`${staticFolder}/es13`),
          plugins: [devPlugin],
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

    if (runTasks.length !== 0) {
      Object.keys(merkurConfig.task)
        .filter((taskName) => !runTasks.includes(taskName))
        .forEach((taskKey) => {
          delete merkurConfig.task[taskKey];
        });
    }

    return merkurConfig;
  },
);

emitter.on(
  EMITTER_EVENTS.MERKUR_CONFIG,
  function devServer({ merkurConfig, cliConfig }) {
    merkurConfig.devServer = {
      ...merkurConfig.devServer,
      ...{
        protocol: 'http:',
        host: 'localhost:4445',
        port: 4445,
        staticPath: cliConfig.staticPath,
        staticFolder: path.resolve(
          cliConfig.projectFolder,
          cliConfig.staticFolder,
        ),
      },
    };

    const { origin, host, protocol } = merkurConfig.devServer;

    merkurConfig.devServer.origin =
      origin ?? new URL(`${protocol}//${host}`).origin;

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
      templateFolder: path.resolve(`${cliConfig.cliFolder}/templates`),
      serverTemplateFolder: path.resolve(
        `${cliConfig.projectFolder}/server/playground/templates`,
      ),
      path: '/',
      widgetHandler: async (req) => {
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
      protocol: 'ws:',
      host: 'localhost:4321',
      port: 4321,
      ...merkurConfig.socketServer,
    };

    return merkurConfig;
  },
);

emitter.on(
  EMITTER_EVENTS.MERKUR_CONFIG,
  function widgetServer({ merkurConfig, cliConfig }) {
    merkurConfig.widgetServer = {
      protocol: 'http:',
      host: 'localhost:4444',
      port: 4444,
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
          ...merkurConfig.widgetServer?.cors?.options,
        },
      },
    };

    const { origin, host, protocol } = merkurConfig.widgetServer;

    merkurConfig.widgetServer.origin =
      origin ?? new URL(`${protocol}//${host}`).origin;

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
