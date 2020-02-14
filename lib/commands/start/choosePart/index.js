import prompts from 'prompts';

export default async(parts, inject) => {
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
