const prompts = require('prompts');

module.exports = async(action, updateContext) => {
  const { questions, inject } = action;
  if (inject) prompts.inject(inject);
  const answers = await prompts(questions);

  updateContext(answers);
};
