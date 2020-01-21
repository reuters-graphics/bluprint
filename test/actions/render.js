const expect = require('expect.js');
const { fs } = require('memfs');
const path = require('path');
const handleActions = require('../../lib/actions');

const ROOT = process.cwd();

describe('Test action: render', function() {
  this.timeout(10000);

  before(function() {
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

    await handleActions(actions, fs);

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

    await handleActions(actions, fs);

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

    await handleActions(actions, fs);

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

    await handleActions(actions, fs);

    const mustache = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderMustacheUtils.json'), 'utf-8')
    );
    const ejs = JSON.parse(
      fs.readFileSync(path.join(ROOT, 'renderEjsUtils.json'), 'utf-8')
    );

    expect(mustache.data).to.be('hi-there');
    expect(ejs.data).to.be('hi-there');
  });
});
