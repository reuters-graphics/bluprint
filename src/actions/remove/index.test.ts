import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mockFs from 'mock-fs';
import fs from 'fs';
import path from 'path';
import { handleActions } from '../../index.js';

const ROOT = process.cwd();

describe('Test action: remove', () => {
  beforeAll(() => {
    mockFs({});

    fs.mkdirSync(path.join(process.cwd(), 'remove/'), { recursive: true });

    fs.writeFileSync(
      path.join(ROOT, 'remove/script.js'),
      ''
    );
    fs.writeFileSync(
      path.join(ROOT, 'remove/index.js'),
      ''
    );
  });

  afterAll(() => {
    mockFs.restore();
  });

  it('Removes files', async () => {
    const actions = [{
      action: 'remove',
      paths: [
        'remove/*.js',
      ],
    }];

    await handleActions(actions, undefined);

    const path1 = path.join(ROOT, 'remove/script.js');
    const path2 = path.join(ROOT, 'remove/index.js');

    expect(fs.existsSync(path1)).toBe(false);
    expect(fs.existsSync(path2)).toBe(false);
  });
});
