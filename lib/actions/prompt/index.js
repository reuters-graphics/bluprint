import prompts from 'prompts';

export default async(action, updateContext) => {
  const { questions, inject } = action;
  if (inject) prompts.inject(inject);
  const answers = await prompts(questions);

  updateContext(answers);
};
