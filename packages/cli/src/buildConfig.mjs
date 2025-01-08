import { readdir } from 'node:fs/promises';
import path from 'node:path';

import manifestPlugin from 'esbuild-plugin-manifest';

import { EMITTER_EVENTS, emitter, RESULT_KEY } from './emitter.mjs';
import { aliasPlugin } from './plugins/aliasPlugin.mjs';
import { memoryStaticPlugin } from './plugins/memoryStaticPlugin.mjs';
import { metaPlugin } from './plugins/metaPlugin.mjs';
import { excludeVendorsFromSourceMapPlugin } from './plugins/excludeVendorsFromSourceMapPlugin.mjs';

export async function createBuildConfig({
  definition,
  config,
  merkurConfig,
  cliConfig,
  context,
}) {
  const { isServer, writeToDisk, sourcemap, analyze } = config;
  const { isProduction, outFile, staticFolder, projectFolder } = cliConfig;

  const entries = await getEntries({ merkurConfig, cliConfig });

  let event = {
    build: {
      entryPoints: isServer ? entries.server : entries.client,
      bundle: true,
      treeShaking: isProduction,
      sourcemap,
      minify: isProduction,
      target: 'es2022',
      write: writeToDisk,
      entryNames: isServer || !isProduction ? 'widget' : 'widget.[hash]',
      format: isServer ? 'cjs' : 'iife',
      metafile: analyze,
      mainFields: isServer ? ['module', 'main'] : ['browser', 'module', 'main'],

      //@TODO map right versions
      //es6 === es2015, es9 === es2018, es11 === es2020 es13 ===es2022
      ...(isServer ? { outfile: outFile } : { outdir: `${staticFolder}/es13` }),
      ...definition.build,

      // Alias
      alias: {
        '@widget': path.resolve(`${projectFolder}/src/widget.js`),
        ...definition.build.alias,
      },

      // Plugins
      plugins: [
        !isServer &&
          manifestPlugin({
            shortNames: true,
            append: true,
            generate: (manifest) => {
              return Object.keys(manifest).reduce((result, originalKey) => {
                const key = originalKey
                  .replace('client', 'widget')
                  .replace('server', 'widget');

                result[key] = manifest[originalKey];

                return result;
              }, {});
            },
          }),
        aliasPlugin,
        !writeToDisk && memoryStaticPlugin,
        sourcemap && excludeVendorsFromSourceMapPlugin,
        metaPlugin,
        ...(definition.build?.plugins ?? []),
      ]
        .map((plugin) => {
          return typeof plugin === 'function'
            ? plugin({ definition, config, merkurConfig, cliConfig, context })
            : plugin;
        })
        .filter(Boolean),
    },
    definition,
    config,
    merkurConfig,
    cliConfig,
    context,
    [RESULT_KEY]: 'build',
  };

  event = await emitter.emit(EMITTER_EVENTS.TASK_BUILD, event);

  return event.build;
}

async function getEntries({ merkurConfig, cliConfig }) {
  const entries = {
    ...merkurConfig.defaultEntries,
  };

  try {
    const files = await readdir(
      path.resolve(`${cliConfig.projectFolder}/src/entries/`),
    );
    const FILENAMES = ['client', 'server'];

    files.forEach((file) => {
      FILENAMES.forEach((filename) => {
        if (file.startsWith(filename)) {
          entries[filename] = [
            path.resolve(`${cliConfig.projectFolder}/src/entries/${file}`),
          ];
        }
      });
    });
  } catch (_) {
    /* empty */
  }

  return entries;
}
