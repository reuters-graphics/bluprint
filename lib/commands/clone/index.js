import fetchBluprint from './fetchBluprint';
import getLogger from '../../utils/getLogger';
import hostedGitInfo from 'hosted-git-info';

const logger = getLogger();

export default async(repo) => {
  const git = hostedGitInfo.fromUrl(repo);

  if (!git) {
    logger.error(`Can't find GitHub repo at "${repo}"`);
    process.exit(1);
  }

  await fetchBluprint(git.tarball());
};
