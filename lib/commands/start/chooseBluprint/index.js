import askBluprint from './askBluprint';
import askCategory from './askCategory';
import askMethod from './askMethod';
import searchBluprint from './searchBluprint';

export default async(inject) => {
  const answer = await askMethod(inject.method);
  switch (answer) {
    case 'category':
      const category = await askCategory(inject.category);
      return askBluprint(category, inject.bluprint);
    case 'search':
      return searchBluprint(inject.bluprint);
    default: // all
      return askBluprint('All', inject.bluprint); ;
  }
};
