import prompts from 'prompts';

const choices = [
  {
    title: 'Choose my bluprint by category',
    value: 'category',
  },
  {
    title: 'Search for my bluprint',
    value: 'search',
  },
  {
    title: 'Show me all my bluprints',
    value: 'all',
  },
];

export default async(inject = null) => {
  if (inject) prompts.inject(inject);
  const { answer } = await prompts([{
    type: 'select',
    name: 'answer',
    choices: choices,
    message: `How would you like to find your bluprint?`,
    initial: 0,
  }]);
  return answer;
};
