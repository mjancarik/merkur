import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';

import { createCLIConfig } from '../CLIConfig.mjs';
import { createContext } from '../context.mjs';
import { createLogger } from '../logger.mjs';
import { createMerkurConfig } from '../merkurConfig.mjs';
import { handleExit } from '../handleExit.mjs';

export const CUSTOM_PART = {
  PLAYGROUND_BODY: 'playground:body',
  PLAYGROUND_FOOTER: 'playground:footer',
};

export async function custom({ args, command }) {
  const context = await createContext();
  let baseCliConfig = await createCLIConfig({ args, command });

  const { merkurConfig, cliConfig } = await createMerkurConfig({
    args,
    cliConfig: baseCliConfig,
    context,
  });

  const logger = createLogger('Custom command:', cliConfig);

  await handleExit({ context });

  let file = null;

  switch (args.part) {
    case CUSTOM_PART.PLAYGROUND_BODY: {
      file = 'body.ejs';
      break;
    }
    case CUSTOM_PART.PLAYGROUND_FOOTER: {
      file = 'footer.ejs';
      break;
    }
  }

  if (file) {
    const src = path.resolve(
      `${merkurConfig.playground.templateFolder}/${file}`,
    );
    const dest = path.resolve(
      `${merkurConfig.playground.serverTemplateFolder}/${file}`,
    );
    const dir = path.dirname(dest);

    logger.debug(`Create directory ${dir}`);
    await fs.mkdir(dir, { recursive: true });

    logger.debug(`Copy file from ${src} to ${dest}`);
    await fs.copyFile(src, dest);

    logger.info(`You can customize ${chalk.green(dest)} file.`);
  } else {
    logger.warn(`You define unknown part ${args.part}`);
  }
}
