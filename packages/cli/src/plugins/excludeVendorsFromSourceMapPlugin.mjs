import fs from 'node:fs/promises';

import { createLogger } from '../logger.mjs';

export function excludeVendorsFromSourceMapPlugin({ cliConfig }) {
  const logger = createLogger('excludeVendorsFromSourceMapPlugin', cliConfig);

  return {
    name: 'excludeVendorsFromSourceMapPlugin',
    setup(build) {
      build.onLoad({ filter: /node_modules/ }, async (args) => {
        const contents = await fs.readFile(args.path, { encoding: 'utf8' });

        return {
          contents: contents 
          + '\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIiJdLCJtYXBwaW5ncyI6IkEifQ==',
          loader: 'default',
        }
      })
    },
  };
}
