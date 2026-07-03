import chalk from 'chalk-template';
import sade from 'sade';
import updateNotifier from 'update-notifier';

import { name, version } from '../package.json';
import { add } from './commands/add';
import { clone } from './commands/clone';
import { newBluprint } from './commands/new';
import { preview } from './commands/preview';
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
  .option('--input', 'JSON file of answers for the bluprint’s prompts')
  .option('--part', 'Scaffold a specific part of the bluprint')
  .option('--ci', 'Run non-interactively (also auto-detected off a TTY / CI)')
  .example('start user/repo --input answers.json --ci')
  .action(
    async (
      bluprint: string | undefined,
      opts: { input?: string; part?: string; ci?: boolean }
    ) => {
      await start(bluprint, {
        input: opts.input,
        part: opts.part,
        ci: opts.ci,
      });
    }
  );

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

prog
  .command('preview [path]')
  .describe('Test a local bluprint by scaffolding it into a temp directory')
  .action(async (path?: string) => {
    await preview(path);
  });

prog.parse(process.argv);
