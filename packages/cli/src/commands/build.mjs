import chalk from 'chalk';

import { createCLIConfig } from '../CLIConfig.mjs';
import { createContext } from '../context.mjs';
import { runTask } from '../runTask.mjs';
import { createMerkurConfig } from '../merkurConfig.mjs';
import { createLogger } from '../logger.mjs';
import { time } from '../utils.mjs';
import { handleExit } from '../handleExit.mjs';
import { clearBuildFolder } from '../clearBuildFolder.mjs';

export async function build({ args, command }) {
  const buildTime = time();

  const context = await createContext();
  const baseCliConfig = await createCLIConfig({ args, command });

  const { merkurConfig, cliConfig } = await createMerkurConfig({
    args,
    cliConfig: baseCliConfig,
    context,
  });
  const logger = createLogger(undefined, cliConfig);

  await handleExit({ context });

  await clearBuildFolder({ merkurConfig, cliConfig });

  const task = await runTask({ merkurConfig, cliConfig, context });

  await Promise.all(Object.values(task));

  logger.log(`Build success ${chalk.green(buildTime())} [ms]`);
}
