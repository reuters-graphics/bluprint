const https = require('https');
const getParser = require('./parser');

const fetchBluprint = (url, fs) => {
  return new Promise((resolve, reject) => {
    const headers = {
      Authorization: `token ${process.env.GITHUB_TOKEN}`,
    };

    https
      .get(url, { headers }, (res) => {
        const { statusCode } = res;

        if (!statusCode || statusCode >= 400) {
          return reject(
            new Error(`HTTP ERROR ${statusCode}: ${res.statusMessage}`)
          );
        }
        // Handle redirects
        if (statusCode >= 300) {
          return fetchBluprint(res.headers.location).then(resolve).catch(reject);
        }

        res
          .pipe(getParser(resolve, reject, fs))
          .on('error', reject);
      })
      .on('error', reject);
  });
};

module.exports = fetchBluprint;
