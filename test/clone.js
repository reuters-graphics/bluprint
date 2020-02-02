const expect = require('expect.js');
const { createFsFromVolume, Volume } = require('memfs');
const path = require('path');
const { clone } = require('../dist');
const os = require('os');

const resolvePath = (filePath) => path.join(process.cwd(), filePath);

describe('Test command: clone', function() {
  this.timeout(10000);

  let fs;

  beforeEach(function() {
    fs = createFsFromVolume(new Volume());

    fs.mkdirSync(os.homedir(), { recursive: true });
  });

  it('Clones a repo', async function() {
    await clone('reuters-graphics/test-bluprint', fs);

    expect(fs.existsSync(resolvePath('.bluprintrc'))).to.be(true);
    expect(fs.existsSync(resolvePath('moveme/docs.md'))).to.be(true);
  });
});
