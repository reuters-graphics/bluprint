import { Parse } from 'tar';
import fs from 'fs';
import path from 'path';

const deRoot = (filePath: string): string => {
  const fileParts = filePath.split(path.sep);
  fileParts.shift();
  return fileParts.join(path.sep);
};

const resolvePath = (filePath: string): string => path.resolve(process.cwd(), deRoot(filePath));

export default (resolve: () => void, reject: (error: Error) => void): Parse => {
  const archive: Record<string, Buffer[]> = {};

  const parser = new Parse({
    onentry: (entry) => {
      const entryPath = resolvePath(entry.path);
      if (entry.type === 'Directory') {
        fs.mkdirSync(entryPath, { recursive: true });
        entry.resume();
      } else if (entry.type === 'File') {
        archive[entryPath] = [];
        entry.on('data', (c: Buffer) => archive[entryPath].push(c));
      }
    },
  });

  (parser as any).on('error', reject);
  parser.on('end', () => {
    Object.keys(archive).forEach((filePath) => {
      const fileBuffer = Buffer.concat(archive[filePath]);
      fs.writeFileSync(filePath, fileBuffer);
    });
    resolve();
  });

  return parser;
};
