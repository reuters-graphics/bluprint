import { Parse } from 'tar';
import fs from 'fs';
import merge from 'lodash/merge';
import minimatch from 'minimatch';
import path from 'path';

const deRoot = (filePath) => {
  const fileParts = filePath.split(path.sep);
  fileParts.shift();
  return fileParts.join(path.sep);
};

const resolvePath = (filePath) => path.resolve(process.cwd(), deRoot(filePath));

const mergeJsonFile = (filePath, fileBuffer) => {
  const fileString = fileBuffer.toString();
  try {
    const oldFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const newFile = JSON.parse(fileString);
    return JSON.stringify(merge(oldFile, newFile));
  } catch {
    return fileString;
  }
};

export default (resolve, reject, filterGlobs, mergeJson) => {
  const archive = {};

  return new Parse({
    filter: (rootedPath) => {
      const path = deRoot(rootedPath);
      if (path === '.bluprintrc') return false;
      if (!filterGlobs) return true;
      return filterGlobs
        .map(glob => minimatch(path, glob))
        .some(m => m === true);
    },
    onentry: (entry) => {
      const entryPath = resolvePath(entry.path);
      if (entry.type === 'Directory') {
        fs.mkdirSync(entryPath, { recursive: true });
        entry.resume();
      } else if (['File', 'SymbolicLink'].includes(entry.type)) {
        archive[entryPath] = [];
        entry.on('data', c => archive[entryPath].push(c));
      } else {
        throw new Error(`unable to handle entry of type ${entry.type}`);
      }
    },
  })
    .on('error', reject)
    .on('end', () => {
      for (const filePath of Object.keys(archive)) {
        let fileBuffer = Buffer.concat(archive[filePath]);

        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        if (fs.existsSync(filePath) && /\.json$/.test(filePath) && mergeJson) {
          fileBuffer = mergeJsonFile(filePath, fileBuffer);
        }

        fs.writeFileSync(filePath, fileBuffer);
      };
      resolve();
    });
};
