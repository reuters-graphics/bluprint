const expect = require('expect.js');
const { createFsFromVolume, Volume } = require('memfs');
const path = require('path');
const { newBluprint } = require('../lib');

describe('Test command: new', function() {
  this.timeout(10000);

  const fs = createFsFromVolume(new Volume());

  before(function() {
    fs.mkdirSync(process.cwd(), { recursive: true });
  });

  it('Makes a config file', async function() {
    const filePath = path.join(process.cwd(), '.bluprintrc');

    await newBluprint(null, ['test'], fs);

    const bluprintConfig = fs.readFileSync(filePath, 'utf-8');

    const config = JSON.parse(bluprintConfig);

    expect(config).to.have.property('name');
    expect(config.name).to.be('test');
  });
});
