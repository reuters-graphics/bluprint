import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk-template';
import { log } from '@clack/prompts';
import { renderMustache } from '../render/template';
import type {
  Action,
  ActionContext,
  ActionOptions,
  DefaultContext,
} from '../types';
import type { PathPair } from '../copy';

const movePath = (from: string, to: string, context: ActionContext): void => {
  const root = process.cwd();
  const oldPath = path.join(root, from);

  if (!fs.existsSync(oldPath)) {
    log.warn(
      chalk`Unable to find {green.underline ${from}} in move action. Skipping.`
    );
    return;
  }

  // The destination is rendered through the template engine with context.
  const newPath = path.join(root, renderMustache(to, context));
  fs.mkdirSync(path.dirname(newPath), { recursive: true });
  fs.renameSync(oldPath, newPath);
};

const normalizePairs = (paths: PathPair | PathPair[]): PathPair[] =>
  Array.isArray(paths[0]) ? (paths as PathPair[]) : [paths as PathPair];

/**
 * Move (rename) files or directories within the scaffolded project.
 * Destination paths are rendered as mustache templates against the run context.
 *
 * @param paths A single `[from, to]` pair or an array of pairs.
 * @example move(['src/index.ts', 'src/{{name}}.ts'])
 */
export const move = <Ctx extends DefaultContext = ActionContext>(
  paths: PathPair | PathPair[],
  options: ActionOptions<Ctx> = {}
): Action<Ctx> => ({
  name: 'move',
  when: options.when,
  failOnError: options.failOnError,
  run: (ctx) => {
    for (const [from, to] of normalizePairs(paths)) movePath(from, to, ctx);
  },
});
