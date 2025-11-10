import { add, clone, newBluprint, remove, start, token } from './index.js';
import { name, version } from '../package.json';

import chalk from 'chalk';
import sade from 'sade';
import updateNotifier from 'update-notifier';

updateNotifier({ pkg: { name, version } }).notify();

console.log(chalk`\n{blue bluprint} {green v${version}}\n`);

const prog = sade('bluprint');

prog.version(version);

prog
  .command('add [repo]')
  .describe('Add a new bluprint to your CLI')
  .action(async (repo?: string) => {
    await add(repo || null);
  });

prog
  .command('clone <repo>')
  .describe('Clone a repo with bluprint')
  .action(async (repo: string) => {
    await clone(repo);
  });

prog
  .command('new [name]')
  .describe('Create a new .bluprintrc file')
  .action(async (name?: string) => {
    await newBluprint(name || null);
  });

prog
  .command('remove [bluprint]')
  .describe('Remove a bluprint from your CLI')
  .action(async (bluprint?: string) => {
    await remove(bluprint || null);
  });

prog
  .command('start [bluprint]')
  .describe('Start a new project from a bluprint')
  .action(async (bluprint?: string) => {
    await start(bluprint || null);
  });

prog
  .command('token [accessToken]')
  .describe('Add a GitHub personal access token to your CLI')
  .action(async (accessToken?: string) => {
    await token(accessToken || null);
  });

prog.parse(process.argv);
