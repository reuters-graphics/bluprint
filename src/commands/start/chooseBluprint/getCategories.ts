import { uniq } from 'es-toolkit';
import getUserConfig from '../../../utils/getUserConfig.js';

export default (): string[] => {
  const userConfig = getUserConfig();
  const { bluprints } = userConfig;
  const categories = uniq(Object.keys(bluprints)
    .map(k => bluprints[k].category)
    .filter(cat => cat.trim() !== ''));
  categories.sort();
  categories.unshift('All');
  categories.push('Other');
  return categories;
};
