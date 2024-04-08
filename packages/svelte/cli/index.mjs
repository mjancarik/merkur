import { fileURLToPath } from 'node:url';

//import sveltePlugin from 'esbuild-svelte';

export default function ({ emitter, EMITTER_EVENTS, cliConfig }) {
  emitter.on(
    EMITTER_EVENTS.MERKUR_CONFIG,
    function defaultEntries({ merkurConfig }) {
      merkurConfig.defaultEntries = {
        client: [
          fileURLToPath(
            import.meta.resolve('@merkur/svelte/entries/client.js'),
          ),
        ],
        server: [
          fileURLToPath(
            import.meta.resolve('@merkur/svelte/entries/server.js'),
          ),
        ],
      };

      return merkurConfig;
    },
  );

  // emitter.on(
  //   EMITTER_EVENTS.TASK_BUILD,
  //   function defaultBuild({ build, config }) {
  //     build = {
  //       ...build,
  //       mainFields: ['svelte', 'browser', 'module', 'main'],
  //       conditions: ['svelte', 'browser'],
  //       plugins: [
  //         ...build.plugins,
  //         sveltePlugin({
  //           compilerOptions: {
  //             dev: cliConfig.watch,
  //             generate: config.isServer ? 'ssr' : 'dom',
  //             hydratable: true,
  //             css: !config.isServer,
  //           },
  //           cache: cliConfig.watch,
  //         }),
  //       ],
  //     };

  //     return build;
  //   },
  // );
}
