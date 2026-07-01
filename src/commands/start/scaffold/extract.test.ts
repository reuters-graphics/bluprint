import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type { Readable } from 'node:stream';
import { create } from 'tar';
import { extractTarball } from './extract';

// Real-fs integration: tar + fs don't play well under mock-fs, so we build a
// real fixture tarball and extract it into an isolated temp cwd.
let fixtureRoot: string;
let outDir: string;
let originalCwd: string;

beforeEach(() => {
  originalCwd = process.cwd();
  fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-fixture-'));
  // Mimic a GitHub tarball: everything nested under a single repo-<sha>/ root.
  const repo = path.join(fixtureRoot, 'repo-abc123');
  fs.mkdirSync(path.join(repo, 'src'), { recursive: true });
  fs.writeFileSync(path.join(repo, 'bluprint.config.ts'), 'export default {}');
  fs.writeFileSync(path.join(repo, 'README.md'), '# hi');
  fs.writeFileSync(path.join(repo, 'src', 'index.ts'), 'export {}');
  fs.writeFileSync(path.join(repo, '.gitignore'), 'node_modules');
  fs.writeFileSync(path.join(repo, '.env'), 'SECRET=1');

  outDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-out-'));
  process.chdir(outDir);
});

afterEach(() => {
  process.chdir(originalCwd);
  fs.rmSync(fixtureRoot, { recursive: true, force: true });
  fs.rmSync(outDir, { recursive: true, force: true });
});

// tar's Pack is a Minipass stream — structurally compatible with a Readable at
// runtime (pipeline accepts it), but not per TS types, so cast for the test.
const tarStream = () =>
  create({ gzip: true, cwd: fixtureRoot }, [
    'repo-abc123',
  ]) as unknown as Readable;
const out = (p: string) => path.join(outDir, p);

describe('extractTarball', () => {
  it('strips the root, skips the config file, and keeps dotfiles', async () => {
    await extractTarball(tarStream(), { files: ['**/*'], ignores: [] });

    expect(fs.readFileSync(out('README.md'), 'utf8')).toBe('# hi');
    expect(fs.readFileSync(out('src/index.ts'), 'utf8')).toBe('export {}');
    expect(fs.existsSync(out('.gitignore'))).toBe(true); // dotfile kept
    expect(fs.existsSync(out('bluprint.config.ts'))).toBe(false); // config excluded
  });

  it('applies the ignores denylist', async () => {
    await extractTarball(tarStream(), { files: ['**/*'], ignores: ['.env'] });

    expect(fs.existsSync(out('.env'))).toBe(false);
    expect(fs.existsSync(out('README.md'))).toBe(true);
  });

  it('applies the files allowlist', async () => {
    await extractTarball(tarStream(), { files: ['src/**'], ignores: [] });

    expect(fs.existsSync(out('src/index.ts'))).toBe(true);
    expect(fs.existsSync(out('README.md'))).toBe(false);
  });
});
