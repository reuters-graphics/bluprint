import * as v from 'valibot';
import chalk from 'chalk';
import copy from './copy/index.js';
import { get } from 'es-toolkit/compat';
import execute from './execute/index.js';
import getDefaultContext from '../utils/getDefaultContext.js';
import getLogger from '../utils/getLogger.js';
import log from './log/index.js';
import move from './move/index.js';
import prompt from './prompt/index.js';
import regexreplace from './regexreplace/index.js';
import remove from './remove/index.js';
import render from './render/index.js';
import schema from './schema.js';
import type { Condition, ConditionTuple } from './common/condition.js';

const logger = getLogger();

type ActionContext = Record<string, any>;
type UpdateContext = (newContext: ActionContext) => void;

const routeAction = async (
  action: any,
  context: ActionContext,
  updateContext: UpdateContext
): Promise<void> => {
  switch (action.action) {
    case 'execute':
      return execute(action);
    case 'copy':
      return copy(action, context);
    case 'log':
      return log(action, context);
    case 'move':
      return move(action, context);
    case 'prompt':
      return prompt(action, updateContext);
    case 'remove':
      return remove(action);
    case 'render':
      return render(action, context);
    case 'regexreplace':
      return regexreplace(action, context);
    default:
  }
};

const standardizeCondition = (condition?: Condition): ConditionTuple[] => {
  if (!condition) return [];
  if (Array.isArray(condition[0])) return condition as ConditionTuple[];
  return [condition as ConditionTuple];
};

export default async (actions: any[], bluprintPart?: string): Promise<ActionContext> => {
  try {
    v.parse(schema, actions);
  } catch (error) {
    logger.error('Invalid actions.');
    if (error instanceof v.ValiError) {
      console.error(error.issues);
    }
    return {};
  }

  let context: ActionContext = { bluprintPart, ...getDefaultContext() };

  const updateContext: UpdateContext = (newContext) => {
    context = Object.assign({}, context, newContext);
  };

  for (const i in actions) {
    const action = actions[i];

    const { condition } = action;
    const conditions = standardizeCondition(condition);
    const tests = conditions.map((condition) =>
      // If the context var is not found, we'll evaluate to true
      get(context, condition[0], condition[1]) === condition[1]);
    // Skip the action if a condition was not met.
    if (!tests.every(a => a === true)) continue;

    try {
      await routeAction(action, context, updateContext);
    } catch (e) {
      const errorMsg = e instanceof Error ? e.message : String(e);
      logger.warn(chalk`Skipping {green.underline ${action.action}} action with error:\n\n${errorMsg}`);
    }
  }

  return context;
};
