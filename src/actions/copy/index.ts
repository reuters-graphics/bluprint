import chalk from 'chalk';
import fs from 'fs';
import getLogger from '../../utils/getLogger.js';
import mustache from 'mustache';
import path from 'path';
import type { CopyAction } from './schema.js';

const logger = getLogger();

const copyDir = (src: string, dest: string): void => {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
};

const copy = (oldRelativePath: string, newRelativePath: string, context: Record<string, any>): void => {
  const ROOT = process.cwd();

  const oldPath = path.join(ROOT, oldRelativePath);

  if (!fs.existsSync(oldPath)) {
    logger.warn(chalk`Unable to find file {green.underline ${oldRelativePath}} in copy action. Skipping.`);
    return;
  }

  const stats = fs.statSync(oldPath);

  if (stats.isFile()) {
    // Let new path be rendered through template engine with context
    const newFilePath = path.join(ROOT, mustache.render(newRelativePath, context));
    const dirPath = path.dirname(newFilePath);
    fs.mkdirSync(dirPath, { recursive: true });
    fs.copyFileSync(oldPath, newFilePath);
  } else {
    const newDirPath = path.join(ROOT, mustache.render(newRelativePath, context));
    copyDir(oldPath, newDirPath);
  }
};

export default (action: CopyAction, context: Record<string, any>): void => {
  const { paths } = action;

  if (Array.isArray(paths[0])) {
    (paths as [string, string][]).forEach((pathPair) => copy(pathPair[0], pathPair[1], context));
  } else {
    const [from, to] = paths as [string, string];
    copy(from, to, context);
  }
};
