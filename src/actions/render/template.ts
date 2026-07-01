import ejs from 'ejs';
import mustache from 'mustache';
import ejsUtils from './utils/ejs';
import mustacheUtils from './utils/mustache';

export type RenderEngine = 'mustache' | 'ejs';

/** Render a template string with mustache, mixing in the mustache helpers. */
export const renderMustache = (
  template: string,
  context: Record<string, unknown>
): string => mustache.render(template, { ...mustacheUtils, ...context });

/** Render a template string with EJS, mixing in the EJS helpers. */
export const renderEjs = (
  template: string,
  context: Record<string, unknown>
): string => ejs.render(template, { ...ejsUtils, ...context });

/** Render a template string with the given engine. */
export const renderWith = (
  engine: RenderEngine,
  template: string,
  context: Record<string, unknown>
): string =>
  engine === 'ejs' ?
    renderEjs(template, context)
  : renderMustache(template, context);
