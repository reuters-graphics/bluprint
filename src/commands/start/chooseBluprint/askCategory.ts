import getCategories from './getCategories.js';
import prompts from 'prompts';

export default async (inject: any[] | null = null): Promise<string> => {
  const categories = getCategories();

  const choices = categories.map(cat => ({
    title: cat,
    value: cat,
  }));

  if (inject) prompts.inject(inject);

  const { answer } = await prompts([{
    type: 'select',
    name: 'answer',
    choices: choices,
    message: `Which category?`,
    initial: 0,
  }]);
  return answer;
};
