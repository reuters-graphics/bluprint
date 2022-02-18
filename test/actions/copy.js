const expect = require('expect.js');
const mock = require('mock-fs');
const fs = require('fs');
const path = require('path');
const { handleActions } = require('../../dist/index.js');

const ROOT = process.cwd();

describe('Test action: copy', function() {
  this.timeout(10000);

  before(function() {
    mock({});

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

  after(function() {
    mock.restore();
  });

  it('Copies a file', async function() {
    const actions = [{
      action: 'copy',
      paths: ['copy.js', 'new.js'],
    }];

    await handleActions(actions, null);

    expect(fs.existsSync(path.join(ROOT, 'copy.js'))).to.be(true);
    expect(fs.existsSync(path.join(ROOT, 'new.js'))).to.be(true);
  });

  it('Copies a directory with files', async function() {
    const actions = [{
      action: 'copy',
      paths: ['oldDir', 'newDir'],
    }];

    await handleActions(actions, null);
    expect(fs.existsSync(path.join(ROOT, 'oldDir/copy.js'))).to.be(true);
    expect(fs.existsSync(path.join(ROOT, 'oldDir/subfolder/copy.js'))).to.be(true);
    expect(fs.existsSync(path.join(ROOT, 'newDir/copy.js'))).to.be(true);
    expect(fs.existsSync(path.join(ROOT, 'newDir/subfolder/copy.js'))).to.be(true);
  });

  it('Copies an empty directory', async function() {
    const actions = [{
      action: 'copy',
      paths: [['oldEmptyDir', 'newEmptyDir']],
    }];

    await handleActions(actions, null);

    expect(fs.existsSync(path.join(ROOT, 'oldEmptyDir'))).to.be(true);
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
      action: 'copy',
      paths: ['code.js', '{{ path }}/path.js'],
    }];

    await handleActions(actions, null);

    expect(fs.existsSync(path.join(ROOT, 'code.js'))).to.be(true);
    expect(fs.existsSync(path.join(ROOT, 'templated/path.js'))).to.be(true);
  });

  it('Uses defualt context in the destination string', async function() {
    const actions = [{
      action: 'copy',
      paths: ['code.js', '{{ year }}/{{ month }}/{{ day }}/path.js'],
    }];

    await handleActions(actions, null);

    const date = new Date();

    const year = String(date.getFullYear());
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    expect(fs.existsSync(path.join(ROOT, 'code.js'))).to.be(true);
    expect(fs.existsSync(path.join(ROOT, `${year}/${month}/${day}/path.js`))).to.be(true);
  });
});
