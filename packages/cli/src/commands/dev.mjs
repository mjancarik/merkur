import { createCommandConfig } from '../commandConfig.mjs';
import { runDevServer } from '../devServer.mjs';
import { runTask } from '../runTask.mjs';
import { runSocketServer } from '../websocket.mjs';
import { runWidgetServer } from '../widgetServer.mjs';
import { handleExit } from '../handleExit.mjs';
import { clearBuildFolder } from '../clearBuildFolder.mjs';

export async function dev({ args, command }) {
  const { context, cliConfig, merkurConfig } = await createCommandConfig({
    args,
    command,
  });

  await handleExit({ context });

  await clearBuildFolder({ merkurConfig, cliConfig });

  const task = await runTask({ merkurConfig, cliConfig, context });

  await Promise.all(Object.values(task));

  cliConfig.hasRunDevServer &&
    (await runDevServer({ merkurConfig, cliConfig, context }));
  await runSocketServer({ merkurConfig, cliConfig, context });
  cliConfig.hasRunWidgetServer &&
    (await runWidgetServer({ merkurConfig, cliConfig, context }));
}
