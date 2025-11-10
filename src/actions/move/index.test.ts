import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mockFs from 'mock-fs';
import fs from 'fs';
import path from 'path';
import { handleActions } from '../../index.js';

const ROOT = process.cwd();

describe('Test action: move', () => {
  beforeAll(() => {
    mockFs({});

    fs.mkdirSync(path.join(process.cwd(), 'oldDir'), { recursive: true });

    fs.mkdirSync(path.join(process.cwd(), 'oldEmptyDir'), { recursive: true });

    fs.writeFileSync(
      path.join(ROOT, 'move.js'),
      'console.log(\'hello world\');'
    );
    fs.writeFileSync(
      path.join(ROOT, 'oldDir/move.js'),
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

  it('Moves a file', async () => {
    const actions = [{
      action: 'move',
      paths: ['move.js', 'moved.js'],
    }];

    await handleActions(actions, undefined);

    expect(fs.existsSync(path.join(ROOT, 'moved.js'))).toBe(true);
  });

  it('Moves a directory with files', async () => {
    const actions = [{
      action: 'move',
      paths: ['oldDir', 'newDir'],
    }];

    await handleActions(actions, undefined);

    expect(fs.existsSync(path.join(ROOT, 'newDir/move.js'))).toBe(true);
  });

  it('Moves an empty directory', async () => {
    const actions = [{
      action: 'move',
      paths: ['oldEmptyDir', 'newEmptyDir'],
    }];

    await handleActions(actions, undefined);

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
      action: 'move',
      paths: ['code.js', '{{ path }}/path.js'],
    }];

    await handleActions(actions, undefined);

    expect(fs.existsSync(path.join(ROOT, 'templated/path.js'))).toBe(true);
  });

  it('Uses defualt context in the destination string', async () => {
    const actions = [{
      action: 'move',
      paths: ['templated/path.js', '{{ year }}/{{ month }}/{{ day }}/path.js'],
    }];

    await handleActions(actions, undefined);

    const date = new Date();

    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    expect(fs.existsSync(path.join(ROOT, `${year}/${month}/${day}/path.js`))).toBe(true);
  });
});
