import { Emitter, RESULT_KEY } from '@esmj/emitter';

const emitter = new Emitter();

const EMITTER_EVENTS = {
  MERKUR_CONFIG: 'onMerkurConfig',
  CLI_CONFIG: 'onCliConfig',
  CLI_CONTEXT: 'onCliContext',
  TASK_CONFIG: 'onTaskConfig',
  TASK_BUILD: 'onTaskBuild',
};

export { emitter, EMITTER_EVENTS, RESULT_KEY };
