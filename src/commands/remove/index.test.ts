import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mockFs from 'mock-fs';
import path from 'path';
import { remove } from '../../index.js';
import os from 'os';
import fs from 'fs';

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

describe('Test command: remove', () => {
  beforeAll(() => {
    const userConfig = {
      bluprints: {
        'test-deregister': {
          user: 'reuters-graphics',
          project: 'test-deregister',
          category: '',
        },
      },
    };

    mockFs({
      [userConfigPath]: JSON.stringify(userConfig),
    });
  });

  afterAll(() => {
    mockFs.restore();
  });

  it('Removes a bluprint', async () => {
    await remove(null, ['test-deregister']);

    const { bluprints } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(bluprints).toEqual({});
  });
});
