const expect = require('expect.js');
const mock = require('mock-fs');
const path = require('path');
const { add } = require('../dist');
const os = require('os');
const fs = require('fs');

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

describe('Test command: add', function() {
  this.timeout(10000);

  before(function() {
    mock({
      [userConfigPath]: '{}',
    });
  });

  after(function() {
    mock.restore();
  });

  it('Adds a new bluprint', async function() {
    await add(null, ['reuters-graphics/test-bluprint']);
    await add(null, ['datadesk/baker-example-page-template']);

    const { bluprints } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(bluprints['test bluprint'].user).to.be('reuters-graphics');
    expect(bluprints['test bluprint'].project).to.be('test-bluprint');
  });
});
