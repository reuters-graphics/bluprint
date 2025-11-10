import chalk from 'chalk';
import fs from 'fs';
import getLogger from '../../utils/getLogger.js';
import mustache from 'mustache';
import path from 'path';
import type { MoveAction } from './schema.js';

const logger = getLogger();

const move = (oldRelativePath: string, newRelativePath: string, context: Record<string, any>): void => {
  const ROOT = process.cwd();

  const oldPath = path.join(ROOT, oldRelativePath);
  // Let new path be rendered through template engine with context
  const newPath = path.join(ROOT, mustache.render(newRelativePath, context));
  const dirPath = path.dirname(newPath);

  if (!fs.existsSync(oldPath)) {
    logger.warn(chalk`Unable to find file {green.underline ${oldRelativePath}} in move action. Skipping.`);
    return;
  }

  fs.mkdirSync(dirPath, { recursive: true });
  fs.renameSync(oldPath, newPath);
};

export default (action: MoveAction, context: Record<string, any>): void => {
  const { paths } = action;

  if (Array.isArray(paths[0])) {
    (paths as [string, string][]).forEach((pathPair) => move(pathPair[0], pathPair[1], context));
  } else {
    const [from, to] = paths as [string, string];
    move(from, to, context);
  }
};
