import { createLogger } from '../logger.mjs';

import chalk from 'chalk';

export function aliasPlugin({ definition, cliConfig }) {
  const { projectFolder } = cliConfig;
  const logger = createLogger('aliasPlugin', cliConfig);
  return {
    name: 'aliasPlugin',
    setup(build) {
      logger.debug(`Setup plugin for "${chalk.cyan(definition.name)}" task.`);

      build.onResolve({ filter: /^@\// }, async (args) => {
        const result = await build.resolve(args.path.replace(/^@\//, `./`), {
          kind: 'import-statement',
          resolveDir: `${projectFolder}/src/`,
        });

        if (result.errors.length > 0) {
          return { errors: result.errors };
        }
        return { path: result.path };
      });
    },
  };
}
