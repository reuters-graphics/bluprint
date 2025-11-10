import fetchBluprint from './fetchBluprint/index.js';
import getLogger from '../../utils/getLogger.js';
import hostedGitInfo from 'hosted-git-info';

const logger = getLogger();

export default async (repo: string): Promise<void> => {
  const git = hostedGitInfo.fromUrl(repo);

  if (!git) {
    logger.error(`Can't find GitHub repo at "${repo}"`);
    process.exit(1);
  }

  await fetchBluprint(git.tarball());
};
