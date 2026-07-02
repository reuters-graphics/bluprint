import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { render } from '../../actions';

// Integration: only mock `config` (to inject a module without jiti) and clack
// `log` (to silence output). copyLocal, runActions, and the render action all
// run for real, so this proves actions transform the copied files in the temp
// directory.
vi.mock('../../config', () => ({
  config: { load: vi.fn(), module: undefined },
}));
vi.mock('@clack/prompts', () => ({
  log: { error: vi.fn(), success: vi.fn(), warn: vi.fn(), info: vi.fn() },
}));

import { preview } from './index';
import { config } from '../../config';

// 'Preview Integration' slugifies to this.
const outDir = path.join(os.tmpdir(), 'bluprint', 'preview-integration');
let srcDir: string;

beforeEach(() => {
  srcDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bp-preview-int-'));
  // Config file must exist (preview checks for it); content is irrelevant since
  // config.load is mocked and we inject config.module directly.
  fs.writeFileSync(
    path.join(srcDir, 'bluprint.config.ts'),
    'export default {}'
  );
  fs.writeFileSync(path.join(srcDir, 'README.md'), '# {{title}}');

  (config as unknown as { module: unknown }).module = {
    name: 'Preview Integration',
    files: ['**/*'],
    ignores: [],
    actions: [
      render({ files: ['README.md'], context: { title: 'Rendered!' } }),
    ],
  };
});

afterEach(() => {
  fs.rmSync(srcDir, { recursive: true, force: true });
  fs.rmSync(outDir, { recursive: true, force: true });
  vi.clearAllMocks();
});

describe('preview (integration)', () => {
  it('runs the config actions against the copied files in the temp dir', async () => {
    await preview(srcDir);

    // The template was copied in AND rendered by the action.
    expect(fs.readFileSync(path.join(outDir, 'README.md'), 'utf-8')).toBe(
      '# Rendered!'
    );
    // The bluprint config itself was not scaffolded.
    expect(fs.existsSync(path.join(outDir, 'bluprint.config.ts'))).toBe(false);
  });
});
