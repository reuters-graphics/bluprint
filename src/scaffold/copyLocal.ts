import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { normalizeGlobs, shouldInclude } from './filter';
import type { ScaffoldFilter } from './extract';

const SKIP_DIRS = new Set(['.git', 'node_modules']);

const toPosix = (p: string): string => p.split(path.sep).join('/');

/**
 * Candidate files a published git tarball would contain: tracked + new-untracked,
 * minus `.gitignore`d. Returns `null` if `srcDir` isn't a git repo / git is
 * unavailable, so the caller can fall back.
 */
const listGitFiles = (srcDir: string): string[] | null => {
  try {
    const out = execFileSync(
      'git',
      ['ls-files', '--cached', '--others', '--exclude-standard'],
      { cwd: srcDir, encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'] }
    );
    return out
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return null;
  }
};

/** Fallback when `srcDir` isn't a git repo: walk it, skipping .git/node_modules. */
const walkFiles = (srcDir: string): string[] => {
  const results: string[] = [];
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      if (entry.isDirectory()) {
        if (!SKIP_DIRS.has(entry.name)) walk(path.join(dir, entry.name));
      } else if (entry.isFile()) {
        results.push(
          toPosix(path.relative(srcDir, path.join(dir, entry.name)))
        );
      }
    }
  };
  walk(srcDir);
  return results;
};

/**
 * Copy a local bluprint's files into the current working directory, honoring the
 * config `files`/`ignores` filter (and `excludeConfig`). The candidate file set
 * mirrors a published git tarball via `git ls-files` (so `.gitignore`d paths are
 * skipped while the author's uncommitted-new files are kept); falls back to a
 * recursive walk for non-repos.
 */
export const copyLocal = (
  srcDir: string,
  { files, ignores, excludeConfig = true }: ScaffoldFilter
): void => {
  const fileGlobs = normalizeGlobs(files);
  const ignoreGlobs = normalizeGlobs(ignores);
  const candidates = listGitFiles(srcDir) ?? walkFiles(srcDir);

  for (const rel of candidates) {
    if (!shouldInclude(rel, fileGlobs, ignoreGlobs, excludeConfig)) continue;
    const from = path.join(srcDir, rel);
    // A tracked-but-deleted working file can appear in git's list; skip it.
    if (!fs.existsSync(from)) continue;
    const to = path.resolve(process.cwd(), rel);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
};
