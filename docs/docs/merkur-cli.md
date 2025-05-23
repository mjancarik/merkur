---
layout: docs
title: Merkur CLI
---

# Merkur CLI

Merkur CLI for building your widget use [esbuild](https://esbuild.github.io/) tool which improve performance of development process and build tasks over [webpack](https://webpack.js.org/). The merkur CLi is configurable with [merkur.config.mjs]({{ '/docs/merkur-config' | relative_url }}) file which is in root of your project.

## Commands

- `merkur dev` - build your widget with with NODE_ENV = 'development' and with watch mode
- `merkur build` - build your widget with NODE_ENV = 'production'
- `merkur test` - run defined widget tests with NODE_ENV = 'test'
- `merkur start` - run widget server and playground server
- `merkur custom` - customize part of template (playground page)

## Adding a custom command into @merkur/cli

You can add your own command to the CLI.  
Simply define your command in your Merkur package as described in the guide below.  
In the code the `program` is instance of [commander](https://www.npmjs.com/package/commander).
You can use [createCommandConfig](https://github.com/mjancarik/merkur/blob/master/packages/cli/src/commandConfig.mjs#L5) method to get merkur/cli config.


1. Create new folder `commands` in your package.
2. Create a new **esm** file in `commands` folder and name it after the command. Eg. `cssVarsGenerator.mjs`
3. Create new command in the file.  
You can use following template:
```
import chalk from 'chalk';
import path from 'path';
import { pathToFileURL } from 'url';
import { flattenObject } from '../lib/index.mjs';

const commandName = 'cssVarsGenerator';

function generateLayoutConfigCssVariables(layoutConfig, cssVarPrefix) {
  const cssVars = [];
  const flatObj = flattenObject(layoutConfig);

  for (const key in flatObj) {
    cssVars.push(`${cssVarPrefix}${key}: ${flatObj[key]};`);
  }

  return cssVars.join('\n');
}

export default ({ program, createCommandConfig }) =>
  program
    .command(commandName)
    .description('Generate css variables from layout.js')
    .argument('<layout>', 'path to layout config')
    .allowUnknownOption()
    .action(async (layout) => {
      const { merkurConfig } = await createCommandConfig({
        args: {},
        command: commandName,
      });
      const layoutConfig = await import(
        pathToFileURL(path.resolve(layout)).href
      );

      console.log('\n\n');
      console.log(chalk.green.bold('CSS Variables:'));
      console.log('-----------------------------------');
      console.log(
        chalk.blue.bold(
          generateLayoutConfigCssVariables(
            layoutConfig,
            merkurConfig.cns.lessVariablePrefix,
          ),
        ),
      );
    });
```
4. Add `!commands/**/*` into `.npmignore` file.

## Custom playground template

At first run `merkur custom playground:body` command which create `body.ejs` file in your project in `/server/playground/templates` folder. Now you can modify playground page as you wish. 
