import chalk from 'chalk';
import mustache from 'mustache';
import type { LogAction } from './schema.js';

export default (action: LogAction, context: Record<string, any>): void => {
  const { msg } = action;

  const renderedMsg = mustache.render(msg, context);
  // Using tagged template literal for chalk
  const chalkedMsg = new Function('chalk', 'msg', 'return chalk`' + renderedMsg + '`;')(chalk, renderedMsg);
  console.log(chalkedMsg);
};
