import ejs from 'ejs';
import ejsUtils from './utils/ejs';
import mustache from 'mustache';
import mustacheUtils from './utils/mustache';
import path from 'path';
import prompts from 'prompts';

const renderMustache = (string, context) => mustache.render(string, context);

const renderEjs = (string, context) => ejs.render(string, context);

const ask = async(questions, inject = null) => {
  if (inject) prompts.inject(inject);
  return prompts(questions);
};

const renderFile = (file, engine, context, fs) => {
  const filePath = path.join(process.cwd(), file);
  const fileString = fs.readFileSync(filePath, 'utf-8');

  let rendered = fileString;

  if (engine === 'mustache') {
    rendered = renderMustache(fileString, Object.assign({}, mustacheUtils, context));
  } else if (engine === 'ejs') {
    rendered = renderEjs(fileString, Object.assign({}, ejsUtils, context));
  }

  fs.writeFileSync(filePath, rendered);
};

export default async(action, fs, actionsContext) => {
  const { engine, files, context, questions, inject } = action;

  let answers = {};

  if (questions) {
    answers = await ask(questions, inject);
  }

  const localContext = Object.assign({}, actionsContext, context, answers);

  files.forEach((file) => {
    renderFile(file, engine, localContext, fs);
  });
};
