import fs from 'node:fs/promises';
import path from 'node:path';
import { gzip, constants } from 'node:zlib';
import { promisify } from 'node:util';

import { createLogger } from '../logger.mjs';
import { time } from '../utils.mjs';
import { COMMAND_NAME } from '../commands/constant.mjs';

import chalk from 'chalk';

const gzipAsync = promisify(gzip);

export function metaPlugin({ definition, cliConfig }) {
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

        if (cliConfig.command === COMMAND_NAME.BUILD) {
          const generatedFiles = Object.keys(
            result?.metafile?.outputs ?? {},
          ).filter((file) => !file.endsWith('.map'));

          metaInformation = await Promise.all(
            generatedFiles.map(async (file) => {
              const stat = await fs.stat(
                path.resolve(`${projectFolder}/${file}`),
              );

              const gzipFile = await gzipAsync(await fs.readFile(file), {
                level: constants.Z_BEST_COMPRESSION,
              });

              return { stat, file, gzipFile };
            }),
          );
        }

        logger.log(
          `Task ${chalk.bold.green(definition.name)} complete for ${chalk.bold.green(timer())} [ms]`,
        );

        metaInformation.map(({ file, gzipFile, stat }) => {
          const { dir, base } = path.parse(file);

          logger.log(
            `  ->  ${chalk.gray(dir + '/')}${chalk.green(base)}, ${chalk.grey(`min: ${Math.round(stat.size / 1024)} kB, min+gzip: ${Math.round(gzipFile.length / 1024)} kB`)}`,
          );
        });
      });
    },
  };
}
