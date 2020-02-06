const expect = require('expect.js');
const { createFsFromVolume, Volume } = require('memfs');
const path = require('path');
const { token } = require('../dist');
const os = require('os');

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

describe('Test command: token', function() {
  this.timeout(10000);

  const fs = createFsFromVolume(new Volume());

  before(function() {
    fs.mkdirSync(os.homedir(), { recursive: true });

    const userConfig = {
      bluprints: {},
    };

    fs.writeFileSync(userConfigPath, JSON.stringify(userConfig));
  });

  it('Adds a token to user config', async function() {
    await token(null, ['ABCD1234'], fs);

    const { token: accessToken } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(accessToken).to.eql('ABCD1234');
  });

  it('Updates a token', async function() {
    await token(null, [true, 'ZYXW9876'], fs);

    const { token: accessToken } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(accessToken).to.eql('ZYXW9876');
  });
});
