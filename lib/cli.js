import { add, clone, newBluprint, remove, start, token, test } from 'bluprint';
import { name, version } from '../package.json';

import chalk from 'chalk';
import updateNotifier from 'update-notifier';
import yargs from 'yargs';

updateNotifier({ pkg: { name, version } }).notify();

console.log(chalk`\n{blue bluprint} {green v${version}}\n`);

yargs // eslint-disable-line no-unused-expressions
  .help()
  .scriptName('bluprint')
  .command('add [repo]', 'Add a new bluprint to your CLI', (yargs) => {
    yargs
      .positional('repo', {
        describe: 'The GitHub repo hosting the bluprint: user/repo, https://, or git@github.com.',
        type: 'string',
      });
  }, async function({ repo }) {
    await add(repo);
  })
  .command('clone <repo>', 'Clone a repo with bluprint', (yargs) => {
    yargs
      .positional('repo', {
        describe: 'The GitHub repo to clone',
        type: 'string',
      });
  }, async function({ repo }) {
    await clone(repo);
  })
  .command('new [name]', 'Create a new .bluprintrc file', (yargs) => {
    yargs
      .positional('name', {
        describe: 'A name for your new bluprint',
        type: 'string',
      });
  }, async function({ name }) {
    await newBluprint(name);
  })
  .command('remove [bluprint]', 'Remove a bluprint from your CLI', (yargs) => {
    yargs
      .positional('bluprint', {
        describe: 'The bluprint to remove',
        type: 'string',
      });
  }, async function({ bluprint }) {
    await remove(bluprint);
  })
  .command('start [bluprint]', 'Start a new project from a bluprint', (yargs) => {
    yargs
      .positional('bluprint', {
        describe: 'The bluprint to use',
        type: 'string',
      });
  }, async function({ bluprint }) {
    await start(bluprint);
  })
  .command('token [accessToken]', 'Add a GitHub personal access token to your CLI', (yargs) => {
    yargs
      .positional('accessToken', {
        describe: 'GitHub personal access token',
        type: 'string',
      });
  }, async function({ accessToken }) {
    await token(accessToken);
  })
  .command('test [directory]', 'Test the bluprint in the given directory', (yargs) => {
    yargs
      .positional('directory', {
        describe: 'Local path to a bluprint',
        type: 'string',
      });
  }, async function({ directory }) {
    await test(directory);
  })
  .argv;
