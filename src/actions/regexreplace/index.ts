import fs from 'node:fs';
import path from 'node:path';
import chalk from 'chalk-template';
import { log } from '@clack/prompts';
import { renderMustache } from '../render/template';
import type { Action, ActionContext, ActionOptions } from '../types';

/** `[pattern, replacement]` or `[pattern, replacement, flags]` (default flags `'gm'`). */
export type Replacement =
  | [pattern: string, replacement: string]
  | [pattern: string, replacement: string, flags: string];

export interface RegexReplaceOptions extends ActionOptions {
  /** Project-relative file(s) to run replacements in. */
  files: string | string[];
  /** A single replacement or an array of them. */
  replace: Replacement | Replacement[];
}

const applyReplacement = (
  contents: string,
  [pattern, replacement, flags]: Replacement,
  context: ActionContext
): string =>
  contents.replace(
    new RegExp(pattern, flags ?? 'gm'),
    renderMustache(replacement, context)
  );

const normalizeReplacements = (
  replace: Replacement | Replacement[]
): Replacement[] =>
  typeof replace[0] === 'string' ?
    [replace as Replacement]
  : (replace as Replacement[]);

/**
 * Replace content in file(s) with regular expressions. Replacement strings are
 * rendered as mustache templates against the run context.
 *
 * @example regexreplace({ files: ['README.md'], replace: ['^# .*', '# {{title}}'] })
 */
export const regexreplace = (options: RegexReplaceOptions): Action => {
  const { files, replace, when } = options;
  const fileList = Array.isArray(files) ? files : [files];
  const replacements = normalizeReplacements(replace);

  return {
    name: 'regexreplace',
    when,
    run: (ctx) => {
      for (const file of fileList) {
        const filePath = path.join(process.cwd(), file);
        if (!fs.existsSync(filePath)) {
          log.warn(
            chalk`Unable to find {green.underline ${file}} in regexreplace action. Skipping.`
          );
          continue;
        }
        let contents = fs.readFileSync(filePath, 'utf-8');
        for (const replacement of replacements) {
          contents = applyReplacement(contents, replacement, ctx);
        }
        fs.writeFileSync(filePath, contents);
      }
    },
  };
};
