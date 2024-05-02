import chalk from 'chalk';

import { createBuildConfig } from '../buildConfig.mjs';
import { createCLIConfig } from '../CLIConfig.mjs';
import { createContext } from '../context.mjs';
import { createTaskConfig } from '../taskConfig.mjs';
import { runTask } from '../runTask.mjs';
import { createMerkurConfig } from '../merkurConfig.mjs';
import { createLogger } from '../logger.mjs';
import { time } from '../utils.mjs';
import { handleExit } from '../handleExit.mjs';

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

  const task = await Object.keys(merkurConfig.task).reduce(
    async (result, key) => {
      const definition = merkurConfig.task[key];

      const config = await createTaskConfig({
        definition,
        merkurConfig,
        cliConfig,
        context,
      });
      const build = await createBuildConfig({
        definition,
        config,
        merkurConfig,
        cliConfig,
        context,
      });
      result[definition.name] = await runTask({
        definition,
        build,
        merkurConfig,
        cliConfig,
        config,
        context,
      });

      return result;
    },
    context.task,
  );

  await Promise.all(Object.values(task));

  logger.log(`Build success ${chalk.green(buildTime())} [ms]`);
}
