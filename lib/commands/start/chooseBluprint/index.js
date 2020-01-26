import askBluprint from './askBluprint';
import askCategory from './askCategory';
import askMethod from './askMethod';
import searchBluprint from './searchBluprint';

export default async(fs, inject) => {
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
