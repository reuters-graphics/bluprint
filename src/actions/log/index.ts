import { template } from 'chalk-template';
import { renderMustache } from '../render/template';
import type { Action, ActionOptions } from '../types';

/**
 * Print a message to the console. The message is rendered as a mustache
 * template against the run context, then styled with
 * [chalk-template](https://github.com/chalk/chalk-template) tags.
 *
 * @example log('Scaffolded {green {{name}}}! Run {yellow pnpm install} next.')
 */
export const log = (message: string, options: ActionOptions = {}): Action => ({
  name: 'log',
  when: options.when,
  run: (ctx) => {
    console.log(template(renderMustache(message, ctx)));
  },
});
