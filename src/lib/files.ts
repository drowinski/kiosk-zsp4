import * as fs from 'node:fs';
import * as path from 'node:path';
import * as nstream from 'node:stream';

export class FileManager {
  private readonly rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
    if (!path.isAbsolute(rootDir)) {
      throw new Error('Absolute path required!');
    }
    const rootDirStats = fs.statSync(rootDir);
    if (!rootDirStats.isDirectory()) {
      throw new Error("Root directory doesn't exist.");
    }
    console.log('Initialized a File Manager with root directory at:', this.rootDir);
  }

  async saveFileFromStream(stream: nstream.Readable, fileName: string): Promise<void> {
    const filePath = this._definePathInsideRootDir(fileName);
    const writeStream = fs.createWriteStream(filePath);
    return new Promise<void>((resolve, reject) => {
      stream.pipe(writeStream).on('error', reject).on('finish', resolve);
    });
  }

  _definePathInsideRootDir(...unsafePaths: string[]): string {
    const absolutePath = path.join(this.rootDir, ...unsafePaths);
    if (!absolutePath.startsWith(this.rootDir)) {
      throw new Error(`Unsafe path! "${unsafePaths}" resulted in "${absolutePath}"`);
    }
    return absolutePath;
  }
}
