const userConfig = require('../constants/userConfig');

module.exports = (data, fs) => {
  fs.writeFileSync(userConfig, JSON.stringify(data));
};
