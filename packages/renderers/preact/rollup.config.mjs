import { createRollupTypescriptConfig } from '../../../createRollupConfig.mjs';

let typescriptConfig = createRollupTypescriptConfig({ watchMode: true });

export default [typescriptConfig];
