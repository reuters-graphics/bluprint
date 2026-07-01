import { spawnSync } from 'node:child_process';
import type { Action, ActionOptions } from '../types';

export interface ExecuteOptions extends ActionOptions {
  /** Pipe output instead of inheriting the parent stdio. */
  silent?: boolean;
}

/**
 * Run a shell command in the project root.
 *
 * @param command A full command line (run via the shell, e.g. `'pnpm install'`)
 *   or a `[command, ...args]` array (run without a shell).
 * @example execute('pnpm install', { silent: true })
 * @example execute(['git', 'init'])
 */
export const execute = (
  command: string | string[],
  options: ExecuteOptions = {}
): Action => ({
  name: 'execute',
  when: options.when,
  failOnError: options.failOnError,
  run: () => {
    const stdio = options.silent ? 'pipe' : 'inherit';
    if (typeof command === 'string') {
      spawnSync(command, {
        cwd: process.cwd(),
        shell: true,
        stdio,
        encoding: 'utf8',
      });
    } else {
      const [cmd, ...args] = command;
      spawnSync(cmd, args, {
        cwd: process.cwd(),
        stdio,
        encoding: 'utf8',
      });
    }
  },
});
