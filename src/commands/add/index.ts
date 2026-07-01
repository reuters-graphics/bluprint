import chalk from 'chalk-template';
import hostedGitInfo from 'hosted-git-info';
import { log } from '@clack/prompts';
import fs from 'fs';
import path from 'path';
import dedent from 'dedent';

import * as prompts from '../../prompts';
import { profile } from '../../profile';
import { config } from '../../config';

const validateBluprint = (urlOrPath: string) => {
  if (urlOrPath.startsWith('file://')) {
    if (!fs.existsSync(new URL(path.join(urlOrPath, 'bluprint.config.ts'))))
      return chalk`Did not find a bluprint config file in your local directory: {yellow ${urlOrPath}}. Try again?`;
  } else {
    if (!hostedGitInfo.fromUrl(urlOrPath))
      return chalk`Invalid repo URL: {yellow ${urlOrPath}}. Try again?`;
  }
};

export const add = async (urlOrPath?: string) => {
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

  const title =
    typeof config.module.name === 'string' ?
      config.module.name
    : config.module.name.title;
  const hint =
    typeof config.module.name === 'string' ?
      undefined
    : config.module.name.hint;
  const category = config.module.category || '';

  profile.addBluprint({
    url: urlOrPath,
    category,
    title,
    hint,
  });

  log.info(
    chalk`Added bluprint {green ${title}}. Run {yellow bluprint start} to start a new project.`
  );
};
