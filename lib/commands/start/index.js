import chooseBluprint from './chooseBluprint';
import choosePart from './choosePart';
import defaultFs from 'fs';
import fetchBluprint from './fetchBluprint';
import fetchBluprintrc from '../../utils/fetchBluprintrc';
import getLogger from '../../utils/getLogger';
import getUserConfig from '../../utils/getUserConfig';
import handleActions from '../../actions';
import hostedGitInfo from 'hosted-git-info';

const logger = getLogger();

const defaultInject = {
  method: null,
  category: null,
  bluprint: null,
  partConfirm: null,
  partChoice: null,
};

export default async(name = null, inject = defaultInject, fs = defaultFs) => {
  const { bluprints } = getUserConfig(fs);

  if (!name) {
    name = await chooseBluprint(fs, inject);
  }

  const bluprint = bluprints[name];

  let git;

  if (bluprint) {
    git = hostedGitInfo.fromUrl(`${bluprint.user}/${bluprint.project}`);
  } else {
    // Support for directly passing a github repo
    git = hostedGitInfo.fromUrl(name);
  }

  if (!git) {
    logger.error(`Can't find bluprint repo at "${name}"`);
    process.exit(1);
  }

  const bluprintrc = await fetchBluprintrc(git.file('.bluprintrc'), fs);

  const { parts } = bluprintrc;

  const { part, globs: filterGlobs } = await choosePart(parts, inject);

  await fetchBluprint(git.tarball(), filterGlobs, fs);

  await handleActions(bluprintrc.actions, part, fs);
};
