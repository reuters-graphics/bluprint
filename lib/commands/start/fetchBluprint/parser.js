import { Parse } from 'tar';
import minimatch from 'minimatch';
import path from 'path';

const deRoot = (filePath) => {
  const fileParts = filePath.split(path.sep);
  fileParts.shift();
  return fileParts.join(path.sep);
};

const resolvePath = (filePath) => path.resolve(process.cwd(), deRoot(filePath));

export default (resolve, reject, filterGlobs, fs) => {
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
      } else if (entry.type === 'File') {
        archive[entryPath] = [];
        entry.on('data', c => archive[entryPath].push(c));
      }
    },
  })
    .on('error', reject)
    .on('end', () => {
      Object.keys(archive).forEach((filePath) => {
        const fileBuffer = Buffer.concat(archive[filePath]);
        const dir = path.dirname(filePath);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, fileBuffer);
      });
      resolve();
    });
};
