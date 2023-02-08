const expect = require('expect.js');
const mock = require('mock-fs');
const path = require('path');
const { start } = require('../dist');
const os = require('os');
const fs = require('fs');

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

const resolvePath = (filePath) => path.join(process.cwd(), filePath);

describe('Test command: start', function() {
  this.timeout(10000);

  beforeEach(function() {
    const userConfig = {
      bluprints: {
        'test bluprint': {
          user: 'reuters-graphics',
          project: 'test-bluprint',
          category: 'codes',
        },
        'test bluprint parts': {
          user: 'reuters-graphics',
          project: 'test-bluprint-parts',
          category: 'codes',
        },
      },
    };

    mock({
      [userConfigPath]: JSON.stringify(userConfig),
    });
  });

  afterEach(function() {
    mock.restore();
  });

  it('Creates a new project from bluprint', async function() {
    const inject = {
      method: ['category'],
      category: ['codes'],
      bluprint: ['test bluprint'],
    };

    await start(null, inject);

    expect(fs.existsSync(resolvePath('deep/file.html'))).to.be(true);
    expect(fs.existsSync(resolvePath('moved/docs.md'))).to.be(true);

    const templateFile = fs.readFileSync(resolvePath('template.js'), 'utf-8');
    expect(templateFile).to.be('console.log(\'Hi\');\n');
  });

  it('Can take a GitHub repo passed directly to command', async function() {
    await start('reuters-graphics/test-bluprint', []);

    expect(fs.existsSync(resolvePath('deep/file.html'))).to.be(true);
    expect(fs.existsSync(resolvePath('moved/docs.md'))).to.be(true);

    const templateFile = fs.readFileSync(resolvePath('template.js'), 'utf-8');
    expect(templateFile).to.be('console.log(\'Hi\');\n');
  });

  it('Can use bluprint parts', async function() {
    const inject = {
      partConfirm: [true],
      partChoice: ['bluprint part'],
    };

    await start('reuters-graphics/test-bluprint-parts', inject);

    expect(fs.existsSync(resolvePath('README.md'))).to.be(true);
    expect(fs.existsSync(resolvePath('IGNOREME.md'))).to.be(false);
    expect(fs.existsSync(resolvePath('used/index.js'))).to.be(true);
    expect(fs.existsSync(resolvePath('used/noaction.js'))).to.be(true);
    expect(fs.existsSync(resolvePath('used/skipped.jsx'))).to.be(false);
    expect(fs.existsSync(resolvePath('ingnore/index.js'))).to.be(false);

    const templatedFile = fs.readFileSync(resolvePath('used/index.js'), 'utf-8');
    expect(templatedFile).to.be('console.log(\'Using bluprint part!\');\n');

    const notTemplatedFile = fs.readFileSync(resolvePath('used/noaction.js'), 'utf-8');
    expect(notTemplatedFile).to.be('console.log(\'{{ bluprintPart }}\');\n');
  });

  it('Will merge JSON files', async function() {
    const inject = {
      partConfirm: [true],
      partChoice: ['bluprint part'],
    };

    const packagePath = resolvePath('package.json');

    const packageJson = { test: 'datum', nested: { another: 'thing' } };

    fs.writeFileSync(packagePath, JSON.stringify(packageJson));

    await start('reuters-graphics/test-bluprint-parts', inject);

    const mergedFile = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    expect(mergedFile.test).to.be('data');
    expect(mergedFile.nested.deep).to.be('test');
    expect(mergedFile.nested.another).to.be('thing');
  });

  it('Will NOT merge BAD JSON files', async function() {
    const inject = {
      partConfirm: [true],
      partChoice: ['bluprint part'],
    };

    const packagePath = resolvePath('package.json');

    fs.writeFileSync(packagePath, '{ BAD JSON {');

    await start('reuters-graphics/test-bluprint-parts', inject);

    const mergedFile = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    expect(mergedFile.test).to.be('data');
    expect(mergedFile.nested.deep).to.be('test');
    expect(mergedFile.nested.another).to.be(undefined);
  });
});
