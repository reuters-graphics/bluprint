import { spawn } from 'node:child_process';
import { spinner, log } from '@clack/prompts';
import { runtime } from '../../runtime';
import type {
  Action,
  ActionContext,
  ActionOptions,
  DefaultContext,
} from '../types';

export interface ExecuteOptions<Ctx extends DefaultContext = ActionContext>
  extends ActionOptions<Ctx> {
  /** Hide the command's output behind a spinner instead of streaming it. */
  silent?: boolean;
}

/** Run a command to completion, resolving its exit code. */
const runCommand = (
  cmd: string,
  args: string[],
  shell: boolean,
  stdio: 'inherit' | 'ignore'
): Promise<number> =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd: process.cwd(), shell, stdio });
    child.on('error', reject);
    child.on('close', (code) => resolve(code ?? 0));
  });

/**
 * Run a shell command in the project root.
 *
 * @param command A full command line (run via the shell, e.g. `'pnpm install'`)
 *   or a `[command, ...args]` array (run without a shell).
 * @example execute('pnpm install', { silent: true })
 * @example execute(['git', 'init'])
 */
export const execute = <Ctx extends DefaultContext = ActionContext>(
  command: string | string[],
  options: ExecuteOptions<Ctx> = {}
): Action<Ctx> => ({
  name: 'execute',
  when: options.when,
  failOnError: options.failOnError,
  run: async () => {
    const isString = typeof command === 'string';
    // A string is run via the shell (it parses the whole line); an array is
    // run directly as [command, ...args] with no shell.
    const cmd = isString ? command : command[0];
    const args = isString ? [] : command.slice(1);
    const label = isString ? command : command.join(' ');

    if (!runtime.interactive) {
      // CI / non-interactive: no spinner (it can't animate), and a non-zero
      // exit must fail the run so it can't pass silently. Output streams unless
      // silenced.
      log.info(`Running ${label}`);
      const code = await runCommand(
        cmd,
        args,
        isString,
        options.silent ? 'ignore' : 'inherit'
      );
      if (code !== 0) {
        throw new Error(`Command "${label}" exited with code ${code}`);
      }
      return;
    }

    if (options.silent) {
      // Output is hidden, so show a spinner for feedback. Running async lets it
      // animate; `ignore` discards output (an unread pipe could deadlock).
      const s = spinner();
      s.start(`Running ${label}`);
      try {
        const code = await runCommand(cmd, args, isString, 'ignore');
        if (code === 0) s.stop(label);
        else s.error(`${label} (exit code ${code})`);
      } catch (error) {
        // e.g. the command isn't found. Stop the spinner before the error
        // unwinds, or it keeps animating over the runner's log output.
        s.error(`${label} (failed)`);
        throw error;
      }
    } else {
      await runCommand(cmd, args, isString, 'inherit');
    }
  },
});
