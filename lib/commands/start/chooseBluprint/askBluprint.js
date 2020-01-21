const prompts = require('prompts');
const getBluprints = require('./getBluprints');

module.exports = async(category, fs, inject = null) => {
  const bluprints = getBluprints(category, fs);

  bluprints.sort();

  const choices = bluprints.map(bluprint => ({
    title: bluprint,
    value: bluprint,
  }));

  if (inject) prompts.inject(inject);

  const { answer } = await prompts([{
    type: 'select',
    name: 'answer',
    choices: choices,
    message: `Pick a bluprint.`,
    initial: 0,
  }]);
  return answer;
};
