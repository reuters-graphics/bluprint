import getBluprints from './getBluprints';
import prompts from 'prompts';

export default async(fs, inject = null) => {
  const bluprints = getBluprints('All', fs);

  const choices = bluprints.map(bluprint => ({
    title: bluprint,
    value: bluprint,
  }));

  if (inject) prompts.inject(inject);

  const { answer } = await prompts([{
    type: 'autocomplete',
    name: 'answer',
    choices: choices,
    message: `Search for your bluprint.`,
  }]);
  return answer;
};
