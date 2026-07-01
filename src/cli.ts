import chalk from 'chalk-template';
import sade from 'sade';
import updateNotifier from 'update-notifier';

import { name, version } from '../package.json';
import { add } from './commands/add';

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

// TODO(0001-v1-api-rewrite): re-register `clone`, `new`, `remove`, `start`, and
// `token` here as each is ported from src/__archive/ to the new config/profile
// API. See dev-notes/tasks/0001-v1-api-rewrite.md.

prog.parse(process.argv);
