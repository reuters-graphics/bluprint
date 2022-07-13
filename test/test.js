const expect = require('expect.js');
const path = require('path');
const { test } = require('../dist');
const os = require('os');
const fs = require('fs');

const resolvePath = (filePath) => path.join(process.cwd(), filePath);

const createTestBluprint = function() {
  const tempdir = fs.mkdtempSync(path.join(os.tmpdir(), 'test-bluprint'));

  fs.writeFileSync(path.join(tempdir, '.bluprintrc'), JSON.stringify({
    bluprint: '^0.0.1',
    name: 'My test bluprint',
    category: 'testing',
    actions: [
      {
        action: 'render',
        engine: 'mustache',
        context: { foo: 'bar' },
        files: [
          'test-command-1.txt',
          'subdir/test-command-2.txt',
        ],
      },
    ],
  }));

  fs.mkdirSync(path.join(tempdir, 'subdir'));
  fs.writeFileSync(path.join(tempdir, 'test-command-1.txt'), 'foo = {{ foo }}');
  fs.writeFileSync(path.join(tempdir, 'subdir', 'test-command-2.txt'), 'foo = {{ foo }}');
  fs.writeFileSync(path.join(tempdir, 'subdir', 'ignored.txt'), 'ignore me');
  fs.writeFileSync(path.join(tempdir, 'subdir', '.gitignore'), '# this should be ignored\nignored.*');

  return tempdir;
};

describe('Test command: test', function() {
  this.timeout(10000);

  let testBluprint;
  let cleanupFiles;

  beforeEach(async function() {
    testBluprint = createTestBluprint();

    cleanupFiles = [
      testBluprint,
      resolvePath('test-command-1.txt'),
      resolvePath('subdir/test-command-2.txt'),
      resolvePath('subdir/ignored.txt'),
      resolvePath('subdir/.gitignore'),
      resolvePath('subdir'),
    ];
  });

  afterEach(function() {
    cleanupFiles.forEach(f => fs.rmSync(f, { recursive: true, force: true }));
  });

  it('Creates a new project from a bluprint directory', async function() {
    await test(testBluprint);

    expect(fs.readFileSync('test-command-1.txt', 'utf8')).to.be('foo = bar');
    expect(fs.readFileSync('subdir/test-command-2.txt', 'utf8')).to.be('foo = bar');
  });

  it('Ignores files from .gitignore', async function() {
    await test(testBluprint);

    expect(fs.existsSync('ignored.txt')).to.be(false);
  });
});
