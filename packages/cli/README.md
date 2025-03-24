<p align="center">
  <a href="https://merkur.js.org/docs/getting-started" title="Getting started">
    <img src="https://raw.githubusercontent.com/mjancarik/merkur/master/images/merkur-illustration.png" width="100px" height="100px" alt="Merkur illustration"/>
  </a>
</p>

# Merkur

[![Build Status](https://github.com/mjancarik/merkur/workflows/CI/badge.svg)](https://github.com/mjancarik/merkur/actions/workflows/ci.yml)
[![NPM package version](https://img.shields.io/npm/v/@merkur/core/latest.svg)](https://www.npmjs.com/package/@merkur/core)
![npm bundle size (scoped version)](https://img.shields.io/bundlephobia/minzip/@merkur/core/latest)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

The [Merkur](https://merkur.js.org/) is tiny extensible javascript library for front-end microservices(micro frontends). It allows by default server side rendering for loading performance boost. You can connect it with other frameworks or languages because merkur defines easy API. You can use one of six predefined template's library [Preact](https://preactjs.com/), [µhtml](https://github.com/WebReflection/uhtml#readme), [Svelte](https://svelte.dev/) and [vanilla](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) but you can easily extend for others.

## Features
 - Flexible templating engine
 - Usable with all tech stacks
 - SSR-ready by default
 - Easy extensible with plugins
 - Tiny - 1 KB minified + gzipped

## Create custom command for @merkur/cli

1. Create new folder `commands` in your package.
2. Create a new file and name it after the command. Eg. `cssVarsGenerator.js`
3. In the file create new command.  
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
4. Update your `rollup.config.mjs` file and make sure your newly created file's going to be build.

## Getting started

```bash
npx @merkur/create-widget <name>

cd name

npm run dev // Point your browser at http://localhost:4444/
```
![alt text](https://raw.githubusercontent.com/mjancarik/merkur/master/images/hello-widget.png "Merkur example, hello widget")
## Documentation

To check out [live demo](https://merkur.js.org/demo) and [docs](https://merkur.js.org/docs), visit [https://merkur.js.org](https://merkur.js.org).

## Contribution

Contribute to this project via [Pull-Requests](https://github.com/mjancarik/merkur/pulls).

We are following [Conventional Commits Specification](https://www.conventionalcommits.org/en/v1.0.0/#summary). To simplify the commit process, you can use `npm run commit` command. It opens an interactive interface, which should help you with commit message composition.

Thank you to all the people who already contributed to Merkur!

<a href="https://github.com/mjancarik/merkur/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=mjancarik/merkur" />
</a>
