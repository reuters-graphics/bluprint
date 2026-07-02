import fs from 'node:fs';
import path from 'node:path';
import { renderWith, type RenderEngine } from './template';
import type {
  Action,
  ActionContext,
  ActionOptions,
  DefaultContext,
} from '../types';

export interface RenderOptions<Ctx extends DefaultContext = ActionContext>
  extends ActionOptions<Ctx> {
  /** Project-relative file(s) to render in place. */
  files: string | string[];
  /** Template engine to use. Defaults to `'mustache'`. */
  engine?: RenderEngine;
  /** Extra values merged into the run context for these renders. */
  context?: Record<string, unknown>;
}

/**
 * Render template files in place against the run context (plus any extra
 * `context`). Prompt for values with separate `prompt` actions earlier in the
 * list — they contribute to the context these templates see.
 *
 * @example render({ files: ['README.md', 'package.json'], engine: 'mustache' })
 */
export const render = <Ctx extends DefaultContext = ActionContext>(
  options: RenderOptions<Ctx>
): Action<Ctx> => {
  const {
    files,
    engine = 'mustache',
    context: extra = {},
    when,
    failOnError,
  } = options;
  const fileList = Array.isArray(files) ? files : [files];

  return {
    name: 'render',
    when,
    failOnError,
    run: (ctx) => {
      const localContext: Record<string, unknown> = { ...ctx, ...extra };
      for (const file of fileList) {
        const filePath = path.join(process.cwd(), file);
        const contents = fs.readFileSync(filePath, 'utf-8');
        fs.writeFileSync(filePath, renderWith(engine, contents, localContext));
      }
    },
  };
};
