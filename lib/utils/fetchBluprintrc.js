import Ajv from 'ajv';
import getLogger from './getLogger';
import getUserConfig from './getUserConfig';
import https from 'https';
import schema from '../schema';

const logger = getLogger();

const fetchConfig = async(url, fs) => {
  return new Promise((resolve, reject) => {
    const headers = {};

    const { token } = getUserConfig(fs);
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
          return fetchConfig(res.headers.location).then(resolve).catch(reject);
        }

        res
          .on('data', (data) => {
            const bluprintrc = JSON.parse(data.toString('utf-8'));

            const ajv = new Ajv({ allErrors: true, verbose: true });

            const valid = ajv.validate(schema, bluprintrc);
            if (!valid) {
              logger.error('The repo\'s .bluprintrc is invalid.');
              return reject(new Error('Invalid .blurprintrc')); ;
            }

            resolve(bluprintrc);
          });
      })
      .on('error', (e) => {
        logger.error(`Connection error attempting to access bluprint repo.`);
        reject(e);
      });
  });
};

export default fetchConfig;
