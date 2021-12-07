import fs from 'fs';

const option: {
  encoding: BufferEncoding;
  flag?: string | undefined;
} = { encoding: 'utf-8' };

export function isFile(path: string) {
  let isFile;
  try {
    const stat = fs.statSync(path);
    isFile = stat.isFile();
  } catch (err) {
    isFile = false;
  }
  return isFile;
}

export function isReadable(path: string) {
  let readable;
  try {
    fs.accessSync(path, fs.constants.R_OK);
    readable = true;
  } catch (e) {
    readable = false;
  }
  return readable;
}

export function readFile(path: string): string {
  const content = fs.readFileSync(path, option);
  return content;
}

export function readJsonFile<T>(path: string): T {
  const content = readFile(path);
  return JSON.parse(content) as T;
}

export function writeFile(path: string, content: string) {
  fs.writeFileSync(path, content, option);
}
