import { build as viteBuild } from 'vite';
import { resolveMerkurConfig } from '../utils/parser.js';
import { getBabelOutputPlugin } from '@rollup/plugin-babel';
import path from 'path';

export async function build() {
  const config = await resolveMerkurConfig();

  await viteBuild({
    configFile: false,
    root: process.cwd(),
    ...config,
    build: {
      outDir: 'dist',
      minify: false,
      manifest: true,
      rollupOptions: {
        input: '/src/server.js',
      },
    },
  });
}
