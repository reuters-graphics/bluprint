import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mockFs from 'mock-fs';
import fs from 'fs';
import path from 'path';
import { newBluprint } from '../../index.js';

describe('Test command: new', () => {
  beforeAll(() => {
    mockFs({});
  });

  afterAll(() => {
    mockFs.restore();
  });

  it('Makes a config file', async () => {
    const filePath = path.join(process.cwd(), '.bluprintrc');

    await newBluprint(null, ['test']);

    const bluprintConfig = fs.readFileSync(filePath, 'utf-8');

    const config = JSON.parse(bluprintConfig);

    expect(config).toHaveProperty('name');
    expect(config.name).toBe('test');
  });
});
