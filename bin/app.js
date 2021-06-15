#! /usr/bin/env node

const { Command } = require('commander')
const program = new Command()

program
  .version('1.1.0')
  .command('run', 'run a monitor process immediately', { executableFile: 'run' }).alias('r')
  .command('config', 'config',{ executableFile: 'config' }).alias('c')

program.parse(process.argv)
