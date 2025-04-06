import { FileManager } from '@/lib/files';
import { spawn } from 'cross-spawn';
import * as path from 'node:path';
import ffmpeg from 'fluent-ffmpeg';

export class ThumbnailGenerator {
  private readonly fileManager: FileManager;
  private readonly thumbnailDirectory: string;
  private readonly maxSize: number;

  constructor(fileManager: FileManager, thumbnailDirectory: string, maxSize: number) {
    this.fileManager = fileManager;
    this.thumbnailDirectory = thumbnailDirectory;
    this.maxSize = maxSize;
  }

  async generateFromImage(fileName: string): Promise<void> {
    return this.generateFromImageOrPDF(fileName);
  }

  async generateFromVideo(fileName: string): Promise<void> {
    const inputPath = this.fileManager._definePathInsideRootDir(fileName);

    return new Promise<void>((resolve, reject) => {
      const ffmpegCommand = ffmpeg(inputPath)
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });

      ffmpegCommand.thumbnail({
        filename: this.getThumbnailFileName(fileName),
        folder: this.fileManager._definePathInsideRootDir(this.thumbnailDirectory),
        timestamps: ['5%'],
        size: `${this.maxSize}x?`
      });
    });
  }

  async generateFromPDF(fileName: string): Promise<void> {
    return this.generateFromImageOrPDF(fileName);
  }

  private generateFromImageOrPDF(fileName: string): Promise<void> {
    const isPDF = path.parse(fileName).ext === '.pdf';
    const inputOptions = isPDF ? '[page=0,dpi=300]' : '';
    const inputPath = this.fileManager._definePathInsideRootDir(fileName);
    const outputPath = this.fileManager._definePathInsideRootDir(
      this.thumbnailDirectory,
      this.getThumbnailFileName(fileName)
    );

    return new Promise((resolve, reject) => {
      const scale = spawn('vipsthumbnail', [
        inputPath + inputOptions,
        '--size',
        this.maxSize.toString(),
        '--smartcrop',
        isPDF ? 'low' : 'attention',
        '--output',
        outputPath + '[Q=90]'
      ]);
      scale.stdout.on('data', (data) => {
        console.log(data);
      });
      scale.stderr.on('data', (data) => {
        console.error(`Error while creating thumbnail! ${data}`);
      });
      scale.on('close', (code) => {
        if (code !== 0) {
          console.error(code);
          reject();
        }
        resolve();
      });
    });
  }

  private getThumbnailFileName(fileName: string): string {
    const fileNameWithoutExtension = path.parse(fileName).name;
    return fileNameWithoutExtension + '.jpeg';
  }
}
