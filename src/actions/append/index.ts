import fs from 'node:fs';
import path from 'node:path';
import { renderMustache } from '../render/template';
import type { Action, ActionOptions } from '../types';

const readIfExists = (filePath: string): string =>
  fs.existsSync(filePath) ? fs.readFileSync(filePath, 'utf-8') : '';

/**
 * Append (templated) content to the end of a file, creating it if it doesn't
 * exist. A newline is inserted first if the existing content doesn't already
 * end with one, so lines never run together.
 *
 * @example append('.gitignore', 'dist\n.env\n')
 */
export const append = (
  file: string,
  content: string,
  options: ActionOptions = {}
): Action => ({
  name: 'append',
  when: options.when,
  failOnError: options.failOnError,
  run: (ctx) => {
    const filePath = path.join(process.cwd(), file);
    const rendered = renderMustache(content, ctx);
    const existing = readIfExists(filePath);
    const separator = existing && !existing.endsWith('\n') ? '\n' : '';
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, existing + separator + rendered);
  },
});

/**
 * Prepend (templated) content to the start of a file, creating it if it doesn't
 * exist. A newline is inserted between the new content and existing content if
 * the new content doesn't already end with one.
 *
 * @example prepend('src/index.ts', '// @generated for {{name}}\n')
 */
export const prepend = (
  file: string,
  content: string,
  options: ActionOptions = {}
): Action => ({
  name: 'prepend',
  when: options.when,
  failOnError: options.failOnError,
  run: (ctx) => {
    const filePath = path.join(process.cwd(), file);
    const rendered = renderMustache(content, ctx);
    const existing = readIfExists(filePath);
    const separator = existing && !rendered.endsWith('\n') ? '\n' : '';
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, rendered + separator + existing);
  },
});
