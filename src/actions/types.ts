export type Awaitable<T> = T | Promise<T>;

/**
 * Context values every action receives, available to templates and `when`.
 *
 * Declared as a type alias (not an interface) so it carries an implicit index
 * signature and composes into {@link ActionContext}.
 */
export type DefaultContext = {
  /** Full year, e.g. "2026". */
  year: string;
  /** Zero-padded month, e.g. "07". */
  month: string;
  /** Zero-padded day of month, e.g. "01". */
  day: string;
  /** Basename of the directory bluprint is running in. */
  dirname: string;
  /** The selected bluprint part, if the run scaffolded one. */
  bluprintPart?: string;
};

/**
 * The context threaded through a run of actions. Starts as {@link DefaultContext}
 * and is extended as actions (e.g. `prompt`) contribute values.
 */
export type ActionContext = DefaultContext & Record<string, unknown>;

/** Options common to every action factory. */
export interface ActionOptions {
  /**
   * Gate the action on the current context. Return `false` to skip it.
   * @example when: (ctx) => ctx.useTypeScript === true
   */
  when?: (ctx: ActionContext) => boolean;
}

/**
 * A unit of work run against a scaffolded project. Actions are created by the
 * exported factory functions (`copy`, `render`, `prompt`, …), not constructed
 * directly.
 */
export interface Action {
  /** Label used in logging (e.g. "copy"). */
  readonly name: string;
  /** Optional gate; when it returns `false` the runner skips this action. */
  when?: (ctx: ActionContext) => boolean;
  /**
   * Perform the work. May return a partial context to merge into the run's
   * context for subsequent actions.
   */
  run(ctx: ActionContext): Awaitable<void | Partial<ActionContext>>;
}
