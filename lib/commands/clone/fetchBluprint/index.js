import getLogger from '../../../utils/getLogger';
import getParser from './parser';
import https from 'https';

const logger = getLogger();

const fetchBluprint = (url, fs) => {
  return new Promise((resolve, reject) => {
    const headers = {};

    if (process.env.GITHUB_TOKEN) {
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
          return fetchBluprint(res.headers.location).then(resolve).catch(reject);
        }

        res
          .pipe(getParser(resolve, reject, fs))
          .on('error', (e) => {
            logger.error(`Tarball parsing error.`);
            reject(e);
          });
      })
      .on('error', (e) => {
        logger.error(`Connection error attempting to access repo.`);
        reject(e);
      });
  });
};

export default fetchBluprint;
