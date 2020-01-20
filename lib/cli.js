#!/usr/bin/env node
const updateNotifier = require('update-notifier');
const pkg = require('../package.json');
const { make, newProject, add, remove } = require('.');
const chalk = require('chalk');

const yargs = require('yargs');

updateNotifier({ pkg }).notify();

console.log(chalk`\n{blue bluprint} {yellow v${pkg.version}}\n`);

yargs // eslint-disable-line no-unused-expressions
  .help()
  .scriptName('bluprint')
  .command('new [bluprint]', 'Creates a new project from a bluprint', (yargs) => {
    yargs
      .positional('bluprint', {
        describe: 'The bluprint to use',
        type: 'string',
      });
  }, async function({ bluprint }) {
    await newProject(bluprint);
  })
  .command('add [path]', 'Adds a new bluprint to your CLI', (yargs) => {
    yargs
      .positional('path', {
        describe: 'The GitHub repo hosting the bluprint: user/repo, https://, or git@github.com.',
        type: 'string',
      });
  }, async function({ path }) {
    await add(path);
  })
  .command('remove [bluprint]', 'Removes a bluprint from your CLI', (yargs) => {
    yargs
      .positional('bluprint', {
        describe: 'The bluprint to remove',
        type: 'string',
      });
  }, async function({ bluprint }) {
    await remove(bluprint);
  })
  .command('make [name]', 'Creates a .bluprintrc file', (yargs) => {
    yargs
      .positional('name', {
        describe: 'The name of your bluprint',
        type: 'string',
      });
  }, async function({ name }) {
    await make(name);
  })
  .argv;
