import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mockFs from 'mock-fs';
import path from 'path';
import { add } from '../../index.js';
import os from 'os';
import fs from 'fs';

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

describe('Test command: add', () => {
  beforeAll(() => {
    mockFs({
      [userConfigPath]: '{}',
    });
  });

  afterAll(() => {
    mockFs.restore();
  });

  it('Adds a new bluprint', async () => {
    await add(null, ['reuters-graphics/test-bluprint']);

    const { bluprints } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(bluprints['test bluprint'].user).toBe('reuters-graphics');
    expect(bluprints['test bluprint'].project).toBe('test-bluprint');
  });
});
