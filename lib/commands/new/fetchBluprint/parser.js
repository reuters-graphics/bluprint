const { Parse } = require('tar');
const path = require('path');

const deRoot = (filePath) => {
  const fileParts = filePath.split(path.sep);
  fileParts.shift();
  return fileParts.join(path.sep);
};

const resolvePath = (filePath) => path.resolve(process.cwd(), deRoot(filePath));

module.exports = (resolve, reject, fs) => {
  const archive = {};

  return new Parse({
    filter: path => deRoot(path) !== '.bluprintrc',
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
        fs.writeFileSync(filePath, fileBuffer);
      });
      resolve();
    });
};
