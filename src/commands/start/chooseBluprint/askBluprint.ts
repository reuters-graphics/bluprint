import getBluprints from './getBluprints.js';
import prompts from 'prompts';

export default async (category: string, inject: any[] | null = null): Promise<string> => {
  const bluprints = getBluprints(category);

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
