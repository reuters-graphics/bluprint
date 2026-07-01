import { describe, it, expect } from 'vitest';
import { deRoot, normalizeGlobs, shouldInclude } from './filter';

describe('deRoot', () => {
  it('strips the leading path segment', () => {
    expect(deRoot('repo-abc123/README.md')).toBe('README.md');
    expect(deRoot('repo-abc123/src/index.ts')).toBe('src/index.ts');
  });
});

describe('normalizeGlobs', () => {
  it('wraps a single string', () => {
    expect(normalizeGlobs('**/*')).toEqual(['**/*']);
  });
  it('passes an array through', () => {
    expect(normalizeGlobs(['a', 'b'])).toEqual(['a', 'b']);
  });
});

describe('shouldInclude', () => {
  it('never includes the bluprint config file', () => {
    expect(shouldInclude('bluprint.config.ts', ['**/*'], [])).toBe(false);
  });

  it('includes everything when files is empty', () => {
    expect(shouldInclude('anything.ts', [], [])).toBe(true);
  });

  it('respects the files allowlist', () => {
    expect(shouldInclude('src/index.ts', ['src/**'], [])).toBe(true);
    expect(shouldInclude('README.md', ['src/**'], [])).toBe(false);
  });

  it('respects the ignores denylist', () => {
    expect(shouldInclude('secret.env', ['**/*'], ['*.env'])).toBe(false);
    expect(shouldInclude('keep.ts', ['**/*'], ['*.env'])).toBe(true);
  });

  it('matches dotfiles (dot: true)', () => {
    expect(shouldInclude('.gitignore', ['**/*'], [])).toBe(true);
    expect(shouldInclude('.github/ci.yml', ['**/*'], [])).toBe(true);
  });

  it('ignores win over includes', () => {
    expect(shouldInclude('dist/app.js', ['**/*'], ['dist/**'])).toBe(false);
  });
});
