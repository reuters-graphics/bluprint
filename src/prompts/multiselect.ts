import {
  multiselect as multiselectPrompt,
  isCancel,
  cancel,
} from '@clack/prompts';

interface MultiselectOptions {
  /**
   * A message to prompt the user to enter the value.
   */
  message: string;
  options: {
    value: string;
    label?: string;
    hint?: string;
  }[];
  initialValues?: string[];
  maxItems?: number;
  required?: boolean;
}

/**
 * Prompt for multiple values
 */
export const multiselect = async ({
  message,
  options,
  initialValues,
  maxItems,
  required,
}: MultiselectOptions) => {
  const value = await multiselectPrompt({
    message,
    options,
    initialValues,
    maxItems,
    required,
  });

  if (isCancel(value)) {
    cancel('Cancelled');
    process.exit(0);
  }
  return value;
};
