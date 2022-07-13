import fs from 'fs';
import path from 'path';
import tar from 'tar';
import os from 'os';

import handleActions from '../../actions';
import getLogger from '../../utils/getLogger';
import choosePart from '../start/choosePart';
import getParser from '../start/fetchBluprint/parser';
import minimatch from 'minimatch';

const logger = getLogger();

// best effort attempt at reproducing .gitignore behaviour
const createIgnoreFilter = config => {
  const globs = fs.readFileSync(config, 'utf-8').split('\n').filter(line => !line.trim().startsWith('#'));
  return file => !globs.some(glob => file.startsWith(glob) || minimatch(file, glob));
};

const getFiles = dir => {
  const basename = path.basename(dir);
  const files = fs.readdirSync(dir);
  const result = [];

  let filterFn = () => true;

  for (const file of files) {
    const fullPath = path.join(dir, file);

    if (file === '.gitignore') {
      filterFn = createIgnoreFilter(fullPath);
    }

    if (fs.statSync(fullPath).isDirectory()) {
      getFiles(fullPath).forEach(f => result.push(f));
    } else {
      result.push(file);
    }
  }

  return result.filter(e => filterFn(e) && !e.match(/^\.git(\/|$)/)).map(e => [basename, path.sep, e].join(''));
};

const buildTarball = async(directory) => {
  const tarball = path.join(os.tmpdir(), 'tmp-bluprint.tar');
  const files = getFiles(directory);

  await tar.create({
    gzip: false,
    file: tarball,
    cwd: path.dirname(directory),
    strict: true,
  }, files);

  return tarball;
};

const fetchBluprint = async(tarballPath, filterGlobs, mergeJson) => {
  return new Promise((resolve, reject) => {
    const rs = fs.createReadStream(tarballPath);
    const parser = getParser(resolve, reject, filterGlobs, mergeJson);

    rs.pipe(parser)
      .on('error', (e) => {
        logger.error(`Tarball parsing error.`);
        reject(e);
      });
  });
};

const defaultInject = {
  method: null,
  category: null,
  bluprint: null,
  partConfirm: null,
  partChoice: null,
};

export default async(directory, inject = defaultInject) => {
  const bluprintrc = JSON.parse(fs.readFileSync(path.join(directory, '.bluprintrc')));

  const { parts, mergeJson } = bluprintrc;
  const { part, globs: filterGlobs } = await choosePart(parts, inject);

  const tarball = await buildTarball(directory);

  try {
    await fetchBluprint(tarball, filterGlobs, mergeJson);
    await handleActions(bluprintrc.actions, part);
  } finally {
    fs.rmSync(tarball);
  }
};
