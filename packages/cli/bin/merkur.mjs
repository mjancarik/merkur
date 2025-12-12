#!/usr/bin/env node
import { Command, Option, Argument } from 'commander';
import { dev } from '../src/commands/dev.mjs';
import { build } from '../src/commands/build.mjs';
import { buildPlayground } from '../src/commands/buildPlayground.mjs';
import { start } from '../src/commands/start.mjs';
import { test } from '../src/commands/test.mjs';
import { custom, CUSTOM_PART } from '../src/commands/custom.mjs';
import { COMMAND_NAME } from '../src/commands/constant.mjs';
import { userDefinedCommandsPaths } from '../src/commands/userDefined.mjs';
import { createCommandConfig } from '../src/commandConfig.mjs';

import path from 'node:path';

// eslint-disable-next-line
import packageFile from '../package.json' with { type: 'json' };

const program = new Command();

const analyzeOption = new Option('--analyze', 'Analyze bundle.');
const buildFolderOption = new Option('--buildFolder <string>', 'Build folder.');
const devServerPortOption = new Option('--devServerPort <number>', 'Dev server port.');
const hasRunDevServerOption = new Option('--hasRunDevServer', 'Flag for starting dev server');
const hasRunWidgetServerOption = new Option('--hasRunWidgetServer', 'Flag for starting widget server');
const inspectOption = new Option('--inspect', 'Debugging widget server');
const outputFilesOption = new Option('--outFile <string>', 'Server out file configuration in es-build.');
const portOption = new Option('--port <number>', 'Widget server port.');
const projectFolderOption = new Option('--projectFolder <string>', 'Project folder.');
const quietOption = new Option('--quiet', 'Hide all logs except errors.');
const runTasksOption = new Option('--runTasks [runTasks...]', 'Run only defined tasks.');
const silentOption = new Option('--silent', 'Hide all logs.');
const sourcemapOption = new Option('--sourcemap', 'Generate sourcemap.');
const staticFolderOption = new Option('--staticFolder <string>', 'Static folder.');
const staticPathOption = new Option('--staticPath <string>', 'The static path for dev server and widget server.');
const staticPlaygroundOption = new Option('--staticPlayground <string>', 'Static playground folder.');
const verboseOption = new Option('--verbose', 'Verbose mode which show debug information.');
const writeToDiskOption = new Option('--writeToDisk', 'Write built files to disk.');

program
  .name('merkur')
  .description('CLI for Merkur framework.')
  .version(packageFile.version);

program.command(COMMAND_NAME.DEV)
  .description('Dev command')
  .addOption(buildFolderOption)
  .addOption(devServerPortOption)
  .addOption(hasRunDevServerOption)
  .addOption(hasRunWidgetServerOption)
  .addOption(inspectOption)
  .addOption(outputFilesOption)
  .addOption(portOption)
  .addOption(projectFolderOption)
  .addOption(quietOption)
  .addOption(runTasksOption)
  .addOption(silentOption)
  .addOption(sourcemapOption)
  .addOption(staticFolderOption)
  .addOption(staticPathOption)
  .addOption(verboseOption)
  .addOption(writeToDiskOption)
  .action(async (options, cmd) => {
  const args = {
    ...{
      writeToDisk: false,
      watch: true,
      runTasks: ['node', 'es15'],
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
  .description('Build command')
  .addOption(analyzeOption)
  .addOption(buildFolderOption)
  .addOption(outputFilesOption)
  .addOption(projectFolderOption)
  .addOption(quietOption)
  .addOption(runTasksOption)
  .addOption(silentOption)
  .addOption(sourcemapOption)
  .addOption(staticFolderOption)
  .addOption(verboseOption)
  .addOption(writeToDiskOption)
  .action(async (options, cmd) => {
  const args = {
    ...{ writeToDisk: true, watch: false, forceLegacy: true }, ...cmd.optsWithGlobals(), ...options
  };
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

  await build({ args, command: COMMAND_NAME.BUILD });
});

program
  .command(COMMAND_NAME.BUILD_PLAYGROUND)
  .addOption(buildFolderOption)
  .addOption(hasRunWidgetServerOption)
  .addOption(quietOption)
  .addOption(silentOption)
  .addOption(staticPlaygroundOption)
  .addOption(verboseOption)
  .description('Build a static version of the widget playground')
  .action(async (options, cmd) => {
  const args = {
    ...{ writeToDisk: true, watch: false, hasRunWidgetServer: true, hasRunDevServer: true },
    ...cmd.optsWithGlobals(),
    ...options,
  };
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

  await buildPlayground({ args, command: COMMAND_NAME.BUILD_PLAYGROUND });
});

program
  .command(COMMAND_NAME.START)
  .description('Start widget server')
  .addOption(buildFolderOption)
  .addOption(devServerPortOption)
  .addOption(hasRunDevServerOption)
  .addOption(hasRunWidgetServerOption)
  .addOption(inspectOption)
  .addOption(portOption)
  .addOption(projectFolderOption)
  .addOption(quietOption)
  .addOption(silentOption)
  .addOption(staticFolderOption)
  .addOption(staticPathOption)
  .addOption(verboseOption)
  .action(async (options, cmd) => {
  const args = {
    ...{ watch: false, hasRunWidgetServer: true, hasRunDevServer: true }, ...cmd.optsWithGlobals(), ...options
  };
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'production';

  await start({ args, command: COMMAND_NAME.START});
});

program
  .command(COMMAND_NAME.TEST)
  .description('Test widget')
  .addOption(quietOption)
  .addOption(silentOption)
  .allowUnknownOption()
  .allowExcessArguments()
  .action(async (options, cmd) => {
  process.env.NODE_ENV = process.env.NODE_ENV ?? 'test';

  const args = {
    ...options,
  };

    await test({ args, commandArgs: cmd.args, command: COMMAND_NAME.TEST });
});

program
  .command(COMMAND_NAME.CUSTOM)
  .description('Customize template')
  .addArgument(new Argument('<part>', 'custom part').choices(Object.values(CUSTOM_PART)))
  .addOption(quietOption)
  .addOption(silentOption)
  .addOption(verboseOption)
  .allowUnknownOption()
  .allowExcessArguments()
  .action(async (part, options, cmd) => {
    const args = {
      ...options,
      part,
    };

    await custom({ args, commandArgs: cmd.args, command: COMMAND_NAME.CUSTOM });
  });

// Load user-defined commands
let userDefinedCommands = [];
for (const { command, dir } of userDefinedCommandsPaths) {
  const programCustom = new Command();
  let commandName = '';

  try {
    const commandModule = await import(path.join(dir, command));
    commandName = commandModule.default(({ program: programCustom, createCommandConfig })).name();
  } catch (error) {
    console.error(`Error loading command from ${dir}/${command} package:`, error);
    continue;
  }

  if (userDefinedCommands.includes(commandName)) {
    console.warn(`Command "${commandName}" from ${dir} package cannot be used.\nCommand with the same name already exists.`);
    continue;
  }

  userDefinedCommands.push(commandName);
  programCustom.commands.forEach(cmd => {
    program.addCommand(cmd);
  });
};

program.parse(process.argv);
