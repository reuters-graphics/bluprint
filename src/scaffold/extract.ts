import { pipeline } from 'node:stream/promises';
import type { Readable } from 'node:stream';
import { extract } from 'tar';
import { deRoot, normalizeGlobs, shouldInclude } from './filter';

export interface ScaffoldFilter {
  files: string | string[];
  ignores: string | string[];
  /** Exclude the bluprint's own `bluprint.config.ts`. Defaults to `true`. */
  excludeConfig?: boolean;
}

/**
 * Extract a repo tarball stream (node-tar auto-detects the gzip) into the
 * current working directory, keeping only the files that pass the
 * `files`/`ignores` filter. `strip: 1` drops the tarball's root `repo-<sha>/`
 * segment; the filter still de-roots each path to match globs against
 * project-relative paths.
 */
export const extractTarball = async (
  stream: Readable,
  { files, ignores, excludeConfig = true }: ScaffoldFilter
): Promise<void> => {
  const fileGlobs = normalizeGlobs(files);
  const ignoreGlobs = normalizeGlobs(ignores);

  await pipeline(
    stream,
    extract({
      cwd: process.cwd(),
      strip: 1,
      filter: (rootedPath: string) =>
        shouldInclude(
          deRoot(rootedPath),
          fileGlobs,
          ignoreGlobs,
          excludeConfig
        ),
    })
  );
};
