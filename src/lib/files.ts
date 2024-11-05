import * as fs from 'node:fs';
import * as path from 'node:path';

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

  async saveFileFromStream(stream: fs.ReadStream, fileName: string): Promise<void> {
    const filePath = this._definePathInsideRootDir(fileName);
    const writeStream = fs.createWriteStream(filePath);
    return new Promise<void>((resolve, reject) => {
      stream
        .pipe(writeStream)
        .on('error', reject)
        .on('finish', resolve);
    });
  }

  _definePathInsideRootDir(unsafePath: string): string {
    const absolutePath = path.join(this.rootDir, unsafePath);
    if (!absolutePath.startsWith(this.rootDir)) {
      throw new Error(`Unsafe path! "${unsafePath}" resulted in "${absolutePath}"`);
    }
    return absolutePath;
  }
}
