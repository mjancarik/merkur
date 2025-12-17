import { createCommandConfig } from '../commandConfig.mjs';
import { runDevServer } from '../devServer.mjs';
import { runTask } from '../runTask.mjs';
import { runSocketServer } from '../websocket.mjs';
import { runWidgetServer } from '../widgetServer.mjs';
import { handleExit, killProcesses } from '../handleExit.mjs';
import { clearFolder, clearBuildFolder } from '../clearBuildFolder.mjs';
import { time } from '../utils.mjs';
import path from 'node:path';
import chalk from 'chalk';
import fs from 'node:fs/promises';
import process from 'node:process';
import { createLogger } from '../logger.mjs';

function createServerTimer({ logger, cliConfig }) {
  return function waitForServerReady(url, timeout = 10000, interval = 500) {
    return new Promise((resolve, reject) => {
      if (!url) {
        reject('URL is required.');
      }

      let fetchError;
      const runTime = time();
      logger.log(`Waiting for server at ${chalk.yellow(url)} to be ready...`);

      const intervalId = setInterval(async () => {
        const elapsed = runTime();
        if (elapsed > timeout) {
          clearInterval(intervalId);
          const failureReason =
            fetchError || '(unknown, possibly fetch timeout)';
          reject(
            `Timeout waiting for server at ${url}. Last fetch error: ${failureReason}`,
          );
          return;
        }

        try {
          const response = await fetch(url);
          if (response.ok) {
            clearInterval(intervalId);
            resolve(true);
          }

          fetchError = cliConfig.verbose
            ? await response.text()
            : `${response.status} ${response.statusText}`;
        } catch (err) {
          fetchError = toString(err);
        }
      }, interval);
    });
  };
}

export async function buildPlayground({ args, command }) {
  const { context, cliConfig, merkurConfig } = await createCommandConfig({
    args,
    command,
  });
  const logger = createLogger(null, cliConfig);
  const waitForServerReady = createServerTimer({ logger, cliConfig });

  const { staticPlayground, staticFolder } = cliConfig;

  const childProcessCliConfig = { ...cliConfig, silent: !cliConfig.verbose };

  // TODO maybe skip building tasks, to be used in CI where there's a separate build step?

  await clearFolder(cliConfig.staticPlayground);
  await clearBuildFolder({ merkurConfig, cliConfig: childProcessCliConfig });

  logger.info(`Running build tasks`);
  const task = await runTask({
    merkurConfig,
    cliConfig: childProcessCliConfig,
    context,
  });
  await Promise.all(Object.values(task));

  await handleExit({ context });

  const {
    devServer: { origin: devServerOrigin },
    playground,
    widgetServer: { origin: widgetServerOrigin },
  } = merkurConfig;

  logger.info(`Starting servers`);

  if (cliConfig.hasRunWidgetServer) {
    await runWidgetServer({
      merkurConfig,
      cliConfig: childProcessCliConfig,
      context,
    });

    const widgetServerUrl = path.join(widgetServerOrigin, '/widget');

    try {
      await waitForServerReady(widgetServerUrl);
    } catch (err) {
      logger.error(chalk.red.bold(`x Widget server failed to start:`));
      logger.error(chalk.red(err));
      killProcesses({ context });
      process.exit(1);
    }
  }

  await Promise.all([
    runDevServer({ merkurConfig, cliConfig: childProcessCliConfig, context }),
    runSocketServer({
      merkurConfig,
      cliConfig: childProcessCliConfig,
      context,
    }),
  ]);

  try {
    await waitForServerReady(devServerOrigin);
  } catch (err) {
    logger.error(chalk.red.bold('x Dev server failed to start:'));
    logger.error(chalk.red(err));
    killProcesses({ context });
    process.exit(1);
  }

  let playgroundPath;

  if (typeof playground?.path === 'string') {
    playgroundPath = playground.path;
  } else if (cliConfig.playgroundPath) {
    playgroundPath = cliConfig.playgroundPath;
  } else {
    const isRegeExp = playground?.path?.constructor?.name === 'RegExp';
    logger.warn(
      `Static build requires a string playground path, but your path is ${isRegeExp ? 'a RegExp' : 'undefined'}. Using '/' as fallback; you can set the path through the --playgroundPath CLI option.`,
    );
    playgroundPath = '/';
  }

  const playgroundUrl = path.join(devServerOrigin, playgroundPath);

  logger.info(`Building playground`);

  try {
    const response = await fetch(playgroundUrl);
    if (!response.ok) {
      if (cliConfig.verbose) {
        console.log(response); // eslint-disable-line no-console -- Debug log with maintained build-in code highlighting.
      }
      throw new Error(
        `Failed to fetch playground (${response.status} ${response.statusText}).`,
      );
    }

    let playgroundHtml = await response.text();

    playgroundHtml = playgroundHtml.replaceAll(devServerOrigin, '.');
    playgroundHtml = playgroundHtml.replaceAll(widgetServerOrigin, `.`);

    const absStaticFolderPath = path.resolve(process.cwd(), staticFolder);
    const playgroundFolderPath = path.resolve(process.cwd(), staticPlayground);

    await fs.mkdir(playgroundFolderPath, { recursive: true });
    await Promise.all([
      fs.writeFile(
        path.join(playgroundFolderPath, 'index.html'),
        playgroundHtml,
      ),
      fs.cp(absStaticFolderPath, path.join(playgroundFolderPath, 'static'), {
        recursive: true,
      }),
    ]);

    logger.log(
      chalk.green.bold('Playground built successfully in: ') +
        chalk.green(playgroundFolderPath),
    );
    killProcesses({ context });
    process.exit(0);
  } catch (err) {
    logger.error(chalk.red.bold('x Failed to build static playground:'));
    logger.error(chalk.red(err));
    killProcesses({ context });
    process.exit(1);
  }
}
