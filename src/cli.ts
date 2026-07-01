import chalk from 'chalk-template';
import sade from 'sade';
import updateNotifier from 'update-notifier';

import { name, version } from '../package.json';
import { add } from './commands/add';
import { clone } from './commands/clone';
import { newBluprint } from './commands/new';
import { remove } from './commands/remove';
import { start } from './commands/start';
import { token } from './commands/token';

updateNotifier({ pkg: { name, version } }).notify();

console.log(chalk`\n{blue bluprint} {green v${version}}\n`);

const prog = sade('bluprint');

prog.version(version);

prog
  .command('add [repo]')
  .describe('Add a new bluprint to your CLI')
  .action(async (repo?: string) => {
    await add(repo);
  });

prog
  .command('start [bluprint]')
  .describe('Start a new project from a bluprint')
  .action(async (bluprint?: string) => {
    await start(bluprint);
  });

prog
  .command('remove [bluprint]')
  .describe('Remove a bluprint from your CLI')
  .action(async (bluprint?: string) => {
    await remove(bluprint);
  });

prog
  .command('token [accessToken]')
  .describe('Add a GitHub personal access token to your CLI')
  .action(async (accessToken?: string) => {
    await token(accessToken);
  });

prog
  .command('clone <repo>')
  .describe('Clone a git repo into the current directory')
  .action(async (repo: string) => {
    await clone(repo);
  });

prog
  .command('new [name]')
  .describe('Create a new bluprint config file')
  .action(async (name?: string) => {
    await newBluprint(name);
  });

prog.parse(process.argv);
