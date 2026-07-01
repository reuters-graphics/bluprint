import { cancel, isCancel, select as selectPrompt } from '@clack/prompts';

interface SelectOptions {
  /**
   * A message to prompt the user to enter the value.
   */
  message: string;
  /**
   * Initial value of the prompt.
   */
  initialValue?: string;
  options: {
    value: string;
    label?: string;
    hint?: string;
  }[];
}

export const select = async ({
  message,
  initialValue,
  options,
}: SelectOptions) => {
  const value = await selectPrompt({
    message,
    initialValue,
    options,
  });
  if (isCancel(value)) {
    cancel('Cancelled');
    process.exit(0);
  }
  return value;
};
