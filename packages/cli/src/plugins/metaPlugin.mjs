import fs from 'node:fs/promises';
import path from 'node:path';

import { createLogger } from '../logger.mjs';
import { time } from '../utils.mjs';

import chalk from 'chalk';

export function metaPlugin({ definition, config, cliConfig }) {
  const { projectFolder } = cliConfig;
  const logger = createLogger('metaPlugin', cliConfig);
  return {
    name: 'metaPlugin',
    setup(build) {
      let timer = null;
      logger.debug(`Setup plugin for "${chalk.cyan(definition.name)}" task.`);

      build.onStart(() => {
        timer = time();
      });

      build.onEnd(async (result) => {
        if (result.errors.length) {
          return;
        }
        let metaInformation = [];

        if (config.writeToDisk) {
          const generatedFiles = Object.keys(
            result?.metafile?.outputs ?? {},
          ).filter((file) => !file.endsWith('.map'));

          metaInformation = await Promise.all(
            generatedFiles.map(async (file) => {
              const stat = await fs.stat(
                path.resolve(`${projectFolder}/${file}`),
              );

              return { stat, file };
            }),
          );
        }

        logger.log(
          `Task ${chalk.bold.green(definition.name)} complete for ${chalk.bold.green(timer())} [ms]`,
        );

        metaInformation.map(({ file, stat }) => {
          logger.log(
            `  ->  ${chalk.bold(file)}, ${Math.round(stat.size / 1024)} kB`,
          );
        });
      });
    },
  };
}
