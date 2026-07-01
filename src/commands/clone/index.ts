import chalk from 'chalk-template';
import hostedGitInfo from 'hosted-git-info';
import { log } from '@clack/prompts';

import { scaffold } from '../../scaffold';

/**
 * Clone a git repo's files into the current directory. Unlike `start`, this
 * copies the whole repo verbatim — no part selection, no actions, and the
 * bluprint config file (if any) is kept.
 *
 * @param repo A git URL or shorthand (e.g. `user/repo`).
 */
export const clone = async (repo: string): Promise<void> => {
  if (!hostedGitInfo.fromUrl(repo)) {
    log.error(chalk`Can't find a git repo at {yellow ${repo}}.`);
    return;
  }

  try {
    await scaffold(repo, {
      files: ['**/*'],
      ignores: [],
      excludeConfig: false,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(chalk`Couldn't clone {yellow ${repo}}:\n${message}`);
    process.exit(1);
  }

  log.success(chalk`Cloned {green ${repo}} into the current directory.`);
};
