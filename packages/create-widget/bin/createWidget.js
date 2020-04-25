#!/usr/bin/env node

const path = require('path');
const execa = require('execa');
const chalk = require('chalk');
const argv = require('yargs').argv;

if (argv._.length === 0) {
  // eslint-disable-next-line no-console
  console.log(`
Please specify your new project directory: 
  ${chalk.blue('@merkur/create-widget')} ${chalk.green('<project-directory>')}
For example:
  ${chalk.blue('@merkur/create-widget')} ${chalk.green('my-widget')}`);

  process.exit(0);
}

execa.sync(
  'node',
  [path.resolve(__dirname, '../scripts/create.js'), ...process.argv.slice(2)],
  {
    stdio: 'inherit',
  }
);
