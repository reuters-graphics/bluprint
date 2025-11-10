import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mockFs from 'mock-fs';
import path from 'path';
import fs from 'fs';
import { handleActions } from '../../index.js';

const ROOT = process.cwd();

describe('Test action: regexreplace', () => {
  beforeAll(() => {
    mockFs({});

    fs.mkdirSync(process.cwd(), { recursive: true });

    fs.writeFileSync(
      path.join(ROOT, 'replaceString.json'),
      '{"datum": "data"}'
    );

    fs.writeFileSync(
      path.join(ROOT, 'replaceRegex.txt'),
      '214-555-5677\n913-555-5677\n816-222-2345'
    );

    fs.writeFileSync(
      path.join(ROOT, 'replaceWithContext.txt'),
      'Name: Jon McClure\nEmail: jon.r.mcclure@gmail.com\nAge: 35'
    );

    fs.writeFileSync(
      path.join(ROOT, 'replaceDefaultContext.json'),
      `{
        "year": "YYYY",
        "month": "MM",
        "day": "DD",
        "dirname": "DIRNAME"
      }`
    );
  });

  afterAll(() => {
    mockFs.restore();
  });

  it('Makes a replacement with a simple string', async () => {
    const actions = [{
      action: 'regexreplace',
      files: ['replaceString.json'],
      replace: ['data', 'data is plural'],
    }];

    await handleActions(actions, undefined);

    const file = fs.readFileSync(path.join(ROOT, 'replaceString.json'), 'utf-8');
    expect(JSON.parse(file).datum).toBe('data is plural');
  });

  it('Makes a global replacement with a regular expression', async () => {
    const actions = [{
      action: 'regexreplace',
      files: ['replaceRegex.txt'],
      replace: ['^([0-9]{3})-([0-9]{3})-([0-9]{4})$', '$1.$2.$3', 'gm'],
    }];

    await handleActions(actions, undefined);

    const file = fs.readFileSync(path.join(ROOT, 'replaceRegex.txt'), 'utf-8');
    expect(file.split('\n')[0]).toBe('214.555.5677');
    expect(file.split('\n')[2]).toBe('816.222.2345');
  });

  it('Makes a replacement with context from a prompt', async () => {
    const actions = [{
      action: 'prompt',
      questions: [{
        type: 'text',
        name: 'age',
        message: 'Wut age?',
      }, {
        type: 'text',
        name: 'name',
        message: 'Wut name?',
      }],
      inject: ['32', 'Lisa McDonald'],
    }, {
      action: 'regexreplace',
      files: ['replaceWithContext.txt'],
      replace: [
        ['^(Name:) .+$', '$1 {{ name }}'],
        ['^(Age:) \\d+$', '$1 {{ age }}'],
      ],
    }];

    await handleActions(actions, undefined);

    const file = fs.readFileSync(path.join(ROOT, 'replaceWithContext.txt'), 'utf-8');
    expect(file.split('\n')[0]).toBe('Name: Lisa McDonald');
    expect(file.split('\n')[1]).toBe('Email: jon.r.mcclure@gmail.com');
    expect(file.split('\n')[2]).toBe('Age: 32');
  });

  it('Replace with default context', async () => {
    const actions = [{
      action: 'regexreplace',
      files: ['replaceDefaultContext.json'],
      replace: [
        ['YYYY', '{{ year }}'],
        ['MM', '{{ month }}'],
        ['DD', '{{ day }}'],
        ['DIRNAME', '{{ dirname }}'],
      ],
    }];

    await handleActions(actions, undefined);

    const data = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'replaceDefaultContext.json'), 'utf-8')
    );

    const date = new Date();

    expect(data.year).toBe(String(date.getFullYear()));
    expect(data.month).toBe(String(date.getMonth() + 1).padStart(2, '0'));
    expect(data.day).toBe(String(date.getDate()).padStart(2, '0'));
    expect(data.dirname).toBe(process.cwd().split(path.sep).slice(-1)[0]);
  });
});
