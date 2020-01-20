const https = require('https');
const Ajv = require('ajv');
const schema = require('../schema');
const logger = require('./getLogger')();

const fetchConfig = async(url) => {
  return new Promise((resolve, reject) => {
    const headers = {};

    if (process.env.GITHUB_TOKEN) {
      headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
    }

    https
      .get(url, { headers }, (res) => {
        const { statusCode } = res;

        if (!statusCode || statusCode >= 400) {
          return reject(
            new Error(`HTTP error when trying to find .bluprintrc in repo.\nError code ${statusCode}: ${res.statusMessage}`)
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
      .on('error', reject);
  });
};

module.exports = fetchConfig;