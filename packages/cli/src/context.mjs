import { emitter, EMITTER_EVENTS, RESULT_KEY } from './emitter.mjs';

export async function createContext() {
  let event = {
    context: {
      task: {},
      memory: {},
      process: {},
      server: {},
    },
    [RESULT_KEY]: 'context',
  };

  event = await emitter.emit(EMITTER_EVENTS.CONTEXT, event);

  return event.context;
}
