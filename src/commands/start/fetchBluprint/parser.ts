import { Parse } from 'tar';
import { merge } from 'es-toolkit';
import fs from 'fs';
import { minimatch } from 'minimatch';
import path from 'path';

const deRoot = (filePath: string): string => {
  const fileParts = filePath.split(path.sep);
  fileParts.shift();
  return fileParts.join(path.sep);
};

const resolvePath = (filePath: string): string => path.resolve(process.cwd(), deRoot(filePath));

const mergeJsonFile = (filePath: string, fileBuffer: Buffer): string => {
  const fileString = fileBuffer.toString();
  try {
    const oldFile = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const newFile = JSON.parse(fileString);
    return JSON.stringify(merge(oldFile, newFile));
  } catch {
    return fileString;
  }
};

export default (
  resolve: () => void,
  reject: (error: Error) => void,
  filterGlobs: string[] | null,
  mergeJson: boolean | undefined
): Parse => {
  const archive: Record<string, Buffer[]> = {};

  const parser = new Parse({
    filter: (rootedPath: string) => {
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
        fs.mkdirSync(entryPath, { recursive: true});
        entry.resume();
      } else if (entry.type === 'File') {
        archive[entryPath] = [];
        entry.on('data', (c: Buffer) => archive[entryPath].push(c));
      }
    },
  });

  (parser as any).on('error', reject);
  parser.on('end', () => {
    for (const filePath of Object.keys(archive)) {
      let fileBuffer: Buffer | string = Buffer.concat(archive[filePath]);

      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      if (fs.existsSync(filePath) && /\.json$/.test(filePath) && mergeJson) {
        fileBuffer = mergeJsonFile(filePath, fileBuffer as Buffer);
      }

      fs.writeFileSync(filePath, fileBuffer);
    }
    resolve();
  });

  return parser;
};
