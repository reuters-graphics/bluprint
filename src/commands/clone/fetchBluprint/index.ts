import getLogger from '../../../utils/getLogger.js';
import getParser from './parser.js';
import getUserConfig from '../../../utils/getUserConfig.js';
import https from 'https';

const logger = getLogger();

const fetchBluprint = (url: string): Promise<void> => {
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
          logger.error(`Connection error attempting to access repo.`);
          return reject(
            new Error(`HTTP error ${statusCode}: ${res.statusMessage}`)
          );
        }
        // Handle redirects
        if (statusCode >= 300) {
          return fetchBluprint(res.headers.location as string).then(resolve).catch(reject);
        }

        const parser = getParser(resolve, reject);
        res.pipe(parser);
      })
      .on('error', (e) => {
        logger.error(`Connection error attempting to access repo.`);
        reject(e);
      });
  });
};

export default fetchBluprint;
