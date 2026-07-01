import mock from 'mock-fs';
import { describe, it, expect, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

vi.mock('../../prompts', () => ({ text: vi.fn() }));
vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), success: vi.fn() },
}));

import { newBluprint } from './index';
import * as prompts from '../../prompts';
import { log } from '@clack/prompts';

const CWD = process.cwd();
const read = () =>
  fs.readFileSync(path.join(CWD, 'bluprint.config.ts'), 'utf-8');

describe('newBluprint', () => {
  afterEach(() => {
    mock.restore();
    vi.clearAllMocks();
  });

  it('writes a starter config using the given name', async () => {
    mock({});

    await newBluprint('My Kit');

    const contents = read();
    expect(contents).toContain(
      "import { defineConfig } from '@reuters-graphics/bluprint'"
    );
    expect(contents).toContain('name: "My Kit"');
    expect(prompts.text).not.toHaveBeenCalled();
    expect(log.success).toHaveBeenCalledOnce();
  });

  it('prompts for a name when none is given', async () => {
    mock({});
    vi.mocked(prompts.text).mockResolvedValue('Prompted Kit');

    await newBluprint();

    expect(prompts.text).toHaveBeenCalledOnce();
    expect(read()).toContain('name: "Prompted Kit"');
  });

  it('refuses when a config file already exists', async () => {
    mock({ 'bluprint.config.ts': 'export default {}' });

    await newBluprint('X');

    expect(log.info).toHaveBeenCalledOnce();
    expect(log.success).not.toHaveBeenCalled();
    // untouched
    expect(read()).toBe('export default {}');
  });
});
