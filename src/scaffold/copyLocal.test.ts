import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { copyLocal } from './copyLocal';

// Real temp fixtures: git + a recursive fs walk don't mix with mock-fs.
let src: string;
let out: string;
let originalCwd: string;

const write = (dir: string, rel: string, content = 'x') => {
  const abs = path.join(dir, rel);
  fs.mkdirSync(path.dirname(abs), { recursive: true });
  fs.writeFileSync(abs, content);
};
const git = (args: string[]) =>
  execFileSync('git', args, { cwd: src, stdio: 'ignore' });
const has = (rel: string) => fs.existsSync(path.join(out, rel));

beforeEach(() => {
  originalCwd = process.cwd();
  src = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-copy-src-'));
  out = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-copy-out-'));
  process.chdir(out);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(src, { recursive: true, force: true });
  fs.rmSync(out, { recursive: true, force: true });
});

describe('copyLocal (git repo)', () => {
  it('copies tracked + new-untracked files, skips gitignored + config', () => {
    write(src, 'bluprint.config.ts', 'export default {}');
    write(src, 'README.md', '# hi');
    write(src, 'src/index.ts', 'export {}');
    write(src, '.gitignore', 'dist/\nsecret.env\n');
    git(['init']);
    git(['add', '.']);
    git([
      '-c',
      'user.email=t@t.co',
      '-c',
      'user.name=Test',
      'commit',
      '-m',
      'init',
    ]);

    // After the commit: a new untracked template file, plus ignored files.
    write(src, 'src/new.ts', 'export const n = 1'); // untracked, not ignored
    write(src, 'dist/bundle.js', 'built'); // gitignored dir
    write(src, 'secret.env', 'SECRET=1'); // gitignored file

    copyLocal(src, { files: ['**/*'], ignores: [] });

    expect(has('README.md')).toBe(true);
    expect(has('src/index.ts')).toBe(true);
    expect(has('src/new.ts')).toBe(true); // uncommitted-new is included
    expect(has('.gitignore')).toBe(true);
    expect(has('dist/bundle.js')).toBe(false); // gitignored
    expect(has('secret.env')).toBe(false); // gitignored
    expect(has('bluprint.config.ts')).toBe(false); // excludeConfig default
  });

  it('layers the config files/ignores on top of git', () => {
    write(src, 'bluprint.config.ts', 'x');
    write(src, 'a.md', 'a');
    write(src, 'src/b.ts', 'b');
    git(['init']);
    git(['add', '.']);
    git([
      '-c',
      'user.email=t@t.co',
      '-c',
      'user.name=Test',
      'commit',
      '-m',
      'init',
    ]);

    copyLocal(src, { files: ['src/**'], ignores: [] });

    expect(has('src/b.ts')).toBe(true);
    expect(has('a.md')).toBe(false);
  });
});

describe('copyLocal (non-repo fallback)', () => {
  it('walks the dir and skips node_modules', () => {
    write(src, 'index.ts', 'x');
    write(src, 'nested/keep.ts', 'y');
    write(src, 'node_modules/pkg/index.js', 'dep');
    // no `git init` → not a repo → fallback walk

    copyLocal(src, { files: ['**/*'], ignores: [] });

    expect(has('index.ts')).toBe(true);
    expect(has('nested/keep.ts')).toBe(true);
    expect(has('node_modules/pkg/index.js')).toBe(false);
  });
});
