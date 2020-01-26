import { add, newBluprint, remove, start } from 'bluprint';
import { name, version } from '../package.json';

import chalk from 'chalk';
import updateNotifier from 'update-notifier';
import yargs from 'yargs';

updateNotifier({ pkg: { name, version } }).notify();

console.log(chalk`\n{blue bluprint} {green v${version}}\n`);

yargs // eslint-disable-line no-unused-expressions
  .help()
  .scriptName('bluprint')
  .command('start [bluprint]', 'Start a new project from a bluprint', (yargs) => {
    yargs
      .positional('bluprint', {
        describe: 'The bluprint to use',
        type: 'string',
      });
  }, async function({ bluprint }) {
    await start(bluprint);
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
  .command('new [name]', 'Start a new bluprint .bluprintrc file', (yargs) => {
    yargs
      .positional('name', {
        describe: 'A name for your new bluprint',
        type: 'string',
      });
  }, async function({ name }) {
    await newBluprint(name);
  })
  .argv;
