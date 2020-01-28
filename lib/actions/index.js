import Ajv from 'ajv';
import chalk from 'chalk';
import defaultFs from 'fs';
import execute from './execute';
import getLogger from '../utils/getLogger';
import log from './log';
import move from './move';
import prompt from './prompt';
import regexreplace from './regexreplace';
import remove from './remove';
import render from './render';
import schema from './schema';

const logger = getLogger();

const routeAction = async(action, context, updateContext, fs) => {
  switch (action.action) {
    case 'execute':
      return execute(action);
    case 'log':
      return log(action, context);
    case 'move':
      return move(action, fs, context);
    case 'prompt':
      return prompt(action, updateContext);
    case 'remove':
      return remove(action, fs);
    case 'render':
      return render(action, fs, context);
    case 'regexreplace':
      return regexreplace(action, fs, context);
    default:
  }
};

export default async(actions, fs = defaultFs) => {
  const ajv = new Ajv({ allErrors: true, verbose: true });

  const valid = ajv.validate(schema, actions);
  if (!valid) {
    logger.error('Invalid actions.');
    return;
  }

  let context = {};

  const updateContext = (newContext) => {
    context = Object.assign({}, context, newContext);
  };

  for (const i in actions) {
    const action = actions[i];
    try {
      await routeAction(action, context, updateContext, fs);
    } catch (e) {
      logger.warn(chalk`Skipping {green.underline ${action.action}} action with error:\n\n${e}`);
    }
  }

  return context;
};
