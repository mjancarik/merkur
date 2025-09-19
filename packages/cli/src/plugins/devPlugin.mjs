import crypto from 'node:crypto';
import fs from 'node:fs';

import chalk from 'chalk';

import { createClient } from '../websocket.mjs';

import { createLogger } from '../logger.mjs';
import { COMMAND_NAME } from '../commands/constant.mjs';

function getFileHash(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');

  return crypto.createHash('md5').update(fileContent).digest('hex');
}

export function devPlugin({ definition, merkurConfig, cliConfig }) {
  const logger = createLogger('devPlugin', cliConfig);
  const { projectFolder, buildFolder } = cliConfig;
  let memory = {};
  let changed = [];
  let errors = [];

  return {
    name: 'devPlugin',
    setup(build) {
      logger.debug(`Setup plugin for "${chalk.cyan(definition.name)}" task.`);

      if (cliConfig.command !== COMMAND_NAME.DEV) {
        return;
      }

      build.onEnd((result) => {
        errors = result.errors.map((error) => {
          let source = null;

          try {
            source = fs.readFileSync(
              `${projectFolder}/${error.location.file}`,
              'utf-8',
            );
          } catch (_) {} //eslint-disable-line

          return {
            ...error,
            message: error.text,
            source,
            columnNumber: error.location.column,
            fileName: error.location.file,
            lineNumber: error.location.line,
          };
        });

        const outputFiles =
          result?.outputFiles ??
          Object.keys(result?.metafile?.outputs || {}).map((key) => ({
            path: key,
            hash: getFileHash(key),
          }));

        changed =
          outputFiles?.reduce((changed, file) => {
            const name = file.path
              .replace(projectFolder, '')
              .replace(buildFolder, '')
              .split('/')
              .pop();

            const isMapFile = name.endsWith('.map');

            if (
              (!memory[name] || memory[name].hash !== file.hash) &&
              !isMapFile
            ) {
              memory[name] = file;
              changed.push({ name });
            }

            return changed;
          }, []) ?? [];

        const client = createClient({ merkurConfig });
        client.on('error', (error) => {
          logger.error(error);
          client.terminate();
        });

        client.on('open', function open() {
          if (
            merkurConfig.HMR &&
            !(
              cliConfig.writeToDisk &&
              changed.length === 0 &&
              errors.length === 0
            )
          ) {
            client.send(
              JSON.stringify({
                to: 'browser',
                command: 'refresh',
                changed,
                errors,
              }),
            );
            client.terminate();
          } else {
            setTimeout(() => {
              client.send(
                JSON.stringify({
                  to: 'browser',
                  command: 'reload',
                  changed,
                  errors,
                }),
              );
              client.terminate();
            }, 50);
          }
        });
      });
    },
  };
}
