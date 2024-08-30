#!/usr/bin/env node
import { Command, Option } from 'commander';
import { dev } from '../src/commands/dev.mjs';
import { build } from '../src/commands/build.mjs';
import { start } from '../src/commands/start.mjs';
import { test } from '../src/commands/test.mjs';
import { COMMAND_NAME } from '../src/commands/constant.mjs';

// eslint-disable-next-line 
import packageFile from '../package.json' with { type: 'json' };

const program = new Command();

const writeToDiskOption = new Option('--writeToDisk', 'Write built files to disk.');
const sourcemapOption = new Option('--sourcemap', 'Generate sourcemap.');
const runTasksOption = new Option('--runTasks [runTasks...]', 'Run only defined tasks.');
const outputFilesOption = new Option('--outFile <string>', 'Server out file configuration in es-build.');
const portOption = new Option('--port <number>', 'Widget server port.');
const devServerPortOption = new Option('--devServerPort <number>', 'Dev server port.');
const projectFolderOption = new Option('--projectFolder <string>', 'Project folder.');
const buildFolderOption = new Option('--buildFolder <string>', 'Build folder.')
const staticFolderOption = new Option('--staticFolder <string>', 'Static folder.');
const staticPathOption = new Option('--staticPath <string>', 'The static path for dev server and widget server.');
const hasRunDevServerOption = new Option('--hasRunDevServer', 'Flag for starting dev server');
const hasRunWidgetServerOption = new Option('--hasRunWidgetServer', 'Flag for starting widget server');
const inspectOption = new Option('--inspect', 'Debugging widget server');
const verboseOption = new Option('--verbose', 'Verbose mode which show debug information.');

program
  .name('merkur')
  .description('CLI for Merkur framework.')
  // .option('--writeToDisk', 'Write built files to disk.')
  // .option('--sourcemap', 'Generate sourcemap.')
  // .option('--runTasks [runTasks...]', 'Run only defined tasks.')
  // .option('--outFile <string>', 'Server out file configuration in es-build.')
  // .option('--port <number>', 'Widget server port.')
  // .option('--devServerPort <number>', 'Dev server port.')
  // .option('--projectFolder <string>', 'Project folder.')
  // .option('--buildFolder <string>', 'Build folder.')
  // .option('--staticFolder <string>', 'Static folder.')
  // .option('--staticPath <string>', 'The static path for dev server and widget server.')
  // .option('--hasRunDevServer', 'Flag for starting dev server')
  // .option('--hasRunWidgetServer', 'Flag for starting widget server')
  // .option('--inspect', 'Debugging widget server')
  // .option('--verbose', 'Verbose mode which show debug information.')
  .version(packageFile.version);

program.command(COMMAND_NAME.DEV)
  .description('Dev command')
  .addOption(writeToDiskOption)
  .addOption(sourcemapOption)
  .addOption(runTasksOption)
  .addOption(outputFilesOption)
  .addOption(portOption)
  .addOption(devServerPortOption)
  .addOption(projectFolderOption)
  .addOption(buildFolderOption)
  .addOption(staticFolderOption)
  .addOption(staticPathOption)
  .addOption(hasRunDevServerOption)
  .addOption(hasRunWidgetServerOption)
  .addOption(inspectOption)
  .addOption(verboseOption)
  .action(async (options, cmd) => {
  const args = {
    ...{
      writeToDisk: false,
      watch: true,
      runTasks: ['node', 'es13'],
      hasRunDevServer: true,
      hasRunWidgetServer: true,
    },
    ...cmd.optsWithGlobals(),
    ...options,
  };
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'development';

  dev({ args, command: COMMAND_NAME.DEV });
});

program
  .command(COMMAND_NAME.BUILD)
  .addOption(writeToDiskOption)
  .addOption(sourcemapOption)
  .addOption(runTasksOption)
  .addOption(outputFilesOption)
  .addOption(projectFolderOption)
  .addOption(buildFolderOption)
  .addOption(staticFolderOption)
  .addOption(verboseOption)
  .action(async (options, cmd) => {
  const args = {
    ...{ writeToDisk: true, watch: false, forceLegacy: true }, ...cmd.optsWithGlobals(), ...options
  };
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

  await build({ args, command: COMMAND_NAME.BUILD });
});

program
  .command(COMMAND_NAME.START)
  .addOption(portOption)
  .addOption(devServerPortOption)
  .addOption(projectFolderOption)
  .addOption(buildFolderOption)
  .addOption(staticFolderOption)
  .addOption(staticPathOption)
  .addOption(hasRunDevServerOption)
  .addOption(hasRunWidgetServerOption)
  .addOption(inspectOption)
  .addOption(verboseOption)
  .action(async (options, cmd) => {
  const args = {
    ...{ watch: false, hasRunWidgetServer: true }, ...cmd.optsWithGlobals(), ...options
  };
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

  await start({ args, command: COMMAND_NAME.START});
});

program
  .command(COMMAND_NAME.TEST)
  .allowUnknownOption()
  .action(async (options, cmd) => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

  const args = {
    ...options,
  };

    await test({ args, commandArgs: cmd.args, command: COMMAND_NAME.TEST });
});

program.parse(process.argv);
