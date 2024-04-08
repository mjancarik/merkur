import { fileURLToPath } from 'url';

export default function ({ emitter, EMITTER_EVENTS }) {
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

  // emitter.on(EMITTER_EVENTS.TASK_BUILD, function defaultBuild({ build }) {
  //   build = {
  //     ...build,
  //     jsxImportSource: 'preact',
  //     jsx: 'automatic',
  //   };

  //   return build;
  // });
}
