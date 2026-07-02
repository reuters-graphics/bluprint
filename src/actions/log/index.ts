import { template } from 'chalk-template';
import { renderMustache } from '../render/template';
import type {
  Action,
  ActionContext,
  ActionOptions,
  DefaultContext,
} from '../types';

/**
 * Print a message to the console. The message is rendered as a mustache
 * template against the run context, then styled with
 * [chalk-template](https://github.com/chalk/chalk-template) tags.
 *
 * @example log('Scaffolded {green {{name}}}! Run {yellow pnpm install} next.')
 */
export const log = <Ctx extends DefaultContext = ActionContext>(
  message: string,
  options: ActionOptions<Ctx> = {}
): Action<Ctx> => ({
  name: 'log',
  when: options.when,
  failOnError: options.failOnError,
  run: (ctx) => {
    console.log(template(renderMustache(message, ctx)));
  },
});
