import askBluprint from './askBluprint.js';
import askCategory from './askCategory.js';
import askMethod from './askMethod.js';
import searchBluprint from './searchBluprint.js';

interface ChooseBluprintInject {
  method: any[] | null;
  category: any[] | null;
  bluprint: any[] | null;
}

export default async (inject: ChooseBluprintInject): Promise<string> => {
  const answer = await askMethod(inject.method);
  switch (answer) {
    case 'category':
      const category = await askCategory(inject.category);
      return askBluprint(category, inject.bluprint);
    case 'search':
      return searchBluprint(inject.bluprint);
    default: // all
      return askBluprint('All', inject.bluprint);
  }
};
