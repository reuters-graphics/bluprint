import https from 'node:https';
import hostedGitInfo from 'hosted-git-info';
import { profile } from '../../../profile';
import { extractTarball, type ScaffoldFilter } from './extract';

export type { ScaffoldFilter } from './extract';

const authHeaders = (): Record<string, string> => {
  const token = profile.token || process.env.GITHUB_TOKEN;
  return token ? { Authorization: `token ${token}` } : {};
};

const download = (url: string, filter: ScaffoldFilter): Promise<void> =>
  new Promise((resolve, reject) => {
    https
      .get(url, { headers: authHeaders() }, (res) => {
        const { statusCode } = res;

        if (!statusCode || statusCode >= 400) {
          res.resume();
          return reject(
            new Error(`HTTP error ${statusCode}: ${res.statusMessage}`)
          );
        }
        // Follow redirects (GitHub tarball URLs redirect to codeload).
        if (statusCode >= 300 && res.headers.location) {
          res.resume();
          return download(res.headers.location, filter).then(resolve, reject);
        }

        extractTarball(res, filter).then(resolve, reject);
      })
      .on('error', reject);
  });

/**
 * Download a bluprint repo's tarball and extract the files matching `filter`
 * into the current working directory.
 *
 * @param url A git URL or shorthand (e.g. `user/repo`).
 */
export const scaffold = async (
  url: string,
  filter: ScaffoldFilter
): Promise<void> => {
  const git = hostedGitInfo.fromUrl(url);
  if (!git) throw new Error(`Invalid bluprint git URL: ${url}`);
  await download(git.tarball(), filter);
};
