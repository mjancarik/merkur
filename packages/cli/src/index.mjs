import process from 'node:process';

import { createClient } from './websocket.mjs';

let cliConfig, merkurConfig;

export function resolveConfig() {
  if (process.env.CLI_CONFIG && !cliConfig) {
    cliConfig = JSON.parse(process.env.CLI_CONFIG);
  }

  if (process.env.MERKUR_CONFIG && !merkurConfig) {
    merkurConfig = JSON.parse(process.env.MERKUR_CONFIG);
  }

  return {
    merkurConfig,
    cliConfig,
  };
}

export function autoReload({ merkurConfig, cliConfig }) {
  function reload() {
    const client = createClient({ merkurConfig });
    client.on('error', (error) => {
      console.error(error);
      client.terminate();
    });

    client.on('open', function open() {
      setTimeout(() => {
        client.send(
          JSON.stringify({
            to: 'browser',
            command: 'reload',
            changed: [],
            errors: [],
          }),
        );
        client.terminate();
      }, 50);
    });
  }

  if (cliConfig.watch) {
    reload();

    const handleExit = () => process.exit(0);
    process.on('SIGINT', handleExit);
    process.on('SIGQUIT', handleExit);
    process.on('SIGTERM', handleExit);

    // TODO improve for error-overlay
    process.on('uncaughtException', () => {
      reload();
    });

    process.on('unhandledRejection', () => {
      reload();
    });
  }
}
