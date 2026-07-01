import chalk from 'chalk-template';
import sade from 'sade';
import updateNotifier from 'update-notifier';

import { name, version } from '../package.json';
import { add } from './commands/add';
import { remove } from './commands/remove';
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

// TODO(0001-v1-api-rewrite): re-register `clone`, `new`, and `start` here as
// each is ported from src/__archive/ to the new config/profile API.
// See dev-notes/tasks/0001-v1-api-rewrite.md.

prog.parse(process.argv);
