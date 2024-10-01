import { createRollupTypescriptConfig } from '../../createRollupConfig.mjs';

export default [
  {
    ...createRollupTypescriptConfig({
      input: './src/client.ts',
      dir: './lib/client',
      external: ['@merkur/plugin-component/helpers'],
    }),
  },
  {
    ...createRollupTypescriptConfig({
      input: './src/server.ts',
      dir: './lib/server',
      external: ['@merkur/plugin-component/helpers'],
    }),
  },
];
