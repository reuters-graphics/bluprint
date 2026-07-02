import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import S from 'string';
import chalk from 'chalk-template';
import { log } from '@clack/prompts';

import { config } from '../../config';
import { checkVersion } from '../../config/checkVersion';
import { runActions } from '../../actions';
import { copyLocal } from '../../scaffold/copyLocal';
import { choosePart } from '../start/choosePart';

const CONFIG_FILE = 'bluprint.config.ts';

/** Remove a directory's contents but keep the directory itself. */
const emptyDir = (dir: string): void => {
  fs.mkdirSync(dir, { recursive: true });
  for (const entry of fs.readdirSync(dir)) {
    fs.rmSync(path.join(dir, entry), { recursive: true, force: true });
  }
};

/**
 * Test a bluprint locally without publishing it: scaffold the bluprint in the
 * given directory (default cwd) — its current on-disk files, uncommitted changes
 * included — into a stable temp directory and run its actions, then print the
 * path to inspect. Re-running refreshes the same directory in place.
 *
 * @param pathArg Path to the bluprint directory. Defaults to the cwd.
 */
export const preview = async (pathArg?: string): Promise<void> => {
  const srcDir = path.resolve(pathArg ?? process.cwd());

  if (!fs.existsSync(path.join(srcDir, CONFIG_FILE))) {
    log.error(
      chalk`No {yellow ${CONFIG_FILE}} in {yellow ${srcDir}}. Run this inside a bluprint directory, or pass its path.`
    );
    return;
  }

  await config.load(`file://${srcDir}`);
  if (!config.module) return;

  checkVersion(config.module);

  const name =
    typeof config.module.name === 'string' ?
      config.module.name
    : config.module.name.title;

  const slug = S(name).slugify().s;
  if (!slug) {
    log.error(
      chalk`Couldn't derive a folder name from the bluprint name {yellow ${name}}.`
    );
    return;
  }

  const { part, files, ignores, actions } = await choosePart(config.module);

  const out = path.join(os.tmpdir(), 'bluprint', slug);
  emptyDir(out);

  const originalCwd = process.cwd();
  process.chdir(out);
  try {
    copyLocal(srcDir, { files, ignores });
    await runActions(actions, part ?? undefined);
  } finally {
    process.chdir(originalCwd);
  }

  log.success(
    chalk`Previewed {green ${name}} at:\n{green ${out}}\n\nInspect it, then re-run {yellow bluprint preview} to refresh.`
  );
};
