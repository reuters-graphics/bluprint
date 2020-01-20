const prompts = require('prompts');
const getCategories = require('./getCategories');

module.exports = async(fs, inject = null) => {
  const categories = getCategories(fs);

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
