import chalk from 'chalk';
import fs from 'fs';
import getLogger from '../../utils/getLogger.js';
import mustache from 'mustache';
import mustacheUtils from '../render/utils/mustache.js';
import path from 'path';
import type { RegexReplaceAction } from './schema.js';

const logger = getLogger();

const renderMustache = (string: string, context: Record<string, any>): string =>
  mustache.render(string, context);

const replaceInFileString = (
  fileString: string,
  replace: [string, string] | [string, string, string],
  context: Record<string, any>
): string => {
  const flags = replace[2] || 'gm';
  const replacement = renderMustache(replace[1], Object.assign({}, mustacheUtils, context));
  return fileString.replace(new RegExp(replace[0], flags), replacement);
};

const replaceInFile = (
  file: string,
  replacements: ([string, string] | [string, string, string])[],
  context: Record<string, any>
): void => {
  const filePath = path.join(process.cwd(), file);

  if (!fs.existsSync(filePath)) {
    logger.warn(chalk`Unable to find file {green.underline ${file}} in regexreplace action. Skipping.`);
    return;
  }

  let fileString = fs.readFileSync(filePath, 'utf-8');

  replacements.forEach((replace) => {
    fileString = replaceInFileString(fileString, replace, context);
  });

  fs.writeFileSync(filePath, fileString);
};

const standardizeReplacements = (
  replace: [string, string] | [string, string, string] | ([string, string] | [string, string, string])[]
): ([string, string] | [string, string, string])[] => {
  if (typeof replace[0] === 'string') return [replace as [string, string] | [string, string, string]];
  return replace as ([string, string] | [string, string, string])[];
};

export default async (action: RegexReplaceAction, actionsContext: Record<string, any>): Promise<void> => {
  const { files, replace } = action;

  const replacements = standardizeReplacements(replace);

  files.forEach((file) => {
    replaceInFile(file, replacements, actionsContext);
  });
};
