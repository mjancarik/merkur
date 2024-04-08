import { createCLIConfig } from '../CLIConfig.mjs';
import { createContext } from '../context.mjs';
import { runDevServer } from '../devServer.mjs';
import { createMerkurConfig } from '../merkurConfig.mjs';
import { runWidgetServer } from '../widgetServer.mjs';
import { handleExit } from '../handleExit.mjs';

export async function start({ args, command }) {
  const context = await createContext();
  let baseCliConfig = await createCLIConfig({ args, context, command });

  const { merkurConfig, cliConfig } = await createMerkurConfig({
    cliConfig: baseCliConfig,
    context,
  });

  await handleExit({ context });

  await runDevServer({ merkurConfig, cliConfig, context });
  await runWidgetServer({ merkurConfig, cliConfig, context });
}
