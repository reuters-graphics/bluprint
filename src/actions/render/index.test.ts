import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import mockFs from 'mock-fs';
import fs from 'fs';
import path from 'path';
import { handleActions } from '../../index.js';

const ROOT = process.cwd();

describe('Test action: render', () => {
  beforeAll(() => {
    mockFs({});

    fs.mkdirSync(process.cwd(), { recursive: true });

    fs.writeFileSync(
      path.join(ROOT, 'renderMustache.json'),
      '{ "data": "{{ datum }}" }'
    );
    fs.writeFileSync(
      path.join(ROOT, 'renderEjs.json'),
      '{ "data": "<%= datum %>" }'
    );
    fs.writeFileSync(
      path.join(ROOT, 'renderAfterPrompt.json'),
      '{ "data": "<%= datum %>" }'
    );
    fs.writeFileSync(
      path.join(ROOT, 'renderMustacheUtils.json'),
      '{ "data": "{{#slugify}}{{ datum }}{{/slugify}}" }'
    );
    fs.writeFileSync(
      path.join(ROOT, 'renderEjsUtils.json'),
      '{ "data": "<%= slugify(datum) %>" }'
    );
    fs.writeFileSync(
      path.join(ROOT, 'renderDefaultContext.json'),
      `{
        "year": "{{ year }}",
        "month": "{{ month }}",
        "day": "{{ day }}",
        "dirname": "{{ dirname }}"
      }`
    );
  });

  afterAll(() => {
    mockFs.restore();
  });

  it('Renders a mustache template with context', async () => {
    const actions = [{
      action: 'render',
      engine: 'mustache',
      context: { datum: 'hi' },
      files: [
        'renderMustache.json',
      ],
    }];

    await handleActions(actions, undefined);

    const mustache = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderMustache.json'), 'utf-8')
    );

    expect(mustache.data).toBe('hi');
  });

  it('Renders an ejs template with context', async () => {
    const actions = [{
      action: 'render',
      engine: 'ejs',
      questions: [{
        type: 'text',
        name: 'datum',
        message: 'Wut?',
      }],
      inject: ['hello'],
      files: [
        'renderEjs.json',
      ],
    }];

    await handleActions(actions, undefined);

    const ejs = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderEjs.json'), 'utf-8')
    );

    expect(ejs.data).toBe('hello');
  });

  it('Renders with prompt action answers', async () => {
    const actions = [{
      action: 'prompt',
      questions: [{
        type: 'text',
        name: 'datum',
        message: 'What\'s the rumpus?',
      }],
      inject: ['nuthin'],
    }, {
      action: 'render',
      engine: 'ejs',
      files: [
        'renderAfterPrompt.json',
      ],
    }];

    await handleActions(actions, undefined);

    const ejs = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderAfterPrompt.json'), 'utf-8')
    );

    expect(ejs.data).toBe('nuthin');
  });

  it('Renders a mustache template using string utils', async () => {
    const actions = [{
      action: 'render',
      engine: 'mustache',
      context: { datum: 'hi there' },
      files: [
        'renderMustacheUtils.json',
      ],
    }, {
      action: 'render',
      engine: 'ejs',
      context: { datum: 'hi there' },
      files: [
        'renderEjsUtils.json',
      ],
    }];

    await handleActions(actions, undefined);

    const mustache = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderMustacheUtils.json'), 'utf-8')
    );
    const ejs = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderEjsUtils.json'), 'utf-8')
    );

    expect(mustache.data).toBe('hi-there');
    expect(ejs.data).toBe('hi-there');
  });

  it('Renders with default context', async () => {
    const actions = [{
      action: 'render',
      engine: 'mustache',
      files: [
        'renderDefaultContext.json',
      ],
    }];

    await handleActions(actions, undefined);

    const data = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderDefaultContext.json'), 'utf-8')
    );

    const date = new Date();

    expect(data.year).toBe(String(date.getFullYear()));
    expect(data.month).toBe(String(date.getMonth() + 1).padStart(2, '0'));
    expect(data.day).toBe(String(date.getDate()).padStart(2, '0'));
    expect(data.dirname).toBe(process.cwd().split(path.sep).slice(-1)[0]);
  });
});
