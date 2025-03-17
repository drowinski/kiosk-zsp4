import { AssetRepository, assetRepository } from '@/features/assets/assets.repository';
import { ReadStream } from 'node:fs';
import { FileManager } from '@/lib/files';
import { env } from '@/lib/env';
import * as crypto from 'node:crypto';
import { AssetType, NewAsset, UpdatedAsset } from '@/features/assets/assets.validation';
import * as mime from 'mime-types';
import ffmpeg from 'fluent-ffmpeg';

export class AssetService {
  private readonly assetRepository: AssetRepository;
  private readonly fileManager: FileManager;
  private readonly mimeTypeToAssetTypeMap = new Map<string, AssetType>([
    ['image', 'image'],
    ['video', 'video'],
    ['audio', 'audio']
  ]);

  constructor(assetRepository: AssetRepository, fileManager: FileManager) {
    this.assetRepository = assetRepository;
    this.fileManager = fileManager;
  }

  async uploadAsset(stream: ReadStream, assetData: Omit<NewAsset, 'fileName' | 'assetType'>): Promise<void> {
    const mimeType = this.normalizeMimeType(assetData.mimeType);
    const assetType = this.getAssetTypeFromMimeType(mimeType);
    const fileName = this.generateFileName(mimeType);

    try {
      await this.fileManager.saveFileFromStream(stream, fileName);
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while saving asset file.');
    }

    try {
      await this.generateThumbnail(fileName, assetType);
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while generating asset thumbnail.');
    }

    try {
      await this.assetRepository.createAsset({
        fileName: fileName,
        mimeType: mimeType,
        assetType: assetType,
        description: assetData.description,
        date: assetData.date
      });
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while adding asset to repository.');
    }
  }

  async updateAsset(updatedAsset: UpdatedAsset): Promise<void> {
    if (updatedAsset.mimeType !== undefined) {
      updatedAsset.mimeType = this.normalizeMimeType(updatedAsset.mimeType);
      updatedAsset.assetType = this.getAssetTypeFromMimeType(updatedAsset.mimeType);
    }

    try {
      await this.assetRepository.updateAsset(updatedAsset);
    } catch (error) {
      console.error(error);
      throw new Error('An error occurred while updating asset data.');
    }
  }

  async generateThumbnail(fileName: string, assetType: AssetType): Promise<void> {
    const originalFilePath = this.fileManager._definePathInsideRootDir(fileName);
    const thumbnailFileName = fileName.split('.')[0] + '.jpeg';
    const thumbnailDirectory = 'thumbnails';

    await new Promise<void>((resolve, reject) => {
      const ffmpegCommand = ffmpeg(originalFilePath)
        .on('end', () => {
          resolve();
        })
        .on('error', (error) => {
          console.error(error);
          reject(error);
        });

      if (assetType === 'image') {
        const outputPath = this.fileManager._definePathInsideRootDir(thumbnailDirectory, thumbnailFileName);
        ffmpegCommand.outputFormat('mjpeg').videoFilter('scale=640:-2').save(outputPath);
      } else if (assetType === 'video') {
        ffmpegCommand.thumbnail({
          filename: thumbnailFileName,
          folder: this.fileManager._definePathInsideRootDir(thumbnailDirectory),
          timestamps: ['5%'],
          size: '640x?'
        });
      }
    });
  }

  private generateFileName(mimeType: string): string {
    return crypto.randomUUID() + '.' + mime.extension(mimeType);
  }

  private normalizeMimeType(mimeType: string): string {
    mimeType = mimeType.trim().toLowerCase();
    const extension = mime.extension(mimeType);
    if (!extension) {
      throw new Error('Unrecognized MIME type.');
    }
    return mimeType;
  }

  private getAssetTypeFromMimeType(mimeType: string): AssetType {
    const mediaType = mimeType.split('/').at(0);
    if (!mediaType) {
      throw new Error('Invalid MIME type string.');
    }
    const assetType = this.mimeTypeToAssetTypeMap.get(mediaType);
    if (!assetType) {
      throw new Error('Unsupported MIME type.');
    }
    return assetType;
  }
}

export const assetService: Readonly<AssetService> = Object.freeze(
  new AssetService(assetRepository, new FileManager(env.ASSET_ROOT_DIR))
);
