import getBluprints from './getBluprints.js';
import prompts from 'prompts';

export default async (inject: any[] | null = null): Promise<string> => {
  const bluprints = getBluprints('All');

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
