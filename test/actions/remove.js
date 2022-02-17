const expect = require('expect.js');
const mock = require('mock-fs');
const fs = require('fs');
const path = require('path');
const { handleActions } = require('../../dist/index.js');

const ROOT = process.cwd();

describe('Test action: remove', function() {
  this.timeout(10000);

  before(function() {
    mock({});

    fs.mkdirSync(path.join(process.cwd(), 'remove/'), { recursive: true });

    fs.writeFileSync(
      path.join(ROOT, 'remove/script.js'),
      ''
    );
    fs.writeFileSync(
      path.join(ROOT, 'remove/index.js'),
      ''
    );
  });

  after(function() {
    mock.restore();
  });

  it('Removes files', async function() {
    const actions = [{
      action: 'remove',
      paths: [
        'remove/*.js',
      ],
    }];

    await handleActions(actions, null);

    const path1 = path.join(ROOT, 'remove/script.js');
    const path2 = path.join(ROOT, 'remove/index.js');

    expect(fs.existsSync(path1)).to.be(false);
    expect(fs.existsSync(path2)).to.be(false);
  });
});
