import chalk from 'chalk-template';
import hostedGitInfo from 'hosted-git-info';
import { log } from '@clack/prompts';
import fs from 'fs';
import path from 'path';
import dedent from 'dedent';

import * as prompts from '../../prompts';
import { profile } from '../../profile';
import { config } from '../../config';
import { checkVersion } from '../../config/checkVersion';

/**
 * Validate that a bluprint source is reachable.
 *
 * For `file://` paths, checks that a `bluprint.config.ts` exists in the local
 * directory. For everything else, checks that the string parses as a hosted git
 * URL (e.g. `user/repo`, `https://…`, `git@…`).
 *
 * @param urlOrPath Git URL (or shorthand) or a `file://` path to a local bluprint.
 * @returns An error message string if invalid, or `undefined` if valid.
 */
const validateBluprint = (urlOrPath: string): string | undefined => {
  if (urlOrPath.startsWith('file://')) {
    if (!fs.existsSync(new URL(path.join(urlOrPath, 'bluprint.config.ts'))))
      return chalk`Did not find a bluprint config file in your local directory: {yellow ${urlOrPath}}. Try again?`;
  } else {
    if (!hostedGitInfo.fromUrl(urlOrPath))
      return chalk`Invalid repo URL: {yellow ${urlOrPath}}. Try again?`;
  }
};

/**
 * Add a bluprint to the user's CLI profile.
 *
 * Prompts for a source if none is given, loads the bluprint's
 * `bluprint.config.ts`, then records it in the user profile
 * (`~/.bluprint/profile.json`) keyed by its title.
 *
 * @param urlOrPath Git URL (or shorthand) or a `file://` path to the bluprint.
 *   If omitted, the user is prompted for it.
 * @returns A promise that resolves once the bluprint is saved (or early if the
 *   source is invalid or the config fails to load).
 */
export const add = async (urlOrPath?: string): Promise<void> => {
  if (!urlOrPath) {
    urlOrPath = await prompts.text({
      message: dedent`Where is your bluprint?

      You can answer with a git URL like "user/repo", "https://..." or "git@..." or with a path to a local directory like "file://...".
      `,
      validate: validateBluprint,
    });
  } else {
    if (validateBluprint(urlOrPath)) {
      log.error(
        chalk`Invalid bluprint git URL or local path: {yellow ${urlOrPath}}`
      );
      return;
    }
  }

  await config.load(urlOrPath);

  if (!config.module) return;

  checkVersion(config.module);

  const title =
    typeof config.module.name === 'string' ?
      config.module.name
    : config.module.name.title;
  const hint =
    typeof config.module.name === 'string' ?
      undefined
    : config.module.name.hint;

  profile.addBluprint({
    url: urlOrPath,
    title,
    hint,
  });

  log.info(
    chalk`Added bluprint {green ${title}}. Run {yellow bluprint start} to start a new project.`
  );
};
