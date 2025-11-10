import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mockFs from 'mock-fs';
import fs from 'fs';
import path from 'path';
import { handleActions } from '../../index.js';

const ROOT = process.cwd();

describe('Test action: copy', () => {
  beforeAll(() => {
    mockFs({});

    fs.mkdirSync(path.join(ROOT, 'oldDir/subfolder'), { recursive: true });

    fs.mkdirSync(path.join(ROOT, 'oldEmptyDir'), { recursive: true });

    fs.writeFileSync(
      path.join(ROOT, 'copy.js'),
      'console.log(\'hello world\');'
    );
    fs.writeFileSync(
      path.join(ROOT, 'oldDir/copy.js'),
      'console.log(\'hello world\');'
    );
    fs.writeFileSync(
      path.join(ROOT, 'oldDir/subfolder/copy.js'),
      'console.log(\'hello world\');'
    );
    fs.writeFileSync(
      path.join(ROOT, 'code.js'),
      'console.log(\'hello world\');'
    );
  });

  afterAll(() => {
    mockFs.restore();
  });

  it('Copies a file', async () => {
    const actions = [{
      action: 'copy',
      paths: ['copy.js', 'new.js'],
    }];

    await handleActions(actions, undefined);

    expect(fs.existsSync(path.join(ROOT, 'copy.js'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'new.js'))).toBe(true);
  });

  it('Copies a directory with files', async () => {
    const actions = [{
      action: 'copy',
      paths: ['oldDir', 'newDir'],
    }];

    await handleActions(actions, undefined);
    expect(fs.existsSync(path.join(ROOT, 'oldDir/copy.js'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'oldDir/subfolder/copy.js'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'newDir/copy.js'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'newDir/subfolder/copy.js'))).toBe(true);
  });

  it('Copies an empty directory', async () => {
    const actions = [{
      action: 'copy',
      paths: [['oldEmptyDir', 'newEmptyDir']],
    }];

    await handleActions(actions, undefined);

    expect(fs.existsSync(path.join(ROOT, 'oldEmptyDir'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'newEmptyDir'))).toBe(true);
  });

  it('Uses template context in the destination string', async () => {
    const actions = [{
      action: 'prompt',
      questions: [{
        type: 'text',
        name: 'path',
        message: 'Wut?',
      }],
      inject: ['templated'],
    }, {
      action: 'copy',
      paths: ['code.js', '{{ path }}/path.js'],
    }];

    await handleActions(actions, undefined);

    expect(fs.existsSync(path.join(ROOT, 'code.js'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'templated/path.js'))).toBe(true);
  });

  it('Uses defualt context in the destination string', async () => {
    const actions = [{
      action: 'copy',
      paths: ['code.js', '{{ year }}/{{ month }}/{{ day }}/path.js'],
    }];

    await handleActions(actions, undefined);

    const date = new Date();

    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    expect(fs.existsSync(path.join(ROOT, 'code.js'))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, `${year}/${month}/${day}/path.js`))).toBe(true);
  });
});
