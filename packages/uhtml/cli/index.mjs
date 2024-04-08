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
}
