import fs from 'node:fs';
import path from 'node:path';
import type {
  Action,
  ActionContext,
  ActionOptions,
  Awaitable,
} from '../types';

/**
 * Edit a JSON file. The editor receives the parsed data and the run context
 * (including answers from earlier `prompt` actions) and **must return** the data
 * to write, which overwrites the file pretty-printed with 2-space indentation.
 * Requiring the return keeps the write explicit — nothing is persisted by side
 * effect.
 *
 * Pass a type argument for typed editing, or rely on the loose default.
 *
 * @example
 * // targeted deep edit, using a prompt answer from context
 * json('package.json', (pkg, ctx) => { pkg.name = ctx.name; return pkg; })
 * @example
 * // merge / replace
 * json('tsconfig.json', (cfg) => ({ ...cfg, compilerOptions: { strict: true } }))
 */
export const json = <T = Record<string, unknown>>(
  file: string,
  editor: (data: T, ctx: ActionContext) => Awaitable<T>,
  options: ActionOptions = {}
): Action => ({
  name: 'json',
  when: options.when,
  failOnError: options.failOnError,
  run: async (ctx) => {
    const filePath = path.join(process.cwd(), file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8')) as T;
    const output = await editor(data, ctx);
    fs.writeFileSync(filePath, `${JSON.stringify(output, null, 2)}\n`);
  },
});
