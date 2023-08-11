import { UserConfig } from 'vite';

export interface MerkurConfig {
  /**
   * Vite plugins passed to dynamic config.
   */
  plugins?: UserConfig['plugins'];
}
