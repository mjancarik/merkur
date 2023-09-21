import { createRollupTypescriptConfig } from '../../createRollupConfig.mjs';

export default [
  {
    ...createRollupTypescriptConfig({
      input: './src/client.ts',
      dir: './lib/client',
    }),
  },
  {
    ...createRollupTypescriptConfig({
      input: './src/server.ts',
      dir: './lib/server',
    }),
  },
];
