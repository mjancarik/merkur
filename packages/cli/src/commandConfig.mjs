import { createCLIConfig } from './CLIConfig.mjs';
import { createContext } from './context.mjs';
import { createMerkurConfig } from './merkurConfig.mjs';

export async function createCommandConfig({ args, command }) {
  const context = await createContext();
  const baseCliConfig = await createCLIConfig({ args, command });

  const { merkurConfig, cliConfig } = await createMerkurConfig({
    args,
    cliConfig: baseCliConfig,
    context,
  });

  return { context, merkurConfig, cliConfig };
}
