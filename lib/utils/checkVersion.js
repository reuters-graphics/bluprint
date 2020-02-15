import chalk from 'chalk';
import getLogger from './getLogger';
import semver from 'semver';
import { version } from '../../package.json';

const logger = getLogger();

export default (bluprintrc) => {
  const { bluprint: requiredVersion } = bluprintrc;
  const isHealthy = semver.satisfies(version, requiredVersion);
  if (isHealthy) return;

  const minVersion = semver.minVersion(requiredVersion);

  if (semver.lt(version, minVersion)) {
    logger.error(chalk`This bluprint requires CLI version {green.underline ${requiredVersion}}. Yours is {green ${version}}. Upgrade your CLI to use this bluprint:\n\n{yellow $ yarn global add @reuters-graphics/bluprint}\n`);
    process.exit();
  } else {
    logger.warn(chalk`This bluprint uses CLI version {green.underline ${requiredVersion}}. Yours is {green ${version}}, which may not work with this bluprint.`);
  }
};
