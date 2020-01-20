const getUserConfig = require('../../../utils/getUserConfig');

module.exports = (fs) => {
  const userConfig = getUserConfig(fs);
  const { bluprints } = userConfig;
  const categories = Object.keys(bluprints)
    .map(k => bluprints[k].category)
    .filter(cat => cat.trim() !== '');
  categories.sort();
  categories.unshift('All');
  categories.push('Other');
  return categories;
};
