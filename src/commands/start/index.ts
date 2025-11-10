import chooseBluprint from './chooseBluprint/index.js';
import choosePart from './choosePart/index.js';
import fetchBluprint from './fetchBluprint/index.js';
import fetchBluprintrc from '../../utils/fetchBluprintrc.js';
import getLogger from '../../utils/getLogger.js';
import getUserConfig from '../../utils/getUserConfig.js';
import handleActions from '../../actions/index.js';
import hostedGitInfo from 'hosted-git-info';

const logger = getLogger();

interface StartInject {
  method: any[] | null;
  category: any[] | null;
  bluprint: any[] | null;
  partConfirm: any[] | null;
  partChoice: any[] | null;
}

const defaultInject: StartInject = {
  method: null,
  category: null,
  bluprint: null,
  partConfirm: null,
  partChoice: null,
};

export default async (name: string | null = null, inject: StartInject = defaultInject): Promise<void> => {
  const { bluprints } = getUserConfig();

  let bluprintName = name;

  if (!bluprintName) {
    bluprintName = await chooseBluprint(inject);
  }

  const bluprint = bluprints[bluprintName];

  let git;

  if (bluprint) {
    git = hostedGitInfo.fromUrl(`${bluprint.user}/${bluprint.project}`);
  } else {
    // Support for directly passing a github repo
    git = hostedGitInfo.fromUrl(bluprintName);
  }

  if (!git) {
    logger.error(`Can't find bluprint repo at "${bluprintName}"`);
    process.exit(1);
  }

  const bluprintrc = await fetchBluprintrc(git.file('.bluprintrc'));

  const { parts, mergeJson } = bluprintrc;

  const { part, globs: filterGlobs } = await choosePart(parts, inject);

  await fetchBluprint(git.tarball(), filterGlobs, mergeJson);

  await handleActions(bluprintrc.actions, part || undefined);
};
