import fs from 'fs';
import { minimatch } from 'minimatch';
import path from 'path';
import type { RemoveAction } from './schema.js';

const walk = (dir: string): string[] => {
  let files = fs.readdirSync(dir);
  const results = files.map((file) => {
    const filePath = path.join(dir, file);
    const stats = fs.statSync(filePath);
    if (stats.isDirectory()) return walk(filePath);
    else if (stats.isFile()) return filePath;
    return [];
  });

  return results.reduce<string[]>((all, folderContents) => {
    if (Array.isArray(folderContents)) {
      return all.concat(folderContents);
    }
    return all.concat([folderContents]);
  }, []);
};

const removeGlob = (globPath: string): void => {
  const files = walk(process.cwd());
  const removeFiles = files.filter(f => {
    const relativePath = path.relative(process.cwd(), f);
    return minimatch(relativePath, globPath);
  });
  removeFiles.forEach((file) => {
    fs.unlinkSync(file);
  });
};

export default (action: RemoveAction): void => {
  const { paths } = action;

  paths.forEach(pathGlob => removeGlob(pathGlob));
};
