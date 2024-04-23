#!/usr/bin/env node
import { Command } from 'commander';
import { dev } from '../src/commands/dev.mjs';
import { build } from '../src/commands/build.mjs';
import { start } from '../src/commands/start.mjs';
import { test } from '../src/commands/test.mjs';
import { COMMAND_NAME } from '../src/commands/constant.mjs';

// eslint-disable-next-line 
import packageFile from '../package.json' with { type: 'json' };

const program = new Command();

program
  .name('merkur')
  .description('CLI for Merkur framework.')
  .option('--writeToDisk', 'Write built files to disk.')
  .option('--runTask [runTask...]', 'Run only defined task.')
  .option('--outFile <string>', 'Server out file configuration in es-build.')
  .option('--port <number>', 'Widget server port.')
  .option('--devServerPort <number>', 'Dev server port.')
  .option('--projectFolder <string>', 'Project folder.')
  .option('--buildFolder <string>', 'Build folder.')
  .option('--staticFolder <string>', 'Static folder.')
  .option('--staticPath <string>', 'The static path for dev server and widget server.')
  .option('--hasRunDevServer', 'Flag for starting dev server')
  .option('--hasRunWidgetServer', 'Flag for starting widget server')
  .option('--inspect', 'Debugging widget server')
  .option('--verbose', 'Verbose mode which show debug information.')
  .version(packageFile.version);

program.command(COMMAND_NAME.DEV).description('Dev command').action(async (options, cmd) => {
  const args = {
    ...{
      writeToDisk: false,
      watch: true,
      runTask: ['node', 'es13'],
      hasRunDevServer: true,
      hasRunWidgetServer: true,
    },
    ...cmd.optsWithGlobals(),
    ...options,
  };
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';

  dev({ args, command: COMMAND_NAME.DEV });
});

program.command(COMMAND_NAME.BUILD).action(async (options, cmd) => {
  const args = {
    ...{ writeToDisk: true, watch: false, forceLegacy: true }, ...cmd.optsWithGlobals(), ...options
  };
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

  await build({ args, command: COMMAND_NAME.BUILD });
});

program.command(COMMAND_NAME.START).action(async (options, cmd) => {
  const args = {
    ...{ watch: false, hasRunWidgetServer: true }, ...cmd.optsWithGlobals(), ...options
  };
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

  await start({ args, command: COMMAND_NAME.START});
});

program.command(COMMAND_NAME.TEST).allowUnknownOption().action(async (options, cmd) => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

  await test({ args: cmd.args, command: COMMAND_NAME.TEST });
});

program.parse(process.argv);
