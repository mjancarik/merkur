import { EMITTER_EVENTS, emitter, RESULT_KEY } from './emitter.mjs';

export async function createCLIConfig({ args, context, command } = {}) {
  const environment = process.env.NODE_ENV;
  const isProduction = environment === 'production';

  let event = {
    cliConfig: {
      environment,
      isProduction,
      command: command ?? 'unknown',
      watch: args?.watch ?? !isProduction,
      writeToDisk: args?.writeToDisk ?? isProduction,
      outFile: args?.outFile ?? './build/widget.cjs',
      port: args?.port ?? 4444,
      runTask: args?.runTask ?? [],
      devServerPort: args?.devServerPort ?? 4445,
      projectFolder: args?.projectFolder ?? process.cwd(),
      cliFolder: import.meta.dirname,
      buildFolder: args?.buildFolder ?? './build',
      staticFolder: args?.staticFolder ?? './build/static',
      staticPath: args?.staticPath ?? '/static',
      hasRunDevServer: args?.hasRunDevServer ?? false,
      hasRunWidgetServer: args?.hasRunWidgetServer ?? false,
      inspect: args.inspect ?? false,
      verbose: args.verbose ?? false,
    },
    context,
    args,
    [RESULT_KEY]: 'cliConfig',
  };

  event = await emitter.emit(EMITTER_EVENTS.CLI_CONFIG, event);

  return event.cliConfig;
}
