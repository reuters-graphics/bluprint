const expect = require('expect.js');
const path = require('path');
const { token } = require('../dist');
const os = require('os');
const mock = require('mock-fs');
const fs = require('fs');

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

describe('Test command: token', function() {
  this.timeout(10000);

  before(function() {
    const userConfig = {
      bluprints: {},
    };

    mock({
      [userConfigPath]: JSON.stringify(userConfig),
    });
  });

  after(function() {
    mock.restore();
  });

  it('Adds a token to user config', async function() {
    await token(null, ['ABCD1234']);

    const { token: accessToken } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(accessToken).to.eql('ABCD1234');
  });

  it('Updates a token', async function() {
    await token(null, [true, 'ZYXW9876']);

    const { token: accessToken } = JSON.parse(fs.readFileSync(userConfigPath, 'utf-8'));

    expect(accessToken).to.eql('ZYXW9876');
  });
});
