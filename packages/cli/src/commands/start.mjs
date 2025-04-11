import { createCommandConfig } from '../commandConfig.mjs';
import { runDevServer } from '../devServer.mjs';
import { runWidgetServer } from '../widgetServer.mjs';
import { handleExit } from '../handleExit.mjs';

export async function start({ args, command }) {
  const { context, cliConfig, merkurConfig } = await createCommandConfig({
    args,
    command,
  });

  await handleExit({ context });

  await runDevServer({ merkurConfig, cliConfig, context });
  await runWidgetServer({ merkurConfig, cliConfig, context });
}
