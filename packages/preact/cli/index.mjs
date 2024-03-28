export default function ({ emitter, EMITTER_EVENTS }) {
  emitter.on(
    EMITTER_EVENTS.MERKUR_CONFIG,
    function defaultEntries({ merkurConfig, cliConfig }) {
      merkurConfig.defaultEntries = {
        client: [
          `${cliConfig.projectFolder}/node_modules/@merkur/preact/entries/client.js`,
        ],
        server: [
          `${cliConfig.projectFolder}/node_modules/@merkur/preact/entries/server.js`,
        ],
      };

      return merkurConfig;
    },
  );

  emitter.on(EMITTER_EVENTS.TASK_BUILD, function defaultBuild({ build }) {
    build = {
      ...build,
      jsxImportSource: 'preact',
      jsx: 'automatic',
    };

    return build;
  });
}
