import { FileManager } from '@/lib/.server/files';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as fs from 'node:fs';
import { Readable, Writable } from 'node:stream';

vi.mock('node:fs', () => {
  return {
    statSync: vi.fn(() => ({ isDirectory: () => true })),
    createReadStream: vi.fn((...args: never[]) => {
      const stream = new Readable(...args);
      stream.push(null);
      return stream;
    }),
    createWriteStream: vi.fn((...args: never[]) => new Writable(...args))
  };
});

describe('files', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe(FileManager.name, () => {
    describe('root directory', () => {
      it('should not be a path to a non-directory', async () => {
        vi.mocked(fs).statSync.mockReturnValue({ isDirectory: () => false } as fs.Stats);
        expect(() => new FileManager('/home/test/notadir.txt')).toThrowError();
      });

      it('should not be a non-absolute path', () => {
        expect(() => new FileManager('parent/dir')).toThrowError();
      });
    });

    describe(FileManager.prototype._definePathInsideRootDir.name, () => {
      it('should ensure path stays inside of root directory', async () => {
        const rootDir = '/home/test/rootDir';
        const fm = new FileManager(rootDir);

        const correctPaths = ['/correctPath1', 'correctPath2', 'parent/correctPath3'];

        for (const correctPath of correctPaths) {
          let safePath: string;
          expect(() => (safePath = fm._definePathInsideRootDir(correctPath))).not.toThrowError();
          expect(safePath!).toBeTypeOf('string');
          expect(safePath!.startsWith(rootDir)).toStrictEqual(true);
          expect(safePath!.includes('.')).toStrictEqual(false);
        }

        const incorrectPaths = ['../incorrectPath1', '../../../../../incorrectPath2', '..'];

        for (const incorrectPath of incorrectPaths) {
          expect(() => fm._definePathInsideRootDir(incorrectPath)).toThrowError();
        }
      });
    });

    describe(FileManager.prototype.saveFileFromStream.name, () => {
      it('should use _definePathInsideRootDir to ensure path is safe', async () => {
        const fm = new FileManager('/');
        const _definePathInsideRootDir = vi.spyOn(fm, '_definePathInsideRootDir');

        const fileName = 'file.jpg';
        await fm.saveFileFromStream(fs.createReadStream('abc'), fileName);

        expect(_definePathInsideRootDir).toHaveBeenCalledWith(fileName);
      });
    });
  });
});
