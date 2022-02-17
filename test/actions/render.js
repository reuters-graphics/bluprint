const expect = require('expect.js');
const mock = require('mock-fs');
const fs = require('fs');
const path = require('path');
const { handleActions } = require('../../dist/index.js');

const ROOT = process.cwd();

describe('Test action: render', function() {
  this.timeout(10000);

  before(function() {
    mock({});

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

  after(function() {
    mock.restore();
  });

  it('Renders a mustache template with context', async function() {
    const actions = [{
      action: 'render',
      engine: 'mustache',
      context: { datum: 'hi' },
      files: [
        'renderMustache.json',
      ],
    }];

    await handleActions(actions, null);

    const mustache = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderMustache.json'), 'utf-8')
    );

    expect(mustache.data).to.be('hi');
  });

  it('Renders an ejs template with context', async function() {
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

    await handleActions(actions, null);

    const ejs = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderEjs.json'), 'utf-8')
    );

    expect(ejs.data).to.be('hello');
  });

  it('Renders with prompt action answers', async function() {
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

    await handleActions(actions, null);

    const ejs = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderAfterPrompt.json'), 'utf-8')
    );

    expect(ejs.data).to.be('nuthin');
  });

  it('Renders a mustache template using string utils', async function() {
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

    await handleActions(actions, null);

    const mustache = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderMustacheUtils.json'), 'utf-8')
    );
    const ejs = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderEjsUtils.json'), 'utf-8')
    );

    expect(mustache.data).to.be('hi-there');
    expect(ejs.data).to.be('hi-there');
  });

  it('Renders with default context', async function() {
    const actions = [{
      action: 'render',
      engine: 'mustache',
      files: [
        'renderDefaultContext.json',
      ],
    }];

    await handleActions(actions, null);

    const data = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderDefaultContext.json'), 'utf-8')
    );

    const date = new Date();

    expect(data.year).to.be(String(date.getFullYear()));
    expect(data.month).to.be(String(date.getMonth() + 1).padStart(2, '0'));
    expect(data.day).to.be(String(date.getDate()).padStart(2, '0'));
    expect(data.dirname).to.be(process.cwd().split(path.sep).slice(-1)[0]);
  });
});
