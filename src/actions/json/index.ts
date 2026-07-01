import fs from 'node:fs';
import path from 'node:path';
import type {
  Action,
  ActionContext,
  ActionOptions,
  Awaitable,
} from '../types';

/**
 * Edit a JSON file in place. The editor receives the parsed data and the run
 * context (including answers from earlier `prompt` actions) and can either
 * mutate the data directly or return a new value; the (returned or mutated)
 * result is written back, pretty-printed with 2-space indentation.
 *
 * Pass a type argument for typed editing, or rely on the loose default.
 *
 * @example
 * // targeted deep edit (mutate in place), using a prompt answer from context
 * json('package.json', (pkg, ctx) => { pkg.name = ctx.name; })
 * @example
 * // merge / replace (return a new value)
 * json('tsconfig.json', (cfg) => ({ ...cfg, compilerOptions: { strict: true } }))
 */
export const json = <T = Record<string, unknown>>(
  file: string,
  editor: (data: T, ctx: ActionContext) => Awaitable<T | void>,
  options: ActionOptions = {}
): Action => ({
  name: 'json',
  when: options.when,
  failOnError: options.failOnError,
  run: async (ctx) => {
    const filePath = path.join(process.cwd(), file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
    // Support both styles: mutate `data` in place (return nothing) or return a
    // new value that overwrites it.
    const result = await editor(data, ctx);
    const output = result === undefined ? data : result;
    fs.writeFileSync(filePath, `${JSON.stringify(output, null, 2)}\n`);
  },
});
