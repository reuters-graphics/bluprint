import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync, execSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

/**
 * End-to-end test against the real, public bluprint at
 * `reuters-graphics/test-bluprint-v1`. Unlike the rest of the suite this hits
 * the network (GitHub raw + codeload) and runs the *built* CLI, so it needs an
 * internet connection and `dist/` (built in `beforeAll` if missing).
 *
 * The fixture uses a `run` action (not a `prompt`) for its project name, so the
 * whole `start` flow runs non-interactively.
 */

const REPO = 'reuters-graphics/test-bluprint-v1';
const repoRoot = path.resolve(import.meta.dirname, '../..');
const cliPath = path.join(repoRoot, 'dist', 'cli.js');

/** Run the built CLI in `cwd`, returning combined output; throws on non-zero exit. */
const runCli = (args: string[], cwd: string): string => {
  try {
    return execFileSync('node', [cliPath, ...args], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: 60_000,
    });
  } catch (error) {
    const e = error as { stdout?: string; stderr?: string; message: string };
    throw new Error(
      `CLI \`${args.join(' ')}\` failed:\n${e.stdout ?? ''}\n${e.stderr ?? ''}\n${e.message}`
    );
  }
};

const tmpDir = (): string =>
  fs.mkdtempSync(path.join(os.tmpdir(), 'bluprint-e2e-'));
const exists = (dir: string, p: string): boolean =>
  fs.existsSync(path.join(dir, p));
const read = (dir: string, p: string): string =>
  fs.readFileSync(path.join(dir, p), 'utf-8');

describe('e2e: scaffolding from a real bluprint repo', () => {
  beforeAll(() => {
    // The CLI runtime (and config-import resolution) test the built artifact.
    if (!fs.existsSync(cliPath)) {
      execSync('pnpm build', {
        cwd: repoRoot,
        stdio: 'inherit',
        timeout: 180_000,
      });
    }
  }, 180_000);

  it('start: fetches, scaffolds, and runs all actions', () => {
    const dir = tmpDir();
    runCli(['start', REPO], dir);

    // render — README templated with the run-supplied name + date/dirname.
    const readme = read(dir, 'README.md');
    expect(readme).toContain('# My Project');
    expect(readme).not.toContain('{{'); // nothing left un-rendered
    expect(readme).toMatch(/\d{4}-\d{2}-\d{2}/);

    // copy — templated destination (slugified project name).
    expect(exists(dir, 'src/my-project.js')).toBe(true);
    expect(exists(dir, 'src/index.js')).toBe(true); // plain file shipped as-is

    // move — gitignore -> .gitignore.
    expect(exists(dir, '.gitignore')).toBe(true);
    expect(exists(dir, 'gitignore')).toBe(false);

    // remove — throwaway file + consumed templates dir.
    expect(exists(dir, 'DELETE_ME.md')).toBe(false);
    expect(exists(dir, 'templates')).toBe(false);

    // execute — `git init` created a repo.
    expect(exists(dir, '.git')).toBe(true);

    // excludeConfig + ignores — none of the authoring files scaffolded.
    expect(exists(dir, 'bluprint.config.ts')).toBe(false);
    expect(exists(dir, 'package.json')).toBe(false);
    expect(exists(dir, 'tsconfig.json')).toBe(false);
  }, 90_000);

  it('clone: copies the repo verbatim and runs no actions', () => {
    const dir = tmpDir();
    runCli(['clone', REPO], dir);

    // The config and authoring files are kept.
    expect(exists(dir, 'bluprint.config.ts')).toBe(true);
    expect(exists(dir, 'package.json')).toBe(true);
    expect(exists(dir, 'templates/component.js')).toBe(true);
    expect(exists(dir, 'DELETE_ME.md')).toBe(true);

    // No actions ran: README is still a raw template, no move/execute.
    expect(read(dir, 'README.md')).toContain('{{ projectName }}');
    expect(exists(dir, 'gitignore')).toBe(true); // not moved
    expect(exists(dir, '.git')).toBe(false); // no git init
  }, 90_000);
});
