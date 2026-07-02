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

/** A `[from, to]` pair of project-relative paths. */
export type PathPair = [from: string, to: string];

const copyDir = (src: string, dest: string): void => {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
};

const copyPath = (from: string, to: string, context: ActionContext): void => {
  const root = process.cwd();
  const oldPath = path.join(root, from);

  if (!fs.existsSync(oldPath)) {
    log.warn(
      chalk`Unable to find {green.underline ${from}} in copy action. Skipping.`
    );
    return;
  }

  // The destination is rendered through the template engine with context.
  const newPath = path.join(root, renderMustache(to, context));

  if (fs.statSync(oldPath).isFile()) {
    fs.mkdirSync(path.dirname(newPath), { recursive: true });
    fs.copyFileSync(oldPath, newPath);
  } else {
    copyDir(oldPath, newPath);
  }
};

const normalizePairs = (paths: PathPair | PathPair[]): PathPair[] =>
  Array.isArray(paths[0]) ? (paths as PathPair[]) : [paths as PathPair];

/**
 * Copy files or directories within the scaffolded project. Destination paths
 * are rendered as mustache templates against the run context.
 *
 * @param paths A single `[from, to]` pair or an array of pairs.
 * @example copy(['tpl/readme.md', '{{name}}/README.md'])
 */
export const copy = <Ctx extends DefaultContext = ActionContext>(
  paths: PathPair | PathPair[],
  options: ActionOptions<Ctx> = {}
): Action<Ctx> => ({
  name: 'copy',
  when: options.when,
  failOnError: options.failOnError,
  run: (ctx) => {
    for (const [from, to] of normalizePairs(paths)) copyPath(from, to, ctx);
  },
});
