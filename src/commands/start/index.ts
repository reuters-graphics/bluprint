import chalk from 'chalk-template';
import { log } from '@clack/prompts';

import { profile } from '../../profile';
import { config } from '../../config';
import { checkVersion } from '../../config/checkVersion';
import { runActions } from '../../actions';
import { choosePart } from './choosePart';
import { scaffold } from '../../scaffold';

/**
 * Start a new project from a bluprint: pick a bluprint, load its config, choose
 * a part (if any), scaffold its files into the current directory, then run its
 * actions.
 *
 * @param bluprint A registered bluprint title, or a git URL/shorthand. If
 *   omitted, the user picks from their installed bluprints.
 */
export const start = async (bluprint?: string): Promise<void> => {
  let urlOrPath: string;

  if (!bluprint) {
    if (profile.bluprintTitles.length === 0) {
      log.info(
        chalk`You have no bluprints yet. Add one with {yellow bluprint add}.`
      );
      return;
    }
    urlOrPath = await profile.promptForBluprint();
  } else {
    // A registered title resolves to its URL; otherwise treat it as a git URL.
    urlOrPath = profile.getBluprintUrl(bluprint) ?? bluprint;
  }

  if (urlOrPath.startsWith('file://')) {
    log.error(
      chalk`{yellow start} doesn't support local {yellow file://} bluprints yet — pass a git repo like {green user/repo}.`
    );
    return;
  }

  await config.load(urlOrPath);
  if (!config.module) return;

  checkVersion(config.module);

  const { part, files, ignores, actions } = await choosePart(config.module);

  try {
    await scaffold(urlOrPath, { files, ignores });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log.error(chalk`Couldn't fetch the bluprint's files:\n${message}`);
    process.exit(1);
  }

  try {
    await runActions(actions, part ?? undefined);
  } catch {
    log.error('A bluprint action failed, so scaffolding was halted.');
    process.exit(1);
  }

  const name =
    typeof config.module.name === 'string' ?
      config.module.name
    : config.module.name.title;
  log.success(chalk`Scaffolded your project from {green ${name}}.`);
};
