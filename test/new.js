const expect = require('expect.js');
const { createFsFromVolume, Volume } = require('memfs');
const path = require('path');
const { newProject } = require('../lib');
const os = require('os');

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

const resolvePath = (filePath) => path.join(process.cwd(), filePath);

describe('Test command: new', function() {
  this.timeout(10000);

  const fs = createFsFromVolume(new Volume());

  before(function() {
    fs.mkdirSync(os.homedir(), { recursive: true });

    const userConfig = {
      bluprints: {
        'test bluprint': {
          user: 'reuters-graphics',
          project: 'test-bluprint',
          category: 'codes',
        },
      },
    };

    fs.writeFileSync(userConfigPath, JSON.stringify(userConfig));
  });

  it('Creates a new project from bluprint', async function() {
    const inject = {
      method: ['category'],
      category: ['codes'],
      bluprint: ['test bluprint'],
    };

    await newProject(null, inject, fs);

    expect(fs.existsSync(resolvePath('deep/file.html'))).to.be(true);
    expect(fs.existsSync(resolvePath('moved/docs.md'))).to.be(true);

    const templateFile = fs.readFileSync(resolvePath('template.js'), 'utf-8');
    expect(templateFile).to.be('console.log(\'Hi\');\n');
  });
});
