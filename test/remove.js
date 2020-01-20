const expect = require('expect.js');
const { createFsFromVolume, Volume } = require('memfs');
const path = require('path');
const { remove } = require('../lib');
const os = require('os');

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

describe('Test command: remove', function() {
  this.timeout(10000);

  const fs = createFsFromVolume(new Volume());

  before(function() {
    fs.mkdirSync(os.homedir(), { recursive: true });

    const userConfig = {
      bluprints: {
        'test-deregister': {
          user: 'reuters-graphics',
          project: 'test-deregister',
          category: '',
        },
      },
    };

    fs.writeFileSync(userConfigPath, JSON.stringify(userConfig));
  });

  it('Removes a bluprint', async function() {
    await remove(null, ['test-deregister'], fs);

    const { bluprints } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(bluprints).to.eql({});
  });
});
