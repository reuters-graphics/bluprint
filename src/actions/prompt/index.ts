import prompts from 'prompts';
import type { PromptAction } from './schema.js';

export default async (action: PromptAction, updateContext: (newContext: Record<string, any>) => void): Promise<void> => {
  const { questions, inject } = action as any; // inject is not in schema but used in tests
  if (inject) prompts.inject(inject);
  const answers = await prompts(questions);

  updateContext(answers);
};
