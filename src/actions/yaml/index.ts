import fs from 'node:fs';
import path from 'node:path';
import { parse, stringify } from 'yaml';
import type { Action, ActionContext, ActionOptions, Awaitable } from '../types';

/**
 * Edit a YAML file (the structured-edit analog of {@link json}). The editor
 * receives the parsed data and the run context and **must return** the data to
 * write, which overwrites the file.
 *
 * Note: parsing to plain data and re-stringifying **drops comments and
 * formatting** in the file — use this for generated/config YAML you own, not
 * hand-curated files where comments matter.
 *
 * @example
 * yaml('.github/workflows/ci.yml', (wf, ctx) => { wf.name = ctx.name; return wf; })
 */
export const yaml = <T = Record<string, unknown>>(
  file: string,
  editor: (data: T, ctx: ActionContext) => Awaitable<T>,
  options: ActionOptions = {}
): Action => ({
  name: 'yaml',
  when: options.when,
  failOnError: options.failOnError,
  run: async (ctx) => {
    const filePath = path.join(process.cwd(), file);
    const data = parse(fs.readFileSync(filePath, 'utf-8')) as T;
    const output = await editor(data, ctx);
    fs.writeFileSync(filePath, stringify(output));
  },
});
