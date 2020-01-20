const prompts = require('prompts');

const choices = [
  {
    title: 'Show me template categories',
    value: 'category',
  },
  {
    title: 'Let me search for something',
    value: 'search',
  },
  {
    title: 'Show me all my templates',
    value: 'all',
  },
];

module.exports = async(inject = null) => {
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
