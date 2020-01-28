import chalk from 'chalk';
import getLogger from '../../utils/getLogger';
import mustache from 'mustache';
import mustacheUtils from '../render/utils/mustache';
import path from 'path';

const logger = getLogger();

const renderMustache = (string, context) => mustache.render(string, context);

const replaceInFileString = (fileString, replace, context) => {
  const flags = replace[2] || 'gm';
  const replacement = renderMustache(replace[1], Object.assign({}, mustacheUtils, context));
  return fileString.replace(new RegExp(replace[0], flags), replacement);
};

const replaceInFile = (file, replacements, fs, context) => {
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

const standardizeReplacements = (replace) => {
  if (typeof replace[0] === 'string') return [replace];
  return replace;
};

export default async(action, fs, actionsContext) => {
  const { files, replace } = action;

  const replacements = standardizeReplacements(replace);

  files.forEach((file) => {
    replaceInFile(file, replacements, fs, actionsContext);
  });
};
