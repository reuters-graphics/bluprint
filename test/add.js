const expect = require('expect.js');
const { createFsFromVolume, Volume } = require('memfs');
const path = require('path');
const { add } = require('../lib');
const os = require('os');

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

describe('Test command: add', function() {
  this.timeout(10000);

  const fs = createFsFromVolume(new Volume());

  fs.mkdirSync(path.dirname(userConfigPath), { recursive: true });

  it('Adds a new bluprint', async function() {
    await add(null, ['reuters-graphics/test-bluprint'], fs);

    const { bluprints } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(bluprints['test bluprint'].user).to.be('reuters-graphics');
    expect(bluprints['test bluprint'].project).to.be('test-bluprint');
  });
});
