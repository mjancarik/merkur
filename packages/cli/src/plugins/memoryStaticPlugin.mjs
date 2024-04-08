import fs from 'node:fs/promises';
import path from 'node:path';

import chalk from 'chalk';

import { createLogger } from '../logger.mjs';

export function memoryStaticPlugin({ definition, cliConfig, context }) {
  const logger = createLogger('memoryStaticPlugin', cliConfig);
  let manifest = {};
  let manifestHash = '';

  return {
    name: 'memoryStaticPlugin',
    setup(build) {
      const { projectFolder, buildFolder } = cliConfig;
      logger.debug(`Setup plugin for "${chalk.cyan(definition.name)}" task.`);

      build.onEnd(async (result) => {
        if (result.errors.length) {
          return;
        }

        await generateManifest(result);
        await saveGeneratedFileToMemory(result);
      });

      async function generateManifest(result) {
        const pathToOutDir = path.resolve(
          projectFolder,
          definition?.build?.outdir,
        );
        result.outputFiles.map((file) => {
          const key = file.path.replace(pathToOutDir, '').replace('/', '');

          manifest[key] = key;
        });
        let newManifestHash = JSON.stringify(manifest);

        if (newManifestHash !== manifestHash) {
          try {
            await createFolderStructure(pathToOutDir);

            await fs.writeFile(
              `${pathToOutDir}/manifest.json`,
              JSON.stringify(manifest),
            );
            manifestHash = newManifestHash;

            logger.debug(
              `Create manifest for ${definition.name} to ${definition?.build?.outdir} folder.`,
            );
          } catch (error) {
            logger.error(error);
          }
        }
      }

      async function saveGeneratedFileToMemory(result) {
        result.outputFiles.map((file) => {
          const key = file.path.replace(
            path.resolve(projectFolder, buildFolder),
            '',
          );
          const size = Math.round(
            (result?.metafile?.outputs?.[`${path.normalize(buildFolder)}${key}`]
              ?.bytes ?? 0) / 1024,
          );

          logger.debug(`Save file "${key}", size ${size} [kB] to memory.`);
          context.memory[key] = file;
        });
      }
    },
  };
}

async function createFolderStructure(dir) {
  try {
    await fs.access(dir, fs.constants.R_OK);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}
