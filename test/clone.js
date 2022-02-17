const expect = require('expect.js');
const mock = require('mock-fs');
const path = require('path');
const { clone } = require('../dist');
const fs = require('fs');

const resolvePath = (filePath) => path.join(process.cwd(), filePath);

describe('Test command: clone', function() {
  this.timeout(10000);

  beforeEach(function() {
    mock({});
  });

  afterEach(function() {
    mock.restore();
  });

  it('Clones a repo', async function() {
    await clone('reuters-graphics/test-bluprint');

    expect(fs.existsSync(resolvePath('.bluprintrc'))).to.be(true);
    expect(fs.existsSync(resolvePath('moveme/docs.md'))).to.be(true);
  });
});
