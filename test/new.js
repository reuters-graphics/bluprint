const expect = require('expect.js');
const mock = require('mock-fs');
const fs = require('fs');
const path = require('path');
const { newBluprint } = require('../dist');

describe('Test command: new', function() {
  this.timeout(10000);

  before(function() {
    mock({});
  });

  after(function() {
    mock.restore();
  });

  it('Makes a config file', async function() {
    const filePath = path.join(process.cwd(), '.bluprintrc');

    await newBluprint(null, ['test']);

    const bluprintConfig = fs.readFileSync(filePath, 'utf-8');

    const config = JSON.parse(bluprintConfig);

    expect(config).to.have.property('name');
    expect(config.name).to.be('test');
  });
});
