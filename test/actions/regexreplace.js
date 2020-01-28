const expect = require('expect.js');
const { createFsFromVolume, Volume } = require('memfs');
const path = require('path');
const { handleActions } = require('../../dist/index.js');

const ROOT = process.cwd();

describe('Test action: regexreplace', function() {
  this.timeout(10000);

  const fs = createFsFromVolume(new Volume());

  before(function() {
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
  });

  it('Makes a replacement with a simple string', async function() {
    const actions = [{
      action: 'regexreplace',
      files: ['replaceString.json'],
      replace: ['data', 'data is plural'],
    }];

    await handleActions(actions, fs);

    const file = fs.readFileSync(path.join(ROOT, 'replaceString.json'), 'utf-8');
    expect(JSON.parse(file).datum).to.be('data is plural');
  });

  it('Makes a global replacement with a regular expression', async function() {
    const actions = [{
      action: 'regexreplace',
      files: ['replaceRegex.txt'],
      replace: ['^([0-9]{3})-([0-9]{3})-([0-9]{4})$', '$1.$2.$3', 'gm'],
    }];

    await handleActions(actions, fs);

    const file = fs.readFileSync(path.join(ROOT, 'replaceRegex.txt'), 'utf-8');
    expect(file.split('\n')[0]).to.be('214.555.5677');
    expect(file.split('\n')[2]).to.be('816.222.2345');
  });

  it('Makes a replacement with context from a prompt', async function() {
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

    await handleActions(actions, fs);

    const file = fs.readFileSync(path.join(ROOT, 'replaceWithContext.txt'), 'utf-8');
    expect(file.split('\n')[0]).to.be('Name: Lisa McDonald');
    expect(file.split('\n')[1]).to.be('Email: jon.r.mcclure@gmail.com');
    expect(file.split('\n')[2]).to.be('Age: 32');
  });
});
