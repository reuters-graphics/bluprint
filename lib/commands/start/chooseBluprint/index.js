const askMethod = require('./askMethod');
const askCategory = require('./askCategory');
const askBluprint = require('./askBluprint');
const searchBluprint = require('./searchBluprint');

module.exports = async(fs, inject) => {
  const answer = await askMethod(inject.method);
  switch (answer) {
    case 'category':
      const category = await askCategory(fs, inject.category);
      return askBluprint(category, fs, inject.bluprint);
    case 'search':
      return searchBluprint(fs, inject.bluprint);
    default: // all
      return askBluprint('All', fs, inject.bluprint); ;
  }
};
