import path from 'path';
import fs from 'fs';
import { MerkurConfig } from '../types.js';

export const MERKUR_CONF_FILENAME = 'merkur.config';

/**
 * Imports merkur.config.js from given root directory (default to cwd).
 * Returns config (or empty object if it does not exist) with DEFAULTS.
 *
 * @param rootDir App root directory.
 * @returns Config or null in case the config file doesn't exits.
 */
export async function resolveMerkurConfig(
  rootDir = process.cwd(),
): Promise<MerkurConfig> {
  const defaultMerkurConfig: MerkurConfig = {
    plugins: [],
  };

  // The config can have .js|.mjs extension
  const [configFileName] = fs
    .readdirSync(rootDir)
    .filter((file) => file.startsWith(MERKUR_CONF_FILENAME));

  if (!configFileName) {
    return defaultMerkurConfig;
  }

  const merkurConfigPath = path.join(rootDir, configFileName);
  const merkurConfig = (await import(merkurConfigPath)).default;

  return {
    ...defaultMerkurConfig,
    ...merkurConfig,
  };
}
