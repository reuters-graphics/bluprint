import ejs from 'ejs';
import ejsUtils from './utils/ejs.js';
import fs from 'fs';
import mustache from 'mustache';
import mustacheUtils from './utils/mustache.js';
import path from 'path';
import prompts from 'prompts';
import type { RenderAction } from './schema.js';

const renderMustache = (string: string, context: Record<string, any>): string =>
  mustache.render(string, context);

const renderEjs = (string: string, context: Record<string, any>): string =>
  ejs.render(string, context);

const ask = async (questions: any[], inject: any[] | null = null): Promise<Record<string, any>> => {
  if (inject) prompts.inject(inject);
  return prompts(questions);
};

const renderFile = (file: string, engine: 'mustache' | 'ejs', context: Record<string, any>): void => {
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

export default async (action: RenderAction, actionsContext: Record<string, any>): Promise<void> => {
  const { engine, files, context, questions, inject } = action;

  let answers: Record<string, any> = {};

  if (questions) {
    answers = await ask(questions, inject);
  }

  const localContext = Object.assign({}, actionsContext, context, answers);

  files.forEach((file: string) => {
    renderFile(file, engine, localContext);
  });
};
