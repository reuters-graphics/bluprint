import * as v from 'valibot';
import checkVersion from './checkVersion.js';
import getLogger from './getLogger.js';
import getUserConfig from './getUserConfig.js';
import https from 'https';
import schema from '../schema.js';
import type { Bluprintrc } from '../types.js';

const logger = getLogger();

const fetchConfig = async (url: string): Promise<Bluprintrc> => {
  return new Promise((resolve, reject) => {
    const headers: Record<string, string> = {};

    const { token } = getUserConfig();
    if (token) {
      headers['Authorization'] = `token ${token}`;
    } else if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    https
      .get(url, { headers }, (res) => {
        const { statusCode } = res;

        if (!statusCode || statusCode >= 400) {
          logger.error(`Connection error attempting to access bluprint repo.`);
          return reject(
            new Error(`Error when trying to find .bluprintrc in repo.\nHTTP error ${statusCode}: ${res.statusMessage}`)
          );
        }
        // Handle redirects
        if (statusCode >= 300) {
          return fetchConfig(res.headers.location as string).then(resolve).catch(reject);
        }

        let finalData = '';

        res
          .on('data', (data) => {
            finalData += data.toString('utf-8');
          })
          .on('end', () => {
            const bluprintrc = JSON.parse(finalData);

            checkVersion(bluprintrc);

            try {
              const validated = v.parse(schema, bluprintrc);
              resolve(validated);
            } catch (error) {
              logger.error('The repo\'s .bluprintrc is invalid.');
              if (error instanceof v.ValiError) {
                console.error(error.issues);
              }
              return reject(new Error('Invalid .blurprintrc'));
            }
          });
      })
      .on('error', (e) => {
        logger.error(`Connection error attempting to access bluprint repo.`);
        reject(e);
      });
  });
};

export default fetchConfig;
