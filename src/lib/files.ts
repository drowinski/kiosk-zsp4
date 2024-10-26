import * as fs from 'node:fs';
import * as path from 'node:path';

export class FileManager {
  readonly rootDir: string;

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
    fileName = this.ensurePathSafe(fileName);
    console.log(fileName);
    const writeStream = fs.createWriteStream(fileName);
    return new Promise<void>((resolve, reject) => {
      stream
        .pipe(writeStream)
        .on('error', reject)
        .on('finish', resolve);
    });
  }

  private ensurePathSafe(unsafePath: string): string {
    const absolutePath = path.join(this.rootDir, unsafePath);
    if (!absolutePath.startsWith(this.rootDir)) {
      throw new Error('Unsafe path!');
    }
    return absolutePath;
  }
}
