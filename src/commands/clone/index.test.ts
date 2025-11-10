import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mockFs from 'mock-fs';
import path from 'path';
import { clone } from '../../index.js';
import fs from 'fs';

const resolvePath = (filePath: string) => path.join(process.cwd(), filePath);

describe('Test command: clone', () => {
  beforeEach(() => {
    mockFs({});
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('Clones a repo', async () => {
    await clone('reuters-graphics/test-bluprint');

    expect(fs.existsSync(resolvePath('.bluprintrc'))).toBe(true);
    expect(fs.existsSync(resolvePath('moveme/docs.md'))).toBe(true);
  });
});
