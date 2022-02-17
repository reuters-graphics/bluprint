const expect = require('expect.js');
const mock = require('mock-fs');
const path = require('path');
const { remove } = require('../dist');
const os = require('os');
const fs = require('fs');

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

describe('Test command: remove', function() {
  this.timeout(10000);

  before(function() {
    const userConfig = {
      bluprints: {
        'test-deregister': {
          user: 'reuters-graphics',
          project: 'test-deregister',
          category: '',
        },
      },
    };

    mock({
      [userConfigPath]: JSON.stringify(userConfig),
    });
  });

  after(function() {
    mock.restore();
  });

  it('Removes a bluprint', async function() {
    await remove(null, ['test-deregister']);

    const { bluprints } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(bluprints).to.eql({});
  });
});
