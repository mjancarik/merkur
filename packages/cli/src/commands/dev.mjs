import { createBuildConfig } from '../buildConfig.mjs';
import { createCLIConfig } from '../CLIConfig.mjs';
import { createContext } from '../context.mjs';
import { runDevServer } from '../devServer.mjs';
import { createTaskConfig } from '../taskConfig.mjs';
import { runTask } from '../runTask.mjs';
import { createMerkurConfig } from '../merkurConfig.mjs';
import { runSocketServer } from '../websocket.mjs';
import { runWidgetServer } from '../widgetServer.mjs';
import { handleExit } from '../handleExit.mjs';

export async function dev({ args, command }) {
  const context = await createContext();
  const baseCliConfig = await createCLIConfig({ args, context, command });

  const { merkurConfig, cliConfig } = await createMerkurConfig({
    cliConfig: baseCliConfig,
    context,
  });

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

  await runDevServer({ merkurConfig, cliConfig, context });
  await runSocketServer({ merkurConfig, cliConfig, context });
  await runWidgetServer({ merkurConfig, cliConfig, context });
}