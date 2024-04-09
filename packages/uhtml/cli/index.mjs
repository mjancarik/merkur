import { fileURLToPath } from 'node:url';

export default function ({ emitter, EMITTER_EVENTS }) {
  emitter.on(
    EMITTER_EVENTS.MERKUR_CONFIG,
    function defaultEntries({ merkurConfig }) {
      merkurConfig.defaultEntries = {
        client: [
          fileURLToPath(import.meta.resolve('@merkur/uhtml/entries/client.js')),
        ],
        server: [
          fileURLToPath(import.meta.resolve('@merkur/uhtml/entries/server.js')),
        ],
      };

      return merkurConfig;
    },
  );

  emitter.on(
    EMITTER_EVENTS.TASK_BUILD,
    function defaultBuild({ build, config }) {
      build = {
        ...build,
        external: config.isServer
          ? [...(build.external ?? []), 'ucontent']
          : build.external,
      };

      return build;
    },
  );
}
