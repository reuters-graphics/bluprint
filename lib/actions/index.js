const Ajv = require('ajv');
const schema = require('./schema');
const defaultFs = require('fs');
const chalk = require('chalk');
const logger = require('../utils/getLogger')();

const execute = require('./execute');
const log = require('./log');
const move = require('./move');
const prompt = require('./prompt');
const remove = require('./remove');
const render = require('./render');

const routeAction = async(action, context, updateContext, fs) => {
  switch (action.action) {
    case 'execute':
      await execute(action);
      break;
    case 'log':
      await log(action, context);
      break;
    case 'move':
      await move(action, fs);
      break;
    case 'prompt':
      await prompt(action, updateContext);
      break;
    case 'remove':
      await remove(action, fs);
      break;
    case 'render':
      await render(action, fs, context);
      break;
    default:
      break;
  }
};

module.exports = async(actions, fs = defaultFs) => {
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
