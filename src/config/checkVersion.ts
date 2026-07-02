import semver from 'semver';
import chalk from 'chalk-template';
import { log } from '@clack/prompts';
import { version } from '../../package.json';
import type { BluprintConfig } from './types';

/**
 * Warn or bail if the installed CLI doesn't satisfy a bluprint's declared
 * `bluprint` version constraint (e.g. `^1.0.0`). Exits when the CLI is too old
 * to use the bluprint; warns for any other mismatch. No-ops when the bluprint
 * declares no constraint.
 */
export const checkVersion = (config: BluprintConfig): void => {
  const required = config.bluprint;
  if (!required) return;
  if (semver.satisfies(version, required)) return;

  const min = semver.minVersion(required);
  if (min && semver.lt(version, min)) {
    log.error(
      chalk`This bluprint requires bluprint CLI {green.underline ${required}}, but you have {green ${version}}. Upgrade with {yellow npm i -g @reuters-graphics/bluprint}.`
    );
    process.exit(1);
  } else {
    log.warn(
      chalk`This bluprint targets bluprint CLI {green.underline ${required}}; you have {green ${version}}. It may not work as expected.`
    );
  }
};
