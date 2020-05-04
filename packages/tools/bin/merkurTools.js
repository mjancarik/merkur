#!/usr/bin/env node

const livereload = require('../command/livereload');

require('yargs')
  .command(
    'livereload',
    'livereload command',
    (yargs) => {
      return yargs.option('port', {
        alias: 'p',
        describe: 'define livereload port',
      });
    },
    async (argv) => {
      return livereload(argv);
    }
  )
  .help().argv;
