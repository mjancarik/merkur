import { spawn } from 'node:child_process';
import process from 'node:process';

import { npmRunPath } from 'npm-run-path';

import { createCLIConfig } from '../CLIConfig.mjs';
import { createContext } from '../context.mjs';
import { createLogger } from '../logger.mjs';
import { createMerkurConfig } from '../merkurConfig.mjs';
import { handleExit } from '../handleExit.mjs';

export async function test({ args, command }) {
  const context = await createContext();
  let baseCliConfig = await createCLIConfig({ args, command });

  const { merkurConfig, cliConfig } = await createMerkurConfig({
    args,
    cliConfig: baseCliConfig,
    context,
  });
  const logger = createLogger('testRunner', cliConfig);

  await handleExit({ context });

  args.unshift('./jest.config.js');
  args.unshift('-c');

  const runner = spawn('jest', args, {
    env: {
      ...process.env,
      PATH: npmRunPath(),
      NODE_CONFIG_DIR: './server/config',
      MERKUR_CONFIG: JSON.stringify(merkurConfig),
      CLI_CONFIG: JSON.stringify(cliConfig),
    },
    stdio: 'inherit',
  });

  runner.on('spawn', () => {
    logger.debug(`Run test runner ${args.join(', ')}`);
  });
  runner.on('exit', (code, signal) => {
    logger.info(`child process exited with code ${code} and signal ${signal}`);
    process.exit(code);
  });
}
