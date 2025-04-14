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

1. Create new folder `commands` in your package.
2. Create a new file in `commands` folder and name it after the command. Eg. `cssVarsGenerator.js`
3. Create new command in the file.  
You can use following template:
```
import chalk from 'chalk';
import path from 'path';
import { flattenObject } from '../src/utils.js';

export default ({ program }) => program
  .command('cssVarsGenerator')
  .description('Generate css variables from layout.js')
  .argument('<layout>', 'layout config')
  .argument('<cssVarPrefix>', 'css var prefix')
  .allowUnknownOption()
  .action(async (layout, cssVarPrefix) => {
    function generateLayoutConfigCssVariables(layoutConfig) {
        const cssVars = [];
        const flatObj = flattenObject(layoutConfig);

        for (const key in flatObj) {
          cssVars.push(`${cssVarPrefix}${key}: ${flatObj[key]};`);
        }

        return cssVars.join('\n');
    }
    const layoutConfig = require(path.resolve(layout));

    console.log('\n\n');
    console.log(chalk.green.bold('CSS Variables:'));
    console.log('-----------------------------------');
    console.log(chalk.blue.bold(generateLayoutConfigCssVariables(layoutConfig)));
});
```
4. Update your `rollup.config.mjs` to ensure the newly created file is included in the build process.

## Custom playground template

At first run `merkur custom playground:body` command which create `body.ejs` file in your project in `/server/playground/templates` folder. Now you can modify playground page as you wish. 
