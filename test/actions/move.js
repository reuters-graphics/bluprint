const expect = require('expect.js');
const { createFsFromVolume, Volume } = require('memfs');
const path = require('path');
const { handleActions } = require('../../dist/index.js');

const ROOT = process.cwd();

describe('Test action: move', function() {
  this.timeout(10000);

  const fs = createFsFromVolume(new Volume());

  before(function() {
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

  it('Moves a file', async function() {
    const actions = [{
      action: 'move',
      paths: ['move.js', 'moved.js'],
    }];

    await handleActions(actions, fs);

    expect(fs.existsSync(path.join(ROOT, 'moved.js'))).to.be(true);
  });

  it('Moves a directory with files', async function() {
    const actions = [{
      action: 'move',
      paths: ['oldDir', 'newDir'],
    }];

    await handleActions(actions, fs);

    expect(fs.existsSync(path.join(ROOT, 'newDir/move.js'))).to.be(true);
  });

  it('Moves an empty directory', async function() {
    const actions = [{
      action: 'move',
      paths: ['oldEmptyDir', 'newEmptyDir'],
    }];

    await handleActions(actions, fs);

    expect(fs.existsSync(path.join(ROOT, 'newEmptyDir'))).to.be(true);
  });

  it('Uses template context in the destination string', async function() {
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

    await handleActions(actions, fs);

    expect(fs.existsSync(path.join(ROOT, 'templated/path.js'))).to.be(true);
  });
});
