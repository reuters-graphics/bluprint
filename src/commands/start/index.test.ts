import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import mockFs from 'mock-fs';
import path from 'path';
import { start } from '../../index.js';
import os from 'os';
import fs from 'fs';

const userConfigPath = path.join(os.homedir(), `.bluprintrc`);

const resolvePath = (filePath: string) => path.join(process.cwd(), filePath);

describe('Test command: start', () => {
  beforeEach(() => {
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

    mockFs({
      [userConfigPath]: JSON.stringify(userConfig),
    });
  });

  afterEach(() => {
    mockFs.restore();
  });

  it('Creates a new project from bluprint', async () => {
    const inject: any = {
      method: ['category'],
      category: ['codes'],
      bluprint: ['test bluprint'],
    };

    await start(null, inject);

    expect(fs.existsSync(resolvePath('deep/file.html'))).toBe(true);
    expect(fs.existsSync(resolvePath('moved/docs.md'))).toBe(true);

    const templateFile = fs.readFileSync(resolvePath('template.js'), 'utf-8');
    expect(templateFile).toBe('console.log(\'Hi\');\n');
  });

  it('Can take a GitHub repo passed directly to command', async () => {
    await start('reuters-graphics/test-bluprint', undefined);

    expect(fs.existsSync(resolvePath('deep/file.html'))).toBe(true);
    expect(fs.existsSync(resolvePath('moved/docs.md'))).toBe(true);

    const templateFile = fs.readFileSync(resolvePath('template.js'), 'utf-8');
    expect(templateFile).toBe('console.log(\'Hi\');\n');
  });

  it('Can use bluprint parts', async () => {
    const inject: any = {
      partConfirm: [true],
      partChoice: ['bluprint part'],
    };

    await start('reuters-graphics/test-bluprint-parts', inject);

    expect(fs.existsSync(resolvePath('README.md'))).toBe(true);
    expect(fs.existsSync(resolvePath('IGNOREME.md'))).toBe(false);
    expect(fs.existsSync(resolvePath('used/index.js'))).toBe(true);
    expect(fs.existsSync(resolvePath('used/noaction.js'))).toBe(true);
    expect(fs.existsSync(resolvePath('used/skipped.jsx'))).toBe(false);
    expect(fs.existsSync(resolvePath('ingnore/index.js'))).toBe(false);

    const templatedFile = fs.readFileSync(resolvePath('used/index.js'), 'utf-8');
    expect(templatedFile).toBe('console.log(\'Using bluprint part!\');\n');

    const notTemplatedFile = fs.readFileSync(resolvePath('used/noaction.js'), 'utf-8');
    expect(notTemplatedFile).toBe('console.log(\'{{ bluprintPart }}\');\n');
  });

  it('Will merge JSON files', async () => {
    const inject: any = {
      partConfirm: [true],
      partChoice: ['bluprint part'],
    };

    const packagePath = resolvePath('package.json');

    const packageJson = { test: 'datum', nested: { another: 'thing' } };

    fs.writeFileSync(packagePath, JSON.stringify(packageJson));

    await start('reuters-graphics/test-bluprint-parts', inject);

    const mergedFile = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    expect(mergedFile.test).toBe('data');
    expect(mergedFile.nested.deep).toBe('test');
    expect(mergedFile.nested.another).toBe('thing');
  });

  it('Will NOT merge BAD JSON files', async () => {
    const inject: any = {
      partConfirm: [true],
      partChoice: ['bluprint part'],
    };

    const packagePath = resolvePath('package.json');

    fs.writeFileSync(packagePath, '{ BAD JSON {');

    await start('reuters-graphics/test-bluprint-parts', inject);

    const mergedFile = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));

    expect(mergedFile.test).toBe('data');
    expect(mergedFile.nested.deep).toBe('test');
    expect(mergedFile.nested.another).toBe(undefined);
  });
});
