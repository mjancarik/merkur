import chalk from 'chalk';

import { createCommandConfig } from '../commandConfig.mjs';
import { runTask } from '../runTask.mjs';
import { createLogger } from '../logger.mjs';
import { time } from '../utils.mjs';
import { handleExit } from '../handleExit.mjs';
import { clearBuildFolder } from '../clearBuildFolder.mjs';

export async function build({ args, command }) {
  const buildTime = time();

  const { context, cliConfig, merkurConfig } = await createCommandConfig({
    args,
    command,
  });

  const logger = createLogger(undefined, cliConfig);

  await handleExit({ context });

  await clearBuildFolder({ merkurConfig, cliConfig });

  const task = await runTask({ merkurConfig, cliConfig, context });

  await Promise.all(Object.values(task));

  logger.log(`Build success ${chalk.green(buildTime())} [ms]`);
}
