/**
 * Runtime settings for a single CLI invocation.
 *
 * Backed by a `process.env` flag rather than a module-level variable on purpose:
 * the CLI (`dist/cli.js`) and the library (`dist/index.js`) are separate bundles,
 * and a fetched bluprint config is loaded — via jiti — against `dist/index.js`.
 * So the `prompt`/`execute` actions run from a *different* module graph than the
 * `start` command that sets the mode. An env flag is process-global and crosses
 * that boundary; a plain singleton would not.
 */
const NON_INTERACTIVE = 'BLUPRINT_NON_INTERACTIVE';

export const runtime = {
  /**
   * Whether a human is driving the run. When `false` (CI / piped / `--ci`),
   * actions must not open interactive prompts and the runner fails fast.
   */
  get interactive(): boolean {
    return process.env[NON_INTERACTIVE] !== '1';
  },
  set interactive(value: boolean) {
    if (value) delete process.env[NON_INTERACTIVE];
    else process.env[NON_INTERACTIVE] = '1';
  },
};

/**
 * Resolve interactive mode from an explicit flag and the environment. A run is
 * non-interactive when `--ci` is passed, stdin isn't a TTY, or `CI` is set.
 *
 * @param ci Value of the `--ci` flag (if provided).
 */
export const isInteractive = (ci?: boolean): boolean => {
  if (ci) return false;
  if (process.env.CI) return false;
  return process.stdin.isTTY === true;
};
