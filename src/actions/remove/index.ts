import fs from 'node:fs';
import { globSync } from 'glob';
import type { Action, ActionOptions } from '../types';

/**
 * Remove files and directories matching one or more globs, relative to the
 * project root.
 *
 * @param paths A glob or array of globs, e.g. `'dist/*'` or `['*.log', 'tmp']`.
 * @example remove(['**\/*.test.ts', 'coverage'])
 */
export const remove = (
  paths: string | string[],
  options: ActionOptions = {}
): Action => ({
  name: 'remove',
  when: options.when,
  run: () => {
    const globs = Array.isArray(paths) ? paths : [paths];
    const matches = globSync(globs, {
      cwd: process.cwd(),
      absolute: true,
      dot: true,
    });
    for (const match of matches) {
      fs.rmSync(match, { recursive: true, force: true });
    }
  },
});
