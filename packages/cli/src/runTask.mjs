import fs from 'node:fs/promises';

import esbuild from 'esbuild';
import { createLogger } from './logger.mjs';

export async function runTask({ cliConfig, build, config }) {
  const logger = createLogger(undefined, cliConfig);
  const { watch } = cliConfig;

  //es6 === es2015, es9 === es2018, es11 === es2020 es13 ===es2022
  try {
    const result = await (watch
      ? esbuild.context(build)
      : esbuild.build(build));

    if (config.analyze && result.metafile) {
      logger.log(
        await esbuild.analyzeMetafile(result.metafile, {
          verbose: cliConfig.verbose,
        }),
      );

      if (build.outdir) {
        await fs.writeFile(
          `${build.outdir}/${build.entryNames ?? config.name}.meta.json`,
          JSON.stringify(result.metafile),
        );
      }
    }

    if (watch) {
      await result.watch();
    }

    return result;
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}
