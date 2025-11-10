import prompts from 'prompts';

interface ChoosePartInject {
  partConfirm: any[] | null;
  partChoice: any[] | null;
}

interface ChoosePartResult {
  part: string | null;
  globs: string[] | null;
}

export default async (
  parts: Record<string, string[]> | undefined,
  inject: ChoosePartInject
): Promise<ChoosePartResult> => {
  if (!parts) return { part: null, globs: null };

  const { partConfirm, partChoice } = inject;

  if (partConfirm) prompts.inject(partConfirm);

  const { usePart } = await prompts({
    type: 'toggle',
    name: 'usePart',
    message: 'This bluprint has parts. Do you want to choose a part or use the whole bluprint?',
    initial: false,
    active: 'Pick a part',
    inactive: 'Give me the whole enchilada 🌮',
  });

  if (!usePart) return { part: null, globs: null };

  if (partChoice) prompts.inject(partChoice);

  const { part } = await prompts({
    type: 'select',
    name: 'part',
    message: 'OK, pick which part of this bluprint you\'d like to use.',
    choices: Object.keys(parts).map(part => ({ title: part, value: part })),
  });

  return { part, globs: parts[part] };
};
