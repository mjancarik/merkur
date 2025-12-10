import { EMITTER_EVENTS, emitter, RESULT_KEY } from './emitter.mjs';

export async function createCLIConfig({ args, command } = {}) {
  const environment = process.env.NODE_ENV;
  const isProduction = environment === 'production';

  return {
    analyze: args.analyze ?? false,
    buildFolder: args?.buildFolder ?? './build',
    cliFolder: import.meta.dirname,
    command: command ?? 'unknown',
    devServerPort: args?.devServerPort ?? 4445,
    environment,
    hasRunDevServer: args?.hasRunDevServer ?? false,
    hasRunWidgetServer: args?.hasRunWidgetServer ?? false,
    inspect: args.inspect ?? false,
    isProduction,
    outFile: args?.outFile ?? './build/widget.cjs',
    port: args?.port ?? 4444,
    projectFolder: args?.projectFolder ?? process.cwd(),
    runTasks: args?.runTasks ?? [],
    sourcemap: args?.sourcemap ?? !isProduction,
    staticFolder: args?.staticFolder ?? './build/static',
    staticPath: args?.staticPath ?? '/static',
    verbose: args.verbose ?? false,
    watch: args?.watch ?? !isProduction,
    writeToDisk: args?.writeToDisk ?? isProduction,
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
