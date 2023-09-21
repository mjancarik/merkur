#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';

import { execaSync } from 'execa';
import chalk from 'chalk';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const { argv } = yargs(hideBin(process.argv));

if (argv._.length === 0) {
  // eslint-disable-next-line no-console
  console.log(`
Please specify your new project directory:
  ${chalk.blue('@merkur/create-widget')} ${chalk.green('<project-directory>')}
For example:
  ${chalk.blue('@merkur/create-widget')} ${chalk.green('my-widget')}`);

  process.exit(0);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

execaSync(
  'node',
  [path.resolve(__dirname, '../scripts/create.mjs'), ...process.argv.slice(2)],
  {
    stdio: 'inherit',
  },
);
