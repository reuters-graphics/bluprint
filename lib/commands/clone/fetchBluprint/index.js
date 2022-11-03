import getLogger from '../../../utils/getLogger';
import getParser from './parser';
import getUserConfig from '../../../utils/getUserConfig';
import https from 'https';
import bluprintTokenReminder from '../../../utils/bluprintTokenReminder';

const logger = getLogger();

const fetchBluprint = (url) => {
  return new Promise((resolve, reject) => {
    const headers = {};

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
          bluprintTokenReminder();
          
          return reject(
            new Error(`HTTP error ${statusCode}: ${res.statusMessage}`)
          );
        }
        // Handle redirects
        if (statusCode >= 300) {
          return fetchBluprint(res.headers.location).then(resolve).catch(reject);
        }

        res
          .pipe(getParser(resolve, reject))
          .on('error', (e) => {
            logger.error(`Tarball parsing error.`);
            reject(e);
          });
      })
      .on('error', (e) => {
        logger.error(`Connection error attempting to access repo.`);
        bluprintTokenReminder();

        reject(e);
      });
  });
};

export default fetchBluprint;
