import minimatch from 'minimatch';
import path from 'path';

const walk = (dir, fs) => {
  let files = fs.readdirSync(dir);
  files = files.map((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) return walk(filePath, fs);
    else if (stats.isFile()) return filePath;
  });

  return files.reduce((all, folderContents) => all.concat(folderContents), []);
};

const removeGlob = (globPath, fs) => {
  const files = walk(process.cwd(), fs);
  const removeFiles = files.filter(f => {
    const relativePath = path.relative(process.cwd(), f);
    return minimatch(relativePath, globPath);
  });
  removeFiles.forEach((file) => {
    fs.unlinkSync(file);
  });
};

export default (action, fs) => {
  const { paths } = action;

  paths.forEach(path => removeGlob(path, fs));
};
