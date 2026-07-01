import { confirm as confirmPrompt, isCancel, cancel } from '@clack/prompts';

interface ConfirmOptions {
  /**
   * A message to prompt the user to enter the value.
   */
  message: string;
  /**
   * Initial value of the prompt.
   */
  initialValue?: boolean;
  active?: string;
  inactive?: string;
}

export const confirm = async ({
  message,
  initialValue,
  active,
  inactive,
}: ConfirmOptions) => {
  const value = await confirmPrompt({
    message,
    active,
    inactive,
    initialValue,
  });

  if (isCancel(value)) {
    cancel('Cancelled');
    process.exit(0);
  }
  return value;
};
