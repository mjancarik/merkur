import { argv } from 'node:process';
import * as esbuild from 'esbuild';

(async () => {
  const watch = argv.some((key) => key.includes('--watch'));
  const command = watch ? esbuild.context : esbuild.build;

  const devClient = await command({
    entryPoints: ['./src/devClient/index.mjs'],
    sourcemap: false,
    bundle: true,
    minify: true,
    write: true,
    target: 'es2022',
    outfile: './lib/devClient.mjs',
  });

  if (watch) {
    await devClient.watch();
  }

  const moduleMJS = await command({
    entryPoints: ['./src/index.mjs'],
    sourcemap: false,
    bundle: true,
    minify: true,
    write: true,
    format: 'esm',
    target: 'es2022',
    platform: 'node',
    outfile: './lib/index.mjs',
  });

  if (watch) {
    await moduleMJS.watch();
  }

  const moduleCJS = await command({
    entryPoints: ['./src/index.mjs'],
    sourcemap: false,
    bundle: true,
    minify: true,
    write: true,
    format: 'cjs',
    target: 'es2022',
    platform: 'node',
    outfile: './lib/index.cjs',
  });

  if (watch) {
    await moduleCJS.watch();
  }
})();
