import { profile } from '../profile';
import https from 'https';
import fs from 'fs';
import path from 'path';
import hostedGitInfo from 'hosted-git-info';

export const fetchLocalConfig = async (urlOrPath: string) => {
  // Convert file:// URL to local path
  const bluprintPath =
    urlOrPath.startsWith('file://') ? new URL(urlOrPath).pathname : urlOrPath;
  const configPath = path.join(bluprintPath, 'bluprint.config.ts');
  if (!fs.existsSync(configPath))
    throw new Error(`Could not find config at ${urlOrPath}`);
  return fs.readFileSync(configPath, 'utf-8');
};

export const fetchRemoteConfig = async (gitUrl: string): Promise<string> => {
  const gitInfo = hostedGitInfo.fromUrl(gitUrl);
  if (!gitInfo) throw new Error(`Invalid git URL: ${gitUrl}`);
  const url = gitInfo.file('bluprint.config.ts');
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {};

    const token = profile.token;
    if (token) {
      headers['Authorization'] = `token ${token}`;
    } else if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    https
      .get(url, { headers }, (res) => {
        const { statusCode } = res;

        if (!statusCode || statusCode >= 400) {
          return reject(
            new Error(
              `Error when trying to find bluprint.config.ts in repo.\nHTTP error ${statusCode}: ${res.statusMessage}`
            )
          );
        }
        // Handle redirects
        if (statusCode >= 300) {
          return fetchRemoteConfig(res.headers.location as string)
            .then(resolve)
            .catch(reject);
        }

        let finalData = '';

        res
          .on('data', (data) => {
            finalData += data.toString('utf-8');
          })
          .on('end', () => {
            resolve(finalData);
          });
      })
      .on('error', (e) => {
        reject(e);
      });
  });
};
