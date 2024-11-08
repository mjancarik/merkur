import { EMITTER_EVENTS, emitter, RESULT_KEY } from './emitter.mjs';

export async function createTaskConfig({
  cliConfig,
  definition,
  context,
} = {}) {
  let event = {
    config: {
      isServer: definition?.build?.platform === 'node',
      writeToDisk: definition?.build?.write ?? cliConfig.writeToDisk,
      sourcemap: definition?.build?.sourcemap ?? cliConfig.sourcemap,
      analyze: definition?.build?.metafile ?? cliConfig.analyze,
      ...definition.config,
    },
    definition,
    cliConfig,
    context,
    [RESULT_KEY]: 'config',
  };

  event = await emitter.emit(EMITTER_EVENTS.TASK_CONFIG, event);

  return event.config;
}
