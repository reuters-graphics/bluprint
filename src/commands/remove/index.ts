import chalk from 'chalk-template';
import { log } from '@clack/prompts';

import { profile } from '../../profile';

/**
 * Remove a bluprint from the user's CLI profile.
 *
 * If a name is given it's removed directly (after checking it exists);
 * otherwise the user picks one from a list of installed bluprints.
 *
 * @param name The title of the bluprint to remove. If omitted, the user is
 *   prompted to choose one.
 * @returns A promise that resolves once the bluprint is removed, or early if
 *   there are none installed or the given name doesn't match one.
 */
export const remove = async (name?: string): Promise<void> => {
  const titles = profile.bluprintTitles;

  if (titles.length === 0) {
    log.info('You have no bluprints to remove.');
    return;
  }

  if (name && !titles.includes(name)) {
    log.error(chalk`Couldn't find a bluprint named {green ${name}}.`);
    return;
  }

  const title = name ?? (await profile.promptForBluprintToRemove());

  profile.removeBluprint(title);

  log.success(chalk`Removed bluprint {green ${title}}.`);
};
