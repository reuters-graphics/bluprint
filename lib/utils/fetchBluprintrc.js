import Ajv from 'ajv';
import checkVersion from './checkVersion';
import getLogger from './getLogger';
import getUserConfig from './getUserConfig';
import https from 'https';
import schema from '../schema';

const logger = getLogger();

const fetchConfig = async(url) => {
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
          logger.error(`Connection error attempting to access bluprint repo.`);
          bluprintTokenReminder();

          return reject(
            new Error(`Error when trying to find .bluprintrc in repo.\nHTTP error ${statusCode}: ${res.statusMessage}`)
          );
        }
        // Handle redirects
        if (statusCode >= 300) {
          return fetchConfig(res.headers.location).then(resolve).catch(reject);
        }

        let finalData = '';

        res
          .on('data', (data) => {
            finalData += data.toString('utf-8');
          })
          .on('end', () => {
            const bluprintrc = JSON.parse(finalData);

            checkVersion(bluprintrc);

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
        bluprintTokenReminder();
        
        reject(e);
      });
  });
};

export default fetchConfig;
