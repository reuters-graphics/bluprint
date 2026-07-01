import mock from 'mock-fs';
import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { append, prepend } from './index';
import type { ActionContext } from '../types';

const CWD = process.cwd();
const ctx = (extra: Record<string, unknown> = {}): ActionContext => ({
  year: '2026',
  month: '07',
  day: '01',
  dirname: 'proj',
  ...extra,
});
const read = (p: string) => fs.readFileSync(path.join(CWD, p), 'utf-8');

describe('append action', () => {
  afterEach(() => mock.restore());

  it('appends to an existing file, inserting a separating newline', async () => {
    mock({ '.gitignore': 'node_modules' }); // no trailing newline

    await append('.gitignore', 'dist\n').run(ctx());

    expect(read('.gitignore')).toBe('node_modules\ndist\n');
  });

  it('does not double the newline when the file already ends with one', async () => {
    mock({ '.gitignore': 'node_modules\n' });

    await append('.gitignore', 'dist\n').run(ctx());

    expect(read('.gitignore')).toBe('node_modules\ndist\n');
  });

  it('creates the file (and parent dirs) when missing', async () => {
    mock({});

    await append('config/.env', 'KEY=1\n').run(ctx());

    expect(read('config/.env')).toBe('KEY=1\n');
  });

  it('templates the content against context', async () => {
    mock({});

    await append('.env', 'PROJECT={{name}}\n').run(ctx({ name: 'app' }));

    expect(read('.env')).toBe('PROJECT=app\n');
  });
});

describe('prepend action', () => {
  afterEach(() => mock.restore());

  it('prepends to an existing file, inserting a separating newline', async () => {
    mock({ 'src/index.ts': 'export {}' });

    await prepend('src/index.ts', '// header').run(ctx());

    expect(read('src/index.ts')).toBe('// header\nexport {}');
  });

  it('creates the file when missing', async () => {
    mock({});

    await prepend('notes.md', '# Notes\n').run(ctx());

    expect(read('notes.md')).toBe('# Notes\n');
  });

  it('templates the content against context', async () => {
    mock({ 'index.ts': 'code' });

    await prepend('index.ts', '// {{name}}\n').run(ctx({ name: 'app' }));

    expect(read('index.ts')).toBe('// app\ncode');
  });
});
