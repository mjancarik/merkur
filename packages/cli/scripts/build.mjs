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
    platform: 'browser',
    outfile: './lib/devClient.mjs',
  });

  if (watch) {
    await devClient.watch();
  }

  // server
  const serverMJR = await command({
    entryPoints: ['./src/server.mjs'],
    sourcemap: false,
    bundle: true,
    minify: true,
    write: true,
    format: 'esm',
    target: 'es2022',
    platform: 'node',
    outfile: './lib/server.mjs',
  });

  if (watch) {
    await serverMJR.watch();
  }

  const serverCJS = await command({
    entryPoints: ['./src/server.mjs'],
    sourcemap: false,
    bundle: true,
    minify: true,
    write: true,
    format: 'cjs',
    target: 'es2022',
    platform: 'node',
    outfile: './lib/server.cjs',
  });

  if (watch) {
    await serverCJS.watch();
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
