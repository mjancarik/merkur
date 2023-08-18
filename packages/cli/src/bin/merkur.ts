#!/usr/bin/env node
import { Command } from 'commander';
import { dev } from '../commands/dev.js';
import { build } from '../commands/build.js';

const program = new Command();

program.name('merkur');

program.command('dev').action(async () => {
  await dev();
});

program.command('build').action(async () => {
  await build();
});

program.parse(process.argv);
