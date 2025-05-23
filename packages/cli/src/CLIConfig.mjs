import { EMITTER_EVENTS, emitter, RESULT_KEY } from './emitter.mjs';

export async function createCLIConfig({ args, command } = {}) {
  const environment = process.env.NODE_ENV;
  const isProduction = environment === 'production';

  return {
    environment,
    isProduction,
    command: command ?? 'unknown',
    watch: args?.watch ?? !isProduction,
    writeToDisk: args?.writeToDisk ?? isProduction,
    sourcemap: args?.sourcemap ?? !isProduction,
    outFile: args?.outFile ?? './build/widget.cjs',
    port: args?.port ?? 4444,
    runTasks: args?.runTasks ?? [],
    devServerPort: args?.devServerPort ?? 4445,
    projectFolder: args?.projectFolder ?? process.cwd(),
    cliFolder: import.meta.dirname,
    buildFolder: args?.buildFolder ?? './build',
    staticFolder: args?.staticFolder ?? './build/static',
    staticPath: args?.staticPath ?? '/static',
    hasRunDevServer: args?.hasRunDevServer ?? false,
    hasRunWidgetServer: args?.hasRunWidgetServer ?? false,
    inspect: args.inspect ?? false,
    analyze: args.analyze ?? false,
    verbose: args.verbose ?? false,
  };
}

export async function updateCLIConfig({ cliConfig, context, args }) {
  let event = {
    cliConfig,
    context,
    args,
    [RESULT_KEY]: 'cliConfig',
  };

  event = await emitter.emit(EMITTER_EVENTS.CLI_CONFIG, event);

  return event.cliConfig;
}
