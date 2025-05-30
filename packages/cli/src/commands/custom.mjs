import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';

import { createCommandConfig } from '../commandConfig.mjs';
import { createLogger } from '../logger.mjs';
import { handleExit } from '../handleExit.mjs';

export const CUSTOM_PART = {
  PLAYGROUND_BODY: 'playground:body',
  PLAYGROUND_FOOTER: 'playground:footer',
};

export async function custom({ args, command }) {
  const { context, cliConfig, merkurConfig } = await createCommandConfig({
    args,
    command,
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
    const dirFolder = path.dirname(dest);

    logger.debug(`Create directory ${dirFolder}`);
    await fs.mkdir(dirFolder, { recursive: true });

    logger.debug(`Copy file from ${src} to ${dest}`);
    await fs.copyFile(src, dest);

    logger.info(`You can customize ${chalk.green(dest)} file.`);
  } else {
    logger.warn(`You define unknown part ${args.part}`);
  }
}
