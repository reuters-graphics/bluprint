import getUserConfig from '../../../utils/getUserConfig';

export default (category = null) => {
  const userConfig = getUserConfig();
  const { bluprints } = userConfig;
  if (!category || category === 'All') {
    return Object.keys(bluprints);
  } else if (category === 'Other') {
    return Object.keys(bluprints)
      .filter(k => bluprints[k].category.trim() === '');
  } else {
    return Object.keys(bluprints)
      .filter(k => bluprints[k].category === category);
  };
};
