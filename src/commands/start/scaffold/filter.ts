import path from 'node:path';
import { minimatch } from 'minimatch';

/** The bluprint's config file, never scaffolded into the target project. */
const CONFIG_FILE = 'bluprint.config.ts';

/**
 * Strip the leading path segment. GitHub tarballs wrap everything in a single
 * `repo-<sha>/` root directory; this removes it so paths are project-relative.
 */
export const deRoot = (filePath: string): string => {
  const parts = filePath.split(path.sep);
  parts.shift();
  return parts.join(path.sep);
};

/** Normalize a `string | string[]` glob option to an array. */
export const normalizeGlobs = (globs: string | string[]): string[] =>
  Array.isArray(globs) ? globs : [globs];

// `dot: true` so `**/*` / `*` match dotfiles — bluprints routinely ship
// `.gitignore`, `.env`, `.github/`, etc. that must be scaffolded.
const matchesAny = (filePath: string, globs: string[]): boolean =>
  globs.some((glob) => minimatch(filePath, glob, { dot: true }));

/**
 * Decide whether a project-relative path should be scaffolded: never the config
 * file, must match a `files` glob (an empty `files` list matches everything),
 * and must not match any `ignores` glob.
 */
export const shouldInclude = (
  filePath: string,
  files: string[],
  ignores: string[]
): boolean => {
  if (filePath === CONFIG_FILE) return false;
  const included = files.length === 0 || matchesAny(filePath, files);
  return included && !matchesAny(filePath, ignores);
};
