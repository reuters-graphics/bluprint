import chalk from 'chalk-template';
import { log } from '@clack/prompts';

import * as prompts from '../../prompts';
import { profile } from '../../profile';

/**
 * Save a GitHub personal access token to the user's CLI profile.
 *
 * The token is used to fetch `bluprint.config.ts` from private repos. If a token
 * is passed directly it's saved without prompting. Otherwise, when a token is
 * already stored the user is asked whether to replace it; when none is stored
 * they're prompted to enter one.
 *
 * @param accessToken A GitHub personal access token. If omitted, the user is
 *   prompted (interactively) for one.
 * @returns A promise that resolves once the token is saved, or early if the user
 *   chooses to keep their existing token.
 */
export const token = async (accessToken?: string): Promise<void> => {
  if (accessToken) {
    profile.token = accessToken;
    log.success('Saved your new personal access token.');
    return;
  }

  const existing = profile.token;

  if (existing) {
    const change = await prompts.confirm({
      message: chalk`You've already registered a personal access token:\n{green ${existing}}\n\nDo you want to change it?`,
      initialValue: false,
    });
    if (!change) {
      log.info(`OK, we'll keep the same token going.`);
      return;
    }
    profile.token = await prompts.text({
      message: `OK, what's your new personal access token?`,
    });
  } else {
    profile.token = await prompts.text({
      message: `Let's save a personal access token. Get one from GitHub and then enter it below:`,
    });
  }

  log.success('Saved your new personal access token.');
};
