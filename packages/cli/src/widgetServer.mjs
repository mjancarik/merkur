import { spawn } from 'node:child_process';
import process from 'node:process';

import chalk from 'chalk';

import { createLogger } from './logger.mjs';

export async function runWidgetServer({ merkurConfig, cliConfig, context }) {
  const logger = createLogger('widgetServer', cliConfig);
  const { watch, inspect } = cliConfig;
  const { protocol, host } = merkurConfig.widgetServer;

  const args = [`./server/server.js`];

  if (watch) {
    args.unshift(`--watch-path=./server/`);
    args.unshift(`--watch-path=./node_modules/`);
    args.unshift(`--watch-preserve-output`);
    args.unshift('--watch');
  }

  if (inspect) {
    args.unshift('--inspect');
  }

  if (watch) logger.debug('Starting widget server with watch mode.');
  const server = spawn('node', args, {
    env: {
      NODE_CONFIG_DIR: './server/config',
      NODE_WATCH: watch,
      ...process.env,
      MERKUR_CONFIG: JSON.stringify(merkurConfig),
      CLI_CONFIG: JSON.stringify(cliConfig),
    },
    stdio: 'inherit',
  });

  server.on('spawn', () => {
    logger.info(
      `Widget API endpoint: ${chalk.green(`${protocol}//${host}/widget`)}`,
    );
  });

  context.process.widgetServer = server;
}
